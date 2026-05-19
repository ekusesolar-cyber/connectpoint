import prisma from '../config/database';
import { env } from '../config/env';

export class RadiusService {
  static async createUser(data: {
    hotspotId: string;
    username: string;
    password: string;
    timeLimitSeconds?: number | null;
    dataLimitBytes?: number | null;
    speedLimitKbps?: number | null;
  }) {
    const hotspot = await prisma.hotspot.findUnique({ where: { id: data.hotspotId } });
    if (!hotspot) throw new Error('NOT_FOUND');

    const radcheckEntries = [
      { username: data.username, attribute: 'Cleartext-Password', op: ':=', value: data.password },
    ];

    if (data.timeLimitSeconds) {
      radcheckEntries.push({
        username: data.username,
        attribute: 'Max-All-Session',
        op: ':=',
        value: String(data.timeLimitSeconds),
      });
    }

    if (data.dataLimitBytes) {
      radcheckEntries.push({
        username: data.username,
        attribute: 'Max-Octets',
        op: ':=',
        value: String(data.dataLimitBytes),
      });
    }

    if (data.speedLimitKbps) {
      const rateLimit = `${data.speedLimitKbps}k/${data.speedLimitKbps}k`;
      radcheckEntries.push({
        username: data.username,
        attribute: 'MikroTik-Rate-Limit',
        op: ':=',
        value: rateLimit,
      });
    }

    radcheckEntries.push({
      username: data.username,
      attribute: 'Acct-Interim-Interval',
      op: ':=',
      value: '300',
    });

    for (const entry of radcheckEntries) {
      await prisma.$executeRawUnsafe(
        `INSERT INTO radcheck (username, attribute, op, value) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING`,
        entry.username, entry.attribute, entry.op, entry.value
      );
    }

    const groupName = hotspot.nasIdentifier || `hotspot_${hotspot.id.substring(0, 8)}`;
    await prisma.$executeRawUnsafe(
      `INSERT INTO radusergroup (username, groupname, priority) VALUES ($1, $2, 1) ON CONFLICT DO NOTHING`,
      data.username, groupName
    );

    const nasIp = hotspot.routerIp || '0.0.0.0';

    await prisma.$executeRawUnsafe(
      `INSERT INTO nas (nasname, shortname, type, secret) VALUES ($1, $2, 'other', $3) ON CONFLICT (nasname) DO NOTHING`,
      nasIp, hotspot.name, env.RADIUS_SECRET
    );

    return { username: data.username, password: data.password };
  }

  static async disconnectUser(sessionId: string) {
    const session = await prisma.session.findUnique({ where: { id: sessionId }, include: { hotspot: true } });
    if (!session || !session.isActive) throw new Error('NOT_FOUND');

    const radClientPath = '/usr/bin/radclient';
    const nasIp = session.hotspot.routerIp || '127.0.0.1';
    const disconnectPacket = `User-Name=${session.username}`;

    try {
      const { execSync } = require('child_process');
      execSync(
        `echo "${disconnectPacket}" | ${radClientPath} -x ${nasIp}:8089 disconnect ${env.RADIUS_SECRET}`,
        { timeout: 5000, stdio: 'pipe' }
      );
    } catch {
      // RADIUS disconnect is best-effort; the MikroTik will timeout the session
    }

    await prisma.session.update({
      where: { id: sessionId },
      data: { isActive: false, isExpired: true, sessionEnd: new Date(), disconnectReason: 'admin_disconnect' },
    });

    return { disconnected: true };
  }

  static async expireSession(sessionId: string) {
    const session = await prisma.session.findUnique({ where: { id: sessionId } });
    if (!session) throw new Error('NOT_FOUND');

    return prisma.session.update({
      where: { id: sessionId },
      data: { isActive: false, isExpired: true, sessionEnd: new Date(), disconnectReason: 'expired' },
    });
  }

  static async syncAccounting(data: {
    username: string;
    sessionId: string;
    acctInputOctets?: number;
    acctOutputOctets?: number;
    acctSessionTime?: number;
    acctStatusType?: string;
  }) {
    const session = await prisma.session.findFirst({ where: { username: data.username } });
    if (!session) return;

    const updates: Record<string, unknown> = {};
    if (data.acctInputOctets !== undefined) updates.dataUsedUp = data.acctInputOctets;
    if (data.acctOutputOctets !== undefined) updates.dataUsedDown = data.acctOutputOctets;
    if (data.acctSessionTime !== undefined) updates.timeUsedSeconds = data.acctSessionTime;

    if (data.acctStatusType === 'Stop') {
      updates.isActive = false;
      updates.isExpired = true;
      updates.sessionEnd = new Date();
    }

    await prisma.session.update({ where: { id: session.id }, data: updates });

    if (session.timeTotalSeconds > 0 && data.acctSessionTime && data.acctSessionTime >= session.timeTotalSeconds) {
      await this.expireSession(session.id);
    }

    if (session.dataTotal > 0 && data.acctInputOctets) {
      const totalUsed = (data.acctInputOctets || 0) + (data.acctOutputOctets || 0);
      if (totalUsed >= session.dataTotal) {
        await this.expireSession(session.id);
      }
    }
  }

  static async getActiveSessions(hotspotId: string) {
    return prisma.session.findMany({
      where: { hotspotId, isActive: true, isExpired: false },
      include: { package: { select: { name: true, type: true } }, customer: true },
      orderBy: { sessionStart: 'desc' },
    });
  }

  static async checkAndExpireSessions() {
    const now = new Date();
    const activeSessions = await prisma.session.findMany({
      where: { isActive: true, isExpired: false },
    });

    for (const session of activeSessions) {
      let shouldExpire = false;

      if (session.timeTotalSeconds > 0 && session.sessionStart) {
        const elapsed = Math.floor((now.getTime() - session.sessionStart.getTime()) / 1000);
        if (elapsed >= session.timeTotalSeconds) shouldExpire = true;
      }

      if (session.dataTotal > 0 && (session.dataUsedUp + session.dataUsedDown) >= session.dataTotal) {
        shouldExpire = true;
      }

      if (shouldExpire) {
        await this.expireSession(session.id);
      }
    }
  }
}

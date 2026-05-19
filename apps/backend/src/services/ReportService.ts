import prisma from '../config/database';

export class ReportService {
  static async getOwnerDashboardStats(ownerId: string) {
    const [hotspots, activeSessions, transactions, customers] = await Promise.all([
      prisma.hotspot.count({ where: { ownerId } }),
      prisma.session.count({
        where: { hotspot: { ownerId }, isActive: true, isExpired: false },
      }),
      prisma.transaction.aggregate({
        where: { ownerId, paymentStatus: 'success' },
        _sum: { ownerEarnings: true, amount: true },
        _count: true,
      }),
      prisma.customer.count({
        where: { sessions: { some: { hotspot: { ownerId } } } },
      }),
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const [revenueToday, revenueThisMonth, sessionsToday] = await Promise.all([
      prisma.transaction.aggregate({
        where: { ownerId, paymentStatus: 'success', createdAt: { gte: today } },
        _sum: { ownerEarnings: true },
      }),
      prisma.transaction.aggregate({
        where: { ownerId, paymentStatus: 'success', createdAt: { gte: monthStart } },
        _sum: { ownerEarnings: true },
      }),
      prisma.session.count({
        where: { hotspot: { ownerId }, sessionStart: { gte: today } },
      }),
    ]);

    return {
      totalHotspots: hotspots,
      activeSessions,
      totalRevenue: transactions._sum.amount || 0,
      totalEarnings: transactions._sum.ownerEarnings || 0,
      totalTransactions: transactions._count,
      totalCustomers: customers,
      revenueToday: revenueToday._sum.ownerEarnings || 0,
      revenueThisMonth: revenueThisMonth._sum.ownerEarnings || 0,
      sessionsToday,
    };
  }

  static async getAdminDashboardStats() {
    const [owners, hotspots, activeSessions, transactions, customers, pendingKyc] = await Promise.all([
      prisma.user.count({ where: { role: 'hotspot_owner' } }),
      prisma.hotspot.count(),
      prisma.session.count({ where: { isActive: true, isExpired: false } }),
      prisma.transaction.aggregate({
        where: { paymentStatus: 'success' },
        _sum: { amount: true, platformFee: true, ownerEarnings: true },
        _count: true,
      }),
      prisma.customer.count(),
      prisma.kYCProfile.count({ where: { kycStatus: 'pending' } }),
    ]);

    return {
      totalOwners: owners,
      totalHotspots: hotspots,
      activeSessions,
      totalRevenue: transactions._sum.amount || 0,
      totalPlatformFees: transactions._sum.platformFee || 0,
      totalOwnerEarnings: transactions._sum.ownerEarnings || 0,
      totalTransactions: transactions._count,
      totalCustomers: customers,
      pendingKyc,
    };
  }

  static async getRevenueReport(ownerId: string, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const transactions = await prisma.transaction.findMany({
      where: {
        ownerId,
        paymentStatus: 'success',
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: 'asc' },
    });

    const dailyMap = new Map<string, { amount: number; transactions: number; platformFees: number; ownerEarnings: number }>();

    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().split('T')[0];
      dailyMap.set(key, { amount: 0, transactions: 0, platformFees: 0, ownerEarnings: 0 });
    }

    for (const tx of transactions) {
      const key = tx.createdAt.toISOString().split('T')[0];
      const existing = dailyMap.get(key);
      if (existing) {
        existing.amount += tx.amount;
        existing.transactions += 1;
        existing.platformFees += tx.platformFee;
        existing.ownerEarnings += tx.ownerEarnings;
      }
    }

    return Array.from(dailyMap.entries()).map(([date, data]) => ({
      date,
      ...data,
    }));
  }

  static async getUsageReport(ownerId: string, days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const sessions = await prisma.session.findMany({
      where: {
        hotspot: { ownerId },
        sessionStart: { gte: startDate },
      },
      include: { hotspot: { select: { name: true } } },
      orderBy: { sessionStart: 'desc' },
    });

    const totalDataUsed = sessions.reduce((sum, s) => sum + s.dataUsedUp + s.dataUsedDown, 0);
    const totalTimeUsed = sessions.reduce((sum, s) => sum + s.timeUsedSeconds, 0);

    const hotspotUsage = new Map<string, { sessions: number; data: number; time: number }>();
    for (const s of sessions) {
      const name = s.hotspot.name;
      const existing = hotspotUsage.get(name) || { sessions: 0, data: 0, time: 0 };
      existing.sessions += 1;
      existing.data += s.dataUsedUp + s.dataUsedDown;
      existing.time += s.timeUsedSeconds;
      hotspotUsage.set(name, existing);
    }

    return {
      totalSessions: sessions.length,
      totalDataUsed,
      totalTimeUsed,
      hotspotUsage: Array.from(hotspotUsage.entries()).map(([name, data]) => ({ hotspot: name, ...data })),
    };
  }

  static async getSystemAnalytics() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [ownerRegistrations, transactions, hotspotsPerOwner] = await Promise.all([
      prisma.user.groupBy({
        by: ['createdAt'],
        where: { role: 'hotspot_owner', createdAt: { gte: thirtyDaysAgo } },
        _count: true,
      }),
      prisma.transaction.groupBy({
        by: ['paymentStatus'],
        _count: true,
        _sum: { amount: true },
      }),
      prisma.hotspot.groupBy({
        by: ['ownerId'],
        _count: true,
      }),
    ]);

    const hotspotsDistribution = hotspotsPerOwner.reduce(
      (acc: Record<string, number>, h) => {
        const range = h._count <= 1 ? '1' : h._count <= 5 ? '2-5' : '6+';
        acc[range] = (acc[range] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      ownerRegistrations: ownerRegistrations.length,
      transactionsByStatus: transactions,
      hotspotsDistribution,
    };
  }
}

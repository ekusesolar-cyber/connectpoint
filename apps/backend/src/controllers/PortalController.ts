import { Request, Response } from 'express';
import prisma from '../config/database';
import { VoucherService } from '../services/VoucherService';
import { PaymentService } from '../services/PaymentService';
import { PackageService } from '../services/PackageService';
import { RadiusService } from '../services/RadiusService';
import { generateUsername, generatePassword, calculateExpiry } from '../utils/helpers';
import { env } from '../config/env';

export const getHotspotInfo = async (req: Request, res: Response) => {
  try {
    const hotspot = await prisma.hotspot.findUnique({
      where: { id: req.params.hotspotId },
      select: { id: true, name: true, address: true, city: true, country: true, qrCodeUrl: true },
    });
    if (!hotspot || !hotspot.id) {
      res.status(404).json({ success: false, error: 'Hotspot not found' });
      return;
    }
    res.json({ success: true, data: hotspot });
  } catch {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const getPackages = async (req: Request, res: Response) => {
  try {
    const result = await PackageService.getHotspotPackagesWithDetails(req.params.hotspotId);
    if (!result.hotspot) {
      res.status(404).json({ success: false, error: 'Hotspot not found' });
      return;
    }
    res.json({ success: true, data: { hotspot: result.hotspot, packages: result.packages } });
  } catch {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const voucherLogin = async (req: Request, res: Response) => {
  try {
    const { code, pin } = req.body;
    if (!code) {
      res.status(400).json({ success: false, error: 'Voucher code is required' });
      return;
    }

    const voucher = await VoucherService.validate(code, pin);
    if (voucher.hotspotId !== req.params.hotspotId) {
      res.status(400).json({ success: false, error: 'Invalid voucher for this hotspot' });
      return;
    }

    const pkg = voucher.packageId
      ? await prisma.package.findUnique({ where: { id: voucher.packageId } })
      : null;

    await VoucherService.markUsed(voucher.id);

    const username = generateUsername(req.params.hotspotId);
    const password = generatePassword();
    const timeTotal = pkg?.durationMinutes ? pkg.durationMinutes * 60 : null;
    const dataTotal = pkg?.dataLimitMb ? pkg.dataLimitMb * 1024 * 1024 : null;

    await RadiusService.createUser({
      hotspotId: req.params.hotspotId,
      username,
      password,
      timeLimitSeconds: timeTotal,
      dataLimitBytes: dataTotal,
      speedLimitKbps: pkg?.speedLimitKbps || null,
    });

    const session = await prisma.session.create({
      data: {
        hotspotId: req.params.hotspotId,
        packageId: pkg?.id || null,
        voucherId: voucher.id,
        username,
        password,
        macAddress: req.body.macAddress || null,
        sessionStart: new Date(),
        timeTotalSeconds: timeTotal || 0,
        dataTotal: dataTotal || 0,
        isActive: true,
      },
    });

    res.json({
      success: true,
      data: {
        username,
        password,
        sessionId: session.id,
        packageName: pkg?.name || 'Prepaid',
        expiresAt: timeTotal ? calculateExpiry(pkg!.durationMinutes!) : null,
        timeTotalSeconds: timeTotal,
        dataTotalBytes: dataTotal,
      },
    });
  } catch (err) {
    const message = (err as Error).message;
    if (message === 'INVALID_VOUCHER') {
      res.status(400).json({ success: false, error: 'Invalid or expired voucher' });
      return;
    }
    if (message === 'VOUCHER_USED') {
      res.status(400).json({ success: false, error: 'Voucher already used' });
      return;
    }
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const initiatePurchase = async (req: Request, res: Response) => {
  try {
    const { packageId, customerEmail, customerPhone, redirectUrl } = req.body;
    if (!packageId) {
      res.status(400).json({ success: false, error: 'Package ID is required' });
      return;
    }

    const result = await PaymentService.initialize({
      hotspotId: req.params.hotspotId,
      packageId,
      customerEmail,
      customerPhone,
      redirectUrl,
    });

    res.json({ success: true, data: result });
  } catch {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const getSessionStatus = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { package: { select: { name: true } } },
    });

    if (!session) {
      res.status(404).json({ success: false, error: 'Session not found' });
      return;
    }

    const now = new Date();
    let remainingTime = session.timeTotalSeconds - session.timeUsedSeconds;
    if (session.sessionStart && session.timeTotalSeconds > 0) {
      const elapsed = Math.floor((now.getTime() - session.sessionStart.getTime()) / 1000);
      remainingTime = Math.max(0, session.timeTotalSeconds - elapsed);
    }

    const dataUsed = session.dataUsedUp + session.dataUsedDown;
    const remainingData = Math.max(0, session.dataTotal - dataUsed);

    res.json({
      success: true,
      data: {
        isActive: session.isActive && !session.isExpired,
        isExpired: session.isExpired,
        timeUsed: session.timeUsedSeconds,
        timeTotal: session.timeTotalSeconds,
        remainingTime,
        dataUsed,
        dataTotal: session.dataTotal,
        remainingData,
        packageName: session.package?.name || 'Prepaid',
        sessionStart: session.sessionStart,
      },
    });
  } catch {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const submitTermsConsent = async (req: Request, res: Response) => {
  try {
    const { macAddress, accepted } = req.body;
    if (!accepted) {
      res.status(400).json({ success: false, error: 'You must accept the terms and conditions' });
      return;
    }

    res.json({ success: true, data: { accepted: true } });
  } catch {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const getAd = async (req: Request, res: Response) => {
  try {
    const ad = await prisma.advertisement.findFirst({
      where: { hotspotId: req.params.hotspotId, isActive: true },
      orderBy: { impressions: 'asc' },
    });

    if (ad) {
      await prisma.advertisement.update({
        where: { id: ad.id },
        data: { impressions: { increment: 1 } },
      });
    }

    res.json({ success: true, data: ad });
  } catch {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

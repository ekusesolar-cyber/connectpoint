import { Request, Response } from 'express';
import prisma from '../config/database';
import { KYCService } from '../services/KYCService';
import { VoucherService } from '../services/VoucherService';
import { RadiusService } from '../services/RadiusService';
import { ReportService } from '../services/ReportService';
import { PaymentService } from '../services/PaymentService';
import { PackageService } from '../services/PackageService';
import { ZodError } from 'zod';
import { hotspotSchema, packageSchema, voucherGenerateSchema, kycSchema, withdrawalSchema } from '../shared/validators';
import { generateVoucherCode, generatePin } from '../utils/helpers';

export const getDashboard = async (req: Request, res: Response) => {
  try {
    const stats = await ReportService.getOwnerDashboardStats(req.user!.userId);
    res.json({ success: true, data: stats });
  } catch {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { fullName, phone } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: { fullName, phone },
      select: { id: true, email: true, fullName: true, phone: true, role: true, isActive: true, createdAt: true },
    });
    res.json({ success: true, data: user });
  } catch {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// === KYC ===
export const submitKYC = async (req: Request, res: Response) => {
  try {
    const data = kycSchema.parse(req.body);
    const result = await KYCService.submit(req.user!.userId, data);
    res.json({ success: true, data: result });
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ success: false, error: 'Validation error', details: err.errors });
      return;
    }
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const getKYC = async (req: Request, res: Response) => {
  try {
    const result = await KYCService.getProfile(req.user!.userId);
    res.json({ success: true, data: result });
  } catch {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// === Hotspots ===
export const listHotspots = async (req: Request, res: Response) => {
  try {
    const hotspots = await prisma.hotspot.findMany({
      where: { ownerId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: hotspots });
  } catch {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const createHotspot = async (req: Request, res: Response) => {
  try {
    const data = hotspotSchema.parse(req.body);
    const subscription = await prisma.subscription.findFirst({
      where: { ownerId: req.user!.userId, isActive: true },
    });
    const hotspotCount = await prisma.hotspot.count({ where: { ownerId: req.user!.userId } });
    const maxHotspots = subscription?.maxHotspots || 1;

    if (hotspotCount >= maxHotspots) {
      res.status(403).json({ success: false, error: 'Hotspot limit reached for your plan' });
      return;
    }

    const hotspot = await prisma.hotspot.create({
      data: { ...data, ownerId: req.user!.userId },
    });
    res.status(201).json({ success: true, data: hotspot });
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ success: false, error: 'Validation error', details: err.errors });
      return;
    }
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const getHotspot = async (req: Request, res: Response) => {
  try {
    const hotspot = await prisma.hotspot.findFirst({
      where: { id: req.params.id, ownerId: req.user!.userId },
    });
    if (!hotspot) {
      res.status(404).json({ success: false, error: 'Hotspot not found' });
      return;
    }
    res.json({ success: true, data: hotspot });
  } catch {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const updateHotspot = async (req: Request, res: Response) => {
  try {
    const existing = await prisma.hotspot.findFirst({
      where: { id: req.params.id, ownerId: req.user!.userId },
    });
    if (!existing) {
      res.status(404).json({ success: false, error: 'Hotspot not found' });
      return;
    }
    const hotspot = await prisma.hotspot.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ success: true, data: hotspot });
  } catch {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const deleteHotspot = async (req: Request, res: Response) => {
  try {
    const existing = await prisma.hotspot.findFirst({
      where: { id: req.params.id, ownerId: req.user!.userId },
    });
    if (!existing) {
      res.status(404).json({ success: false, error: 'Hotspot not found' });
      return;
    }
    await prisma.hotspot.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });
    res.json({ success: true, message: 'Hotspot deactivated' });
  } catch {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// === Packages ===
export const listPackages = async (req: Request, res: Response) => {
  try {
    const { hotspotId } = req.query;
    const where: Record<string, unknown> = {};
    if (hotspotId) where.hotspotId = hotspotId;

    const hotspotIds = (await prisma.hotspot.findMany({
      where: { ownerId: req.user!.userId },
      select: { id: true },
    })).map(h => h.id);

    where.hotspotId = hotspotId || { in: hotspotIds };

    const packages = await prisma.package.findMany({
      where,
      include: { hotspot: { select: { name: true } } },
      orderBy: { sortOrder: 'asc' },
    });
    res.json({ success: true, data: packages });
  } catch {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const createPackage = async (req: Request, res: Response) => {
  try {
    const data = packageSchema.parse(req.body);
    const hotspot = await prisma.hotspot.findFirst({
      where: { id: data.hotspotId, ownerId: req.user!.userId },
    });
    if (!hotspot) {
      res.status(404).json({ success: false, error: 'Hotspot not found' });
      return;
    }
    const pkg = await PackageService.create(data);
    res.status(201).json({ success: true, data: pkg });
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ success: false, error: 'Validation error', details: err.errors });
      return;
    }
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const updatePackage = async (req: Request, res: Response) => {
  try {
    const pkg = await PackageService.update(req.params.id, req.body);
    res.json({ success: true, data: pkg });
  } catch {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const deletePackage = async (req: Request, res: Response) => {
  try {
    await PackageService.delete(req.params.id);
    res.json({ success: true, message: 'Package deleted' });
  } catch {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// === Vouchers ===
export const generateVoucher = async (req: Request, res: Response) => {
  try {
    const data = voucherGenerateSchema.parse(req.body);
    const result = await VoucherService.generate({
      ...data,
      createdBy: req.user!.userId,
    });
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ success: false, error: 'Validation error', details: err.errors });
      return;
    }
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const listVouchers = async (req: Request, res: Response) => {
  try {
    const { hotspotId, page = '1', limit = '20' } = req.query;
    if (!hotspotId) {
      res.status(400).json({ success: false, error: 'hotspotId is required' });
      return;
    }
    const result = await VoucherService.listByHotspot(
      hotspotId as string,
      parseInt(page as string),
      parseInt(limit as string)
    );
    res.json({ success: true, data: result });
  } catch {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// === Active Users ===
export const getActiveUsers = async (req: Request, res: Response) => {
  try {
    const { hotspotId } = req.query;
    const where: Record<string, unknown> = {
      hotspot: { ownerId: req.user!.userId },
      isActive: true,
      isExpired: false,
    };
    if (hotspotId) where.hotspotId = hotspotId as string;

    const sessions = await prisma.session.findMany({
      where,
      include: {
        package: { select: { name: true, type: true } },
        hotspot: { select: { name: true } },
        customer: true,
      },
      orderBy: { sessionStart: 'desc' },
    });
    res.json({ success: true, data: sessions });
  } catch {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const disconnectUser = async (req: Request, res: Response) => {
  try {
    const result = await RadiusService.disconnectUser(req.params.id);
    res.json({ success: true, data: result });
  } catch {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const blockCustomer = async (req: Request, res: Response) => {
  try {
    const { macAddress } = req.body;
    if (!macAddress) {
      res.status(400).json({ success: false, error: 'MAC address is required' });
      return;
    }
    await prisma.session.updateMany({
      where: {
        macAddress,
        hotspot: { ownerId: req.user!.userId },
        isActive: true,
      },
      data: { isActive: false, isExpired: true, sessionEnd: new Date(), disconnectReason: 'blocked' },
    });
    res.json({ success: true, message: 'Customer blocked' });
  } catch {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// === Revenue ===
export const getRevenue = async (req: Request, res: Response) => {
  try {
    const { days = '30' } = req.query;
    const report = await ReportService.getRevenueReport(req.user!.userId, parseInt(days as string));
    res.json({ success: true, data: report });
  } catch {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const getTransactions = async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20' } = req.query;
    const result = await PaymentService.getTransactionsForOwner(
      req.user!.userId,
      parseInt(page as string),
      parseInt(limit as string)
    );
    res.json({ success: true, data: result });
  } catch {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// === Usage Reports ===
export const getUsageReports = async (req: Request, res: Response) => {
  try {
    const { days = '7' } = req.query;
    const report = await ReportService.getUsageReport(req.user!.userId, parseInt(days as string));
    res.json({ success: true, data: report });
  } catch {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// === Withdrawals ===
export const listWithdrawals = async (req: Request, res: Response) => {
  try {
    const withdrawals = await prisma.withdrawal.findMany({
      where: { ownerId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: withdrawals });
  } catch {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const requestWithdrawal = async (req: Request, res: Response) => {
  try {
    const data = withdrawalSchema.parse(req.body);

    const earnings = await prisma.transaction.aggregate({
      where: { ownerId: req.user!.userId, paymentStatus: 'success' },
      _sum: { ownerEarnings: true },
    });

    const pendingWithdrawals = await prisma.withdrawal.aggregate({
      where: { ownerId: req.user!.userId, status: { in: ['pending', 'approved'] } },
      _sum: { amount: true },
    });

    const balance = (earnings._sum.ownerEarnings || 0) - (pendingWithdrawals._sum.amount || 0);
    if (data.amount > balance) {
      res.status(400).json({ success: false, error: 'Insufficient balance' });
      return;
    }

    const withdrawal = await prisma.withdrawal.create({
      data: { ...data, ownerId: req.user!.userId },
    });
    res.status(201).json({ success: true, data: withdrawal });
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ success: false, error: 'Validation error', details: err.errors });
      return;
    }
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

import { Request, Response } from 'express';
import prisma from '../config/database';
import { KYCService } from '../services/KYCService';
import { ReportService } from '../services/ReportService';
import { PaymentService } from '../services/PaymentService';
import { EmailService } from '../services/EmailService';

export const getDashboard = async (_req: Request, res: Response) => {
  try {
    const stats = await ReportService.getAdminDashboardStats();
    res.json({ success: true, data: stats });
  } catch {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// === Owners ===
export const listOwners = async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20', search } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: Record<string, unknown> = { role: 'hotspot_owner' };
    if (search) {
      where.OR = [
        { fullName: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [owners, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true, email: true, fullName: true, phone: true, isActive: true,
          createdAt: true, kycProfile: true,
          _count: { select: { hotspots: true, ownedTransactions: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit as string),
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      data: owners,
      pagination: { page: parseInt(page as string), limit: parseInt(limit as string), total, totalPages: Math.ceil(total / parseInt(limit as string)) },
    });
  } catch {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const getOwnerDetail = async (req: Request, res: Response) => {
  try {
    const owner = await prisma.user.findFirst({
      where: { id: req.params.id, role: 'hotspot_owner' },
      select: {
        id: true, email: true, fullName: true, phone: true, isActive: true, createdAt: true,
        kycProfile: true,
        hotspots: { include: { packages: true, _count: { select: { sessions: true } } } },
        subscriptions: true,
      },
    });
    if (!owner) {
      res.status(404).json({ success: false, error: 'Owner not found' });
      return;
    }
    res.json({ success: true, data: owner });
  } catch {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const suspendOwner = async (req: Request, res: Response) => {
  try {
    const { isActive } = req.body;
    const owner = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive: isActive ?? false },
    });

    if (!owner.isActive) {
      await prisma.session.updateMany({
        where: { hotspot: { ownerId: req.params.id }, isActive: true },
        data: { isActive: false, isExpired: true, sessionEnd: new Date(), disconnectReason: 'owner_suspended' },
      });
    }

    res.json({ success: true, data: owner });
  } catch {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// === KYC Management ===
export const getPendingKYC = async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20' } = req.query;
    const result = await KYCService.listPending(parseInt(page as string), parseInt(limit as string));
    res.json({ success: true, data: result });
  } catch {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const approveKYC = async (req: Request, res: Response) => {
  try {
    const result = await KYCService.approve(req.params.id, req.user!.userId);
    res.json({ success: true, data: result });
  } catch {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const rejectKYC = async (req: Request, res: Response) => {
  try {
    const { reason } = req.body;
    if (!reason) {
      res.status(400).json({ success: false, error: 'Rejection reason is required' });
      return;
    }
    const result = await KYCService.reject(req.params.id, req.user!.userId, reason);
    res.json({ success: true, data: result });
  } catch {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// === Hotspots ===
export const listAllHotspots = async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20', ownerId } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const where: Record<string, unknown> = {};
    if (ownerId) where.ownerId = ownerId as string;

    const [hotspots, total] = await Promise.all([
      prisma.hotspot.findMany({
        where,
        include: { owner: { select: { fullName: true, email: true } }, _count: { select: { sessions: true, packages: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit as string),
      }),
      prisma.hotspot.count({ where }),
    ]);

    res.json({
      success: true,
      data: hotspots,
      pagination: { page: parseInt(page as string), limit: parseInt(limit as string), total, totalPages: Math.ceil(total / parseInt(limit as string)) },
    });
  } catch {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// === Transactions ===
export const listAllTransactions = async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20', status } = req.query;
    const result = await PaymentService.getAllTransactions(
      parseInt(page as string),
      parseInt(limit as string),
      status as string | undefined
    );
    res.json({ success: true, data: result });
  } catch {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// === Commission Settings ===
export const getCommissionSettings = async (_req: Request, res: Response) => {
  try {
    res.json({ success: true, data: { defaultCommission: process.env.PLATFORM_DEFAULT_COMMISSION || '10' } });
  } catch {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const setCommission = async (req: Request, res: Response) => {
  try {
    const { commission } = req.body;
    if (commission === undefined || commission < 0 || commission > 100) {
      res.status(400).json({ success: false, error: 'Commission must be between 0 and 100' });
      return;
    }
    process.env.PLATFORM_DEFAULT_COMMISSION = String(commission);
    res.json({ success: true, data: { defaultCommission: commission } });
  } catch {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// === Subscriptions ===
export const listSubscriptions = async (_req: Request, res: Response) => {
  try {
    const subscriptions = await prisma.subscription.findMany({
      include: { owner: { select: { fullName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: subscriptions });
  } catch {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const updateSubscription = async (req: Request, res: Response) => {
  try {
    const subscription = await prisma.subscription.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ success: true, data: subscription });
  } catch {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// === System Analytics ===
export const getAnalytics = async (_req: Request, res: Response) => {
  try {
    const analytics = await ReportService.getSystemAnalytics();
    res.json({ success: true, data: analytics });
  } catch {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// === Audit Logs ===
export const listAuditLogs = async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '50' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        include: { user: { select: { fullName: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit as string),
      }),
      prisma.auditLog.count(),
    ]);

    res.json({
      success: true,
      data: logs,
      pagination: { page: parseInt(page as string), limit: parseInt(limit as string), total, totalPages: Math.ceil(total / parseInt(limit as string)) },
    });
  } catch {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

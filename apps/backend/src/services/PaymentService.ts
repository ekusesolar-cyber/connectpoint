import prisma from '../config/database';
import { env } from '../config/env';
import { initiatePayment, verifyPayment } from '../utils/flutterwave';
import { calculatePlatformFee, calculateOwnerEarnings, generateUsername, generatePassword, calculateExpiry } from '../utils/helpers';
import { RadiusService } from './RadiusService';

export class PaymentService {
  static async initialize(data: {
    hotspotId: string;
    packageId: string;
    customerEmail?: string;
    customerPhone?: string;
    redirectUrl?: string;
  }) {
    const pkg = await prisma.package.findUnique({ where: { id: data.packageId } });
    if (!pkg || !pkg.isActive) throw new Error('NOT_FOUND');
    if (pkg.price <= 0) throw new Error('Free packages cannot be purchased');

    const txRef = `WV-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`.toUpperCase();
    const redirectUrl = data.redirectUrl || `${env.FRONTEND_URL}/portal/${data.hotspotId}/payment`;

    const transaction = await prisma.transaction.create({
      data: {
        hotspotId: data.hotspotId,
        packageId: data.packageId,
        amount: pkg.price,
        currency: pkg.currency || 'XAF',
        paymentProvider: 'flutterwave',
        paymentReference: txRef,
        paymentStatus: 'pending',
        platformFee: 0,
        ownerEarnings: 0,
        metadata: { customerEmail: data.customerEmail, customerPhone: data.customerPhone },
      },
    });

    const paymentLink = await initiatePayment({
      tx_ref: txRef,
      amount: pkg.price,
      currency: pkg.currency || 'XAF',
      redirect_url: redirectUrl,
      customer: {
        email: data.customerEmail || 'guest@connectpoint.io',
        phone_number: data.customerPhone,
        name: 'ConnectPoint Customer',
      },
      meta: { hotspotId: data.hotspotId, packageId: data.packageId, transactionId: transaction.id },
      customizations: {
        title: env.PLATFORM_NAME,
        description: `${pkg.name} - ${pkg.price} ${pkg.currency}`,
      },
    });

    return {
      paymentLink: paymentLink.link,
      reference: txRef,
      transactionId: transaction.id,
    };
  }

  static async verify(reference: string) {
    const transaction = await prisma.transaction.findUnique({ where: { paymentReference: reference } });
    if (!transaction) throw new Error('NOT_FOUND');
    if (transaction.paymentStatus === 'success') {
      return { status: 'success', transaction };
    }

    const verification = await verifyPayment(reference);
    if (verification.status === 'successful') {
      return this.completeTransaction(transaction.id);
    }

    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { paymentStatus: 'failed' },
    });

    return { status: 'failed', transaction };
  }

  static async handleWebhook(payload: {
    event: string;
    data: {
      tx_ref: string;
      status: string;
      amount: number;
      currency: string;
    };
  }) {
    if (payload.event === 'charge.completed' && payload.data.status === 'successful') {
      return this.completeTransactionByRef(payload.data.tx_ref);
    }
    if (payload.event === 'charge.failed') {
      await prisma.transaction.updateMany({
        where: { paymentReference: payload.data.tx_ref, paymentStatus: 'pending' },
        data: { paymentStatus: 'failed' },
      });
    }
    return { received: true };
  }

  private static async completeTransaction(transactionId: string) {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { package: true, hotspot: true },
    });
    if (!transaction) throw new Error('NOT_FOUND');

    const hotspot = await prisma.hotspot.findUnique({ where: { id: transaction.hotspotId! } });
    if (!hotspot) throw new Error('NOT_FOUND');

    const commissionRate = env.PLATFORM_DEFAULT_COMMISSION;
    const platformFee = calculatePlatformFee(transaction.amount, commissionRate);
    const ownerEarnings = calculateOwnerEarnings(transaction.amount, platformFee);

    await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        paymentStatus: 'success',
        platformFee,
        ownerEarnings,
        ownerId: hotspot.ownerId,
      },
    });

    const pkg = transaction.package;
    if (pkg) {
      const username = generateUsername(hotspot.id);
      const password = generatePassword();
      const timeTotal = pkg.durationMinutes ? pkg.durationMinutes * 60 : undefined;
      const dataTotal = pkg.dataLimitMb ? pkg.dataLimitMb * 1024 * 1024 : undefined;

      await RadiusService.createUser({
        hotspotId: hotspot.id,
        username,
        password,
        timeLimitSeconds: timeTotal || null,
        dataLimitBytes: dataTotal || null,
        speedLimitKbps: pkg.speedLimitKbps || null,
      });

      const expiryDate = pkg.durationMinutes ? calculateExpiry(pkg.durationMinutes) : null;

      await prisma.session.create({
        data: {
          hotspotId: hotspot.id,
          packageId: pkg.id,
          username,
          password,
          sessionStart: new Date(),
          timeTotalSeconds: timeTotal || 0,
          dataTotal: dataTotal || 0,
          isActive: true,
          isExpired: false,
        },
      });

      return {
        status: 'success',
        transaction: { ...transaction, paymentStatus: 'success', platformFee, ownerEarnings },
        session: { username, password, expiresAt: expiryDate },
      };
    }

    return { status: 'success', transaction: { ...transaction, paymentStatus: 'success', platformFee, ownerEarnings } };
  }

  private static async completeTransactionByRef(txRef: string) {
    const transaction = await prisma.transaction.findUnique({ where: { paymentReference: txRef } });
    if (!transaction) throw new Error('NOT_FOUND');
    if (transaction.paymentStatus === 'success') return { status: 'success', transaction };
    return this.completeTransaction(transaction.id);
  }

  static async getTransactionsForOwner(ownerId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      prisma.transaction.findMany({
        where: { ownerId, paymentStatus: 'success' },
        include: { hotspot: { select: { name: true } }, package: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.transaction.count({ where: { ownerId, paymentStatus: 'success' } }),
    ]);
    return { items, total, page, totalPages: Math.ceil(total / limit) };
  }

  static async getAllTransactions(page = 1, limit = 20, status?: string) {
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (status) where.paymentStatus = status;

    const [items, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          hotspot: { select: { name: true } },
          package: { select: { name: true } },
          owner: { select: { fullName: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ]);
    return { items, total, page, totalPages: Math.ceil(total / limit) };
  }
}

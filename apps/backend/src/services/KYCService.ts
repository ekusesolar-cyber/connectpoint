import prisma from '../config/database';
import { EmailService } from './EmailService';

export class KYCService {
  static async getProfile(userId: string) {
    return prisma.kYCProfile.findUnique({ where: { userId } });
  }

  static async submit(userId: string, data: {
    businessName?: string;
    businessType?: string;
    businessAddress?: string;
    governmentIdType?: string;
    governmentIdNumber?: string;
  }) {
    const existing = await prisma.kYCProfile.findUnique({ where: { userId } });
    if (existing) {
      return prisma.kYCProfile.update({
        where: { userId },
        data: {
          ...data,
          kycStatus: 'pending',
          submittedAt: new Date(),
          rejectionReason: null,
        },
      });
    }
    return prisma.kYCProfile.create({
      data: {
        userId,
        ...data,
        kycStatus: 'pending',
        submittedAt: new Date(),
      },
    });
  }

  static async uploadDocument(userId: string, field: 'idDocumentUrl' | 'utilityBillUrl', url: string) {
    const existing = await prisma.kYCProfile.findUnique({ where: { userId } });
    if (existing) {
      return prisma.kYCProfile.update({
        where: { userId },
        data: { [field]: url },
      });
    }
    return prisma.kYCProfile.create({
      data: { userId, [field]: url, kycStatus: 'pending', submittedAt: new Date() },
    });
  }

  static async approve(kycId: string, reviewerId: string) {
    const kyc = await prisma.kYCProfile.update({
      where: { id: kycId },
      data: { kycStatus: 'approved', reviewedById: reviewerId, reviewedAt: new Date() },
      include: { user: true },
    });

    await EmailService.sendKYCApprovedEmail(kyc.user.email, kyc.user.fullName);
    return kyc;
  }

  static async reject(kycId: string, reviewerId: string, reason: string) {
    const kyc = await prisma.kYCProfile.update({
      where: { id: kycId },
      data: { kycStatus: 'rejected', reviewedById: reviewerId, reviewedAt: new Date(), rejectionReason: reason },
      include: { user: true },
    });

    await EmailService.sendKYCRejectedEmail(kyc.user.email, kyc.user.fullName, reason);
    return kyc;
  }

  static async listPending(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      prisma.kYCProfile.findMany({
        where: { kycStatus: 'pending' },
        include: { user: { select: { id: true, email: true, fullName: true, phone: true, createdAt: true } } },
        orderBy: { submittedAt: 'asc' },
        skip,
        take: limit,
      }),
      prisma.kYCProfile.count({ where: { kycStatus: 'pending' } }),
    ]);
    return { items, total, page, totalPages: Math.ceil(total / limit) };
  }

  static async listAll(page = 1, limit = 20, status?: string) {
    const skip = (page - 1) * limit;
    const where = status ? { kycStatus: status as 'pending' | 'approved' | 'rejected' } : {};
    const [items, total] = await Promise.all([
      prisma.kYCProfile.findMany({
        where,
        include: { user: { select: { id: true, email: true, fullName: true, phone: true } } },
        orderBy: { submittedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.kYCProfile.count({ where }),
    ]);
    return { items, total, page, totalPages: Math.ceil(total / limit) };
  }
}

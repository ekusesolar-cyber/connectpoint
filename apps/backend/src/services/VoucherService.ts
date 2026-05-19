import prisma from '../config/database';
import { generateVoucherCode, generatePin, generateBatchId } from '../utils/helpers';

export class VoucherService {
  static async generate(data: {
    hotspotId: string;
    packageId?: string;
    count?: number;
    expiresAt?: string;
    createdBy: string;
  }) {
    const hotspot = await prisma.hotspot.findUnique({ where: { id: data.hotspotId } });
    if (!hotspot) throw new Error('NOT_FOUND');

    const count = Math.min(data.count || 1, 100);
    const batchId = count > 1 ? generateBatchId() : undefined;
    const expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;

    const vouchers = [];
    for (let i = 0; i < count; i++) {
      const code = generateVoucherCode();
      const pin = generatePin();
      const voucher = await prisma.voucher.create({
        data: {
          hotspotId: data.hotspotId,
          packageId: data.packageId || null,
          code,
          pin,
          expiresAt,
          createdBy: data.createdBy,
          batchId,
        },
      });
      vouchers.push(voucher);
    }

    return { vouchers, batchId, count };
  }

  static async validate(code: string, pin?: string) {
    const voucher = await prisma.voucher.findUnique({ where: { code } });
    if (!voucher) throw new Error('INVALID_VOUCHER');
    if (voucher.isUsed) throw new Error('VOUCHER_USED');
    if (voucher.expiresAt && voucher.expiresAt < new Date()) throw new Error('INVALID_VOUCHER');
    if (pin && voucher.pin !== pin) throw new Error('INVALID_VOUCHER');

    return voucher;
  }

  static async markUsed(id: string, customerId?: string) {
    return prisma.voucher.update({
      where: { id },
      data: { isUsed: true, usedAt: new Date(), usedById: customerId || null },
    });
  }

  static async listByHotspot(hotspotId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      prisma.voucher.findMany({
        where: { hotspotId },
        include: { package: { select: { name: true, price: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.voucher.count({ where: { hotspotId } }),
    ]);
    return { items, total, page, totalPages: Math.ceil(total / limit) };
  }
}

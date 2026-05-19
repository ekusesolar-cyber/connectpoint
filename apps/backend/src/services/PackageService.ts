import prisma from '../config/database';
import type { PackageType } from '@prisma/client';

export class PackageService {
  static async create(data: {
    hotspotId: string;
    name: string;
    description?: string;
    type: PackageType;
    price: number;
    currency?: string;
    durationMinutes?: number;
    dataLimitMb?: number;
    speedLimitKbps?: number;
    isPaid?: boolean;
  }) {
    const hotspot = await prisma.hotspot.findUnique({ where: { id: data.hotspotId } });
    if (!hotspot) throw new Error('NOT_FOUND');

    return prisma.package.create({
      data: {
        hotspotId: data.hotspotId,
        name: data.name,
        description: data.description || null,
        type: data.type,
        price: data.price,
        currency: data.currency || 'XAF',
        durationMinutes: data.durationMinutes || null,
        dataLimitMb: data.dataLimitMb || null,
        speedLimitKbps: data.speedLimitKbps || null,
        isPaid: data.isPaid ?? true,
      },
    });
  }

  static async update(id: string, data: Partial<{
    name: string;
    description: string;
    type: PackageType;
    price: number;
    currency: string;
    durationMinutes: number;
    dataLimitMb: number;
    speedLimitKbps: number;
    isActive: boolean;
    isPaid: boolean;
    sortOrder: number;
  }>) {
    return prisma.package.update({ where: { id }, data });
  }

  static async delete(id: string) {
    return prisma.package.delete({ where: { id } });
  }

  static async getByHotspot(hotspotId: string, activeOnly = true) {
    const where: Record<string, unknown> = { hotspotId };
    if (activeOnly) where.isActive = true;
    return prisma.package.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });
  }

  static async getById(id: string) {
    return prisma.package.findUnique({ where: { id } });
  }

  static async getHotspotPackagesWithDetails(hotspotId: string) {
    const [packages, hotspot] = await Promise.all([
      this.getByHotspot(hotspotId),
      prisma.hotspot.findUnique({ where: { id: hotspotId }, select: { name: true, currency: true } }),
    ]);
    return { packages, hotspot };
  }
}

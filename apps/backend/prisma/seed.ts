import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('Admin123!', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@connectpoint.io' },
    update: {},
    create: {
      email: 'admin@connectpoint.io',
      passwordHash: adminPassword,
      fullName: 'Admin ConnectPoint',
      role: 'admin',
      isActive: true,
      emailVerifiedAt: new Date(),
    },
  });

  console.log(`Admin created: ${admin.email}`);

  const ownerPassword = await bcrypt.hash('Owner123!', 12);
  const owner = await prisma.user.upsert({
    where: { email: 'owner@connectpoint.io' },
    update: {},
    create: {
      email: 'owner@connectpoint.io',
      passwordHash: ownerPassword,
      fullName: 'Test Hotspot Owner',
      phone: '+237600000000',
      role: 'hotspot_owner',
      isActive: true,
      emailVerifiedAt: new Date(),
    },
  });

  console.log(`Owner created: ${owner.email}`);

  const kyc = await prisma.kYCProfile.upsert({
    where: { userId: owner.id },
    update: {},
    create: {
      userId: owner.id,
      businessName: 'Test CafÃ© Wi-Fi',
      businessType: 'cafe',
      businessAddress: '123 Main Street, YaoundÃ©, Cameroon',
      governmentIdType: 'national_id',
      governmentIdNumber: 'ID-12345678',
      kycStatus: 'approved',
      submittedAt: new Date(),
      reviewedById: admin.id,
      reviewedAt: new Date(),
    },
  });

  console.log(`KYC approved for owner`);

  await prisma.subscription.upsert({
    where: { id: `sub-${owner.id}` },
    update: {},
    create: {
      id: `sub-${owner.id}`,
      ownerId: owner.id,
      planName: 'pro',
      maxHotspots: 5,
      commissionRate: 10,
      billingCycle: 'monthly',
      startsAt: new Date(),
      isActive: true,
    },
  });

  const hotspot = await prisma.hotspot.upsert({
    where: { id: 'demo-hotspot-1' },
    update: {},
    create: {
      id: 'demo-hotspot-1',
      ownerId: owner.id,
      name: 'Test CafÃ© Wi-Fi',
      address: '123 Main Street',
      city: 'YaoundÃ©',
      country: 'Cameroon',
      routerType: 'MikroTik',
      isActive: true,
    },
  });

  console.log(`Hotspot created: ${hotspot.name}`);

  const packages = [
    { name: '30 Minutes', type: 'time' as const, price: 100, durationMinutes: 30, sortOrder: 1 },
    { name: '1 Hour', type: 'time' as const, price: 200, durationMinutes: 60, sortOrder: 2 },
    { name: '3 Hours', type: 'time' as const, price: 500, durationMinutes: 180, sortOrder: 3 },
    { name: '24 Hours', type: 'time' as const, price: 1000, durationMinutes: 1440, sortOrder: 4 },
    { name: '500 MB', type: 'data' as const, price: 300, dataLimitMb: 500, sortOrder: 5 },
    { name: '1 GB', type: 'data' as const, price: 500, dataLimitMb: 1024, sortOrder: 6 },
    { name: '5 GB', type: 'data' as const, price: 2000, dataLimitMb: 5120, sortOrder: 7 },
    { name: 'Free 15 Min', type: 'time' as const, price: 0, durationMinutes: 15, isPaid: false, sortOrder: 8 },
  ];

  for (const pkg of packages) {
    await prisma.package.upsert({
      where: { id: `pkg-${pkg.name.toLowerCase().replace(/\s+/g, '-')}` },
      update: {},
      create: {
        id: `pkg-${pkg.name.toLowerCase().replace(/\s+/g, '-')}`,
        hotspotId: hotspot.id,
        name: pkg.name,
        type: pkg.type,
        price: pkg.price,
        currency: 'XAF',
        durationMinutes: 'durationMinutes' in pkg ? pkg.durationMinutes : null,
        dataLimitMb: 'dataLimitMb' in pkg ? pkg.dataLimitMb : null,
        isPaid: pkg.isPaid !== false,
        sortOrder: pkg.sortOrder,
        isActive: true,
      },
    });
  }

  console.log(`Packages created for hotspot`);

  const voucher = await prisma.voucher.create({
    data: {
      hotspotId: hotspot.id,
      code: 'FREE12345678',
      pin: '1234',
      isUsed: false,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  console.log(`Test voucher created: ${voucher.code} PIN: ${voucher.pin}`);
  console.log('---');
  console.log('Admin login: admin@connectpoint.io / Admin123!');
  console.log('Owner login: owner@connectpoint.io / Owner123!');
  console.log('Test voucher: FREE12345678 / PIN: 1234');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import crypto from 'crypto';

export function generateVoucherCode(length = 12): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function generatePin(length = 4): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export function generateUsername(hotspotId: string): string {
  const shortId = hotspotId.replace(/-/g, '').substring(0, 8);
  const ts = Date.now().toString(36);
  return `wv_${shortId}_${ts}`;
}

export function generatePassword(length = 12): string {
  return crypto.randomBytes(length).toString('base64').substring(0, length);
}

export function calculateExpiry(durationMinutes: number): Date {
  return new Date(Date.now() + durationMinutes * 60 * 1000);
}

export function bytesToMb(bytes: number): number {
  return Math.round(bytes / (1024 * 1024) * 100) / 100;
}

export function calculatePlatformFee(amount: number, commissionRate: number): number {
  return Math.round((amount * commissionRate) / 100);
}

export function calculateOwnerEarnings(amount: number, platformFee: number): number {
  return amount - platformFee;
}

export function paginate(page: number, limit: number) {
  const p = Math.max(1, page);
  const l = Math.min(100, Math.max(1, limit));
  return {
    skip: (p - 1) * l,
    take: l,
    page: p,
    limit: l,
  };
}

export function generateBatchId(): string {
  return `BATCH-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

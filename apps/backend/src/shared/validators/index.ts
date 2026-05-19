import { z } from 'zod';
import { PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH } from '../constants';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
    .max(PASSWORD_MAX_LENGTH, `Password must be at most ${PASSWORD_MAX_LENGTH} characters`),
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(255),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const hotspotSchema = z.object({
  name: z.string().min(2).max(255),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().default('Cameroon'),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  routerIp: z.string().ip().optional(),
  routerType: z.string().default('MikroTik'),
  routerSecret: z.string().min(8).optional(),
});

export const packageSchema = z.object({
  hotspotId: z.string().uuid(),
  name: z.string().min(2).max(255),
  description: z.string().max(500).optional(),
  type: z.enum(['time', 'data', 'speed', 'unlimited']),
  price: z.number().min(0),
  currency: z.string().default('XAF'),
  durationMinutes: z.number().int().positive().optional(),
  dataLimitMb: z.number().int().positive().optional(),
  speedLimitKbps: z.number().int().positive().optional(),
  isPaid: z.boolean().default(true),
});

export const voucherGenerateSchema = z.object({
  hotspotId: z.string().uuid(),
  packageId: z.string().uuid().optional(),
  count: z.number().int().min(1).max(100).default(1),
  expiresAt: z.string().datetime().optional(),
});

export const kycSchema = z.object({
  businessName: z.string().min(2).max(255).optional(),
  businessType: z.string().max(100).optional(),
  businessAddress: z.string().max(500).optional(),
  governmentIdType: z.string().max(50).optional(),
  governmentIdNumber: z.string().max(100).optional(),
});

export const paymentInitializeSchema = z.object({
  hotspotId: z.string().uuid(),
  packageId: z.string().uuid(),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().optional(),
  redirectUrl: z.string().url().optional(),
});

export const withdrawalSchema = z.object({
  amount: z.number().min(100, 'Minimum withdrawal is 100 XAF'),
  bankName: z.string().min(2),
  accountNumber: z.string().min(5),
  accountName: z.string().min(2),
});

export const flwWebhookSchema = z.object({
  event: z.string(),
  data: z.object({
    id: z.number(),
    tx_ref: z.string(),
    flw_ref: z.string(),
    status: z.string(),
    amount: z.number(),
    currency: z.string(),
    charged_amount: z.number(),
    customer: z.object({
      email: z.string().email(),
      phone_number: z.string().nullable(),
      name: z.string().nullable(),
    }),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type HotspotInput = z.infer<typeof hotspotSchema>;
export type PackageInput = z.infer<typeof packageSchema>;
export type VoucherGenerateInput = z.infer<typeof voucherGenerateSchema>;
export type KYCInput = z.infer<typeof kycSchema>;
export type PaymentInitializeInput = z.infer<typeof paymentInitializeSchema>;
export type WithdrawalInput = z.infer<typeof withdrawalSchema>;

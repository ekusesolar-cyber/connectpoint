export enum UserRole {
  ADMIN = 'admin',
  HOTSPOT_OWNER = 'hotspot_owner',
}

export enum KYCStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum PackageType {
  TIME = 'time',
  DATA = 'data',
  SPEED = 'speed',
  UNLIMITED = 'unlimited',
}

export enum PaymentProvider {
  FLUTTERWAVE = 'flutterwave',
  PAYSTACK = 'paystack',
  MTN_MOMO = 'mtn_momo',
  ORANGE_MONEY = 'orange_money',
}

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum WithdrawalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
}

export enum SubscriptionPlan {
  FREE = 'free',
  STARTER = 'starter',
  PRO = 'pro',
  ENTERPRISE = 'enterprise',
}

export enum BillingCycle {
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  emailVerifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KYCProfile {
  id: string;
  userId: string;
  businessName?: string;
  businessType?: string;
  businessAddress?: string;
  governmentIdType?: string;
  governmentIdNumber?: string;
  idDocumentUrl?: string;
  utilityBillUrl?: string;
  kycStatus: KYCStatus;
  rejectionReason?: string;
  submittedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Hotspot {
  id: string;
  ownerId: string;
  name: string;
  address?: string;
  city?: string;
  country: string;
  latitude?: number;
  longitude?: number;
  routerIp?: string;
  routerType: string;
  routerSecret?: string;
  nasIdentifier?: string;
  isActive: boolean;
  qrCodeUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Package {
  id: string;
  hotspotId: string;
  name: string;
  description?: string;
  type: PackageType;
  price: number;
  currency: string;
  durationMinutes?: number;
  dataLimitMb?: number;
  speedLimitKbps?: number;
  isActive: boolean;
  isPaid: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Voucher {
  id: string;
  packageId?: string;
  hotspotId: string;
  code: string;
  pin?: string;
  isUsed: boolean;
  usedBy?: string;
  usedAt?: string;
  expiresAt?: string;
  createdBy?: string;
  batchId?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  phone?: string;
  email?: string;
  macAddress?: string;
  deviceName?: string;
  firstSeenAt: string;
  lastSeenAt?: string;
  createdAt: string;
}

export interface Session {
  id: string;
  customerId?: string;
  hotspotId: string;
  packageId?: string;
  voucherId?: string;
  radiusSessionId?: string;
  nasIpAddress?: string;
  framedIpAddress?: string;
  macAddress?: string;
  username: string;
  sessionStart?: string;
  sessionEnd?: string;
  dataUsedUp: number;
  dataUsedDown: number;
  dataTotal: number;
  timeUsedSeconds: number;
  timeTotalSeconds: number;
  isActive: boolean;
  isExpired: boolean;
  disconnectReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  customerId?: string;
  hotspotId?: string;
  ownerId?: string;
  packageId?: string;
  voucherId?: string;
  amount: number;
  currency: string;
  paymentProvider: string;
  paymentReference: string;
  paymentStatus: PaymentStatus;
  platformFee: number;
  ownerEarnings: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface Withdrawal {
  id: string;
  ownerId: string;
  amount: number;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  status: WithdrawalStatus;
  processedBy?: string;
  processedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Advertisement {
  id: string;
  hotspotId?: string;
  title: string;
  imageUrl?: string;
  targetUrl?: string;
  durationSeconds: number;
  isActive: boolean;
  impressions: number;
  clicks: number;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  ownerId: string;
  planName: SubscriptionPlan;
  price: number;
  maxHotspots: number;
  commissionRate: number;
  billingCycle: BillingCycle;
  startsAt?: string;
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalHotspots: number;
  activeSessions: number;
  totalRevenue: number;
  totalCustomers: number;
  revenueToday: number;
  revenueThisMonth: number;
  sessionsToday: number;
}

export interface RevenueReport {
  date: string;
  amount: number;
  transactions: number;
  platformFees: number;
  ownerEarnings: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

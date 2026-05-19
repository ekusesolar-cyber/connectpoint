export const PLATFORM_NAME = 'ConnectPoint';
export const PLATFORM_DEFAULT_CURRENCY = 'XAF';
export const PLATFORM_DEFAULT_COMMISSION = 10;
export const PLATFORM_EMAIL = 'hello@connectpoint.io';
export const PLATFORM_URL = 'https://connectpoint.io';

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;
export const VOUCHER_CODE_LENGTH = 12;
export const VOUCHER_PIN_LENGTH = 4;
export const BATCH_SIZE_LIMIT = 1000;

export const PAGINATION_DEFAULT_PAGE = 1;
export const PAGINATION_DEFAULT_LIMIT = 20;
export const PAGINATION_MAX_LIMIT = 100;

export const FILE_UPLOAD_MAX_SIZE = 5 * 1024 * 1024;
export const FILE_UPLOAD_ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
];

export const SESSION_EXPIRY_CHECK_INTERVAL = 60000;

export const RADIUS_ATTRIBUTES = {
  MAX_ALL_SESSION: 'Max-All-Session',
  MAX_OCTETS: 'Max-Octets',
  MIKROTIK_RATE_LIMIT: 'MikroTik-Rate-Limit',
  SESSION_TIMEOUT: 'Session-Timeout',
  IDLE_TIMEOUT: 'Idle-Timeout',
  ACCT_INTERIM_INTERVAL: 'Acct-Interim-Interval',
} as const;

export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'You do not have permission to perform this action',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Validation error',
  INTERNAL_ERROR: 'An internal error occurred',
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_EXISTS: 'An account with this email already exists',
  KYC_PENDING: 'Your KYC is pending approval',
  KYC_REJECTED: 'Your KYC has been rejected',
  KYC_NOT_FOUND: 'Please submit your KYC first',
  HOTSPOT_LIMIT: 'You have reached the maximum number of hotspots for your plan',
  INSUFFICIENT_FUNDS: 'Insufficient balance for withdrawal',
  INVALID_VOUCHER: 'Invalid or expired voucher',
  VOUCHER_USED: 'This voucher has already been used',
  PAYMENT_FAILED: 'Payment processing failed',
  SESSION_EXPIRED: 'Your session has expired',
  SUSPENDED: 'Your account has been suspended',
} as const;

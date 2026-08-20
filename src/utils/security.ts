/**
 * Sanitizes input strings against XSS attacks by escaping HTML characters
 */
export function sanitizeInput(input: string | undefined | null): string {
  if (!input) return '';
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validates monetary amounts (must be positive number, max 2 decimals, within bounds)
 */
export function validateAmount(amount: number | string): { isValid: boolean; error?: string } {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) {
    return { isValid: false, error: 'กรุณาระบุจำนวนเงินที่ถูกต้อง' };
  }
  if (num <= 0) {
    return { isValid: false, error: 'จำนวนเงินต้องมากกว่า 0' };
  }
  if (num > 1000000000) {
    return { isValid: false, error: 'จำนวนเงินสูงเกินขีดจำกัดที่กำหนด (สูงสุด 1 พันล้าน)' };
  }
  return { isValid: true };
}

/**
 * Validates date format (YYYY-MM-DD)
 */
export function validateDate(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

/**
 * NIST SP 800-63B Compliant Password Validator
 * - Minimum 8 characters
 * - Checks against common weak patterns
 */
export function validatePasswordNIST(password: string): { isValid: boolean; error?: string } {
  if (!password || password.length < 8) {
    return { isValid: false, error: 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษรตามมาตรฐาน NIST SP 800-63B' };
  }
  if (password.length > 64) {
    return { isValid: false, error: 'รหัสผ่านมีความยาวเกินกำหนด (สูงสุด 64 ตัวอักษร)' };
  }
  const commonWeak = ['password', '12345678', 'qwertyui', 'admin123', 'pass1234'];
  if (commonWeak.includes(password.toLowerCase())) {
    return { isValid: false, error: 'รหัสผ่านนี้คาดเดาได้ง่ายเกินไป กรุณาเลือกรหัสผ่านที่มีความปลอดภัยสูงขึ้น' };
  }
  return { isValid: true };
}

/**
 * In-Memory & LocalStorage Rate Limiter for Client-side Defense against Brute Force & Replay
 */
interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitStore: Record<string, RateLimitRecord> = {};

export function checkRateLimit(
  key: string,
  maxAttempts: number = 5,
  windowMs: number = 60000
): { allowed: boolean; remainingAttempts: number; retryAfterSeconds: number } {
  const now = Date.now();
  const record = rateLimitStore[key];

  if (!record || now > record.resetTime) {
    rateLimitStore[key] = {
      count: 1,
      resetTime: now + windowMs,
    };
    return { allowed: true, remainingAttempts: maxAttempts - 1, retryAfterSeconds: 0 };
  }

  if (record.count >= maxAttempts) {
    const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);
    return { allowed: false, remainingAttempts: 0, retryAfterSeconds };
  }

  record.count += 1;
  return {
    allowed: true,
    remainingAttempts: maxAttempts - record.count,
    retryAfterSeconds: 0,
  };
}

export function resetRateLimit(key: string): void {
  delete rateLimitStore[key];
}

/**
 * Recommended Production HTTP Security Headers Template (for Vercel / Cloudflare / Node / Express)
 */
export const RECOMMENDED_SECURITY_HEADERS = {
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://apis.google.com https://*.firebaseapp.com; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://identitytoolkit.googleapis.com; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; frame-src https://*.firebaseapp.com;",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
};

/**
 * Secure Session Cookie Attributes Definition
 */
export const SECURE_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true, // Only transmitted over HTTPS
  sameSite: 'strict' as const, // Strict CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days session lifetime
  path: '/',
};

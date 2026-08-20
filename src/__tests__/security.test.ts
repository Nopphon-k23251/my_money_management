import { describe, it, expect, beforeEach } from 'vitest';
import {
  sanitizeInput,
  sanitizeCsvField,
  validateAmount,
  validateDate,
  validatePasswordNIST,
  checkRateLimit,
  resetRateLimit,
  SECURE_COOKIE_OPTIONS,
  RECOMMENDED_SECURITY_HEADERS,
} from '../utils/security';

describe('Security & Sanitization Utils', () => {
  it('should sanitize dangerous HTML tags and XSS payloads', () => {
    const dirty = '<script>alert("XSS")</script>';
    const clean = sanitizeInput(dirty);
    expect(clean).not.toContain('<script>');
    expect(clean).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;');
  });

  it('should sanitize CSV cells to prevent Formula Injection (CWE-1236)', () => {
    const malicious1 = '=1+2';
    const malicious2 = '+cmd|"/C calc"!A0';
    const malicious3 = '-100';
    const malicious4 = '@SUM(A1:A10)';

    expect(sanitizeCsvField(malicious1)).toBe("\"'=1+2\"");
    expect(sanitizeCsvField(malicious2)).toBe("\"'+cmd|\"\"/C calc\"\"!A0\"");
    expect(sanitizeCsvField(malicious3)).toBe("\"'-100\"");
    expect(sanitizeCsvField(malicious4)).toBe("\"'@SUM(A1:A10)\"");
    expect(sanitizeCsvField('normal text')).toBe('"normal text"');
  });

  it('should handle undefined or null safely', () => {
    expect(sanitizeInput(undefined)).toBe('');
    expect(sanitizeInput(null)).toBe('');
    expect(sanitizeInput('')).toBe('');
    expect(sanitizeCsvField(undefined)).toBe('""');
    expect(sanitizeCsvField(null)).toBe('""');
  });

  it('should validate amounts correctly', () => {
    expect(validateAmount(500).isValid).toBe(true);
    expect(validateAmount('1250.50').isValid).toBe(true);
    expect(validateAmount(-100).isValid).toBe(false);
    expect(validateAmount('abc').isValid).toBe(false);
    expect(validateAmount(2000000000).isValid).toBe(false);
  });

  it('should validate date strings correctly (YYYY-MM-DD)', () => {
    expect(validateDate('2026-08-19')).toBe(true);
    expect(validateDate('invalid-date')).toBe(false);
    expect(validateDate('19/08/2026')).toBe(false);
  });
});

describe('NIST SP 800-63B Password Validation', () => {
  it('should reject passwords shorter than 8 characters', () => {
    const res = validatePasswordNIST('short');
    expect(res.isValid).toBe(false);
    expect(res.error).toContain('8 ตัวอักษร');
  });

  it('should reject known dictionary passwords', () => {
    const res = validatePasswordNIST('password');
    expect(res.isValid).toBe(false);
    expect(res.error).toContain('คาดเดาได้ง่าย');
  });

  it('should accept strong compliant passwords', () => {
    const res = validatePasswordNIST('S3cur3P@ssw0rd!2026');
    expect(res.isValid).toBe(true);
    expect(res.error).toBeUndefined();
  });
});

describe('Rate Limiter (Brute-Force & DDoS Mitigation)', () => {
  const testKey = 'test-login-user@example.com';

  beforeEach(() => {
    resetRateLimit(testKey);
  });

  it('should allow initial attempts within threshold', () => {
    const attempt1 = checkRateLimit(testKey, 3, 60000);
    expect(attempt1.allowed).toBe(true);
    expect(attempt1.remainingAttempts).toBe(2);

    const attempt2 = checkRateLimit(testKey, 3, 60000);
    expect(attempt2.allowed).toBe(true);
    expect(attempt2.remainingAttempts).toBe(1);
  });

  it('should block attempts once threshold is exceeded', () => {
    checkRateLimit(testKey, 2, 60000);
    checkRateLimit(testKey, 2, 60000);

    const blocked = checkRateLimit(testKey, 2, 60000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remainingAttempts).toBe(0);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });
});

describe('Secure Cookies & Security Headers Compliance', () => {
  it('should define strict cookie security attributes', () => {
    expect(SECURE_COOKIE_OPTIONS.httpOnly).toBe(true);
    expect(SECURE_COOKIE_OPTIONS.secure).toBe(true);
    expect(SECURE_COOKIE_OPTIONS.sameSite).toBe('strict');
  });

  it('should have essential OWASP HTTP security headers configured', () => {
    expect(RECOMMENDED_SECURITY_HEADERS['X-Frame-Options']).toBe('DENY');
    expect(RECOMMENDED_SECURITY_HEADERS['X-Content-Type-Options']).toBe('nosniff');
    expect(RECOMMENDED_SECURITY_HEADERS['Strict-Transport-Security']).toContain('max-age=');
  });
});

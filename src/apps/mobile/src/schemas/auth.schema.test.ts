import { describe, it, expect } from 'vitest';
import { loginSchema, registerSchema } from './auth.schema';

describe('Zod Auth Schemas (loginSchema & registerSchema)', () => {
  it('1. loginSchema từ chối email sai hoặc mật khẩu < 4 ký tự', () => {
    expect(
      loginSchema.safeParse({ email: 'not-an-email', password: '1234' })
        .success,
    ).toBe(false);
    expect(
      loginSchema.safeParse({ email: 'vy@uth.edu.vn', password: '123' })
        .success,
    ).toBe(false);
  });

  it('2. loginSchema chấp nhận dữ liệu hợp lệ', () => {
    const parsed = loginSchema.safeParse({
      email: '  vy@uth.edu.vn  ',
      password: 'password123',
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.email).toBe('vy@uth.edu.vn');
    }
  });

  it('3. registerSchema yêu cầu username >= 2 ký tự và <= 20 ký tự', () => {
    expect(
      registerSchema.safeParse({
        username: 'A',
        email: 'vy@uth.edu.vn',
        password: '1234',
      }).success,
    ).toBe(false);

    const ok = registerSchema.safeParse({
      username: 'NganVy',
      email: 'vy@uth.edu.vn',
      password: '1234',
    });
    expect(ok.success).toBe(true);
  });
});

import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().email('Email không đúng định dạng.'),
  password: z.string().min(4, 'Mật khẩu phải từ 4 ký tự trở lên.'),
});

export const registerSchema = loginSchema.extend({
  username: z
    .string()
    .trim()
    .min(2, 'Tên người chơi phải từ 2 ký tự trở lên.')
    .max(20, 'Tên người chơi tối đa 20 ký tự.'),
});

export interface AuthFormValues {
  username?: string;
  email: string;
  password: string;
}

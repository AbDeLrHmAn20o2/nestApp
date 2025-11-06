import { z } from 'zod';

export const CreateUserZodSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export const LoginZodSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const UpdateUserZodSchema = z.object({
  email: z.string().email('Invalid email format').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export type CreateUserZodDto = z.infer<typeof CreateUserZodSchema>;
export type LoginZodDto = z.infer<typeof LoginZodSchema>;
export type UpdateUserZodDto = z.infer<typeof UpdateUserZodSchema>;

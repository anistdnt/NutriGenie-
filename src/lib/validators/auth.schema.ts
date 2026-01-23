// lib/validators/auth.schema.ts
import { z } from "zod";

/**
 * Shared password rules
 */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/\d/, "Password must contain at least one number");

/**
 * Login validation
 */
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: passwordSchema,
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Register validation
 */
export const registerSchema = z
  .object({
    email: z.string().email("Please enter a valid email"),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type RegisterInput = z.infer<typeof registerSchema>;

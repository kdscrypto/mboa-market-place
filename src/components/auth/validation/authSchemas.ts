
import { z } from "zod";

// Login schema
export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères")
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// Register schema
export const registerSchema = z.object({
  email: z.string().email("Email invalide"),
  username: z.string().min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  phone: z.string().optional(),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: "Vous devez accepter les conditions générales d'utilisation" })
  })
});

export type RegisterFormValues = z.infer<typeof registerSchema>;

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: z.string().email("Email invalide")
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

// Reset password schema
export const resetPasswordSchema = z.object({
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"]
});

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

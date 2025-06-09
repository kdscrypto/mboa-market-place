
import { z } from "zod";
import { validatePasswordStrength } from "@/services/securityService";

const passwordSchema = z.string()
  .min(1, "Le mot de passe est requis")
  .refine((password) => {
    const validation = validatePasswordStrength(password);
    return validation.isValid;
  }, {
    message: "Le mot de passe ne respecte pas les critères de sécurité requis"
  });

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "L'email est requis")
    .email("Format d'email invalide"),
  password: z.string().min(1, "Le mot de passe est requis")
});

export const registerSchema = z.object({
  email: z
    .string()
    .min(1, "L'email est requis")
    .email("Format d'email invalide"),
  password: passwordSchema,
  confirmPassword: z.string().min(1, "La confirmation est requise"),
  username: z
    .string()
    .min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères")
    .max(50, "Le nom d'utilisateur ne peut pas dépasser 50 caractères")
    .regex(/^[a-zA-Z0-9_-]+$/, "Le nom d'utilisateur ne peut contenir que des lettres, chiffres, _ et -"),
  phone: z
    .string()
    .min(1, "Le numéro de téléphone est requis")
    .regex(/^(\+237|237)?[67][0-9]{8}$/, "Format de numéro camerounais invalide"),
  acceptTerms: z
    .boolean()
    .refine((val) => val === true, "Vous devez accepter les conditions d'utilisation")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"]
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "L'email est requis")
    .email("Format d'email invalide")
});

export const resetPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string().min(1, "La confirmation est requise")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"]
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

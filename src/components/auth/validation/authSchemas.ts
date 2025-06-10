
import { z } from "zod";
import { validatePasswordStrength } from "@/services/inputValidationService";
import { validateEmailAdvanced } from "@/services/emailValidationService";
import { validateUsername, validatePhone } from "@/services/inputValidationService";

// Enhanced email validation
const emailSchema = z.string()
  .min(1, "L'email est requis")
  .email("Format d'email invalide")
  .refine((email) => {
    const validation = validateEmailAdvanced(email);
    return validation.isValid;
  }, {
    message: "Adresse email non valide ou non autorisée"
  });

// Enhanced password validation
const passwordSchema = z.string()
  .min(1, "Le mot de passe est requis")
  .refine((password) => {
    const validation = validatePasswordStrength(password);
    return validation.isValid && validation.score >= 60;
  }, {
    message: "Le mot de passe ne respecte pas les critères de sécurité requis (score minimum: 60/100)"
  });

// Enhanced username validation
const usernameSchema = z.string()
  .min(1, "Le nom d'utilisateur est requis")
  .refine((username) => {
    const validation = validateUsername(username);
    return validation.isValid;
  }, {
    message: "Nom d'utilisateur non valide"
  });

// Enhanced phone validation
const phoneSchema = z.string()
  .min(1, "Le numéro de téléphone est requis")
  .refine((phone) => {
    const validation = validatePhone(phone);
    return validation.isValid;
  }, {
    message: "Format de numéro camerounais invalide"
  });

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Le mot de passe est requis")
});

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, "La confirmation est requise"),
  username: usernameSchema,
  phone: phoneSchema,
  acceptTerms: z
    .boolean()
    .refine((val) => val === true, "Vous devez accepter les conditions d'utilisation")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"]
});

export const forgotPasswordSchema = z.object({
  email: emailSchema
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

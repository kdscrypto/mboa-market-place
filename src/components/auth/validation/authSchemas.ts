
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

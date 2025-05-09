
import { z } from "zod";

// Define validation schema using zod
export const adFormSchema = z.object({
  title: z.string()
    .min(5, { message: "Le titre doit contenir au moins 5 caractères" })
    .nonempty({ message: "Le titre est requis" }),
  
  description: z.string().optional(),
  
  category: z.string()
    .nonempty({ message: "Veuillez sélectionner une catégorie" }),
  
  region: z.string()
    .nonempty({ message: "Veuillez sélectionner une région" }),
  
  city: z.string()
    .nonempty({ message: "Veuillez sélectionner une ville" }),
  
  phone: z.string()
    .nonempty({ message: "Le numéro de téléphone est requis" })
    .regex(/^[679]\d{8}$/, { 
      message: "Format invalide. Ex: 6xxxxxxxx (9 chiffres)" 
    }),
  
  whatsapp: z.string()
    .regex(/^[679]\d{8}$|^$/, {
      message: "Format invalide. Ex: 6xxxxxxxx (9 chiffres)"
    }),
  
  price: z.string().optional().refine(val => {
    if (val === '') return true;
    const num = Number(val);
    return !isNaN(num);
  }, {
    message: "Le prix doit être un nombre"
  }),
  
  adType: z.string().default("standard"),
  
  images: z.instanceof(Array).optional()
});

// Export type based on schema
export type AdFormSchemaType = z.infer<typeof adFormSchema>;

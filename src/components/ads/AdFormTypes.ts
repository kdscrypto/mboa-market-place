
import { z } from "zod";
import { adFormSchema } from "./AdFormValidation";

export interface AdFormData {
  title: string;
  description: string;
  category: string;
  price: string;
  region: string;
  city: string;
  phone: string;
  whatsapp: string;
  adType: string;
  images: File[];
}

export type AdFormSchemaType = z.infer<typeof adFormSchema>;

export interface FormErrors {
  title?: string;
  description?: string;
  category?: string;
  price?: string;
  region?: string;
  city?: string;
  phone?: string;
  whatsapp?: string;
  images?: string;
}

// Type guard to check if a value is a File array
export const isFileArray = (value: unknown): value is File[] => {
  return Array.isArray(value) && (value.length === 0 || value[0] instanceof File);
};

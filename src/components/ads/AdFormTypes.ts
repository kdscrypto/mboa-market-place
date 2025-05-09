
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

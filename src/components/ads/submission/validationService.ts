
import { AdFormData } from "../AdFormTypes";
import { sanitizeAdData, isValidImageExtension, isValidFileSize } from "@/utils/inputSanitization";
import { AdSubmissionData } from "./types";

export const validateFormData = (formData: AdFormData): AdSubmissionData => {
  // Sanitize form data
  const sanitizedData = sanitizeAdData(formData);
  
  // Validate required fields
  if (!sanitizedData.title.trim()) {
    throw new Error("Le titre est requis");
  }
  
  if (!sanitizedData.description.trim()) {
    throw new Error("La description est requise");
  }
  
  if (!sanitizedData.phone.trim()) {
    throw new Error("Le numéro de téléphone est requis");
  }
  
  // Return the sanitized data directly since types now match
  return sanitizedData;
};

export const validateImages = (images: File[]): void => {
  if (!images || images.length === 0) return;
  
  for (const file of images) {
    if (!isValidImageExtension(file.name)) {
      throw new Error(`Format d'image non valide: ${file.name}. Utilisez JPG, PNG, GIF ou WebP.`);
    }
    
    if (!isValidFileSize(file.size, 10)) {
      throw new Error(`Image trop volumineuse: ${file.name}. Taille maximale: 10 MB.`);
    }
  }
};

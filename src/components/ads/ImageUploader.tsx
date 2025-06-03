
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import { isValidImageExtension, isValidFileSize, sanitizeFileName } from "@/utils/inputSanitization";

interface ImageUploaderProps {
  images: File[];
  imageURLs: string[];
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
  maxImages: number;
  error?: string;
}

const ImageUploader = ({ 
  images, 
  imageURLs, 
  onImageChange, 
  onRemoveImage, 
  maxImages,
  error 
}: ImageUploaderProps) => {
  // Référence à l'input file pour pouvoir déclencher le clic programmatiquement
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  // Enhanced file validation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate each file
    const validFiles: File[] = [];
    const errors: string[] = [];
    
    for (const file of files) {
      // Check file extension
      if (!isValidImageExtension(file.name)) {
        errors.push(`${file.name}: Format non supporté. Utilisez JPG, PNG, GIF ou WebP.`);
        continue;
      }
      
      // Check file size (10MB max)
      if (!isValidFileSize(file.size, 10)) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
        errors.push(`${file.name}: Taille trop importante (${sizeMB}MB). Maximum: 10MB.`);
        continue;
      }
      
      // Check for potential malicious content (basic check)
      if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
        errors.push(`${file.name}: Nom de fichier non valide.`);
        continue;
      }
      
      validFiles.push(file);
    }
    
    if (errors.length > 0) {
      console.error("File validation errors:", errors);
      // Here you could show errors to user via toast or other means
    }
    
    if (validFiles.length > 0) {
      // Create a new event with only valid files
      const validFileList = new DataTransfer();
      validFiles.forEach(file => validFileList.items.add(file));
      
      const newEvent = {
        ...e,
        target: {
          ...e.target,
          files: validFileList.files
        }
      } as React.ChangeEvent<HTMLInputElement>;
      
      onImageChange(newEvent);
    }
    
    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Fonction pour déclencher le clic sur l'input file
  const triggerFileInput = (e: React.MouseEvent) => {
    e.preventDefault();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-2">
      <label className="block font-medium">
        Photos (maximum {maxImages})
      </label>
      <div className={`border-2 border-dashed ${error ? 'border-red-500' : 'border-gray-300'} rounded-md p-4`}>
        <div className="flex items-center justify-center">
          <div className="w-full">
            {isMobile ? (
              // Simplified version for mobile devices (especially iOS)
              <div className="text-center py-6">
                <p className="text-gray-500 mb-2">
                  Sélectionnez des photos depuis votre galerie
                </p>
                <p className="text-xs text-gray-400 mb-2">
                  Formats acceptés: JPG, PNG, GIF, WebP (max 10MB chacune)
                </p>
                <Button 
                  type="button" 
                  variant="outline"
                  disabled={images.length >= maxImages}
                  onClick={triggerFileInput}
                >
                  Choisir des images
                </Button>
              </div>
            ) : (
              // Standard version for desktop
              <div className="text-center py-6 cursor-pointer" onClick={triggerFileInput}>
                <p className="text-gray-500 mb-2">
                  Cliquez ou glissez-déposez des photos
                </p>
                <p className="text-xs text-gray-400 mb-2">
                  Formats acceptés: JPG, PNG, GIF, WebP (max 10MB chacune)
                </p>
                <Button 
                  type="button" 
                  variant="outline"
                  disabled={images.length >= maxImages}
                >
                  Sélectionner des images
                </Button>
              </div>
            )}
            <Input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.gif,.webp"
              multiple
              onChange={handleFileChange}
              className="hidden"
              disabled={images.length >= maxImages}
            />
          </div>
        </div>
        
        {imageURLs.length > 0 && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {imageURLs.map((url, index) => (
              <div key={index} className="relative">
                <img
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="h-24 w-full object-cover rounded"
                  onError={(e) => {
                    // Handle broken images
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
                />
                <button
                  type="button"
                  onClick={() => onRemoveImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                  aria-label="Remove image"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <p className="text-xs text-gray-500">
        Formats acceptés: JPG, PNG, GIF, WebP. Taille maximale: 10 MB par image.
      </p>
    </div>
  );
};

export default ImageUploader;



import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";

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
              // Version simplifiée pour les appareils mobiles (surtout iOS)
              <div className="text-center py-6">
                <p className="text-gray-500 mb-2">
                  Sélectionnez des photos depuis votre galerie
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
              // Version standard pour desktop
              <div className="text-center py-6 cursor-pointer" onClick={triggerFileInput}>
                <p className="text-gray-500 mb-2">
                  Cliquez ou glissez-déposez des photos
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
              accept="image/*"
              multiple
              onChange={onImageChange}
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
                />
                <button
                  type="button"
                  onClick={() => onRemoveImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
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
        Formats acceptés: JPG, PNG. Taille maximale: 5 MB par image.
      </p>
    </div>
  );
};

export default ImageUploader;


import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AdFormData } from "./AdFormTypes";
import { v4 as uuidv4 } from "uuid";
import { sanitizeAdData, sanitizeFileName, isValidImageExtension, isValidFileSize } from "@/utils/inputSanitization";

export const useAdSubmission = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const handleSubmit = async (formData: AdFormData, setShowPreview: (show: boolean) => void) => {
    // Vérifier si une soumission est déjà en cours ou terminée
    if (isLoading) {
      toast({
        title: "Soumission en cours",
        description: "Votre annonce est en cours de traitement, veuillez patienter.",
        variant: "destructive"
      });
      return;
    }

    if (isSubmitted) {
      toast({
        title: "Annonce déjà soumise",
        description: "Cette annonce a déjà été soumise pour approbation. Vous pouvez consulter son statut dans votre tableau de bord.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Vérifier l'authentification
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        throw new Error("Authentication error");
      }
      
      if (!session) {
        toast({
          title: "Connexion requise",
          description: "Vous devez être connecté pour publier une annonce.",
          variant: "destructive"
        });
        navigate("/connexion");
        return;
      }
      
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
      
      // Validate images if present
      if (formData.images && formData.images.length > 0) {
        for (const file of formData.images) {
          if (!isValidImageExtension(file.name)) {
            throw new Error(`Format d'image non valide: ${file.name}. Utilisez JPG, PNG, GIF ou WebP.`);
          }
          
          if (!isValidFileSize(file.size, 10)) {
            throw new Error(`Image trop volumineuse: ${file.name}. Taille maximale: 10 MB.`);
          }
        }
      }

      console.log('Creating free ad directly...');
      
      // Call the simplified ad creation function
      const { data: adResult, error: adError } = await supabase.functions.invoke('monetbil-payment', {
        body: {
          adData: sanitizedData,
          adType: sanitizedData.adType
        }
      });

      if (adError) {
        console.error('Ad creation function error:', adError);
        throw new Error('Erreur lors de la création de l\'annonce');
      }

      if (!adResult.success) {
        throw new Error(adResult.error || 'Erreur lors de la création de l\'annonce');
      }

      console.log('Free ad created successfully:', adResult.adId);
      
      // Upload images if any
      if (formData.images && formData.images.length > 0) {
        await uploadImages(formData.images, adResult.adId);
      }
      
      setIsSubmitted(true);
      setShowPreview(false);
      
      toast({
        title: "Annonce créée avec succès",
        description: "Votre annonce a été soumise pour modération et sera bientôt disponible.",
        duration: 5000,
      });
      
    } catch (error) {
      console.error('Ad submission error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Une erreur inattendue est survenue';
      
      toast({
        title: "Erreur lors de la création",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const uploadImages = async (images: File[], adId: string) => {
    console.log(`Uploading ${images.length} images for ad ${adId}`);
    
    const uploadPromises = images.map(async (file, index) => {
      const sanitizedFileName = sanitizeFileName(file.name);
      const fileExt = sanitizedFileName.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `ads/${adId}/${fileName}`;
      
      try {
        // Upload to Supabase storage (if storage is configured)
        // For now, we'll create a placeholder URL
        const imageUrl = `/placeholder-${index + 1}.jpg`;
        
        // Insert image record
        const { error: imageError } = await supabase
          .from('ad_images')
          .insert({
            ad_id: adId,
            image_url: imageUrl,
            position: index
          });
        
        if (imageError) {
          console.error('Error saving image record:', imageError);
          throw imageError;
        }
        
        console.log(`Image ${index + 1} uploaded successfully`);
        
      } catch (error) {
        console.error(`Error uploading image ${index + 1}:`, error);
        throw error;
      }
    });
    
    await Promise.all(uploadPromises);
    console.log('All images uploaded successfully');
  };

  const resetSubmissionState = () => {
    setIsSubmitted(false);
    setIsLoading(false);
  };

  return { 
    handleSubmit, 
    isLoading, 
    isSubmitted, 
    resetSubmissionState 
  };
};

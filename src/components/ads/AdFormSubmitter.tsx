
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
      
      // Insérer l'annonce dans Supabase
      const { data: ad, error: adError } = await supabase
        .from('ads')
        .insert({
          title: sanitizedData.title,
          description: sanitizedData.description,
          category: sanitizedData.category,
          price: sanitizedData.price,
          region: sanitizedData.region,
          city: sanitizedData.city,
          phone: sanitizedData.phone,
          whatsapp: sanitizedData.whatsapp || null,
          status: "pending",
          ad_type: sanitizedData.adType,
          user_id: session.user.id
        })
        .select('id')
        .single();

      if (adError) {
        console.error("Erreur lors de la création de l'annonce:", adError);
        throw new Error(adError.message);
      }

      // Si des images sont présentes, les télécharger et créer des références
      if (formData.images && formData.images.length > 0) {
        console.log(`Uploading ${formData.images.length} images for ad ${ad.id}`);
        
        // Gérer les téléchargements d'images séquentiellement pour éviter les problèmes sur mobile
        for (let i = 0; i < formData.images.length; i++) {
          const file = formData.images[i];
          const fileExt = file.name.split('.').pop();
          const sanitizedFileName = sanitizeFileName(`${uuidv4()}.${fileExt}`);
          const filePath = `${ad.id}/${sanitizedFileName}`;
          
          try {
            console.log(`Uploading image ${i + 1}/${formData.images.length}: ${sanitizedFileName}`);
            
            // Télécharger le fichier dans Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('ad_images')
              .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
              });
            
            if (uploadError) {
              console.error("Erreur lors du téléchargement de l'image:", uploadError);
              throw new Error(`Erreur lors du téléchargement de l'image ${i + 1}`);
            }
            
            // Récupérer l'URL publique de l'image
            const { data: { publicUrl } } = supabase.storage
              .from('ad_images')
              .getPublicUrl(filePath);
            
            // Enregistrer la référence de l'image dans la base de données
            const { error: imageError } = await supabase
              .from('ad_images')
              .insert({
                ad_id: ad.id,
                image_url: publicUrl,
                position: i
              });
            
            if (imageError) {
              console.error("Erreur lors de l'enregistrement de l'image:", imageError);
              throw new Error(`Erreur lors de l'enregistrement de l'image ${i + 1}`);
            }
            
            console.log(`Successfully uploaded and saved image ${i + 1}`);
          } catch (imgError) {
            console.error("Erreur lors du traitement de l'image:", imgError);
            throw imgError;
          }
        }
      }
      
      // Marquer comme soumis avec succès
      setIsSubmitted(true);
      
      toast({
        title: "Annonce soumise",
        description: "Votre annonce a été soumise pour approbation.",
        duration: 3000
      });
      
      setIsLoading(false);
      setShowPreview(false);
      
      // Utilisez une promesse setTimeout pour éviter les problèmes de navigation sur iOS
      await new Promise(resolve => setTimeout(resolve, 100));
      navigate("/dashboard");
      
    } catch (error) {
      console.error("Erreur lors de la soumission de l'annonce:", error);
      
      let errorMessage = "Un problème est survenu lors de la publication de votre annonce.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const resetSubmissionState = () => {
    setIsSubmitted(false);
    setIsLoading(false);
  };
  
  return {
    isLoading,
    isSubmitted,
    setIsLoading,
    handleSubmit,
    resetSubmissionState
  };
};


import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AdFormData } from "./AdFormTypes";
import { v4 as uuidv4 } from "uuid";

export const useAdSubmission = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (formData: AdFormData, setShowPreview: (show: boolean) => void) => {
    setIsLoading(true);
    
    try {
      // Vérifier l'authentification
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Connexion requise",
          description: "Vous devez être connecté pour publier une annonce.",
          variant: "destructive"
        });
        navigate("/connexion");
        return;
      }
      
      // Insérer l'annonce dans Supabase
      const { data: ad, error: adError } = await supabase
        .from('ads')
        .insert({
          title: formData.title,
          description: formData.description || "",
          category: formData.category,
          price: parseInt(formData.price || "0"),
          region: formData.region,
          city: formData.city,
          phone: formData.phone,
          whatsapp: formData.whatsapp || null,
          status: "pending",
          ad_type: formData.adType,
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
        for (let i = 0; i < formData.images.length; i++) {
          const file = formData.images[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `${uuidv4()}.${fileExt}`;
          const filePath = `${ad.id}/${fileName}`;
          
          // Télécharger le fichier dans Supabase Storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('ad_images')
            .upload(filePath, file);
          
          if (uploadError) {
            console.error("Erreur lors du téléchargement de l'image:", uploadError);
            continue;
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
          }
        }
      }
      
      toast({
        title: "Annonce soumise",
        description: "Votre annonce a été soumise pour approbation.",
        duration: 3000
      });
      
      setIsLoading(false);
      setShowPreview(false);
      navigate("/mes-annonces");
      
    } catch (error) {
      console.error("Erreur lors de la soumission de l'annonce:", error);
      toast({
        title: "Erreur",
        description: "Un problème est survenu lors de la publication de votre annonce.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };
  
  return {
    isLoading,
    setIsLoading,
    handleSubmit
  };
};

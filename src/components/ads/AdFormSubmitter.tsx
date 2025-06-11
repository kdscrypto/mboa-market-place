
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { AdFormData } from "./AdFormTypes";
import { SubmissionState } from "./submission/types";
import { validateUserSession } from "./submission/authService";
import { validateFormData, validateImages } from "./submission/validationService";
import { calculatePremiumExpiration, getPremiumExpirationDate } from "./submission/premiumExpirationUtils";
import { createAdWithPayment } from "./submission/adCreationService";
import { uploadAdImages } from "./submission/imageUploadService";

export const useAdSubmission = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [submissionState, setSubmissionState] = useState<SubmissionState>({
    isLoading: false,
    isSubmitted: false
  });
  
  const handleSubmit = async (formData: AdFormData, setShowPreview: (show: boolean) => void) => {
    // Check if submission is already in progress or completed
    if (submissionState.isLoading) {
      toast({
        title: "Soumission en cours",
        description: "Votre annonce est en cours de traitement, veuillez patienter.",
        variant: "destructive"
      });
      return;
    }

    if (submissionState.isSubmitted) {
      toast({
        title: "Annonce déjà soumise",
        description: "Cette annonce a déjà été soumise pour approbation. Vous pouvez consulter son statut dans votre tableau de bord.",
        variant: "destructive"
      });
      return;
    }
    
    setSubmissionState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Validate user session
      const session = await validateUserSession();
      
      if (!session) {
        toast({
          title: "Connexion requise",
          description: "Vous devez être connecté pour publier une annonce.",
          variant: "destructive"
        });
        navigate("/connexion");
        return;
      }
      
      // Validate form data and images
      const validatedData = validateFormData(formData);
      validateImages(formData.images);

      // Calculate premium expiration
      const premiumExpiresAt = calculatePremiumExpiration(validatedData.adType);
      const adDataWithExpiration = {
        ...validatedData,
        premiumExpiresAt
      };

      // Create the ad
      const result = await createAdWithPayment(adDataWithExpiration);
      
      // Upload images if any
      if (formData.images && formData.images.length > 0) {
        await uploadAdImages(formData.images, result.adId!);
      }
      
      setSubmissionState(prev => ({ ...prev, isSubmitted: true }));
      setShowPreview(false);
      
      // Handle different result types
      if (result.requiresPayment && result.paymentUrl) {
        // For premium ads, redirect to Lygos payment
        toast({
          title: "Redirection vers le paiement",
          description: "Vous allez être redirigé vers Lygos pour effectuer le paiement de votre annonce premium.",
          duration: 3000,
        });
        
        console.log('Redirecting to Lygos payment URL:', result.paymentUrl);
        console.log('Transaction ID:', result.transactionId);
        
        // Store transaction info for tracking
        if (result.transactionId) {
          sessionStorage.setItem('pendingPayment', JSON.stringify({
            transactionId: result.transactionId,
            adId: result.adId,
            paymentUrl: result.paymentUrl
          }));
        }
        
        // Redirect to Lygos payment (temporary internal URL for now)
        setTimeout(() => {
          window.location.href = result.paymentUrl!;
        }, 2000);
      } else {
        const premiumExpirationDate = getPremiumExpirationDate(validatedData.adType);
        const successMessage = validatedData.adType === 'standard' 
          ? "Votre annonce a été soumise pour modération et sera bientôt disponible."
          : `Votre annonce premium a été créée et sera mise en avant jusqu'au ${premiumExpirationDate?.toLocaleDateString('fr-FR')}.`;
        
        toast({
          title: "Annonce créée avec succès",
          description: successMessage,
          duration: 5000,
        });
        
        // Navigate to dashboard after short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
      
    } catch (error) {
      console.error('Ad submission error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Une erreur inattendue est survenue';
      
      toast({
        title: "Erreur lors de la création",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setSubmissionState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const resetSubmissionState = () => {
    setSubmissionState({
      isLoading: false,
      isSubmitted: false
    });
  };

  return { 
    handleSubmit, 
    isLoading: submissionState.isLoading, 
    isSubmitted: submissionState.isSubmitted, 
    resetSubmissionState 
  };
};

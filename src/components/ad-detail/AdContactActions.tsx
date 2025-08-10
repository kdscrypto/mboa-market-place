
import React from "react";
import { useNavigate } from "react-router-dom";
import { Ad } from "@/types/adTypes";
import { Button } from "@/components/ui/button";
import ContactSellerButton from "@/components/messaging/ContactSellerButton";

interface AdContactActionsProps {
  ad: Ad;
  isLoggedIn: boolean;
  isCurrentUserAuthor: boolean;
  adId: string;
}

const AdContactActions: React.FC<AdContactActionsProps> = ({ 
  ad, 
  isLoggedIn, 
  isCurrentUserAuthor, 
  adId 
}) => {
  const navigate = useNavigate();

  const handleLoginRedirect = () => {
    navigate("/connexion", { state: { from: `/annonce/${adId}` } });
  };

  if (isLoggedIn) {
    return (
      <>
        <button className="w-full bg-mboa-green hover:bg-mboa-green/90 text-white py-3 rounded-md transition-colors">
          Appeler {ad.phone}
        </button>
        {ad.whatsapp && (
          <a
            href={`https://wa.me/${ad.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center bg-mboa-green/10 hover:bg-mboa-green/20 text-mboa-green py-3 rounded-md transition-colors"
          >
            WhatsApp
          </a>
        )}
        
        {!isCurrentUserAuthor && (
          <ContactSellerButton ad={ad} />
        )}
      </>
    );
  }

  return (
    <div className="theme-bg-elevated theme-border border rounded-lg p-4 text-center">
      <p className="theme-text-secondary mb-3">
        Connectez-vous pour voir les coordonnées du vendeur et le contacter
      </p>
      <Button
        onClick={handleLoginRedirect}
        className="bg-mboa-orange hover:bg-mboa-orange/90 text-white"
      >
        Se connecter / S'inscrire
      </Button>
    </div>
  );
};

export default AdContactActions;


import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Ad } from "@/types/adTypes";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
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

  // Check if user can view contact information using secure RPC function
  const { data: canViewContact, isLoading: contactLoading } = useQuery({
    queryKey: ['canViewContact', adId],
    queryFn: async () => {
      if (!isLoggedIn) return false;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase.rpc('can_view_contact_info', {
        p_ad_id: adId,
        p_user_id: user.id
      });

      if (error) {
        console.error('Error checking contact permissions:', error);
        return false;
      }

      return data || false;
    },
    enabled: isLoggedIn && !!adId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  if (isLoggedIn) {
    if (contactLoading) {
      return (
        <div className="space-y-3">
          <div className="w-full h-12 bg-gray-200 animate-pulse rounded-md"></div>
          <div className="w-full h-12 bg-gray-200 animate-pulse rounded-md"></div>
        </div>
      );
    }

    return (
      <>
        {canViewContact ? (
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
          </>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-blue-800 text-sm mb-3">
              Démarrez une conversation avec le vendeur pour accéder à ses informations de contact.
            </p>
            <p className="text-xs text-blue-600">
              Cette protection garantit la sécurité des données personnelles.
            </p>
          </div>
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

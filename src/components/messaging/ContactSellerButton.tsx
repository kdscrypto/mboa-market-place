
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { MessageCircle } from "lucide-react";
import { createConversation } from "@/services/messageService";
import { Ad } from "@/types/adTypes";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ContactSellerButtonProps {
  ad: Ad;
}

const ContactSellerButton: React.FC<ContactSellerButtonProps> = ({ ad }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  
  const handleContact = async () => {
    // Vérifier l'authentification
    const { data } = await supabase.auth.getSession();
    
    if (!data || !data.session) {
      // Rediriger vers la page de connexion avec l'URL actuelle comme destination de retour
      navigate("/connexion", { state: { from: `/annonce/${ad.id}` } });
      return;
    }
    
    // Vérifier si l'utilisateur est le vendeur
    if (data.session.user.id === ad.user_id) {
      toast.error("Vous ne pouvez pas contacter votre propre annonce.");
      return;
    }
    
    // Ouvrir la boîte de dialogue
    setIsOpen(true);
  };
  
  const handleSend = async () => {
    if (!message.trim()) return;
    
    setSending(true);
    try {
      const { conversation, error } = await createConversation(
        ad.id,
        ad.user_id,
        message.trim()
      );
      
      if (error || !conversation) {
        toast.error(error || "Erreur lors de la création de la conversation");
        setSending(false);
        return;
      }
      
      // Fermer la boîte de dialogue et rediriger vers la conversation
      setIsOpen(false);
      setMessage("");
      navigate(`/messages/${conversation.id}`);
      toast.success("Message envoyé avec succès");
    } catch (error) {
      console.error("Erreur lors de la création de la conversation:", error);
      toast.error("Une erreur s'est produite lors de l'envoi du message");
    } finally {
      setSending(false);
    }
  };
  
  return (
    <>
      <Button
        onClick={handleContact}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
      >
        <MessageCircle size={18} />
        Contacter le vendeur
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Contacter le vendeur</DialogTitle>
            <DialogDescription>
              Envoyez un message concernant l'annonce "{ad.title}"
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Écrivez votre message ici..."
              className="min-h-[100px]"
              disabled={sending}
            />
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={sending}
            >
              Annuler
            </Button>
            <Button 
              type="button" 
              onClick={handleSend}
              disabled={!message.trim() || sending}
              className="bg-mboa-orange hover:bg-mboa-orange/90"
            >
              {sending ? "Envoi en cours..." : "Envoyer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ContactSellerButton;

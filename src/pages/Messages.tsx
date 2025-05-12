
import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMessaging } from "@/hooks/useMessaging";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ConversationList from "@/components/messaging/ConversationList";
import ConversationView from "@/components/messaging/ConversationView";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const Messages: React.FC = () => {
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const {
    conversations,
    currentConversation,
    messages,
    loading,
    messagesLoading,
    loadConversations,
    loadMessages,
    sendMessage
  } = useMessaging();

  // Vérifier si l'utilisateur est connecté
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/connexion", { 
          state: { from: `/messages${conversationId ? `/${conversationId}` : ''}` }
        });
      }
    };
    
    checkAuth();
  }, [conversationId, navigate]);

  // Charger la conversation sélectionnée depuis l'URL
  useEffect(() => {
    if (conversationId) {
      loadMessages(conversationId);
    }
  }, [conversationId, loadMessages]);

  // Gérer la sélection d'une conversation
  const handleSelectConversation = (id: string) => {
    navigate(`/messages/${id}`);
  };

  // Obtenir les détails de la conversation actuelle
  const currentConversationDetails = conversations.find(
    conv => conv.id === currentConversation
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow mboa-container py-6">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <h2 className="text-xl font-bold p-4 border-b">Messagerie</h2>
          
          <div className="flex h-[600px] max-h-[70vh]">
            {/* Liste des conversations */}
            <div className="w-1/3 border-r">
              <ConversationList
                conversations={conversations}
                currentConversation={currentConversation}
                onSelectConversation={handleSelectConversation}
                loading={loading}
              />
            </div>
            
            {/* Vue de la conversation */}
            <div className="w-2/3 flex flex-col">
              {currentConversation ? (
                <ConversationView
                  messages={messages}
                  onSendMessage={(content) => sendMessage(currentConversation, content)}
                  loading={messagesLoading}
                  adTitle={currentConversationDetails?.ad_title}
                  emptyState={
                    <div className="text-center p-6">
                      <MessageCircle className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                      <h3 className="text-lg font-medium">Commencer la conversation</h3>
                      <p className="text-gray-500 mt-1">
                        Envoyez un message pour démarrer la conversation
                      </p>
                    </div>
                  }
                />
              ) : (
                <div className="flex flex-col justify-center items-center h-full">
                  <MessageCircle className="h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium">Sélectionnez une conversation</h3>
                  <p className="text-gray-500 mt-1 mb-4 text-center">
                    Choisissez une conversation dans la liste ou contactez un vendeur
                  </p>
                  <Button
                    onClick={() => navigate("/")}
                    className="bg-mboa-orange hover:bg-mboa-orange/90"
                  >
                    Parcourir les annonces
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Messages;

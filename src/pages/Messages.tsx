
import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMessaging } from "@/hooks/useMessaging";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ConversationList from "@/components/messaging/ConversationList";
import ConversationView from "@/components/messaging/ConversationView";
import { MessageCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Messages: React.FC = () => {
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const {
    conversations,
    currentConversation,
    messages,
    loading,
    messagesLoading,
    error,
    loadConversations,
    loadMessages,
    sendMessage
  } = useMessaging();

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Vous devez être connecté pour accéder à la messagerie");
        navigate("/connexion", { 
          state: { from: `/messages${conversationId ? `/${conversationId}` : ''}` }
        });
      }
    };
    
    checkAuth();
  }, [conversationId, navigate]);

  // Load selected conversation from URL
  useEffect(() => {
    if (conversationId) {
      console.log("Chargement de la conversation depuis l'URL:", conversationId);
      loadMessages(conversationId);
    }
  }, [conversationId, loadMessages]);

  // Handle conversation selection
  const handleSelectConversation = (id: string) => {
    console.log("Sélection de la conversation:", id);
    navigate(`/messages/${id}`);
  };

  // Handle sending a message
  const handleSendMessage = async (content: string): Promise<void> => {
    if (currentConversation) {
      await sendMessage(currentConversation, content);
    }
  };

  // Get current conversation details
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
            {/* Conversation list */}
            <div className="w-1/3 border-r">
              <ConversationList
                conversations={conversations}
                currentConversation={currentConversation}
                onSelectConversation={handleSelectConversation}
                loading={loading}
              />
            </div>
            
            {/* Conversation view */}
            <div className="w-2/3 flex flex-col">
              {error && (
                <div className="flex flex-col justify-center items-center h-full text-center p-6">
                  <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
                  <h3 className="text-lg font-medium">Une erreur est survenue</h3>
                  <p className="text-gray-500 mt-1 mb-4">{error}</p>
                  <Button
                    onClick={() => currentConversation ? loadMessages(currentConversation) : loadConversations()}
                    className="bg-mboa-orange hover:bg-mboa-orange/90"
                  >
                    Réessayer
                  </Button>
                </div>
              )}

              {!error && currentConversation ? (
                <ConversationView
                  messages={messages}
                  onSendMessage={handleSendMessage}
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
              ) : !error && (
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

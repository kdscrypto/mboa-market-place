import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMessaging } from "@/hooks/useMessaging";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ConversationList from "@/components/messaging/ConversationList";
import ConversationView from "@/components/messaging/ConversationView";
import { MessageCircle, AlertCircle, Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Messages: React.FC = () => {
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [globalRetryCount, setGlobalRetryCount] = useState(0);
  
  const {
    conversations,
    currentConversation,
    messages,
    loading,
    messagesLoading,
    error,
    loadConversations,
    loadMessages,
    sendMessage,
    retryLoadMessages
  } = useMessaging();

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (!data.session) {
          setIsAuthenticated(false);
          toast.error("Vous devez être connecté pour accéder à la messagerie");
          navigate("/connexion", { 
            state: { from: `/messages${conversationId ? `/${conversationId}` : ''}` }
          });
          return;
        }
        
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Erreur lors de la vérification de l'authentification:", error);
        toast.error("Erreur de vérification de l'authentification");
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
  }, [conversationId, navigate]);

  // Load selected conversation from URL
  useEffect(() => {
    if (isAuthenticated && conversationId) {
      console.log("Chargement de la conversation depuis l'URL:", conversationId);
      loadMessages(conversationId);
    }
  }, [conversationId, loadMessages, isAuthenticated]);

  // Handle conversation selection
  const handleSelectConversation = useCallback((id: string) => {
    console.log("Sélection de la conversation:", id);
    navigate(`/messages/${id}`);
  }, [navigate]);

  // Handle sending a message
  const handleSendMessage = useCallback(async (content: string): Promise<void> => {
    if (!currentConversation) {
      toast.error("Aucune conversation sélectionnée");
      return;
    }
    
    try {
      await sendMessage(currentConversation, content);
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      toast.error("Erreur lors de l'envoi du message");
    }
  }, [currentConversation, sendMessage]);

  // Global retry handler - increments counter to force full reload of dependencies
  const handleGlobalRetry = useCallback(() => {
    setGlobalRetryCount(prev => prev + 1);
    loadConversations();
    
    if (currentConversation) {
      loadMessages(currentConversation);
    }
  }, [currentConversation, loadConversations, loadMessages]);

  // Get current conversation details
  const currentConversationDetails = conversations.find(
    conv => conv.id === currentConversation
  );

  // If still checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow mboa-container py-6">
          <div className="flex justify-center items-center h-96">
            <Loader2Icon className="h-8 w-8 animate-spin text-mboa-orange" />
            <span className="ml-2">Vérification de l'authentification...</span>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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
              {error && !currentConversation && (
                <div className="flex flex-col justify-center items-center h-full text-center p-6">
                  <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
                  <h3 className="text-lg font-medium">Une erreur est survenue</h3>
                  <p className="text-gray-500 mt-1 mb-4">{error}</p>
                  <Button
                    onClick={handleGlobalRetry}
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
                  error={error}
                  onRetry={handleGlobalRetry}
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

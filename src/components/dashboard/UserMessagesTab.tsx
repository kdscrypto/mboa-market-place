
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Clock, User } from "lucide-react";
import { fetchUserConversations } from "@/services/messaging/conversationService";
import { Conversation } from "@/services/messaging/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

const UserMessagesTab = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConversations = async () => {
      setLoading(true);
      try {
        const data = await fetchUserConversations();
        setConversations(data);
      } catch (error) {
        console.error("Erreur lors du chargement des conversations:", error);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center p-8">
          <div className="animate-spin h-6 w-6 border-2 border-mboa-orange border-t-transparent rounded-full"></div>
          <span className="ml-2">Chargement des messages...</span>
        </CardContent>
      </Card>
    );
  }

  if (conversations.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <MessageCircle className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-medium mb-2">Aucune conversation</h3>
          <p className="text-gray-500 mb-6">
            Vous n'avez pas encore de conversations
          </p>
          <Button
            onClick={() => navigate("/messages")}
            className="bg-mboa-orange hover:bg-mboa-orange/90"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Voir la messagerie
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Mes conversations ({conversations.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {conversations.slice(0, 5).map((conversation) => (
            <div key={conversation.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <img
                    className="h-12 w-12 rounded-lg object-cover flex-shrink-0"
                    src={conversation.ad_image || "/placeholder.svg"}
                    alt={conversation.ad_title || "Annonce"}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">
                      {conversation.ad_title || "Annonce sans titre"}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                      <Clock className="h-3 w-3" />
                      {format(new Date(conversation.last_message_at), "d MMM yyyy 'à' HH:mm", { locale: fr })}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {(conversation.unread_count || 0) > 0 ? (
                        <Badge className="bg-mboa-orange text-white">
                          {conversation.unread_count} non lu(s)
                        </Badge>
                      ) : (
                        <Badge variant="outline">Lu</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => navigate(`/messages?conversation=${conversation.id}`)}
                  size="sm"
                  className="bg-mboa-orange hover:bg-mboa-orange/90 flex-shrink-0"
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Voir
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        {conversations.length > 5 && (
          <div className="p-4 border-t bg-gray-50">
            <Button
              onClick={() => navigate("/messages")}
              variant="outline"
              className="w-full"
            >
              Voir toutes les conversations ({conversations.length})
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserMessagesTab;

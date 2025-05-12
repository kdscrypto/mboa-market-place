
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
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
      <div className="flex justify-center items-center p-6">
        <div className="animate-spin h-6 w-6 border-2 border-mboa-orange border-t-transparent rounded-full"></div>
        <span className="ml-2">Chargement des messages...</span>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-10">
        <MessageCircle className="h-12 w-12 mx-auto text-gray-300 mb-3" />
        <h3 className="text-lg font-medium">Aucune conversation</h3>
        <p className="text-sm text-gray-500 mt-1 mb-4">
          Vous n'avez pas encore de conversations
        </p>
        <Button
          onClick={() => navigate("/messages")}
          className="bg-mboa-orange hover:bg-mboa-orange/90"
        >
          Voir la messagerie
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Annonce
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Dernier message
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Statut
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {conversations.map((conversation) => (
            <tr key={conversation.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <img
                      className="h-10 w-10 rounded-md object-cover"
                      src={conversation.ad_image}
                      alt={conversation.ad_title}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {conversation.ad_title}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {format(new Date(conversation.last_message_at), "d MMM yyyy 'à' HH:mm", { locale: fr })}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  {conversation.unread_count > 0 && (
                    <Badge className="bg-mboa-orange">
                      {conversation.unread_count} non lu(s)
                    </Badge>
                  )}
                  {conversation.unread_count === 0 && (
                    <span className="text-sm text-gray-500">Lu</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Button
                  onClick={() => navigate(`/messages/${conversation.id}`)}
                  size="sm"
                  className="bg-mboa-orange hover:bg-mboa-orange/90"
                >
                  <MessageCircle className="h-4 w-4 mr-1" /> Voir
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserMessagesTab;

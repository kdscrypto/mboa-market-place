
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Ad {
  id: string;
  title: string;
  price: number;
  status: string;
  created_at: string;
  imageUrl: string;
}

interface UserAdsTableProps {
  ads: Ad[];
  tabValue: string;
}

const UserAdsTable = ({ ads, tabValue }: UserAdsTableProps) => {
  const { toast } = useToast();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "sold":
        return <Badge className="bg-blue-500">Vendue</Badge>;
      case "expired":
        return <Badge className="bg-gray-500">Expirée</Badge>;
      case "pending":
        return <Badge className="bg-amber-500 flex items-center gap-1">
          <Clock className="h-3 w-3" /> En attente
        </Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ads')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: "Annonce supprimée",
        description: "Votre annonce a été supprimée avec succès.",
        duration: 3000
      });
    } catch (error) {
      console.error("Erreur lors de la suppression de l'annonce:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'annonce.",
        variant: "destructive"
      });
    }
  };
  
  const handleMarkAsSold = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ads')
        .update({ status: 'sold' })
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: "Annonce mise à jour",
        description: "Votre annonce a été marquée comme vendue.",
        duration: 3000
      });
    } catch (error) {
      console.error("Erreur lors du marquage de l'annonce comme vendue:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'annonce.",
        variant: "destructive"
      });
    }
  };

  const filteredAds = ads.filter(ad => tabValue === "all" || ad.status === tabValue);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Annonce
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Prix
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Statut
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredAds.map((ad) => (
            <tr key={ad.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <img 
                      className="h-10 w-10 rounded-md object-cover" 
                      src={ad.imageUrl}
                      alt={ad.title}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                      }}
                    />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      <Link to={`/annonce/${ad.id}`} className="hover:underline">
                        {ad.title}
                      </Link>
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {new Intl.NumberFormat('fr-FR').format(ad.price)} XAF
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(ad.status)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(ad.created_at).toLocaleDateString('fr-FR')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                >
                  <Link to={`/modifier-annonce/${ad.id}`}>
                    <Edit className="h-4 w-4 mr-1" /> Modifier
                  </Link>
                </Button>
                
                {ad.status === "active" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMarkAsSold(ad.id)}
                  >
                    Marquer comme vendu
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(ad.id)}
                  className="text-red-500 border-red-300 hover:bg-red-50"
                >
                  <Trash className="h-4 w-4 mr-1" /> Supprimer
                </Button>
              </td>
            </tr>
          ))}
            
          {filteredAds.length === 0 && (
            <tr>
              <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                Aucune annonce trouvée dans cette catégorie.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserAdsTable;

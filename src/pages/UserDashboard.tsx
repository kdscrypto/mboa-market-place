
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Mock data - In a real app, these would come from Supabase
const userAds = [
  {
    id: "1",
    title: "Samsung Galaxy S21 Ultra - Comme neuf",
    price: 350000,
    status: "active",
    createdAt: "2023-05-15T12:00:00Z",
    imageUrl: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "2",
    title: "iPhone 13 Pro Max - 256GB",
    price: 450000,
    status: "sold",
    createdAt: "2023-04-10T14:30:00Z",
    imageUrl: "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "3",
    title: "Ordinateur Portable HP Spectre",
    price: 650000,
    status: "expired",
    createdAt: "2023-03-22T09:15:00Z",
    imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
  },
];

const UserDashboard = () => {
  const { toast } = useToast();
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "sold":
        return <Badge className="bg-blue-500">Vendue</Badge>;
      case "expired":
        return <Badge className="bg-gray-500">Expirée</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  const handleDelete = (id: string) => {
    // In a real app, this would connect to Supabase to delete the ad
    console.log("Delete ad", id);
    toast({
      title: "Fonctionnalité à venir",
      description: "La suppression d'annonces sera implémentée avec Supabase.",
      duration: 3000
    });
  };
  
  const handleMarkAsSold = (id: string) => {
    // In a real app, this would connect to Supabase to update the ad status
    console.log("Mark as sold", id);
    toast({
      title: "Fonctionnalité à venir",
      description: "Le marquage comme vendu sera implémenté avec Supabase.",
      duration: 3000
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-8 bg-mboa-gray">
        <div className="mboa-container max-w-5xl">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">Mon tableau de bord</h1>
              <Button 
                asChild 
                className="mt-4 md:mt-0 bg-mboa-orange hover:bg-mboa-orange/90"
              >
                <Link to="/publier-annonce">
                  Publier une nouvelle annonce
                </Link>
              </Button>
            </div>
            
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="all">Toutes</TabsTrigger>
                <TabsTrigger value="active">Actives</TabsTrigger>
                <TabsTrigger value="sold">Vendues</TabsTrigger>
                <TabsTrigger value="expired">Expirées</TabsTrigger>
              </TabsList>
              
              {["all", "active", "sold", "expired"].map((tabValue) => (
                <TabsContent key={tabValue} value={tabValue}>
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
                        {userAds
                          .filter(ad => tabValue === "all" || ad.status === tabValue)
                          .map((ad) => (
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
                                {new Date(ad.createdAt).toLocaleDateString('fr-FR')}
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
                          
                          {userAds.filter(ad => tabValue === "all" || ad.status === tabValue).length === 0 && (
                            <tr>
                              <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                                Aucune annonce trouvée dans cette catégorie.
                              </td>
                            </tr>
                          )}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default UserDashboard;

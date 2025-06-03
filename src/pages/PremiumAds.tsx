
import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { fetchPremiumAds } from "@/services/trendingService";
import { Ad } from "@/types/adTypes";
import AdCard from "@/components/AdCard";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import PremiumBadge from "@/components/PremiumBadge";
import { toast } from "@/components/ui/use-toast";

const PremiumAds = () => {
  const [premiumAds, setPremiumAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);

  useEffect(() => {
    loadPremiumAds();
  }, []);

  const loadPremiumAds = async () => {
    setIsLoading(true);
    setError(false);
    try {
      console.log("Loading all premium ads...");
      const ads = await fetchPremiumAds(50); // Load more ads for the dedicated page
      console.log("Premium ads loaded:", ads.length);
      setPremiumAds(ads);
    } catch (err) {
      console.error("Error loading premium ads:", err);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setIsRetrying(true);
    
    const retryLoad = async () => {
      try {
        const ads = await fetchPremiumAds(50);
        setPremiumAds(ads);
        setError(false);
        toast({
          description: "Données rafraîchies avec succès",
        });
      } catch (err) {
        console.error("Error reloading premium ads:", err);
        setError(true);
        toast({
          description: "Impossible de charger les annonces",
          variant: "destructive",
        });
      } finally {
        setIsRetrying(false);
      }
    };
    
    retryLoad();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        <div className="mboa-container py-6">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl font-bold">Annonces Premium</h1>
              <PremiumBadge />
            </div>
            <p className="text-gray-600">
              Découvrez toutes nos annonces premium mises en avant
            </p>
          </div>

          {/* Content */}
          <div className="bg-white border rounded-lg p-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-mboa-orange" />
                <span className="ml-2">Chargement des annonces premium...</span>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="flex justify-center mb-4">
                  <AlertCircle className="h-12 w-12 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Une erreur s'est produite</h3>
                <p className="mb-4 text-gray-600">Impossible de charger les annonces premium.</p>
                
                <Button 
                  onClick={handleRetry}
                  variant="outline"
                  className="flex items-center gap-2"
                  disabled={isRetrying}
                >
                  {isRetrying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Chargement...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      Réessayer
                    </>
                  )}
                </Button>
              </div>
            ) : premiumAds.length === 0 ? (
              <div className="text-center py-8">
                <h3 className="text-lg font-semibold mb-2">Aucune annonce premium</h3>
                <p className="text-gray-600">
                  Aucune annonce premium n'est disponible pour le moment.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <p className="text-gray-600">
                    {premiumAds.length} annonce{premiumAds.length > 1 ? 's' : ''} premium trouvée{premiumAds.length > 1 ? 's' : ''}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {premiumAds.map((ad) => (
                    <AdCard
                      key={ad.id}
                      id={ad.id}
                      title={ad.title}
                      price={ad.price}
                      location={{
                        city: ad.city,
                        region: ad.region
                      }}
                      imageUrl={ad.imageUrl}
                      createdAt={new Date(ad.created_at)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PremiumAds;

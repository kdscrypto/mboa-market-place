
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Ad } from "@/types/adTypes";
import { Button } from "@/components/ui/button";
import { Phone, MessageSquareText } from "lucide-react";

const AdDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [images, setImages] = useState<Array<{ image_url: string }>>([]);
  const [selectedImage, setSelectedImage] = useState<string>("");

  useEffect(() => {
    const fetchAdDetail = async () => {
      setLoading(true);
      try {
        // Fetch ad details
        const { data: adData, error: adError } = await supabase
          .from("ads")
          .select("*")
          .eq("id", id)
          .eq("status", "approved")
          .single();

        if (adError) {
          console.error("Error fetching ad details:", adError);
          return;
        }

        // Fetch images for the ad
        const { data: imageData, error: imageError } = await supabase
          .from("ad_images")
          .select("image_url")
          .eq("ad_id", id)
          .order("position", { ascending: true });

        if (imageError) {
          console.error("Error fetching ad images:", imageError);
        }

        setAd(adData as Ad);
        if (imageData && imageData.length > 0) {
          setImages(imageData);
          setSelectedImage(imageData[0].image_url);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAdDetail();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-mboa-orange" />
          <span className="ml-2">Chargement de l'annonce...</span>
        </main>
        <Footer />
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex justify-center items-center flex-col">
          <h2 className="text-2xl font-bold mb-4">Annonce non trouvée</h2>
          <p className="text-gray-500">Cette annonce n'existe pas ou a été supprimée.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-8">
        <div className="mboa-container">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
              {/* Image Gallery */}
              <div>
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                  <img
                    src={selectedImage || "/placeholder.svg"}
                    alt={ad.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder.svg";
                    }}
                  />
                </div>
                {images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {images.map((img, index) => (
                      <div
                        key={index}
                        className={`aspect-square rounded-md cursor-pointer overflow-hidden ${
                          selectedImage === img.image_url
                            ? "ring-2 ring-mboa-orange"
                            : "hover:opacity-80"
                        }`}
                        onClick={() => setSelectedImage(img.image_url)}
                      >
                        <img
                          src={img.image_url}
                          alt={`${ad.title} - image ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder.svg";
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Ad Details */}
              <div>
                <div className="mb-6">
                  <h1 className="text-2xl font-bold mb-2">{ad.title}</h1>
                  <p className="text-3xl font-bold text-mboa-orange">
                    {new Intl.NumberFormat("fr-FR").format(ad.price)} XAF
                  </p>
                  <div className="flex items-center text-gray-500 mt-2">
                    <span>{ad.city}, {ad.region}</span>
                    <span className="mx-2">•</span>
                    <span>
                      {new Date(ad.created_at).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-2">Description</h2>
                  <p className="text-gray-700 whitespace-pre-line">
                    {ad.description}
                  </p>
                </div>

                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-2">Catégorie</h2>
                  <div className="inline-block bg-gray-100 text-gray-800 rounded-full px-3 py-1">
                    {ad.category}
                  </div>
                </div>

                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-2">Contact</h2>
                  <div className="flex flex-col gap-3">
                    <Button className="flex items-center gap-2">
                      <Phone size={18} />
                      <span>{ad.phone}</span>
                    </Button>
                    {ad.whatsapp && (
                      <Button
                        variant="outline"
                        className="flex items-center gap-2 border-green-500 text-green-600 hover:bg-green-50"
                      >
                        <MessageSquareText size={18} />
                        <span>WhatsApp: {ad.whatsapp}</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdDetail;

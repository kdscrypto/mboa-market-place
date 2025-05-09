
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdFormFields from "@/components/ads/AdFormFields";
import AdPlanSelector from "@/components/ads/AdPlanSelector";
import ImageUploader from "@/components/ads/ImageUploader";
import AdPreviewDialog from "@/components/ads/AdPreviewDialog";
import { AdFormData } from "@/components/ads/AdFormTypes";
import { cities } from "@/components/ads/LocationData";

const CreateAd = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<AdFormData>({
    title: "",
    description: "",
    category: "",
    price: "",
    region: "",
    city: "",
    phone: "",
    whatsapp: "",
    adType: "standard",
    images: []
  });
  const [imageURLs, setImageURLs] = useState<string[]>([]);
  const [citiesList, setCitiesList] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const maxImages = 5;
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
    
    // If region changes, update cities list
    if (name === "region") {
      const selectedRegion = regions.find(r => r.id.toString() === value)?.slug;
      if (selectedRegion && selectedRegion in cities) {
        setCitiesList(cities[selectedRegion as keyof typeof cities]);
      } else {
        setCitiesList([]);
      }
      // Reset city when region changes
      setFormData(prev => ({
        ...prev,
        [name]: value,
        city: ""
      }));
    }
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    // Check if adding these files would exceed the limit
    if (formData.images.length + files.length > maxImages) {
      toast({
        title: "Trop d'images",
        description: `Vous pouvez télécharger un maximum de ${maxImages} images.`,
        variant: "destructive"
      });
      return;
    }
    
    // Add new files to the state
    const newFiles = Array.from(files);
    setFormData({
      ...formData,
      images: [...formData.images, ...newFiles]
    });
    
    // Create URLs for preview
    const newImageURLs = newFiles.map(file => URL.createObjectURL(file));
    setImageURLs([...imageURLs, ...newImageURLs]);
  };
  
  const removeImage = (index: number) => {
    // Remove image from both arrays
    const newImages = formData.images.filter((_, i) => i !== index);
    const newImageURLs = imageURLs.filter((_, i) => i !== index);
    
    setFormData({
      ...formData,
      images: newImages
    });
    setImageURLs(newImageURLs);
  };

  const handlePreview = (e: React.FormEvent) => {
    e.preventDefault();
    setShowPreview(true);
  };
  
  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      // Check authentication status
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Connexion requise",
          description: "Vous devez être connecté pour publier une annonce.",
          variant: "destructive"
        });
        navigate("/connexion");
        return;
      }
      
      // In a real app, this would connect to Supabase to save the ad
      console.log("Form data:", formData);
      
      // Simulate submission
      setTimeout(() => {
        toast({
          title: "Annonce soumise",
          description: "Votre annonce a été soumise pour approbation.",
          duration: 3000
        });
        setIsLoading(false);
        setShowPreview(false);
        navigate("/mes-annonces");
      }, 1500);
    } catch (error) {
      console.error("Error submitting the ad:", error);
      toast({
        title: "Erreur",
        description: "Un problème est survenu lors de la publication de votre annonce.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  // Import these from LocationData to maintain proper typings
  const { regions } = require("@/components/ads/LocationData");

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-8 bg-mboa-gray">
        <div className="mboa-container max-w-3xl">
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold mb-6">Publier une annonce</h1>
            
            <form onSubmit={handlePreview} className="space-y-6">
              {/* Core form fields */}
              <AdFormFields 
                formData={formData}
                citiesList={citiesList}
                onInputChange={handleInputChange}
                onSelectChange={handleSelectChange}
              />
              
              {/* Ad Plans */}
              <AdPlanSelector 
                value={formData.adType}
                onChange={(value) => setFormData({...formData, adType: value})}
              />
              
              {/* Images */}
              <ImageUploader 
                images={formData.images}
                imageURLs={imageURLs}
                onImageChange={handleImageChange}
                onRemoveImage={removeImage}
                maxImages={maxImages}
              />
              
              {/* Submit Button */}
              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full bg-mboa-orange hover:bg-mboa-orange/90 text-white py-3"
                >
                  Prévisualiser mon annonce
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
      
      {/* Preview Dialog */}
      <AdPreviewDialog 
        open={showPreview}
        onOpenChange={setShowPreview}
        formData={formData}
        imageURLs={imageURLs}
        isLoading={isLoading}
        onSubmit={handleSubmit}
      />
      
      <Footer />
    </div>
  );
};

export default CreateAd;

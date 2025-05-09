
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Phone } from "lucide-react";

// Mock data - In a real app, these would come from Supabase
const categories = [
  { id: 1, name: "Électronique", slug: "electronique" },
  { id: 2, name: "Véhicules", slug: "vehicules" },
  { id: 3, name: "Immobilier", slug: "immobilier" },
  { id: 4, name: "Vêtements", slug: "vetements" },
  { id: 5, name: "Services", slug: "services" },
  { id: 6, name: "Emploi", slug: "emploi" },
];

const regions = [
  { id: 1, name: "Littoral", slug: "littoral" },
  { id: 2, name: "Centre", slug: "centre" },
  { id: 3, name: "Ouest", slug: "ouest" },
  { id: 4, name: "Sud-Ouest", slug: "sud-ouest" },
  { id: 5, name: "Nord-Ouest", slug: "nord-ouest" },
  { id: 6, name: "Est", slug: "est" },
  { id: 7, name: "Adamaoua", slug: "adamaoua" },
  { id: 8, name: "Nord", slug: "nord" },
  { id: 9, name: "Extrême-Nord", slug: "extreme-nord" },
  { id: 10, name: "Sud", slug: "sud" },
];

// Common cities in Cameroon
const cities = {
  "littoral": ["Douala", "Edéa", "Nkongsamba"],
  "centre": ["Yaoundé", "Mbalmayo", "Obala"],
  "ouest": ["Bafoussam", "Dschang", "Bangangté"],
  "sud-ouest": ["Buea", "Limbé", "Kumba"],
  "nord-ouest": ["Bamenda", "Kumbo", "Wum"],
  "est": ["Bertoua", "Abong-Mbang", "Batouri"],
  "adamaoua": ["Ngaoundéré", "Meiganga", "Tibati"],
  "nord": ["Garoua", "Guider", "Poli"],
  "extreme-nord": ["Maroua", "Kousseri", "Mokolo"],
  "sud": ["Ebolowa", "Kribi", "Sangmélima"],
};

// Ad plan options
const adPlans = [
  { id: "standard", name: "Annonce Standard", price: 0, duration: "30 jours", description: "Gratuit" },
  { id: "premium_24h", name: "Premium 24H", price: 1000, duration: "24 heures", description: "Mise en avant pendant 24 heures" },
  { id: "premium_7d", name: "Premium 7 Jours", price: 5000, duration: "7 jours", description: "Mise en avant pendant 7 jours" },
  { id: "premium_15d", name: "Premium 15 Jours", price: 10000, duration: "15 jours", description: "Mise en avant pendant 15 jours" },
  { id: "premium_30d", name: "Premium 30 Jours", price: 15000, duration: "30 jours", description: "Mise en avant pendant 30 jours" },
];

const CreateAd = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    region: "",
    city: "",
    phone: "",
    whatsapp: "",
    adType: "standard",
    images: [] as File[]
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

  // Format price to display comma separated thousands
  const formatPrice = (price: string | number) => {
    return Number(price).toLocaleString('fr-FR');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-8 bg-mboa-gray">
        <div className="mboa-container max-w-3xl">
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold mb-6">Publier une annonce</h1>
            
            <form onSubmit={handlePreview} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <label htmlFor="title" className="block font-medium">
                  Titre de l'annonce <span className="text-red-500">*</span>
                </label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Décrivez votre article en quelques mots"
                  required
                  maxLength={100}
                />
              </div>
              
              {/* Description */}
              <div className="space-y-2">
                <label htmlFor="description" className="block font-medium">
                  Description
                </label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Décrivez votre article, son état, ses caractéristiques..."
                  rows={5}
                />
              </div>
              
              {/* Category */}
              <div className="space-y-2">
                <label htmlFor="category" className="block font-medium">
                  Catégorie <span className="text-red-500">*</span>
                </label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => handleSelectChange("category", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Price */}
              <div className="space-y-2">
                <label htmlFor="price" className="block font-medium">
                  Prix (XAF)
                </label>
                <div className="relative">
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="Prix en francs CFA"
                    className="pl-16"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none bg-gray-100 border-r rounded-l-md">
                    XAF
                  </div>
                </div>
              </div>
              
              {/* Contact information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="phone" className="block font-medium">
                    Téléphone <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Ex: 6xxxxxxxx"
                      required
                    />
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      <Phone className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="whatsapp" className="block font-medium">
                    WhatsApp (optionnel)
                  </label>
                  <Input
                    id="whatsapp"
                    name="whatsapp"
                    type="tel"
                    value={formData.whatsapp}
                    onChange={handleInputChange}
                    placeholder="Numéro WhatsApp"
                  />
                </div>
              </div>
              
              {/* Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="region" className="block font-medium">
                    Région <span className="text-red-500">*</span>
                  </label>
                  <Select 
                    value={formData.region} 
                    onValueChange={(value) => handleSelectChange("region", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une région" />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map(region => (
                        <SelectItem key={region.id} value={region.id.toString()}>
                          {region.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="city" className="block font-medium">
                    Ville <span className="text-red-500">*</span>
                  </label>
                  <Select 
                    value={formData.city} 
                    onValueChange={(value) => handleSelectChange("city", value)}
                    disabled={citiesList.length === 0}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une ville" />
                    </SelectTrigger>
                    <SelectContent>
                      {citiesList.map((city, index) => (
                        <SelectItem key={index} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Ad Plans */}
              <div className="space-y-3">
                <label className="block font-medium">
                  Type d'annonce <span className="text-red-500">*</span>
                </label>
                
                <RadioGroup 
                  value={formData.adType}
                  onValueChange={(value) => setFormData({...formData, adType: value})}
                  className="space-y-3"
                >
                  {adPlans.map((plan) => (
                    <div key={plan.id} className="flex items-center space-x-2 border rounded-md p-3">
                      <RadioGroupItem id={plan.id} value={plan.id} />
                      <Label htmlFor={plan.id} className="flex-1 cursor-pointer">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full">
                          <div>
                            <div className="font-medium">{plan.name}</div>
                            <div className="text-sm text-gray-500">{plan.description} • {plan.duration}</div>
                          </div>
                          <div className="font-semibold mt-2 sm:mt-0">
                            {plan.price === 0 ? "Gratuit" : `${formatPrice(plan.price)} XAF`}
                          </div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              
              {/* Images */}
              <div className="space-y-2">
                <label className="block font-medium">
                  Photos (maximum {maxImages})
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-md p-4">
                  <div className="flex items-center justify-center">
                    <label className="w-full cursor-pointer">
                      <div className="text-center py-6">
                        <p className="text-gray-500 mb-2">
                          Cliquez ou glissez-déposez des photos
                        </p>
                        <Button 
                          type="button" 
                          variant="outline"
                          disabled={formData.images.length >= maxImages}
                        >
                          Sélectionner des images
                        </Button>
                      </div>
                      <Input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="hidden"
                        disabled={formData.images.length >= maxImages}
                      />
                    </label>
                  </div>
                  
                  {imageURLs.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                      {imageURLs.map((url, index) => (
                        <div key={index} className="relative">
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="h-24 w-full object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                            aria-label="Remove image"
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Formats acceptés: JPG, PNG. Taille maximale: 5 MB par image.
                </p>
              </div>
              
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
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Prévisualisation de l'annonce</DialogTitle>
          </DialogHeader>
          
          <div className="mt-4 space-y-6">
            {/* Preview content */}
            <div className="space-y-4">
              {/* Images */}
              {imageURLs.length > 0 ? (
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative">
                  <img
                    src={imageURLs[0]}
                    alt="Image principale"
                    className="w-full h-full object-contain"
                  />
                  
                  {imageURLs.length > 1 && (
                    <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
                      {imageURLs.map((_, idx) => (
                        <div
                          key={idx}
                          className={`w-2 h-2 rounded-full ${idx === 0 ? "bg-mboa-orange" : "bg-white/70"}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-400">Aucune image</p>
                </div>
              )}
              
              {/* Title and Price */}
              <div>
                <h2 className="text-xl font-bold">{formData.title || "Titre de l'annonce"}</h2>
                {formData.price && (
                  <p className="text-xl font-bold text-mboa-orange mt-1">
                    {formatPrice(formData.price)} XAF
                  </p>
                )}
              </div>
              
              {/* Ad Type Badge */}
              {formData.adType !== "standard" && (
                <div className="inline-flex bg-yellow-100 text-yellow-800 text-sm px-2 py-1 rounded">
                  {adPlans.find(p => p.id === formData.adType)?.name || "Premium"}
                </div>
              )}
              
              {/* Location */}
              <div className="text-sm text-gray-600">
                {formData.city && formData.region ? (
                  <p>
                    {formData.city}, {regions.find(r => r.id.toString() === formData.region)?.name}
                  </p>
                ) : (
                  <p>Lieu non spécifié</p>
                )}
              </div>
              
              {/* Category */}
              <div className="text-sm text-mboa-orange">
                {formData.category ? (
                  <p>
                    {categories.find(c => c.id.toString() === formData.category)?.name}
                  </p>
                ) : (
                  <p>Catégorie non spécifiée</p>
                )}
              </div>
              
              {/* Description */}
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Description</h3>
                <div className="whitespace-pre-wrap text-gray-700">
                  {formData.description || "Aucune description fournie."}
                </div>
              </div>
              
              {/* Contact info (will be hidden in the preview) */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Contact</h3>
                <p className="text-sm text-gray-600">
                  Les coordonnées du vendeur seront visibles uniquement aux utilisateurs connectés.
                </p>
              </div>
              
              {/* Status notice */}
              <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-lg">
                <p className="text-sm font-medium">
                  Cette annonce sera soumise à modération avant d'être publiée sur le site.
                  Vous pouvez suivre son statut dans votre tableau de bord.
                </p>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowPreview(false)}
                className="flex-1"
              >
                Modifier l'annonce
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1 bg-mboa-orange hover:bg-mboa-orange/90"
                disabled={isLoading}
              >
                {isLoading ? "Traitement..." : "Publier définitivement"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default CreateAd;

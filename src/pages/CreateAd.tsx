
import React, { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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

const CreateAd = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    region: "",
    city: "",
    images: [] as File[]
  });
  const [imageURLs, setImageURLs] = useState<string[]>([]);
  const [citiesList, setCitiesList] = useState<string[]>([]);
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
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, this would connect to Supabase to save the ad
    console.log("Form data:", formData);
    toast({
      title: "Fonctionnalité à venir",
      description: "La publication d'annonces sera implémentée avec Supabase.",
      duration: 3000
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-8 bg-mboa-gray">
        <div className="mboa-container max-w-3xl">
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold mb-6">Publier une annonce</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
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
                  Publier mon annonce
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CreateAd;

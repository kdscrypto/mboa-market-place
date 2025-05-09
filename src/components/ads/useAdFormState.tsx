
import { useState, useEffect } from "react";
import { AdFormData } from "./AdFormTypes";
import { regions, cities } from "./LocationData";

export const useAdFormState = () => {
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

  // Clean up object URLs when component unmounts or when imageURLs change
  useEffect(() => {
    return () => {
      imageURLs.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imageURLs]);
  
  return {
    formData,
    setFormData,
    imageURLs,
    setImageURLs,
    citiesList,
    setCitiesList,
    showPreview,
    setShowPreview,
    isLoading,
    setIsLoading,
    maxImages,
    handleInputChange,
    handleSelectChange,
    handleImageChange,
    removeImage
  };
};


import { useState, useEffect } from "react";
import { Ad } from "@/types/adTypes";

interface UseModerationTableSelectionProps {
  ads: Ad[];
  selectedAds?: string[];
  onSelectedAdsChange?: (selectedAds: string[]) => void;
}

export const useModerationTableSelection = ({
  ads,
  selectedAds = [],
  onSelectedAdsChange
}: UseModerationTableSelectionProps) => {
  const [localSelectedAds, setLocalSelectedAds] = useState<string[]>([]);
  
  // Use external selectedAds if provided, otherwise use local state
  const currentSelectedAds = onSelectedAdsChange ? selectedAds : localSelectedAds;
  
  // Reset selected ads when ads change
  useEffect(() => {
    if (onSelectedAdsChange) {
      onSelectedAdsChange([]);
    } else {
      setLocalSelectedAds([]);
    }
  }, [ads, onSelectedAdsChange]);

  const handleSelectAll = (checked: boolean) => {
    const newSelection = checked ? ads.map(ad => ad.id) : [];
    if (onSelectedAdsChange) {
      onSelectedAdsChange(newSelection);
    } else {
      setLocalSelectedAds(newSelection);
    }
  };

  const handleSelectAd = (adId: string, checked: boolean) => {
    if (onSelectedAdsChange) {
      const newSelection = checked 
        ? [...currentSelectedAds, adId]
        : currentSelectedAds.filter(id => id !== adId);
      onSelectedAdsChange(newSelection);
    } else {
      if (checked) {
        setLocalSelectedAds(prev => [...prev, adId]);
      } else {
        setLocalSelectedAds(prev => prev.filter(id => id !== adId));
      }
    }
  };

  const isAllSelected = ads.length > 0 && currentSelectedAds.length === ads.length;
  const isSomeSelected = currentSelectedAds.length > 0 && currentSelectedAds.length < ads.length;

  return {
    currentSelectedAds,
    handleSelectAll,
    handleSelectAd,
    isAllSelected,
    isSomeSelected
  };
};

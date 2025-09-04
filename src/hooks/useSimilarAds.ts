import { useState, useEffect, useCallback } from 'react';
import { Ad } from '@/types/adTypes';
import { getSimilarAdsWithFallback } from '@/services/similarAdsService';

interface UseSimilarAdsOptions {
  currentAdId: string;
  category: string;
  region: string;
  limit?: number;
}

interface UseSimilarAdsReturn {
  similarAds: Ad[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useSimilarAds = ({
  currentAdId,
  category,
  region,
  limit = 6
}: UseSimilarAdsOptions): UseSimilarAdsReturn => {
  const [similarAds, setSimilarAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSimilarAds = useCallback(async () => {
    if (!currentAdId || !category) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const ads = await getSimilarAdsWithFallback(currentAdId, category, region, limit);
      setSimilarAds(ads);
    } catch (err) {
      console.error('Error fetching similar ads:', err);
      setError('Erreur lors du chargement des annonces similaires');
      setSimilarAds([]);
    } finally {
      setLoading(false);
    }
  }, [currentAdId, category, region, limit]);

  useEffect(() => {
    fetchSimilarAds();
  }, [fetchSimilarAds]);

  const refetch = useCallback(() => {
    fetchSimilarAds();
  }, [fetchSimilarAds]);

  return {
    similarAds,
    loading,
    error,
    refetch
  };
};
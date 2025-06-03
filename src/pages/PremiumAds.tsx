
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Loader2 } from "lucide-react";
import SearchFilters from "@/components/SearchFilters";
import PremiumSearchResults from "@/components/premium/PremiumSearchResults";
import PremiumAdsError from "@/components/premium/PremiumAdsError";
import PremiumAdsHeader from "@/components/premium/PremiumAdsHeader";
import { usePremiumAdsData } from "@/hooks/usePremiumAdsData";

const PremiumAds = () => {
  const {
    premiumAds,
    filteredAds,
    isLoading,
    isSearching,
    error,
    isRetrying,
    hasActiveFilters,
    handleSearch,
    handleRetry
  } = usePremiumAdsData();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        <div className="mboa-container py-6">
          <PremiumAdsHeader />

          {/* Loading State */}
          {isLoading ? (
            <div className="bg-white border rounded-lg p-6">
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-mboa-orange" />
                <span className="ml-2">Chargement des annonces premium...</span>
              </div>
            </div>
          ) : error ? (
            /* Error State */
            <PremiumAdsError onRetry={handleRetry} isRetrying={isRetrying} />
          ) : (
            /* Main Content */
            <>
              {/* Search Filters */}
              <SearchFilters
                onSearch={handleSearch}
                placeholder="Rechercher dans les annonces premium..."
                searchButtonText="Rechercher"
                className="mb-6"
              />

              {/* Results */}
              <div className="bg-white border rounded-lg p-6">
                <PremiumSearchResults
                  ads={filteredAds}
                  isSearching={isSearching}
                  hasFilters={hasActiveFilters}
                  totalAdsCount={premiumAds.length}
                />
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PremiumAds;

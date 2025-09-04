
import React from "react";
import AdCard from "@/components/AdCard";
import SearchResultsEmpty from "./SearchResultsEmpty";
import SearchResultsLoading from "./SearchResultsLoading";
import SearchResultsPagination from "./SearchResultsPagination";
import AdsterraNativeBanner from "@/components/ads/AdsterraNativeBanner";
import { Ad } from "@/types/adTypes";

interface SearchResultsContentProps {
  results: Ad[];
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const SearchResultsContent: React.FC<SearchResultsContentProps> = ({
  results,
  isLoading,
  error,
  currentPage,
  totalPages,
  onPageChange
}) => {
  if (!isLoading && results.length === 0 && !error) {
    return <SearchResultsEmpty />;
  }

  if (isLoading) {
    return <SearchResultsLoading />;
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {results.map((ad, index) => (
          <React.Fragment key={ad.id}>
            <AdCard
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
            {/* Insert native ad every 7 items */}
            {(index + 1) % 7 === 0 && (
              <AdsterraNativeBanner
                zoneId="search-native-1"
                className="col-span-2 md:col-span-3 lg:col-span-4 xl:col-span-6"
                title="Annonce recommandée"
              />
            )}
          </React.Fragment>
        ))}
      </div>
      
      <SearchResultsPagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </>
  );
};

export default SearchResultsContent;

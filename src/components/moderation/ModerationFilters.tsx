
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Filter, Search, X } from "lucide-react";
import { Ad } from "@/types/adTypes";

interface FilterOptions {
  search: string;
  category: string;
  region: string;
  dateRange: string;
  priceRange: string;
  adType: string;
}

interface ModerationFiltersProps {
  onFiltersChange: (filteredAds: Ad[]) => void;
  allAds: Ad[];
  status: "pending" | "approved" | "rejected";
}

const ModerationFilters: React.FC<ModerationFiltersProps> = ({
  onFiltersChange,
  allAds,
  status
}) => {
  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    category: "",
    region: "",
    dateRange: "",
    priceRange: "",
    adType: ""
  });

  const [isExpanded, setIsExpanded] = useState(false);

  // Get unique values for filter options
  const categories = [...new Set(allAds.map(ad => ad.category))].sort();
  const regions = [...new Set(allAds.map(ad => ad.region))].sort();

  const applyFilters = (newFilters: FilterOptions) => {
    let filtered = [...allAds];

    // Search filter
    if (newFilters.search) {
      const searchLower = newFilters.search.toLowerCase();
      filtered = filtered.filter(ad => 
        ad.title.toLowerCase().includes(searchLower) ||
        ad.description.toLowerCase().includes(searchLower) ||
        ad.phone.includes(newFilters.search)
      );
    }

    // Category filter
    if (newFilters.category) {
      filtered = filtered.filter(ad => ad.category === newFilters.category);
    }

    // Region filter
    if (newFilters.region) {
      filtered = filtered.filter(ad => ad.region === newFilters.region);
    }

    // Date range filter
    if (newFilters.dateRange) {
      const now = new Date();
      let startDate = new Date();
      
      switch (newFilters.dateRange) {
        case "today":
          startDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          startDate.setDate(now.getDate() - 7);
          break;
        case "month":
          startDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      filtered = filtered.filter(ad => 
        new Date(ad.created_at) >= startDate
      );
    }

    // Price range filter
    if (newFilters.priceRange) {
      switch (newFilters.priceRange) {
        case "low":
          filtered = filtered.filter(ad => ad.price < 50000);
          break;
        case "medium":
          filtered = filtered.filter(ad => ad.price >= 50000 && ad.price < 200000);
          break;
        case "high":
          filtered = filtered.filter(ad => ad.price >= 200000);
          break;
      }
    }

    // Ad type filter
    if (newFilters.adType) {
      filtered = filtered.filter(ad => ad.ad_type === newFilters.adType);
    }

    onFiltersChange(filtered);
  };

  const updateFilter = (key: keyof FilterOptions, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters: FilterOptions = {
      search: "",
      category: "",
      region: "",
      dateRange: "",
      priceRange: "",
      adType: ""
    };
    setFilters(emptyFilters);
    onFiltersChange(allAds);
  };

  const activeFiltersCount = Object.values(filters).filter(value => value !== "").length;

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">{activeFiltersCount}</Badge>
            )}
          </CardTitle>
          <div className="flex gap-2">
            {activeFiltersCount > 0 && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Effacer
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Réduire" : "Étendre"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search - Always visible */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Rechercher par titre, description ou téléphone..."
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Advanced filters - Expandable */}
        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Catégorie</label>
              <Select value={filters.category} onValueChange={(value) => updateFilter("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toutes les catégories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Région</label>
              <Select value={filters.region} onValueChange={(value) => updateFilter("region", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les régions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toutes les régions</SelectItem>
                  {regions.map(region => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Période</label>
              <Select value={filters.dateRange} onValueChange={(value) => updateFilter("dateRange", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Toute période" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toute période</SelectItem>
                  <SelectItem value="today">Aujourd'hui</SelectItem>
                  <SelectItem value="week">Cette semaine</SelectItem>
                  <SelectItem value="month">Ce mois</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Gamme de prix</label>
              <Select value={filters.priceRange} onValueChange={(value) => updateFilter("priceRange", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les prix" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous les prix</SelectItem>
                  <SelectItem value="low">Moins de 50,000 XAF</SelectItem>
                  <SelectItem value="medium">50,000 - 200,000 XAF</SelectItem>
                  <SelectItem value="high">Plus de 200,000 XAF</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Type d'annonce</label>
              <Select value={filters.adType} onValueChange={(value) => updateFilter("adType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous les types</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ModerationFilters;

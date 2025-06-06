
import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ModerationTable from "@/components/moderation/ModerationTable";
import ModerationDashboard from "@/components/moderation/ModerationDashboard";
import ModerationFilters from "@/components/moderation/ModerationFilters";
import QuickActions from "@/components/moderation/QuickActions";
import { Ad } from "@/types/adTypes";

interface ModerationTabsProps {
  pendingAds: Ad[];
  approvedAds: Ad[];
  rejectedAds: Ad[];
  isLoading: boolean;
  onApprove: (adId: string) => void;
  onReject: (adId: string, message?: string) => void;
  onDelete: (adId: string) => void;
  onBulkApprove: (adIds: string[]) => void;
  onBulkDelete: (adIds: string[]) => void;
}

const ModerationTabs: React.FC<ModerationTabsProps> = ({
  pendingAds = [],
  approvedAds = [],
  rejectedAds = [],
  isLoading,
  onApprove,
  onReject,
  onDelete,
  onBulkApprove,
  onBulkDelete
}) => {
  // Filtered ads state
  const [filteredPendingAds, setFilteredPendingAds] = useState<Ad[]>(pendingAds);
  const [filteredApprovedAds, setFilteredApprovedAds] = useState<Ad[]>(approvedAds);
  const [filteredRejectedAds, setFilteredRejectedAds] = useState<Ad[]>(rejectedAds);
  
  // Selected ads for bulk actions
  const [selectedAds, setSelectedAds] = useState<string[]>([]);

  // Update filtered ads when original ads change
  useEffect(() => {
    setFilteredPendingAds(pendingAds);
    setFilteredApprovedAds(approvedAds);
    setFilteredRejectedAds(rejectedAds);
  }, [pendingAds, approvedAds, rejectedAds]);

  // Add debug logging to track when props change
  useEffect(() => {
    console.log("ModerationTabs updated with:");
    console.log("- Pending ads:", pendingAds?.length || 0);
    console.log("- Approved ads:", approvedAds?.length || 0);
    console.log("- Rejected ads:", rejectedAds?.length || 0);
    console.log("- isLoading:", isLoading);
  }, [pendingAds, approvedAds, rejectedAds, isLoading]);

  // Enhanced bulk reject function
  const handleBulkReject = (adIds: string[], message: string) => {
    adIds.forEach(adId => {
      onReject(adId, message);
    });
    setSelectedAds([]);
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Overview */}
      <ModerationDashboard
        pendingAds={pendingAds}
        approvedAds={approvedAds}
        rejectedAds={rejectedAds}
        isLoading={isLoading}
      />

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="pending" className="relative">
            En attente
            {(filteredPendingAds?.length || 0) > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {filteredPendingAds?.length || 0}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approuvées
            {(filteredApprovedAds?.length || 0) > 0 && (
              <span className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {filteredApprovedAds?.length || 0}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejetées
            {(filteredRejectedAds?.length || 0) > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {filteredRejectedAds?.length || 0}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-6">
          <QuickActions
            pendingCount={filteredPendingAds.length}
            onBulkApprove={onBulkApprove}
            onBulkReject={handleBulkReject}
            selectedAds={selectedAds}
          />
          
          <ModerationFilters
            onFiltersChange={setFilteredPendingAds}
            allAds={pendingAds}
            status="pending"
          />
          
          <ModerationTable 
            ads={filteredPendingAds || []} 
            status="pending" 
            isLoading={isLoading}
            onApprove={onApprove}
            onReject={onReject}
            onBulkApprove={onBulkApprove}
            selectedAds={selectedAds}
            onSelectedAdsChange={setSelectedAds}
          />
        </TabsContent>
        
        <TabsContent value="approved" className="space-y-6">
          <ModerationFilters
            onFiltersChange={setFilteredApprovedAds}
            allAds={approvedAds}
            status="approved"
          />
          
          <ModerationTable 
            ads={filteredApprovedAds || []} 
            status="approved" 
            isLoading={isLoading}
          />
        </TabsContent>
        
        <TabsContent value="rejected" className="space-y-6">
          <ModerationFilters
            onFiltersChange={setFilteredRejectedAds}
            allAds={rejectedAds}
            status="rejected"
          />
          
          <ModerationTable 
            ads={filteredRejectedAds || []} 
            status="rejected" 
            isLoading={isLoading}
            onDelete={onDelete}
            onBulkDelete={onBulkDelete}
            selectedAds={selectedAds}
            onSelectedAdsChange={setSelectedAds}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ModerationTabs;

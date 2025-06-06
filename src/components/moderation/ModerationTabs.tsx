
import React, { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ModerationTable from "@/components/moderation/ModerationTable";
import { Ad } from "@/types/adTypes";

interface ModerationTabsProps {
  pendingAds: Ad[];
  approvedAds: Ad[];
  rejectedAds: Ad[];
  isLoading: boolean;
  onApprove: (adId: string) => void;
  onReject: (adId: string, message?: string) => void;
  onDelete: (adId: string) => void;
}

const ModerationTabs: React.FC<ModerationTabsProps> = ({
  pendingAds = [],
  approvedAds = [],
  rejectedAds = [],
  isLoading,
  onApprove,
  onReject,
  onDelete
}) => {
  // Add debug logging to track when props change
  useEffect(() => {
    console.log("ModerationTabs updated with:");
    console.log("- Pending ads:", pendingAds?.length || 0);
    console.log("- Approved ads:", approvedAds?.length || 0);
    console.log("- Rejected ads:", rejectedAds?.length || 0);
    console.log("- isLoading:", isLoading);
  }, [pendingAds, approvedAds, rejectedAds, isLoading]);
  
  return (
    <Tabs defaultValue="pending" className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-8">
        <TabsTrigger value="pending" className="relative">
          En attente
          {(pendingAds?.length || 0) > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {pendingAds?.length || 0}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="approved">Approuvées</TabsTrigger>
        <TabsTrigger value="rejected">Rejetées</TabsTrigger>
      </TabsList>
      
      <TabsContent value="pending">
        <ModerationTable 
          ads={pendingAds || []} 
          status="pending" 
          isLoading={isLoading}
          onApprove={onApprove}
          onReject={onReject}
        />
      </TabsContent>
      
      <TabsContent value="approved">
        <ModerationTable 
          ads={approvedAds || []} 
          status="approved" 
          isLoading={isLoading}
        />
      </TabsContent>
      
      <TabsContent value="rejected">
        <ModerationTable 
          ads={rejectedAds || []} 
          status="rejected" 
          isLoading={isLoading}
          onDelete={onDelete}
        />
      </TabsContent>
    </Tabs>
  );
};

export default ModerationTabs;

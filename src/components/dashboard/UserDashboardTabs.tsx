
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserAdsTable from "./UserAdsTable";
import UserProfileForm from "./UserProfileForm";

interface UserDashboardTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: any;
  userAds: any[];
}

const UserDashboardTabs = ({ activeTab, setActiveTab, user, userAds }: UserDashboardTabsProps) => {
  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="mb-6">
        <TabsTrigger value="all" onClick={() => setActiveTab("ads")}>Toutes</TabsTrigger>
        <TabsTrigger value="active" onClick={() => setActiveTab("ads")}>Actives</TabsTrigger>
        <TabsTrigger value="sold" onClick={() => setActiveTab("ads")}>Vendues</TabsTrigger>
        <TabsTrigger value="expired" onClick={() => setActiveTab("ads")}>Expirées</TabsTrigger>
        <TabsTrigger value="pending" onClick={() => setActiveTab("ads")}>En attente</TabsTrigger>
        <TabsTrigger value="profile" onClick={() => setActiveTab("profile")}>Profil</TabsTrigger>
      </TabsList>
      
      {["all", "active", "sold", "expired", "pending"].map((tabValue) => (
        <TabsContent key={tabValue} value={tabValue}>
          <UserAdsTable ads={userAds} tabValue={tabValue} />
        </TabsContent>
      ))}
      
      <TabsContent value="profile">
        <UserProfileForm user={user} />
      </TabsContent>
    </Tabs>
  );
};

export default UserDashboardTabs;

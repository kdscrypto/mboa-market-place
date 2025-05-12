
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserAdsTable from "./UserAdsTable";
import UserProfileForm from "./UserProfileForm";
import UserMessagesTab from "./UserMessagesTab";

interface UserDashboardTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: any;
  userAds: any[];
}

const UserDashboardTabs = ({ activeTab, setActiveTab, user, userAds }: UserDashboardTabsProps) => {
  return (
    <Tabs defaultValue="all" onValueChange={(value) => setActiveTab(value === "profile" || value === "messages" ? value : "ads")} className="w-full">
      <TabsList className="mb-6">
        <TabsTrigger value="all">Toutes</TabsTrigger>
        <TabsTrigger value="active">Actives</TabsTrigger>
        <TabsTrigger value="pending">En attente</TabsTrigger>
        <TabsTrigger value="sold">Vendues</TabsTrigger>
        <TabsTrigger value="expired">Expirées</TabsTrigger>
        <TabsTrigger value="messages">Messages</TabsTrigger>
        <TabsTrigger value="profile">Profil</TabsTrigger>
      </TabsList>
      
      {["all", "active", "pending", "sold", "expired"].map((tabValue) => (
        <TabsContent key={tabValue} value={tabValue}>
          <UserAdsTable ads={userAds} tabValue={tabValue} />
        </TabsContent>
      ))}
      
      <TabsContent value="messages">
        <UserMessagesTab />
      </TabsContent>
      
      <TabsContent value="profile">
        <UserProfileForm user={user} />
      </TabsContent>
    </Tabs>
  );
};

export default UserDashboardTabs;

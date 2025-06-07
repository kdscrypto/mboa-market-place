
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserAdsTable from "./UserAdsTable";
import UserMessagesTab from "./UserMessagesTab";
import PaymentTransactionsTab from "./PaymentTransactionsTab";
import UserProfileForm from "./UserProfileForm";
import { User, MessageCircle, FileText, CreditCard } from "lucide-react";

interface UserDashboardTabsProps {
  user: any;
}

const UserDashboardTabs = ({ user }: UserDashboardTabsProps) => {
  return (
    <Tabs defaultValue="ads" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="ads" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Mes annonces
        </TabsTrigger>
        <TabsTrigger value="messages" className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          Messages
        </TabsTrigger>
        <TabsTrigger value="payments" className="flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          Paiements
        </TabsTrigger>
        <TabsTrigger value="profile" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Profil
        </TabsTrigger>
      </TabsList>

      <TabsContent value="ads">
        <UserAdsTable />
      </TabsContent>

      <TabsContent value="messages">
        <UserMessagesTab />
      </TabsContent>

      <TabsContent value="payments">
        <PaymentTransactionsTab />
      </TabsContent>

      <TabsContent value="profile">
        <UserProfileForm user={user} />
      </TabsContent>
    </Tabs>
  );
};

export default UserDashboardTabs;

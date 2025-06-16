
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserAdsTable from "./UserAdsTable";
import UserMessagesTab from "./UserMessagesTab";
import PaymentTransactionsTab from "./PaymentTransactionsTab";
import UserProfileForm from "./UserProfileForm";
import AffiliateTabPhase4 from "./AffiliateTabPhase4";
import { User, MessageCircle, FileText, CreditCard, Users } from "lucide-react";

interface UserDashboardTabsProps {
  user: any;
}

const UserDashboardTabs = ({ user }: UserDashboardTabsProps) => {
  return (
    <Tabs defaultValue="ads" className="w-full">
      <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 mb-6">
        <TabsTrigger value="ads" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
          <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden xs:inline">Mes annonces</span>
          <span className="xs:hidden">Annonces</span>
        </TabsTrigger>
        <TabsTrigger value="messages" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
          <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
          Messages
        </TabsTrigger>
        <TabsTrigger value="affiliate" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
          <Users className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden xs:inline">Parrainage</span>
          <span className="xs:hidden">Points</span>
        </TabsTrigger>
        <TabsTrigger value="payments" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
          <CreditCard className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden xs:inline">Paiements</span>
          <span className="xs:hidden">€</span>
        </TabsTrigger>
        <TabsTrigger value="profile" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
          <User className="h-3 w-3 sm:h-4 sm:w-4" />
          Profil
        </TabsTrigger>
      </TabsList>

      <TabsContent value="ads" className="mt-0">
        <UserAdsTable />
      </TabsContent>

      <TabsContent value="messages" className="mt-0">
        <UserMessagesTab />
      </TabsContent>

      <TabsContent value="affiliate" className="mt-0">
        <AffiliateTabPhase4 userId={user?.id} />
      </TabsContent>

      <TabsContent value="payments" className="mt-0">
        <PaymentTransactionsTab />
      </TabsContent>

      <TabsContent value="profile" className="mt-0">
        <UserProfileForm user={user} />
      </TabsContent>
    </Tabs>
  );
};

export default UserDashboardTabs;

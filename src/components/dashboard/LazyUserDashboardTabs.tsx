import React, { Suspense, lazy } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, MessageCircle, FileText, CreditCard, Diamond } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load tab components for better performance
const UserAdsTable = lazy(() => import("./UserAdsTable"));
const UserMessagesTab = lazy(() => import("./UserMessagesTab"));
const PaymentTransactionsTab = lazy(() => import("./PaymentTransactionsTab"));
const UserProfileForm = lazy(() => import("./UserProfileForm"));
const AffiliateTabPhase6 = lazy(() => import("./AffiliateTabPhase6"));

interface LazyUserDashboardTabsProps {
  user: any;
}

// Loading skeleton for tabs
const TabSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <div className="grid grid-cols-2 gap-4">
      <Skeleton className="h-20" />
      <Skeleton className="h-20" />
    </div>
  </div>
);

const LazyUserDashboardTabs = ({ user }: LazyUserDashboardTabsProps) => {
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
          <Diamond className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden xs:inline">Affiliation Hub</span>
          <span className="xs:hidden">Hub</span>
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
        <Suspense fallback={<TabSkeleton />}>
          <UserAdsTable />
        </Suspense>
      </TabsContent>

      <TabsContent value="messages" className="mt-0">
        <Suspense fallback={<TabSkeleton />}>
          <UserMessagesTab />
        </Suspense>
      </TabsContent>

      <TabsContent value="affiliate" className="mt-0">
        <Suspense fallback={<TabSkeleton />}>
          <AffiliateTabPhase6 userId={user?.id} />
        </Suspense>
      </TabsContent>

      <TabsContent value="payments" className="mt-0">
        <Suspense fallback={<TabSkeleton />}>
          <PaymentTransactionsTab />
        </Suspense>
      </TabsContent>

      <TabsContent value="profile" className="mt-0">
        <Suspense fallback={<TabSkeleton />}>
          <UserProfileForm user={user} />
        </Suspense>
      </TabsContent>
    </Tabs>
  );
};

export default React.memo(LazyUserDashboardTabs);
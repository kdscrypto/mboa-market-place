
import React from "react";
import { Card, CardHeader } from "@/components/ui/card";

const AffiliatePhase6LoadingState: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-theme-surface border border-theme-border">
            <CardHeader className="animate-pulse">
              <div className="h-4 bg-theme-neutral-300 dark:bg-theme-neutral-600 rounded w-3/4"></div>
              <div className="h-6 bg-theme-neutral-300 dark:bg-theme-neutral-600 rounded w-1/2"></div>
            </CardHeader>
          </Card>
        ))}
      </div>
      
      {/* Header skeleton */}
      <div className="animate-pulse">
        <div className="h-8 bg-theme-neutral-300 dark:bg-theme-neutral-600 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-theme-neutral-300 dark:bg-theme-neutral-600 rounded w-1/2"></div>
      </div>
      
      {/* Banner skeleton */}
      <Card className="bg-theme-surface border border-theme-border">
        <div className="p-6 animate-pulse">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-theme-neutral-300 dark:bg-theme-neutral-600 rounded-full shrink-0"></div>
            <div className="flex-1 space-y-3">
              <div className="h-6 bg-theme-neutral-300 dark:bg-theme-neutral-600 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-theme-neutral-300 dark:bg-theme-neutral-600 rounded w-full"></div>
                <div className="h-4 bg-theme-neutral-300 dark:bg-theme-neutral-600 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AffiliatePhase6LoadingState;

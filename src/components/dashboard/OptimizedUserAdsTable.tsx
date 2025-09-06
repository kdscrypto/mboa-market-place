import React, { memo, useMemo, useCallback } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useOptimizedUserData } from "@/hooks/useOptimizedUserData";
import { Skeleton } from "@/components/ui/skeleton";
import { useOptimizedCallback } from "@/hooks/usePerformanceHooks";

interface OptimizedUserAdsTableProps {
  userId: string;
}

const OptimizedUserAdsTable = memo(({ userId }: OptimizedUserAdsTableProps) => {
  const { data: userData, isLoading } = useOptimizedUserData(userId);

  // Memoized status badge component
  const StatusBadge = useCallback(({ status }: { status: string }) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, text: "En attente" },
      approved: { variant: "default" as const, text: "Approuvée" },
      rejected: { variant: "destructive" as const, text: "Rejetée" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <Badge variant={config.variant}>
        {config.text}
      </Badge>
    );
  }, []);

  // Memoized date formatter
  const formatDate = useOptimizedCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }, []);

  // Memoized price formatter
  const formatPrice = useOptimizedCallback((price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (!userData || !userData.ads.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Aucune annonce trouvée</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800">Total</h3>
          <p className="text-2xl font-bold text-blue-600">{userData.totalAds}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-green-800">Approuvées</h3>
          <p className="text-2xl font-bold text-green-600">{userData.approvedCount}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="font-semibold text-yellow-800">En attente</h3>
          <p className="text-2xl font-bold text-yellow-600">{userData.pendingCount}</p>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Titre</TableHead>
            <TableHead>Prix</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Date de création</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {userData.ads.map((ad) => (
            <TableRow key={ad.id}>
              <TableCell className="font-medium">{ad.title}</TableCell>
              <TableCell>{formatPrice(ad.price)} FCFA</TableCell>
              <TableCell>
                <StatusBadge status={ad.status} />
              </TableCell>
              <TableCell>{formatDate(ad.created_at)}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm">
                  Voir
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
});

OptimizedUserAdsTable.displayName = 'OptimizedUserAdsTable';

export default OptimizedUserAdsTable;

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CreditCard, Star } from "lucide-react";
import { AdPlan } from "@/services/paymentService";

interface PaymentSummaryProps {
  plan: AdPlan;
  adTitle?: string;
}

const PaymentSummary = ({ plan, adTitle }: PaymentSummaryProps) => {
  const formatPrice = (price: number) => {
    return price === 0 ? "Gratuit" : `${price.toLocaleString('fr-FR')} XAF`;
  };

  const getDurationText = (days: number) => {
    if (days === 1) return "24 heures";
    if (days === 7) return "7 jours";
    if (days === 15) return "15 jours";
    if (days === 30) return "30 jours";
    return `${days} jours`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Résumé du paiement
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {adTitle && (
          <div>
            <label className="text-sm font-medium text-gray-600">Annonce</label>
            <p className="font-medium">{adTitle}</p>
          </div>
        )}
        
        <div>
          <label className="text-sm font-medium text-gray-600">Plan sélectionné</label>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-medium">{plan.name}</span>
            {plan.id !== 'standard' && (
              <Badge variant="secondary" className="gap-1">
                <Star className="h-3 w-3" />
                Premium
              </Badge>
            )}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600">Description</label>
          <p className="text-sm">{plan.description}</p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600">Durée</label>
          <div className="flex items-center gap-1 mt-1">
            <Clock className="h-4 w-4 text-gray-500" />
            <span>{getDurationText(plan.duration_days)}</span>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-2xl font-bold text-mboa-orange">
              {formatPrice(plan.price)}
            </span>
          </div>
        </div>

        {plan.price === 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-green-800 text-sm">
              🎉 Cette annonce est gratuite ! Aucun paiement requis.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentSummary;


import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Shield, AlertTriangle, Info, ChevronDown } from "lucide-react";

const SafetyDropdown: React.FC = () => {
  const safetyTips = [
    "Rencontrez-vous toujours dans un lieu public",
    "N'envoyez jamais d'argent avant d'avoir vu l'article",
    "Vérifiez l'article avant de payer",
    "Méfiez-vous des prix trop bas par rapport au marché",
    "Ne communiquez jamais vos informations bancaires",
    "Privilégiez les paiements en main propre",
    "Signalez les comportements suspects"
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full mb-3 text-left justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-600" />
            Conseils de sécurité
          </div>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 p-4 bg-white border shadow-lg">
        <div className="space-y-3">
          <div className="flex items-center gap-2 font-medium text-green-600">
            <Shield className="h-5 w-5" />
            Conseils de sécurité
          </div>
          <div className="space-y-2">
            {safetyTips.map((tip, index) => (
              <div key={index} className="flex items-start gap-2 text-sm text-gray-700">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                {tip}
              </div>
            ))}
          </div>
          <div className="pt-2 border-t">
            <p className="text-xs text-gray-500">
              En cas de problème, contactez notre équipe de modération
            </p>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SafetyDropdown;

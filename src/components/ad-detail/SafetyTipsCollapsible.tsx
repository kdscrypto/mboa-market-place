import React, { useState } from "react";
import { Shield, ChevronDown, ChevronUp, CheckCircle, XCircle } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const SafetyTipsCollapsible: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const goodPractices = [
    "Rencontrez le vendeur dans un lieu public et fréquenté",
    "Vérifiez l'état de l'article avant l'achat",
    "Méfiez-vous des prix trop attractifs par rapport au marché",
    "Utilisez des moyens de paiement sécurisés",
    "Gardez les preuves de la transaction (messages, reçus)",
    "Faites confiance à votre instinct en cas de doute"
  ];

  const badPractices = [
    "Ne payez jamais à l'avance sans garantie",
    "Évitez les virements vers l'étranger",
    "Ne donnez jamais vos informations bancaires par message",
    "N'achetez pas sans avoir vu l'article",
    "Ne vous rendez pas seul dans un lieu isolé"
  ];

  return (
    <Card className="border-primary/20">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-3 cursor-pointer hover:bg-muted/50 transition-colors">
            <Button variant="ghost" className="h-auto p-0 justify-between">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <h3 className="font-semibold text-base">Conseils de sécurité</h3>
                  <p className="text-sm text-muted-foreground">
                    Protégez-vous des arnaques lors de vos transactions
                  </p>
                </div>
              </div>
              {isOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0 space-y-6">
            <div className="space-y-3">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                À faire
              </h4>
              <ul className="space-y-2">
                {goodPractices.map((practice, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{practice}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <XCircle className="h-4 w-4 text-destructive" />
                À éviter
              </h4>
              <ul className="space-y-2">
                {badPractices.map((practice, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <XCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                    <span>{practice}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Rappel :</strong> En cas de doute, n'hésitez pas à signaler l'annonce. 
                Votre sécurité est notre priorité.
              </p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default SafetyTipsCollapsible;
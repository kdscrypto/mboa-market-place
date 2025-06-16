
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Share2, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AffiliateCodeSectionProps {
  affiliateCode: string;
}

const AffiliateCodeSection: React.FC<AffiliateCodeSectionProps> = ({ affiliateCode }) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyAffiliateCode = async () => {
    try {
      await navigator.clipboard.writeText(affiliateCode);
      setCopied(true);
      toast({
        title: "Code copié !",
        description: "Votre code de parrainage a été copié dans le presse-papiers.",
        duration: 3000
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le code",
        variant: "destructive"
      });
    }
  };

  const shareAffiliateCode = async () => {
    const shareData = {
      title: "Rejoignez MBOA !",
      text: `Utilisez mon code de parrainage ${affiliateCode} pour vous inscrire sur MBOA et bénéficier d'avantages exclusifs !`,
      url: `${window.location.origin}/connexion?ref=${affiliateCode}`
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        toast({
          title: "Lien copié !",
          description: "Le lien de parrainage a été copié dans le presse-papiers.",
          duration: 3000
        });
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Votre code de parrainage
        </CardTitle>
        <CardDescription>
          Partagez votre code pour gagner des points à chaque inscription
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Input
            value={affiliateCode}
            readOnly
            className="font-mono text-lg"
          />
          <Button onClick={copyAffiliateCode} variant="outline" size="icon">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
          <Button onClick={shareAffiliateCode} variant="outline">
            <Share2 className="h-4 w-4 mr-2" />
            Partager
          </Button>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Comment ça marche ?</h4>
          <div className="grid gap-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Niveau 1</Badge>
              <span>Vos filleuls directs vous rapportent <strong>2 points</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Niveau 2</Badge>
              <span>Les filleuls de vos filleuls vous rapportent <strong>1 point</strong></span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AffiliateCodeSection;

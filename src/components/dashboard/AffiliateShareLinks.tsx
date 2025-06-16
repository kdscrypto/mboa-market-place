
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Share2, Copy, Check, MessageCircle, Mail, Facebook, Twitter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AffiliateShareLinksProps {
  affiliateCode: string;
}

const AffiliateShareLinks: React.FC<AffiliateShareLinksProps> = ({ affiliateCode }) => {
  const [copiedLink, setCopiedLink] = useState<string>("");
  const { toast } = useToast();

  const baseUrl = window.location.origin;
  const shareLinks = {
    registration: `${baseUrl}/connexion?ref=${affiliateCode}`,
    direct: `${baseUrl}?ref=${affiliateCode}`,
    premium: `${baseUrl}/annonces-premium?ref=${affiliateCode}`
  };

  const copyToClipboard = async (link: string, type: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopiedLink(type);
      toast({
        title: "Lien copié !",
        description: "Le lien a été copié dans le presse-papiers.",
        duration: 3000
      });
      setTimeout(() => setCopiedLink(""), 2000);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le lien",
        variant: "destructive"
      });
    }
  };

  const shareViaWhatsApp = (link: string) => {
    const message = `Rejoins MBOA avec mon code de parrainage ${affiliateCode} et profite d'avantages exclusifs ! ${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const shareViaEmail = (link: string) => {
    const subject = "Rejoins MBOA avec mon code de parrainage !";
    const body = `Salut !

J'utilise MBOA pour acheter et vendre des articles, et je pense que ça pourrait t'intéresser aussi !

Utilise mon code de parrainage ${affiliateCode} pour t'inscrire et nous recevrons tous les deux des points bonus.

Voici le lien direct : ${link}

À bientôt sur MBOA !`;
    
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
  };

  const shareViaFacebook = (link: string) => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`, '_blank');
  };

  const shareViaTwitter = (link: string) => {
    const text = `Rejoignez MBOA avec mon code de parrainage ${affiliateCode} et profitez d'avantages exclusifs !`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(link)}`, '_blank');
  };

  const ShareLinkItem = ({ title, description, link, type, badge }: {
    title: string;
    description: string;
    link: string;
    type: string;
    badge?: string;
  }) => (
    <div className="space-y-2 p-4 border rounded-lg bg-gray-50">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-sm">{title}</h4>
          <p className="text-xs text-gray-600">{description}</p>
        </div>
        {badge && (
          <Badge variant="secondary" className="text-xs">
            {badge}
          </Badge>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        <Input
          value={link}
          readOnly
          className="text-xs font-mono"
        />
        <Button 
          onClick={() => copyToClipboard(link, type)} 
          variant="outline" 
          size="sm"
        >
          {copiedLink === type ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        </Button>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={() => shareViaWhatsApp(link)}
          variant="outline"
          size="sm"
          className="text-xs"
        >
          <MessageCircle className="h-3 w-3 mr-1" />
          WhatsApp
        </Button>
        <Button
          onClick={() => shareViaEmail(link)}
          variant="outline"
          size="sm"
          className="text-xs"
        >
          <Mail className="h-3 w-3 mr-1" />
          Email
        </Button>
        <Button
          onClick={() => shareViaFacebook(link)}
          variant="outline"
          size="sm"
          className="text-xs"
        >
          <Facebook className="h-3 w-3 mr-1" />
          Facebook
        </Button>
        <Button
          onClick={() => shareViaTwitter(link)}
          variant="outline"
          size="sm"
          className="text-xs"
        >
          <Twitter className="h-3 w-3 mr-1" />
          Twitter
        </Button>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Liens de partage
        </CardTitle>
        <CardDescription>
          Partagez ces liens pour inviter vos amis avec votre code de parrainage
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ShareLinkItem
          title="Lien d'inscription direct"
          description="Redirige directement vers la page d'inscription avec votre code"
          link={shareLinks.registration}
          type="registration"
          badge="Recommandé"
        />
        
        <ShareLinkItem
          title="Lien vers l'accueil"
          description="Amène sur la page d'accueil avec votre code pré-rempli"
          link={shareLinks.direct}
          type="direct"
        />
        
        <ShareLinkItem
          title="Lien vers les annonces premium"
          description="Présente d'abord les annonces premium avant l'inscription"
          link={shareLinks.premium}
          type="premium"
        />
      </CardContent>
    </Card>
  );
};

export default AffiliateShareLinks;


import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Share2, 
  Download, 
  Palette, 
  Code2, 
  Image, 
  Link, 
  Copy, 
  Check,
  Smartphone,
  Monitor,
  Mail
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AffiliateMarketingToolsProps {
  affiliateCode: string;
}

const AffiliateMarketingTools: React.FC<AffiliateMarketingToolsProps> = ({ affiliateCode }) => {
  const [copied, setCopied] = useState<string>("");
  const [selectedBanner, setSelectedBanner] = useState(0);
  const [customMessage, setCustomMessage] = useState("");
  const { toast } = useToast();

  const baseUrl = window.location.origin;

  const bannerTemplates = [
    {
      id: 'banner1',
      name: 'Bannière Standard',
      size: '728x90',
      color: 'orange',
      description: 'Parfait pour les sites web'
    },
    {
      id: 'banner2',
      name: 'Carré Social',
      size: '400x400',
      color: 'blue',
      description: 'Idéal pour les réseaux sociaux'
    },
    {
      id: 'banner3',
      name: 'Story Instagram',
      size: '1080x1920',
      color: 'gradient',
      description: 'Pour les stories Instagram'
    }
  ];

  const emailTemplates = [
    {
      id: 'template1',
      name: 'Invitation personnelle',
      subject: 'J\'ai trouvé quelque chose qui pourrait t\'intéresser !',
      content: `Salut [NOM],

J'utilise MBOA depuis quelques temps pour acheter et vendre des articles, et je pense que ça pourrait vraiment t'intéresser !

C'est une plateforme super pratique avec plein d'annonces intéressantes.

Utilise mon code de parrainage ${affiliateCode} lors de ton inscription pour qu'on ait tous les deux des avantages.

Voici le lien direct : ${baseUrl}/connexion?ref=${affiliateCode}

À bientôt !
[TON NOM]`
    },
    {
      id: 'template2',
      name: 'Invitation business',
      subject: 'Plateforme recommandée pour vos achats/ventes',
      content: `Bonjour,

Je me permets de vous recommander MBOA, une excellente plateforme pour l'achat et la vente d'articles.

En utilisant mon code de recommandation ${affiliateCode}, vous bénéficierez d'avantages lors de votre inscription.

Lien d'inscription : ${baseUrl}/connexion?ref=${affiliateCode}

Cordialement`
    }
  ];

  const socialTemplates = [
    {
      platform: 'Facebook',
      content: `🚀 Je viens de découvrir MBOA, une super plateforme pour acheter et vendre ! 

Rejoignez-moi avec mon code ${affiliateCode} et profitez d'avantages exclusifs ! 

👉 ${baseUrl}?ref=${affiliateCode}

#MBOA #BonPlan #AchatVente`
    },
    {
      platform: 'Twitter',
      content: `🔥 Découvrez MBOA avec mon code de parrainage ${affiliateCode} ! 

Une plateforme géniale pour acheter et vendre en toute sécurité 🛍️

👉 ${baseUrl}?ref=${affiliateCode}

#MBOA #Shopping`
    },
    {
      platform: 'LinkedIn',
      content: `Je recommande vivement MBOA, une plateforme efficace pour l'achat et la vente d'articles.

Inscription avec des avantages en utilisant le code ${affiliateCode} : ${baseUrl}?ref=${affiliateCode}

Une solution pratique pour vos besoins commerciaux.`
    }
  ];

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      toast({
        title: "Copié !",
        description: "Le contenu a été copié dans le presse-papiers.",
        duration: 3000
      });
      setTimeout(() => setCopied(""), 2000);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le contenu",
        variant: "destructive"
      });
    }
  };

  const downloadBanner = (bannerId: string) => {
    // Simuler le téléchargement de bannière
    toast({
      title: "Téléchargement lancé",
      description: "La bannière sera bientôt disponible",
      duration: 3000
    });
  };

  const generateQRCode = () => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(baseUrl + '?ref=' + affiliateCode)}`;
    return qrUrl;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Outils marketing avancés
        </CardTitle>
        <CardDescription>
          Créez du contenu professionnel pour promouvoir votre lien d'affiliation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="banners" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="banners" className="text-xs">
              <Image className="h-3 w-3 mr-1" />
              Bannières
            </TabsTrigger>
            <TabsTrigger value="social" className="text-xs">
              <Share2 className="h-3 w-3 mr-1" />
              Social
            </TabsTrigger>
            <TabsTrigger value="email" className="text-xs">
              <Mail className="h-3 w-3 mr-1" />
              Email
            </TabsTrigger>
            <TabsTrigger value="widgets" className="text-xs">
              <Code2 className="h-3 w-3 mr-1" />
              Widgets
            </TabsTrigger>
          </TabsList>

          <TabsContent value="banners" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              {bannerTemplates.map((banner, index) => (
                <div
                  key={banner.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedBanner === index
                      ? 'border-mboa-orange bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedBanner(index)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{banner.name}</h4>
                    <Badge variant="outline" className="text-xs">{banner.size}</Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">{banner.description}</p>
                  
                  {/* Aperçu de la bannière */}
                  <div className={`h-16 rounded border-2 border-dashed flex items-center justify-center text-xs text-gray-500 ${
                    banner.color === 'orange' ? 'bg-orange-100 border-orange-300' :
                    banner.color === 'blue' ? 'bg-blue-100 border-blue-300' :
                    'bg-gradient-to-r from-orange-100 to-red-100 border-orange-300'
                  }`}>
                    Aperçu bannière
                  </div>
                  
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadBanner(banner.id);
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full mt-3 text-xs"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Télécharger
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="social" className="space-y-4">
            {socialTemplates.map((template, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-sm">{template.platform}</h4>
                  <Button
                    onClick={() => copyToClipboard(template.content, `social_${index}`)}
                    variant="outline"
                    size="sm"
                  >
                    {copied === `social_${index}` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
                <div className="bg-gray-50 p-3 rounded text-sm whitespace-pre-line">
                  {template.content}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="email" className="space-y-4">
            {emailTemplates.map((template, index) => (
              <div key={template.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-sm">{template.name}</h4>
                  <Button
                    onClick={() => copyToClipboard(`Sujet: ${template.subject}\n\n${template.content}`, `email_${index}`)}
                    variant="outline"
                    size="sm"
                  >
                    {copied === `email_${index}` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs font-medium text-gray-600">Sujet :</label>
                    <div className="bg-gray-50 p-2 rounded text-sm">{template.subject}</div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">Contenu :</label>
                    <div className="bg-gray-50 p-3 rounded text-sm whitespace-pre-line max-h-32 overflow-y-auto">
                      {template.content}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="widgets" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* QR Code */}
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium text-sm mb-3">Code QR</h4>
                <div className="flex flex-col items-center space-y-3">
                  <img 
                    src={generateQRCode()} 
                    alt="QR Code" 
                    className="w-32 h-32 border rounded"
                  />
                  <Button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = generateQRCode();
                      link.download = `qr-code-${affiliateCode}.png`;
                      link.click();
                    }}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Télécharger QR
                  </Button>
                </div>
              </div>

              {/* Widget HTML */}
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium text-sm mb-3">Widget HTML</h4>
                <div className="space-y-3">
                  <div className="bg-gray-900 text-green-400 p-3 rounded text-xs font-mono">
                    {`<a href="${baseUrl}?ref=${affiliateCode}" 
   target="_blank" 
   style="background: #ff6b35; color: white; 
          padding: 10px 20px; border-radius: 5px; 
          text-decoration: none;">
  Rejoindre MBOA
</a>`}
                  </div>
                  <Button
                    onClick={() => copyToClipboard(`<a href="${baseUrl}?ref=${affiliateCode}" target="_blank" style="background: #ff6b35; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">Rejoindre MBOA</a>`, 'widget')}
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                  >
                    {copied === 'widget' ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                    Copier le code
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AffiliateMarketingTools;

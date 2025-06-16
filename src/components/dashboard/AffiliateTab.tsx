
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Gift, Share2, Copy, Check, TrendingUp } from "lucide-react";
import { getAffiliateStats, AffiliateStats } from "@/services/affiliateService";
import { useToast } from "@/hooks/use-toast";
import AffiliateShareLinks from "./AffiliateShareLinks";
import AffiliateRealTimeStats from "./AffiliateRealTimeStats";
import AffiliateNotifications from "./AffiliateNotifications";

interface AffiliateTabProps {
  userId: string;
}

const AffiliateTab: React.FC<AffiliateTabProps> = ({ userId }) => {
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const affiliateStats = await getAffiliateStats(userId);
        setStats(affiliateStats);
      } catch (error) {
        console.error("Error fetching affiliate stats:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les statistiques d'affiliation",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchStats();
    }
  }, [userId, toast]);

  const copyAffiliateCode = async () => {
    if (!stats?.affiliate_code) return;

    try {
      await navigator.clipboard.writeText(stats.affiliate_code);
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
    if (!stats?.affiliate_code) return;

    const shareData = {
      title: "Rejoignez MBOA !",
      text: `Utilisez mon code de parrainage ${stats.affiliate_code} pour vous inscrire sur MBOA et bénéficier d'avantages exclusifs !`,
      url: `${window.location.origin}/connexion?ref=${stats.affiliate_code}`
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

  const handleStatsUpdate = (newStats: AffiliateStats) => {
    setStats(newStats);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Impossible de charger les données d'affiliation</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification des nouvelles fonctionnalités */}
      <AffiliateNotifications />

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Points totaux</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-mboa-orange">{stats.total_points}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Points gagnés</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_earned}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Parrainages niveau 1</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.level_1_referrals}</div>
            <p className="text-xs text-muted-foreground">+2 points chacun</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Parrainages niveau 2</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.level_2_referrals}</div>
            <p className="text-xs text-muted-foreground">+1 point chacun</p>
          </CardContent>
        </Card>
      </div>

      {/* Real-time stats and share links */}
      <div className="grid gap-6 md:grid-cols-2">
        <AffiliateRealTimeStats 
          userId={userId} 
          initialStats={stats}
          onStatsUpdate={handleStatsUpdate}
        />
        
        <AffiliateShareLinks affiliateCode={stats.affiliate_code} />
      </div>

      {/* Affiliate Code Section */}
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
              value={stats.affiliate_code}
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

      {/* How to earn more section */}
      <Card>
        <CardHeader>
          <CardTitle>Comment gagner plus de points ?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="bg-mboa-orange text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
            <div>
              <p className="font-medium">Utilisez les liens de partage</p>
              <p className="text-sm text-gray-600">Partagez vos liens personnalisés sur WhatsApp, email ou réseaux sociaux</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-mboa-orange text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
            <div>
              <p className="font-medium">Ils s'inscrivent avec votre code</p>
              <p className="text-sm text-gray-600">Chaque inscription avec votre code vous rapporte 2 points automatiquement</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-mboa-orange text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
            <div>
              <p className="font-medium">Bonus niveau 2 automatique</p>
              <p className="text-sm text-gray-600">Quand vos filleuls parrainent à leur tour, vous gagnez 1 point supplémentaire</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AffiliateTab;

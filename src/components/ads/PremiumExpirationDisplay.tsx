
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle } from 'lucide-react';
import { getPremiumTimeRemaining } from '@/services/premiumExpirationService';

interface PremiumExpirationDisplayProps {
  adId: string;
  adType: string;
  className?: string;
}

const PremiumExpirationDisplay: React.FC<PremiumExpirationDisplayProps> = ({ 
  adId, 
  adType, 
  className 
}) => {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (adType === 'standard') {
      setIsLoading(false);
      return;
    }

    const fetchTimeRemaining = async () => {
      try {
        const remaining = await getPremiumTimeRemaining(adId);
        setTimeRemaining(remaining);
      } catch (error) {
        console.error('Error fetching time remaining:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimeRemaining();

    // Update every minute
    const interval = setInterval(fetchTimeRemaining, 60000);
    return () => clearInterval(interval);
  }, [adId, adType]);

  if (isLoading || adType === 'standard' || timeRemaining === null) {
    return null;
  }

  if (timeRemaining <= 0) {
    return (
      <Badge variant="destructive" className={className}>
        <AlertTriangle className="w-3 h-3 mr-1" />
        Expiré
      </Badge>
    );
  }

  const formatTimeRemaining = (ms: number): string => {
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days}j ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const isExpiringSoon = timeRemaining < 24 * 60 * 60 * 1000; // Less than 24 hours

  return (
    <Badge 
      variant={isExpiringSoon ? "destructive" : "secondary"} 
      className={className}
    >
      <Clock className="w-3 h-3 mr-1" />
      {formatTimeRemaining(timeRemaining)}
    </Badge>
  );
};

export default PremiumExpirationDisplay;

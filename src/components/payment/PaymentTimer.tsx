
import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PaymentTimerProps {
  expiresAt: string;
  onExpired?: () => void;
  warningThreshold?: number; // minutes before expiration to show warning
  className?: string;
}

export const PaymentTimer: React.FC<PaymentTimerProps> = ({
  expiresAt,
  onExpired,
  warningThreshold = 5,
  className
}) => {
  const [timeRemaining, setTimeRemaining] = useState<{
    total: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
    isWarning: boolean;
  }>({
    total: 0,
    minutes: 0,
    seconds: 0,
    isExpired: true,
    isWarning: false
  });

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        const expired = {
          total: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
          isWarning: false
        };
        setTimeRemaining(expired);
        if (onExpired) {
          onExpired();
        }
        return;
      }

      const totalMinutes = Math.floor(diff / (1000 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      const isWarning = totalMinutes <= warningThreshold;

      setTimeRemaining({
        total: diff,
        minutes,
        seconds,
        isExpired: false,
        isWarning
      });
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpired, warningThreshold]);

  const formatTime = (minutes: number, seconds: number) => {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getProgressValue = () => {
    const totalDuration = 30 * 60 * 1000; // 30 minutes in ms
    return ((totalDuration - timeRemaining.total) / totalDuration) * 100;
  };

  const getStatusColor = () => {
    if (timeRemaining.isExpired) return 'text-red-600 bg-red-50 border-red-200';
    if (timeRemaining.isWarning) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getProgressColor = () => {
    if (timeRemaining.isExpired) return 'bg-red-500';
    if (timeRemaining.isWarning) return 'bg-orange-500';
    return 'bg-green-500';
  };

  if (timeRemaining.isExpired) {
    return (
      <Card className={cn("border-red-200 bg-red-50", className)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div className="flex-1">
              <Badge variant="destructive">
                Session expirée
              </Badge>
              <p className="text-sm text-red-700 mt-1">
                La session de paiement a expiré. Veuillez recommencer.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-2", getStatusColor(), className)}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className={cn(
                "h-4 w-4",
                timeRemaining.isWarning ? "text-orange-600" : "text-green-600"
              )} />
              <span className="text-sm font-medium">
                Temps restant
              </span>
            </div>
            <Badge className={cn(
              "font-mono text-sm",
              timeRemaining.isWarning 
                ? "bg-orange-100 text-orange-800 border-orange-200"
                : "bg-green-100 text-green-800 border-green-200"
            )}>
              {formatTime(timeRemaining.minutes, timeRemaining.seconds)}
            </Badge>
          </div>

          <div className="space-y-2">
            <Progress 
              value={getProgressValue()}
              className="h-2"
            />
            {timeRemaining.isWarning && (
              <p className="text-xs text-orange-700">
                ⚠️ Session bientôt expirée - Complétez votre paiement rapidement
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentTimer;


import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface TimeRemaining {
  minutes: number;
  seconds: number;
  expired: boolean;
}

interface PaymentProgressCardProps {
  transaction: any;
  timeRemaining: TimeRemaining | null;
  isExpiringSoon: boolean;
}

const PaymentProgressCard: React.FC<PaymentProgressCardProps> = ({
  transaction,
  timeRemaining,
  isExpiringSoon
}) => {
  const getProgressValue = () => {
    if (!transaction || !timeRemaining) return 0;
    
    if (timeRemaining.expired) return 0;
    
    const totalSeconds = 24 * 60 * 60; // 24 hours in seconds
    const remainingSeconds = timeRemaining.minutes * 60 + timeRemaining.seconds;
    
    return Math.max(0, (remainingSeconds / totalSeconds) * 100);
  };

  // Only show for pending transactions with time remaining
  if (transaction?.status !== 'pending' || !timeRemaining || timeRemaining.expired) {
    return null;
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Temps restant</span>
            <span className={isExpiringSoon ? 'text-red-600 font-medium' : 'text-gray-600'}>
              {timeRemaining.minutes}m {timeRemaining.seconds}s
            </span>
          </div>
          <Progress 
            value={getProgressValue()} 
            className={`h-2 ${isExpiringSoon ? 'bg-red-100' : ''}`}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentProgressCard;


import React from 'react';
import { CheckCircle, Circle, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaymentStep {
  id: string;
  label: string;
  description?: string;
  status: 'completed' | 'current' | 'pending' | 'error';
}

interface PaymentStepsIndicatorProps {
  currentStep: string;
  paymentStatus: 'loading' | 'pending' | 'success' | 'failed' | 'expired' | 'error';
  className?: string;
}

export const PaymentStepsIndicator: React.FC<PaymentStepsIndicatorProps> = ({
  currentStep,
  paymentStatus,
  className
}) => {
  const getSteps = (): PaymentStep[] => {
    const baseSteps = [
      {
        id: 'initiation',
        label: 'Initiation du paiement',
        description: 'Préparation de la transaction'
      },
      {
        id: 'processing',
        label: 'Traitement',
        description: 'Connexion avec Lygos'
      },
      {
        id: 'confirmation',
        label: 'Confirmation',
        description: 'Validation du paiement'
      }
    ];

    return baseSteps.map(step => {
      let status: PaymentStep['status'] = 'pending';
      
      if (paymentStatus === 'failed' || paymentStatus === 'error') {
        if (step.id === currentStep) {
          status = 'error';
        } else if (step.id === 'initiation') {
          status = 'completed';
        }
      } else if (paymentStatus === 'success') {
        status = 'completed';
      } else if (step.id === currentStep) {
        status = 'current';
      } else if (step.id === 'initiation' && currentStep !== 'initiation') {
        status = 'completed';
      }

      return { ...step, status };
    });
  };

  const steps = getSteps();

  const getStepIcon = (status: PaymentStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'current':
        return <Clock className="h-5 w-5 text-blue-600 animate-pulse" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStepClasses = (status: PaymentStep['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-800 bg-green-50 border-green-200';
      case 'current':
        return 'text-blue-800 bg-blue-50 border-blue-200';
      case 'error':
        return 'text-red-800 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            {getStepIcon(step.status)}
          </div>
          <div className="flex-1 min-w-0">
            <div className={cn(
              "p-3 rounded-lg border transition-colors",
              getStepClasses(step.status)
            )}>
              <div className="font-medium text-sm">
                {step.label}
              </div>
              {step.description && (
                <div className="text-xs mt-1 opacity-75">
                  {step.description}
                </div>
              )}
            </div>
          </div>
          {index < steps.length - 1 && (
            <div className="w-px h-6 bg-gray-200 ml-2 mt-8" />
          )}
        </div>
      ))}
    </div>
  );
};

export default PaymentStepsIndicator;

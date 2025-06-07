
import React from 'react';
import { CheckCircle, Circle, Clock } from 'lucide-react';

interface PaymentStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'pending';
}

interface PaymentProgressTrackerProps {
  currentStep: number;
  steps?: PaymentStep[];
}

const defaultSteps: PaymentStep[] = [
  {
    id: 'initiation',
    title: 'Initialisation',
    description: 'Préparation du paiement',
    status: 'completed'
  },
  {
    id: 'processing',
    title: 'Traitement',
    description: 'Vérification du paiement',
    status: 'current'
  },
  {
    id: 'completion',
    title: 'Finalisation',
    description: 'Création de l\'annonce',
    status: 'pending'
  }
];

const PaymentProgressTracker: React.FC<PaymentProgressTrackerProps> = ({ 
  currentStep, 
  steps = defaultSteps 
}) => {
  const getStepStatus = (index: number): 'completed' | 'current' | 'pending' => {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'current';
    return 'pending';
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'current':
        return <Clock className="h-5 w-5 text-blue-600 animate-pulse" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const isLast = index === steps.length - 1;
          
          return (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2
                  ${status === 'completed' 
                    ? 'bg-green-100 border-green-600' 
                    : status === 'current'
                    ? 'bg-blue-100 border-blue-600'
                    : 'bg-gray-100 border-gray-300'
                  }
                `}>
                  {getStepIcon(status)}
                </div>
                <div className="mt-2 text-center">
                  <p className={`text-xs font-medium ${
                    status === 'completed' ? 'text-green-600' :
                    status === 'current' ? 'text-blue-600' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {step.description}
                  </p>
                </div>
              </div>
              
              {!isLast && (
                <div className={`
                  flex-1 h-0.5 mx-4 mt-[-20px]
                  ${index < currentStep ? 'bg-green-600' : 'bg-gray-300'}
                `} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PaymentProgressTracker;

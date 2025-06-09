
import React from "react";
import { CheckCircle, Circle, AlertCircle } from "lucide-react";

interface FormStep {
  id: string;
  label: string;
  completed: boolean;
  hasError?: boolean;
}

interface FormProgressIndicatorProps {
  steps: FormStep[];
  currentStep: string;
  className?: string;
}

const FormProgressIndicator: React.FC<FormProgressIndicatorProps> = ({ 
  steps, 
  currentStep, 
  className = "" 
}) => {
  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          Progression de l'inscription
        </span>
        <span className="text-xs text-gray-500">
          {steps.filter(s => s.completed).length}/{steps.length} complété
        </span>
      </div>
      
      <div className="flex items-center space-x-2">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.completed;
          const hasError = step.hasError;
          
          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div className={`
                  relative flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200
                  ${isCompleted && !hasError ? 'bg-green-500 border-green-500' : 
                    hasError ? 'bg-red-500 border-red-500' :
                    isActive ? 'bg-mboa-orange border-mboa-orange' : 
                    'bg-gray-200 border-gray-300'}
                `}>
                  {isCompleted && !hasError ? (
                    <CheckCircle className="w-5 h-5 text-white" />
                  ) : hasError ? (
                    <AlertCircle className="w-4 h-4 text-white" />
                  ) : (
                    <Circle className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                  )}
                </div>
                
                <span className={`
                  mt-1 text-xs text-center max-w-16 leading-tight
                  ${isActive ? 'text-mboa-orange font-medium' : 
                    isCompleted ? 'text-green-600' : 
                    hasError ? 'text-red-600' : 
                    'text-gray-500'}
                `}>
                  {step.label}
                </span>
              </div>
              
              {index < steps.length - 1 && (
                <div className={`
                  flex-1 h-0.5 mx-1 transition-all duration-200
                  ${index < currentStepIndex || steps[index + 1]?.completed ? 
                    'bg-green-500' : 'bg-gray-300'}
                `} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default FormProgressIndicator;

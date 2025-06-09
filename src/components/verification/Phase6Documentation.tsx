
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Phase6Header from './components/Phase6Header';
import Phase6Objectives from './components/Phase6Objectives';
import Phase6PlatformState from './components/Phase6PlatformState';
import Phase6PhasesSummary from './components/Phase6PhasesSummary';
import Phase6UserBenefits from './components/Phase6UserBenefits';
import Phase6Certification from './components/Phase6Certification';

const Phase6Documentation: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-green-500">
        <Phase6Header />
        
        <CardContent className="space-y-6">
          <Phase6Objectives />
          <Phase6PlatformState />
          <Phase6PhasesSummary />
          <Phase6UserBenefits />
          <Phase6Certification />
        </CardContent>
      </Card>
    </div>
  );
};

export default Phase6Documentation;


import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useVerificationTests } from './hooks/useVerificationTests';
import VerificationHeader from './components/VerificationHeader';
import VerificationStats from './components/VerificationStats';
import VerificationTestItem from './components/VerificationTestItem';

const MonetbilRemovalVerification: React.FC = () => {
  const { tests, isRunning, runAllTests } = useVerificationTests();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <VerificationHeader isRunning={isRunning} onRunTests={runAllTests} />
          <VerificationStats tests={tests} />
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {tests.map((test) => (
              <VerificationTestItem key={test.id} test={test} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MonetbilRemovalVerification;

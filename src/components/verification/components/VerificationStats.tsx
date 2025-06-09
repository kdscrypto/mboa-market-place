
import React from 'react';
import { VerificationTest } from '../types/verificationTypes';

interface VerificationStatsProps {
  tests: VerificationTest[];
}

const VerificationStats: React.FC<VerificationStatsProps> = ({ tests }) => {
  const successCount = tests.filter(t => t.status === 'success').length;
  const warningCount = tests.filter(t => t.status === 'warning').length;
  const errorCount = tests.filter(t => t.status === 'error').length;

  if (tests.length === 0) return null;

  return (
    <div className="flex gap-4 text-sm">
      <span className="text-green-600">✓ {successCount} Succès</span>
      <span className="text-yellow-600">⚠ {warningCount} Avertissements</span>
      <span className="text-red-600">✗ {errorCount} Échecs</span>
    </div>
  );
};

export default VerificationStats;

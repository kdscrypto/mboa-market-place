
export interface FormTimingResult {
  isSuspicious: boolean;
  reason?: string;
}

export const checkFormSubmissionTiming = (
  formStartTime: number,
  submissionTime: number
): FormTimingResult => {
  const submissionDuration = submissionTime - formStartTime;
  
  // Soumission trop rapide (moins de 2 secondes)
  if (submissionDuration < 2000) {
    return {
      isSuspicious: true,
      reason: 'Form submitted too quickly (possible bot)'
    };
  }
  
  // Soumission trop lente (plus de 30 minutes)
  if (submissionDuration > 30 * 60 * 1000) {
    return {
      isSuspicious: true,
      reason: 'Form submitted after extended period (possible session hijacking)'
    };
  }
  
  return { isSuspicious: false };
};

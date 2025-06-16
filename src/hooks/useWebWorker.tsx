
import { useEffect, useRef, useState } from 'react';

interface WebWorkerHook<T = any, R = any> {
  postMessage: (data: T) => void;
  terminate: () => void;
  isLoading: boolean;
  result: R | null;
  error: string | null;
}

export const useWebWorker = <T = any, R = any>(
  workerScript: string
): WebWorkerHook<T, R> => {
  const workerRef = useRef<Worker | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<R | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Create worker from inline script
    const blob = new Blob([workerScript], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    
    try {
      workerRef.current = new Worker(workerUrl);
      
      workerRef.current.onmessage = (event) => {
        setIsLoading(false);
        if (event.data.error) {
          setError(event.data.error);
          setResult(null);
        } else {
          setResult(event.data.result);
          setError(null);
        }
      };

      workerRef.current.onerror = (event) => {
        setIsLoading(false);
        setError(event.message || 'Worker error');
        setResult(null);
      };

    } catch (err) {
      setError('Failed to create worker');
      console.error('Worker creation failed:', err);
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        URL.revokeObjectURL(workerUrl);
      }
    };
  }, [workerScript]);

  const postMessage = (data: T) => {
    if (workerRef.current) {
      setIsLoading(true);
      setError(null);
      workerRef.current.postMessage(data);
    } else {
      setError('Worker not available');
    }
  };

  const terminate = () => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
  };

  return {
    postMessage,
    terminate,
    isLoading,
    result,
    error
  };
};

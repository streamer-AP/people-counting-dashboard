import { useState, useEffect, useCallback } from 'react';
import { getAlgorithmHealth } from '../api/counting';
import { AlgorithmHealthResponse } from '../types/counting';

interface UseAlgorithmHealthResult {
  data: AlgorithmHealthResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useAlgorithmHealth = (pollInterval: number = 5000): UseAlgorithmHealthResult => {
  const [data, setData] = useState<AlgorithmHealthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const result = await getAlgorithmHealth();
      setData(result);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch algorithm health');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, pollInterval);
    return () => clearInterval(interval);
  }, [fetchData, pollInterval]);

  return { data, loading, error, refetch: fetchData };
};

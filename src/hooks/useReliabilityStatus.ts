import { useState, useEffect, useCallback } from 'react';
import { getReliabilityStatus } from '../api/counting';
import { ReliabilityStatusResponse } from '../types/counting';

interface UseReliabilityStatusResult {
  data: ReliabilityStatusResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useReliabilityStatus = (pollInterval: number = 5000): UseReliabilityStatusResult => {
  const [data, setData] = useState<ReliabilityStatusResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const result = await getReliabilityStatus();
      setData(result);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch reliability status');
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

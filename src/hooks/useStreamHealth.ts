import { useState, useEffect, useCallback } from 'react';
import { getStreamHealth } from '../api/counting';
import { StreamHealthResponse } from '../types/counting';

interface UseStreamHealthResult {
  data: StreamHealthResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useStreamHealth = (pollInterval: number = 5000): UseStreamHealthResult => {
  const [data, setData] = useState<StreamHealthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const result = await getStreamHealth();
      setData(result);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch stream health');
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

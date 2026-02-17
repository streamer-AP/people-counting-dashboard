import { useState, useEffect, useCallback } from 'react';
import { getLatestData } from '../api/counting';
import { CountingData } from '../types/counting';
import { POLLING_INTERVAL } from '../utils/constants';

interface UseLatestDataResult {
  data: CountingData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useLatestData = (): UseLatestDataResult => {
  const [data, setData] = useState<CountingData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const result = await getLatestData();
      setData(result);
      setError(null);
      setLoading(false);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('No data available');
      } else {
        setError(err.message || 'Failed to fetch data');
      }
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchData();

    // Set up polling
    const interval = setInterval(fetchData, POLLING_INTERVAL);

    // Cleanup
    return () => {
      clearInterval(interval);
    };
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
};

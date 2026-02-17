import { useState, useEffect, useCallback } from 'react';
import { getHistoryData } from '../api/counting';
import { HistoryData } from '../types/counting';
import { DEFAULT_HISTORY_LIMIT } from '../utils/constants';

interface UseHistoryResult {
  data: HistoryData | null;
  loading: boolean;
  error: string | null;
  refetch: (limit?: number) => void;
}

export const useHistory = (initialLimit: number = DEFAULT_HISTORY_LIMIT): UseHistoryResult => {
  const [data, setData] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState<number>(initialLimit);

  const fetchData = useCallback(async (newLimit?: number) => {
    const fetchLimit = newLimit !== undefined ? newLimit : limit;
    setLoading(true);
    try {
      const result = await getHistoryData(fetchLimit);
      setData(result);
      setError(null);
      if (newLimit !== undefined) {
        setLimit(newLimit);
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('No historical data available');
      } else {
        setError(err.message || 'Failed to fetch history');
      }
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
};

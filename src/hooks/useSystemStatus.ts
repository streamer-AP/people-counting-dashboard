import { useState, useEffect, useCallback } from 'react';
import { getSystemStatus } from '../api/counting';
import { SystemStatus } from '../types/counting';

interface UseSystemStatusResult {
  status: SystemStatus | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useSystemStatus = (): UseSystemStatusResult => {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const result = await getSystemStatus();
      setStatus(result);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch system status');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();

    // Refresh status every 5 seconds
    const interval = setInterval(fetchStatus, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [fetchStatus]);

  return {
    status,
    loading,
    error,
    refetch: fetchStatus,
  };
};

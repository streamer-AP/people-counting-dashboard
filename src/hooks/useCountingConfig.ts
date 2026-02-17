import { useState, useEffect, useCallback } from 'react';
import { getCountingConfig, updateCountingConfig } from '../api/counting';
import { CountingConfig, CountingConfigResponse } from '../types/counting';

interface UseCountingConfigResult {
  config: CountingConfigResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  update: (data: Partial<CountingConfig>) => Promise<CountingConfigResponse>;
}

export const useCountingConfig = (): UseCountingConfigResult => {
  const [config, setConfig] = useState<CountingConfigResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    try {
      const result = await getCountingConfig();
      setConfig(result);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch counting config');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const update = useCallback(async (
    data: Partial<CountingConfig>
  ): Promise<CountingConfigResponse> => {
    const result = await updateCountingConfig(data);
    setConfig(result);
    return result;
  }, []);

  return { config, loading, error, refetch: fetchConfig, update };
};

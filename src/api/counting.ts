import client, { streamClient } from './client';
import {
  CountingData,
  SystemStatus,
  HistoryData,
  StatsData,
  HealthData,
  RecordingsResponse,
  MultiviewResult,
  SingleviewResult,
  UmbrellaResult,
  UmbrellaHistoryResponse,
  StreamHealthResponse,
  StreamAlertsResponse,
  StreamStatsResponse,
  ReliabilityStatusResponse,
  ReliabilityConfig,
  ReliabilityConfigResponse,
  AlgorithmHealthResponse,
  CountingConfig,
  CountingConfigResponse,
  CountingAlertsResponse,
  AcknowledgeAlertsResponse,
  AlgorithmLatestRequestResponse,
  AlgorithmLatestResponseResponse,
} from '../types/counting';

/**
 * Get the latest counting data
 */
export const getLatestData = async (): Promise<CountingData> => {
  const response = await client.get<CountingData>('/latest');
  return response.data;
};

/**
 * Get historical data
 * @param limit - Number of records to fetch (default: 50)
 */
export const getHistoryData = async (limit: number = 50): Promise<HistoryData> => {
  const response = await client.get<CountingData[] | HistoryData>('/history', {
    params: { limit },
  });
  // API may return CountingData[] directly or { count, data } wrapper
  if (Array.isArray(response.data)) {
    return { data: response.data, count: response.data.length };
  }
  return response.data;
};

/**
 * Get historical data with time range
 * @param startTime - Start time (ISO format)
 * @param endTime - End time (ISO format)
 * @param limit - Number of records to fetch (default: 100)
 */
export const getHistoryByTimeRange = async (
  startTime?: string,
  endTime?: string,
  limit: number = 100
): Promise<CountingData[]> => {
  const response = await client.get<CountingData[]>('/history', {
    params: {
      start_time: startTime,
      end_time: endTime,
      limit,
    },
  });
  return response.data;
};

/**
 * Get system status
 */
export const getSystemStatus = async (): Promise<SystemStatus> => {
  const response = await client.get<SystemStatus>('/status');
  return response.data;
};

/**
 * Get statistics
 */
export const getStats = async (): Promise<StatsData> => {
  const response = await client.get<StatsData>('/stats');
  return response.data;
};

/**
 * Get health check
 */
export const getHealth = async (): Promise<HealthData> => {
  const response = await client.get<HealthData>('/health');
  return response.data;
};

/**
 * Get recent recordings for a camera
 * @param camera - Camera name (e.g., 'camera_1')
 * @param limit - Number of recordings to fetch (default: 5)
 */
export const getRecentRecordings = async (camera: string, limit: number = 5): Promise<RecordingsResponse> => {
  const response = await client.get<RecordingsResponse>('/recordings/recent', {
    params: { camera, limit },
  });
  return response.data;
};

// ===== Multiview Counting =====

export const getMultiviewResult = async (): Promise<MultiviewResult> => {
  const response = await client.get<MultiviewResult>('/multiview');
  return response.data;
};

// ===== Singleview Counting =====

export const getSingleviewResult = async (): Promise<SingleviewResult> => {
  const response = await client.get<SingleviewResult>('/singleview');
  return response.data;
};

// ===== Umbrella Detection =====

export const getUmbrellaResult = async (): Promise<UmbrellaResult> => {
  const response = await client.get<UmbrellaResult>('/umbrella');
  return response.data;
};

export const getUmbrellaHistory = async (
  limit?: number,
  start?: string,
  end?: string
): Promise<UmbrellaHistoryResponse> => {
  const response = await client.get<UmbrellaHistoryResponse>('/umbrella/history', {
    params: { limit, start, end },
  });
  return response.data;
};

// ===== Stream Monitoring =====

export const getStreamHealth = async (): Promise<StreamHealthResponse> => {
  const response = await streamClient.get<StreamHealthResponse>('/stream/health');
  return response.data;
};

export const getStreamAlerts = async (
  limit: number = 100,
  type?: 'disconnected' | 'reconnected'
): Promise<StreamAlertsResponse> => {
  const response = await streamClient.get<StreamAlertsResponse>('/stream/alerts', {
    params: { limit, type },
  });
  return response.data;
};

export const getStreamStats = async (): Promise<StreamStatsResponse> => {
  const response = await streamClient.get<StreamStatsResponse>('/stream/stats');
  return response.data;
};

// ===== Reliability =====

export const getReliabilityStatus = async (): Promise<ReliabilityStatusResponse> => {
  const response = await client.get<ReliabilityStatusResponse>('/reliability/status');
  return response.data;
};

export const getReliabilityConfig = async (): Promise<ReliabilityConfigResponse> => {
  const response = await client.get<ReliabilityConfigResponse>('/reliability/config');
  return response.data;
};

export const updateReliabilityConfig = async (
  config: Partial<ReliabilityConfig>
): Promise<ReliabilityConfigResponse> => {
  const response = await client.put<ReliabilityConfigResponse>('/reliability/config', config);
  return response.data;
};

// ===== Algorithm Health =====

export const getAlgorithmHealth = async (): Promise<AlgorithmHealthResponse> => {
  const response = await client.get<AlgorithmHealthResponse>('/algorithm/health');
  return response.data;
};

// ===== Counting Service =====

export const getCountingConfig = async (): Promise<CountingConfigResponse> => {
  const response = await client.get<CountingConfigResponse>('/counting/config');
  return response.data;
};

export const updateCountingConfig = async (
  config: Partial<CountingConfig>
): Promise<CountingConfigResponse> => {
  const response = await client.put<CountingConfigResponse>('/counting/config', config);
  return response.data;
};

export const getCountingAlerts = async (
  limit: number = 100,
  unacknowledged_only: boolean = false
): Promise<CountingAlertsResponse> => {
  const response = await client.get<CountingAlertsResponse>('/counting/alerts', {
    params: { limit, unacknowledged_only },
  });
  return response.data;
};

export const acknowledgeCountingAlerts = async (
  alertIds?: string[]
): Promise<AcknowledgeAlertsResponse> => {
  const response = await client.post<AcknowledgeAlertsResponse>(
    '/counting/alerts/acknowledge',
    { alert_ids: alertIds }
  );
  return response.data;
};

// ===== Algorithm Debug (Request/Response) =====

export const getAlgorithmLatestRequest = async (): Promise<AlgorithmLatestRequestResponse> => {
  const response = await client.get<AlgorithmLatestRequestResponse>('/algorithm/latest-request');
  return response.data;
};

export const getAlgorithmLatestResponse = async (
  type: 'multiview' | 'umbrella'
): Promise<AlgorithmLatestResponseResponse> => {
  const response = await client.get<AlgorithmLatestResponseResponse>('/algorithm/latest-response', {
    params: { type },
  });
  return response.data;
};

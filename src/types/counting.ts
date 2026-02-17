export interface CountingData {
  Timestamp: string;
  Count: number;
  Confidence: number;
  CamPtz: boolean[];      // 19 cameras
  CamStream: boolean[];   // 19 cameras
  Image: string;          // Base64
}

export interface SystemStatus {
  status: string;
  timestamp: string;
  stats: {
    start_time: string;
    total_sent: number;
    total_success: number;
    total_failed: number;
    last_update: string;
  };
  has_data: boolean;
  history_count: number;
}

export interface HistoryData {
  data: CountingData[];
  count: number;
}

export interface StatsData {
  total_sent: number;
  total_success: number;
  total_failed: number;
  success_rate: number;
  start_time: string;
  last_update: string;
}

export interface HealthData {
  status: string;
  timestamp: string;
}

export interface Recording {
  camera: string;
  created_at: string;
  download_url: string;
  filename: string;
  modified_at: string;
  size_bytes: number;
  size_mb: number;
  timestamp: string;
}

export interface RecordingsResponse {
  directory: string;
  recordings: Recording[];
  status: string;
  total: number;
}

// ===== Multiview Counting =====

export interface MultiviewCountingEntry {
  camera_ids: number[];
  count: number;
  reliable: boolean;
  reason: string;
  density_map?: string;
}

export interface MultiviewResult {
  status: string;
  result: {
    results: MultiviewCountingEntry[];
    status: string;
    updated_at: string;
    service_type: string;
    processing_time_ms: number;
    processing_timestamp: number;
    reference_timestamp: number;
  };
}

// ===== Singleview Counting =====

export interface SingleviewCameraEntry {
  camera_id: number;
  count: number;
  data_confidence_reliable: boolean;
  data_confidence_reason: string;
  status: string;
  density_map_path?: string;
  coordinates?: number[];
  frame_number?: number;
  stream_name?: string;
  timestamp?: number;
}

export interface SingleviewResult {
  status: string;
  result: {
    service_type: string;
    status: string;
    total_count: number;
    processing_time_ms: number;
    processing_timestamp?: number;
    reference_timestamp?: number;
    density_map?: string;
    results: SingleviewCameraEntry[];
    updated_at: string;
  };
}

// ===== Umbrella Detection =====

export interface UmbrellaBboxDetection {
  bbox: number[];
  class: string;
  confidence: number;
}

export interface UmbrellaCameraResult {
  camera_id: number;
  stream_name: string;
  umbrella_count: number;
  detections: UmbrellaBboxDetection[];
  frame_number: number;
  timestamp: number;
}

export interface UmbrellaResult {
  status: string;
  result: {
    results: UmbrellaCameraResult[];
    status: string;
    updated_at: string;
    service_type: string;
    processing_time_ms: number;
    reference_timestamp: number;
    frames_processed: number;
    frames_total: number;
    error_message: string | null;
    timing_breakdown: {
      decode_time_ms: number;
      format_time_ms: number;
      inference_time_ms: number;
      per_frame_avg_ms: number;
      total_time_ms: number;
    };
  };
}

export interface UmbrellaHistoryResponse {
  status: string;
  count: number;
  results: UmbrellaResult[];
}

// ===== Stream Monitoring =====

export interface StreamStatus {
  is_healthy: boolean;
  last_frame_time: number;
  stream_name: string;
  disconnected_at: string | null;
  reconnected_at: string | null;
  total_disconnections: number;
  total_frames: number;
}

export interface StreamHealthResponse {
  status: string;
  timestamp: string;
  summary: {
    total_streams: number;
    active_streams: number;
    inactive_streams: number;
    total_disconnections: number;
  };
  active: string[];
  inactive: string[];
  streams: Record<string, StreamStatus>;
}

export interface StreamAlert {
  stream_name: string;
  alert_type: 'disconnected' | 'reconnected' | 'high_latency';
  timestamp: string;
  details: Record<string, unknown>;
}

export interface StreamAlertsResponse {
  status: string;
  count: number;
  alerts: StreamAlert[];
}

export interface StreamStatsResponse {
  status: string;
  timestamp: string;
  stats: {
    total_streams: number;
    total_frames_recorded: number;
    total_disconnections: number;
    [key: string]: unknown;
  };
}

// ===== Reliability =====

export interface CameraReliability {
  reliable: boolean;
  umbrella_count: number;
}

export interface ReliabilityStatusResponse {
  status: string;
  timestamp: string;
  reliability: {
    system_reliable: boolean;
    unreliable_camera_count: number;
    camera_threshold: number;
    system_threshold: number;
    cameras: Record<string, CameraReliability>;
  };
}

export interface ReliabilityConfig {
  camera_threshold: number;
  system_threshold: number;
}

export interface ReliabilityConfigResponse {
  status: string;
  config: ReliabilityConfig;
  message?: string;
}

// ===== Algorithm Health =====

export interface AlgorithmServiceStatus {
  status: 'unknown' | 'healthy' | 'unhealthy' | 'error';
  name: string;
  url: string;
  last_success_time: string | null;
  last_error_time: string | null;
  last_error_message: string | null;
  total_requests: number;
  total_success: number;
  total_errors: number;
  success_rate: number;
  last_response_time_ms: number | null;
  avg_response_time_ms: number | null;
  consecutive_errors: number;
}

export interface AlgorithmHealthResponse {
  status: string;
  timestamp: string;
  overall_status: 'healthy' | 'unhealthy' | 'error';
  services: Record<string, AlgorithmServiceStatus>;
}

// ===== Counting Service =====

export interface CountingConfig {
  multiview_enabled: boolean;
  singleview_enabled: boolean;
  multiview_url: string;
  singleview_url: string;
}

export interface CountingConfigResponse {
  status: string;
  timestamp: string;
  config: CountingConfig;
  message?: string;
}

export interface CountingAlert {
  id: string;
  type: 'auto_fallback' | 'service_error' | string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  details: {
    from_service?: string;
    to_service?: string;
    consecutive_errors?: number;
    [key: string]: unknown;
  };
}

export interface CountingAlertsResponse {
  status: string;
  timestamp: string;
  count: number;
  alerts: CountingAlert[];
}

export interface AcknowledgeAlertsResponse {
  status: string;
  message: string;
  acknowledged_count: number;
}

// ===== Algorithm Debug (Request/Response) =====

export interface AlgorithmLatestRequestResponse {
  status: string;
  filename: string;
  timestamp: number;
  request: Record<string, unknown>;
}

export interface AlgorithmLatestResponseResponse {
  status: string;
  type: 'multiview' | 'umbrella';
  filename: string;
  timestamp: number;
  response: Record<string, unknown>;
}

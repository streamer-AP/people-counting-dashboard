export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const STREAM_API_BASE_URL = import.meta.env.VITE_STREAM_API_BASE_URL || API_BASE_URL;

export const CAMERA_COUNT = 19;

export const POLLING_INTERVAL = 1000; // 1 second

export const DEFAULT_HISTORY_LIMIT = 50;

export const HLS_BASE_URL = import.meta.env.VITE_HLS_BASE_URL || '';

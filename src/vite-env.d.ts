/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Backend API URL, e.g. http://localhost:5000/api */
  readonly VITE_API_BASE_URL: string;
  /** Stream Monitor API URL (separate config, points to backend) */
  readonly VITE_STREAM_API_BASE_URL: string;
  /** HLS video stream URL (leave empty for relative path) */
  readonly VITE_HLS_BASE_URL: string;
  /** Authentication username */
  readonly VITE_AUTH_USERNAME: string;
  /** Authentication password */
  readonly VITE_AUTH_PASSWORD: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

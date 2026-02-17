# People Counting Dashboard

[中文文档](README_zh.md)

A real-time monitoring dashboard for camera-based people counting systems. Built with React, TypeScript, and Ant Design.

## Features

- **Real-time Monitoring** - Live dashboard with 1-second polling for people count, confidence levels, and camera status
- **19-Camera Grid** - Visual overview of all camera feeds with PTZ status and stream health indicators
- **Data Analysis** - Historical data visualization with interactive ECharts, time-range filtering, and CSV export
- **Stream Health Monitoring** - Track video stream uptime, disconnection alerts, and recording status
- **Algorithm Service Health** - Monitor computer vision algorithm performance and debug request/response data
- **Reliability Assessment** - System reliability tracking with umbrella detection for weather-based analysis
- **Counting Service Management** - Configure and monitor multiview/singleview counting algorithms
- **Video Recordings** - Browse and manage recorded video streams
- **Bilingual UI** - Full English and Chinese (中文) internationalization support
- **Authentication** - Login-protected dashboard with configurable credentials

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | React 18 + TypeScript |
| Build Tool | Vite 5 |
| UI Library | Ant Design 5 |
| Charts | Apache ECharts 5 |
| Routing | React Router v6 |
| HTTP Client | Axios |
| Video Streaming | HLS.js |
| i18n | i18next + react-i18next |
| Date Utilities | Day.js |

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/people-counting-dashboard.git
cd people-counting-dashboard

# Install dependencies
npm install

# Copy environment config
cp .env.example .env

# Edit .env with your backend API URL
```

### Configuration

Edit the `.env` file to point to your backend API:

```env
# Backend API URL
VITE_API_BASE_URL=http://localhost:5000/api

# Stream Monitor API URL (defaults to VITE_API_BASE_URL if empty)
VITE_STREAM_API_BASE_URL=

# HLS video stream base URL (leave empty for relative path)
VITE_HLS_BASE_URL=

# Authentication credentials
VITE_AUTH_USERNAME=admin
VITE_AUTH_PASSWORD=your-password
```

### Development

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

### Production Build

```bash
npm run build
```

The output will be in the `dist/` directory. Serve it with any static file server or reverse proxy (e.g., Nginx).

## Project Structure

```
people-counting-dashboard/
├── public/
│   └── locales/           # i18n translation files (en/zh)
├── src/
│   ├── api/
│   │   ├── client.ts      # Axios HTTP client with interceptors
│   │   └── counting.ts        # API service layer (25+ endpoints)
│   ├── components/
│   │   ├── CameraGrid/    # 19-camera status grid
│   │   ├── CameraImage/   # Base64 image renderer
│   │   ├── CameraRingLayout/  # Camera ring visualization
│   │   ├── CountDisplay/  # People count & confidence display
│   │   ├── LanguageSwitcher/  # EN/中文 toggle
│   │   ├── LiveStreamPlayer/  # HLS video player
│   │   └── StatCard/      # Reusable statistics card
│   ├── config/
│   │   └── cameraLayout.ts    # Camera layout configuration
│   ├── contexts/
│   │   └── AuthContext.tsx     # Authentication state management
│   ├── hooks/
│   │   ├── useLatestData.ts   # Real-time data polling (1s)
│   │   ├── useHistory.ts      # Historical data fetcher
│   │   ├── useSystemStatus.ts # System status hook
│   │   ├── useStreamHealth.ts # Stream health monitoring
│   │   ├── useReliabilityStatus.ts  # Reliability status
│   │   ├── useAlgorithmHealth.ts    # Algorithm health check
│   │   └── useCountingConfig.ts     # Counting config hook
│   ├── layouts/
│   │   └── MainLayout.tsx     # Sidebar navigation layout
│   ├── pages/
│   │   ├── Dashboard/         # Main real-time monitoring
│   │   ├── CameraMonitor/     # Camera list with filtering
│   │   ├── DataAnalysis/      # Historical charts & trends
│   │   ├── HistoryDetails/    # Detailed history view
│   │   ├── Reliability/       # System reliability & umbrella detection
│   │   ├── AlgorithmHealth/   # Algorithm service status
│   │   ├── AlgorithmDebug/    # Algorithm request/response debugging
│   │   ├── CountingService/   # Counting service management
│   │   ├── VideoRecordings/   # Video recording browser
│   │   ├── RecordMonitor/     # Recording status monitor
│   │   ├── ApiTest/           # API testing interface
│   │   ├── DataSender/        # Data sending utility
│   │   ├── Login/             # Authentication page
│   │   └── NotFound/          # 404 page
│   ├── types/
│   │   └── counting.ts            # TypeScript interfaces
│   ├── utils/
│   │   ├── constants.ts       # App constants & config
│   │   └── dateFormat.ts      # Date formatting utilities
│   ├── App.tsx                # Root component with routing
│   ├── main.tsx               # Entry point
│   ├── i18n.ts                # i18n configuration
│   └── index.css              # Global styles
├── .env.example               # Environment variable template
├── index.html                 # HTML entry point
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Pages

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/` | Real-time people count, camera image, system status |
| Camera Monitor | `/camera` | 19-camera grid with status filtering |
| Record Monitor | `/record-monitor` | Video recording status overview |
| Data Analysis | `/analysis` | Historical charts with time-range selection |
| History Details | `/history` | Detailed historical data with CSV export |
| Reliability | `/reliability` | System reliability & umbrella detection |
| Algorithm Health | `/algorithm` | Algorithm service health monitoring |
| Algorithm Debug | `/algorithm-debug` | Request/response debugging tool |
| Counting Service | `/counting` | Counting algorithm configuration |
| Video Recordings | `/recordings` | Recorded video browser |
| API Test | `/api-test` | API endpoint testing utility |
| Data Sender | `/data-sender` | Data submission tool |

## Backend API

This dashboard requires a compatible backend API. The API should provide the following endpoint groups:

- `/latest` - Latest counting data (people count, confidence, camera status)
- `/history` - Historical data with time range support
- `/status` - System status
- `/health` - Health check
- `/stream/*` - Stream health, alerts, and statistics
- `/reliability/*` - Reliability status and configuration
- `/algorithm/*` - Algorithm health and debug info
- `/counting/*` - Counting service config and alerts
- `/multiview`, `/singleview`, `/umbrella` - Algorithm results

## License

[MIT](LICENSE)

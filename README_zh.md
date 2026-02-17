# People Counting Dashboard

基于摄像头的实时人流计数监控仪表盘，使用 React、TypeScript 和 Ant Design 构建。

## 功能特性

- **实时监控** - 1 秒轮询的实时仪表盘，展示人数统计、置信度和摄像头状态
- **19 路摄像头网格** - 所有摄像头的可视化概览，包含 PTZ 状态和流健康指示
- **数据分析** - 基于 ECharts 的历史数据可视化，支持时间范围筛选和 CSV 导出
- **流健康监控** - 视频流在线时长追踪、断连告警和录制状态监控
- **算法服务健康** - 监控计算机视觉算法性能，调试请求/响应数据
- **可靠性评估** - 系统可靠性追踪，结合雨伞检测进行天气分析
- **计数服务管理** - 配置和监控多视角/单视角计数算法
- **视频录像** - 浏览和管理已录制的视频流
- **双语界面** - 完整的中英文国际化支持
- **身份认证** - 登录保护的仪表盘，支持可配置的凭证

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React 18 + TypeScript |
| 构建工具 | Vite 5 |
| UI 库 | Ant Design 5 |
| 图表 | Apache ECharts 5 |
| 路由 | React Router v6 |
| HTTP 客户端 | Axios |
| 视频流 | HLS.js |
| 国际化 | i18next + react-i18next |
| 日期工具 | Day.js |

## 快速开始

### 环境要求

- Node.js 16+ 及 npm

### 安装

```bash
# 克隆仓库
git clone https://github.com/streamer-AP/-people-counting-dashboard.git
cd people-counting-dashboard

# 安装依赖
npm install

# 复制环境配置
cp .env.example .env

# 编辑 .env 文件，填入后端 API 地址
```

### 配置

编辑 `.env` 文件，指向你的后端 API：

```env
# 后端 API 地址
VITE_API_BASE_URL=http://localhost:5000/api

# 流监控 API 地址（留空则使用 VITE_API_BASE_URL）
VITE_STREAM_API_BASE_URL=

# HLS 视频流基础地址（留空则使用相对路径）
VITE_HLS_BASE_URL=

# 认证凭证
VITE_AUTH_USERNAME=admin
VITE_AUTH_PASSWORD=your-password
```

### 开发

```bash
npm run dev
```

在浏览器中打开 http://localhost:5173 。

### 生产构建

```bash
npm run build
```

构建产物输出到 `dist/` 目录，可使用任意静态文件服务器或反向代理（如 Nginx）部署。

## 项目结构

```
people-counting-dashboard/
├── public/
│   └── locales/           # 国际化翻译文件（en/zh）
├── src/
│   ├── api/
│   │   ├── client.ts      # Axios HTTP 客户端（含拦截器）
│   │   └── counting.ts    # API 服务层（25+ 接口）
│   ├── components/
│   │   ├── CameraGrid/    # 19 路摄像头状态网格
│   │   ├── CameraImage/   # Base64 图片渲染器
│   │   ├── CameraRingLayout/  # 摄像头环形布局
│   │   ├── CountDisplay/  # 人数和置信度展示
│   │   ├── LanguageSwitcher/  # 中英文切换
│   │   ├── LiveStreamPlayer/  # HLS 视频播放器
│   │   └── StatCard/      # 可复用的统计卡片
│   ├── config/
│   │   └── cameraLayout.ts    # 摄像头布局配置
│   ├── contexts/
│   │   └── AuthContext.tsx     # 认证状态管理
│   ├── hooks/
│   │   ├── useLatestData.ts   # 实时数据轮询（1秒）
│   │   ├── useHistory.ts      # 历史数据获取
│   │   ├── useSystemStatus.ts # 系统状态 Hook
│   │   ├── useStreamHealth.ts # 流健康监控
│   │   ├── useReliabilityStatus.ts  # 可靠性状态
│   │   ├── useAlgorithmHealth.ts    # 算法健康检查
│   │   └── useCountingConfig.ts     # 计数配置 Hook
│   ├── layouts/
│   │   └── MainLayout.tsx     # 侧边栏导航布局
│   ├── pages/
│   │   ├── Dashboard/         # 主实时监控页
│   │   ├── CameraMonitor/     # 摄像头列表（含筛选）
│   │   ├── DataAnalysis/      # 历史图表与趋势
│   │   ├── HistoryDetails/    # 历史数据详情
│   │   ├── Reliability/       # 系统可靠性与雨伞检测
│   │   ├── AlgorithmHealth/   # 算法服务状态
│   │   ├── AlgorithmDebug/    # 算法请求/响应调试
│   │   ├── CountingService/   # 计数服务管理
│   │   ├── VideoRecordings/   # 视频录像浏览器
│   │   ├── RecordMonitor/     # 录制状态监控
│   │   ├── ApiTest/           # API 测试工具
│   │   ├── DataSender/        # 数据发送工具
│   │   ├── Login/             # 登录页
│   │   └── NotFound/          # 404 页面
│   ├── types/
│   │   └── counting.ts        # TypeScript 类型定义
│   ├── utils/
│   │   ├── constants.ts       # 应用常量与配置
│   │   └── dateFormat.ts      # 日期格式化工具
│   ├── App.tsx                # 根组件（含路由）
│   ├── main.tsx               # 入口文件
│   ├── i18n.ts                # 国际化配置
│   └── index.css              # 全局样式
├── .env.example               # 环境变量模板
├── index.html                 # HTML 入口
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 页面说明

| 页面 | 路由 | 说明 |
|------|------|------|
| 仪表盘 | `/` | 实时人数统计、摄像头图像、系统状态 |
| 摄像头监控 | `/camera` | 19 路摄像头网格，支持状态筛选 |
| 录制监控 | `/record-monitor` | 视频录制状态概览 |
| 数据分析 | `/analysis` | 支持时间范围选择的历史图表 |
| 历史详情 | `/history` | 详细历史数据，支持 CSV 导出 |
| 可靠性 | `/reliability` | 系统可靠性与雨伞检测 |
| 算法健康 | `/algorithm` | 算法服务健康监控 |
| 算法调试 | `/algorithm-debug` | 请求/响应调试工具 |
| 计数服务 | `/counting` | 计数算法配置 |
| 视频录像 | `/recordings` | 录像浏览器 |
| API 测试 | `/api-test` | API 接口测试工具 |
| 数据发送 | `/data-sender` | 数据提交工具 |

## 后端 API

本仪表盘需要兼容的后端 API，API 应提供以下接口分组：

- `/latest` - 最新计数数据（人数、置信度、摄像头状态）
- `/history` - 支持时间范围查询的历史数据
- `/status` - 系统状态
- `/health` - 健康检查
- `/stream/*` - 流健康、告警和统计
- `/reliability/*` - 可靠性状态和配置
- `/algorithm/*` - 算法健康和调试信息
- `/counting/*` - 计数服务配置和告警
- `/multiview`、`/singleview`、`/umbrella` - 算法结果

## 许可证

[MIT](LICENSE)

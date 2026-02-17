import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CameraMonitor from './pages/CameraMonitor';
import DataAnalysis from './pages/DataAnalysis';
import HistoryDetails from './pages/HistoryDetails';
import ApiTest from './pages/ApiTest';
import DataSender from './pages/DataSender';
import VideoRecordings from './pages/VideoRecordings';
import RecordMonitor from './pages/RecordMonitor';
import Reliability from './pages/Reliability';
import AlgorithmHealth from './pages/AlgorithmHealth';
import CountingService from './pages/CountingService';
import AlgorithmDebug from './pages/AlgorithmDebug';
import NotFound from './pages/NotFound';
import './i18n';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="camera" element={<CameraMonitor />} />
        <Route path="record-monitor" element={<RecordMonitor />} />
        <Route path="analysis" element={<DataAnalysis />} />
        <Route path="history" element={<HistoryDetails />} />
        <Route path="reliability" element={<Reliability />} />
        <Route path="algorithm" element={<AlgorithmHealth />} />
        <Route path="algorithm-debug" element={<AlgorithmDebug />} />
        <Route path="counting" element={<CountingService />} />
        <Route path="recordings" element={<VideoRecordings />} />
        <Route path="api-test" element={<ApiTest />} />
        <Route path="data-sender" element={<DataSender />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
          colorSuccess: '#52c41a',
          colorWarning: '#faad14',
          colorError: '#f5222d',
        },
      }}
    >
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;

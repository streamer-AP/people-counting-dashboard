import React, { useState } from 'react';
import { Layout, Menu, Typography, Button, Space } from 'antd';
import {
  DashboardOutlined,
  CameraOutlined,
  BarChartOutlined,
  ApiOutlined,
  SendOutlined,
  VideoCameraOutlined,
  HistoryOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  WifiOutlined,
  SafetyCertificateOutlined,
  ExperimentOutlined,
  SwapOutlined,
  CodeOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useAuth } from '../contexts/AuthContext';

const { Header, Sider, Content, Footer } = Layout;
const { Title } = Typography;

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const menuItems = [
    {
      key: 'monitoring',
      type: 'group' as const,
      label: t('nav.groupMonitoring'),
      children: [
        {
          key: '/',
          icon: <DashboardOutlined />,
          label: t('nav.dashboard'),
        },
        {
          key: '/camera',
          icon: <CameraOutlined />,
          label: t('nav.camera'),
        },
        {
          key: '/record-monitor',
          icon: <WifiOutlined />,
          label: t('nav.recordMonitor'),
        },
      ],
    },
    {
      key: 'analysis',
      type: 'group' as const,
      label: t('nav.groupAnalysis'),
      children: [
        {
          key: '/analysis',
          icon: <BarChartOutlined />,
          label: t('nav.analysis'),
        },
        {
          key: '/history',
          icon: <HistoryOutlined />,
          label: t('nav.history'),
        },
      ],
    },
    {
      key: 'management',
      type: 'group' as const,
      label: t('nav.groupManagement'),
      children: [
        {
          key: '/reliability',
          icon: <SafetyCertificateOutlined />,
          label: t('nav.reliability'),
        },
        {
          key: '/algorithm',
          icon: <ExperimentOutlined />,
          label: t('nav.algorithm'),
        },
        {
          key: '/algorithm-debug',
          icon: <CodeOutlined />,
          label: t('nav.algorithmDebug'),
        },
        {
          key: '/counting',
          icon: <SwapOutlined />,
          label: t('nav.counting'),
        },
      ],
    },
    {
      key: 'tools',
      type: 'group' as const,
      label: t('nav.groupTools'),
      children: [
        {
          key: '/recordings',
          icon: <VideoCameraOutlined />,
          label: t('nav.recordings'),
        },
        {
          key: '/api-test',
          icon: <ApiOutlined />,
          label: t('nav.apiTest'),
        },
        {
          key: '/data-sender',
          icon: <SendOutlined />,
          label: t('nav.dataSender'),
        },
      ],
    },
  ];

  // Flatten for title lookup
  const allItems = menuItems.flatMap(group => group.children || []);

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} breakpoint="lg">
        <div style={{
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: collapsed ? '16px' : '20px',
          fontWeight: 'bold',
          transition: 'all 0.2s'
        }}>
          {collapsed ? 'PCD' : 'People Counting Dashboard'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header style={{
          padding: '0 24px',
          background: '#001529',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
              style: { fontSize: '18px', color: 'white', cursor: 'pointer' },
              onClick: () => setCollapsed(!collapsed),
            })}
            <Title level={4} style={{ margin: 0, color: 'white' }}>
              {allItems.find(item => item.key === location.pathname)?.label || 'People Counting Dashboard'}
            </Title>
          </div>
          <Space size="middle">
            <LanguageSwitcher />
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              style={{ color: 'white' }}
            >
              {t('login.logout')}
            </Button>
          </Space>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#f0f2f5' }}>
          <Outlet />
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          People Counting Dashboard ©{new Date().getFullYear()} Created with React + Ant Design
        </Footer>
      </Layout>
    </Layout>
  );
};

export default MainLayout;

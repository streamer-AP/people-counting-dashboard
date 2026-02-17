import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Alert, Button, Spin, Typography, Space, Tag } from 'antd';
import { ReloadOutlined, ClockCircleOutlined, SafetyCertificateOutlined, ExperimentOutlined, SwapOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useLatestData } from '../../hooks/useLatestData';
import { getReliabilityStatus, getAlgorithmHealth, getCountingConfig } from '../../api/counting';
import { ReliabilityStatusResponse, AlgorithmHealthResponse, CountingConfigResponse } from '../../types/counting';
import CountDisplay from '../../components/CountDisplay';
import CameraRingLayout from '../../components/CameraRingLayout';
import { formatUTCToLocal } from '../../utils/dateFormat';

const { Text } = Typography;

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useLatestData();

  // Health summary data
  const [reliability, setReliability] = useState<ReliabilityStatusResponse | null>(null);
  const [algorithmHealth, setAlgorithmHealth] = useState<AlgorithmHealthResponse | null>(null);
  const [countingConfig, setCountingConfig] = useState<CountingConfigResponse | null>(null);

  const fetchHealthSummary = useCallback(async () => {
    try {
      const [relResult, algoResult, countResult] = await Promise.allSettled([
        getReliabilityStatus(),
        getAlgorithmHealth(),
        getCountingConfig(),
      ]);
      if (relResult.status === 'fulfilled') setReliability(relResult.value);
      if (algoResult.status === 'fulfilled') setAlgorithmHealth(algoResult.value);
      if (countResult.status === 'fulfilled') setCountingConfig(countResult.value);
    } catch (err) {
      // silently ignore
    }
  }, []);

  useEffect(() => {
    fetchHealthSummary();
    const interval = setInterval(fetchHealthSummary, 5000);
    return () => clearInterval(interval);
  }, [fetchHealthSummary]);

  if (loading && !data) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" tip={t('dashboard.loading')} />
      </div>
    );
  }

  if (error && !data) {
    return (
      <Alert
        message={t('dashboard.error')}
        description={error}
        type="error"
        showIcon
        action={
          <Button size="small" danger onClick={refetch}>
            {t('dashboard.retry')}
          </Button>
        }
      />
    );
  }

  if (!data) {
    return (
      <Alert
        message={t('dashboard.noData')}
        type="warning"
        showIcon
        action={
          <Button size="small" onClick={refetch}>
            <ReloadOutlined /> {t('dashboard.retry')}
          </Button>
        }
      />
    );
  }

  // Count healthy algorithm services
  const healthyServiceCount = algorithmHealth?.services
    ? Object.values(algorithmHealth.services).filter(s => s.status === 'healthy').length
    : 0;
  const totalServiceCount = algorithmHealth?.services ? Object.keys(algorithmHealth.services).length : 3;

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* People Count and Confidence */}
      <CountDisplay count={data.Count} confidence={data.Confidence} />

      {/* Timestamp */}
      <Card>
        <Space>
          <ClockCircleOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
          <Text strong>{t('dashboard.timestamp')}:</Text>
          <Text>{formatUTCToLocal(data.Timestamp)}</Text>
        </Space>
      </Card>

      {/* Camera Ring Layout: density map + camera status */}
      <CameraRingLayout
        base64Image={data.Image}
        camPtz={data.CamPtz}
        camStream={data.CamStream}
        reliabilityCameras={reliability?.reliability?.cameras}
      />

      {/* System Health Summary */}
      <Card title={t('dashboard.healthSummary')}>
        <Row gutter={[16, 16]}>
          {/* Reliability */}
          <Col xs={24} sm={8}>
            <Card
              hoverable
              onClick={() => navigate('/reliability')}
              style={{ textAlign: 'center', height: '100%' }}
            >
              <SafetyCertificateOutlined style={{ fontSize: 28, color: reliability?.reliability?.system_reliable ? '#52c41a' : '#f5222d', marginBottom: 8 }} />
              <div>
                <Text strong>{t('dashboard.systemReliability')}</Text>
              </div>
              <Tag
                color={reliability?.reliability?.system_reliable ? 'success' : 'error'}
                style={{ marginTop: 8 }}
              >
                {reliability?.reliability?.system_reliable ? t('reliability.reliable') : t('reliability.unreliable')}
              </Tag>
              <div style={{ marginTop: 4 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {t('reliability.unreliableCameras')}: {reliability?.reliability?.unreliable_camera_count ?? '-'}/19
                </Text>
              </div>
            </Card>
          </Col>

          {/* Algorithm Services */}
          <Col xs={24} sm={8}>
            <Card
              hoverable
              onClick={() => navigate('/algorithm')}
              style={{ textAlign: 'center', height: '100%' }}
            >
              <ExperimentOutlined style={{ fontSize: 28, color: algorithmHealth?.overall_status === 'healthy' ? '#52c41a' : '#faad14', marginBottom: 8 }} />
              <div>
                <Text strong>{t('dashboard.algorithmServices')}</Text>
              </div>
              <Tag
                color={algorithmHealth?.overall_status === 'healthy' ? 'success' : algorithmHealth?.overall_status === 'unhealthy' ? 'warning' : 'error'}
                style={{ marginTop: 8 }}
              >
                {algorithmHealth?.overall_status ? t(`algorithm.${algorithmHealth.overall_status}`) : '-'}
              </Tag>
              <div style={{ marginTop: 4 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {healthyServiceCount}/{totalServiceCount} {t('dashboard.servicesHealthy')}
                </Text>
              </div>
            </Card>
          </Col>

          {/* Counting Service */}
          <Col xs={24} sm={8}>
            <Card
              hoverable
              onClick={() => navigate('/counting')}
              style={{ textAlign: 'center', height: '100%' }}
            >
              <SwapOutlined style={{ fontSize: 28, color: '#1890ff', marginBottom: 8 }} />
              <div>
                <Text strong>{t('dashboard.countingService')}</Text>
              </div>
              <Tag
                color={countingConfig?.config?.multiview_enabled ? 'blue' : 'default'}
                style={{ marginTop: 8 }}
              >
                {t('counting.multiview')}: {countingConfig?.config?.multiview_enabled ? t('common.online') : t('common.offline')}
              </Tag>
              <div style={{ marginTop: 4 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {t('counting.singleview')}: {countingConfig?.config?.singleview_enabled ? t('common.online') : t('common.offline')}
                </Text>
              </div>
            </Card>
          </Col>
        </Row>
      </Card>
    </Space>
  );
};

export default Dashboard;

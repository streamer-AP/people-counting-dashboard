import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Tag, Alert, Spin, Descriptions, Statistic, Space, Typography, Badge } from 'antd';
import { ExperimentOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAlgorithmHealth } from '../../hooks/useAlgorithmHealth';
import { getMultiviewResult } from '../../api/counting';
import { MultiviewResult, AlgorithmServiceStatus } from '../../types/counting';
import { formatUTCToLocal } from '../../utils/dateFormat';

const { Text } = Typography;

const statusColorMap: Record<string, string> = {
  healthy: '#52c41a',
  unhealthy: '#faad14',
  error: '#f5222d',
  unknown: '#d9d9d9',
};

const statusTagColor: Record<string, string> = {
  healthy: 'success',
  unhealthy: 'warning',
  error: 'error',
  unknown: 'default',
};

const AlgorithmHealth: React.FC = () => {
  const { t } = useTranslation();
  const { data, loading, error } = useAlgorithmHealth();
  const [multiview, setMultiview] = useState<MultiviewResult | null>(null);

  const fetchMultiview = useCallback(async () => {
    try {
      const result = await getMultiviewResult();
      setMultiview(result);
    } catch (err) {
      // silently ignore
    }
  }, []);

  useEffect(() => {
    fetchMultiview();
    const interval = setInterval(fetchMultiview, 5000);
    return () => clearInterval(interval);
  }, [fetchMultiview]);

  if (loading && !data) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error && !data) {
    return <Alert message={t('common.error')} description={error} type="error" showIcon />;
  }

  const overallAlertType = data?.overall_status === 'healthy' ? 'success' as const
    : data?.overall_status === 'unhealthy' ? 'warning' as const
    : data?.overall_status === 'error' ? 'error' as const
    : 'info' as const;

  const renderServiceCard = (
    title: string,
    service: AlgorithmServiceStatus | undefined,
  ) => {
    if (!service) return null;
    const statusColor = statusColorMap[service.status] || '#d9d9d9';

    return (
      <Card
        title={
          <Space>
            <Badge color={statusColor} />
            <span>{title}</span>
          </Space>
        }
        extra={
          <Tag color={statusTagColor[service.status] || 'default'}>
            {t(`algorithm.${service.status}`)}
          </Tag>
        }
        style={{ height: '100%' }}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="small">
          <Row gutter={[16, 8]}>
            <Col span={8}>
              <Statistic
                title={t('algorithm.totalRequests')}
                value={service.total_requests}
                valueStyle={{ fontSize: 16 }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title={t('algorithm.totalSuccess')}
                value={service.total_success}
                valueStyle={{ fontSize: 16, color: '#52c41a' }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title={t('algorithm.totalErrors')}
                value={service.total_errors}
                valueStyle={{ fontSize: 16, color: service.total_errors > 0 ? '#f5222d' : undefined }}
              />
            </Col>
          </Row>

          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label={t('algorithm.successRate')}>
              <Text style={{ color: service.success_rate >= 95 ? '#52c41a' : '#faad14' }}>
                {service.status === 'unknown' ? '-' : `${service.success_rate.toFixed(1)}%`}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label={t('algorithm.consecutiveErrors')}>
              <Text style={{ color: service.consecutive_errors > 0 ? '#f5222d' : undefined }}>
                {service.consecutive_errors}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label={t('algorithm.lastResponseTime')}>
              {service.last_response_time_ms != null ? `${service.last_response_time_ms.toFixed(1)} ms` : '-'}
            </Descriptions.Item>
            <Descriptions.Item label={t('algorithm.avgResponseTime')}>
              {service.avg_response_time_ms != null ? `${service.avg_response_time_ms.toFixed(1)} ms` : '-'}
            </Descriptions.Item>
            <Descriptions.Item label={t('algorithm.lastSuccessTime')}>
              {service.last_success_time ? formatUTCToLocal(service.last_success_time, 'HH:mm:ss') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label={t('algorithm.lastErrorTime')}>
              <Text type={service.last_error_time ? 'danger' : undefined}>
                {service.last_error_time ? formatUTCToLocal(service.last_error_time, 'HH:mm:ss') : '-'}
              </Text>
            </Descriptions.Item>
            {service.last_error_message && (
              <Descriptions.Item label={t('algorithm.lastErrorMessage')}>
                <Text type="danger" style={{ fontSize: '12px' }}>{service.last_error_message}</Text>
              </Descriptions.Item>
            )}
          </Descriptions>
        </Space>
      </Card>
    );
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Overall Status */}
      <Alert
        message={
          <Space>
            <ExperimentOutlined style={{ fontSize: 20 }} />
            <Text strong style={{ fontSize: 16 }}>{t('algorithm.overallStatus')}:</Text>
            <Tag
              color={statusTagColor[data?.overall_status || 'unknown']}
              style={{ fontSize: 14, padding: '2px 12px' }}
            >
              {data?.overall_status ? t(`algorithm.${data.overall_status}`) : '-'}
            </Tag>
          </Space>
        }
        type={overallAlertType}
        showIcon={false}
      />

      {/* Service Cards */}
      <Row gutter={[16, 16]}>
        {data?.services && Object.entries(data.services).map(([key, service]) => (
          <Col xs={24} lg={8} key={key}>
            {renderServiceCard(service.name || key, service)}
          </Col>
        ))}
      </Row>

      {/* Latest Multiview Result */}
      <Card title={t('algorithm.multiviewResult')}>
        {multiview?.result?.results?.length ? (() => {
          const entry = multiview.result.results[0];
          return (
            <Row gutter={[24, 16]}>
              <Col>
                <Statistic
                  title={t('dashboard.peopleCount')}
                  value={Math.round(entry.count)}
                  valueStyle={{ color: '#1890ff', fontSize: 28 }}
                />
              </Col>
              <Col>
                <Statistic
                  title={t('algorithm.reliable')}
                  value={entry.reliable ? t('reliability.reliable') : t('reliability.unreliable')}
                  valueStyle={{ color: entry.reliable ? '#52c41a' : '#f5222d', fontSize: 20 }}
                />
              </Col>
              <Col>
                <Statistic
                  title={t('algorithm.processingTime')}
                  value={multiview.result.processing_time_ms?.toFixed(0)}
                  suffix="ms"
                  valueStyle={{ fontSize: 20 }}
                />
              </Col>
              <Col>
                <Statistic
                  title={t('system.lastUpdate')}
                  value={formatUTCToLocal(multiview.result.updated_at, 'HH:mm:ss')}
                  valueStyle={{ fontSize: 20 }}
                />
              </Col>
            </Row>
          );
        })() : (
          <Text type="secondary">{t('dashboard.noData')}</Text>
        )}
      </Card>
    </Space>
  );
};

export default AlgorithmHealth;

import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Statistic, Tag, Timeline, Select, Spin, Alert, Descriptions, Badge, Space, Typography } from 'antd';
import { WifiOutlined, DisconnectOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useStreamHealth } from '../../hooks/useStreamHealth';
import { getStreamAlerts, getStreamStats } from '../../api/counting';
import { StreamAlertsResponse, StreamStatsResponse } from '../../types/counting';
import { formatUTCToLocal } from '../../utils/dateFormat';
import dayjs from 'dayjs';

const { Text } = Typography;
const { Option } = Select;

const RecordMonitor: React.FC = () => {
  const { t } = useTranslation();
  const { data: healthData, loading: healthLoading, error: healthError } = useStreamHealth();
  const [alerts, setAlerts] = useState<StreamAlertsResponse | null>(null);
  const [stats, setStats] = useState<StreamStatsResponse | null>(null);
  const [alertType, setAlertType] = useState<string | undefined>(undefined);
  const [alertsLoading, setAlertsLoading] = useState(true);

  const fetchAlerts = useCallback(async () => {
    try {
      const result = await getStreamAlerts(100, alertType as any);
      setAlerts(result);
    } catch (err) {
      // silently ignore
    } finally {
      setAlertsLoading(false);
    }
  }, [alertType]);

  const fetchStats = useCallback(async () => {
    try {
      const result = await getStreamStats();
      setStats(result);
    } catch (err) {
      // silently ignore
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    fetchStats();
    const alertInterval = setInterval(fetchAlerts, 10000);
    const statsInterval = setInterval(fetchStats, 10000);
    return () => {
      clearInterval(alertInterval);
      clearInterval(statsInterval);
    };
  }, [fetchAlerts, fetchStats]);

  if (healthLoading && !healthData) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (healthError && !healthData) {
    return <Alert message={t('common.error')} description={healthError} type="error" showIcon />;
  }

  // Compute summary from streams data to ensure consistency with grid
  const streamEntries = healthData?.streams ? Object.values(healthData.streams) : [];
  const computedTotal = streamEntries.length;
  const computedActive = streamEntries.filter(s => s.is_healthy).length;
  const computedInactive = computedTotal - computedActive;
  const totalDisconnections = healthData?.summary?.total_disconnections ?? 0;

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Summary Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title={t('stream.totalStreams')}
              value={computedTotal}
              prefix={<WifiOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title={t('stream.activeStreams')}
              value={computedActive}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title={t('stream.inactiveStreams')}
              value={computedInactive}
              valueStyle={{ color: computedInactive ? '#faad14' : undefined }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title={t('stream.totalDisconnections')}
              value={totalDisconnections}
              valueStyle={{ color: '#faad14' }}
              prefix={<DisconnectOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Stream Status Grid */}
        <Col xs={24} lg={14}>
          <Card title={t('stream.streamStatus')}>
            <Row gutter={[8, 8]}>
              {healthData?.streams && Object.entries(healthData.streams).map(([name, stream]) => (
                <Col xs={12} sm={8} md={6} key={name}>
                  <Card
                    size="small"
                    style={{
                      borderColor: stream.is_healthy ? '#52c41a' : '#faad14',
                      borderWidth: 2,
                    }}
                  >
                    <div style={{ textAlign: 'center' }}>
                      <Badge
                        status={stream.is_healthy ? 'success' : 'warning'}
                        text={
                          <Text strong style={{ fontSize: '12px' }}>
                            {name.replace('camera_', 'Cam ')}
                          </Text>
                        }
                      />
                      <div style={{ marginTop: 4 }}>
                        <Tag color={stream.is_healthy ? 'success' : 'warning'} style={{ fontSize: '11px' }}>
                          {stream.is_healthy ? t('stream.active') : t('stream.inactive')}
                        </Tag>
                      </div>
                      {stream.last_frame_time && (
                        <Text type="secondary" style={{ fontSize: '10px', display: 'block', marginTop: 2 }}>
                          {dayjs.unix(stream.last_frame_time).format('HH:mm:ss')}
                        </Text>
                      )}
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>

        {/* Alerts */}
        <Col xs={24} lg={10}>
          <Card
            title={t('stream.alerts')}
            extra={
              <Select
                value={alertType || 'all'}
                onChange={(val) => setAlertType(val === 'all' ? undefined : val)}
                size="small"
                style={{ width: 140 }}
              >
                <Option value="all">{t('camera.allCameras')}</Option>
                <Option value="disconnected">{t('stream.disconnected')}</Option>
                <Option value="reconnected">{t('stream.reconnected')}</Option>
                <Option value="high_latency">{t('stream.highLatency')}</Option>
              </Select>
            }
          >
            {alertsLoading ? (
              <Spin />
            ) : alerts?.alerts?.length ? (
              <div style={{ maxHeight: 400, overflow: 'auto' }}>
                <Timeline
                  items={alerts.alerts.map((alert, idx) => ({
                    key: idx,
                    color: alert.alert_type === 'disconnected' ? 'red' : alert.alert_type === 'high_latency' ? 'orange' : 'green',
                    children: (
                      <div>
                        <Text strong>{alert.stream_name}</Text>
                        <Tag
                          color={alert.alert_type === 'disconnected' ? 'error' : alert.alert_type === 'high_latency' ? 'warning' : 'success'}
                          style={{ marginLeft: 8 }}
                        >
                          {alert.alert_type === 'disconnected' ? t('stream.disconnected') : alert.alert_type === 'high_latency' ? t('stream.highLatency') : t('stream.reconnected')}
                        </Tag>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {formatUTCToLocal(alert.timestamp)}
                        </Text>
                      </div>
                    ),
                  }))}
                />
              </div>
            ) : (
              <Text type="secondary">{t('dashboard.noData')}</Text>
            )}
          </Card>
        </Col>
      </Row>

      {/* Recording Stats */}
      {stats?.stats && (
        <Card title={t('stream.recordingStats')}>
          <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
            <Descriptions.Item label={t('stream.totalStreams')}>
              {stats.stats.total_streams}
            </Descriptions.Item>
            <Descriptions.Item label={t('stream.totalFrames')}>
              {stats.stats.total_frames_recorded?.toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label={t('stream.totalDisconnections')}>
              {stats.stats.total_disconnections}
            </Descriptions.Item>
            {Object.entries(stats.stats)
              .filter(([key]) => !['total_streams', 'total_frames_recorded', 'total_disconnections'].includes(key))
              .map(([key, value]) => {
                const labelMap: Record<string, string> = {
                  active_streams: t('stream.activeStreamCount'),
                  inactive_streams: t('stream.inactiveStreamCount'),
                  alert_count: t('stream.alertCount'),
                  total_frames_dropped: t('stream.totalFramesDropped'),
                  unhealthy_streams: t('stream.unhealthyStreams'),
                };
                const label = labelMap[key] || key.replace(/_/g, ' ');
                return (
                  <Descriptions.Item key={key} label={label}>
                    {typeof value === 'number' ? value.toLocaleString() : String(value)}
                  </Descriptions.Item>
                );
              })
            }
          </Descriptions>
        </Card>
      )}
    </Space>
  );
};

export default RecordMonitor;

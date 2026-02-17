import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Switch, Button, Table, Tag, Alert, Spin, Space, Typography, Descriptions, Statistic, message, Checkbox, Modal } from 'antd';
import { CheckCircleOutlined, BellOutlined, HeatMapOutlined, EyeOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useCountingConfig } from '../../hooks/useCountingConfig';
import { getCountingAlerts, acknowledgeCountingAlerts, getSingleviewResult } from '../../api/counting';
import { CountingAlertsResponse, CountingAlert, SingleviewResult } from '../../types/counting';
import { formatUTCToLocal } from '../../utils/dateFormat';

const { Text } = Typography;

const CountingService: React.FC = () => {
  const { t } = useTranslation();
  const { config: configData, loading, error, update } = useCountingConfig();

  // Form state
  const [multiviewEnabled, setMultiviewEnabled] = useState(true);
  const [singleviewEnabled, setSingleviewEnabled] = useState(false);
  const [saving, setSaving] = useState(false);

  // Singleview result
  const [singleview, setSingleview] = useState<SingleviewResult | null>(null);

  // Density map state
  const [showDensityMaps, setShowDensityMaps] = useState(false);
  const [previewDensityMap, setPreviewDensityMap] = useState<{ visible: boolean; src: string; title: string }>({ visible: false, src: '', title: '' });

  // Alerts state
  const [alerts, setAlerts] = useState<CountingAlertsResponse | null>(null);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [unacknowledgedOnly, setUnacknowledgedOnly] = useState(false);
  const [selectedAlertIds, setSelectedAlertIds] = useState<string[]>([]);
  const [acknowledging, setAcknowledging] = useState(false);

  // Sync form with config
  useEffect(() => {
    if (configData?.config) {
      setMultiviewEnabled(configData.config.multiview_enabled);
      setSingleviewEnabled(configData.config.singleview_enabled);
    }
  }, [configData]);

  // Fetch singleview result
  const fetchSingleview = useCallback(async () => {
    try {
      const result = await getSingleviewResult();
      setSingleview(result);
    } catch {
      // silently ignore
    }
  }, []);

  useEffect(() => {
    fetchSingleview();
    const interval = setInterval(fetchSingleview, 5000);
    return () => clearInterval(interval);
  }, [fetchSingleview]);

  // Fetch alerts
  const fetchAlerts = useCallback(async () => {
    try {
      const result = await getCountingAlerts(100, unacknowledgedOnly);
      setAlerts(result);
    } catch {
      // silently ignore
    } finally {
      setAlertsLoading(false);
    }
  }, [unacknowledgedOnly]);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await update({
        multiview_enabled: multiviewEnabled,
        singleview_enabled: singleviewEnabled,
      });
      message.success(t('counting.configUpdated'));
    } catch {
      message.error(t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  const handleAcknowledge = async (alertIds?: string[]) => {
    setAcknowledging(true);
    try {
      await acknowledgeCountingAlerts(alertIds);
      message.success(t('counting.alertsAcknowledged'));
      setSelectedAlertIds([]);
      fetchAlerts();
    } catch {
      message.error(t('common.error'));
    } finally {
      setAcknowledging(false);
    }
  };

  if (loading && !configData) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error && !configData) {
    return <Alert message={t('common.error')} description={error} type="error" showIcon />;
  }

  const cfg = configData?.config;

  const alertColumns = [
    {
      title: t('counting.alertId'),
      dataIndex: 'id',
      width: 200,
      ellipsis: true,
      render: (id: string) => <Text style={{ fontSize: 12 }}>{id}</Text>,
    },
    {
      title: t('counting.alertType'),
      dataIndex: 'type',
      width: 130,
      render: (type: string) => (
        <Tag color={type === 'auto_fallback' ? 'orange' : 'red'}>
          {type}
        </Tag>
      ),
    },
    {
      title: t('counting.alertMessage'),
      dataIndex: 'message',
      ellipsis: true,
    },
    {
      title: t('counting.alertTime'),
      dataIndex: 'timestamp',
      width: 170,
      render: (ts: string) => formatUTCToLocal(ts),
    },
    {
      title: t('system.status'),
      dataIndex: 'acknowledged',
      width: 100,
      render: (ack: boolean) => (
        <Tag color={ack ? 'default' : 'error'}>
          {ack ? t('counting.acknowledged') : t('counting.unacknowledged')}
        </Tag>
      ),
    },
  ];

  const svResults = singleview?.result?.results || [];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Current Status & Config */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title={t('counting.currentService')} style={{ height: '100%' }}>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label={t('counting.multiviewEnabled')}>
                <Tag color={cfg?.multiview_enabled ? 'success' : 'default'}>
                  {cfg?.multiview_enabled ? t('common.online') : t('common.offline')}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label={t('counting.singleviewEnabled')}>
                <Tag color={cfg?.singleview_enabled ? 'success' : 'default'}>
                  {cfg?.singleview_enabled ? t('common.online') : t('common.offline')}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label={t('counting.multiviewUrl')}>
                <Text code style={{ fontSize: 12 }}>{cfg?.multiview_url}</Text>
              </Descriptions.Item>
              <Descriptions.Item label={t('counting.singleviewUrl')}>
                <Text code style={{ fontSize: 12 }}>{cfg?.singleview_url}</Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title={t('counting.serviceConfig')} style={{ height: '100%' }}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Text strong>{t('counting.multiviewEnabled')}:</Text>
                <Switch
                  checked={multiviewEnabled}
                  onChange={setMultiviewEnabled}
                  style={{ marginLeft: 12 }}
                />
              </div>
              <div>
                <Text strong>{t('counting.singleviewEnabled')}:</Text>
                <Switch
                  checked={singleviewEnabled}
                  onChange={setSingleviewEnabled}
                  style={{ marginLeft: 12 }}
                />
              </div>
              <Button type="primary" onClick={handleSave} loading={saving} icon={<CheckCircleOutlined />}>
                {t('counting.saveConfig')}
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Singleview Results */}
      <Card
        title={
          <Space>
            <HeatMapOutlined />
            {t('counting.singleviewResult')}
          </Space>
        }
        extra={
          svResults.some(cam => cam.density_map_path) ? (
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => setShowDensityMaps(!showDensityMaps)}
              type={showDensityMaps ? 'primary' : 'default'}
            >
              {showDensityMaps ? t('counting.hideDensityMaps') : t('counting.showDensityMaps')}
            </Button>
          ) : null
        }
      >
        {singleview?.result ? (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Row gutter={[24, 16]}>
              <Col>
                <Statistic
                  title={t('counting.totalCount')}
                  value={singleview.result.total_count}
                  valueStyle={{ color: '#1890ff', fontSize: 28 }}
                />
              </Col>
              <Col>
                <Statistic
                  title={t('reliability.camerasProcessed')}
                  value={svResults.length}
                />
              </Col>
              <Col>
                <Statistic
                  title={t('algorithm.processingTime')}
                  value={singleview.result.processing_time_ms?.toFixed(0)}
                  suffix="ms"
                />
              </Col>
              <Col>
                <Statistic
                  title={t('system.lastUpdate')}
                  value={formatUTCToLocal(singleview.result.updated_at, 'HH:mm:ss')}
                  valueStyle={{ fontSize: 20 }}
                />
              </Col>
            </Row>

            {/* Overall Density Map */}
            {singleview.result.density_map && (
              <Card
                size="small"
                title={t('counting.overallDensityMap')}
                style={{ marginBottom: 0 }}
              >
                <img
                  src={`data:image/png;base64,${singleview.result.density_map}`}
                  alt="Overall Density Map"
                  style={{ maxWidth: '100%', borderRadius: 4, cursor: 'pointer', transform: 'rotate(90deg)' }}
                  onClick={() => setPreviewDensityMap({
                    visible: true,
                    src: `data:image/png;base64,${singleview.result.density_map}`,
                    title: t('counting.overallDensityMap'),
                  })}
                />
              </Card>
            )}

            {/* Per-camera cards */}
            <Row gutter={[8, 8]}>
              {svResults.map((cam) => (
                <Col xs={12} sm={8} md={6} lg={showDensityMaps && cam.density_map_path ? 6 : 4} key={cam.camera_id}>
                  <Card
                    size="small"
                    style={{
                      borderColor: cam.data_confidence_reliable ? '#52c41a' : '#f5222d',
                      borderWidth: 2,
                      textAlign: 'center',
                    }}
                  >
                    <Text strong style={{ fontSize: 12 }}>Cam {cam.camera_id}</Text>
                    <div>
                      <Statistic value={cam.count} valueStyle={{ fontSize: 20, color: '#1890ff' }} />
                    </div>
                    <Tag
                      color={cam.data_confidence_reliable ? 'success' : 'error'}
                      style={{ fontSize: 11 }}
                    >
                      {cam.data_confidence_reliable ? t('reliability.reliable') : t('reliability.unreliable')}
                    </Tag>
                    {/* Per-camera density map */}
                    {showDensityMaps && cam.density_map_path && (
                      <div style={{ marginTop: 8 }}>
                        <img
                          src={`data:image/png;base64,${cam.density_map_path}`}
                          alt={`Cam ${cam.camera_id} Density Map`}
                          style={{
                            width: '100%',
                            borderRadius: 4,
                            cursor: 'pointer',
                            border: '1px solid #d9d9d9',
                          }}
                          onClick={() => setPreviewDensityMap({
                            visible: true,
                            src: `data:image/png;base64,${cam.density_map_path}`,
                            title: `${t('counting.cameraDensityMap')} - Cam ${cam.camera_id}`,
                          })}
                        />
                      </div>
                    )}
                  </Card>
                </Col>
              ))}
            </Row>
          </Space>
        ) : (
          <Text type="secondary">{t('dashboard.noData')}</Text>
        )}
      </Card>

      {/* Density Map Preview Modal */}
      <Modal
        open={previewDensityMap.visible}
        title={previewDensityMap.title}
        footer={null}
        onCancel={() => setPreviewDensityMap({ visible: false, src: '', title: '' })}
        width={800}
      >
        <img
          src={previewDensityMap.src}
          alt={previewDensityMap.title}
          style={{ width: '100%', borderRadius: 4 }}
        />
      </Modal>

      {/* Alerts */}
      <Card
        title={
          <Space>
            <BellOutlined />
            {t('counting.alerts')}
            {alerts?.alerts?.filter(a => !a.acknowledged).length ? (
              <Tag color="error">{alerts.alerts.filter(a => !a.acknowledged).length}</Tag>
            ) : null}
          </Space>
        }
        extra={
          <Checkbox
            checked={unacknowledgedOnly}
            onChange={(e) => setUnacknowledgedOnly(e.target.checked)}
          >
            {t('counting.unacknowledgedOnly')}
          </Checkbox>
        }
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Space>
            <Button
              size="small"
              disabled={selectedAlertIds.length === 0}
              loading={acknowledging}
              onClick={() => handleAcknowledge(selectedAlertIds)}
            >
              {t('counting.acknowledgeSelected')}
            </Button>
            <Button
              size="small"
              type="primary"
              loading={acknowledging}
              onClick={() => handleAcknowledge(undefined)}
            >
              {t('counting.acknowledgeAll')}
            </Button>
          </Space>

          <Table
            loading={alertsLoading}
            dataSource={alerts?.alerts || []}
            columns={alertColumns}
            rowKey="id"
            size="small"
            pagination={{ pageSize: 10 }}
            rowSelection={{
              selectedRowKeys: selectedAlertIds,
              onChange: (keys) => setSelectedAlertIds(keys as string[]),
            }}
            rowClassName={(record: CountingAlert) => record.acknowledged ? '' : 'ant-table-row-warning'}
          />
        </Space>
      </Card>
    </Space>
  );
};

export default CountingService;

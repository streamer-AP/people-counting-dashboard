import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Tag, Alert, Spin, Descriptions, InputNumber, Button, Space, Typography, Table, DatePicker, Badge, message, Collapse } from 'antd';
import { SafetyCertificateOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useReliabilityStatus } from '../../hooks/useReliabilityStatus';
import { getReliabilityConfig, updateReliabilityConfig, getUmbrellaResult, getUmbrellaHistory } from '../../api/counting';
import { ReliabilityConfig, UmbrellaResult, UmbrellaHistoryResponse } from '../../types/counting';
import { formatUTCToLocal } from '../../utils/dateFormat';
import dayjs from 'dayjs';

const { Text } = Typography;
const { RangePicker } = DatePicker;

const Reliability: React.FC = () => {
  const { t } = useTranslation();
  const { data: reliabilityData, loading, error } = useReliabilityStatus();

  // Config state
  const [, setConfig] = useState<ReliabilityConfig | null>(null);
  const [cameraThreshold, setCameraThreshold] = useState<number>(5);
  const [systemThreshold, setSystemThreshold] = useState<number>(10);
  const [configLoading, setConfigLoading] = useState(false);

  // Umbrella state
  const [umbrella, setUmbrella] = useState<UmbrellaResult | null>(null);
  const [umbrellaHistory, setUmbrellaHistory] = useState<UmbrellaHistoryResponse | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyLimit, setHistoryLimit] = useState<number>(20);
  const [historyRange, setHistoryRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  // Load config
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const result = await getReliabilityConfig();
        setConfig(result.config);
        setCameraThreshold(result.config.camera_threshold);
        setSystemThreshold(result.config.system_threshold);
      } catch (err) {
        // silently ignore
      }
    };
    loadConfig();
  }, []);

  // Poll umbrella data
  const fetchUmbrella = useCallback(async () => {
    try {
      const result = await getUmbrellaResult();
      setUmbrella(result);
    } catch (err) {
      // silently ignore
    }
  }, []);

  useEffect(() => {
    fetchUmbrella();
    const interval = setInterval(fetchUmbrella, 5000);
    return () => clearInterval(interval);
  }, [fetchUmbrella]);

  const handleUpdateConfig = async () => {
    setConfigLoading(true);
    try {
      const result = await updateReliabilityConfig({
        camera_threshold: cameraThreshold,
        system_threshold: systemThreshold,
      });
      setConfig(result.config);
      message.success(t('reliability.configUpdated'));
    } catch (err) {
      message.error(t('common.error'));
    } finally {
      setConfigLoading(false);
    }
  };

  const handleFetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const result = await getUmbrellaHistory(
        historyLimit,
        historyRange?.[0]?.toISOString(),
        historyRange?.[1]?.toISOString()
      );
      setUmbrellaHistory(result);
    } catch (err) {
      message.error(t('common.error'));
    } finally {
      setHistoryLoading(false);
    }
  };

  if (loading && !reliabilityData) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error && !reliabilityData) {
    return <Alert message={t('common.error')} description={error} type="error" showIcon />;
  }

  const reliability = reliabilityData?.reliability;

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* System Reliability Status */}
      <Card>
        <Alert
          message={
            <Space size="large">
              <SafetyCertificateOutlined style={{ fontSize: 24 }} />
              <span style={{ fontSize: 18, fontWeight: 'bold' }}>
                {t('reliability.systemStatus')}:
              </span>
              <Tag
                color={reliability?.system_reliable ? 'success' : 'error'}
                style={{ fontSize: 16, padding: '4px 16px' }}
              >
                {reliability?.system_reliable ? t('reliability.reliable') : t('reliability.unreliable')}
              </Tag>
            </Space>
          }
          description={
            <Space direction="vertical" style={{ marginTop: 8 }}>
              <Text>
                {t('reliability.unreliableCameras')}: {reliability?.unreliable_camera_count ?? 0} / {t('reliability.systemThreshold')}: {reliability?.system_threshold ?? '-'}
              </Text>
              <Text>
                {t('reliability.cameraThreshold')}: {reliability?.camera_threshold ?? '-'}
              </Text>
            </Space>
          }
          type={reliability?.system_reliable ? 'success' : 'error'}
          showIcon={false}
        />
      </Card>

      {/* Camera Reliability Grid */}
      <Card title={t('reliability.title')}>
        <Row gutter={[8, 8]}>
          {reliability?.cameras && Object.entries(reliability.cameras).map(([name, cam]) => (
            <Col xs={12} sm={8} md={6} lg={4} key={name}>
              <Card
                size="small"
                style={{
                  borderColor: cam.reliable ? '#52c41a' : '#f5222d',
                  borderWidth: 2,
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <Badge
                    status={cam.reliable ? 'success' : 'error'}
                    text={<Text strong style={{ fontSize: '12px' }}>{name.replace('camera_', 'Cam ')}</Text>}
                  />
                  <div style={{ marginTop: 4 }}>
                    <Tag color={cam.reliable ? 'success' : 'error'} style={{ fontSize: '11px' }}>
                      {cam.reliable ? t('reliability.reliable') : t('reliability.unreliable')}
                    </Tag>
                  </div>
                  <Text type="secondary" style={{ fontSize: '11px' }}>
                    {t('reliability.umbrellaCount')}: {cam.umbrella_count}
                  </Text>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      <Row gutter={[16, 16]}>
        {/* Config */}
        <Col xs={24} lg={12}>
          <Card title={t('reliability.config')}>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div>
                <Text strong>{t('reliability.cameraThreshold')}:</Text>
                <InputNumber
                  value={cameraThreshold}
                  onChange={(val) => val !== null && setCameraThreshold(val)}
                  min={1}
                  style={{ marginLeft: 8, width: 80 }}
                />
              </div>
              <div>
                <Text strong>{t('reliability.systemThreshold')}:</Text>
                <InputNumber
                  value={systemThreshold}
                  onChange={(val) => val !== null && setSystemThreshold(val)}
                  min={1}
                  style={{ marginLeft: 8, width: 80 }}
                />
              </div>
              <Button type="primary" onClick={handleUpdateConfig} loading={configLoading}>
                {t('reliability.updateConfig')}
              </Button>
            </Space>
          </Card>
        </Col>

        {/* Umbrella Detection */}
        <Col xs={24} lg={12}>
          <Card title={t('reliability.umbrellaDetection')}>
            {umbrella?.result ? (
              <Space direction="vertical" style={{ width: '100%' }} size="small">
                <Descriptions bordered column={1} size="small">
                  <Descriptions.Item label={t('reliability.latestDetection')}>
                    {formatUTCToLocal(umbrella.result.updated_at)}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('reliability.camerasProcessed')}>
                    {umbrella.result.frames_processed} / {umbrella.result.frames_total}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('algorithm.processingTime')}>
                    {umbrella.result.processing_time_ms} ms
                  </Descriptions.Item>
                  <Descriptions.Item label={t('reliability.totalUmbrellas')}>
                    <Text strong style={{ color: '#faad14' }}>
                      {umbrella.result.results?.reduce((sum, r) => sum + r.umbrella_count, 0) ?? 0}
                    </Text>
                  </Descriptions.Item>
                </Descriptions>
                <Table
                  dataSource={umbrella.result.results?.map(r => ({
                    key: r.camera_id,
                    camera_id: r.camera_id,
                    stream_name: r.stream_name,
                    umbrella_count: r.umbrella_count,
                  }))}
                  columns={[
                    {
                      title: t('common.camera'),
                      dataIndex: 'stream_name',
                      render: (val: string) => val?.replace('camera_', 'Cam ') || '-',
                    },
                    {
                      title: t('reliability.umbrellaCount'),
                      dataIndex: 'umbrella_count',
                      sorter: (a: any, b: any) => a.umbrella_count - b.umbrella_count,
                      render: (val: number) => (
                        <Tag color={val > 0 ? 'warning' : 'success'}>{val}</Tag>
                      ),
                    },
                  ]}
                  pagination={false}
                  size="small"
                  scroll={{ y: 240 }}
                />
              </Space>
            ) : (
              <Text type="secondary">{t('dashboard.noData')}</Text>
            )}
          </Card>
        </Col>
      </Row>

      {/* Umbrella History */}
      <Collapse
        items={[{
          key: 'history',
          label: t('reliability.detectionHistory'),
          children: (
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Space wrap>
                <RangePicker
                  showTime
                  onChange={(dates) => setHistoryRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
                />
                <InputNumber
                  value={historyLimit}
                  onChange={(val) => val !== null && setHistoryLimit(val)}
                  min={1}
                  max={500}
                  addonBefore="Limit"
                  style={{ width: 140 }}
                />
                <Button type="primary" onClick={handleFetchHistory} loading={historyLoading}>
                  {t('reliability.viewHistory')}
                </Button>
              </Space>
              {umbrellaHistory && (
                <Table
                  dataSource={umbrellaHistory.results.map((r, i) => ({
                    key: i,
                    updated_at: r.result?.updated_at,
                    cameras: r.result?.results?.length ?? 0,
                    totalUmbrellas: r.result?.results?.reduce((sum, c) => sum + c.umbrella_count, 0) ?? 0,
                    status: r.status,
                  }))}
                  columns={[
                    {
                      title: t('dashboard.timestamp'),
                      dataIndex: 'updated_at',
                      render: (val: string) => val ? formatUTCToLocal(val) : '-',
                    },
                    {
                      title: t('reliability.camerasProcessed'),
                      dataIndex: 'cameras',
                    },
                    {
                      title: t('reliability.totalUmbrellas'),
                      dataIndex: 'totalUmbrellas',
                      render: (val: number) => <Tag color={val > 0 ? 'warning' : 'success'}>{val}</Tag>,
                    },
                    {
                      title: t('system.status'),
                      dataIndex: 'status',
                      render: (val: string) => <Tag color="blue">{val}</Tag>,
                    },
                  ]}
                  pagination={{ pageSize: 10 }}
                  size="small"
                />
              )}
            </Space>
          ),
        }]}
      />
    </Space>
  );
};

export default Reliability;

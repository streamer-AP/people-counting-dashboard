import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, Button, Space, Typography, Tag, Spin, Alert, Descriptions, Radio, Row, Col, Statistic, Collapse } from 'antd';
import { ReloadOutlined, CodeOutlined, CameraOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { getAlgorithmLatestRequest, getAlgorithmLatestResponse } from '../../api/counting';
import { AlgorithmLatestRequestResponse, AlgorithmLatestResponseResponse } from '../../types/counting';
import dayjs from 'dayjs';

const { Text } = Typography;

interface FrameData {
  stream_name: string;
  image_base64: string;
  frame_number: number;
  width: number;
  height: number;
  timestamp: number;
}

interface UmbrellaDetection {
  bbox: number[];
  class: string;
  confidence: number;
}

interface UmbrellaCameraResult {
  camera_id: number;
  stream_name: string;
  umbrella_count: number;
  detections: UmbrellaDetection[];
}

// Component to draw bounding boxes on an image
const ImageWithBoxes: React.FC<{
  base64: string;
  detections: UmbrellaDetection[];
  label: string;
}> = ({ base64, detections, label }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      setDimensions({ w: img.width, h: img.height });
      ctx.drawImage(img, 0, 0);

      // Draw bounding boxes
      detections.forEach((det) => {
        const [x1, y1, x2, y2] = det.bbox;
        ctx.strokeStyle = '#ff4d4f';
        ctx.lineWidth = 2;
        ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

        // Label background
        const text = `${(det.confidence * 100).toFixed(0)}%`;
        ctx.font = '12px Arial';
        const textWidth = ctx.measureText(text).width;
        ctx.fillStyle = 'rgba(255, 77, 79, 0.8)';
        ctx.fillRect(x1, y1 - 16, textWidth + 6, 16);

        // Label text
        ctx.fillStyle = '#fff';
        ctx.fillText(text, x1 + 3, y1 - 4);
      });
    };
    img.src = `data:image/jpeg;base64,${base64}`;
  }, [base64, detections]);

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ marginBottom: 4 }}>
        <Text strong style={{ fontSize: 12 }}>{label}</Text>
        {detections.length > 0 && (
          <Tag color="warning" style={{ marginLeft: 4, fontSize: 11 }}>
            {detections.length} umbrella{detections.length > 1 ? 's' : ''}
          </Tag>
        )}
      </div>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: 'auto',
          borderRadius: 4,
          border: detections.length > 0 ? '2px solid #faad14' : '1px solid #d9d9d9',
        }}
        width={dimensions.w || 704}
        height={dimensions.h || 576}
      />
    </div>
  );
};

// Simple image display component
const CameraFrame: React.FC<{ frame: FrameData }> = ({ frame }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{ marginBottom: 4 }}>
      <Text strong style={{ fontSize: 12 }}>
        {frame.stream_name.replace('camera_', 'Cam ')}
      </Text>
      <Text type="secondary" style={{ fontSize: 11, marginLeft: 4 }}>
        #{frame.frame_number}
      </Text>
    </div>
    <img
      src={`data:image/jpeg;base64,${frame.image_base64}`}
      alt={frame.stream_name}
      style={{
        width: '100%',
        height: 'auto',
        borderRadius: 4,
        border: '1px solid #d9d9d9',
      }}
    />
  </div>
);

const AlgorithmDebug: React.FC = () => {
  const { t } = useTranslation();
  const [latestRequest, setLatestRequest] = useState<AlgorithmLatestRequestResponse | null>(null);
  const [latestResponse, setLatestResponse] = useState<AlgorithmLatestResponseResponse | null>(null);
  const [responseType, setResponseType] = useState<'multiview' | 'umbrella'>('umbrella');
  const [requestLoading, setRequestLoading] = useState(false);
  const [responseLoading, setResponseLoading] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [responseError, setResponseError] = useState<string | null>(null);

  const fetchRequest = useCallback(async () => {
    setRequestLoading(true);
    setRequestError(null);
    try {
      const result = await getAlgorithmLatestRequest();
      setLatestRequest(result);
    } catch (err: any) {
      setRequestError(err.message || t('common.error'));
    } finally {
      setRequestLoading(false);
    }
  }, [t]);

  const fetchResponse = useCallback(async () => {
    setResponseLoading(true);
    setResponseError(null);
    try {
      const result = await getAlgorithmLatestResponse(responseType);
      setLatestResponse(result);
    } catch (err: any) {
      setResponseError(err.message || t('common.error'));
    } finally {
      setResponseLoading(false);
    }
  }, [responseType, t]);

  useEffect(() => {
    fetchRequest();
  }, [fetchRequest]);

  useEffect(() => {
    fetchResponse();
  }, [fetchResponse]);

  const formatTimestamp = (ts: number) => {
    return dayjs.unix(ts).format('YYYY-MM-DD HH:mm:ss');
  };

  // Extract frames from request
  const frames: FrameData[] = (latestRequest?.request as any)?.frames || [];

  // Build a map of stream_name -> frame for overlay
  const frameMap = new Map<string, FrameData>();
  frames.forEach(f => frameMap.set(f.stream_name, f));

  // Extract umbrella results from response
  const getUmbrellaResults = (): UmbrellaCameraResult[] => {
    if (!latestResponse || latestResponse.type !== 'umbrella') return [];
    const resp = latestResponse.response as any;
    return resp?.response?.results || [];
  };

  // Extract multiview results from response
  const getMultiviewResults = () => {
    if (!latestResponse || latestResponse.type !== 'multiview') return null;
    const resp = latestResponse.response as any;
    const results = resp?.response?.results;
    if (!results?.length) return null;
    return {
      count: results[0].count,
      reliable: results[0].reliable,
      density_map: results[0].density_map,
      processing_time_ms: resp?.response?.processing_time_ms,
    };
  };

  const renderRequestContent = () => {
    if (requestLoading && !latestRequest) return <Spin />;
    if (requestError) return <Alert message={requestError} type="error" showIcon />;
    if (!latestRequest) return <Text type="secondary">{t('dashboard.noData')}</Text>;

    const req = latestRequest.request as any;

    return (
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Descriptions bordered column={{ xs: 1, sm: 2, md: 4 }} size="small">
          <Descriptions.Item label={t('algorithmDebug.filename')}>
            <Text code style={{ fontSize: 11 }}>{latestRequest.filename}</Text>
          </Descriptions.Item>
          <Descriptions.Item label={t('dashboard.timestamp')}>
            {formatTimestamp(latestRequest.timestamp)}
          </Descriptions.Item>
          <Descriptions.Item label={t('algorithmDebug.frameCount')}>
            <Tag color="blue">{req?.frame_count ?? frames.length}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label={t('algorithmDebug.syncQuality')}>
            <Tag color={req?.sync_quality > 0.9 ? 'success' : 'warning'}>
              {req?.sync_quality != null ? `${(req.sync_quality * 100).toFixed(1)}%` : '-'}
            </Tag>
          </Descriptions.Item>
        </Descriptions>

        <Row gutter={[8, 8]}>
          {frames.map((frame) => (
            <Col xs={24} sm={12} md={8} lg={8} key={frame.stream_name}>
              <CameraFrame frame={frame} />
            </Col>
          ))}
        </Row>
      </Space>
    );
  };

  const renderUmbrellaResponse = () => {
    const umbrellaResults = getUmbrellaResults();
    const totalUmbrellas = umbrellaResults.reduce((sum, r) => sum + r.umbrella_count, 0);
    const resp = latestResponse?.response as any;
    const processingTime = resp?.response?.processing_time_ms;

    return (
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Row gutter={[16, 8]}>
          <Col>
            <Statistic
              title={t('reliability.totalUmbrellas')}
              value={totalUmbrellas}
              valueStyle={{ color: totalUmbrellas > 0 ? '#faad14' : '#52c41a' }}
            />
          </Col>
          <Col>
            <Statistic
              title={t('reliability.camerasProcessed')}
              value={umbrellaResults.length}
            />
          </Col>
          {processingTime != null && (
            <Col>
              <Statistic
                title={t('algorithm.processingTime')}
                value={processingTime}
                suffix="ms"
              />
            </Col>
          )}
        </Row>

        <Row gutter={[8, 8]}>
          {umbrellaResults.map((result) => {
            const frame = frameMap.get(result.stream_name);
            const label = result.stream_name.replace('camera_', 'Cam ');
            return (
              <Col xs={24} sm={12} md={8} lg={8} key={result.camera_id}>
                {frame ? (
                  <ImageWithBoxes
                    base64={frame.image_base64}
                    detections={result.detections}
                    label={label}
                  />
                ) : (
                  <div style={{ textAlign: 'center', padding: 16, background: '#fafafa', borderRadius: 4 }}>
                    <Text strong>{label}</Text>
                    <div>
                      <Tag color="warning">{result.umbrella_count} umbrella(s)</Tag>
                    </div>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {t('algorithmDebug.noFrame')}
                    </Text>
                  </div>
                )}
              </Col>
            );
          })}
        </Row>
      </Space>
    );
  };

  const renderMultiviewResponse = () => {
    const mv = getMultiviewResults();
    if (!mv) return <Text type="secondary">{t('dashboard.noData')}</Text>;

    return (
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Row gutter={[24, 16]}>
          <Col>
            <Statistic
              title={t('dashboard.peopleCount')}
              value={Math.round(mv.count)}
              valueStyle={{ color: '#1890ff', fontSize: 28 }}
            />
          </Col>
          <Col>
            <Statistic
              title={t('algorithm.reliable')}
              value={mv.reliable ? t('reliability.reliable') : t('reliability.unreliable')}
              valueStyle={{ color: mv.reliable ? '#52c41a' : '#f5222d', fontSize: 20 }}
            />
          </Col>
          {mv.processing_time_ms != null && (
            <Col>
              <Statistic
                title={t('algorithm.processingTime')}
                value={mv.processing_time_ms.toFixed(0)}
                suffix="ms"
                valueStyle={{ fontSize: 20 }}
              />
            </Col>
          )}
        </Row>
        {mv.density_map && (
          <Card size="small" title={t('algorithmDebug.densityMap')}>
            <img
              src={`data:image/jpeg;base64,${mv.density_map}`}
              alt="Density Map"
              style={{ maxWidth: '100%', borderRadius: 4, transform: 'rotate(90deg)' }}
            />
          </Card>
        )}
      </Space>
    );
  };

  const renderResponseContent = () => {
    if (responseLoading && !latestResponse) return <Spin />;
    if (responseError) return <Alert message={responseError} type="error" showIcon />;
    if (!latestResponse) return <Text type="secondary">{t('dashboard.noData')}</Text>;

    return (
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Descriptions bordered column={{ xs: 1, sm: 3 }} size="small">
          <Descriptions.Item label={t('algorithmDebug.type')}>
            <Tag color={latestResponse.type === 'multiview' ? 'blue' : 'purple'}>
              {latestResponse.type === 'multiview' ? t('counting.multiview') : t('algorithm.umbrellaDetection')}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label={t('algorithmDebug.filename')}>
            <Text code style={{ fontSize: 11 }}>{latestResponse.filename}</Text>
          </Descriptions.Item>
          <Descriptions.Item label={t('dashboard.timestamp')}>
            {formatTimestamp(latestResponse.timestamp)}
          </Descriptions.Item>
        </Descriptions>

        {latestResponse.type === 'umbrella' ? renderUmbrellaResponse() : renderMultiviewResponse()}

        <Collapse
          items={[{
            key: 'raw',
            label: t('algorithmDebug.rawJson'),
            children: (
              <pre style={{
                margin: 0,
                fontSize: '11px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                maxHeight: '400px',
                overflow: 'auto',
                background: '#f5f5f5',
                padding: '12px',
                borderRadius: '4px',
              }}>
                {JSON.stringify(latestResponse.response, (_k, v) =>
                  typeof v === 'string' && v.length > 200 ? `[${v.length} chars]` : v
                , 2)}
              </pre>
            ),
          }]}
        />
      </Space>
    );
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Latest Request - Camera Frames */}
      <Card
        title={
          <Space>
            <CameraOutlined />
            {t('algorithmDebug.latestRequest')}
          </Space>
        }
        extra={
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchRequest}
            loading={requestLoading}
            size="small"
          >
            {t('algorithmDebug.refresh')}
          </Button>
        }
      >
        {renderRequestContent()}
      </Card>

      {/* Latest Response */}
      <Card
        title={
          <Space>
            <CodeOutlined />
            {t('algorithmDebug.latestResponse')}
          </Space>
        }
        extra={
          <Space>
            <Radio.Group
              value={responseType}
              onChange={(e) => setResponseType(e.target.value)}
              size="small"
              optionType="button"
              buttonStyle="solid"
            >
              <Radio.Button value="multiview">{t('counting.multiview')}</Radio.Button>
              <Radio.Button value="umbrella">{t('algorithm.umbrellaDetection')}</Radio.Button>
            </Radio.Group>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchResponse}
              loading={responseLoading}
              size="small"
            >
              {t('algorithmDebug.refresh')}
            </Button>
          </Space>
        }
      >
        {renderResponseContent()}
      </Card>
    </Space>
  );
};

export default AlgorithmDebug;

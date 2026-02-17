import React, { useState } from 'react';
import { Card, Row, Col, Select, Tag, Space, Typography, Empty, Modal, Spin, Alert } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, CameraOutlined, WarningOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useLatestData } from '../../hooks/useLatestData';
import { useReliabilityStatus } from '../../hooks/useReliabilityStatus';
import { getRecentRecordings } from '../../api/counting';
import { Recording } from '../../types/counting';
import { CAMERA_COUNT, API_BASE_URL } from '../../utils/constants';

const { Title, Text } = Typography;
const { Option } = Select;

type FilterType = 'all' | 'online' | 'offline' | 'ptz-normal' | 'ptz-offset';

const CameraMonitor: React.FC = () => {
  const { t } = useTranslation();
  const { data, loading } = useLatestData();
  const { data: reliabilityData } = useReliabilityStatus();
  const [filter, setFilter] = useState<FilterType>('all');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCameraId, setSelectedCameraId] = useState<number>(0);
  const [currentRecording, setCurrentRecording] = useState<Recording | null>(null);
  const [recordingLoading, setRecordingLoading] = useState(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);

  if (loading || !data) {
    return <Empty description={t('dashboard.loading')} />;
  }

  const handleCameraClick = (cameraId: number) => {
    const cameraName = `camera_${cameraId}`;
    setSelectedCameraId(cameraId);
    setIsModalVisible(true);
    setRecordingError(null);
    setCurrentRecording(null);
    loadRecording(cameraName);
  };

  const loadRecording = async (cameraName: string) => {
    setRecordingLoading(true);
    setRecordingError(null);
    setCurrentRecording(null);

    try {
      const result = await getRecentRecordings(cameraName, 1);
      if (result.recordings.length >= 1) {
        setCurrentRecording(result.recordings[0]);
      } else {
        setRecordingError('没有找到录制视频 / No recordings found');
      }
    } catch (err: any) {
      setRecordingError(err.response?.data?.error || err.message || '加载失败 / Failed to load recording');
    } finally {
      setRecordingLoading(false);
    }
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setCurrentRecording(null);
    setRecordingError(null);
  };

  const getCameraReliability = (cameraId: number) => {
    if (!reliabilityData?.reliability?.cameras) return null;
    const cameraName = `camera_${cameraId}`;
    return reliabilityData.reliability.cameras[cameraName] ?? null;
  };

  const getCameraList = () => {
    const cameras = Array.from({ length: CAMERA_COUNT }, (_, i) => ({
      id: i + 1,
      ptzStatus: data.CamPtz[i],
      streamStatus: data.CamStream[i],
    }));

    switch (filter) {
      case 'online':
        return cameras.filter(cam => cam.streamStatus);
      case 'offline':
        return cameras.filter(cam => !cam.streamStatus);
      case 'ptz-normal':
        return cameras.filter(cam => !cam.ptzStatus);
      case 'ptz-offset':
        return cameras.filter(cam => cam.ptzStatus);
      default:
        return cameras;
    }
  };

  const filteredCameras = getCameraList();

  const renderCameraCard = (camera: { id: number; ptzStatus: boolean; streamStatus: boolean }) => {
    const camReliability = getCameraReliability(camera.id);

    return (
      <Col xs={24} sm={12} md={8} lg={6} key={camera.id}>
        <Card
          hoverable
          style={{
            height: '100%',
            cursor: 'pointer',
            borderColor: camReliability && !camReliability.reliable ? '#faad14' : undefined,
            borderWidth: camReliability && !camReliability.reliable ? 2 : undefined,
          }}
          bodyStyle={{ padding: '16px' }}
          onClick={() => handleCameraClick(camera.id)}
        >
          <Space direction="vertical" style={{ width: '100%' }} size="small">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CameraOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
              <Title level={5} style={{ margin: 0 }}>
                {t('common.camera')} {camera.id}
              </Title>
            </div>

            <div>
              <Text type="secondary">{t('camera.ptzStatus')}:</Text>
              <br />
              <Tag
                icon={!camera.ptzStatus ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                color={!camera.ptzStatus ? 'success' : 'error'}
                style={{ marginTop: '4px' }}
              >
                {!camera.ptzStatus ? t('camera.ptzNormal') : t('camera.ptzOffset')}
              </Tag>
            </div>

            <div>
              <Text type="secondary">{t('camera.streamStatus')}:</Text>
              <br />
              <Tag
                icon={camera.streamStatus ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                color={camera.streamStatus ? 'success' : 'error'}
                style={{ marginTop: '4px' }}
              >
                {camera.streamStatus ? t('camera.streamOnline') : t('camera.streamOffline')}
              </Tag>
            </div>

            {/* Reliability indicator */}
            {camReliability && !camReliability.reliable && (
              <div>
                <Tag icon={<WarningOutlined />} color="warning">
                  {t('reliability.unreliable')} ({t('reliability.umbrellaCount')}: {camReliability.umbrella_count})
                </Tag>
              </div>
            )}
          </Space>
        </Card>
      </Col>
    );
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text strong>{t('camera.filterByStatus')}:</Text>
          <Select
            value={filter}
            onChange={setFilter}
            style={{ width: '200px' }}
          >
            <Option value="all">{t('camera.allCameras')}</Option>
            <Option value="online">{t('camera.streamOnline')}</Option>
            <Option value="offline">{t('camera.streamOffline')}</Option>
            <Option value="ptz-normal">{t('camera.ptzNormal')}</Option>
            <Option value="ptz-offset">{t('camera.ptzOffset')}</Option>
          </Select>
          <Text type="secondary">
            {t('camera.cameraList')}: {filteredCameras.length} / {CAMERA_COUNT}
          </Text>
        </Space>
      </Card>

      <Row gutter={[16, 16]}>
        {filteredCameras.map(renderCameraCard)}
      </Row>

      <Modal
        title={`${t('common.camera')} ${selectedCameraId}`}
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={800}
        centered
        destroyOnClose
      >
        {recordingLoading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '300px'
          }}>
            <Spin size="large" tip={`${t('dashboard.loading')}`} />
          </div>
        ) : recordingError ? (
          <Alert
            message={t('common.error')}
            description={recordingError}
            type="error"
            showIcon
          />
        ) : currentRecording ? (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <div>
              <Text strong>文件名 / Filename:</Text> {currentRecording.filename}
            </div>
            <div>
              <Text strong>录制时间 / Timestamp:</Text> {currentRecording.timestamp}
            </div>
            <div>
              <Text strong>文件大小 / Size:</Text> {currentRecording.size_mb.toFixed(2)} MB
            </div>
            <div style={{
              width: '100%',
              border: '1px solid #d9d9d9',
              borderRadius: '4px',
              overflow: 'hidden',
              background: '#000'
            }}>
              <video
                controls
                autoPlay
                style={{ width: '100%', maxHeight: '500px' }}
                src={`${API_BASE_URL.replace('/api', '')}${currentRecording.download_url}`}
              >
                您的浏览器不支持视频播放 / Your browser does not support video playback
              </video>
            </div>
          </Space>
        ) : null}
      </Modal>
    </Space>
  );
};

export default CameraMonitor;

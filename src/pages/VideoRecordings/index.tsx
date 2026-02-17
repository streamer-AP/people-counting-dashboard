import React, { useState, useEffect } from 'react';
import {
  Card,
  Select,
  Space,
  Empty,
  Spin,
  Typography,
  List,
  Tag,
  Button,
  Alert,
  Row,
  Col,
} from 'antd';
import {
  VideoCameraOutlined,
  DownloadOutlined,
  ReloadOutlined,
  PlayCircleOutlined,
  ClockCircleOutlined,
  FileOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { getRecentRecordings } from '../../api/counting';
import { RecordingsResponse, Recording } from '../../types/counting';
import { formatUTCToLocal } from '../../utils/dateFormat';
import { API_BASE_URL, CAMERA_COUNT } from '../../utils/constants';

const { Title, Text } = Typography;
const { Option } = Select;

const VideoRecordings: React.FC = () => {
  const { t } = useTranslation();
  const [selectedCamera, setSelectedCamera] = useState<string>('camera_1');
  const [limit, setLimit] = useState<number>(5);
  const [data, setData] = useState<RecordingsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecordings = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getRecentRecordings(selectedCamera, limit);
      setData(result);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch recordings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecordings();
  }, [selectedCamera, limit]);

  const handleDownload = (recording: Recording) => {
    // recording.download_url already contains '/api', so we need to use the base server URL
    const baseUrl = API_BASE_URL.replace('/api', '');
    const downloadUrl = `${baseUrl}${recording.download_url}`;
    window.open(downloadUrl, '_blank');
  };

  const formatFileSize = (bytes: number, mb: number): string => {
    if (mb >= 1) {
      return `${mb.toFixed(2)} MB`;
    }
    if (bytes >= 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`;
    }
    return `${bytes} bytes`;
  };

  const cameraOptions = Array.from({ length: CAMERA_COUNT }, (_, i) => ({
    value: `camera_${i + 1}`,
    label: `${t('common.camera')} ${i + 1}`,
  }));

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Header */}
      <Card>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <VideoCameraOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
            <Title level={2} style={{ margin: 0 }}>
              视频录制 / Video Recordings
            </Title>
          </div>
          <Text type="secondary">
            查看和下载摄像头录制的视频文件
            <br />
            View and download recorded video files from cameras
          </Text>
        </Space>
      </Card>

      {/* Filters */}
      <Card>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Space>
              <Text strong>选择摄像头 / Select Camera:</Text>
              <Select
                value={selectedCamera}
                onChange={setSelectedCamera}
                style={{ width: '200px' }}
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={cameraOptions}
              />
            </Space>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Space>
              <Text strong>显示数量 / Limit:</Text>
              <Select value={limit} onChange={setLimit} style={{ width: '120px' }}>
                <Option value={5}>5</Option>
                <Option value={10}>10</Option>
                <Option value={20}>20</Option>
                <Option value={50}>50</Option>
              </Select>
            </Space>
          </Col>
          <Col xs={24} sm={24} md={8} style={{ textAlign: 'right' }}>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchRecordings}
              loading={loading}
            >
              刷新 / Refresh
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert
          message="错误 / Error"
          description={error}
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
        />
      )}

      {/* Recordings Info */}
      {data && data.recordings.length > 0 && (
        <Card>
          <Space size="large">
            <div>
              <Text type="secondary">总记录数 / Total: </Text>
              <Tag color="blue">{data.total}</Tag>
            </div>
            <div>
              <Text type="secondary">显示数量 / Showing: </Text>
              <Tag color="green">{data.recordings.length}</Tag>
            </div>
            <div>
              <Text type="secondary">存储目录 / Directory: </Text>
              <Text code style={{ fontSize: '12px' }}>{data.directory}</Text>
            </div>
          </Space>
        </Card>
      )}

      {/* Recordings List */}
      <Card title={`${selectedCamera} 的录制视频 / Recordings`}>
        {loading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '300px'
          }}>
            <Spin size="large" tip="加载中... / Loading..." />
          </div>
        ) : !data || data.recordings.length === 0 ? (
          <Empty
            description="暂无录制视频 / No recordings found"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <List
            dataSource={data.recordings}
            renderItem={(recording) => (
              <List.Item
                key={recording.filename}
                actions={[
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={() => handleDownload(recording)}
                  >
                    下载 / Download
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <PlayCircleOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
                  }
                  title={
                    <Space>
                      <FileOutlined />
                      <Text strong>{recording.filename}</Text>
                      <Tag color="blue">{recording.camera}</Tag>
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size="small">
                      <Space wrap>
                        <Tag icon={<ClockCircleOutlined />} color="default">
                          录制时间 / Timestamp: {formatUTCToLocal(recording.timestamp)}
                        </Tag>
                        <Tag color="green">
                          文件大小 / Size: {formatFileSize(recording.size_bytes, recording.size_mb)}
                        </Tag>
                      </Space>
                      <Space wrap>
                        <Text type="secondary">
                          创建时间 / Created: {formatUTCToLocal(recording.created_at)}
                        </Text>
                        <Text type="secondary">
                          修改时间 / Modified: {formatUTCToLocal(recording.modified_at)}
                        </Text>
                      </Space>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>

      {/* Instructions */}
      <Card title="使用说明 / Instructions">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text>
            <Text strong>1. 选择摄像头 / Select Camera</Text>
            <br />
            从下拉列表中选择要查看的摄像头
            <br />
            Choose a camera from the dropdown list
          </Text>
          <Text>
            <Text strong>2. 设置显示数量 / Set Limit</Text>
            <br />
            选择要显示的最近录制视频数量
            <br />
            Select the number of recent recordings to display
          </Text>
          <Text>
            <Text strong>3. 下载视频 / Download Video</Text>
            <br />
            点击"下载"按钮即可下载视频文件
            <br />
            Click the "Download" button to download the video file
          </Text>
        </Space>
      </Card>
    </Space>
  );
};

export default VideoRecordings;

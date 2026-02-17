import React, { useState, useEffect } from 'react';
import {
  Card,
  Space,
  DatePicker,
  Button,
  Select,
  Empty,
  Spin,
  Typography,
  Row,
  Col,
  Image,
  Tag,
  Statistic,
  Timeline,
  Divider,
  Pagination,
  Alert,
} from 'antd';
import {
  ClockCircleOutlined,
  ReloadOutlined,
  UserOutlined,
  CameraOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import { getHistoryByTimeRange } from '../../api/counting';
import { CountingData } from '../../types/counting';
import { formatUTCToLocal } from '../../utils/dateFormat';
import dayjs, { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;
const { Option } = Select;

const HistoryDetails: React.FC = () => {
  const [data, setData] = useState<CountingData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().subtract(1, 'hour'),
    dayjs(),
  ]);
  const [limit, setLimit] = useState<number>(100);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const startTime = dateRange[0].utc().format();
      const endTime = dateRange[1].utc().format();
      const result = await getHistoryByTimeRange(startTime, endTime, limit);
      const arr = Array.isArray(result) ? result : [];
      // Reverse so newest records appear first in timeline
      setData(arr.reverse());
      setCurrentPage(1);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch history');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDateRangeChange = (dates: any) => {
    if (dates && dates[0] && dates[1]) {
      setDateRange([dates[0], dates[1]]);
    }
  };

  const getCameraStats = (record: CountingData) => {
    const ptzNormal = record.CamPtz.filter(v => !v).length;
    const ptzOffset = record.CamPtz.filter(v => v).length;
    const streamOnline = record.CamStream.filter(v => v).length;
    const streamOffline = record.CamStream.filter(v => !v).length;
    return { ptzNormal, ptzOffset, streamOnline, streamOffline };
  };

  const paginatedData = data.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Header */}
      <Card>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <HistoryOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
            <Title level={2} style={{ margin: 0 }}>
              历史记录详情 / History Details
            </Title>
          </div>
          <Text type="secondary">
            查看带密度图的历史数据记录（每分钟一条）
            <br />
            View historical data with density maps (one record per minute)
          </Text>
        </Space>
      </Card>

      {/* Filters */}
      <Card>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={12}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong>时间范围 / Time Range:</Text>
              <RangePicker
                showTime
                value={dateRange}
                onChange={handleDateRangeChange}
                format="YYYY-MM-DD HH:mm:ss"
                style={{ width: '100%' }}
              />
            </Space>
          </Col>
          <Col xs={24} md={6}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong>记录数量 / Limit:</Text>
              <Select
                value={limit}
                onChange={setLimit}
                style={{ width: '100%' }}
              >
                <Option value={50}>50</Option>
                <Option value={100}>100</Option>
                <Option value={200}>200</Option>
                <Option value={500}>500</Option>
              </Select>
            </Space>
          </Col>
          <Col xs={24} md={6} style={{ display: 'flex', alignItems: 'flex-end' }}>
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={fetchHistory}
              loading={loading}
              style={{ width: '100%' }}
            >
              查询 / Query
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

      {/* Summary */}
      {data.length > 0 && (
        <Card>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Statistic
                title="总记录数 / Total Records"
                value={data.length}
                prefix={<HistoryOutlined />}
              />
            </Col>
            <Col xs={24} sm={8}>
              <Statistic
                title="平均人数 / Avg Count"
                value={(data.reduce((sum, r) => sum + r.Count, 0) / data.length).toFixed(1)}
                prefix={<UserOutlined />}
              />
            </Col>
            <Col xs={24} sm={8}>
              <Statistic
                title="平均置信度 / Avg Confidence"
                value={(data.reduce((sum, r) => sum + r.Confidence, 0) / data.length * 100).toFixed(1)}
                suffix="%"
              />
            </Col>
          </Row>
        </Card>
      )}

      {/* History Records */}
      <Card title={`历史记录 / History Records (${data.length})`}>
        {loading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '300px'
          }}>
            <Spin size="large" tip="加载中... / Loading..." />
          </div>
        ) : data.length === 0 ? (
          <Empty
            description="暂无历史数据 / No history data"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <>
            <Timeline mode="left">
              {paginatedData.map((record, index) => {
                const stats = getCameraStats(record);
                return (
                  <Timeline.Item
                    key={index}
                    color="blue"
                    dot={<ClockCircleOutlined style={{ fontSize: '16px' }} />}
                  >
                    <Card size="small" style={{ marginBottom: '16px' }}>
                      <Row gutter={[16, 16]}>
                        {/* Time and Basic Info */}
                        <Col xs={24} lg={8}>
                          <Space direction="vertical" style={{ width: '100%' }} size="small">
                            <div>
                              <ClockCircleOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                              <Text strong>时间 / Time:</Text>
                              <br />
                              <Text>{formatUTCToLocal(record.Timestamp)}</Text>
                            </div>

                            <div>
                              <UserOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
                              <Text strong>人数 / Count:</Text>
                              <Tag color="blue" style={{ marginLeft: '8px', fontSize: '16px' }}>
                                {record.Count}
                              </Tag>
                            </div>

                            <div>
                              <Text strong>置信度 / Confidence:</Text>
                              <Tag
                                color={record.Confidence > 0.8 ? 'success' : 'warning'}
                                style={{ marginLeft: '8px' }}
                              >
                                {(record.Confidence * 100).toFixed(1)}%
                              </Tag>
                            </div>

                            <Divider style={{ margin: '8px 0' }} />

                            <div>
                              <CameraOutlined style={{ marginRight: '8px' }} />
                              <Text strong>摄像头状态 / Camera Status:</Text>
                            </div>

                            <Space direction="vertical" size={4} style={{ marginLeft: '24px' }}>
                              <div>
                                <Text type="secondary">PTZ 正常:</Text>
                                <Tag color="success" style={{ marginLeft: '8px' }}>
                                  {stats.ptzNormal} / {record.CamPtz.length}
                                </Tag>
                              </div>
                              <div>
                                <Text type="secondary">PTZ 偏移:</Text>
                                <Tag color="error" style={{ marginLeft: '8px' }}>
                                  {stats.ptzOffset} / {record.CamPtz.length}
                                </Tag>
                              </div>
                              <div>
                                <Text type="secondary">流在线:</Text>
                                <Tag color="success" style={{ marginLeft: '8px' }}>
                                  {stats.streamOnline} / {record.CamStream.length}
                                </Tag>
                              </div>
                              <div>
                                <Text type="secondary">流离线:</Text>
                                <Tag color="error" style={{ marginLeft: '8px' }}>
                                  {stats.streamOffline} / {record.CamStream.length}
                                </Tag>
                              </div>
                            </Space>
                          </Space>
                        </Col>

                        {/* Density Map Image */}
                        <Col xs={24} lg={16}>
                          <div>
                            <Text strong>密度图 / Density Map:</Text>
                            <div style={{
                              marginTop: '8px',
                              border: '1px solid #d9d9d9',
                              borderRadius: '4px',
                              overflow: 'hidden',
                              background: '#f5f5f5'
                            }}>
                              <Image
                                src={`data:image/jpeg;base64,${record.Image}`}
                                alt={`Density Map - ${record.Timestamp}`}
                                style={{ width: '100%', height: 'auto', transform: 'rotate(90deg)' }}
                                placeholder={
                                  <div style={{
                                    height: '300px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}>
                                    <Spin />
                                  </div>
                                }
                              />
                            </div>
                          </div>
                        </Col>
                      </Row>
                    </Card>
                  </Timeline.Item>
                );
              })}
            </Timeline>

            {/* Pagination */}
            {data.length > pageSize && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={data.length}
                  onChange={(page, size) => {
                    setCurrentPage(page);
                    if (size) setPageSize(size);
                  }}
                  showSizeChanger
                  showQuickJumper
                  showTotal={(total) => `总共 ${total} 条记录 / Total ${total} records`}
                  pageSizeOptions={['10', '20', '50', '100']}
                />
              </div>
            )}
          </>
        )}
      </Card>

      {/* Instructions */}
      <Card title="使用说明 / Instructions">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text>
            <Text strong>1. 选择时间范围 / Select Time Range</Text>
            <br />
            使用时间范围选择器选择开始和结束时间
            <br />
            Use the time range picker to select start and end time
          </Text>
          <Text>
            <Text strong>2. 设置记录数量 / Set Record Limit</Text>
            <br />
            选择要获取的最大记录数量（50-500）
            <br />
            Select the maximum number of records to fetch (50-500)
          </Text>
          <Text>
            <Text strong>3. 查看密度图 / View Density Maps</Text>
            <br />
            每条记录都包含对应时刻的密度图和详细信息
            <br />
            Each record includes the density map and detailed information for that moment
          </Text>
          <Text>
            <Text strong>注意 / Note:</Text>
            <br />
            - 记录间隔约为1分钟 / Records are approximately 1 minute apart
            <br />
            - 图片为Base64编码的JPEG格式 / Images are Base64-encoded JPEG format
            <br />
            - 可点击图片查看大图 / Click on image to view in full size
          </Text>
        </Space>
      </Card>
    </Space>
  );
};

export default HistoryDetails;

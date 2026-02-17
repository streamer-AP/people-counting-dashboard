import React, { useState } from 'react';
import { Card, Button, Space, Tag, Descriptions, Alert, Spin, Typography, Divider, Collapse } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  ApiOutlined
} from '@ant-design/icons';
import {
  getLatestData,
  getHistoryData,
  getSystemStatus,
  getStats,
  getHealth,
  getMultiviewResult,
  getUmbrellaResult,
  getSingleviewResult,
  getUmbrellaHistory,
  getStreamHealth,
  getStreamAlerts,
  getStreamStats,
  getReliabilityStatus,
  getReliabilityConfig,
  getAlgorithmHealth,
  getCountingConfig,
  getCountingAlerts,
  getAlgorithmLatestRequest,
  getAlgorithmLatestResponse,
} from '../../api/counting';
import { API_BASE_URL } from '../../utils/constants';

const { Title, Text, Paragraph } = Typography;

interface TestResult {
  endpoint: string;
  category: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  responseTime?: number;
  data?: any;
}

interface TestDef {
  name: string;
  endpoint: string;
  category: string;
  fn: () => Promise<any>;
}

const ApiTest: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const testEndpoint = async (
    test: TestDef,
  ): Promise<TestResult> => {
    const startTime = Date.now();
    try {
      const data = await test.fn();
      const responseTime = Date.now() - startTime;
      return {
        endpoint: `${test.endpoint} - ${test.name}`,
        category: test.category,
        status: 'success',
        message: '连接成功 / Connection successful',
        responseTime,
        data,
      };
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      return {
        endpoint: `${test.endpoint} - ${test.name}`,
        category: test.category,
        status: 'error',
        message: error.response?.status === 404
          ? '404 - 暂无数据 / No data available'
          : `错误 / Error: ${error.message}`,
        responseTime,
      };
    }
  };

  const allTests: TestDef[] = [
    // Basic
    { name: 'Health Check', endpoint: '/health', category: 'Basic', fn: getHealth },
    { name: 'Latest Data', endpoint: '/latest', category: 'Basic', fn: getLatestData },
    { name: 'System Status', endpoint: '/status', category: 'Basic', fn: getSystemStatus },
    { name: 'Statistics', endpoint: '/stats', category: 'Basic', fn: getStats },
    { name: 'History (10)', endpoint: '/history?limit=10', category: 'Basic', fn: () => getHistoryData(10) },
    // Multiview & Umbrella
    { name: 'Multiview Result', endpoint: '/multiview', category: 'Algorithm', fn: getMultiviewResult },
    { name: 'Singleview Result', endpoint: '/singleview', category: 'Algorithm', fn: getSingleviewResult },
    { name: 'Umbrella Detection', endpoint: '/umbrella', category: 'Algorithm', fn: getUmbrellaResult },
    { name: 'Umbrella History', endpoint: '/umbrella/history?limit=5', category: 'Algorithm', fn: () => getUmbrellaHistory(5) },
    // Stream
    { name: 'Stream Health', endpoint: '/stream/health', category: 'Stream', fn: getStreamHealth },
    { name: 'Stream Alerts', endpoint: '/stream/alerts?limit=10', category: 'Stream', fn: () => getStreamAlerts(10) },
    { name: 'Stream Stats', endpoint: '/stream/stats', category: 'Stream', fn: getStreamStats },
    // Reliability
    { name: 'Reliability Status', endpoint: '/reliability/status', category: 'Reliability', fn: getReliabilityStatus },
    { name: 'Reliability Config', endpoint: '/reliability/config', category: 'Reliability', fn: getReliabilityConfig },
    // Algorithm Health
    { name: 'Algorithm Health', endpoint: '/algorithm/health', category: 'Algorithm', fn: getAlgorithmHealth },
    { name: 'Algorithm Latest Request', endpoint: '/algorithm/latest-request', category: 'Algorithm', fn: getAlgorithmLatestRequest },
    { name: 'Algorithm Latest Response (Multiview)', endpoint: '/algorithm/latest-response?type=multiview', category: 'Algorithm', fn: () => getAlgorithmLatestResponse('multiview') },
    { name: 'Algorithm Latest Response (Umbrella)', endpoint: '/algorithm/latest-response?type=umbrella', category: 'Algorithm', fn: () => getAlgorithmLatestResponse('umbrella') },
    // Counting
    { name: 'Counting Config', endpoint: '/counting/config', category: 'Counting', fn: getCountingConfig },
    { name: 'Counting Alerts', endpoint: '/counting/alerts?limit=10', category: 'Counting', fn: () => getCountingAlerts(10) },
  ];

  const runAllTests = async () => {
    setTesting(true);
    setResults([]);

    const testResults: TestResult[] = [];

    for (const test of allTests) {
      const result = await testEndpoint(test);
      testResults.push(result);
      setResults([...testResults]);
    }

    setTesting(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '20px' }} />;
      case 'error':
        return <CloseCircleOutlined style={{ color: '#f5222d', fontSize: '20px' }} />;
      case 'pending':
        return <SyncOutlined spin style={{ color: '#1890ff', fontSize: '20px' }} />;
    }
  };

  const getStatusTag = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <Tag color="success">成功 / Success</Tag>;
      case 'error':
        return <Tag color="error">失败 / Failed</Tag>;
      case 'pending':
        return <Tag color="processing">测试中 / Testing</Tag>;
    }
  };

  const categoryColor: Record<string, string> = {
    Basic: 'blue',
    Algorithm: 'purple',
    Stream: 'cyan',
    Reliability: 'green',
    Counting: 'orange',
  };

  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  const totalTests = results.length;

  // Group results by category
  const categories = [...new Set(results.map(r => r.category))];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Header */}
      <Card>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ApiOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
            <Title level={2} style={{ margin: 0 }}>
              API 连通性测试 / API Connectivity Test
            </Title>
          </div>
          <Paragraph type="secondary">
            测试所有API端点的连通性和响应时间（共 {allTests.length} 个端点）/ Test connectivity and response time for all {allTests.length} API endpoints
          </Paragraph>
          <Divider />
          <Space>
            <Button
              type="primary"
              size="large"
              icon={<SyncOutlined />}
              onClick={runAllTests}
              loading={testing}
            >
              {testing ? `测试中 ${results.length}/${allTests.length}... / Testing...` : '开始测试 / Start Test'}
            </Button>
            {results.length > 0 && (
              <Button onClick={() => setResults([])}>
                清除结果 / Clear Results
              </Button>
            )}
          </Space>
        </Space>
      </Card>

      {/* API Configuration */}
      <Card title="API 配置 / API Configuration">
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Base URL">
            <Text code copyable>{API_BASE_URL}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Polling Interval">
            1000ms (1 second)
          </Descriptions.Item>
          <Descriptions.Item label="Timeout">
            10000ms (10 seconds)
          </Descriptions.Item>
          <Descriptions.Item label="Endpoints">
            <Space wrap>
              {Object.entries(categoryColor).map(([cat, color]) => {
                const count = allTests.filter(t => t.category === cat).length;
                return (
                  <Tag key={cat} color={color}>{cat}: {count}</Tag>
                );
              })}
            </Space>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Test Summary */}
      {results.length > 0 && (
        <Card title="测试摘要 / Test Summary">
          <Space size="large" wrap>
            <div>
              <Text strong>总测试数 / Total Tests: </Text>
              <Tag color="blue">{totalTests} / {allTests.length}</Tag>
            </div>
            <div>
              <Text strong>成功 / Success: </Text>
              <Tag color="success">{successCount}</Tag>
            </div>
            <div>
              <Text strong>失败 / Failed: </Text>
              <Tag color="error">{errorCount}</Tag>
            </div>
            <div>
              <Text strong>成功率 / Success Rate: </Text>
              <Tag color={successCount === totalTests ? 'success' : 'warning'}>
                {totalTests > 0 ? ((successCount / totalTests) * 100).toFixed(0) : 0}%
              </Tag>
            </div>
            {totalTests > 0 && (
              <div>
                <Text strong>平均响应 / Avg Response: </Text>
                <Tag color="blue">
                  {Math.round(results.reduce((sum, r) => sum + (r.responseTime || 0), 0) / totalTests)}ms
                </Tag>
              </div>
            )}
          </Space>
          {successCount === totalTests && totalTests === allTests.length && (
            <Alert
              message="所有测试通过！/ All tests passed!"
              type="success"
              showIcon
              style={{ marginTop: '16px' }}
            />
          )}
          {errorCount > 0 && (
            <Alert
              message={`${errorCount} 个测试失败 / ${errorCount} test(s) failed`}
              description="请检查API服务器是否运行正常 / Please check if the API server is running properly"
              type="error"
              showIcon
              style={{ marginTop: '16px' }}
            />
          )}
        </Card>
      )}

      {/* Test Results grouped by category */}
      {categories.map(cat => {
        const catResults = results.filter(r => r.category === cat);
        const catSuccess = catResults.filter(r => r.status === 'success').length;

        return (
          <Card
            key={cat}
            title={
              <Space>
                <Tag color={categoryColor[cat] || 'default'}>{cat}</Tag>
                <Text>{catSuccess}/{catResults.length} 通过 / passed</Text>
              </Space>
            }
          >
            <Collapse
              items={catResults.map((result, index) => ({
                key: `${cat}-${index}`,
                label: (
                  <Space>
                    {getStatusIcon(result.status)}
                    <Text strong>{result.endpoint}</Text>
                    {result.responseTime !== undefined && (
                      <Tag color={result.responseTime < 1000 ? 'success' : 'warning'}>
                        {result.responseTime}ms
                      </Tag>
                    )}
                  </Space>
                ),
                extra: getStatusTag(result.status),
                children: (
                  <Descriptions bordered column={1} size="small">
                    <Descriptions.Item label="状态 / Status">
                      {result.message}
                    </Descriptions.Item>
                    <Descriptions.Item label="响应时间 / Response Time">
                      {result.responseTime ? (
                        <Tag color={result.responseTime < 1000 ? 'success' : 'warning'}>
                          {result.responseTime}ms
                        </Tag>
                      ) : 'N/A'}
                    </Descriptions.Item>
                    {result.data && (
                      <Descriptions.Item label="响应数据 / Response Data">
                        <div style={{
                          maxHeight: '200px',
                          overflow: 'auto',
                          background: '#f5f5f5',
                          padding: '12px',
                          borderRadius: '4px'
                        }}>
                          <pre style={{ margin: 0, fontSize: '12px' }}>
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </div>
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                ),
              }))}
            />
          </Card>
        );
      })}

      {/* Testing Indicator */}
      {testing && results.length === 0 && (
        <Card>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '200px',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <Spin size="large" />
            <Text>正在测试API连通性... / Testing API connectivity...</Text>
          </div>
        </Card>
      )}

      {/* Instructions */}
      {results.length === 0 && !testing && (
        <Card title="使用说明 / Instructions">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Paragraph>
              <Text strong>1. 点击"开始测试"按钮</Text>
              <br />
              Click the "Start Test" button to begin testing all {allTests.length} API endpoints.
            </Paragraph>
            <Paragraph>
              <Text strong>2. 测试端点分组 / Endpoint Categories:</Text>
            </Paragraph>
            <div style={{ paddingLeft: 16 }}>
              <Space direction="vertical">
                <Text><Tag color="blue">Basic</Tag> /health, /latest, /status, /stats, /history</Text>
                <Text><Tag color="purple">Algorithm</Tag> /multiview, /umbrella, /umbrella/history, /algorithm/health</Text>
                <Text><Tag color="cyan">Stream</Tag> /stream/health, /stream/alerts, /stream/stats</Text>
                <Text><Tag color="green">Reliability</Tag> /reliability/status, /reliability/config</Text>
                <Text><Tag color="orange">Counting</Tag> /counting/config, /counting/alerts</Text>
              </Space>
            </div>
            <Paragraph style={{ marginTop: 16 }}>
              <Text strong>3. 排查问题</Text>
              <br />
              If any tests fail, check:
              <ul>
                <li>API服务器是否运行 / Is the API server running?</li>
                <li>网络连接是否正常 / Is the network connection stable?</li>
                <li>CORS是否已启用 / Is CORS enabled on the server?</li>
                <li>防火墙设置 / Firewall settings</li>
              </ul>
            </Paragraph>
          </Space>
        </Card>
      )}
    </Space>
  );
};

export default ApiTest;

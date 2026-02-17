import React, { useState } from 'react';
import {
  Card,
  Form,
  InputNumber,
  Button,
  Space,
  Alert,
  Divider,
  Switch,
  Row,
  Col,
  Upload,
  message,
  Typography,
  Tag,
  Descriptions,
} from 'antd';
import {
  SendOutlined,
  ThunderboltOutlined,
  UploadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { API_BASE_URL, CAMERA_COUNT } from '../../utils/constants';

dayjs.extend(utc);

const { Title, Text, Paragraph } = Typography;

interface SendResult {
  success: boolean;
  status?: number;
  message: string;
  timestamp: string;
}

const DataSender: React.FC = () => {
  const [form] = Form.useForm();
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<SendResult | null>(null);
  const [camPtz, setCamPtz] = useState<boolean[]>(Array(CAMERA_COUNT).fill(false));
  const [camStream, setCamStream] = useState<boolean[]>(Array(CAMERA_COUNT).fill(true));
  const [imageBase64, setImageBase64] = useState<string>('');

  // Generate random data
  const generateRandomData = () => {
    // Random count 8-9
    const randomCount = Math.floor(Math.random() * 2) + 8;

    // Random confidence 0.85-0.99
    const randomConfidence = Math.random() * 0.14 + 0.85;

    // Random CamPtz and CamStream values
    const randomPtz = Array(CAMERA_COUNT).fill(0).map(() => Math.random() < 0.2);
    const randomStream = Array(CAMERA_COUNT).fill(0).map(() => Math.random() > 0.15);

    // Update form
    form.setFieldsValue({
      count: randomCount,
      confidence: parseFloat(randomConfidence.toFixed(4)),
    });

    setCamPtz(randomPtz);
    setCamStream(randomStream);

    message.success('已生成随机数据 / Random data generated');
  };

  // Set all to true/false
  const setAllCamPtz = (value: boolean) => {
    setCamPtz(Array(CAMERA_COUNT).fill(value));
  };

  const setAllCamStream = (value: boolean) => {
    setCamStream(Array(CAMERA_COUNT).fill(value));
  };

  // Handle image upload
  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      // Remove the "data:image/xxx;base64," prefix
      const base64Data = base64.split(',')[1];
      setImageBase64(base64Data);
      message.success('图片已加载 / Image loaded');
    };
    reader.readAsDataURL(file);
    return false; // Prevent automatic upload
  };

  // Send data
  const sendData = async () => {
    try {
      await form.validateFields();
      setSending(true);
      setResult(null);

      const values = form.getFieldsValue();

      // Build payload
      const payload = {
        Timestamp: dayjs().utc().format('YYYY-MM-DDTHH:mm:ss[Z]'),
        Count: values.count,
        Confidence: values.confidence,
        CamPtz: camPtz,
        CamStream: camStream,
        Image: imageBase64 || 'DummyBase64StringForTesting==',
      };

      // Send to our backend server, which forwards to the API
      const response = await axios.post(`${API_BASE_URL}/send`, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      setResult({
        success: true,
        status: response.data.api_status || response.status,
        message: response.data.message || '数据发送成功 / Data sent successfully',
        timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      });

      message.success('发送成功！/ Sent successfully!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || '发送失败';
      setResult({
        success: false,
        status: error.response?.status,
        message: `发送失败 / Failed: ${errorMessage}`,
        timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      });

      message.error('发送失败 / Send failed');
    } finally {
      setSending(false);
    }
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Header */}
      <Card>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <SendOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
            <Title level={2} style={{ margin: 0 }}>
              数据发送器 / Data Sender
            </Title>
          </div>
          <Paragraph type="secondary">
            向系统发送测试数据，支持手动配置和随机生成
            <br />
            Send test data to the system with manual configuration or random generation
          </Paragraph>
        </Space>
      </Card>

      {/* API Configuration */}
      <Card title="API 配置 / API Configuration">
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Backend Server">
            <Text code copyable style={{ fontSize: '12px' }}>
              {API_BASE_URL}/send
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Architecture">
            <Text type="secondary">
              前端 → 后端服务器 → API
              <br />
              Frontend → Backend Server → API
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Camera Count">
            {CAMERA_COUNT}
          </Descriptions.Item>
          <Descriptions.Item label="Security">
            <Tag color="success">API密钥在后端 / API Key on Backend</Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Data Form */}
      <Card
        title="数据配置 / Data Configuration"
        extra={
          <Button
            type="dashed"
            icon={<ThunderboltOutlined />}
            onClick={generateRandomData}
          >
            随机生成 / Random Generate
          </Button>
        }
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            count: 8,
            confidence: 0.95,
          }}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="人数 / Count"
                name="count"
                rules={[{ required: true, message: '请输入人数' }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  placeholder="8-9"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="置信度 / Confidence"
                name="confidence"
                rules={[
                  { required: true, message: '请输入置信度' },
                  { type: 'number', min: 0, max: 1, message: '范围: 0-1' },
                ]}
              >
                <InputNumber
                  min={0}
                  max={1}
                  step={0.01}
                  style={{ width: '100%' }}
                  placeholder="0.95"
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider>摄像头状态 / Camera Status</Divider>

          {/* CamPtz */}
          <Card
            size="small"
            title="CamPtz (PTZ状态)"
            extra={
              <Space>
                <Button size="small" onClick={() => setAllCamPtz(false)}>
                  全部正常 / All Normal
                </Button>
                <Button size="small" onClick={() => setAllCamPtz(true)}>
                  全部偏移 / All Offset
                </Button>
              </Space>
            }
            style={{ marginBottom: '16px' }}
          >
            <Row gutter={[8, 8]}>
              {camPtz.map((value, index) => (
                <Col key={index} xs={12} sm={8} md={6} lg={4}>
                  <Space>
                    <Text>Cam {index + 1}:</Text>
                    <Switch
                      checked={value}
                      onChange={(checked) => {
                        const newPtz = [...camPtz];
                        newPtz[index] = checked;
                        setCamPtz(newPtz);
                      }}
                      checkedChildren="偏移"
                      unCheckedChildren="正常"
                    />
                  </Space>
                </Col>
              ))}
            </Row>
          </Card>

          {/* CamStream */}
          <Card
            size="small"
            title="CamStream (流状态)"
            extra={
              <Space>
                <Button size="small" onClick={() => setAllCamStream(true)}>
                  全部在线 / All Online
                </Button>
                <Button size="small" onClick={() => setAllCamStream(false)}>
                  全部离线 / All Offline
                </Button>
              </Space>
            }
          >
            <Row gutter={[8, 8]}>
              {camStream.map((value, index) => (
                <Col key={index} xs={12} sm={8} md={6} lg={4}>
                  <Space>
                    <Text>Cam {index + 1}:</Text>
                    <Switch
                      checked={value}
                      onChange={(checked) => {
                        const newStream = [...camStream];
                        newStream[index] = checked;
                        setCamStream(newStream);
                      }}
                      checkedChildren="在线"
                      unCheckedChildren="离线"
                    />
                  </Space>
                </Col>
              ))}
            </Row>
          </Card>

          <Divider>图片 / Image</Divider>

          <Form.Item label="上传图片 / Upload Image (可选 / Optional)">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Upload
                accept="image/*"
                beforeUpload={handleImageUpload}
                maxCount={1}
                showUploadList={false}
              >
                <Button icon={<UploadOutlined />}>
                  选择图片 / Select Image
                </Button>
              </Upload>
              {imageBase64 && (
                <Alert
                  message="图片已加载 / Image loaded"
                  description={`Base64 长度: ${imageBase64.length} 字符`}
                  type="success"
                  showIcon
                  closable
                  onClose={() => setImageBase64('')}
                />
              )}
              {!imageBase64 && (
                <Text type="secondary">
                  未上传图片时将使用默认占位符 / Default placeholder will be used if no image uploaded
                </Text>
              )}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {/* Send Button */}
      <Card>
        <Space size="large" style={{ width: '100%', justifyContent: 'center' }}>
          <Button
            type="primary"
            size="large"
            icon={<SendOutlined />}
            onClick={sendData}
            loading={sending}
            style={{ minWidth: '200px' }}
          >
            {sending ? '发送中... / Sending...' : '发送数据 / Send Data'}
          </Button>
        </Space>
      </Card>

      {/* Result */}
      {result && (
        <Card
          title={
            <Space>
              {result.success ? (
                <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
              ) : (
                <CloseCircleOutlined style={{ color: '#f5222d', fontSize: '20px' }} />
              )}
              <Text strong>发送结果 / Send Result</Text>
            </Space>
          }
        >
          <Alert
            message={result.message}
            type={result.success ? 'success' : 'error'}
            showIcon
            style={{ marginBottom: '16px' }}
          />
          <Descriptions bordered column={1}>
            <Descriptions.Item label="状态 / Status">
              <Tag color={result.success ? 'success' : 'error'}>
                {result.success ? '成功 / Success' : '失败 / Failed'}
              </Tag>
            </Descriptions.Item>
            {result.status && (
              <Descriptions.Item label="HTTP Status Code">
                <Tag color={result.status === 200 ? 'success' : 'error'}>
                  {result.status}
                </Tag>
              </Descriptions.Item>
            )}
            <Descriptions.Item label="时间 / Timestamp">
              {result.timestamp}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      {/* Instructions */}
      <Card title="使用说明 / Instructions">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Paragraph>
            <Text strong>1. 配置数据 / Configure Data</Text>
            <br />
            手动输入人数和置信度，或点击"随机生成"按钮自动填充
            <br />
            Manually input count and confidence, or click "Random Generate" to auto-fill
          </Paragraph>
          <Paragraph>
            <Text strong>2. 设置摄像头状态 / Set Camera Status</Text>
            <br />
            为每个摄像头设置PTZ和Stream状态，或使用批量设置按钮
            <br />
            Set PTZ and Stream status for each camera, or use batch setting buttons
          </Paragraph>
          <Paragraph>
            <Text strong>3. 上传图片（可选）/ Upload Image (Optional)</Text>
            <br />
            上传一张图片，将自动转换为Base64格式
            <br />
            Upload an image, it will be automatically converted to Base64 format
          </Paragraph>
          <Paragraph>
            <Text strong>4. 发送数据 / Send Data</Text>
            <br />
            点击"发送数据"按钮，数据将发送到系统
            <br />
            Click "Send Data" button to send data to the system
          </Paragraph>
        </Space>
      </Card>
    </Space>
  );
};

export default DataSender;

import React from 'react';
import { Card, Tag, Row, Col, Typography } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { CAMERA_COUNT } from '../../utils/constants';

const { Text } = Typography;

interface CameraGridProps {
  camPtz: boolean[];
  camStream: boolean[];
}

const CameraGrid: React.FC<CameraGridProps> = ({ camPtz, camStream }) => {
  const { t } = useTranslation();

  const renderCameraStatus = (index: number) => {
    const ptzStatus = camPtz[index];
    const streamStatus = camStream[index];

    return (
      <Card
        key={index}
        size="small"
        style={{ marginBottom: '8px' }}
        bodyStyle={{ padding: '8px' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <Text strong>{t('common.camera')} {index + 1}</Text>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Tag
              icon={!ptzStatus ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
              color={!ptzStatus ? 'success' : 'error'}
            >
              PTZ: {!ptzStatus ? t('common.normal') : t('camera.ptzOffset')}
            </Tag>
            <Tag
              icon={streamStatus ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
              color={streamStatus ? 'success' : 'error'}
            >
              Stream: {streamStatus ? t('common.online') : t('common.offline')}
            </Tag>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <Card title={t('dashboard.cameraStatus')} style={{ height: '100%' }}>
      <Row gutter={[8, 8]}>
        {Array.from({ length: CAMERA_COUNT }, (_, i) => (
          <Col xs={24} sm={12} md={8} lg={6} key={i}>
            {renderCameraStatus(i)}
          </Col>
        ))}
      </Row>
    </Card>
  );
};

export default CameraGrid;

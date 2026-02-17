import React from 'react';
import { Card, Spin, Empty } from 'antd';
import { useTranslation } from 'react-i18next';

interface CameraImageProps {
  base64Image: string | null;
  loading?: boolean;
}

const CameraImage: React.FC<CameraImageProps> = ({ base64Image, loading = false }) => {
  const { t } = useTranslation();

  return (
    <Card title={t('dashboard.latestImage')} style={{ height: '100%' }}>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
          <Spin size="large" />
        </div>
      ) : base64Image ? (
        <img
          src={`data:image/jpeg;base64,${base64Image}`}
          alt="Camera feed"
          style={{ width: '50%', height: 'auto', borderRadius: '4px' }}
        />
      ) : (
        <Empty description={t('dashboard.noData')} />
      )}
    </Card>
  );
};

export default CameraImage;

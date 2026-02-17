import React from 'react';
import { Card, Statistic } from 'antd';
import { useTranslation } from 'react-i18next';

interface CountDisplayProps {
  count: number;
  confidence: number;
}

const CountDisplay: React.FC<CountDisplayProps> = ({ count, confidence }) => {
  const { t } = useTranslation();

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
        <Statistic
          title={t('dashboard.peopleCount')}
          value={count}
          valueStyle={{ color: '#1890ff', fontSize: '48px', fontWeight: 'bold' }}
        />
        <Statistic
          title={t('dashboard.confidence')}
          value={confidence * 100}
          suffix="%"
          precision={2}
          valueStyle={{ color: '#52c41a', fontSize: '36px' }}
        />
      </div>
    </Card>
  );
};

export default CountDisplay;

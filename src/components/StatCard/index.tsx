import React from 'react';
import { Card, Statistic } from 'antd';

interface StatCardProps {
  title: string;
  value: number | string;
  suffix?: string;
  prefix?: React.ReactNode;
  valueStyle?: React.CSSProperties;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, suffix, prefix, valueStyle }) => {
  return (
    <Card>
      <Statistic
        title={title}
        value={value}
        suffix={suffix}
        prefix={prefix}
        valueStyle={valueStyle}
      />
    </Card>
  );
};

export default StatCard;

import React, { useState, useMemo } from 'react';
import { Card, Row, Col, Select, Button, Space, Empty, Spin } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import ReactECharts from 'echarts-for-react';
import { useHistory } from '../../hooks/useHistory';
import { formatUTCToLocal } from '../../utils/dateFormat';

const { Option } = Select;

const DataAnalysis: React.FC = () => {
  const { t } = useTranslation();
  const [limit, setLimit] = useState<number>(50);
  const { data, loading, refetch } = useHistory(limit);

  const handleLimitChange = (value: number) => {
    setLimit(value);
    refetch(value);
  };

  const handleExport = () => {
    if (sortedData.length === 0) return;

    const csvContent = [
      ['Timestamp', 'Count', 'Confidence', 'PTZ Normal', 'PTZ Offset', 'Stream Online', 'Stream Offline'].join(','),
      ...sortedData.map(item => [
        formatUTCToLocal(item.Timestamp),
        item.Count,
        item.Confidence,
        item.CamPtz.filter(v => !v).length,
        item.CamPtz.filter(Boolean).length,
        item.CamStream.filter(Boolean).length,
        item.CamStream.filter(v => !v).length,
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `counting-data-${new Date().toISOString()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const sortedData = useMemo(() => {
    if (!data?.data) return [];
    return data.data;
  }, [data]);

  const timestamps = useMemo(() => {
    return sortedData.map(item => formatUTCToLocal(item.Timestamp, 'HH:mm:ss'));
  }, [sortedData]);

  // People Count Trend
  const peopleCountOption = useMemo(() => {
    if (sortedData.length === 0) return null;
    return {
      title: { text: t('analysis.peopleCountTrend'), left: 'center' },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: timestamps },
      yAxis: { type: 'value', name: t('dashboard.peopleCount') },
      dataZoom: [{ type: 'inside' }, { type: 'slider' }],
      series: [{
        name: t('dashboard.peopleCount'),
        type: 'line',
        data: sortedData.map(item => item.Count),
        smooth: true,
        itemStyle: { color: '#1890ff' },
        areaStyle: { color: 'rgba(24,144,255,0.15)' },
      }],
    };
  }, [sortedData, timestamps, t]);

  // Confidence Trend
  const confidenceOption = useMemo(() => {
    if (sortedData.length === 0) return null;
    return {
      title: { text: t('analysis.confidenceTrend'), left: 'center' },
      tooltip: { trigger: 'axis', formatter: '{b}<br/>{a}: {c}%' },
      xAxis: { type: 'category', data: timestamps },
      yAxis: { type: 'value', name: t('dashboard.confidence') + ' (%)', min: 0, max: 100 },
      dataZoom: [{ type: 'inside' }, { type: 'slider' }],
      series: [{
        name: t('dashboard.confidence'),
        type: 'line',
        data: sortedData.map(item => (item.Confidence * 100).toFixed(1)),
        smooth: true,
        itemStyle: { color: '#52c41a' },
        areaStyle: { color: 'rgba(82,196,26,0.15)' },
      }],
    };
  }, [sortedData, timestamps, t]);

  // Stream Online/Offline Trend
  const streamTrendOption = useMemo(() => {
    if (sortedData.length === 0) return null;
    return {
      title: { text: t('analysis.streamTrend'), left: 'center' },
      tooltip: { trigger: 'axis' },
      legend: { bottom: 30 },
      xAxis: { type: 'category', data: timestamps },
      yAxis: { type: 'value', name: t('analysis.cameraCount'), min: 0, max: 19 },
      dataZoom: [{ type: 'inside' }, { type: 'slider' }],
      series: [
        {
          name: t('camera.streamOnline'),
          type: 'line',
          data: sortedData.map(item => item.CamStream.filter(Boolean).length),
          smooth: true,
          itemStyle: { color: '#52c41a' },
          areaStyle: { color: 'rgba(82,196,26,0.15)' },
        },
        {
          name: t('camera.streamOffline'),
          type: 'line',
          data: sortedData.map(item => item.CamStream.filter(v => !v).length),
          smooth: true,
          itemStyle: { color: '#f5222d' },
          areaStyle: { color: 'rgba(245,34,45,0.15)' },
        },
      ],
    };
  }, [sortedData, timestamps, t]);

  // PTZ Normal/Offset Trend
  const ptzTrendOption = useMemo(() => {
    if (sortedData.length === 0) return null;
    return {
      title: { text: t('analysis.ptzTrend'), left: 'center' },
      tooltip: { trigger: 'axis' },
      legend: { bottom: 30 },
      xAxis: { type: 'category', data: timestamps },
      yAxis: { type: 'value', name: t('analysis.cameraCount'), min: 0, max: 19 },
      dataZoom: [{ type: 'inside' }, { type: 'slider' }],
      series: [
        {
          name: t('camera.ptzNormal'),
          type: 'line',
          data: sortedData.map(item => item.CamPtz.filter(v => !v).length),
          smooth: true,
          itemStyle: { color: '#52c41a' },
          areaStyle: { color: 'rgba(82,196,26,0.15)' },
        },
        {
          name: t('camera.ptzOffset'),
          type: 'line',
          data: sortedData.map(item => item.CamPtz.filter(Boolean).length),
          smooth: true,
          itemStyle: { color: '#faad14' },
          areaStyle: { color: 'rgba(250,173,20,0.15)' },
        },
      ],
    };
  }, [sortedData, timestamps, t]);

  // Camera Status Distribution (latest snapshot)
  const cameraStatusOption = useMemo(() => {
    if (sortedData.length === 0) return null;
    const latest = sortedData[sortedData.length - 1];
    const onlineCount = latest.CamStream.filter(Boolean).length;
    const offlineCount = latest.CamStream.length - onlineCount;
    return {
      title: { text: t('analysis.cameraStatusDist'), left: 'center' },
      tooltip: { trigger: 'item' },
      legend: { orient: 'vertical', left: 'left' },
      series: [{
        name: t('camera.streamStatus'),
        type: 'pie',
        radius: ['40%', '65%'],
        data: [
          { value: onlineCount, name: t('common.online'), itemStyle: { color: '#52c41a' } },
          { value: offlineCount, name: t('common.offline'), itemStyle: { color: '#f5222d' } },
        ],
        label: { formatter: '{b}: {c} ({d}%)' },
      }],
    };
  }, [sortedData, t]);

  // PTZ Status Distribution (latest snapshot)
  const ptzStatusOption = useMemo(() => {
    if (sortedData.length === 0) return null;
    const latest = sortedData[sortedData.length - 1];
    const normalCount = latest.CamPtz.filter(v => !v).length;
    const offsetCount = latest.CamPtz.length - normalCount;
    return {
      title: { text: t('analysis.ptzStatusDist'), left: 'center' },
      tooltip: { trigger: 'item' },
      legend: { orient: 'vertical', left: 'left' },
      series: [{
        name: t('camera.ptzStatus'),
        type: 'pie',
        radius: ['40%', '65%'],
        data: [
          { value: normalCount, name: t('camera.ptzNormal'), itemStyle: { color: '#52c41a' } },
          { value: offsetCount, name: t('camera.ptzOffset'), itemStyle: { color: '#faad14' } },
        ],
        label: { formatter: '{b}: {c} ({d}%)' },
      }],
    };
  }, [sortedData, t]);

  // Per-camera stream status heatmap
  const perCameraStreamOption = useMemo(() => {
    if (sortedData.length === 0) return null;
    const cameraCount = sortedData[0].CamStream.length;
    const heatData: [number, number, number][] = [];
    sortedData.forEach((item, timeIdx) => {
      item.CamStream.forEach((online, camIdx) => {
        heatData.push([timeIdx, camIdx, online ? 1 : 0]);
      });
    });
    return {
      title: { text: t('analysis.perCameraStream'), left: 'center' },
      tooltip: {
        formatter: (params: any) => {
          const timeLabel = timestamps[params.data[0]];
          const camLabel = `Cam ${params.data[1] + 1}`;
          const status = params.data[2] === 1 ? t('common.online') : t('common.offline');
          return `${timeLabel}<br/>${camLabel}: ${status}`;
        },
      },
      xAxis: {
        type: 'category',
        data: timestamps,
        splitArea: { show: true },
      },
      yAxis: {
        type: 'category',
        data: Array.from({ length: cameraCount }, (_, i) => `Cam ${i + 1}`),
        splitArea: { show: true },
      },
      visualMap: {
        min: 0,
        max: 1,
        show: false,
        inRange: { color: ['#f5222d', '#52c41a'] },
      },
      dataZoom: [{ type: 'inside', xAxisIndex: 0 }, { type: 'slider', xAxisIndex: 0 }],
      series: [{
        type: 'heatmap',
        data: heatData,
        emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.5)' } },
      }],
    };
  }, [sortedData, timestamps, t]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" tip={t('dashboard.loading')} />
      </div>
    );
  }

  if (sortedData.length === 0) {
    return <Empty description={t('analysis.noHistoryData')} />;
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card>
        <Space>
          <span>{t('analysis.timeRange')}:</span>
          <Select value={limit} onChange={handleLimitChange} style={{ width: '150px' }}>
            <Option value={10}>{t('analysis.last10')}</Option>
            <Option value={50}>{t('analysis.last50')}</Option>
            <Option value={100}>{t('analysis.last100')}</Option>
          </Select>
          <Button icon={<DownloadOutlined />} onClick={handleExport}>
            {t('analysis.exportData')}
          </Button>
        </Space>
      </Card>

      {/* People Count & Confidence */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card>
            {peopleCountOption && <ReactECharts option={peopleCountOption} style={{ height: '400px' }} />}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card>
            {confidenceOption && <ReactECharts option={confidenceOption} style={{ height: '400px' }} />}
          </Card>
        </Col>
      </Row>

      {/* Stream & PTZ Trends */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card>
            {streamTrendOption && <ReactECharts option={streamTrendOption} style={{ height: '400px' }} />}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card>
            {ptzTrendOption && <ReactECharts option={ptzTrendOption} style={{ height: '400px' }} />}
          </Card>
        </Col>
      </Row>

      {/* Per-Camera Stream Heatmap */}
      <Card>
        {perCameraStreamOption && <ReactECharts option={perCameraStreamOption} style={{ height: '500px' }} />}
      </Card>

      {/* Status Distribution Snapshots */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card>
            {cameraStatusOption && <ReactECharts option={cameraStatusOption} style={{ height: '350px' }} />}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card>
            {ptzStatusOption && <ReactECharts option={ptzStatusOption} style={{ height: '350px' }} />}
          </Card>
        </Col>
      </Row>
    </Space>
  );
};

export default DataAnalysis;

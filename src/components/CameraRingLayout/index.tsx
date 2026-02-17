import React from 'react';
import { Card, Tooltip, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import cameraLayout, { CameraPosition } from '../../config/cameraLayout';

const { Text } = Typography;

interface CameraRingLayoutProps {
  base64Image: string | null;
  camPtz: boolean[];
  camStream: boolean[];
  reliabilityCameras?: Record<string, { reliable: boolean; umbrella_count: number }>;
}

type CameraStatus = 'normal' | 'ptzOffset' | 'offline' | 'rainAffected';

const statusConfig: Record<CameraStatus, { color: string; border: string }> = {
  normal:       { color: '#52c41a', border: '#52c41a' },
  ptzOffset:    { color: '#f5222d', border: '#f5222d' },
  offline:      { color: '#bfbfbf', border: '#bfbfbf' },
  rainAffected: { color: '#faad14', border: '#faad14' },
};

const getCameraStatus = (
  cameraId: number,
  camPtz: boolean[],
  camStream: boolean[],
  reliabilityCameras?: Record<string, { reliable: boolean; umbrella_count: number }>,
): CameraStatus => {
  const idx = cameraId - 1;
  if (!camStream[idx]) return 'offline';
  if (camPtz[idx]) return 'ptzOffset';
  const rel = reliabilityCameras?.[`camera_${cameraId}`];
  if (rel && !rel.reliable) return 'rainAffected';
  return 'normal';
};

// Density map original size 250x355, displayed as 355x250 after 90° rotation, scaled 2x = 710x500
const IMG_W = 250;
const IMG_H = 355;
const SCALE = 2;
const DISPLAY_W = IMG_H * SCALE; // Rotated width = original height * scale = 710
const DISPLAY_H = IMG_W * SCALE; // Rotated height = original width * scale = 500

const BADGE_SIZE = 27;
const MARGIN = 36; // Badge area width (distance from badge center to density map edge)

const CameraRingLayout: React.FC<CameraRingLayoutProps> = ({
  base64Image,
  camPtz,
  camStream,
  reliabilityCameras,
}) => {
  const { t } = useTranslation();

  const renderBadge = (cam: CameraPosition) => {
    const status = getCameraStatus(cam.cameraId, camPtz, camStream, reliabilityCameras);
    const cfg = statusConfig[status];

    return (
      <Tooltip
        key={cam.cameraId}
        title={
          <div>
            <div>{t('common.camera')} {cam.cameraId}</div>
            <div>PTZ: {!camPtz[cam.cameraId - 1] ? t('common.normal') : t('camera.ptzOffset')}</div>
            <div>Stream: {camStream[cam.cameraId - 1] ? t('common.online') : t('common.offline')}</div>
            {reliabilityCameras?.[`camera_${cam.cameraId}`] && (
              <div>{t('reliability.umbrellaCount')}: {reliabilityCameras[`camera_${cam.cameraId}`].umbrella_count}</div>
            )}
          </div>
        }
      >
        <div style={{
          cursor: 'pointer',
        }}>
          <div style={{
            width: BADGE_SIZE,
            height: BADGE_SIZE,
            borderRadius: '50%',
            background: cfg.color,
            border: `2px solid ${cfg.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 13,
            fontWeight: 'bold',
          }}>
            {cam.cameraId}
          </div>
        </div>
      </Tooltip>
    );
  };

  const topCams = cameraLayout.filter(c => c.position === 'top');
  const bottomCams = cameraLayout.filter(c => c.position === 'bottom');
  const leftCams = cameraLayout.filter(c => c.position === 'left');
  const rightCams = cameraLayout.filter(c => c.position === 'right');

  // Total container size = density map + badge areas on both sides
  const totalW = DISPLAY_W + MARGIN * 2;
  const totalH = DISPLAY_H + MARGIN * 2;

  return (
    <Card title={t('dashboard.cameraStatus')} style={{ width: '100%', overflow: 'auto' }}>
      <div style={{
        position: 'relative',
        width: totalW,
        height: totalH,
        margin: '0 auto',
      }}>
        {/* Centered density map */}
        <div style={{
          position: 'absolute',
          left: MARGIN,
          top: MARGIN,
          width: DISPLAY_W,
          height: DISPLAY_H,
          overflow: 'hidden',
          borderRadius: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {base64Image ? (
            <img
              src={`data:image/jpeg;base64,${base64Image}`}
              alt="Density Map"
              style={{
                width: IMG_W * SCALE,
                height: IMG_H * SCALE,
                transform: 'rotate(90deg)',
              }}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              background: '#f5f5f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Text type="secondary">{t('dashboard.noData')}</Text>
            </div>
          )}
        </div>

        {/* Entrance arrow - bottom-left */}
        <div style={{
          position: 'absolute',
          left: -8,
          bottom: MARGIN + DISPLAY_H * 0.1,
          transform: 'translateX(-100%)',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          color: '#1890ff',
          fontWeight: 'bold',
        }}>
          <span style={{ fontSize: 12 }}>入口 Entrance</span>
          <span style={{ fontSize: 22 }}>→</span>
        </div>

        {/* Top cameras */}
        {topCams.map(cam => (
          <div key={cam.cameraId} style={{
            position: 'absolute',
            left: MARGIN + (DISPLAY_W * cam.offset / 100),
            top: 0,
            transform: 'translateX(-50%)',
          }}>
            {renderBadge(cam)}
          </div>
        ))}

        {/* Bottom cameras */}
        {bottomCams.map(cam => (
          <div key={cam.cameraId} style={{
            position: 'absolute',
            left: MARGIN + (DISPLAY_W * cam.offset / 100),
            bottom: 0,
            transform: 'translateX(-50%)',
          }}>
            {renderBadge(cam)}
          </div>
        ))}

        {/* Left cameras */}
        {leftCams.map(cam => (
          <div key={cam.cameraId} style={{
            position: 'absolute',
            top: MARGIN + (DISPLAY_H * cam.offset / 100),
            left: 0,
            transform: 'translateY(-50%)',
          }}>
            {renderBadge(cam)}
          </div>
        ))}

        {/* Right cameras */}
        {rightCams.map(cam => (
          <div key={cam.cameraId} style={{
            position: 'absolute',
            top: MARGIN + (DISPLAY_H * cam.offset / 100),
            right: 0,
            transform: 'translateY(-50%)',
          }}>
            {renderBadge(cam)}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 12 }}>
        {([
          { status: 'normal' as CameraStatus, label: t('common.normal') },
          { status: 'ptzOffset' as CameraStatus, label: t('camera.ptzOffset') },
          { status: 'offline' as CameraStatus, label: t('common.offline') },
          { status: 'rainAffected' as CameraStatus, label: t('reliability.unreliable') },
        ]).map(item => (
          <div key={item.status} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: statusConfig[item.status].color,
            }} />
            <Text style={{ fontSize: 12 }}>{item.label}</Text>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default CameraRingLayout;

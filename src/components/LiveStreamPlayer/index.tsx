import React, { useEffect, useRef, useState } from 'react';
import { Spin, Alert, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import Hls from 'hls.js';
import { HLS_BASE_URL } from '../../utils/constants';

interface LiveStreamPlayerProps {
  cameraId: number;
}

const LiveStreamPlayer: React.FC<LiveStreamPlayerProps> = ({ cameraId }) => {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [status, setStatus] = useState<'loading' | 'playing' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  const streamUrl = `${HLS_BASE_URL}/cam${cameraId}/index.m3u8`;

  const destroyHls = () => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
  };

  const startStream = () => {
    const video = videoRef.current;
    if (!video) return;

    destroyHls();
    setStatus('loading');
    setErrorMsg('');

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        maxBufferLength: 10,
        maxMaxBufferLength: 30,
        manifestLoadingTimeOut: 15000,
        manifestLoadingMaxRetry: 3,
        levelLoadingTimeOut: 15000,
        fragLoadingTimeOut: 15000,
      });
      hlsRef.current = hls;

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setStatus('playing');
        video.play().catch(() => {
          // Autoplay may be blocked; user can click to play
        });
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              // Try to recover from network error
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              setStatus('error');
              setErrorMsg(t('camera.streamError'));
              destroyHls();
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS support
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', () => {
        setStatus('playing');
        video.play().catch(() => {});
      });
      video.addEventListener('error', () => {
        setStatus('error');
        setErrorMsg(t('camera.streamError'));
      });
    } else {
      setStatus('error');
      setErrorMsg('HLS is not supported in this browser');
    }
  };

  useEffect(() => {
    startStream();
    return () => {
      destroyHls();
    };
  }, [cameraId]);

  return (
    <div style={{ width: '100%', background: '#000', borderRadius: 4, overflow: 'hidden', minHeight: 300 }}>
      {status === 'loading' && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1,
        }}>
          <Spin size="large" tip={t('camera.streamLoading')} />
        </div>
      )}

      {status === 'error' && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 300,
          padding: 24,
        }}>
          <Alert
            message={errorMsg}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={startStream}
          >
            {t('dashboard.retry')}
          </Button>
        </div>
      )}

      <video
        ref={videoRef}
        controls
        autoPlay
        muted
        playsInline
        style={{
          width: '100%',
          maxHeight: 500,
          display: status === 'error' ? 'none' : 'block',
        }}
      />
    </div>
  );
};

export default LiveStreamPlayer;

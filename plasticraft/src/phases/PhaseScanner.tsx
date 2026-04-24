import {
  useRef,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { T } from '../components/T';

interface Props {
  countdown: number | null;
  onMotionDetected: () => void;
  onCapture: (dataUrl: string) => void;
}

export interface ScannerHandle {
  capture: () => string | null;
}

const CAPTURE_LABEL = { zh: '拍照', ja: '撮影する', en: 'Take Photo' };
const ALLOW_LABEL = {
  zh: '請允許相機存取',
  ja: 'カメラのアクセスを許可してください',
  en: 'Please allow camera access',
};

export const PhaseScanner = forwardRef<ScannerHandle, Props>(
  function PhaseScanner({ onCapture }, ref) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const displayCanvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const [cameraError, setCameraError] = useState(false);
    const [isFrontCamera, setIsFrontCamera] = useState(false);

    useImperativeHandle(ref, () => ({
      capture() {
        const video = videoRef.current;
        const canvas = displayCanvasRef.current;
        if (!video || !canvas) return null;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        return canvas.toDataURL('image/jpeg', 0.85);
      },
    }));

    useEffect(() => {
      let cancelled = false;
      (async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
          });
          if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
          streamRef.current = stream;
          const facing = stream.getVideoTracks()[0]?.getSettings().facingMode;
          setIsFrontCamera(facing === 'user' || facing === undefined);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
        } catch {
          if (!cancelled) setCameraError(true);
        }
      })();
      return () => {
        cancelled = true;
        streamRef.current?.getTracks().forEach(t => t.stop());
      };
    }, []);

    const handleCapture = () => {
      const video = videoRef.current;
      const canvas = displayCanvasRef.current;
      if (!video || !canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      ctx.drawImage(video, 0, 0);
      onCapture(canvas.toDataURL('image/jpeg', 0.85));
    };

    if (cameraError) {
      return (
        <div className="phase-container">
          <p className="camera-error">📷 <T s={ALLOW_LABEL} /></p>
        </div>
      );
    }

    return (
      <div className="phase-container phase-scanner">
        <div className="scan-frame">
          <video ref={videoRef} playsInline muted className="scan-video" style={isFrontCamera ? { transform: 'scaleX(-1)' } : undefined} />
          <canvas ref={displayCanvasRef} style={{ display: 'none' }} />

          <span className="bracket bracket-tl" />
          <span className="bracket bracket-tr" />
          <span className="bracket bracket-bl" />
          <span className="bracket bracket-br" />
        </div>

        <p className="scan-label"><T s={CAPTURE_LABEL} /></p>

        <button className="btn-primary" onClick={handleCapture}>
          📷 <T s={CAPTURE_LABEL} />
        </button>
      </div>
    );
  },
);

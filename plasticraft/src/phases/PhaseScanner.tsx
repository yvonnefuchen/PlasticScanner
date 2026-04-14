import {
  useRef,
  useEffect,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { T } from '../components/T';

interface Props {
  countdown: number | null;
  onMotionDetected: () => void;
  onCapture: (dataUrl: string) => void;
}

export interface ScannerHandle {
  capture: () => string | null;
}

const MOTION_THRESHOLD = 3; // % of pixels changed
const DETECT_INTERVAL_MS = 300;
const CAPTURE_CANVAS_W = 80;
const CAPTURE_CANVAS_H = 60;

const TAP_LABEL = { zh: '點擊掃描', ja: 'タップしてスキャン', en: 'Tap to Scan' };
const SCANNING_LABEL = { zh: '掃描中…', ja: 'スキャン中…', en: 'Scanning…' };
const ALLOW_LABEL = {
  zh: '請允許相機存取',
  ja: 'カメラのアクセスを許可してください',
  en: 'Please allow camera access',
};

export const PhaseScanner = forwardRef<ScannerHandle, Props>(
  function PhaseScanner({ countdown, onMotionDetected, onCapture }, ref) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const displayCanvasRef = useRef<HTMLCanvasElement>(null);
    const motionCanvasRef = useRef<HTMLCanvasElement>(null);
    const prevFrameRef = useRef<Uint8ClampedArray | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const detectingRef = useRef(false);
    const countdownActiveRef = useRef(false);

    const [cameraError, setCameraError] = useState(false);

    // Expose capture() to parent
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

    // Start camera
    useEffect(() => {
      let cancelled = false;
      (async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
          });
          if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
          streamRef.current = stream;
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

    // Motion detection loop
    const detectMotion = useCallback(() => {
      if (countdownActiveRef.current) return;
      const video = videoRef.current;
      const canvas = motionCanvasRef.current;
      if (!video || !canvas || video.readyState < 2) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, CAPTURE_CANVAS_W, CAPTURE_CANVAS_H);
      const frame = ctx.getImageData(0, 0, CAPTURE_CANVAS_W, CAPTURE_CANVAS_H);
      const data = frame.data;

      if (prevFrameRef.current) {
        const prev = prevFrameRef.current;
        let diffPixels = 0;
        const total = CAPTURE_CANVAS_W * CAPTURE_CANVAS_H;
        for (let i = 0; i < data.length; i += 4) {
          const d =
            Math.abs(data[i] - prev[i]) +
            Math.abs(data[i + 1] - prev[i + 1]) +
            Math.abs(data[i + 2] - prev[i + 2]);
          if (d > 45) diffPixels++;
        }
        const pct = (diffPixels / total) * 100;
        if (pct > MOTION_THRESHOLD) {
          countdownActiveRef.current = true;
          onMotionDetected();
        }
      }
      prevFrameRef.current = new Uint8ClampedArray(data);
    }, [onMotionDetected]);

    useEffect(() => {
      detectingRef.current = true;
      const id = setInterval(() => {
        if (detectingRef.current) detectMotion();
      }, DETECT_INTERVAL_MS);
      return () => {
        detectingRef.current = false;
        clearInterval(id);
      };
    }, [detectMotion]);

    // When countdown ends at 0, capture
    useEffect(() => {
      if (countdown === 0) {
        const video = videoRef.current;
        const canvas = displayCanvasRef.current;
        if (!video || !canvas) { onCapture(''); return; }
        const ctx = canvas.getContext('2d');
        if (!ctx) { onCapture(''); return; }
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        ctx.drawImage(video, 0, 0);
        onCapture(canvas.toDataURL('image/jpeg', 0.85));
      }
    }, [countdown, onCapture]);

    // Reset detection guard when countdown clears
    useEffect(() => {
      if (countdown === null) countdownActiveRef.current = false;
    }, [countdown]);

    const handleTapScan = () => {
      if (countdown !== null) return;
      countdownActiveRef.current = true;
      onMotionDetected();
    };

    if (cameraError) {
      return (
        <div className="phase-container">
          <p className="camera-error">📷 <T s={ALLOW_LABEL} /></p>
          <button className="btn-primary" onClick={handleTapScan}>
            <T s={TAP_LABEL} />
          </button>
        </div>
      );
    }

    return (
      <div className="phase-container phase-scanner">
        <div className="scan-frame">
          <video ref={videoRef} playsInline muted className="scan-video" />
          {/* Hidden canvases */}
          <canvas ref={displayCanvasRef} style={{ display: 'none' }} />
          <canvas
            ref={motionCanvasRef}
            width={CAPTURE_CANVAS_W}
            height={CAPTURE_CANVAS_H}
            style={{ display: 'none' }}
          />

          {/* Corner brackets */}
          <span className="bracket bracket-tl" />
          <span className="bracket bracket-tr" />
          <span className="bracket bracket-bl" />
          <span className="bracket bracket-br" />

          {/* Countdown overlay */}
          <AnimatePresence>
            {countdown !== null && countdown > 0 && (
              <motion.div
                key={countdown}
                className="countdown-overlay"
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {countdown}
              </motion.div>
            )}
            {countdown === 0 && (
              <motion.div
                key="snap"
                className="countdown-overlay snap-flash"
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              />
            )}
          </AnimatePresence>
        </div>

        <p className="scan-label">
          {countdown !== null ? <T s={SCANNING_LABEL} /> : <T s={TAP_LABEL} />}
        </p>

        {countdown === null && (
          <button className="btn-secondary" onClick={handleTapScan}>
            <T s={TAP_LABEL} />
          </button>
        )}
      </div>
    );
  },
);

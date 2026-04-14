import { useRef, useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { LangProvider, useLang } from './context/LangContext';
import { LangSelector } from './components/LangSelector';

import { PhaseIdle } from './phases/PhaseIdle';
import { PhaseScanner, type ScannerHandle } from './phases/PhaseScanner';
import { PhaseIdentified } from './phases/PhaseIdentified';
import { PhaseQuiz } from './phases/PhaseQuiz';
import { PhaseCorrect } from './phases/PhaseCorrect';
import { PhaseToken } from './phases/PhaseToken';
import { PhaseMaking } from './phases/PhaseMaking';

import { PLASTICS, DEMO_PLASTIC, type PlasticId } from './data/plastics';
import { identifyPlastic } from './services/scanner';

type AppPhase =
  | 'idle'
  | 'scanning'
  | 'countdown'
  | 'analyzing'
  | 'identified'
  | 'quiz'
  | 'correct'
  | 'phase2'
  | 'phase3';

function AppInner() {
  const { lang } = useLang();
  const [phase, setPhase] = useState<AppPhase>('idle');
  const [identifiedId, setIdentifiedId] = useState<PlasticId>(DEMO_PLASTIC);
  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scannerRef = useRef<ScannerHandle>(null);

  const ANALYZING_LABEL = { zh: '正在分析…', ja: '分析中…', en: 'Analyzing…' }[lang];

  // Start 3-second countdown
  const startCountdown = useCallback(() => {
    if (countdownRef.current) return;
    setCountdown(3);
    countdownRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c === null) return null;
        if (c <= 1) {
          clearInterval(countdownRef.current!);
          countdownRef.current = null;
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  }, []);

  const handleCapture = useCallback(async (dataUrl: string) => {
    setPhase('analyzing');
    setCountdown(null);
    try {
      const result = await identifyPlastic(dataUrl);
      setIdentifiedId(result.plasticId);
    } catch {
      setIdentifiedId(DEMO_PLASTIC);
    }
    setPhase('identified');
  }, []);

  const handleMotionDetected = useCallback(() => {
    startCountdown();
  }, [startCountdown]);

  const reset = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    setCountdown(null);
    setPhase('idle');
  }, []);

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const plastic = PLASTICS[identifiedId];

  return (
    <>
      <LangSelector />
      <AnimatePresence mode="wait">
        {phase === 'idle' && (
          <PageWrap key="idle">
            <PhaseIdle onStart={() => setPhase('scanning')} />
          </PageWrap>
        )}

        {(phase === 'scanning' || phase === 'countdown') && (
          <PageWrap key="scanning">
            <PhaseScanner
              ref={scannerRef}
              countdown={countdown}
              onMotionDetected={handleMotionDetected}
              onCapture={handleCapture}
            />
          </PageWrap>
        )}

        {phase === 'analyzing' && (
          <PageWrap key="analyzing">
            <div className="phase-container phase-analyzing">
              <div className="analyzing-spinner" />
              <p className="analyzing-text">{ANALYZING_LABEL}</p>
            </div>
          </PageWrap>
        )}

        {phase === 'identified' && (
          <PageWrap key="identified">
            <PhaseIdentified
              plastic={plastic}
              onNext={() => setPhase('quiz')}
            />
          </PageWrap>
        )}

        {phase === 'quiz' && (
          <PageWrap key="quiz">
            <PhaseQuiz
              plastic={plastic}
              onCorrect={() => setPhase('correct')}
            />
          </PageWrap>
        )}

        {phase === 'correct' && (
          <PageWrap key="correct">
            <PhaseCorrect
              plastic={plastic}
              onNext={() => setPhase('phase2')}
            />
          </PageWrap>
        )}

        {phase === 'phase2' && (
          <PageWrap key="phase2">
            <PhaseToken onNext={() => setPhase('phase3')} />
          </PageWrap>
        )}

        {phase === 'phase3' && (
          <PageWrap key="phase3">
            <PhaseMaking onDone={reset} />
          </PageWrap>
        )}
      </AnimatePresence>
    </>
  );
}

function PageWrap({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="page-wrap"
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -22 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  return (
    <LangProvider>
      <AppInner />
    </LangProvider>
  );
}

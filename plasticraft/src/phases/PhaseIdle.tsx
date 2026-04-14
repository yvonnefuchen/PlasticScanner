import { useEffect, useState } from 'react';
import { PlasticMascot } from '../components/PlasticMascot';
import { T } from '../components/T';

interface Props {
  onStart: () => void;
}

const INVITE: { zh: string; ja: string; en: string } = {
  zh: '請餵我吃塑膠！讓我看看你帶了什麼寶貝？',
  ja: 'プラスチックを食べさせて！何を持ってきたか見せて？',
  en: 'Feed me plastic! Show me what treasure you brought!',
};

const START_BTN: { zh: string; ja: string; en: string } = {
  zh: '開始掃描',
  ja: 'スキャン開始',
  en: 'Start Scanning',
};

export function PhaseIdle({ onStart }: Props) {
  const [mascotState, setMascotState] = useState<'sleeping' | 'waving'>('sleeping');

  useEffect(() => {
    const t = setTimeout(() => setMascotState('waving'), 3000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="phase-container phase-idle">
      <PlasticMascot state={mascotState} size={240} />

      <p className="invite-text">
        <T s={INVITE} />
      </p>

      <button className="btn-primary" onClick={onStart}>
        <T s={START_BTN} />
      </button>
    </div>
  );
}

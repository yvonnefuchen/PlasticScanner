import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { T } from '../components/T';
import type { Tri } from '../data/plastics';

interface Props {
  onDone: () => void;
}

interface StepData {
  title: Tri;
  emoji: string;
  desc: Tri;
  mascotSays: Tri;
}

const PHASE_TITLE: Tri = {
  zh: 'Future Craft 指令頁',
  ja: 'Future Craft 指令ページ',
  en: 'Future Craft Instructions',
};

const ROLES_TITLE: Tri = {
  zh: 'Step 1 — 角色分配',
  ja: 'Step 1 — 役割分担',
  en: 'Step 1 — Role Assignment',
};

const ROLES = [
  {
    emoji: '🥚',
    material: { zh: '扭蛋殼 (PET)', ja: 'カプセル (PET)', en: 'Capsule (PET)' },
    role: { zh: '輪匡', ja: 'ホイールリム', en: 'Wheel Rim' },
    desc: { zh: '你的「輪匡」它很強韌，不怕撞！', ja: '「ホイールリム」、強くて衝撃に強い！', en: 'Your "Wheel Rim" — strong and impact-resistant!' },
  },
  {
    emoji: '⚙️',
    material: { zh: '連接件 (PP)', ja: 'コネクター (PP)', en: 'Connector (PP)' },
    role: { zh: '輪胎', ja: 'タイヤ', en: 'Wheel / Tire' },
    desc: { zh: '你的「輪胎」。有他組合就可以跑起來！', ja: '「タイヤ」、これを組み合わせれば走れるよ！', en: 'Your "Tire" — combine it and the wheels will roll!' },
  },
  {
    emoji: '🍱',
    material: { zh: '肉托盤 (PS)', ja: 'ミートトレイ (PS)', en: 'Meat Tray (PS)' },
    role: { zh: '車架', ja: 'シャーシ', en: 'Chassis' },
    desc: { zh: '你的「車架」。它很輕，可以讓車子跑很快！', ja: '「シャーシ」、軽いから車が速く走れるよ！', en: 'Your "Chassis" — lightweight, so your car goes fast!' },
  },
];

const ASSEMBLY_STEPS: StepData[] = [
  {
    title: { zh: 'Step 2 — 製作超級輪胎', ja: 'Step 2 — スーパータイヤを作ろう', en: 'Step 2 — Make the Super Wheels' },
    emoji: '🔵⚙️',
    desc: {
      zh: '將 2 個 PP 連接件分別扣進 2 個 PP 扭蛋殼裡，確保緊密結合。',
      ja: '2つのPPコネクターをそれぞれ2つのPPカプセルにはめ込んで、しっかり固定してね。',
      en: 'Press 2 PP connectors into 2 PET capsule halves, making sure they click in tight.',
    },
    mascotSays: {
      zh: '記得用力壓下去，PP 材質很強韌，不用擔心它會壞掉！',
      ja: 'しっかり押し込んでね、PPはとても強いから壊れる心配はないよ！',
      en: 'Press firmly — PP is tough, no need to worry about breaking it!',
    },
  },
  {
    title: { zh: 'Step 3 — 安裝動力軸心', ja: 'Step 3 — アクスルを取り付けよう', en: 'Step 3 — Install the Axle' },
    emoji: '🥤',
    desc: {
      zh: '拿出兩根吸管穿過連接件中心孔洞。現在你擁有了兩組可以自由轉動的「輪軸組」！',
      ja: '2本のストローをコネクターの中心の穴に通してね。これで自由に回転できる「ホイールアクスルセット」が2つできたよ！',
      en: 'Thread two straws through the center holes of the connectors. You now have two freely-spinning wheel-axle sets!',
    },
    mascotSays: {
      zh: '吸管就是你的輪軸！讓輪子可以自由旋轉喔！',
      ja: 'ストローがアクスルになるよ！タイヤが自由に回転できるね！',
      en: 'The straw is your axle! It lets the wheels spin freely!',
    },
  },
  {
    title: { zh: 'Step 4 — 合體！底盤固定', ja: 'Step 4 — 合体！シャーシを固定', en: 'Step 4 — Attach the Chassis!' },
    emoji: '🏎️',
    desc: {
      zh: '將 PS 托盤反過來，使用膠帶或戳孔方式，將兩組輪軸固定在托盤底部。',
      ja: 'PSトレイをひっくり返して、テープか穴あけで2つのホイールアクスルセットをトレイの底に固定しよう。',
      en: 'Flip the PS tray upside down. Use tape or punch holes to attach both wheel-axle sets to the bottom.',
    },
    mascotSays: {
      zh: '因為 PS 托盤很輕，建議把輪軸固定在靠近邊緣的地方，這樣跑起來才不會翻車喔！',
      ja: 'PSトレイは軽いので、ホイールアクスルをトレイの端近くに固定すると転ばずに走れるよ！',
      en: 'Since PS trays are light, attach the axles near the edges so the car stays stable while rolling!',
    },
  },
];

const NEXT_BTN: Tri = { zh: '下一步', ja: '次のステップ', en: 'Next Step' };
const DONE_BTN: Tri = { zh: '再玩一次！', ja: 'もう一度遊ぶ！', en: 'Play Again!' };

export function PhaseMaking({ onDone }: Props) {
  // step 0 = role assignment, steps 1-3 = assembly
  const [step, setStep] = useState(0);
  const isLast = step === ASSEMBLY_STEPS.length;

  const advance = () => {
    if (isLast) { onDone(); return; }
    setStep(s => s + 1);
  };

  return (
    <div className="phase-container phase-making">
      <h2 className="making-title"><T s={PHASE_TITLE} /></h2>

      <AnimatePresence mode="wait">
        {step === 0 ? (
          <motion.div
            key="roles"
            className="making-card"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <h3 className="making-card__title"><T s={ROLES_TITLE} /></h3>
            <div className="roles-list">
              {ROLES.map((r, i) => (
                <div key={i} className="role-item">
                  <span className="role-item__emoji">{r.emoji}</span>
                  <div>
                    <strong><T s={r.material} /></strong>
                    <span className="role-badge"><T s={r.role} /></span>
                    <p><T s={r.desc} /></p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={step}
            className="making-card"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            {(() => {
              const s = ASSEMBLY_STEPS[step - 1];
              return (
                <>
                  <h3 className="making-card__title"><T s={s.title} /></h3>
                  <div className="making-card__emoji">{s.emoji}</div>
                  <p className="making-card__desc"><T s={s.desc} /></p>
                  <div className="mascot-says">
                    <span className="mascot-says__bubble">💬</span>
                    <em><T s={s.mascotSays} /></em>
                  </div>
                </>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress dots */}
      <div className="progress-dots">
        {[0, 1, 2, 3].map(i => (
          <span key={i} className={`dot ${step === i ? 'dot--active' : ''}`} />
        ))}
      </div>

      <button className="btn-primary" onClick={advance}>
        <T s={isLast ? DONE_BTN : NEXT_BTN} />
      </button>
    </div>
  );
}

import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { T } from '../components/T';
import { BinCharacter } from '../components/PlasticShapes';
import type { Tri } from '../data/plastics';
import { savePhoto } from '../services/survey';

interface Props {
  onDone: () => void;
  onBack?: () => void;
  sessionId?: string;
}

/* ── Shared: Hexagonal Connector ─────────────────────────────────────────── */
function HexPoly({ cx, cy, r, fill = '#FF8A65', stroke = '#E64A19' }: {
  cx: number; cy: number; r: number; fill?: string; stroke?: string;
}) {
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (i * 60 - 30) * Math.PI / 180;
    return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
  }).join(' ');
  return (
    <>
      <polygon points={pts} fill={fill} stroke={stroke} strokeWidth="2" />
      <circle cx={cx} cy={cy} r={r * 0.35} fill="white" stroke={stroke} strokeWidth="1.5" />
    </>
  );
}

/* ── SVG Diagrams ─────────────────────────────────────────────────────────── */

// Step 2: Two PET capsule halves + hex connectors → wheels
function WheelsDiagram() {
  return (
    <svg viewBox="0 0 270 90" width={270} height={90} aria-hidden="true" style={{ overflow: 'visible' }}>
      {/* Hex connector */}
      <HexPoly cx={30} cy={36} r={22} />
      <text x="30" y="72" textAnchor="middle" fontSize="9" fill="#aaa">connector</text>
      <text x="66" y="42" fontSize="20" fill="#666" textAnchor="middle">+</text>
      {/* PET capsule half */}
      <path d="M 86 54 A 26 22 0 0 1 138 54" fill="#B3E5FC" stroke="#4FC3F7" strokeWidth="2" strokeLinecap="round" />
      <line x1="86" y1="54" x2="138" y2="54" stroke="#4FC3F7" strokeWidth="2" />
      <text x="112" y="72" textAnchor="middle" fontSize="9" fill="#aaa">PET ½</text>
      <text x="160" y="42" fontSize="20" fill="#666" textAnchor="middle">→</text>
      {/* Result: capsule half with hex inside */}
      <path d="M 178 54 A 26 22 0 0 1 230 54" fill="#B3E5FC" stroke="#4FC3F7" strokeWidth="2" strokeLinecap="round" />
      <line x1="178" y1="54" x2="230" y2="54" stroke="#4FC3F7" strokeWidth="2" />
      <HexPoly cx={204} cy={44} r={12} />
      <text x="204" y="72" textAnchor="middle" fontSize="9" fill="#aaa">× 2</text>
    </svg>
  );
}

// Step 3: Wheel + straw axle + wheel
function AxleDiagram() {
  return (
    <svg viewBox="0 0 240 80" width={240} height={80} aria-hidden="true" style={{ overflow: 'visible' }}>
      {/* Left wheel: PET outer + hex inner */}
      <circle cx="32" cy="36" r="26" fill="#B3E5FC" stroke="#4FC3F7" strokeWidth="2.5" />
      <HexPoly cx={32} cy={36} r={13} />
      {/* Straw axle */}
      <rect x="32" y="32" width="176" height="8" rx="4" fill="#FF8A65" stroke="#E64A19" strokeWidth="1" />
      <text x="120" y="68" textAnchor="middle" fontSize="9" fill="#aaa">吸管 PP straw</text>
      {/* Right wheel */}
      <circle cx="208" cy="36" r="26" fill="#B3E5FC" stroke="#4FC3F7" strokeWidth="2.5" />
      <HexPoly cx={208} cy={36} r={13} />
    </svg>
  );
}

// Step 4: PS tray chassis with wheel-axle sets attached
function ChassisDiagram() {
  return (
    <svg viewBox="0 0 260 118" width={260} height={118} aria-hidden="true" style={{ overflow: 'visible' }}>
      {/* PS tray */}
      <rect x="36" y="4" width="188" height="48" rx="10" fill="#FFCCBC" stroke="#FF8A65" strokeWidth="2.5" />
      <text x="130" y="30" textAnchor="middle" fontSize="12" fill="#FF8A65" fontWeight="800">PS Tray</text>
      <text x="130" y="45" textAnchor="middle" fontSize="9" fill="#FF8A65" opacity="0.8">（翻面向下）</text>
      {/* Tape marks */}
      <rect x="62" y="46" width="26" height="12" rx="4" fill="#B3E5FC" stroke="#4FC3F7" strokeWidth="1.5" opacity="0.9" />
      <text x="75" y="55" textAnchor="middle" fontSize="7" fill="#4FC3F7">tape</text>
      <rect x="172" y="46" width="26" height="12" rx="4" fill="#B3E5FC" stroke="#4FC3F7" strokeWidth="1.5" opacity="0.9" />
      <text x="185" y="55" textAnchor="middle" fontSize="7" fill="#4FC3F7">tape</text>
      {/* Left axle */}
      <rect x="24" y="68" width="90" height="7" rx="3.5" fill="#FF8A65" />
      <circle cx="28" cy="71" r="16" fill="#B3E5FC" stroke="#4FC3F7" strokeWidth="2" />
      <HexPoly cx={28} cy={71} r={8} />
      <circle cx="110" cy="71" r="16" fill="#B3E5FC" stroke="#4FC3F7" strokeWidth="2" />
      <HexPoly cx={110} cy={71} r={8} />
      {/* Right axle */}
      <rect x="146" y="68" width="90" height="7" rx="3.5" fill="#FF8A65" />
      <circle cx="150" cy="71" r="16" fill="#B3E5FC" stroke="#4FC3F7" strokeWidth="2" />
      <HexPoly cx={150} cy={71} r={8} />
      <circle cx="232" cy="71" r="16" fill="#B3E5FC" stroke="#4FC3F7" strokeWidth="2" />
      <HexPoly cx={232} cy={71} r={8} />
    </svg>
  );
}

// Completion: full car
function CarDiagram() {
  return (
    <svg viewBox="0 0 200 92" width={200} height={92} aria-hidden="true" style={{ overflow: 'visible' }}>
      <rect x="10" y="28" width="180" height="36" rx="8" fill="#FFCCBC" stroke="#FF8A65" strokeWidth="2.5" />
      <rect x="58" y="14" width="84" height="22" rx="7" fill="#B3E5FC" stroke="#4FC3F7" strokeWidth="1.5" opacity="0.85" />
      <circle cx="18" cy="42" r="5" fill="#FFD54F" opacity="0.9" />
      <circle cx="182" cy="42" r="5" fill="#EF9A9A" opacity="0.9" />
      <rect x="30" y="60" width="30" height="6" rx="3" fill="#FF8A65" />
      <rect x="140" y="60" width="30" height="6" rx="3" fill="#FF8A65" />
      <circle cx="45" cy="68" r="16" fill="#B3E5FC" stroke="#4FC3F7" strokeWidth="2" />
      <HexPoly cx={45} cy={68} r={8} />
      <circle cx="155" cy="68" r="16" fill="#B3E5FC" stroke="#4FC3F7" strokeWidth="2" />
      <HexPoly cx={155} cy={68} r={8} />
    </svg>
  );
}

/* ── Data ─────────────────────────────────────────────────────────────────── */

const PHASE_TITLE: Tri = {
  zh: 'Future Craft 指令頁',
  ja: 'Future Craft 指令ページ',
  en: 'Future Craft Instructions',
};
const ROLES_TITLE: Tri = { zh: 'Step 1 — 角色分配', ja: 'Step 1 — 役割分担', en: 'Step 1 — Role Assignment' };

const ROLES = [
  {
    emoji: '🥚',
    badge: { label: '🔵 PET ①', color: '#4FC3F7', bg: 'rgba(79,195,247,0.15)' },
    material: { zh: '扭蛋殼 (PET)', ja: 'カプセル (PET)', en: 'Capsule (PET)' } as Tri,
    role: { zh: '輪匡', ja: 'ホイールリム', en: 'Wheel Rim' } as Tri,
    desc: { zh: '你的「輪匡」它很強韌，不怕撞！', ja: '「ホイールリム」、強くて衝撃に強い！', en: 'Your "Wheel Rim" — strong and impact-resistant!' } as Tri,
  },
  {
    emoji: '🔷',
    badge: { label: '🟢 PP ⑤', color: '#81C784', bg: 'rgba(129,199,132,0.15)' },
    material: { zh: '六角連接件 (PP)', ja: '六角コネクター (PP)', en: 'Hex Connector (PP)' } as Tri,
    role: { zh: '輪胎 / Universal Connector', ja: 'タイヤ / ユニバーサルコネクター', en: 'Wheel / Universal Connector' } as Tri,
    desc: { zh: '你的「六角連接件」，讓輪子緊密結合！', ja: '「六角コネクター」、タイヤをしっかり固定する！', en: 'Your "Hex Connector" — makes the wheels click together tight!' } as Tri,
  },
  {
    emoji: '🍱',
    badge: { label: '🔴 PS ⑥', color: '#EF5350', bg: 'rgba(239,83,80,0.15)' },
    material: { zh: '肉托盤 (PS)', ja: 'ミートトレイ (PS)', en: 'Meat Tray (PS)' } as Tri,
    role: { zh: '車架', ja: 'シャーシ', en: 'Chassis' } as Tri,
    desc: { zh: '你的「車架」。它很輕，可以讓車子跑很快！', ja: '「シャーシ」、軽いから車が速く走れるよ！', en: 'Your "Chassis" — lightweight, so your car goes fast!' } as Tri,
  },
  {
    emoji: '🥤',
    badge: { label: '🟢 PP ⑤', color: '#81C784', bg: 'rgba(129,199,132,0.15)' },
    material: { zh: '吸管 (PP)', ja: 'ストロー (PP)', en: 'Straw (PP)' } as Tri,
    role: { zh: '動力轉軸', ja: 'ダイナミックアクスル', en: 'Dynamic Axle' } as Tri,
    desc: { zh: '你的「動力轉軸」。細長堅韌，能支撐輪胎順暢地轉動！', ja: '「ダイナミックアクスル」、細くて強く、タイヤをスムーズに回転させる！', en: 'Your "Dynamic Axle" — slender and tough, keeps the wheels spinning smoothly!' } as Tri,
  },
];

interface StepData {
  title: Tri;
  desc: Tri;
  mascotSays: Tri;
  Diagram: () => React.JSX.Element;
}

const ASSEMBLY_STEPS: StepData[] = [
  {
    title: { zh: 'Step 2 — 製作超級輪胎', ja: 'Step 2 — スーパータイヤを作ろう', en: 'Step 2 — Make the Super Wheels' },
    desc: {
      zh: '將 2 個六角連接件分別卡進 2 個 PET 扭蛋殼的一半，做成半輪子，確保緊密結合。',
      ja: '2つの六角コネクターをそれぞれ2つのPETカプセルの半分にはめ込んで半輪を作ろう。しっかり固定してね。',
      en: 'Press 2 hex connectors into 2 PET capsule halves to make two half-wheels. Make sure they click in tight.',
    },
    mascotSays: {
      zh: '記得用力壓下去，PP 材質很強韌，不用擔心它會壞掉！',
      ja: 'しっかり押し込んでね、PPはとても強いから壊れる心配はないよ！',
      en: 'Press firmly — PP is tough, no need to worry about breaking it!',
    },
    Diagram: WheelsDiagram,
  },
  {
    title: { zh: 'Step 3 — 安裝動力轉軸', ja: 'Step 3 — ダイナミックアクスルを取り付けよう', en: 'Step 3 — Install the Dynamic Axle' },
    desc: {
      zh: '拿出兩根吸管，各自穿過一組六角連接件的中心孔洞。現在你有了兩組可以自由轉動的「輪軸組」！',
      ja: '2本のストローをそれぞれ六角コネクターの中心の穴に通してね。これで自由に回転できる「ホイールアクスルセット」が2つできたよ！',
      en: 'Thread a straw through the center hole of each hex connector set. You now have two freely-spinning wheel-axle sets!',
    },
    mascotSays: {
      zh: '吸管就是你的動力轉軸！讓輪子可以自由旋轉喔！',
      ja: 'ストローがアクスルになるよ！タイヤが自由に回転できるね！',
      en: 'The straw is your Dynamic Axle! It lets the wheels spin freely!',
    },
    Diagram: AxleDiagram,
  },
  {
    title: { zh: 'Step 4 — 合體！底盤固定', ja: 'Step 4 — 合体！シャーシを固定', en: 'Step 4 — Attach the Chassis!' },
    desc: {
      zh: '將 PS 托盤反過來，使用膠帶或白膠，將兩組輪軸固定在托盤底部。',
      ja: 'PSトレイをひっくり返して、テープか接着剤で2つのホイールアクスルセットをトレイの底に固定しよう。',
      en: 'Flip the PS tray upside down. Use tape or glue to attach both wheel-axle sets to the bottom.',
    },
    mascotSays: {
      zh: '因為 PS 托盤很輕，建議把輪軸固定在靠近邊緣的地方，這樣跑起來才不會翻車喔！',
      ja: 'PSトレイは軽いので、ホイールアクスルをトレイの端近くに固定すると転ばずに走れるよ！',
      en: 'Since PS trays are light, attach the axles near the edges so the car stays stable while rolling!',
    },
    Diagram: ChassisDiagram,
  },
];

const SUMMARY_TITLE: Tri = { zh: '你知道嗎？', ja: '知ってた？', en: 'Did You Know?' };
const SUMMARY_TEXT: Tri = {
  zh: '你的戰車含有 3 種不同的塑膠！混在一起 = 垃圾。分類回收 = 有機會變成新的東西。',
  ja: 'あなたのバトルカーには3種類の異なるプラスチックが入っています！混ぜたらゴミ。分別してリサイクル = 新しいものに生まれ変われるチャンス。',
  en: 'Your battle car contains 3 different plastics! Mixed together = trash. Separated for recycling = chance to become something new.',
};
const SUMMARY_MATERIALS = [
  { label: '🔵 PET ①', binType: 'blue' as const, role: { zh: '扭蛋殼 → 輪框', ja: 'カプセル → ホイール', en: 'Capsule → Wheel Rim' } as Tri, color: '#4FC3F7', bg: 'rgba(79,195,247,0.12)' },
  { label: '🟢 PP ⑤',  binType: 'green' as const, role: { zh: '瓶蓋 / 連接件 / 吸管', ja: 'キャップ / コネクター / ストロー', en: 'Cap / Connector / Straw' } as Tri, color: '#81C784', bg: 'rgba(129,199,132,0.12)' },
  { label: '🔴 PS ⑥',  binType: 'red' as const, role: { zh: '托盤 → 車架（特殊回收）', ja: 'トレイ → シャーシ（特別回収）', en: 'Tray → Chassis (Special Recycling)' } as Tri, color: '#EF5350', bg: 'rgba(239,83,80,0.12)' },
];

const NEXT_BTN: Tri = { zh: '下一步', ja: '次のステップ', en: 'Next Step' };
const BACK_BTN: Tri = { zh: '上一步', ja: '前のステップ', en: 'Back' };
const DONE_BTN: Tri = { zh: '完成！去回答問題', ja: '完成！質問に答えよう', en: 'Done! Answer Questions' };
const COMPLETE_TITLE: Tri = { zh: '完成了嗎？🏆', ja: '完成しましたか？🏆', en: 'Did You Finish? 🏆' };
const PHOTO_PROMPT: Tri = {
  zh: '幫你的帥車拍個照吧！📸\n拍完照後，回答幾個小問題！',
  ja: 'かっこいい車の写真を撮ろう！📸\n撮影後にいくつか質問に答えてね！',
  en: 'Take a photo of your cool car! 📸\nThen answer a few questions!',
};
const TAKE_PHOTO_BTN: Tri = { zh: '📸 拍照', ja: '📸 写真を撮る', en: '📸 Take Photo' };
const RETAKE_BTN: Tri = { zh: '重拍', ja: '撮り直す', en: 'Retake' };
const PHOTO_SAVED: Tri = { zh: '✅ 照片已儲存！', ja: '✅ 写真を保存しました！', en: '✅ Photo saved!' };
const SKIP_PHOTO_BTN: Tri = { zh: '略過，繼續', ja: 'スキップして続ける', en: 'Skip & Continue' };

/* ── Component ────────────────────────────────────────────────────────────── */

export function PhaseMaking({ onDone, onBack, sessionId }: Props) {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);

  // Camera state for completion step
  const [cameraOpen, setCameraOpen] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const advance = () => {
    if (step === 5) { onDone(); return; }
    setDir(1);
    setStep(s => s + 1);
  };
  const back = () => {
    if (step === 0) { onBack?.(); return; }
    setDir(-1);
    setStep(s => s - 1);
  };

  const openCamera = async () => {
    setCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch {
      setCameraOpen(false);
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    canvas.getContext('2d')!.drawImage(video, 0, 0);
    const url = canvas.toDataURL('image/jpeg', 0.75);
    streamRef.current?.getTracks().forEach(t => t.stop());
    setCameraOpen(false);
    setPhotoUrl(url);
    if (sessionId) savePhoto(sessionId, url);
  };

  const retakePhoto = () => {
    setPhotoUrl(null);
    openCamera();
  };

  // Cleanup stream on unmount
  useEffect(() => {
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()); };
  }, []);

  return (
    <div className="phase-container phase-making">
      <h2 className="making-title"><T s={PHASE_TITLE} /></h2>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="roles"
            className="making-card"
            initial={{ opacity: 0, x: 50 * dir }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 * dir }}
          >
            <h3 className="making-card__title"><T s={ROLES_TITLE} /></h3>
            <div className="roles-list">
              {ROLES.map((r, i) => (
                <div key={i} className="role-item">
                  <span className="role-item__emoji">{r.emoji}</span>
                  <div>
                    <strong><T s={r.material} /></strong>
                    <span
                      className="material-badge"
                      style={{ color: r.badge.color, background: r.badge.bg, borderColor: r.badge.color }}
                    >
                      {r.badge.label}
                    </span>
                    <span className="role-badge"><T s={r.role} /></span>
                    <p><T s={r.desc} /></p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {step >= 1 && step <= 3 && (() => {
          const s = ASSEMBLY_STEPS[step - 1];
          return (
            <motion.div
              key={step}
              className="making-card"
              initial={{ opacity: 0, x: 50 * dir }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 * dir }}
            >
              <h3 className="making-card__title"><T s={s.title} /></h3>
              <div className="making-diagram">
                <s.Diagram />
              </div>
              <p className="making-card__desc"><T s={s.desc} /></p>
              <div className="mascot-says">
                <span className="mascot-says__bubble">💬</span>
                <em><T s={s.mascotSays} /></em>
              </div>
            </motion.div>
          );
        })()}

        {step === 4 && (
          <motion.div
            key="summary"
            className="making-card"
            style={{ textAlign: 'center' }}
            initial={{ opacity: 0, x: 50 * dir }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 * dir }}
          >
            <h3 className="making-card__title"><T s={SUMMARY_TITLE} /></h3>
            <div className="material-summary-list">
              {SUMMARY_MATERIALS.map((m, i) => (
                <motion.div
                  key={m.label}
                  className="material-summary-row"
                  style={{ borderColor: m.color, background: m.bg }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.15 }}
                >
                  <BinCharacter type={m.binType} size={52} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span className="material-summary-row__label">{m.label}</span>
                    <span className="material-summary-row__role"><T s={m.role} /></span>
                  </div>
                </motion.div>
              ))}
            </div>
            <p className="making-card__desc" style={{ marginTop: 16 }}><T s={SUMMARY_TEXT} /></p>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div
            key="complete"
            className="making-card"
            style={{ textAlign: 'center' }}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
          >
            <h3 className="making-card__title"><T s={COMPLETE_TITLE} /></h3>
            <div className="making-diagram">
              <CarDiagram />
            </div>
            <p className="making-card__desc" style={{ whiteSpace: 'pre-line' }}>
              <T s={PHOTO_PROMPT} />
            </p>

            {/* Camera section */}
            {!cameraOpen && !photoUrl && (
              <button className="btn-secondary" style={{ marginTop: 8 }} onClick={openCamera}>
                <T s={TAKE_PHOTO_BTN} />
              </button>
            )}

            {cameraOpen && (
              <div className="photo-capture">
                <video ref={videoRef} playsInline muted className="photo-preview" />
                <button className="btn-primary" onClick={capturePhoto}>
                  <T s={TAKE_PHOTO_BTN} />
                </button>
              </div>
            )}

            {photoUrl && (
              <div className="photo-result">
                <img src={photoUrl} alt="Your car" className="photo-thumbnail" />
                <p className="photo-saved-label"><T s={PHOTO_SAVED} /></p>
                <button className="btn-secondary" style={{ fontSize: '0.85rem', padding: '8px 20px' }} onClick={retakePhoto}>
                  <T s={RETAKE_BTN} />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="progress-dots">
        {[0, 1, 2, 3, 4, 5].map(i => (
          <span key={i} className={`dot ${step === i ? 'dot--active' : ''}`} />
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        {(step > 0 || onBack) && (
          <button className="btn-secondary" onClick={back}>
            <T s={BACK_BTN} />
          </button>
        )}
        <button className="btn-primary" onClick={advance}>
          {step === 5
            ? <T s={DONE_BTN} />
            : <T s={NEXT_BTN} />
          }
        </button>
        {step === 5 && !photoUrl && (
          <button
            className="btn-secondary"
            style={{ fontSize: '0.85rem' }}
            onClick={onDone}
          >
            <T s={SKIP_PHOTO_BTN} />
          </button>
        )}
      </div>
    </div>
  );
}

# PlastiCraft

Kiosk-style educational web app — kids scan a plastic item, learn about its resin type, and build a toy car from recycled materials.

## Quick Start

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
npm run preview  # preview the production build locally
```

## App Flow

```
Idle → Scan → Analyzing → Identified → Quiz → Correct → Token → Making → (loop)
```

| Phase      | Description |
|------------|-------------|
| Idle       | Sleeping mascot; tap to start |
| Scan       | Live camera feed; motion triggers 3-2-1 countdown then captures frame |
| Analyzing  | Spinner while AI identifies the plastic |
| Identified | Mascot explains the plastic type with a speech bubble |
| Quiz       | Pick the correct resin type from 5 colour-coded buttons |
| Correct    | Fireworks + excited mascot |
| Token      | Explains the PP bottle-cap token and claw machine mechanic |
| Making     | 4-step assembly guide for the toy car |

## Project Layout

```
src/
├── components/
│   ├── PlasticMascot.tsx   # Animated SVG mascot (6 states)
│   ├── LangSelector.tsx    # Fixed top-right language pill buttons
│   └── T.tsx               # Trilingual text helper <T s={obj} />
├── context/
│   └── LangContext.tsx     # Lang ('zh' | 'ja' | 'en'), persisted to localStorage
├── data/
│   └── plastics.ts         # Plastic type definitions + trilingual copy
├── phases/
│   ├── PhaseIdle.tsx
│   ├── PhaseScanner.tsx
│   ├── PhaseIdentified.tsx
│   ├── PhaseQuiz.tsx
│   ├── PhaseCorrect.tsx
│   ├── PhaseToken.tsx
│   └── PhaseMaking.tsx
├── services/
│   └── scanner.ts          # ← Swappable AI seam
├── App.tsx                 # State machine + AnimatePresence routing
└── index.css               # Global dark kiosk theme
```

## Replacing the AI Scanner

Open [`src/services/scanner.ts`](src/services/scanner.ts) and replace the body of `identifyPlastic()`. The file documents four options:

- **Option A** — Your own REST endpoint
- **Option B** — Claude Vision API (`claude-opus-4-6` via `@anthropic-ai/sdk`)
- **Option C** — Google Cloud Vision API
- **Option D** — On-device TensorFlow.js model

The function signature must remain:

```ts
export async function identifyPlastic(imageDataUrl: string): Promise<ScanResult>
// ScanResult = { plasticId: PlasticId; confidence: number }
```

## Adding Trilingual Text

All user-visible strings use the `Tri` type and the `<T>` component:

```tsx
import { T } from '../components/T';

const MY_TEXT: Tri = {
  zh: '繁體中文',
  ja: '日本語',
  en: 'English',
};

<T s={MY_TEXT} />
```

## Mascot States

The `<PlasticMascot>` component accepts a `state` prop:

| State    | Eyes          | Mouth            | Arms          | Float speed |
|----------|---------------|------------------|---------------|-------------|
| sleeping | Closed arcs   | Gentle curve     | Still         | Slow        |
| idle     | Normal        | Smile            | Still         | Medium      |
| waving   | Normal        | Smile            | Right waves   | Medium      |
| talking  | Normal        | Animated ellipse | Still         | Fast        |
| excited  | Gold stars    | Smile            | Both excited  | Very fast   |
| sad      | Droopy brows  | Downward arc     | Still         | Slow        |

# PlasticScanner

An educational kiosk app that helps kids learn about plastic types through AI scanning, interactive quizzes, and hands-on making activities.

## Project Structure

```
PlasticScanner/
└── plasticraft/    # Main web app (React + TypeScript + Vite)
```

## PlastiCraft

PlastiCraft is a trilingual (Traditional Chinese / Japanese / English) kiosk-style experience with three phases:

1. **Scan** — Camera detects a plastic item; an animated mascot identifies it and explains its properties
2. **Quiz** — Kids guess the plastic type (PET / HDPE / PP / PS / PVC); correct answers earn a PP bottle-cap token
3. **Make** — Step-by-step guide to assemble a toy car from the collected materials (PET capsule + PP connector + PS tray)

### Getting Started

```bash
cd plasticraft
npm install
npm run dev        # dev server at localhost:5173
npm run build      # production build → dist/
```

### Tech Stack

- React 19 + TypeScript + Vite
- Framer Motion — mascot animations and phase transitions
- canvas-confetti — fireworks on correct answer
- Browser MediaDevices API — live camera feed with pixel-diff motion detection

### Swappable AI Layer

Plastic identification is isolated in [`plasticraft/src/services/scanner.ts`](plasticraft/src/services/scanner.ts). The current implementation simulates a 1.8 s delay and always returns `PS`. To connect a real model, replace the body of `identifyPlastic()` — the file contains detailed comments for:

- **Option A** — Your own REST endpoint
- **Option B** — Claude Vision API (Anthropic)
- **Option C** — Google Cloud Vision API
- **Option D** — On-device TensorFlow.js model

### Language Switching

A fixed pill selector (top-right corner) switches the entire app between 中文 / 日本語 / English instantly. The chosen language persists in `localStorage` under the key `plastcraft_lang`.

### Plastic Types

| ID   | Resin Code | Common Items                          | Colour  |
|------|-----------|---------------------------------------|---------|
| PET  | ①         | Water bottles, capsule shells         | #29B6F6 |
| HDPE | ②         | Shampoo bottles, milk jugs            | #66BB6A |
| PP   | ⑤         | Bottle caps, connectors, straws       | #FF8A65 |
| PS   | ⑥         | Meat trays, foam cups, CD cases       | #FF8A65 |
| PVC  | ③         | Pipes, window frames, blister packs   | #AB47BC |

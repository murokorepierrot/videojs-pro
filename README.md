# 🎬 Next-Gen Cinema UI — 3D Projector Deck

A tactile, cinema-inspired custom skin for **Video.js v10** built with **React**, **Next.js**, **Tailwind CSS**, and **Mux**. Designed for the [Video.js Skins Design Challenge](https://contra.com) on Contra.

🔗 **Live Demo:** [https://vercel.app](https://vercel.app)

---

## ✨ Concept

**The seek bar is the film itself.** Instead of a generic progress line, Cinema UI transforms the Video.js v10 `<TimeSlider>` into a 35mm filmstrip populated with real frames extracted dynamically from a **Mux Storyboard (`storyboard.vtt`)**. 

The entire player is engineered as a physical **3D Projector Console** (crafted purely with CSS gradients, specular highlights, and layered shadows—zero external images or 3D libraries) that reacts to cursor movement, device gyroscope tilt, and the color palette of the active video scene.

---

## 🚀 Key Features

### 🎞️ Mux-Powered Filmstrip & Ambient Lighting
* **Real Storyboard Filmstrip (`<TimeSlider>`):** Dynamically parses Mux `.vtt` sprite sheets to render a continuous 35mm filmstrip with sprocket holes, an illuminated amber LED playhead (`film-gate`), and instant frame-accurate hover/touch scrub previews.
* **Ambient Scene Glow:** Extracts the active Mux storyboard frame in real time to cast matching ambient colors around the console, intensifying when theater **Lights Off (`DARK`)** mode is engaged.
* **Chapter Markers & Tactile Detents:** Integrates Video.js v10 `chaptersTrack` (`useTextCues`, `useActiveTextCues`) to render chapter notches on the filmstrip, display live scene badges, and trigger subtle haptic vibrations (`navigator.vibrate`) + synthesized mechanical clicks on chapter transitions.

### 🎥 Authentic Cinema Projector Experience
* **3-2-1 Countdown Leader & Velvet Curtain:** Opening playback triggers a classic film countdown leader and parts a motorized theater curtain (skippable on tap/key).
* **Tactile Deck & Knurled Jog Dial:** Features physical-feel depressed buttons with LED indicators, spinning 35mm film reels, a glowing projector lamp, and a draggable/keyboard-accessible metal **Jog Knob** for frame-by-frame scrubbing.
* **Director's Viewfinder (`V`):** Overlays a 3D parallax camera viewfinder with rule-of-thirds grid, safe-area guides, live `REC`/`STBY` indicator, 24fps SMPTE timecode, and tap-to-focus reticles.
* **Aspect Ratio & Film Stocks:** Instant letterbox switching between **16:9 Flat** and **21:9 Scope**, plus 5 cinema color grades (*Neutral, Noir, Sepia, Technicolor, Faded*)—including a hidden **Film Noir Easter Egg** triggered by pressing `C` three times.
* **Scenes Tape Shelf (`C`):** Browse video chapters via a nostalgic VHS/film cassette shelf or structured chapter list.

### 🌐 Accessibility, Localization & Cross-Platform UX
* **Full Video.js v10 Architecture:** Built natively on `@videojs/react` (`createPlayer`, `Container`, `PlayButton`, `MuteButton`, `FullscreenButton`, `PiPButton`, `StatusAnnouncer`, `ErrorDialog`) and `@videojs/mux-video`.
* **Custom Caption Renderer:** Parses WebVTT tracks and renders high-contrast cinema subtitles readable over any footage.
* **Multi-Language Control Panel:** Built-in UI localization supporting **English**, **Français**, and **Kinyarwanda**.
* **Responsive & Accessible:** Adapts seamlessly from a 3D tilt-reactive desktop console to a touch-optimized mobile bar with 44px touch targets, Media Session API lock-screen controls, ARIA attributes, and `prefers-reduced-motion` support.

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
| :--- | :--- |
| `Space` | Play / Pause |
| `←` / `→` | Seek backward / forward 10 seconds |
| `↑` / `↓` | Increase / decrease volume |
| `M` | Mute / Unmute |
| `C` | Open Scenes Tape Shelf *(press 3× quickly for Film Noir mode)* |
| `V` | Toggle Director's Viewfinder |
| `H` | Return to Home (pause, rewind & close curtain) |
| `F` | Toggle Fullscreen |

---

## 🛠️ Tech Stack

* **Player Core:** Video.js v10 (`@videojs/react`, `@videojs/mux-video`)
* **Framework:** Next.js (App Router) & React
* **Styling:** Tailwind CSS + Pure CSS 3D Console & Shader-like Lighting Effects
* **Video & Storyboards:** Mux Video Streaming & WebVTT Sprite Sheets

---

## 💻 Running Locally

```bash
# 1. Clone the repository
git clone https://github.com
cd videojs-pro

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the player.

*(To use your own Mux video asset, replace `PLAYBACK_ID` in `src/app/page.tsx` with your Mux Playback ID.)*

---

## 👤 Author

**Designed & engineered by Murokore Pierrot**

'use client';

/**
 * Cinema UI — "Projector Deck": a Video.js v10 skin.
 * Built on @videojs/react (createPlayer, Container, TimeSlider, PlayButton, MuteButton,
 * FullscreenButton, PiPButton, StatusAnnouncer, ErrorDialog) and @videojs/mux-video.
 *
 * Idea: the seek bar IS the film. Real Mux storyboard frames form the filmstrip,
 * the room glows with the colour of the current scene, and the deck behaves like a projector.
 *
 * To earn the Mux bonus point: upload your own video to Mux and replace PLAYBACK_ID below.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Container,
  ErrorDialog,
  FullscreenButton,
  MuteButton,
  PiPButton,
  PlayButton,
  StatusAnnouncer,
  TimeSlider,
  createPlayer,
} from '@videojs/react';
import { videoFeatures } from '@videojs/react/video';
import { MuxVideo } from '@videojs/react/media/mux-video';

const PLAYBACK_ID = 'INbHjTltgmGfualPb7c1U9SUC1OWyjyEwtTqzMZd3zY';
const POSTER_URL = `https://image.mux.com/${PLAYBACK_ID}/thumbnail.jpg`;
const STORYBOARD_URL = `https://image.mux.com/${PLAYBACK_ID}/storyboard.vtt`;

const { Player, usePlayer } = createPlayer({ features: videoFeatures });

const RATES = [0.5, 1, 1.5, 2];
const PREVIEW_W = 160;
const SCENES = 12;
// Rounded so server and browser render identical SVG (avoids hydration warnings).
const REEL = [0, 60, 120, 180, 240, 300].map((a) => ({
  cx: +(18 + 10 * Math.cos((a * Math.PI) / 180)).toFixed(2),
  cy: +(18 + 10 * Math.sin((a * Math.PI) / 180)).toFixed(2),
}));
const COUNTDOWN_LEADER = true; // classic 3-2-1 film leader on first play (tap/press anything to skip). false = off
// Subtitles: paste the URL of your own .vtt file (it must allow cross-origin loading). Empty = built-in demo captions.
const CAPTIONS_URL = '';
const DEMO_LINES = [
  'Welcome to Cinema UI.',
  'Every control here is a real Video.js v10 component.',
  'The seek bar is the film itself,\nbuilt from Mux storyboard frames.',
  'Press C to browse scenes,\nor double-tap the screen to skip 10 seconds.',
  'Switch off the lights and watch the projector beam.',
  "Press V for the director's viewfinder.",
  'Captions are drawn by the skin itself,\nso they stay readable over any footage.',
  'Replace these demo captions with your own .vtt file.',
];
// Demo captions: one line every 6 seconds for 15 minutes, so subtitles show wherever you are in the film.
function buildDemoVtt() {
  const ts = (s: number) => {
    const h = String(Math.floor(s / 3600)).padStart(2, '0');
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    const sec = (s % 60).toFixed(3).padStart(6, '0');
    return `${h}:${m}:${sec}`;
  };
  let out = 'WEBVTT\n\n';
  for (let i = 0; i < 150; i++) {
    const start = 0.5 + i * 6;
    out += `${ts(start)} --> ${ts(start + 4.5)}\n${DEMO_LINES[i % DEMO_LINES.length]}\n\n`;
  }
  return out;
}
const DEMO_VTT = buildDemoVtt();
/* ---- Settings-panel translations: English, French, Kinyarwanda ---- */
type Lang = 'en' | 'fr' | 'rw';
const EN = {
  kicker: 'Projector',
  title: 'Control panel',
  close: 'Close',
  closeAria: 'Close settings',
  language: 'Language',
  sound: 'Sound',
  soundOn: 'Sound on',
  muted: 'Muted',
  filmSpeed: 'Film speed',
  scenes: 'Scenes',
  tapeShelf: 'Tape shelf',
  open: 'Open',
  subtitles: 'Subtitles',
  captionsOn: 'Captions on · English',
  captionsOff: 'Captions off',
  pip: 'Picture-in-picture',
  director: 'Director',
  directorView: "Director's view",
  directorHint: 'Viewfinder, grid, timecode, tap to focus',
  watch: 'Watch together',
  watchHint: 'Copies a room link. Demo: playback is not synced.',
  room: 'Room',
  lightsOff: 'Lights off',
  lightsOn: 'Lights on',
  home: 'Back to Home · close the curtain',
  shortcuts: 'Space play · ←/→ 10s · ↑/↓ volume · M mute · C scenes · V director · H home · F fullscreen',
  linkCopied: 'Link copied! Share it with friends.',
  copyFailed: 'Copy this link:',
};
type Strings = Record<keyof typeof EN, string>;
const TRANSLATIONS: Record<Lang, Strings> = {
  en: EN,
  fr: {
    kicker: 'Projecteur',
    title: 'Panneau de contrôle',
    close: 'Fermer',
    closeAria: 'Fermer les réglages',
    language: 'Langue',
    sound: 'Son',
    soundOn: 'Son activé',
    muted: 'Son coupé',
    filmSpeed: 'Vitesse du film',
    scenes: 'Scènes',
    tapeShelf: 'Étagère de cassettes',
    open: 'Ouvrir',
    subtitles: 'Sous-titres',
    captionsOn: 'Sous-titres activés · Anglais',
    captionsOff: 'Sous-titres désactivés',
    pip: 'Image dans l’image',
    director: 'Réalisateur',
    directorView: 'Vue du réalisateur',
    directorHint: 'Viseur, grille, timecode, toucher pour la mise au point',
    watch: 'Regarder ensemble',
    watchHint: 'Copie un lien de salle. Démo : la lecture n’est pas synchronisée.',
    room: 'Salle',
    lightsOff: 'Lumières éteintes',
    lightsOn: 'Lumières allumées',
    home: 'Retour à l’accueil · fermer le rideau',
    shortcuts: 'Espace lecture · ←/→ 10 s · ↑/↓ volume · M muet · C scènes · V réalisateur · H accueil · F plein écran',
    linkCopied: 'Lien copié ! Partagez-le avec vos amis.',
    copyFailed: 'Copiez ce lien :',
  },
  // Kinyarwanda: best-effort translation, worth a native-speaker review before submitting.
  rw: {
    kicker: 'Imashini yerekana',
    title: 'Ibikoresho byo kugenzura',
    close: 'Funga',
    closeAria: 'Funga igenamiterere',
    language: 'Ururimi',
    sound: 'Ijwi',
    soundOn: 'Ijwi ririho',
    muted: 'Ijwi ryazimijwe',
    filmSpeed: 'Umuvuduko wa filime',
    scenes: 'Ibice',
    tapeShelf: 'Ububiko bw’amakaseti',
    open: 'Fungura',
    subtitles: 'Ubusobanuro bwanditse',
    captionsOn: 'Ubusobanuro bwanditse burakoze · Icyongereza',
    captionsOff: 'Ubusobanuro bwanditse bwazimijwe',
    pip: 'Ishusho mu yindi shusho',
    director: 'Umuyobozi',
    directorView: 'Uko umuyobozi abibona',
    directorHint: 'Ikadiri y’ikamera, imirongo n’igihe',
    watch: 'Turebere hamwe',
    watchHint: 'Kopora ihuza ry’icyumba. Ni igerageza: kureba ntibihurizwa hamwe.',
    room: 'Icyumba',
    lightsOff: 'Kuzimya amatara',
    lightsOn: 'Gucana amatara',
    home: 'Garuka ku ntangiriro · funga umwenda',
    shortcuts: 'Umwanya gukina · ←/→ amasegonda 10 · ↑/↓ ijwi · M guceceka · C ibice · V umuyobozi · H ntangiriro · F ecran yose',
    linkCopied: 'Ihuza ryakopowe! Rihe inshuti zawe.',
    copyFailed: 'Kopora iri huza:',
  },
};

const DUST = Array.from({ length: 18 }, (_, i) => ({
  left: 28 + ((i * 53) % 44),
  size: 2 + (i % 3),
  delay: -((i * 13) % 70) / 10,
  dur: 7 + (i % 5) * 1.6,
}));

type Frame = { start: number; end: number; x: number; y: number; w: number; h: number; url: string };
type Sheet = { w: number; h: number };

/* ---------- helpers ---------- */
const clamp = (n: number, min = 0, max = 1) => Math.min(max, Math.max(min, n));

const fmt = (s: number) => {
  if (!isFinite(s) || s < 0) s = 0;
  const h = Math.floor(s / 3600);
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const sec = String(Math.floor(s % 60)).padStart(2, '0');
  return h > 0 ? `${h}:${m}:${sec}` : `${m}:${sec}`;
};

const parseTs = (str: string) => {
  const p = str.trim().split(':').map(parseFloat);
  return p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p[0] * 60 + p[1];
};

/** Parses a Mux storyboard.vtt into frames + the real pixel size of each sprite sheet. */
function parseStoryboard(text: string, base: string) {
  const frames: Frame[] = [];
  const sheets: Record<string, Sheet> = {};
  let start = 0;
  let end = 0;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (line.includes('-->')) {
      const [a, b] = line.split('-->');
      start = parseTs(a);
      end = parseTs(b.trim().split(/\s+/)[0]);
    } else if (line.includes('#xywh=')) {
      const [path, hash] = line.split('#xywh=');
      const [x, y, w, h] = hash.split(',').map((n) => parseInt(n, 10));
      const url = new URL(path, base).toString();
      frames.push({ start, end, x, y, w, h, url });
      const s = sheets[url] || { w: 0, h: 0 };
      sheets[url] = { w: Math.max(s.w, x + w), h: Math.max(s.h, y + h) };
    }
  }
  return { frames, sheets };
}

/** Crops ONE storyboard frame with percentages: fits any box of the frame's aspect ratio. Pure CSS. */
const sprite = (f: Frame, s: Sheet): React.CSSProperties => {
  const cols = s.w / f.w;
  const rows = s.h / f.h;
  return {
    backgroundImage: `url(${f.url})`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: `${cols * 100}% ${rows * 100}%`,
    backgroundPosition: `${cols > 1 ? (f.x / f.w / (cols - 1)) * 100 : 0}% ${
      rows > 1 ? (f.y / f.h / (rows - 1)) * 100 : 0
    }%`,
  };
};

/* ---------- tiny icons ---------- */
const Svg = ({ children, fill = false, size = 18 }: { children: React.ReactNode; fill?: boolean; size?: number }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill={fill ? 'currentColor' : 'none'}
    stroke={fill ? 'none' : 'currentColor'}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);
const PlayIcon = ({ size }: { size?: number }) => <Svg fill size={size}><path d="M8 5v14l11-7z" /></Svg>;
const PauseIcon = ({ size }: { size?: number }) => <Svg fill size={size}><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></Svg>;
const EnterFsIcon = () => <Svg><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></Svg>;
const ExitFsIcon = () => <Svg><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" /></Svg>;
const GridIcon = () => (
  <Svg>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </Svg>
);
const PipIcon = () => (
  <Svg>
    <rect x="2" y="4" width="20" height="15" rx="2" />
    <rect x="12" y="11" width="7" height="5" rx="1" fill="currentColor" />
  </Svg>
);
const UsersIcon = ({ size }: { size?: number }) => (
  <Svg size={size}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </Svg>
);
const ListIcon = () => (
  <Svg>
    <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
  </Svg>
);
const GearIcon = () => (
  <Svg>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </Svg>
);

const deckBtn =
  'inline-flex items-center justify-center gap-2 min-h-11 min-w-11 px-3 max-sm:px-1 py-2 rounded-xl text-xs font-semibold border transition-all touch-manipulation';
const deckBtnIdle = 'bg-white/5 text-slate-100 border-white/15 hover:bg-white/10';
const deckBtnOn = 'bg-amber-500/20 text-amber-200 border-amber-400/60';

/* =====================================================================
   The skin
   ===================================================================== */
/* ---- small leaf components: they own fast-changing state so the big skin doesn't re-render on every pointer move / tick ---- */

/** Keeps the exact playhead in a ref without re-rendering the skin. */
function TimeTap({ tap }: { tap: React.MutableRefObject<number> }) {
  const t: number = usePlayer((s: any) => s.currentTime) ?? 0;
  tap.current = Number.isFinite(t) ? t : 0;
  return null;
}

/** SMPTE-style timecode for the director's viewfinder (24 fps). */
function Timecode() {
  const t: number = usePlayer((s: any) => s.currentTime) ?? 0;
  const sec = Number.isFinite(t) ? t : 0;
  const pad = (n: number) => String(n).padStart(2, '0');
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const f = Math.floor((sec % 1) * 24);
  return <>{`${pad(h)}:${pad(m)}:${pad(s)}:${pad(f)}`}</>;
}

/**
 * The hover preview: pointer moves re-render ONLY this component.
 * Hovering (or pressing and holding) the bar shows the frame thumbnail and its timestamp.
 */
function StripPreview({
  wrapRef,
  duration,
  getFrame,
}: {
  wrapRef: React.RefObject<HTMLDivElement | null>;
  duration: number;
  getFrame: (t: number) => { f: Frame; s: Sheet } | null;
}) {
  const [hover, setHover] = useState<{ x: number; w: number; time: number } | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const show = (e: PointerEvent) => {
      if (!duration) return;
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left;
      setHover({ x, w: r.width, time: clamp(x / r.width) * duration });
      setVisible(true);
    };
    const hide = () => setVisible(false);
    const up = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') setVisible(false); // touch: fade out on release
    };
    el.addEventListener('pointerdown', show, true); // press and hold shows it immediately
    el.addEventListener('pointermove', show);
    el.addEventListener('pointerleave', hide);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', hide);
    return () => {
      el.removeEventListener('pointerdown', show, true);
      el.removeEventListener('pointermove', show);
      el.removeEventListener('pointerleave', hide);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', hide);
    };
  }, [wrapRef, duration]);

  if (!hover) return null;
  const hf = getFrame(hover.time);
  if (!hf) return null;
  return (
    <div
      className={`preview-fade absolute bottom-full mb-3 z-50 pointer-events-none flex flex-col items-center gap-2 ${
        visible ? 'is-visible' : ''
      }`}
      style={{
        left: clamp(hover.x, PREVIEW_W / 2 + 2, Math.max(PREVIEW_W / 2 + 2, hover.w - PREVIEW_W / 2 - 2)),
        transform: 'translateX(-50%)',
      }}
    >
      <div
          className="relative overflow-hidden rounded-lg border-2 border-white/30 bg-slate-900 shadow-2xl"
          style={{
            ...sprite(hf.f, hf.s),
            width: PREVIEW_W,
            height: Math.round((PREVIEW_W * hf.f.h) / hf.f.w),
          }}
        >
          <span className="absolute bottom-1 right-1 bg-black/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded border border-white/20 tabular-nums">
            {fmt(hover.time)}
          </span>
        </div>
    </div>
  );
}

/** Filmstrip frames: memoised, they only re-render when the strip itself changes. */
const FilmTiles = React.memo(function FilmTiles({
  strip,
  tileW,
}: {
  strip: ({ f: Frame; s: Sheet } | null)[];
  tileW: number;
}) {
  return (
    <div className="flex h-full gap-[2px]">
      {strip.map((fr, i) => (
        <div key={i} className="flex-none bg-slate-900" style={{ width: tileW, ...(fr ? sprite(fr.f, fr.s) : {}) }} />
      ))}
    </div>
  );
});

/** A small projector lamp: glows amber while the film rolls, dims when paused. Decorative (status is already announced). */
function ProjectorLamp({ on, variant = 'deck' }: { on: boolean; variant?: 'deck' | 'bar' }) {
  return (
    <span
      className={`lamp ${variant === 'bar' ? 'lamp-bar flex md:hidden' : 'hidden md:flex'} ${on ? 'is-on' : ''}`}
      data-tip={on ? 'Projector lamp: lit' : 'Projector lamp: off'}
      aria-hidden="true"
    >
      <svg viewBox="0 0 40 40" width="34" height="34">
        <rect x="14" y="27" width="12" height="8" rx="2" fill="#3b3f4a" />
        <rect x="16" y="35" width="8" height="3" rx="1" fill="#2a2d36" />
        <path className="lamp-bulb" d="M20 3a10.5 10.5 0 0 0-5.2 19.6V27h10.4v-4.4A10.5 10.5 0 0 0 20 3z" />
        <path className="lamp-fil" d="M15.5 14.5l2.2 4.5 2.3-4.5 2.3 4.5 2.2-4.5" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

/** A knurled metal jog dial: drag left/right to scrub the film, or use the arrow keys when focused. */
function JogKnob({
  timeRef,
  duration,
  noBurn,
  variant = 'deck',
}: {
  timeRef: React.MutableRefObject<number>;
  duration: number;
  noBurn: React.MutableRefObject<boolean>;
  variant?: 'deck' | 'bar';
}) {
  const store: any = usePlayer();
  const paused: boolean = usePlayer((s: any) => s.paused) ?? true;
  const nowSec: number = usePlayer((s: any) => (Number.isFinite(s.currentTime) ? Math.floor(s.currentTime) : 0)) ?? 0;
  const rotor = useRef<HTMLDivElement | null>(null);
  const rot = useRef(0);
  const raf = useRef(0);
  const drag = useRef<{ x: number; t: number; wasPlaying: boolean } | null>(null);
  const [active, setActive] = useState(false);

  const turn = (deg: number) => {
    rot.current += deg;
    rotor.current?.style.setProperty('--jog-rot', `${rot.current}deg`);
  };

  const end = () => {
    const d = drag.current;
    if (!d) return;
    cancelAnimationFrame(raf.current);
    raf.current = 0;
    drag.current = null;
    noBurn.current = false;
    setActive(false);
    if (d.wasPlaying) store.play?.()?.catch?.(() => {});
  };

  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, t: timeRef.current, wasPlaying: !paused };
    noBurn.current = true; // no gate-flash on every scrubbed frame
    setActive(true);
    if (!paused) store.pause?.();
  };

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    d.x = e.clientX;
    d.t = clamp(d.t + dx * 0.12, 0, duration || 0);
    turn(dx * 2.4);
    if (!raf.current) {
      raf.current = requestAnimationFrame(() => {
        raf.current = 0;
        if (drag.current) store.seek?.(drag.current.t);
      });
    }
  };

  const onKey = (e: React.KeyboardEvent) => {
    const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : e.key === 'PageUp' ? 10 : e.key === 'PageDown' ? -10 : 0;
    if (!step) return;
    e.preventDefault();
    const s = e.shiftKey ? step * 5 : step;
    store.seek?.(clamp(timeRef.current + s, 0, duration || 0));
    turn(s * 12);
  };

  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label="Jog dial: scrub the film"
      aria-valuemin={0}
      aria-valuemax={Math.floor(duration)}
      aria-valuenow={nowSec}
      aria-valuetext={`${fmt(nowSec)} of ${fmt(duration)}`}
      data-tip="Jog dial · drag to scrub"
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={end}
      onPointerCancel={end}
      onKeyDown={onKey}
      className={`jog ${variant === 'bar' ? 'jog-sm block md:hidden' : 'hidden md:block'} ${active ? 'is-active' : ''}`}
    >
      <div ref={rotor} className="jog-rotor">
        <span className="jog-cap" />
        <span className="jog-dot" />
      </div>
    </div>
  );
}

function Cinema({ lightsOff, setLightsOff }: { lightsOff: boolean; setLightsOff: (v: boolean) => void }) {
  const store: any = usePlayer();
  const paused: boolean = usePlayer((s: any) => s.paused) ?? true;
  const rawTime: number = usePlayer((s: any) => (Number.isFinite(s.currentTime) ? Math.floor(s.currentTime) : 0)) ?? 0;
  const rawDur: number = usePlayer((s: any) => s.duration) ?? 0;
  const volume: number = usePlayer((s: any) => s.volume) ?? 1;
  const muted: boolean = usePlayer((s: any) => s.muted) ?? false;
  const rate: number = usePlayer((s: any) => s.playbackRate) ?? 1;

  const currentTime = Number.isFinite(rawTime) ? rawTime : 0;
  const duration = Number.isFinite(rawDur) ? rawDur : 0;
  const isPlaying = !paused;

  const rootRef = useRef<HTMLDivElement | null>(null);
  const seekWrapRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const deckRef = useRef<HTMLDivElement | null>(null);
  const panelTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gearBtnRef = useRef<HTMLButtonElement | null>(null);
  const volTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevTime = useRef(0);

  // Always-fresh values for the global keyboard handler.
  const live = useRef({ store, currentTime, duration, volume, muted, paused });
  live.current = { store, currentTime, duration, volume, muted, paused };

  const [volToast, setVolToast] = useState<number | null>(null);
  const [panel, setPanel] = useState<'closed' | 'open' | 'closing'>('closed');
  const [deckH, setDeckH] = useState(150);
  const [curtainOpen, setCurtainOpen] = useState(false);
  const [ccOn, setCcOn] = useState(false);
  const [cueText, setCueText] = useState('');
  const [ccToast, setCcToast] = useState<string | null>(null);
  const ccFirst = useRef(true);
  const progressed = useRef(false);
  const timeRef = useRef(0);
  const vfRef = useRef<HTMLDivElement | null>(null);
  const noBurn = useRef(false);
  const [showCenterButton, setShowCenterButton] = useState(true);
  const [isFs, setIsFs] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showRef = useRef(true);
  const tapWoke = useRef(false);
  const lastWake = useRef(0);
  const [director, setDirector] = useState(false);
  const [focusPt, setFocusPt] = useState<{ x: number; y: number; key: number } | null>(null);
  const [lang, setLang] = useState<Lang>('en');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [shelfView, setShelfView] = useState<'grid' | 'list'>('grid');
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const t = TRANSLATIONS[lang];
  const [scope, setScope] = useState(false);
  const [flash, setFlash] = useState(false);
  const [board, setBoard] = useState<{ frames: Frame[]; sheets: Record<string, Sheet> }>({ frames: [], sheets: {} });
  const [barW, setBarW] = useState(0);
  const [burnKey, setBurnKey] = useState(0);
  const [skipFx, setSkipFx] = useState<{ dir: number; key: number } | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const [leader, setLeader] = useState<number | null>(null);
  const leaderTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const leaderActive = useRef(false);
  const leaderDone = useRef(false);

  const sheetOpenRef = useRef(false);
  sheetOpenRef.current = sheetOpen;
  const panelStateRef = useRef<'closed' | 'open' | 'closing'>('closed');
  panelStateRef.current = panel;

  /* ----- transient UI helpers ----- */
  const flashCenter = useCallback(() => {
    setFlash(true);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlash(false), 1000);
  }, []);

  const flashVolume = useCallback((v: number) => {
    setVolToast(Math.round(v * 100));
    if (volTimer.current) clearTimeout(volTimer.current);
    volTimer.current = setTimeout(() => setVolToast(null), 1500);
  }, []);

  /* ----- actions (all through the Video.js v10 player store) ----- */
  const togglePlay = useCallback(() => {
    const { store: s, paused: p } = live.current;
    if (p) {
      const r = s.play?.();
      if (r && r.catch) r.catch(() => {});
    } else {
      s.pause?.();
    }
    flashCenter();
  }, [flashCenter]);

  const skipBy = useCallback((sec: number) => {
    const { store: s, duration: d } = live.current;
    s.seek?.(clamp(timeRef.current + sec, 0, d || 0));
    setSkipFx({ dir: sec > 0 ? 1 : -1, key: Date.now() });
    if (skipTimer.current) clearTimeout(skipTimer.current);
    skipTimer.current = setTimeout(() => setSkipFx(null), 700);
  }, []);

  const setVolumeTo = useCallback(
    (v: number) => {
      const { store: s } = live.current;
      s.setVolume?.(v);
      s.setMuted?.(v === 0);
      flashVolume(v);
    },
    [flashVolume]
  );

  const clickFullscreen = useCallback(() => {
    rootRef.current?.querySelector<HTMLButtonElement>('[data-action="fullscreen"]')?.click();
  }, []);

  const closeSheet = useCallback(() => {
    setSheetOpen(false);
    gearBtnRef.current?.focus();
  }, []);

  /* ----- countdown leader: the first time you press play, a classic 3-2-1 film leader rolls ----- */
  const endLeader = useCallback((resume: boolean) => {
    leaderTimers.current.forEach(clearTimeout);
    leaderTimers.current = [];
    if (!leaderActive.current) return;
    leaderActive.current = false;
    setLeader(null);
    if (resume) live.current.store.play?.()?.catch?.(() => {});
  }, []);

  useEffect(() => {
    if (!COUNTDOWN_LEADER || paused) return;
    if (leaderActive.current) {
      endLeader(false); // the viewer pressed play during the leader: just play
      return;
    }
    if (leaderDone.current) return;
    leaderDone.current = true;
    if (timeRef.current > 0.5 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    leaderActive.current = true;
    live.current.store.pause?.();
    setLeader(3);
    leaderTimers.current = [
      setTimeout(() => setLeader(2), 650),
      setTimeout(() => setLeader(1), 1300),
      setTimeout(() => endLeader(true), 1950),
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused]);

  /* ----- storyboard (WebVTT sprite sheet) ----- */
  useEffect(() => {
    let cancelled = false;
    fetch(STORYBOARD_URL)
      .then((r) => r.text())
      .then((t) => !cancelled && setBoard(parseStoryboard(t, STORYBOARD_URL)))
      .catch((err) => console.error('Storyboard error:', err));
    return () => {
      cancelled = true;
    };
  }, []);

  /* ----- measure the filmstrip so we know how many frames fit ----- */
  useEffect(() => {
    const el = seekWrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setBarW(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* ----- gate flash whenever the playhead jumps (slider, keys, scenes, double-tap) ----- */
  useEffect(() => {
    if (!noBurn.current && Math.abs(currentTime - prevTime.current) > 1.5) setBurnKey((k) => k + 1);
    prevTime.current = currentTime;
  }, [currentTime]);

  /* ----- Projector control panel (opens with an animation, closes with an exit animation) ----- */
  const closePanel = useCallback(() => {
    if (panelStateRef.current !== 'open') return;
    setPanel('closing');
    gearBtnRef.current?.focus();
    if (panelTimer.current) clearTimeout(panelTimer.current);
    panelTimer.current = setTimeout(() => setPanel('closed'), 230);
  }, []);

  useEffect(() => {
    if (panel === 'open') panelRef.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus();
  }, [panel]);

  /* ----- measure the deck so the desktop panel floats just above it ----- */
  useEffect(() => {
    const el = deckRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setDeckH(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* ----- cinema curtain: opens when the film starts, closes when it ends ----- */
  useEffect(() => {
    if (!paused) setCurtainOpen(true);
  }, [paused]);
  useEffect(() => {
    if (paused && duration > 0 && currentTime >= Math.floor(duration)) setCurtainOpen(false);
  }, [paused, currentTime, duration]);

  /* ----- projector reels idle slowly when paused and spin up when playing ----- */
  useEffect(() => {
    rootRef.current?.querySelectorAll<HTMLElement>('.reel').forEach((el) =>
      el.getAnimations?.().forEach((a) => a.updatePlaybackRate?.(isPlaying ? 1 : 0.15))
    );
  }, [isPlaying, panel]);

  /* ----- "Back to Home": pause, rewind, close the curtain, re-arm the opening ----- */
  const goHome = useCallback(() => {
    endLeader(false);
    const s = live.current.store;
    s.pause?.();
    s.seek?.(0);
    progressed.current = false;
    leaderDone.current = false;
    setCurtainOpen(false);
  }, [endLeader]);

  /* ----- rewinding to 0:00 closes the curtain again (pausing never does) ----- */
  useEffect(() => {
    if (currentTime > 2) progressed.current = true;
    if (progressed.current && paused && currentTime < 0.5 && curtainOpen && leader === null) {
      progressed.current = false;
      leaderDone.current = false; // the next play rolls the full opening again
      setCurtainOpen(false);
    }
  }, [currentTime, paused, curtainOpen, leader]);

  /* ----- subtitles: a <track> is attached to the v10 media element and drawn by our own caption layer ----- */
  useEffect(() => {
    let tries = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let cleanup: (() => void) | undefined;

    const attach = () => {
      const video = rootRef.current?.querySelector('video');
      if (!video) {
        if (tries++ < 10) timer = setTimeout(attach, 200);
        return;
      }
      const track = document.createElement('track');
      track.kind = 'subtitles';
      track.label = 'English';
      track.srclang = 'en';
      let blobUrl: string | null = null;
      const useDemo = () => {
        blobUrl = URL.createObjectURL(new Blob([DEMO_VTT], { type: 'text/vtt' }));
        track.src = blobUrl;
      };
      if (CAPTIONS_URL) {
        track.src = CAPTIONS_URL;
        track.addEventListener('error', useDemo, { once: true });
      } else {
        useDemo();
      }
      video.appendChild(track);
      const tt = track.track;
      tt.mode = 'hidden'; // we draw the cues ourselves
      const onCue = () => {
        const cues = tt.activeCues;
        setCueText(
          cues && cues.length ? Array.from(cues).map((c: any) => String(c.text).replace(/<[^>]+>/g, '')).join('\n') : ''
        );
      };
      tt.addEventListener('cuechange', onCue);
      cleanup = () => {
        tt.removeEventListener('cuechange', onCue);
        track.remove();
        if (blobUrl) URL.revokeObjectURL(blobUrl);
      };
    };

    attach();
    return () => {
      if (timer) clearTimeout(timer);
      cleanup?.();
    };
  }, []);

  /* ----- director's view: the viewfinder tilts in 3D toward a mouse/pen on desktop (touch + phones stay flat) ----- */
  useEffect(() => {
    const screen = rootRef.current?.querySelector<HTMLElement>('.cinema-screen');
    const vf = vfRef.current;
    if (!director || !screen || !vf) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    let raf = 0;
    const move = (e: PointerEvent) => {
      if (e.pointerType === 'touch' || window.innerWidth <= 768) return; // phones and touch: flat
      const k = reduce.matches ? 0.35 : 1; // reduced motion gets a calmer tilt, never a dead one
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = screen.getBoundingClientRect();
        const x = clamp((e.clientX - r.left) / r.width);
        const y = clamp((e.clientY - r.top) / r.height);
        vf.style.setProperty('--rx', `${((0.5 - y) * 14 * k).toFixed(2)}deg`);
        vf.style.setProperty('--ry', `${((x - 0.5) * 18 * k).toFixed(2)}deg`);
      });
    };
    const leave = () => {
      cancelAnimationFrame(raf);
      vf.style.removeProperty('--rx');
      vf.style.removeProperty('--ry');
    };
    screen.addEventListener('pointermove', move);
    screen.addEventListener('pointerleave', leave);
    return () => {
      cancelAnimationFrame(raf);
      screen.removeEventListener('pointermove', move);
      screen.removeEventListener('pointerleave', leave);
      leave();
    };
  }, [director]);

  /* ----- tell the viewer when subtitles are switched on/off (even between cues) ----- */
  useEffect(() => {
    if (ccFirst.current) {
      ccFirst.current = false;
      return;
    }
    setCcToast(ccOn ? 'Subtitles on · English' : 'Subtitles off');
    const t = setTimeout(() => setCcToast(null), 1600);
    return () => clearTimeout(t);
  }, [ccOn]);

  /* ----- remembered language + the room from ?room=... (UI-only "watch room") ----- */
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('cinema-lang');
      if (saved === 'en' || saved === 'fr' || saved === 'rw') setLang(saved);
    } catch {
      /* storage can be unavailable (private mode): fine */
    }
    const r = new URLSearchParams(window.location.search).get('room');
    if (r && /^[\w-]{1,12}$/.test(r)) setRoomId(r);
  }, []);

  const changeLang = (next: Lang) => {
    setLang(next);
    try {
      window.localStorage.setItem('cinema-lang', next);
    } catch {
      /* ignore */
    }
  };

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  /** "Watch together": builds a room link, copies it, and puts this tab in the room. No backend: playback is not synced. */
  const copyRoomLink = useCallback(async () => {
    const id = roomId ?? Math.random().toString(36).slice(2, 8);
    const url = new URL(window.location.href);
    url.searchParams.set('room', id);
    const link = url.toString();
    let ok = false;
    try {
      await navigator.clipboard.writeText(link);
      ok = true;
    } catch {
      try {
        const ta = document.createElement('textarea');
        ta.value = link;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        ok = document.execCommand('copy');
        ta.remove();
      } catch {
        ok = false;
      }
    }
    setRoomId(id);
    window.history.replaceState(null, '', link);
    showToast(ok ? t.linkCopied : `${t.copyFailed} ${link}`);
  }, [roomId, showToast, t]);

  const trapTab = (e: React.KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    const els = panelRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), select');
    if (!els || !els.length) return;
    const first = els[0];
    const last = els[els.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  /* ----- keyboard shortcuts ----- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.target as HTMLElement;
      const tag = t?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || t?.isContentEditable) return;
      const onSlider = !!t?.closest?.('[role="slider"]');
      if (panelStateRef.current === 'open' && e.key !== 'Escape') return; // the settings panel owns the keyboard while open
      const { store: s, muted: m, volume: vol } = live.current;

      switch (e.key) {
        case ' ':
          if (tag === 'BUTTON' || onSlider) return; // focused controls handle Space themselves
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight':
        case 'ArrowLeft':
          if (onSlider) return; // the v10 TimeSlider handles its own arrows
          e.preventDefault();
          skipBy(e.key === 'ArrowRight' ? 10 : -10);
          break;
        case 'ArrowUp':
        case 'ArrowDown': {
          if (onSlider) return;
          e.preventDefault();
          const next = Math.round(clamp((m ? 0 : vol) + (e.key === 'ArrowUp' ? 0.1 : -0.1)) * 100) / 100;
          setVolumeTo(next);
          break;
        }
        case 'm':
        case 'M':
          e.preventDefault();
          if (m && vol === 0) s.setVolume?.(0.5);
          s.setMuted?.(!m);
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          clickFullscreen();
          break;
        case 'c':
        case 'C':
          e.preventDefault();
          setSheetOpen((o) => !o);
          break;
        case 'v':
        case 'V':
          e.preventDefault();
          setDirector((d) => !d);
          break;
        case 'h':
        case 'H':
          e.preventDefault();
          goHome();
          break;
        case 'Escape':
          if (panelStateRef.current === 'open') closePanel();
          if (sheetOpenRef.current) closeSheet();
          if (leaderActive.current) endLeader(true);
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [togglePlay, skipBy, setVolumeTo, clickFullscreen, closeSheet, endLeader, closePanel, goHome]);

  useEffect(
    () => () => {
      [volTimer, flashTimer, clickTimer, skipTimer, panelTimer, toastTimer].forEach((r) => r.current && clearTimeout(r.current));
      leaderTimers.current.forEach(clearTimeout);
    },
    []
  );

  /* ----- viewport + fullscreen awareness ----- */
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const onMq = () => setIsMobile(mq.matches);
    onMq();
    mq.addEventListener('change', onMq);
    const onFs = () => {
      const d: any = document;
      setIsFs(!!(d.fullscreenElement || d.webkitFullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFs);
    document.addEventListener('webkitfullscreenchange', onFs);
    return () => {
      mq.removeEventListener('change', onMq);
      document.removeEventListener('fullscreenchange', onFs);
      document.removeEventListener('webkitfullscreenchange', onFs);
    };
  }, []);

  /* ----- centre play/pause button auto-hide: phones and fullscreen only, while playing. The deck is ALWAYS visible. ----- */
  const autoHide = isPlaying && (isMobile || isFs);
  const autoHideRef = useRef(false);
  autoHideRef.current = autoHide;
  showRef.current = showCenterButton;

  const armIdle = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      showRef.current = false;
      setShowCenterButton(false);
    }, 3000);
  }, []);

  const wake = useCallback(() => {
    if (!autoHideRef.current) return;
    showRef.current = true;
    setShowCenterButton(true);
    armIdle();
  }, [armIdle]);

  useEffect(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    showRef.current = true;
    setShowCenterButton(true);
    if (autoHide) armIdle();
    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [autoHide, armIdle]);

  // any tap / pointer / key activity on the player brings the centre button back and restarts the 3-second timer
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const down = (e: PointerEvent) => {
      // only a tap on the video itself counts as "reveal only" (taps on deck buttons never do)
      const onScreen = !!(e.target as HTMLElement | null)?.closest?.('.cinema-screen > button');
      tapWoke.current = onScreen && autoHideRef.current && !showRef.current;
      wake();
    };
    const move = () => {
      const now = performance.now();
      if (now - lastWake.current < 200) return;
      lastWake.current = now;
      wake();
    };
    const key = () => wake();
    root.addEventListener('pointerdown', down, true);
    root.addEventListener('pointermove', move);
    root.addEventListener('keydown', key);
    root.addEventListener('focusin', key);
    return () => {
      root.removeEventListener('pointerdown', down, true);
      root.removeEventListener('pointermove', move);
      root.removeEventListener('keydown', key);
      root.removeEventListener('focusin', key);
    };
  }, [wake]);

  /** Single tap = play/pause. Double tap: left third -10s, right third +10s, middle = fullscreen. */
  const onScreenClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (director && e.detail === 1) {
      const r = e.currentTarget.getBoundingClientRect();
      setFocusPt({ x: e.clientX - r.left, y: e.clientY - r.top, key: Date.now() });
    }
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
    }
    if (e.detail > 0 && tapWoke.current) {
      tapWoke.current = false; // the centre button was hidden: this tap only brings it back
      return;
    }
    if (e.detail === 0) {
      togglePlay(); // keyboard activation
      return;
    }
    if (e.detail >= 2) {
      const r = e.currentTarget.getBoundingClientRect();
      const z = (e.clientX - r.left) / r.width;
      if (z < 0.33) skipBy(-10);
      else if (z > 0.66) skipBy(10);
      else clickFullscreen();
      return;
    }
    clickTimer.current = setTimeout(togglePlay, 220);
  };

  /* ----- storyboard lookups ----- */
  const getFrame = useCallback(
    (t: number) => {
      if (board.frames.length === 0) return null;
      let f = board.frames[0];
      for (const fr of board.frames) {
        if (fr.start <= t) f = fr;
        else break;
      }
      const s = board.sheets[f.url];
      return s ? { f, s } : null;
    },
    [board]
  );

  const ar = board.frames[0] ? board.frames[0].w / board.frames[0].h : 16 / 9;
  const tileH = barW < 520 ? 36 : 46;
  const tileW = Math.round(tileH * ar);
  const tiles = board.frames.length && barW ? Math.ceil(barW / (tileW + 2)) : 0;

  const strip = useMemo(
    () => Array.from({ length: tiles }, (_, i) => getFrame(((i + 0.5) / tiles) * duration)),
    [tiles, duration, getFrame]
  );
  const scenes = useMemo(
    () =>
      Array.from({ length: SCENES }, (_, i) => {
        const t = (i / SCENES) * duration;
        return { t, fr: getFrame(t + 0.01) };
      }),
    [duration, getFrame]
  );
  const sceneIdx = duration ? Math.min(SCENES - 1, Math.floor((currentTime / duration) * SCENES)) : 0;
  const ambient = getFrame(currentTime);
  const volValue = muted ? 0 : volume;
  const centerVisible = (!isPlaying || flash || (autoHide && showCenterButton)) && leader === null;

  return (
    <div ref={rootRef} className={`cinema-root relative z-40 ${isPlaying ? 'is-playing' : ''}`}>
      {/* glows */}
      <div
        className={`absolute -inset-3 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500 blur-2xl pointer-events-none transition-opacity duration-700 ${
          lightsOff ? 'opacity-40' : 'opacity-20'
        }`}
      />
      {/* Scene light: the room takes the colour of the current storyboard frame */}
      {ambient && (
        <div
          aria-hidden="true"
          className={`absolute -inset-4 rounded-3xl blur-2xl md:blur-3xl saturate-150 pointer-events-none transition-opacity duration-1000 motion-reduce:transition-none ${
            lightsOff ? 'opacity-70' : 'opacity-40'
          }`}
          style={sprite(ambient.f, ambient.s)}
        />
      )}

      {/* v10 Container = the fullscreen surface, so the deck stays on screen in fullscreen */}
      <Container className="cinema-stage relative block rounded-2xl overflow-hidden border border-white/15 bg-black shadow-2xl">
        <div className="sr-only">
          <StatusAnnouncer />
        </div>
        <TimeTap tap={timeRef} />

        {/* Screen */}
        <div
          className={`cinema-screen group relative bg-black overflow-hidden transition-[aspect-ratio] duration-500 motion-reduce:transition-none ${
            scope ? 'aspect-[21/9]' : 'aspect-video'
          }`}
        >
          <MuxVideo
            source={{ playbackId: PLAYBACK_ID }}
            poster={POSTER_URL}
            crossOrigin="anonymous"
            playsInline
            className="cinema-video"
          />

          {/* Click layer + center overlay */}
          <button
            type="button"
            onClick={onScreenClick}
            aria-label={isPlaying ? 'Pause video' : 'Play video'}
            className="absolute inset-0 z-10 flex items-center justify-center cursor-pointer touch-manipulation"
          >
            <span
              className={`flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-black/65 backdrop-blur-md border border-white/30 text-white shadow-[0_0_40px_rgba(245,158,11,0.35)] transition-all duration-300 ease-out motion-reduce:transition-none ${
                centerVisible ? 'opacity-100 scale-100' : autoHide
                  ? 'opacity-0 scale-90'
                  : 'opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100'
              }`}
            >
              {isPlaying ? <PauseIcon size={30} /> : <PlayIcon size={30} />}
            </span>
          </button>

          {/* Projector beam: when the lights are off and the film rolls, dusty light fills the room */}
          {curtainOpen && (
            <div
              aria-hidden="true"
              className={`beam absolute inset-0 z-[14] pointer-events-none transition-opacity duration-1000 ${
                isPlaying ? '' : 'beam-idle'
              } ${isPlaying ? (lightsOff ? 'opacity-100' : 'opacity-60') : lightsOff ? 'opacity-35' : 'opacity-15'}`}
            >
              <span className="beam-bottom absolute inset-0" />
              <span className="beam-top absolute inset-0" />
              {DUST.map((d, i) => (
                <i
                  key={i}
                  className="dust"
                  style={{ left: `${d.left}%`, width: d.size, height: d.size, animationDelay: `${d.delay}s`, animationDuration: `${d.dur}s` }}
                />
              ))}
            </div>
          )}

          {/* Projector feel */}
          <div
            aria-hidden="true"
            className={`film-grain absolute inset-0 z-[15] pointer-events-none transition-opacity duration-700 ${
              isPlaying ? 'opacity-[0.1]' : 'opacity-0'
            }`}
          />
          {burnKey > 0 && <div key={burnKey} aria-hidden="true" className="gate-burn absolute inset-0 z-[16] pointer-events-none" />}

          {skipFx && (
            <div
              key={skipFx.key}
              aria-hidden="true"
              className={`skip-fx absolute inset-y-0 z-[17] w-1/3 pointer-events-none flex items-center justify-center ${
                skipFx.dir > 0 ? 'right-0 rounded-l-[100%]' : 'left-0 rounded-r-[100%]'
              }`}
            >
              <span className="font-mono text-sm font-bold text-white">{skipFx.dir > 0 ? '10s ▶▶' : '◀◀ 10s'}</span>
            </div>
          )}

          {/* Cinema curtain: closed on standby, parts when the film starts */}
          <div aria-hidden="true" className={`curtain absolute inset-0 z-[9] pointer-events-none ${curtainOpen ? 'is-open' : ''}`}>
            <div className="curtain-panel curtain-left" />
            <div className="curtain-panel curtain-right" />
          </div>

          {/* Welcome text on the curtain: fades away as the curtain opens */}
          <div
            aria-hidden="true"
            className={`absolute inset-0 z-[11] pointer-events-none transition-opacity duration-700 motion-reduce:transition-none ${
              curtainOpen ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <div className="absolute inset-x-0 top-[21%] sm:top-[16%] px-4 text-center">
              <p className="welcome-kicker text-[9px] sm:text-xs font-mono uppercase tracking-[0.4em]">Now showing</p>
              <h2 className="welcome-title mt-1 text-lg sm:text-4xl md:text-5xl font-black tracking-wide">Welcome to Cinema UI</h2>
            </div>
            <p className="absolute inset-x-0 bottom-[7%] text-center text-[10px] sm:text-sm font-mono uppercase tracking-[0.25em] text-amber-200">
              Click play to begin
            </p>
          </div>

          {/* Countdown leader (3-2-1) */}
          {leader !== null && (
            <button
              type="button"
              tabIndex={-1}
              aria-hidden="true"
              className="absolute inset-0 z-[8] pointer-events-none flex flex-col items-center justify-center overflow-hidden bg-[#0b0b0d]"
            >
              <span aria-hidden="true" className="film-grain absolute inset-0 opacity-[0.12] pointer-events-none" />
              <span className="relative flex items-center justify-center w-32 h-32 sm:w-48 sm:h-48 rounded-full border-2 border-white/70">
                <span className="absolute inset-3 rounded-full border border-white/40" />
                <span className="absolute left-0 right-0 top-1/2 h-px bg-white/40" />
                <span className="absolute top-0 bottom-0 left-1/2 w-px bg-white/40" />
                <span key={`s${leader}`} className="leader-sweep absolute inset-0 rounded-full" />
                <span key={`n${leader}`} className="leader-num relative font-mono text-6xl sm:text-8xl font-black text-white">
                  {leader}
                </span>
              </span>
              <span role="status" aria-live="polite" className="sr-only">
                Starting in {leader}
              </span>
              <span className="relative mt-4 text-[10px] sm:text-xs font-mono tracking-[0.3em] uppercase text-white/70">
                Cinema UI · Reel 1 · Tap to skip
              </span>
            </button>
          )}

          {/* Director's view: a camera viewfinder (grid, safe area, REC, timecode, tap-to-focus) */}
          <div
            aria-hidden="true"
            className={`viewfinder absolute inset-0 z-[18] pointer-events-none transition-opacity duration-500 motion-reduce:transition-none ${
              director ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div ref={vfRef} className="vf-3d absolute inset-0">
            <span className="vf-grid" />
            <span className="vf-safe" />
            <span className="vf-cross" />
            <span className="vf-corner vf-tl" />
            <span className="vf-corner vf-tr" />
            <span className="vf-corner vf-bl" />
            <span className="vf-corner vf-br" />
            <div className="vf-text absolute left-6 sm:left-8 top-5 sm:top-7 flex items-center gap-2">
              <i className={`vf-dot ${isPlaying ? 'is-rec' : ''}`} />
              <span>{isPlaying ? 'REC' : 'STBY'}</span>
            </div>
            <div className="vf-text absolute right-6 sm:right-8 top-5 sm:top-7 flex items-center gap-2">
              <span>24P · T2.8</span>
              <svg viewBox="0 0 26 12" width="22" height="10" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="1" y="1" width="20" height="10" rx="2" />
                <rect x="3" y="3" width="13" height="6" fill="currentColor" stroke="none" />
                <path d="M23 4v4" />
              </svg>
            </div>
            <div className="vf-text absolute left-6 sm:left-8 bottom-5 sm:bottom-7 tabular-nums">
              {director && <Timecode />}
            </div>
            <div className="vf-text absolute inset-x-0 top-5 sm:top-7 hidden sm:block text-center">DIRECTOR&apos;S VIEW</div>
            {focusPt && director && (
              <span key={focusPt.key} className="vf-focus" style={{ left: focusPt.x, top: focusPt.y }} />
            )}
            </div>
          </div>

          {/* Subtitle on/off feedback */}
          {ccToast && (!ccOn || !cueText) && (
            <div role="status" className="absolute inset-x-0 bottom-8 sm:bottom-10 z-[19] flex justify-center px-3 pointer-events-none">
              <span className="rounded-full border border-white/20 bg-black/80 px-3 py-1 text-xs font-semibold text-white">{ccToast}</span>
            </div>
          )}

          {/* Subtitles */}
          {ccOn && cueText && (
            <div className="absolute inset-x-0 bottom-8 sm:bottom-10 z-[19] flex justify-center px-3 pointer-events-none">
              <span className="caption-text max-w-[92%] sm:max-w-[80%] whitespace-pre-line rounded-md px-3 py-1.5 text-center text-[13px] sm:text-xl font-semibold leading-snug">
                {cueText}
              </span>
            </div>
          )}

          {/* Status + time */}
          <div className="absolute top-2 sm:top-3 inset-x-2 sm:inset-x-3 z-20 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 bg-black/75 backdrop-blur-md px-3 py-1 rounded-full border border-white/15 transition-opacity duration-300 ${
                director ? 'opacity-0' : 'opacity-100'
              }`}>
              <span className="relative flex w-2 h-2">
                {isPlaying && <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping motion-reduce:animate-none" />}
                <span className={`relative w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              </span>
              <span className="text-[10px] font-mono tracking-widest uppercase text-slate-100">
                {leader !== null ? 'Cueing' : isPlaying ? 'Projecting' : 'Standby'}
              </span>
            </div>

            {roomId && (
              <div
                className={`flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-black/75 px-2.5 py-1 backdrop-blur-md transition-opacity duration-300 ${
                  director ? 'opacity-0' : 'opacity-100'
                }`}
              >
                <UsersIcon size={12} />
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-200">Room: {roomId}</span>
              </div>
            )}
            </div>
            <div className="hidden md:block bg-black/75 backdrop-blur-md px-3 py-1 rounded-full border border-white/15 font-mono text-xs text-amber-300 tracking-wider">
              {fmt(currentTime)}
            </div>

          </div>

          {/* Watermark */}
          <div
            className={`absolute bottom-2 sm:bottom-3 right-2 sm:right-3 z-20 pointer-events-none select-none text-[10px] sm:text-[11px] font-semibold tracking-wide text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] transition-opacity duration-700 ${
              !curtainOpen || director ? 'opacity-0' : isPlaying ? 'opacity-25' : 'opacity-90'
            }`}
          >
            Cinema UI • By Murokore
          </div>

          {/* Scene contact sheet */}
          {sheetOpen && (
            <div
              role="dialog"
              aria-label="Scenes tape shelf"
              className="shelf-sheet absolute inset-0 z-30 overflow-y-auto backdrop-blur-md p-3 sm:p-5 animate-[fadeIn_.25s_ease]"
            >
              <div className="sticky top-0 z-10 -mx-4 -mt-4 mb-3 flex items-center justify-between gap-2 bg-[#0c0907]/95 px-4 pt-4 pb-2 backdrop-blur md:-mx-5 md:-mt-5 md:px-5 md:pt-5">
                <span className="text-xs font-semibold tracking-wide text-amber-300">Tape shelf · pick a scene</span>
                <div className="flex items-center gap-2">
                  <div role="group" aria-label="View" className="flex overflow-hidden rounded-lg border border-white/20">
                    <button
                      type="button"
                      aria-pressed={shelfView === 'grid'}
                      aria-label="Grid view"
                      onClick={() => setShelfView('grid')}
                      className={`flex min-h-11 min-w-11 items-center justify-center ${
                        shelfView === 'grid' ? 'bg-amber-500/25 text-amber-200' : 'text-slate-200 hover:bg-white/10'
                      }`}
                    >
                      <GridIcon />
                    </button>
                    <button
                      type="button"
                      aria-pressed={shelfView === 'list'}
                      aria-label="List view"
                      onClick={() => setShelfView('list')}
                      className={`flex min-h-11 min-w-11 items-center justify-center border-l border-white/20 ${
                        shelfView === 'list' ? 'bg-amber-500/25 text-amber-200' : 'text-slate-200 hover:bg-white/10'
                      }`}
                    >
                      <ListIcon />
                    </button>
                  </div>
                  <button
                    type="button"
                    autoFocus
                    onClick={closeSheet}
                    className="min-h-11 px-4 rounded-lg border border-white/20 text-xs text-slate-100 hover:bg-white/10"
                  >
                    Close
                  </button>
                </div>
              </div>
              {shelfView === 'grid' ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-x-3 sm:gap-x-4">
                {scenes.map((sc, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Scene ${i + 1} at ${fmt(sc.t)}`}
                    onClick={() => {
                      store.seek?.(sc.t);
                      closeSheet();
                    }}
                    className="tape-cell relative pb-4 text-left touch-manipulation"
                  >
                    <div className={`tape ${i === sceneIdx ? 'tape-active' : ''}`}>
                      <div className="tape-label">
                        <span>SCENE {String(i + 1).padStart(2, '0')}</span>
                        <span>{fmt(sc.t)}</span>
                      </div>
                      <div className="tape-window" style={{ aspectRatio: ar, ...(sc.fr ? sprite(sc.fr.f, sc.fr.s) : {}) }} />
                      <div className="tape-reels" aria-hidden="true">
                        <i />
                        <i />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              ) : (
              <ol className="chapter-list" aria-label="Chapters">
                {scenes.map((sc, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      aria-current={i === sceneIdx ? 'true' : undefined}
                      onClick={() => {
                        store.seek?.(sc.t);
                        closeSheet();
                      }}
                      className={`chapter-row ${i === sceneIdx ? 'is-current' : ''}`}
                    >
                      <span className="chapter-no">{String(i + 1).padStart(2, '0')}</span>
                      <span className="chapter-title">Scene {i + 1}</span>
                      <span className="chapter-time">{fmt(sc.t)}</span>
                    </button>
                  </li>
                ))}
              </ol>
              )}
            </div>
          )}

          {/* Playback errors */}
          <ErrorDialog.Root>
            <ErrorDialog.Popup className="cinema-error">
              <ErrorDialog.Title />
              <ErrorDialog.Description />
              <ErrorDialog.Close />
            </ErrorDialog.Popup>
          </ErrorDialog.Root>
        </div>

        {/* ============ PROJECTOR DECK ============ */}
        <div ref={deckRef} className="deck relative bg-gradient-to-b from-slate-900 to-[#070a12] border-t border-white/15 p-3 md:p-4">
          {/* Filmstrip scrubber — a real v10 TimeSlider */}
          <div className="flex items-center gap-3">
            <ProjectorLamp on={isPlaying} variant="bar" />
            <span className="hidden sm:block w-12 text-right font-mono text-[11px] text-amber-300 tabular-nums">
              {fmt(currentTime)}
            </span>

            <div
              ref={seekWrapRef}
              className="relative flex-1 min-w-0"
            >
              <TimeSlider.Root className="film-slider">
                <div className="sprockets" />
                <TimeSlider.Track className="film-track" style={{ height: tileH }}>
                  <FilmTiles strip={strip} tileW={tileW} />
                  <div className="film-dim" />
                </TimeSlider.Track>
                <div className="sprockets" />
                <TimeSlider.Thumb className="film-gate" />
              </TimeSlider.Root>

              {/* Smart preview: ONE frame cropped from the sprite sheet (owns its own state) */}
              <StripPreview wrapRef={seekWrapRef} duration={duration} getFrame={getFrame} />
            </div>

            <span className="hidden sm:block w-12 font-mono text-[11px] text-slate-400 tabular-nums">{fmt(duration)}</span>
            <JogKnob variant="bar" timeRef={timeRef} duration={duration} noBurn={noBurn} />
          </div>


          {/* Hardware controls: LEFT = transport + sound, RIGHT = room + settings */}
          <div className="mt-3 md:mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <div className="flex flex-1 sm:flex-none items-center gap-2 sm:gap-3 min-w-0">
              <ProjectorLamp on={isPlaying} />
              <div
                className={`reel hidden md:flex w-9 h-9 flex-none rounded-full border-2 border-amber-500/40 bg-black items-center justify-center shadow-inner ${
                  isPlaying ? 'is-playing' : ''
                }`}
                aria-hidden="true"
              >
                <svg viewBox="0 0 36 36" width="32" height="32">
                  {REEL.map((c, i) => (
                    <circle key={i} cx={c.cx} cy={c.cy} r="3" fill="#0b0f1c" stroke="rgba(245,158,11,0.4)" />
                  ))}
                  <circle cx="18" cy="18" r="3.5" fill="#fbbf24" />
                </svg>
              </div>

              <PlayButton
                render={(props: any, state: any) => (
                  <button
                    {...props}
                    data-tip={state.paused ? 'Play (Space)' : 'Pause (Space)'}
                    className="inline-flex flex-none items-center justify-center gap-2 min-h-11 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)] active:scale-95 touch-manipulation"
                  >
                    {state.paused ? <PlayIcon /> : <PauseIcon />}
                    {state.paused ? 'Project' : 'Pause'}
                  </button>
                )}
              />

              <span className="md:hidden flex-1 min-w-0 truncate font-mono text-xs tabular-nums text-slate-100">
                {fmt(currentTime)} <span className="text-slate-400">/ {fmt(duration)}</span>
              </span>

              <MuteButton
                render={(props: any, state: any) => (
                  <button
                    {...props}
                    data-tip={state.muted ? 'Unmute (M)' : 'Mute (M)'}
                    className={`${deckBtn} hidden md:inline-flex ${deckBtnIdle}`}
                  >
                    {state.muted ? '🔇' : '🔊'}
                    <span className="hidden sm:inline">{state.muted ? 'MUTED' : 'AUDIO'}</span>
                  </button>
                )}
              />

              <div className={`deck-vol relative flex items-center ${volToast !== null ? 'tip-off' : ''}`} data-tip="Volume (↑ ↓)">
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volValue}
                  aria-label="Volume"
                  onChange={(e) => setVolumeTo(parseFloat(e.target.value))}
                  className="deck-range w-24"
                  style={{ ['--fill' as any]: `${volValue * 100}%` }}
                />
                <div
                  aria-hidden="true"
                  className={`absolute bottom-full mb-3 -translate-x-1/2 pointer-events-none bg-black/90 text-white text-[11px] font-bold px-2 py-1 rounded-md border border-white/20 tabular-nums transition-opacity duration-200 ${
                    volToast !== null ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{ left: `calc(${volValue * 100}% + ${(0.5 - volValue) * 14}px)` }}
                >
                  {volToast ?? Math.round(volValue * 100)}%
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <JogKnob timeRef={timeRef} duration={duration} noBurn={noBurn} />

              <button
                type="button"
                onClick={() => setCcOn((c) => !c)}
                aria-pressed={ccOn}
                aria-label={ccOn ? 'Turn subtitles off' : 'Turn subtitles on'}
                data-tip={ccOn ? 'Turn subtitles off' : 'Turn subtitles on'}
                className={`${deckBtn} hidden md:inline-flex ${ccOn ? deckBtnOn : deckBtnIdle}`}
              >
                <span className="font-black tracking-tight">CC</span>
              </button>

              <button
                type="button"
                onClick={() => setScope((s) => !s)}
                aria-pressed={scope}
                data-tip={scope ? 'Switch to 16:9 flat' : 'Switch to 21:9 scope'}
                className={`${deckBtn} hidden md:inline-flex ${scope ? 'bg-blue-500/20 text-blue-200 border-blue-400/60' : deckBtnIdle}`}
              >
                {scope ? '21:9 SCOPE' : '16:9 FLAT'}
              </button>

              <button
                type="button"
                onClick={() => setLightsOff(!lightsOff)}
                aria-pressed={lightsOff}
                aria-label={lightsOff ? 'Lights on' : 'Lights off'}
                data-tip={lightsOff ? 'Lights on' : 'Lights off'}
                className={`${deckBtn} hidden md:inline-flex ${lightsOff ? deckBtnOn : deckBtnIdle}`}
              >
                {lightsOff ? '💡' : '🌑'}
                <span>{lightsOff ? 'LIGHTS' : 'DARK'}</span>
              </button>

              <button
                ref={gearBtnRef}
                type="button"
                onClick={() => (panel === 'open' ? closePanel() : setPanel('open'))}
                aria-haspopup="dialog"
                aria-expanded={panel === 'open'}
                aria-label="Projector settings"
                data-tip="Settings"
                className={`${deckBtn} ${panel === 'open' ? deckBtnOn : deckBtnIdle}`}
              >
                <GearIcon />
                <span className="md:hidden text-xs font-bold">More</span>
                {rate !== 1 && (
                  <span className="rounded bg-amber-500 px-1 text-[10px] font-bold text-black tabular-nums">{rate}×</span>
                )}
              </button>

              <FullscreenButton
                render={(props: any, state: any) => (
                  <button
                    {...props}
                    data-action="fullscreen"
                    data-tip={state.fullscreen ? 'Exit fullscreen (F)' : 'Fullscreen (F)'}
                    data-tip-align="end"
                    className={`${deckBtn} ${deckBtnIdle}`}
                  >
                    {state.fullscreen ? <ExitFsIcon /> : <EnterFsIcon />}
                  </button>
                )}
              />
            </div>
          </div>
        </div>

        {toast && (
          <div role="status" className="absolute top-4 inset-x-0 z-[60] flex justify-center px-4 pointer-events-none">
            <span className="toast-pop max-w-[90%] rounded-xl border border-white/20 bg-black/90 px-4 py-2 text-center text-sm font-semibold text-white shadow-2xl">
              {toast}
            </span>
          </div>
        )}

        {/* ============ PROJECTOR CONTROL PANEL (glass sheet) ============ */}
        {panel !== 'closed' && (
          <div className="absolute inset-0 z-50" style={{ ['--deck-h' as any]: `${deckH}px` }}>
            <div className="panel-scrim absolute inset-0 bg-black/55 backdrop-blur-[2px]" data-state={panel} onClick={closePanel} />
            <div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label={`${t.kicker} · ${t.title}`}
              lang={lang}
              data-state={panel}
              onKeyDown={trapTab}
              className="projector-panel absolute inset-x-0 bottom-0 sm:inset-x-auto sm:right-3 sm:bottom-[calc(var(--deck-h)+12px)] sm:w-[360px] max-h-[88%] sm:max-h-[calc(100%_-_var(--deck-h)_-_24px)] panel-scroll overflow-y-auto overflow-x-hidden rounded-t-3xl sm:rounded-2xl border border-white/15 bg-slate-950/70 backdrop-blur-2xl shadow-[0_-24px_70px_rgba(0,0,0,0.65)]"
            >
              <span aria-hidden="true" className="panel-scan" />

              <div className="panel-head sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-white/10 bg-slate-950/90 px-4 py-3 backdrop-blur-xl sm:px-5">
                <div className="flex items-center gap-3">
                  <svg viewBox="0 0 36 36" width="28" height="28" className={`reel ${isPlaying ? 'is-playing' : ''}`} aria-hidden="true">
                    <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(245,158,11,0.5)" strokeWidth="2" />
                    {REEL.map((c, i) => (
                      <circle key={i} cx={c.cx} cy={c.cy} r="3" fill="#0b0f1c" stroke="rgba(245,158,11,0.5)" />
                    ))}
                    <circle cx="18" cy="18" r="3.5" fill="#fbbf24" />
                  </svg>
                  <div>
                    <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-amber-300">{t.kicker}</p>
                    <h2 className="text-sm font-bold tracking-wide text-white">{t.title}</h2>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closePanel}
                  aria-label={t.closeAria}
                  className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-white/5 px-3 text-slate-100 hover:bg-white/15"
                >
                  <span aria-hidden="true">✕</span>
                  <span className="hidden sm:inline text-xs font-semibold">{t.close}</span>
                </button>
              </div>

              <div className="p-4 sm:p-5">
              {/* Language */}
              <div className="panel-item mb-4" style={{ ['--d' as any]: '60ms' }}>
                <label htmlFor="cinema-lang" className="mb-2 block text-[10px] font-mono tracking-[0.25em] uppercase text-slate-400">
                  🌐 {t.language}
                </label>
                <select
                  id="cinema-lang"
                  value={lang}
                  onChange={(e) => changeLang(e.target.value as Lang)}
                  className="lang-select"
                >
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                  <option value="rw">Kinyarwanda</option>
                </select>
              </div>

              {/* Sound (phones: the bar stays minimal) */}
              <div className="panel-item mb-4 md:hidden" style={{ ['--d' as any]: '75ms' }}>
                <p className="mb-2 text-[10px] font-mono tracking-[0.25em] uppercase text-slate-400">{t.sound}</p>
                <MuteButton
                  render={(props: any, state: any) => (
                    <button
                      {...props}
                      className="flex min-h-11 w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 text-sm font-semibold text-white"
                    >
                      <span>{state.muted ? `🔇 ${t.muted}` : `🔊 ${t.soundOn}`}</span>
                      <span className={`relative h-6 w-11 rounded-full transition-colors ${state.muted ? 'bg-white/20' : 'bg-amber-500'}`}>
                        <span
                          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-300 ${
                            state.muted ? 'left-0.5' : 'left-[22px]'
                          }`}
                        />
                      </span>
                    </button>
                  )}
                />
              </div>

              {/* Film speed */}
              <div className="panel-item mb-4" style={{ ['--d' as any]: '110ms' }}>
                <p className="mb-2 text-[10px] font-mono tracking-[0.25em] uppercase text-slate-400">{t.filmSpeed}</p>
                <div role="radiogroup" aria-label={t.filmSpeed} className="relative grid grid-cols-4 rounded-xl border border-white/10 bg-black/40 p-1">
                  <span
                    aria-hidden="true"
                    className={`absolute top-1 bottom-1 left-1 w-[calc((100%-0.5rem)/4)] rounded-lg bg-amber-500 shadow-[0_0_18px_rgba(245,158,11,0.55)] transition-transform duration-300 ease-[cubic-bezier(.34,1.56,.64,1)] ${
                      RATES.includes(rate) ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{ transform: `translateX(${Math.max(0, RATES.indexOf(rate)) * 100}%)` }}
                  />
                  {RATES.map((r) => (
                    <button
                      key={r}
                      type="button"
                      role="radio"
                      aria-checked={r === rate}
                      data-autofocus={r === rate || (!RATES.includes(rate) && r === 1) ? true : undefined}
                      onClick={() => store.setPlaybackRate?.(r)}
                      className={`relative z-10 min-h-11 rounded-lg text-sm font-bold tabular-nums transition-colors ${
                        r === rate ? 'text-black' : 'text-slate-200 hover:text-white'
                      }`}
                    >
                      {r}×
                    </button>
                  ))}
                </div>
              </div>

              {/* Scenes */}
              <div className="panel-item mb-4" style={{ ['--d' as any]: '180ms' }}>
                <p className="mb-2 text-[10px] font-mono tracking-[0.25em] uppercase text-slate-400">{t.scenes}</p>
                <button
                  type="button"
                  onClick={() => {
                    closePanel();
                    setSheetOpen(true);
                  }}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-left transition-colors hover:bg-white/10"
                >
                  <span className="flex items-center justify-between text-sm font-semibold text-white">
                    <span className="flex items-center gap-2">
                      <GridIcon /> {t.tapeShelf}
                    </span>
                    <span aria-hidden="true" className="text-amber-300">
                      {t.open} ▸
                    </span>
                  </span>
                  <span className="mt-2 flex gap-1">
                    {scenes
                      .filter((_, i) => i % 2 === 0)
                      .slice(0, 6)
                      .map((sc, i) => (
                        <span
                          key={i}
                          className="block flex-1 rounded-[3px] bg-slate-900 ring-1 ring-white/10"
                          style={{ aspectRatio: ar, ...(sc.fr ? sprite(sc.fr.f, sc.fr.s) : {}) }}
                        />
                      ))}
                  </span>
                </button>
              </div>

              {/* Subtitles */}
              <div className="panel-item mb-4" style={{ ['--d' as any]: '215ms' }}>
                <p className="mb-2 text-[10px] font-mono tracking-[0.25em] uppercase text-slate-400">{t.subtitles}</p>
                <button
                  type="button"
                  role="switch"
                  aria-checked={ccOn}
                  onClick={() => setCcOn((c) => !c)}
                  className="flex min-h-11 w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 text-sm font-semibold text-white"
                >
                  <span className="flex items-center gap-2">
                    <span className="rounded border border-white/50 px-1 text-[10px] font-black">CC</span>
                    {ccOn ? t.captionsOn : t.captionsOff}
                  </span>
                  <span className={`relative h-6 w-11 rounded-full transition-colors ${ccOn ? 'bg-amber-500' : 'bg-white/20'}`}>
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-300 ${
                        ccOn ? 'left-[22px]' : 'left-0.5'
                      }`}
                    />
                  </span>
                </button>
              </div>

              {/* Picture-in-picture (renders nothing where the browser can't do it) */}
              <div className="panel-item mb-4 empty:hidden" style={{ ['--d' as any]: '235ms' }}>
                <PiPButton
                  render={(props: any) => (
                    <button
                      {...props}
                      className="flex min-h-11 w-full items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                    >
                      <PipIcon /> {t.pip}
                    </button>
                  )}
                />
              </div>

              {/* Director's view */}
              <div className="panel-item mb-4" style={{ ['--d' as any]: '255ms' }}>
                <p className="mb-2 text-[10px] font-mono tracking-[0.25em] uppercase text-slate-400">{t.director}</p>
                <button
                  type="button"
                  role="switch"
                  aria-checked={director}
                  onClick={() => setDirector((d) => !d)}
                  className="flex min-h-11 w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 text-left text-sm font-semibold text-white"
                >
                  <span>
                    🎥 {t.directorView}
                    <span className="block text-[11px] font-normal text-slate-400">{t.directorHint}</span>
                  </span>
                  <span className={`relative h-6 w-11 flex-none rounded-full transition-colors ${director ? 'bg-amber-500' : 'bg-white/20'}`}>
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-300 ${
                        director ? 'left-[22px]' : 'left-0.5'
                      }`}
                    />
                  </span>
                </button>
              </div>

              {/* Watch together (a UI-only room link) */}
              <div className="panel-item mb-4" style={{ ['--d' as any]: '285ms' }}>
                <button
                  type="button"
                  onClick={copyRoomLink}
                  className="flex min-h-11 w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  <UsersIcon />
                  <span>
                    {t.watch}
                    <span className="block text-[11px] font-normal text-slate-400">{t.watchHint}</span>
                  </span>
                </button>
              </div>

              {/* Room (phones only: on desktop these live in the deck) */}
              <div className="panel-item md:hidden" style={{ ['--d' as any]: '250ms' }}>
                <p className="mb-2 text-[10px] font-mono tracking-[0.25em] uppercase text-slate-400">{t.room}</p>
                <button
                  type="button"
                  role="switch"
                  aria-checked={lightsOff}
                  onClick={() => setLightsOff(!lightsOff)}
                  className="mb-2 flex min-h-11 w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 text-sm font-semibold text-white"
                >
                  <span>{lightsOff ? `🌑 ${t.lightsOff}` : `💡 ${t.lightsOn}`}</span>
                  <span className={`relative h-6 w-11 rounded-full transition-colors ${lightsOff ? 'bg-amber-500' : 'bg-white/20'}`}>
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-300 ${
                        lightsOff ? 'left-[22px]' : 'left-0.5'
                      }`}
                    />
                  </span>
                </button>
                <div role="radiogroup" aria-label="Aspect ratio" className="grid grid-cols-2 gap-1 rounded-xl border border-white/10 bg-black/40 p-1">
                  {[
                    { k: false, label: '16:9 FLAT' },
                    { k: true, label: '21:9 SCOPE' },
                  ].map((o) => (
                    <button
                      key={o.label}
                      type="button"
                      role="radio"
                      aria-checked={scope === o.k}
                      onClick={() => setScope(o.k)}
                      className={`min-h-11 rounded-lg text-xs font-bold tracking-wide transition-colors ${
                        scope === o.k ? 'bg-blue-500/30 text-blue-100' : 'text-slate-200 hover:bg-white/10'
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  closePanel();
                  goHome();
                }}
                className="panel-item mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-amber-400/40 bg-amber-500/10 px-3 text-sm font-bold text-amber-200 transition-colors hover:bg-amber-500/20"
                style={{ ['--d' as any]: '330ms' }}
              >
                ⌂ {t.home}
              </button>

              <p className="panel-item mt-4 hidden sm:block font-mono text-[10px] text-slate-400" style={{ ['--d' as any]: '300ms' }}>
                {t.shortcuts}
              </p>
              </div>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}

/* =====================================================================
   Page
   ===================================================================== */
export default function Home() {
  const [lightsOff, setLightsOff] = useState(false);

  return (
    <main className="min-h-screen w-full bg-[#050816] bg-[radial-gradient(ellipse_at_top,#14123a_0%,#050816_65%)] text-white px-3 py-8 md:py-16">
      {lightsOff && (
        <div
          onClick={() => setLightsOff(false)}
          aria-hidden="true"
          className="fixed inset-0 z-30 bg-black/95 backdrop-blur-xl cursor-pointer animate-[fadeIn_.6s_ease]"
        />
      )}

      <div className="mx-auto w-full max-w-4xl flex flex-col gap-6 md:gap-8">
        <div className={`text-center transition-opacity duration-500 ${lightsOff ? 'opacity-0' : 'opacity-100'}`}>
          <span className="inline-block mb-4 px-4 py-1.5 rounded-full border border-blue-400/40 bg-blue-500/10 text-blue-200 text-[11px] font-semibold tracking-wider uppercase">
            ⚡ Video.js v10 Skin
          </span>
          <h1 className="text-4xl md:text-6xl font-black mb-3 tracking-tight leading-tight">
            Next-Gen{' '}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
              Cinema UI
            </span>
          </h1>
          <p className="text-slate-300 text-sm md:text-lg max-w-2xl mx-auto leading-relaxed">
            The seek bar is the film itself: real frames from the Mux storyboard, lit by a projector that matches the
            scene.
          </p>
        </div>

        <Player>
          <Cinema lightsOff={lightsOff} setLightsOff={setLightsOff} />
        </Player>

        <div className={`flex flex-col items-center gap-4 transition-opacity duration-500 ${lightsOff ? 'opacity-0' : 'opacity-100'}`}>
          <p className="hidden md:block text-[11px] text-slate-400 text-center font-mono">
            Space play · ←/→ 10s · ↑/↓ volume · M mute · C scenes · V director · H home · F fullscreen
          </p>
          <p className="text-[10px] md:text-xs text-slate-400 text-center">
            Powered by <span className="text-blue-300 font-bold">Mux</span> &amp;{' '}
            <span className="text-emerald-300 font-bold">Video.js v10</span>
            <br />
            Designed &amp; engineered by{' '}
            <span className="text-white font-bold tracking-wider">Murokore Pierrot</span>
          </p>
        </div>
      </div>
    </main>
  );
}

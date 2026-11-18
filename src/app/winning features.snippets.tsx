'use client';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { chaptersTrack, createPlayer, useActiveTextCues, useTextCues } from '@videojs/react';
import { videoFeatures } from '@videojs/react/video';

const { usePlayer } = createPlayer({ features: videoFeatures });

/* ---------- FEATURE 4: real v10 chapters ---------- */
const CHAPTERS = [
  { startTime: 0, endTime: 18, text: 'The castle' },
  { startTime: 18, endTime: 41, text: 'The loch' },
  { startTime: 41, endTime: 66, text: 'The village' },
  { startTime: 66, endTime: 93, text: 'The coast' },
];

export function useRegisterChapters() {
  const store = usePlayer();
  useEffect(() => {
    const handle = store.addTextTrack({ kind: 'chapters', label: 'Chapters', cues: CHAPTERS });
    return () => handle.remove();
  }, [store]);
}

export function ChapterMarks({ duration }: { duration: number }) {
  const cues = useTextCues(chaptersTrack);
  if (!duration) return null;
  return (
    <>
      {cues.map((c) => (
        <i key={c.id} className="chapter-mark" style={{ left: `${(c.startTime / duration) * 100}%` }} />
      ))}
    </>
  );
}

export function ChapterTitle() {
  const active = useActiveTextCues(chaptersTrack);
  return <span>{active[0]?.text ?? ''}</span>;
}

/* ---------- FEATURE 3: detents (haptics + click) ---------- */
export function useDetents(boundaries: number[], enabled: boolean) {
  const sec = usePlayer((s) => Math.floor(s.currentTime));
  const last = useRef(sec);
  const ctx = useRef<AudioContext | null>(null);
  useEffect(() => {
    if (!enabled) { last.current = sec; return; }
    const crossed = boundaries.some((b) => (last.current < b) !== (sec < b) && Math.abs(sec - last.current) <= 2);
    last.current = sec;
    if (!crossed) return;
    navigator.vibrate?.(8);
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    ctx.current ??= new AC();
    const a = ctx.current, o = a.createOscillator(), g = a.createGain();
    o.type = 'square'; o.frequency.value = 1800;
    g.gain.setValueAtTime(0.04, a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + 0.025);
    o.connect(g).connect(a.destination); o.start(); o.stop(a.currentTime + 0.03);
  }, [sec, boundaries, enabled]);
}

/* ---------- FEATURE 5: Media Session ---------- */
export function useMediaSession(title: string, poster: string) {
  const store = usePlayer();
  const paused = usePlayer((s) => s.paused);
  const duration = usePlayer((s) => s.duration);
  const sec = usePlayer((s) => Math.floor(s.currentTime));
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({ title, artist: 'Cinema UI', artwork: [{ src: poster, sizes: '640x360', type: 'image/jpeg' }] });
    const set = (a: MediaSessionAction, h: MediaSessionActionHandler) => { try { navigator.mediaSession.setActionHandler(a, h); } catch {} };
    set('play', () => store.play());
    set('pause', () => store.pause());
    set('seekbackward', () => store.seek(Math.max(0, sec - 10)));
    set('seekforward', () => store.seek(Math.min(duration, sec + 10)));
    set('seekto', (d) => d.seekTime != null && store.seek(d.seekTime));
  }, [store, title, poster, sec, duration]);
  useEffect(() => { navigator.mediaSession.playbackState = paused ? 'paused' : 'playing'; }, [paused]);
  useEffect(() => {
    if (Number.isFinite(duration) && duration > 0) {
      try { navigator.mediaSession.setPositionState({ duration, position: Math.min(sec, duration) }); } catch {}
    }
  }, [sec, duration]);
}

/* ---------- FEATURE 1: film stock selector (picture grading; CSS filters, no pixel reads, no CORS needed) ---------- */
export type Stock = 'neutral' | 'noir' | 'sepia' | 'technicolor' | 'faded';
export const STOCKS: { id: Stock; label: string }[] = [
  { id: 'neutral', label: 'Neutral' },
  { id: 'noir', label: 'Noir' },
  { id: 'sepia', label: 'Sepia' },
  { id: 'technicolor', label: 'Technicolor' },
  { id: 'faded', label: 'Faded' },
];

/** Use inside the settings panel. Apply the choice with data-stock={stock} on the element that has className="cinema-screen". */
export function StockPicker({ value, onChange, label }: { value: Stock; onChange: (s: Stock) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="stock-switch">
      {STOCKS.map((s) => (
        <button key={s.id} type="button" role="radio" aria-checked={s.id === value} onClick={() => onChange(s.id)} className="stock-opt">
          {s.label}
        </button>
      ))}
    </div>
  );
}

/* ---------- FEATURE 2: tilt-reactive plastic (gyroscope on phones, pointer on desktop) ---------- */
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

export function useTiltLight(root: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const set = (x: number, y: number) => {
      el.style.setProperty('--lx', `${(x * 100).toFixed(1)}%`);
      el.style.setProperty('--ly', `${(y * 100).toFixed(1)}%`);
    };
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      const r = el.getBoundingClientRect();
      set(clamp01((e.clientX - r.left) / r.width), clamp01((e.clientY - r.top) / r.height));
    };
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      set(clamp01(0.5 + e.gamma / 60), clamp01(0.5 + (e.beta - 45) / 60));
    };
    window.addEventListener('pointermove', onPointer);
    window.addEventListener('deviceorientation', onTilt);
    return () => {
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('deviceorientation', onTilt);
    };
  }, [root]);
}

/** iOS only reports orientation after a permission prompt, which must come from a tap (call it from the first Play press). */
export async function enableTilt() {
  const D = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
  if (typeof D.requestPermission === 'function') {
    try {
      await D.requestPermission();
    } catch {
      /* declined: pointer light still works on desktop */
    }
  }
}

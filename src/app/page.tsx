'use client';

import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import '@videojs/http-streaming';

export default function Home() {
  const videoRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<any>(null);

  const videoUrl = "https://stream.mux.com/INbHjTltgmGfualPb7c1U9SUC1OWyjyEwtTqzMZd3zY.m3u8";
  const posterUrl = "https://image.mux.com/INbHjTltgmGfualPb7c1U9SUC1OWyjyEwtTqzMZd3zY/thumbnail.jpg";

  useEffect(() => {
    if (!playerRef.current) {
      const videoElement = document.createElement("video-js");
      videoElement.classList.add(
        'vjs-big-play-centered', 
        'w-full', 
        'h-full', 
        'rounded-2xl', 
        'overflow-hidden'
      );
      
      if (videoRef.current) {
        videoRef.current.appendChild(videoElement);
      }

      // HANO: Gukoresha "any" kuri options kugira ngo TypeScript ireke kwitotomba
      const player: any = playerRef.current = videojs(videoElement, {
        controls: true,
        autoplay: false,
        preload: 'auto',
        sources: [{ src: videoUrl, type: 'application/x-mpegURL' }],
        playbackRates: [0.5, 1, 1.5, 2],
        poster: posterUrl,
        userActions: {
          hotkeys: true
        },
        controlBar: {
          autohide: false
        },
        html5: {
          vhs: {
            overrideNative: true,
          },
        },
      });

      player.on('play', () => {
        player.focus();
      });

      const handleKeyDown = (e: KeyboardEvent) => {
        if (player.paused()) return;

        switch (e.key) {
          case 'ArrowRight':
            e.preventDefault();
            player.currentTime(player.currentTime() + 5);
            break;
          case 'ArrowLeft':
            e.preventDefault();
            player.currentTime(player.currentTime() - 5);
            break;
          case 'ArrowUp':
            e.preventDefault();
            player.volume(Math.min(1, player.volume() + 0.1));
            break;
          case 'ArrowDown':
            e.preventDefault();
            player.volume(Math.max(0, player.volume() - 0.1));
            break;
          case ' ':
            e.preventDefault();
            if (player.paused()) player.play();
            else player.pause();
            break;
          case 'm':
            e.preventDefault();
            player.muted(!player.muted());
            break;
        }
      };

      window.addEventListener('keydown', handleKeyDown);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        if (playerRef.current) {
          playerRef.current.dispose();
          playerRef.current = null;
        }
      };
    }
  }, [videoUrl, posterUrl]);

  return (
    <main className="min-h-screen w-full bg-[#030712] relative overflow-hidden font-sans flex flex-col items-center pt-12 pb-12 px-4 md:px-8">
      
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none z-0" />

      <div className="relative z-10 w-full max-w-5xl flex flex-col items-center gap-6">
        
        <div className="text-center flex flex-col items-center">
          <span className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-4 shadow-lg">
            ⚡ Video.js v10 Premium Skin
          </span>
          
          <h1 className="text-3xl md:text-6xl font-black mb-3 tracking-tight text-white leading-tight">
            Next-Gen <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">Cinema UI</span>
          </h1>
          
          <p className="text-slate-400 text-xs md:text-lg max-w-2xl mx-auto leading-relaxed px-2">
            Experience the future of video players. Fully responsive, accessible, and engineered for the modern web.
          </p>
        </div>

        <div className="relative w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/40 backdrop-blur-xl shadow-2xl p-1 md:p-4">
          <div data-vjs-player className="w-full">
            <div ref={videoRef} className="w-full aspect-video rounded-xl overflow-hidden" />
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3 text-[10px] md:text-xs font-semibold text-slate-400">
          <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-sm">✓ Keyboard Accessible</span>
          <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-sm">✓ Mobile Responsive</span>
          <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-sm">✓ High Contrast</span>
        </div>

        <div className="text-center">
          <p className="text-[9px] md:text-[10px] font-medium text-slate-500">
            Sponsor Credit: Powered by <span className="text-blue-400 font-bold">Mux Infrastructure</span> & <span className="text-emerald-400 font-bold">Video.js v10 Engine</span>
          </p>
        </div>

      </div>
    </main>
  );
}
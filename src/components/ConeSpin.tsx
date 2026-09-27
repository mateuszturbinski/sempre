"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

/**
 * Lód w hero obracający się o 360° wraz ze scrollem (sekwencja klatek na <canvas>).
 * Klatki: public/cone-v3/NNN.webp + manifest.json (generuje scripts/make_cone_frames.py z wideo).
 * Nowa wersja klatek = nowy katalog (cone-v3…) i zmiana FRAMES_DIR — inaczej cache przeglądarek/next/image.
 * Obraz startowy = klatka 000 (ten sam lód co w obrocie — bez przeskoku po doładowaniu).
 * Bez manifestu / przy reduced-motion zostaje sam obraz startowy.
 */
type Manifest = { count: number; width: number; height: number; ext: string };

const FRAMES_DIR = "/cone-v3";

/** Ile px scrolla (w skali płótna 1440) przypada na pełny obrót. */
const SPIN_RANGE = 1100;

export function ConeSpin({ className, style }: { className: string; style: CSSProperties }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cancelled = false;
    let raf = 0;
    const frames: HTMLImageElement[] = [];
    let last = -1;

    const draw = () => {
      raf = 0;
      const canvas = canvasRef.current;
      if (!canvas || !frames.length) return;
      const z = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--z")) || 1;
      const scale = innerWidth >= 1024 ? z : innerWidth / 1440;
      const p = (window.scrollY / (SPIN_RANGE * scale)) % 1;
      // Najbliższa już wczytana klatka (podczas doładowywania obrót jest po prostu rzadszy).
      let idx = Math.round(p * frames.length) % frames.length;
      for (let k = 0; k < frames.length && !frames[idx].complete; k++) idx = (idx + frames.length - 1) % frames.length;
      if (idx === last || !frames[idx].complete) return;
      last = idx;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(frames[idx], 0, 0, canvas.width, canvas.height);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(draw);
    };

    fetch(`${FRAMES_DIR}/manifest.json`)
      .then((r) => (r.ok ? (r.json() as Promise<Manifest>) : null))
      .then((m) => {
        if (!m || cancelled || !canvasRef.current) return;
        const canvas = canvasRef.current;
        canvas.width = m.width;
        canvas.height = m.height;
        for (let i = 0; i < m.count; i++) {
          const img = new window.Image();
          img.decoding = "async";
          img.src = `${FRAMES_DIR}/${String(i).padStart(3, "0")}.${m.ext}`;
          if (i === 0) img.onload = () => !cancelled && (setReady(true), (last = -1), draw());
          else img.onload = onScroll;
          frames.push(img);
        }
        addEventListener("scroll", onScroll, { passive: true });
        addEventListener("resize", onScroll);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className={`${/\babsolute\b/.test(className) ? "" : "relative "}${className}`} style={style}>
      <Image
        src={`${FRAMES_DIR}/000.webp`}
        alt="Lody w waflu: mango, malina i pistacja"
        fill
        sizes="(min-width: 1024px) 432px, 70vw"
        preload
        className={`object-fill transition-opacity duration-300 ${ready ? "opacity-0" : ""}`}
      />
      <canvas
        ref={canvasRef}
        aria-hidden
        className={`absolute inset-0 size-full transition-opacity duration-300 ${ready ? "" : "opacity-0"}`}
      />
    </div>
  );
}

"use client";

import { Fragment, useEffect, useId, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

/**
 * Efekt „GLASS” z Figmy (liquid glass): tło pod elementem jest załamywane przy krawędziach (soczewka),
 * z lekką dyspersją kolorów (R/G/B przesuwane o różną siłę) i delikatnym zmatowieniem środka.
 *
 * Technika: mapa przesunięć (canvas → data URL) liczona z SDF zaokrąglonego prostokąta + filtr SVG
 * (feDisplacementMap ×3 kanały) podpięty pod `backdrop-filter: url(#…)`. Działa w przeglądarkach Chromium;
 * gdzie indziej zostaje klasyczne `.glass` (blur + biel 20%).
 */
type Props = {
  className?: string;
  style?: CSSProperties;
  /** Promień zaokrąglenia w px (jak w Figmie). */
  radius: number;
  /** Maks. przesunięcie tła na krawędzi (px). */
  strength?: number;
  /** Szerokość pasa załamania jako ułamek krótszego boku. */
  edge?: number;
  children?: ReactNode;
};

function displacementMap(w: number, h: number, r: number, edge: number): string {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  if (!ctx) return "";
  const img = ctx.createImageData(w, h);
  const band = Math.max(4, Math.min(w, h) * edge);
  const rr = Math.min(r, w / 2, h / 2);
  // SDF zaokrąglonego prostokąta (ujemne wewnątrz).
  const sdf = (x: number, y: number) => {
    const qx = Math.abs(x - w / 2) - (w / 2 - rr);
    const qy = Math.abs(y - h / 2) - (h / 2 - rr);
    return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - rr;
  };
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const px = x + 0.5;
      const py = y + 0.5;
      const d = -sdf(px, py); // odległość od krawędzi (wewnątrz > 0)
      let dx = 0;
      let dy = 0;
      if (d < band) {
        // normalna na zewnątrz (gradient SDF), próbkujemy tło bardziej ze środka → efekt soczewki
        const gx = sdf(px + 1, py) - sdf(px - 1, py);
        const gy = sdf(px, py + 1) - sdf(px, py - 1);
        const len = Math.hypot(gx, gy) || 1;
        const t = 1 - Math.max(0, d) / band;
        const m = t * t * (3 - 2 * t); // smoothstep
        dx = (-gx / len) * m;
        dy = (-gy / len) * m;
      }
      const i = (y * w + x) * 4;
      img.data[i] = Math.round(128 + dx * 127);
      img.data[i + 1] = Math.round(128 + dy * 127);
      img.data[i + 2] = 128;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c.toDataURL();
}

export function LiquidGlass({ className = "", style, radius, strength = 18, edge = 0.22, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const id = `lg${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const [map, setMap] = useState<{ url: string; w: number; h: number } | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const brands = (navigator as Navigator & { userAgentData?: { brands: { brand: string }[] } }).userAgentData?.brands;
    const chromium = !!brands?.some((b) => /Chromium|Google Chrome|Microsoft Edge/.test(b.brand));
    if (!chromium || matchMedia("(prefers-reduced-transparency: reduce)").matches) return;
    const build = () => {
      const w = Math.round(el.offsetWidth);
      const h = Math.round(el.offsetHeight);
      if (w < 4 || h < 4) return;
      const url = displacementMap(w, h, radius, edge);
      // Włączamy filtr dopiero po zdekodowaniu mapy — inaczej pierwsza klatka bywa pusta.
      const img = new Image();
      img.src = url;
      img
        .decode()
        .catch(() => {})
        .then(() => setMap({ url, w, h }));
    };
    build();
    const ro = new ResizeObserver(build);
    ro.observe(el);
    return () => ro.disconnect();
  }, [radius, edge]);

  // Chrome nie przelicza filtra SVG w backdrop-filter, gdy pod szkłem doczyta się obraz/klatka —
  // „szturchamy” filtr (minimalna zmiana wartości) po załadowaniu obrazów rodzica i kilka razy po starcie.
  const [nudge, setNudge] = useState(0);
  useEffect(() => {
    if (!map) return;
    const parent = ref.current?.parentElement;
    const bump = () => setNudge((n) => n + 1);
    const imgs = parent ? [...parent.querySelectorAll("img")] : [];
    imgs.forEach((i) => i.addEventListener("load", bump));
    const timers = [150, 600, 1500, 3000].map((t) => window.setTimeout(bump, t));
    return () => {
      imgs.forEach((i) => i.removeEventListener("load", bump));
      timers.forEach(clearTimeout);
    };
  }, [map]);

  const s = strength * 2; // feDisplacementMap: przesunięcie = scale × (kanał − 0.5)
  const bright = (1.04 + (nudge % 2) * 0.0001).toFixed(4);
  const glassStyle: CSSProperties = map
    ? {
        backdropFilter: `url(#${id}) saturate(1.35) brightness(${bright})`,
        WebkitBackdropFilter: `url(#${id}) saturate(1.35) brightness(${bright})`,
      }
    : {};

  return (
    <div
      ref={ref}
      className={`glass overflow-hidden ${className}`}
      style={{ ...style, ...glassStyle, borderRadius: radius }}
    >
      {map && (
        <svg aria-hidden width="0" height="0" className="absolute">
          {/* Obszar filtra względny do elementu (userSpaceOnUse nie pokrywa tła w backdrop-filter). */}
          <filter id={id} x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
            <feImage href={map.url} x="0" y="0" width={map.w} height={map.h} preserveAspectRatio="none" result="map" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.9" result="frost" />
            {(
              [
                ["r", 1, "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"],
                ["g", 0.86, "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"],
                ["b", 0.72, "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"],
              ] as const
            ).map(([ch, k, m]) => (
              <Fragment key={ch}>
                <feDisplacementMap in="frost" in2="map" scale={s * k} xChannelSelector="R" yChannelSelector="G" result={`d${ch}`} />
                <feColorMatrix in={`d${ch}`} type="matrix" values={m} result={ch} />
              </Fragment>
            ))}
            <feBlend in="r" in2="g" mode="screen" result="rg" />
            <feBlend in="rg" in2="b" mode="screen" />
          </filter>
        </svg>
      )}
      {children}
    </div>
  );
}

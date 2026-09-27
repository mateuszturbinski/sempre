"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { asset } from "../canvas";
import { Play } from "../icons";
import { openVideo } from "../VideoModal";

/**
 * Zdjęcie zespołu (Figma 50:798, 1240×413, górne rogi 100px) jako sekcja wideo:
 * 1) przypina się, gdy jego dół dojedzie do dołu ekranu,
 * 2) przy scrollu rośnie do pełnego viewportu (rogi → 0, malina odlatuje),
 * 3) stoi przez HOLD scrolla („pauza”), pojawia się przycisk play → modal z filmem.
 *
 * Geometria startowa = pozycja z Figmy (desktop, skala --z) albo karta mobile (px-5, 4:3).
 * Wrapper ma ujemny margines (h0 − 100vh), więc zdjęcie startuje dokładnie tam, gdzie było w layoucie.
 */
const EXPAND = 1; // × wysokość okna scrolla na rozrost
const HOLD = 0.6; // × wysokość okna scrolla na „pauzę” na pełnym ekranie

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

export function ExpandVideo() {
  const wrap = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLDivElement>(null);
  const berry = useRef<HTMLDivElement>(null);
  const play = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let raf = 0;

    const geometry = () => {
      const vw = document.documentElement.clientWidth;
      if (vw >= 1024) {
        const z = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--z")) || 1;
        const canvasLeft = (vw - 1440 * z) / 2;
        return { vw, l: canvasLeft + 100 * z, w: 1240 * z, h: 413 * z, r: 100 * z, z };
      }
      const w = vw - 40;
      return { vw, l: 20, w, h: (w * 3) / 4, r: 60, z: vw / 1440 };
    };

    const update = () => {
      raf = 0;
      const el = wrap.current;
      if (!el || !box.current) return;
      const g = geometry();
      const vh = window.innerHeight;
      el.style.setProperty("--h0", `${g.h}px`);
      el.style.height = `${vh * (1 + EXPAND + HOLD)}px`;
      el.style.marginTop = `${g.h - vh}px`;

      const s = -el.getBoundingClientRect().top;
      const p = ease(clamp(s / (vh * EXPAND)));

      const b = box.current.style;
      b.left = `${lerp(g.l, 0, p)}px`;
      b.top = `${lerp(vh - g.h, 0, p)}px`;
      b.width = `${lerp(g.w, g.vw, p)}px`;
      b.height = `${lerp(g.h, vh, p)}px`;
      const r = lerp(g.r, 0, p);
      b.borderRadius = `${r}px ${r}px 0 0`;
      if (img.current) img.current.style.objectPosition = `50% ${lerp(4, 50, p)}%`;

      if (berry.current) {
        // Malina (Figma 1150,304 w canvasie = +1050,−65 względem zdjęcia) odlatuje w górę i znika.
        const bs = berry.current.style;
        bs.left = `${g.l + 1050 * g.z}px`;
        bs.top = `${vh - g.h - 65 * g.z - p * 260}px`;
        bs.width = `${151 * g.z}px`;
        bs.height = `${127 * g.z}px`;
        bs.opacity = String(clamp(1 - p * 2.2));
        bs.rotate = `${p * 40}deg`;
        bs.display = g.vw >= 1024 ? "block" : "none";
      }
      if (play.current) {
        const t = clamp((p - 0.6) / 0.35);
        play.current.style.opacity = String(t);
        play.current.style.scale = String(0.7 + 0.3 * t);
        play.current.style.pointerEvents = t > 0.5 ? "auto" : "none";
      }
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section ref={wrap} aria-label="Film o Sempre" className="pointer-events-none relative h-[260vh] mt-[calc((100vw-40px)*0.75-100vh)] lg:mt-[calc(413px*var(--z,1)-100vh)]">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <div ref={box} className="pointer-events-auto absolute overflow-hidden bg-[#c2c2c2] will-change-[width,height,left,top]">
          <div ref={img} className="absolute inset-0 [&_img]:object-[inherit]" style={{ objectPosition: "50% 4%" }}>
            <Image
              src={asset("/img/photo-team.webp")}
              alt="Zespół lodziarni przy pracy"
              fill
              sizes="100vw"
              className="object-cover"
            />
          </div>
          <div aria-hidden className="absolute inset-0 bg-black/10" />
          <button
            ref={play}
            type="button"
            onClick={openVideo}
            aria-label="Odtwórz film"
            className="glass group absolute top-1/2 left-1/2 flex size-[120px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-white opacity-0 lg:size-[140px]"
          >
            <span className="flex size-[72px] items-center justify-center rounded-full bg-white text-black transition-transform duration-300 group-hover:scale-110 lg:size-[84px]">
              <Play className="size-7 translate-x-0.5" />
            </span>
          </button>
        </div>
        <div ref={berry} aria-hidden className="absolute">
          <Image src={asset("/img/raspberry-deco.webp")} alt="" fill sizes="151px" className="object-fill" />
        </div>
      </div>
    </section>
  );
}

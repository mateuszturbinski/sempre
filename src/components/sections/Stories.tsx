"use client";

import { useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { BLEED_X, Canvas, Pic, Wave, at, fromLeft, fromRight } from "../canvas";
import { ArrowRight } from "../icons";

// Figma 50:979 „Frame 1430105289” — czerwona sekcja historii z kartkami z bindownika.
// Karuzela „po okręgu”: w Figmie boczne karty są przesunięte o ±560px, niżej o ~50px i obrócone o ±10° —
// to punkty na okręgu o promieniu ~3225px ze środkiem pod sekcją. Każda karta stoi w pozycji środkowej
// (465,413) i jest obracana wokół tego wspólnego środka (transform-origin), więc przejście między
// pozycjami biegnie po łuku, a obrót karty zgadza się z Figmą.

const CARD: [number, number, number, number] = [465, 413, 511, 383];
const RADIUS = 3225; // odległość środka karty od środka okręgu
const STEP_DEG = 10; // kąt między sąsiednimi kartami (Figma: ±10°)
const PIVOT_ORIGIN = `${CARD[2] / 2}px ${CARD[3] / 2 + RADIUS}px`;
const EASE = "cubic-bezier(0.45, 0, 0.2, 1)";

type Story = {
  title: [string, string];
  body: ReactNode;
  cta?: string;
  /** Zdjęcie na karcie (pokazywane tylko, gdy historia jest na środku — „pop-in” przy każdej zmianie). */
  photo: { src: string; alt: string };
};

const STORIES: Story[] = [
  {
    title: ["Od pomysłu", "do pierwszej gałki."],
    body: (
      <>
        Miałam pomysł na lodziarnię, ale nie wiedziałam, od czego zacząć. Sempre pomogło mi przygotować lokal, dobrać
        składniki i&nbsp;przeszkolić zespół.
        <br />
        Na każdym etapie miałam z&nbsp;kim porozmawiać
      </>
    ),
    cta: "Poznaj historię Haliny",
    photo: { src: "/img/photo-meeting.png", alt: "Halina podczas rozmowy z doradcą" },
  },
  {
    title: ["Nowy rozdział", "w ofercie lokalu."],
    body: "Historia współpracy przy doborze produktów i wsparciu rozwoju oferty gastronomicznej.",
    photo: { src: "/img/stage-horeca-v2.png", alt: "Nowe desery w karcie lokalu" },
  },
  {
    title: ["Więcej pewności", "w codziennej pracy."],
    body: "Historia szkolenia dopasowanego do potrzeb pracowników i pracy w ich własnym lokalu.",
    cta: "Poznaj historię",
    photo: { src: "/img/process-training.png", alt: "Szkolenie zespołu w lokalu" },
  },
];

// Pętla: lista powielona, żeby z każdej strony była karta wjeżdżająca spoza ekranu.
const LOOP = [...STORIES, ...STORIES];
const N = LOOP.length;

/** 13 „dziurek” bindownika (koło 20px + trzonek 4×13) w kolorze tła sekcji. */
function Binder() {
  return (
    <div aria-hidden className="abs absolute top-0 right-6 left-6 flex justify-between lg:right-auto lg:left-auto" style={at(26, 0, 459, 24)}>
      {Array.from({ length: 13 }, (_, i) => (
        <svg key={i} viewBox="0 0 20 24" className="h-6 w-5 shrink-0 fill-brand">
          <circle cx="10" cy="14" r="10" />
          <rect x="8" width="4" height="13" />
        </svg>
      ))}
    </div>
  );
}

function ArrowButton({ dir, onClick, style }: { dir: "prev" | "next"; onClick: () => void; style: CSSProperties }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === "prev" ? "Przesuń historie w lewo" : "Przesuń historie w prawo"}
      className="abs z-30 hidden size-[60px] items-center justify-center rounded-full bg-brand text-white transition-transform hover:scale-105 lg:flex"
      style={style}
    >
      <ArrowRight className={`size-5 ${dir === "prev" ? "rotate-180" : ""}`} />
    </button>
  );
}

export function Stories() {
  // Indeks karty w środku. Strzałka wskazuje kierunek ruchu kart: „prawo” = karty jadą w prawo po łuku
  // (na środek wjeżdża karta z lewej), „lewo” = w lewo.
  const [center, setCenter] = useState(0);
  const move = (dir: "left" | "right") => setCenter((c) => (c + (dir === "right" ? -1 : 1) + N) % N);

  return (
    <Canvas height={947} className="overflow-clip bg-brand" inner="flex flex-col gap-6 px-5 pt-16 pb-20 text-white">
      {/* Kremowa fala z poprzedniej sekcji (Union 50:1000) — widoczny tylko jej dolny brzeg */}
      <Wave src="/svg/wave-cream-v2.svg" y={-768} h={884} />

      <h2
        className="display abs text-[28px] leading-[1.6] tracking-[-0.01em] lg:text-[32px] lg:leading-[61.44px] lg:tracking-[-0.32px]"
        style={at(156, 205, 546)}
      >
        Za każdym lokalem
        <br />
        stoi czyjaś historia.
      </h2>
      <p className="abs text-[18px] leading-[28px] lg:text-[20px] lg:leading-[32px]" style={at(738, 205, 546)}>
        Pierwsze otwarcie, rozwój zespołu, nowy kierunek. Zobacz, jak może wyglądać{" "}
        <strong className="font-semibold">współpraca z Sempre.</strong>
      </p>

      <div className="-mx-5 mt-6 flex snap-x snap-mandatory gap-6 overflow-x-auto px-5 pt-2 pb-16 text-black [scrollbar-width:none] lg:contents">
        {LOOP.map((s, k) => {
          // Pozycja na okręgu względem środka: …, -2, -1, 0, 1, 2, 3 (±2 i 3 = poza ekranem).
          const o = (k - center + N) % N;
          const slot = o <= N / 2 ? o : o - N;
          const visible = Math.abs(slot) <= 1;
          const far = Math.abs(slot) >= 3; // przeskok „za plecami” okręgu — bez animacji
          const style = {
            ...at(CARD[0], CARD[1], CARD[2], CARD[3], slot * STEP_DEG),
            transformOrigin: PIVOT_ORIGIN,
            transitionTimingFunction: EASE,
          } as CSSProperties;
          return (
            <article
              key={k}
              aria-hidden={!visible}
              className={`abs relative w-[82vw] shrink-0 snap-center bg-white px-7 pt-14 pb-10 lg:p-0 ${
                k >= STORIES.length ? "hidden lg:block" : ""
              } ${far ? "lg:transition-none" : "transition-[rotate,opacity] duration-[900ms]"} ${
                visible ? "lg:opacity-100" : "lg:pointer-events-none lg:opacity-0"
              }`}
              style={style}
            >
              <Binder />
              <h3
                className="display abs text-[18px] leading-[1.9] tracking-[-0.2px] lg:text-[20px] lg:leading-[38.4px]"
                style={at(56, 56, 329)}
              >
                {s.title[0]}
                <br />
                {s.title[1]}
              </h3>
              <p className="abs mt-4 text-[16px] leading-[28px] lg:mt-0 lg:leading-[32px]" style={at(56, 152, 417)}>
                {s.body}
              </p>
              {s.cta && (
                <a
                  href="#"
                  tabIndex={visible ? undefined : -1}
                  className="display abs group mt-6 flex items-center gap-5 text-[10px] leading-[19.2px] tracking-[-0.1px] text-brand lg:mt-0"
                  style={at(56, 307)}
                >
                  {s.cta}
                  <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
                </a>
              )}
              {/* Figma 50:1539: 194.5×138.2 pod kątem 7°, zdjęcie 261×174 przesunięte o (-33.6,-17.9).
                  Obrót wokół środka (pod „pop-in”) — x/y przeliczone, by poza była identyczna jak w Figmie. */}
              <div
                aria-hidden={slot !== 0}
                className={`abs relative mt-6 aspect-[195/138] w-[70%] overflow-hidden rounded-[10px] bg-brand-deep lg:mt-0 ${
                  slot === 0
                    ? "opacity-100 [transition:opacity_0.35s_ease_0.45s,scale_0.8s_cubic-bezier(0.34,1.56,0.64,1)_0.45s,rotate_0.9s_cubic-bezier(0.3,1.8,0.55,1)_0.45s] lg:scale-100"
                    : "[transition:opacity_0.2s_ease,scale_0.25s_ease,rotate_0.25s_ease] lg:scale-[0.5] lg:opacity-0"
                }`}
                style={{ ...at(277.58, 278.8, 194.55, 138.23, slot === 0 ? 7.03 : -8), transformOrigin: "50% 50%" } as CSSProperties}
              >
                <Pic
                  src={s.photo.src}
                  alt={s.photo.alt}
                  sizes="(min-width:1024px) 261px, 60vw"
                  className="abs absolute inset-0"
                  style={at(-33.55, -17.92, 261.1, 174.07)}
                />
              </div>
            </article>
          );
        })}
      </div>

      {/* Boczne poświaty #f4495d 20% → 0 */}
      <div aria-hidden className="abs pointer-events-none z-20 hidden bg-linear-to-l from-brand/20 to-brand/0 lg:block" style={{ ...at(0, 57, 252, 890), "--x": "calc(1188px + (var(--vw) - 1440px) / 2)" } as CSSProperties} />
      <div aria-hidden className="abs pointer-events-none z-20 hidden bg-linear-to-r from-brand/20 to-brand/0 lg:block" style={{ ...at(0, 59, 252, 890), "--x": BLEED_X } as CSSProperties} />

      {/* Strzałki — Figma 106:3103 (lewa, 40,553) i 106:3101 (prawa, 1324,553), trzymają odstęp od krawędzi okna */}
      <ArrowButton dir="prev" onClick={() => move("left")} style={{ ...at(0, 553, 60, 60), "--x": fromLeft(40) } as CSSProperties} />
      <ArrowButton dir="next" onClick={() => move("right")} style={{ ...at(0, 553, 60, 60), "--x": fromRight(1324) } as CSSProperties} />
    </Canvas>
  );
}

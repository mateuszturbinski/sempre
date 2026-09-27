"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import { Pic, at, bleed } from "../canvas";
import { RoundArrow } from "../icons";

/**
 * Figma 50:954 (stan „Igor”) i 84:2544 (stan „Michał”) — zdjęcie na całą szerokość, karta aktywnej osoby
 * po lewej (x≈98), karta poprzedniej osoby wystaje zza lewej krawędzi (białe 80% + blur).
 * Strzałka → kolejna osoba: tło przenika się, aktywna karta odjeżdża w lewo do „podglądu”,
 * nowa wjeżdża z prawej.
 */
type Expert = {
  name: string;
  role: string;
  body: string;
  img: string;
  alt: string;
  /** Prostokąt zdjęcia z Figmy względem ramki 1440 → skalowany z szerokością okna (--vw). */
  rect: [x: number, y: number, w: number, h: number];
  /** Pozycje z Figmy w karcie 540×572. */
  textX: number;
  arrowY: number;
  bodyW: number;
  bodyLh: number;
  activeX: number;
};

const EXPERTS: Expert[] = [
  {
    name: "Igor Zarębski",
    role: "Szef Akademii Sempre",
    body: "Dzieli się wiedzą i praktycznym doświadczeniem, wspierając rozwój umiejętności uczestników szkoleń Akademii Sempre.",
    img: "/img/expert-igor-v2.webp",
    alt: "Igor Zarębski prowadzi warsztat w Akademii Sempre",
    rect: [-15, -51, 1770, 996],
    textX: 56,
    arrowY: 56,
    bodyW: 428,
    bodyLh: 26,
    activeX: 102,
  },
  {
    name: "Michał Iwaniuk",
    role: "Ekspert Akademii Sempre",
    body: "Dzieli się doświadczeniem i pokazuje, jak wykorzystać wiedzę w praktyce. Inspiruje uczestników szkoleń do rozwijania umiejętności i poszukiwania nowych pomysłów.",
    img: "/img/expert-michal.webp",
    alt: "Michał Iwaniuk przy ladzie z lodami",
    rect: [-20, -25, 1517, 853],
    textX: 51,
    arrowY: 59,
    bodyW: 433,
    bodyLh: 32,
    activeX: 94,
  },
];

const PEEK_X = -462; // prawa krawędź karty ~78px od lewej krawędzi zdjęcia
const EASE = "duration-[900ms] ease-[cubic-bezier(0.65,0,0.35,1)]";

/** Prostokąt zdjęcia proporcjonalny do szerokości okna (na 1440 = dokładnie Figma). */
function photoRect([x, y, w, h]: Expert["rect"]): CSSProperties {
  const f = (v: number) => `calc(var(--vw) * ${(v / 1440).toFixed(5)})`;
  return { "--x": f(x), "--y": f(y), "--w": f(w), "--h": f(h) } as CSSProperties;
}

/**
 * Role kart:
 *  active  — karta po lewej (pozycja z Figmy), na pierwszym planie,
 *  peek    — poprzednia osoba wystająca zza lewej krawędzi (białe 80%),
 *  offLeft — poza lewą krawędzią, bez animacji (tylko przy >2 osobach).
 * Zmiana osoby = ZAMIANA z kartą po lewej: aktywna cofa się w lewo na miejsce podglądu (pod spód),
 * a karta z podglądu wysuwa się w prawo na pierwszy plan. Nic nie odlatuje w prawo.
 */
type Role = "active" | "peek" | "offLeft";
const DURATION = 900;

export function ExpertsSlider() {
  const n = EXPERTS.length;
  const [active, setActive] = useState(0);
  const [parked, setParked] = useState<number | null>(null); // teleport poza lewą krawędź (bez animacji)
  const [busy, setBusy] = useState(false);
  const prevOf = (k: number) => (k - 1 + n) % n;
  // Krótki timer zamiast rAF: rAF bywa wstrzymany (karta w tle), a tu chodzi tylko o to, by pozycja startowa
  // zdążyła się wyrenderować przed włączeniem animacji.
  const nextFrame = (fn: () => void) => window.setTimeout(fn, 40);

  const go = (to: number) => {
    if (busy || to === active) return;
    setBusy(true);
    // Przy 2 osobach nowa karta JEST podglądem — po prostu zamieniają się miejscami.
    // Przy większej liczbie nowa karta najpierw ląduje za lewą krawędzią (bez animacji), potem wjeżdża.
    if (to !== prevOf(active)) setParked(to);
    nextFrame(() => {
      setParked(null);
      setActive(to);
      window.setTimeout(() => setBusy(false), DURATION);
    });
  };
  const next = () => go((active + 1) % n);

  const roleOf = (k: number): Role => {
    if (k === parked) return "offLeft";
    if (k === active) return "active";
    if (k === prevOf(active)) return "peek";
    return "offLeft";
  };

  return (
    <div
      className="abs relative -mx-5 mt-10 overflow-hidden bg-pink pt-[70vw] pb-5 lg:mx-0 lg:mt-0 lg:p-0"
      style={bleed(508, 771)}
      aria-roledescription="karuzela"
    >
      {EXPERTS.map((e, k) => (
        <div
          key={e.img}
          aria-hidden={k !== active}
          className={`absolute inset-0 transition-[opacity,scale] ${EASE} ${k === active ? "scale-100 opacity-100" : "scale-[1.04] opacity-0"}`}
        >
          <Pic
            src={e.img}
            alt={e.alt}
            sizes="(min-width:1024px) 1770px, 100vw"
            preload={k === 0}
            className="px-zoom abs absolute inset-x-0 top-0 h-[80vw] lg:inset-auto"
            style={photoRect(e.rect)}
          />
        </div>
      ))}

      <div aria-live="polite" className="relative px-5 lg:static lg:px-0">
        {EXPERTS.map((e, k) => {
          const role = roleOf(k);
          const x = {
            active: `${e.activeX}px`,
            peek: `${PEEK_X}px`,
            offLeft: `${PEEK_X - 600}px`,
          }[role];
          return (
            <article
              key={e.name}
              onClick={role === "peek" ? () => go(k) : undefined}
              className={`abs relative rounded-[40px] p-7 backdrop-blur-[40px] lg:p-0 ${
                role === "offLeft" ? "transition-none" : `transition-[left,background-color,opacity] ${EASE}`
              } ${role === "active" ? "bg-white" : "bg-white/80"} ${role === "peek" ? "cursor-pointer" : ""} ${
                role === "offLeft" ? "lg:opacity-0" : ""
              } ${role === "active" ? "z-20" : "z-10"} ${
                k === active ? "" : "hidden lg:block"
              }`}
              style={{ ...at(0, 99, 540, 572), "--x": x } as CSSProperties}
            >
              <h3
                className="display abs max-w-[200px] text-[28px] leading-[1.6] tracking-[-0.32px] lg:max-w-none lg:text-[32px] lg:leading-[61.44px]"
                style={at(e.textX, 56, 245)}
              >
                {e.name}
              </h3>
              <p className="abs mt-3 text-[20px] leading-[32px] font-semibold text-brand lg:mt-0" style={at(e.textX, 190, 365)}>
                {e.role}
              </p>
              <p
                className="abs mt-4 text-[16px] font-medium lg:mt-0"
                style={{ ...at(e.textX, 250, e.bodyW), lineHeight: `${e.bodyLh}px` }}
              >
                {e.body}
              </p>
              <Pic
                src="/img/expert-badges.webp"
                alt="Finalista Pucharu Sztuki Deserowej 2025, Laureat wyróżnienia Kreator Smaku 2024, Prowadzący warsztaty"
                fit="fill"
                sizes="313px"
                className="abs mt-6 aspect-[313/117] w-full max-w-[313px] lg:mt-0"
                style={at(56, 391, 313, 117)}
              />
              <RoundArrow
                label="Następny ekspert"
                onClick={next}
                className={`abs absolute top-7 right-7 lg:hidden ${role === "active" ? "" : "pointer-events-none opacity-0"}`}
                style={at(510, e.arrowY, 60, 60)}
              />
            </article>
          );
        })}
      </div>

      {/* Jedna wspólna strzałka (desktop) — stoi w miejscu, karty zamieniają się pod nią (Figma: 510,56 w karcie x=102). */}
      <RoundArrow
        label="Następny ekspert"
        onClick={next}
        className="abs z-30 hidden lg:flex"
        style={at(102 + 510, 99 + 56, 60, 60)}
      />
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { Canvas, Pic, at } from "../canvas";
import { ArrowUpRight, RoundArrow } from "../icons";

// Figma 50:1345 (nagłówek) + 92:2904 (rząd marek) — karty 370px co 390px, r=60, bez obrotu.
// Aktywna marka (2. miejsce w rzędzie) jest wysoka (562) i pokazuje opis; pozostałe są niższe (395),
// równo do dołu, tylko ze zdjęciem i nazwą. Strzałka przesuwa rząd o jedną kartę z lekkim „bounce”.

type Brand = {
  name: string;
  tagline: string;
  bg: string;
  img: string;
  /** Zdjęcie: x, odległość GÓRY zdjęcia od DOŁU karty (trzyma się dołu przy zmianie wysokości), w, h. */
  image: [x: number, fromBottom: number, w: number, h: number];
};

const BRANDS: Brand[] = [
  { name: "Babbi", tagline: "Składniki do lodów", bg: "#f2a8b2", img: "/img/brand-babbi.png", image: [8.5, 210, 352, 529] },
  { name: "Pernigotti", tagline: "Lody i desery", bg: "#f1caa3", img: "/img/brand-pernigotti.png", image: [-21.5, 284, 406, 346] },
  { name: "Lübecker", tagline: "produkty czekoladowe", bg: "#f2b7a8", img: "/img/brand-lubecker.png", image: [16.5, 251, 336, 336] },
  { name: "Trucillo", tagline: "Włoska kawa", bg: "#b4d0bf", img: "/img/brand-trucillo.png", image: [-22.2, 194, 433.3, 325] },
  { name: "Mazzoni", tagline: "Przeciery", bg: "#efd39b", img: "/img/brand-mazzoni.png", image: [-32.5, 219, 434.9, 385] },
];

const ROW_X = -257; // rząd z Figmy: gradient (1445 w rzędzie) ląduje na x=1188 płótna, strzałka na 1334
const STEP = 390; // 370 + odstęp 20
const CARD_W = 370;
const TALL = 562;
const SHORT = 395;
const ACTIVE_SLOT = 1;

// Rząd powielony — karuzela kręci się bez końca.
const LOOP = [...BRANDS, ...BRANDS];
const N = LOOP.length;
// Lekki „bounce”: przesunięcie i zmiana wysokości z niewielkim przestrzeleniem.
const BOUNCE = "cubic-bezier(0.34, 1.32, 0.64, 1)";
const DURATION = "800ms";

export function Brands() {
  const [start, setStart] = useState(0);
  // Licznik „bujnięć”: rośnie przy wejściu sekcji i przy każdym kliknięciu (parzystość restartuje animację).
  const [sway, setSway] = useState(0);
  // Wejście: karty czekają za PRAWĄ krawędzią (jadą w lewo, jak przy przesuwaniu) i wjeżdżają po kolei, gdy rząd pojawi się na ekranie.
  const [entered, setEntered] = useState(false);
  const [settled, setSettled] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setEntered(true);
      setSettled(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        setEntered(true);
        setSway((v) => v + 1);
        window.setTimeout(() => setSettled(true), 1800);
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Canvas height={1075} inner="flex flex-col gap-6 px-5 pt-20 pb-16">
      <h2
        className="display abs text-[28px] leading-[1.6] tracking-[-0.01em] lg:text-[32px] lg:leading-[61.44px] lg:tracking-[-0.32px]"
        style={at(156, 259, 546)}
      >
        Światowe marki.
        <br />
        Blisko <span className="text-brand">Twojego biznesu.</span>
      </h2>
      <p className="abs text-[18px] leading-[28px] lg:text-[20px] lg:leading-[32px]" style={at(738, 259, 546)}>
        Dobre składniki otwierają nowe możliwości.
        <br className="hidden lg:inline" /> Poznaj marki, z którymi stworzysz{" "}
        <strong className="font-semibold">ofertę swojego lokalu.</strong>
      </p>

      <div
        ref={rowRef}
        className="abs -mx-5 mt-6 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 py-8 [scrollbar-width:none] lg:mx-0 lg:mt-0 lg:overflow-visible lg:p-0"
        style={at(ROW_X, 451, 1930, 562)}
      >
        {LOOP.map((b, k) => {
          const o = (k - start + N) % N; // miejsce w kolejce
          const slot = o <= 5 ? o : o === N - 1 ? -1 : 5; // -1 = wyjazd w lewo, 5 = czeka za prawą krawędzią
          const waiting = slot === 5 && o !== 5; // głębiej w kolejce — bez animacji
          const active = slot === ACTIVE_SLOT;
          const h = active ? TALL : SHORT;
          const offscreen = slot < 0 || slot > 4;
          // Fizyka: widoczne karty bujają się po każdym przesunięciu, z opóźnieniem fali (lewa → prawa).
          const swayCls = sway > 0 && !waiting && slot >= 0 ? (sway % 2 ? "brand-sway-a" : "brand-sway-b") : "";
          // Przed wejściem: karta przesunięta w prawo i niewidoczna; wjeżdża w lewo, kaskadą od lewej.
          const entering = !settled;
          const enterDelay = Math.max(0, slot) * 90;
          const move = waiting
            ? "lg:transition-none"
            : "transition-[left,top,height,opacity,translate] duration-[800ms]";
          const style = {
            ...at(slot * STEP, TALL - h, CARD_W, h),
            background: b.bg,
            transitionTimingFunction: `${BOUNCE}, ${BOUNCE}, ${BOUNCE}, ease, ${BOUNCE}`,
            transitionDuration: entering ? "800ms, 800ms, 800ms, 500ms, 1100ms" : undefined,
            transitionDelay: entering ? `0ms, 0ms, 0ms, ${enterDelay}ms, ${enterDelay}ms` : undefined,
            animationDelay: `${entering ? enterDelay + 350 : Math.max(0, slot) * 45}ms`,
          } as CSSProperties;
          return (
            <a
              key={k}
              href="#"
              aria-label={`${b.name} — ${b.tagline}`}
              aria-hidden={offscreen}
              tabIndex={offscreen ? -1 : undefined}
              className={`abs group relative block h-[440px] w-[78vw] max-w-[340px] shrink-0 snap-center overflow-hidden rounded-[48px] lg:max-w-none lg:rounded-[60px] ${
                k >= BRANDS.length ? "hidden lg:block" : ""
              } ${move} ${swayCls} ${!entered ? "lg:translate-x-[900px]" : ""} ${
                slot < 0 || waiting || !entered ? "lg:opacity-0" : "lg:opacity-100"
              }`}
              style={style}
            >
              <Pic
                src={b.img}
                sizes="(min-width:1024px) 440px, 80vw"
                className={`abs absolute inset-x-0 bottom-[-40px] h-[300px] lg:inset-auto ${waiting ? "" : "transition-[top] duration-[800ms]"}`}
                style={{ ...at(b.image[0], h - b.image[1], b.image[2], b.image[3]), transitionTimingFunction: BOUNCE } as CSSProperties}
              />
              <div className="abs relative flex flex-col items-center gap-2.5 pt-14 text-center lg:pt-0" style={at(0, 64, CARD_W)}>
                <h3 className="display text-[32px] leading-[61.44px] whitespace-nowrap">{b.name}</h3>
                {/* Opis tylko przy aktywnej marce (na mobile zawsze) */}
                <p
                  className={`text-[20px] leading-[32px] transition-[opacity,translate] duration-500 ${
                    active ? "lg:translate-y-0 lg:opacity-100 lg:delay-200" : "lg:-translate-y-1 lg:opacity-0"
                  }`}
                >
                  {b.tagline}
                </p>
              </div>
              <span
                className={`abs absolute right-6 bottom-6 flex items-center justify-center rounded-full bg-white p-1 group-hover:scale-110 lg:right-auto lg:bottom-auto ${
                  waiting ? "" : "transition-[top,scale] duration-[800ms]"
                }`}
                style={{ ...at(258, h - 112, 72, 72), transitionTimingFunction: BOUNCE } as CSSProperties}
              >
                <ArrowUpRight />
              </span>
            </a>
          );
        })}
        {/* Wygaszenie prawej krawędzi + strzałka karuzeli */}
        {/* Gradient 252px jak w Figmie, dalej pełny krem aż do prawej krawędzi okna (karty bez marginesów) */}
        <div
          aria-hidden
          className="abs pointer-events-none z-10 hidden lg:block"
          style={{
            ...at(1445, 0, 252, 562),
            "--w": "calc(252px + (var(--vw) - 1440px) / 2 + 60px)",
            background: "linear-gradient(to right, rgb(252 249 242 / 0) 0, var(--color-cream) 252px, var(--color-cream) 100%)",
          } as CSSProperties}
        />
        <RoundArrow
          label="Następne marki"
          onClick={() => {
            setSettled(true);
            setSway((v) => v + 1);
            setStart((v) => (v + 1) % N);
          }}
          className="abs z-20 hidden lg:flex"
          style={at(1591, 292, 60, 60)}
        />
      </div>
    </Canvas>
  );
}

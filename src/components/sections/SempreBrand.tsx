"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { Canvas, Pic, at, bleed } from "../canvas";
import { ArrowRight } from "../icons";

// Figma 50:935 „Frame 42” — pasek marek grupy = TABY + treść marki z siatką zdjęć.
// Taby 1:1 z Figmy: 50:935 (Sempre), 92:2714 (Cukieteria), 92:2776 (Warsaw Academy).
// Desktop: sekcja przypina się na ekranie i przy scrollu sama przełącza taby 1→3 (pasek postępu pod tabem),
// potem się odpina. Mobile: autoodtwarzanie co 5 s, gdy sekcja jest widoczna.

/** Logo wyśrodkowane w poziomie komórki (w Figmie komórki mają 480px, logo jest na środku). */
const centered = (y: number, w: number, h: number) =>
  ({ "--x": `calc(50% - ${w / 2}px)`, "--y": `${y}px`, "--w": `${w}px`, "--h": `${h}px` }) as CSSProperties;

/** Tekst z Figmy jako przebiegi [waga, tekst]; \n i \u2028 z Figmy = złamanie linii. */
type Run = [400 | 600, string];
function rich(runs: Run[]): ReactNode {
  return runs.map(([w, t], i) => {
    const parts = t.split(/\n|\u2028/);
    const body = parts.flatMap((p, j) => (j === 0 ? [p] : [<br key={`b${i}-${j}`} />, p]));
    return w === 600 ? (
      <strong key={i} className="font-semibold">
        {body}
      </strong>
    ) : (
      <span key={i}>{body}</span>
    );
  });
}

/** Kafel siatki 587×634 (pozycja względem siatki, px z Figmy). */
type Tile =
  | { kind: "photo"; pos: [number, number, number, number]; src: string; alt: string; rect: [number, number, number, number] }
  | { kind: "empty"; pos: [number, number, number, number] }
  | { kind: "quote"; pos: [number, number, number, number]; text: Run[]; w: number; lh: number };

type Tab = {
  logo: { src: string; alt: string; y: number; w: number; h: number; fit?: "fill" | "cover" };
  label: string;
  title: [string, string];
  body: Run[];
  /** y bloku tekstu w białym polu (Figma: 207 / 173 / 157 — blok jest wyśrodkowany w pionie). */
  textY: number;
  cta?: { label: string; href: string };
  tiles: Tile[];
};

const ACCENT = "#f4495d";

// Figma 50:935 (Sempre), 92:2714 (Cukieteria), 92:2776 (Warsaw Academy).
const TABS: Tab[] = [
  {
    logo: { src: "/img/logo-sempre.png", alt: "Sempre", y: 22, w: 120, h: 62, fit: "cover" },
    label: "Marka główna",
    title: ["Twój pomysł", "Nasza energia"],
    body: [
      [400, "Sempre łączy ludzi, doświadczenie i rozwiązania, dzięki którym "],
      [600, "Twój biznes"],
      [400, " nabiera kształtu. Porozmawiajmy o tym, \nco chcesz stworzyć."],
    ],
    textY: 207,
    tiles: [
      { kind: "photo", pos: [0, 0, 400, 312], src: "/img/photo-meeting.png", alt: "Rozmowa przy kawie", rect: [-69, -9, 553, 369] },
      { kind: "empty", pos: [410, 0, 177, 312] },
      { kind: "empty", pos: [0, 322, 221, 312] },
      {
        kind: "quote",
        pos: [231, 322, 356, 312],
        w: 251,
        lh: 26,
        text: [
          [400, "Dobry produkt to dopiero 20% sukcesu. Pozostałe 80% to wiedza, zespół \ni umiejętne prowadzenie lodziarni. \n\n"],
          [600, "Z Sempre masz wsparcie także w tej części."],
        ],
      },
    ],
  },
  {
    logo: { src: "/img/logo-cukieteria-pl.png", alt: "Cukieteria.pl", y: 36, w: 186, h: 46 },
    label: "Sklep online",
    title: ["Twój pomysł", "Dobre składniki"],
    body: [
      [400, "Cukieteria to sklep internetowy "],
      [600, "Sempre \n"],
      [400, "z produktami dla lodziarni, cukierni \ni gastronomii. Znajdziesz tu składniki, akcesoria i wyposażenie, które pomogą \nCi zamienić pomysły w gotowe lody i desery."],
    ],
    textY: 173,
    cta: { label: "Zobacz możliwości", href: "#" },
    tiles: [
      { kind: "empty", pos: [0, 0, 177, 312] },
      { kind: "photo", pos: [187, 0, 400, 312], src: "/img/tab-callebaut.png", alt: "Czekolada Callebaut 823", rect: [66, 33, 268, 246] },
      {
        kind: "quote",
        pos: [0, 322, 356, 312],
        w: 244,
        lh: 26,
        text: [
          [400, "Od składników do lodów, przez czekoladę \ni dekoracje, po formy \ni akcesoria.\n\n"],
          [600, "Produkty do codziennej pracy w jednym \nmiejscu."],
        ],
      },
      { kind: "empty", pos: [366, 322, 221, 312] },
    ],
  },
  {
    logo: { src: "/img/logo-wapa.png", alt: "Warsaw Academy of Pastry Arts", y: 28, w: 117, h: 65 },
    label: "Akademia i szkolenia",
    title: ["Twoja pasja", "Praktyczna wiedza"],
    body: [
      [400, "Warsaw "],
      [600, "Academy of Pastry Arts "],
      [400, "to miejsce,\nw którym rozwijasz umiejętności pod okiem ekspertów. Poznajesz techniki cukiernicze \ni lodziarskie, pracujesz ze składnikami \ni zdobywasz wiedzę, którą wykorzystasz \nw swoim lokalu."],
    ],
    textY: 157,
    cta: { label: "Poznaj Akademię", href: "#" },
    tiles: [
      {
        kind: "quote",
        pos: [0, 0, 355, 312],
        w: 243,
        lh: 24,
        text: [
          [400, "Od pierwszych prób\u2028po "],
          [600, "doskonalenie techniki."],
          [400, "\u2028Rozwijaj umiejętności\u2028pod okiem ekspertów.\u2028Poznawaj składniki,\u2028testuj nowe połączenia."],
        ],
      },
      { kind: "photo", pos: [365, 0, 222, 312], src: "/img/tab-michal.png", alt: "Michał Iwaniuk", rect: [-18, 0, 258, 323] },
      { kind: "photo", pos: [0, 322, 222, 312], src: "/img/tab-igor.png", alt: "Igor Zarębski", rect: [-20, 0, 258, 327] },
      {
        kind: "quote",
        pos: [232, 322, 355, 312],
        w: 243,
        lh: 24,
        text: [
          [400, "Od pierwszych prób\u2028po "],
          [600, "doskonalenie techniki."],
          [400, "\u2028Rozwijaj umiejętności\u2028pod okiem ekspertów.\u2028Poznawaj składniki,\u2028testuj nowe połączenia."],
        ],
      },
    ],
  },
];

/** Wysokość scrolla (× wysokość okna) przypadająca na jeden tab, gdy sekcja jest przypięta. */
const SEGMENT = 0.6;
const MOBILE_INTERVAL = 5000;
const clamp = (v: number) => Math.min(1, Math.max(0, v));

export function SempreBrand() {
  const wrap = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState(0);
  const [progress, setProgress] = useState(0);

  // Desktop: tab i postęp wynikają z pozycji scrolla w przypiętej sekcji.
  useEffect(() => {
    const mq = matchMedia("(min-width: 1024px)");
    let raf = 0;
    const geometry = () => {
      const vh = innerHeight;
      const z = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--z")) || 1;
      const top = Math.min(0, vh - 898 * z); // sticky top (gdy sekcja wyższa niż okno)
      return { vh, top, dist: 3 * SEGMENT * vh };
    };
    const update = () => {
      raf = 0;
      if (!mq.matches || !wrap.current) return;
      const g = geometry();
      const s = g.top - wrap.current.getBoundingClientRect().top;
      const p = clamp(s / g.dist) * 3;
      const t = Math.min(2, Math.floor(p));
      setTab(t);
      setProgress(clamp(p - t));
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

  // Mobile: autoodtwarzanie, gdy sekcja jest na ekranie.
  const [mobileTick, setMobileTick] = useState(0);
  useEffect(() => {
    const mq = matchMedia("(min-width: 1024px)");
    const el = wrap.current;
    if (!el) return;
    let visible = false;
    let started = performance.now();
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      started = performance.now();
    });
    io.observe(el);
    const id = window.setInterval(() => {
      if (mq.matches || !visible) return;
      const p = (performance.now() - started) / MOBILE_INTERVAL;
      if (p >= 1) {
        started = performance.now();
        setTab((t) => (t + 1) % TABS.length);
        setProgress(0);
      } else setProgress(p);
    }, 50);
    return () => {
      io.disconnect();
      window.clearInterval(id);
    };
  }, [mobileTick]);

  const choose = (i: number) => {
    if (matchMedia("(min-width: 1024px)").matches && wrap.current) {
      const vh = innerHeight;
      const z = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--z")) || 1;
      const top = Math.min(0, vh - 898 * z);
      const wrapTop = wrap.current.getBoundingClientRect().top + scrollY;
      scrollTo({ top: wrapTop - top + (i / 3) * 3 * SEGMENT * vh + 4, behavior: "smooth" });
    } else {
      setTab(i);
      setProgress(0);
      setMobileTick((k) => k + 1); // restart licznika
    }
  };

  return (
    <div ref={wrap} className="relative lg:h-[calc(898px*var(--z,1)+180vh)]">
      <div className="lg:sticky lg:top-[min(0px,calc(100vh-898px*var(--z,1)))]">
        <Canvas height={898} className="bg-white" inner="flex flex-col">
          <div className="abs z-10 h-px bg-black/10" style={bleed(0, 1)} />

          {/* Frame 40 — trzy komórki 480×120 = taby */}
          <div role="tablist" aria-label="Marki grupy Sempre" className="abs grid grid-cols-3" style={bleed(0, 120)}>
            {TABS.map((t, i) => (
              <button
                key={t.logo.src}
                type="button"
                role="tab"
                aria-selected={tab === i}
                onClick={() => choose(i)}
                className={`relative h-[72px] cursor-pointer overflow-hidden transition-colors duration-500 lg:h-[120px] ${
                  tab === i ? "bg-white" : "bg-cream hover:bg-[#f6f1e6]"
                }`}
              >
                <Pic
                  src={t.logo.src}
                  alt={t.logo.alt}
                  fit={t.logo.fit ?? "fill"}
                  sizes={`${t.logo.w}px`}
                  className={`abs absolute inset-0 m-auto transition-[opacity,scale] duration-500 lg:inset-auto ${
                    tab === i ? "opacity-100" : "opacity-60 scale-95"
                  } ${["h-[36px] w-[70px]", "h-[24px] w-[98px]", "h-[36px] w-[65px]"][i]}`}
                  style={centered(t.logo.y, t.logo.w, t.logo.h)}
                />
                {/* Pasek postępu aktywnego taba */}
                <span
                  aria-hidden
                  className="absolute bottom-0 left-0 h-[3px] transition-opacity duration-300"
                  style={{
                    width: `${(tab === i ? progress : tab > i ? 1 : 0) * 100}%`,
                    background: ACCENT,
                    opacity: tab === i ? 1 : 0,
                  }}
                />
              </button>
            ))}
          </div>

          <div className="abs bg-white px-5 pt-14 pb-16 lg:p-0" style={at(0, 120, 1440, 778)}>
            {TABS.map((t, i) => {
              const on = tab === i;
              const state = on
                ? "opacity-100 translate-y-0"
                : `pointer-events-none opacity-0 ${i < tab ? "-translate-y-6" : "translate-y-6"} max-lg:hidden`;
              return (
                <div key={t.label} role="tabpanel" aria-hidden={!on} className="contents">
                  {/* Frame 49 — tekst, odstępy 20 */}
                  <div
                    className={`abs flex flex-col gap-5 transition-[opacity,translate] duration-700 ease-[cubic-bezier(0.2,0.7,0.2,1)] ${state}`}
                    style={at(156, t.textY, 432)}
                  >
                    <p className="text-[20px] leading-[32px] font-semibold" style={{ color: ACCENT }}>
                      {t.label}
                    </p>
                    <h2 className="display text-[28px] leading-[1.6] tracking-[-0.01em] lg:text-[32px] lg:leading-[61.44px] lg:tracking-[-0.32px]">
                      {t.title[0]}
                      <br />
                      {t.title[1]}
                    </h2>
                    <p className="text-[18px] leading-[28px] lg:text-[20px] lg:leading-[32px]">{rich(t.body)}</p>
                    {t.cta && (
                      <a
                        href={t.cta.href}
                        className="display group mt-[38px] flex items-center gap-5 text-[10px] leading-[19.2px] tracking-[-0.1px]"
                      >
                        {t.cta.label}
                        <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
                      </a>
                    )}
                  </div>

                  {/* Siatka 587×634: 4 kafle 312 wys., odstępy 10, r=60 — brzoskwiniowe (#fecb8c), zdjęcia lub obrys z tekstem */}
                  <div
                    className={`abs mt-10 grid grid-cols-2 gap-2.5 lg:mt-0 lg:block ${on ? "" : "pointer-events-none max-lg:hidden"}`}
                    style={at(675, 72, 587, 634)}
                  >
                    {t.tiles.map((tile, k) => {
                      const [x, y, w, h] = tile.pos;
                      const anim = `transition-[opacity,scale] duration-700 ease-[cubic-bezier(0.2,0.7,0.2,1)] ${
                        on ? "scale-100 opacity-100" : "scale-[0.96] opacity-0"
                      }`;
                      const style = { ...at(x, y, w, h), transitionDelay: on ? `${120 + k * 90}ms` : "0ms" } as CSSProperties;
                      if (tile.kind === "quote") {
                        return (
                          <div
                            key={k}
                            className={`abs col-span-2 flex items-center rounded-[36px] border border-peach p-6 lg:block lg:rounded-[60px] lg:p-0 ${anim}`}
                            style={style}
                          >
                            <p
                              className="abs text-[17px] lg:text-[20px]"
                              style={{ ...at(56, 56, tile.w), lineHeight: `${tile.lh}px` }}
                            >
                              {rich(tile.text)}
                            </p>
                          </div>
                        );
                      }
                      return (
                        <div
                          key={k}
                          className={`abs relative overflow-hidden rounded-[36px] bg-peach lg:aspect-auto lg:rounded-[60px] ${
                            tile.kind === "empty" ? "hidden lg:block" : ""
                          } ${anim}`}
                          style={{ ...style, aspectRatio: `${w} / ${h}` }}
                        >
                          {tile.kind === "photo" && (
                            <Pic
                              src={tile.src}
                              alt={tile.alt}
                              sizes="(min-width:1024px) 600px, 60vw"
                              className="px-zoom abs absolute inset-0"
                              style={at(...tile.rect)}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </Canvas>
      </div>
    </div>
  );
}

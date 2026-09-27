"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import { Canvas, at } from "../canvas";
import { RoundArrow } from "../icons";
import { openSignup } from "../EventSignup";

// Figma 50:1330 „Spotkajmy się. Na żywo.” + 50:878 karty-bilety (540×774, r=60).
type Event = {
  day: string;
  date: string;
  month: string;
  title: string;
  tag: string;
  tagStyle: "glass" | "outline";
  bg: string;
  rows: [label: string, value: string][];
  /** W Figmie etykiety w 2. karcie są czarne, w pozostałych #818181. */
  labelCls: string;
};

const EVENTS: Event[] = [
  {
    day: "Środa",
    date: "05",
    month: "Październik",
    title: "Podstawy lodów rzemieślniczych",
    tag: "Szkolenie",
    tagStyle: "glass",
    bg: "bg-tan",
    labelCls: "text-mute",
    rows: [
      ["Miejsce", "Akademia Sempre"],
      ["Prowadzenie", "Igor Zarębski"],
      ["Udział", "Szkolenie płatne"],
    ],
  },
  {
    day: "Wtorek",
    date: "11",
    month: "Listopad",
    title: "Poznaj Sempre\nna targach",
    tag: "Wydarzenia",
    tagStyle: "glass",
    bg: "bg-sage-soft",
    labelCls: "text-black",
    rows: [
      ["Miejsce", "Warszawa"],
      ["Na miejscu", "Doradcy Sempre"],
      ["Udział", "Bezpłatny"],
    ],
  },
  {
    day: "Piątek",
    date: "23",
    month: "Grudzień",
    title: "Podstawy lodów rzemieślniczych",
    tag: "Szkolenie",
    tagStyle: "outline",
    bg: "bg-rose",
    labelCls: "text-mute",
    rows: [
      ["Miejsce", "Akademia Sempre"],
      ["Prowadzenie", "Igor Zarębski"],
      ["Udział", "Szkolenie płatne"],
    ],
  },
];

/**
 * Pozycja biletu w rzędzie: slot 0–3 = kolejne miejsca co 560px (jak w Figmie), −1 = wyjazd w lewo,
 * „hidden” = czeka za prawą krawędzią bez animacji (żeby nie przelatywał przez cały ekran).
 */
type SlotState = { slot: number; hidden: boolean };
const STEP = 560;
const MOVE = "duration-[800ms] ease-[cubic-bezier(0.65,0,0.35,1)]";

function Ticket({ e, pos, mobileHidden }: { e: Event; pos: SlotState; mobileHidden: boolean }) {
  const x = (pos.hidden ? 4 : pos.slot) * STEP;
  const offscreen = pos.hidden || pos.slot < 0 || pos.slot > 3;
  return (
    <article
      role="button"
      tabIndex={offscreen ? -1 : 0}
      aria-hidden={offscreen}
      aria-label={`Zapisz się: ${e.title.replace("\n", " ")} — ${e.day} ${e.date} ${e.month}`}
      onClick={() => openSignup(`${e.title.replace("\n", " ")} — ${e.date} ${e.month}`)}
      onKeyDown={(ev) => (ev.key === "Enter" || ev.key === " ") && (ev.preventDefault(), openSignup(`${e.title.replace("\n", " ")} — ${e.date} ${e.month}`))}
      className={`abs relative w-[86vw] max-w-[400px] shrink-0 cursor-pointer snap-center overflow-hidden rounded-[44px] hover:-translate-y-1.5 hover:shadow-[0_18px_40px_rgba(0,0,0,0.10)] focus-visible:outline-2 focus-visible:outline-brand lg:max-w-none lg:rounded-[60px] ${e.bg} ${
        mobileHidden ? "hidden lg:block" : ""
      } ${pos.hidden ? "lg:opacity-0 lg:transition-none" : `transition-[left,opacity,translate,box-shadow] ${MOVE} ${pos.slot < 0 ? "lg:opacity-0" : ""}`}`}
      style={{ ...at(x, 0, 540, 774), transitionDuration: pos.hidden ? undefined : "800ms, 800ms, 300ms, 300ms" } as CSSProperties}
    >
      {/* Góra karty (kolor) */}
      <div className="relative h-[240px] px-8 pt-10 lg:static lg:h-auto lg:p-0">
        <p className="abs text-[20px] leading-[32px]" style={at(56, 56)}>
          {e.day}
        </p>
        <p className="display abs text-[60px] leading-[1.4] tracking-[-0.72px] lg:text-[72px] lg:leading-[138.24px]" style={at(56, 84)}>
          {e.date}
        </p>
        <p className="abs text-[20px] leading-[32px]" style={at(56, 212)}>
          {e.month}
        </p>
        {e.tagStyle === "glass" ? (
          <span
            className="glass abs absolute top-8 right-8 flex h-[48px] items-center justify-center rounded-full px-5 text-[16px] leading-[32px] font-medium lg:top-auto lg:right-auto lg:h-auto lg:px-0"
            style={at(363, 40, 137, 56)}
          >
            {e.tag}
          </span>
        ) : (
          <span
            className="abs absolute top-8 right-8 flex items-center justify-center rounded-full border border-black px-5 py-2.5 text-[16px] leading-[32px] font-medium lg:top-auto lg:right-auto"
            style={at(394, 30, 116, 54)}
          >
            {e.tag}
          </span>
        )}
      </div>

      {/* Dół karty (biały) + ząbki: 14 kółek 20px na styku */}
      <div className="abs relative bg-white px-8 pt-10 pb-12 lg:p-0" style={at(0, 273, 540, 501)}>
        <div aria-hidden className="abs absolute -top-2.5 right-6 left-6 flex justify-between lg:right-auto lg:left-auto" style={at(24, -10, 492, 20)}>
          {Array.from({ length: 14 }, (_, i) => (
            <span key={i} className="size-5 rounded-full bg-white" />
          ))}
        </div>
        <h3
          className="abs text-[28px] leading-[34px] font-semibold whitespace-pre-line lg:text-[36px] lg:leading-[40.788px]"
          style={at(56, 72, 428)}
        >
          {e.title}
        </h3>
        <dl className="abs mt-8 flex flex-col gap-2.5 lg:mt-0" style={at(56, 210, 178)}>
          {e.rows.map(([label, value]) => (
            <div key={label} className="text-[20px] leading-[32px] whitespace-nowrap">
              <dt className={e.labelCls}>{label}</dt>
              <dd className="font-medium">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </article>
  );
}

// Rząd powielony — strzałka przesuwa kalendarz o jeden bilet bez końca.
const LOOP = [...EVENTS, ...EVENTS];
const N = LOOP.length;

export function Events() {
  const [start, setStart] = useState(0);
  return (
    <Canvas height={1148} inner="flex flex-col gap-6 px-5 pt-16 pb-24 lg:overflow-x-clip">
      <h2
        className="display abs text-[28px] leading-[1.6] tracking-[-0.01em] lg:text-[32px] lg:leading-[61.44px] lg:tracking-[-0.32px]"
        style={at(156, 100, 546)}
      >
        Spotkajmy się.
        <br />
        Na żywo.
      </h2>
      <p className="abs text-[20px] leading-[28px] lg:text-[24px] lg:leading-[32px]" style={at(738, 100, 546)}>
        Nowe umiejętności, inspiracje i rozmowy o <strong className="font-semibold">Twoim biznesie.</strong> Zobacz, gdzie
        możemy się spotkać.
      </p>

      <div
        className="abs -mx-5 mt-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 [scrollbar-width:none] lg:mx-0 lg:mt-0 lg:overflow-visible lg:p-0"
        style={at(100, 310, 1655, 774)}
      >
        {LOOP.map((e, k) => {
          const o = (k - start + N) % N;
          const pos: SlotState = o <= 4 ? { slot: o, hidden: o === 4 } : o === N - 1 ? { slot: -1, hidden: false } : { slot: 4, hidden: true };
          return <Ticket key={k} e={e} pos={pos} mobileHidden={k >= EVENTS.length} />;
        })}
        <div
          aria-hidden
          className="abs pointer-events-none z-10 hidden bg-linear-to-l from-cream to-cream/0 lg:block"
          style={at(1088, 0, 252, 774)}
        />
        {/* Figma 85:2691 — strzałka przesuwająca kalendarz (60×60, #f4495d) */}
        <RoundArrow
          label="Następne wydarzenia"
          onClick={() => setStart((v) => (v + 1) % N)}
          className="abs z-20 hidden lg:flex"
          style={at(1224, 357, 60, 60)}
        />
      </div>
    </Canvas>
  );
}

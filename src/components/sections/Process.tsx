"use client";

import { useState } from "react";
import { Canvas, Pic, at } from "../canvas";
import { ArrowDown } from "../icons";

// Figma 59:1823 „Od pomysłu po kolejne sezony” — akordeon + zdjęcie w masce z trzech „pigułek”.
// Figma ma treść tylko dla 1. pozycji (rozwiniętej) — opisy 2–4 to PLACEHOLDERY do podmiany.
// Każda pozycja ma własne zdjęcie w masce (Figma 59:2041 / 106:2988 / 106:3026 / 106:3060) — przenikanie przy zmianie.
const ITEMS = [
  {
    title: "Pomysł i przygotowanie lokalu",
    body: "Doradztwo, pomoc w projektowaniu oraz wsparcie w kwestiach formalnych i sanitarnych.",
    img: "/img/process-idea.png",
    alt: "Planowanie lokalu z doradcą Sempre",
    rect: [-351, -43, 1153, 768] as const,
  },
  {
    title: "Produkty i składniki",
    body: "Sprawdzone składniki i gotowe produkty od światowych marek — dobrane do Twojej oferty i skali lokalu.",
    img: "/img/photo-chocolate.png",
    alt: "Cukierniczka przygotowuje czekoladę i owoce",
    rect: [-48, -78, 1014, 676] as const,
  },
  {
    title: "Szkolenia i wdrożenie zespołu",
    body: "Szkolenia w Akademii Sempre i na miejscu, żeby zespół od pierwszego dnia pracował pewnie.",
    img: "/img/process-training.png",
    alt: "Szkolenie zespołu lodziarni",
    rect: [-48, -58, 1014, 676] as const,
  },
  {
    title: "Wsparcie w rozwoju",
    body: "Nowe smaki, sezonowe karty i kolejne lokale — jesteśmy z Tobą także po otwarciu.",
    img: "/img/process-growth.png",
    alt: "Wsparcie w rozwoju lokalu",
    rect: [-74, -80, 1080, 720] as const,
  },
];

export function Process() {
  const [open, setOpen] = useState(0);
  // Zdjęcie ostatnio rozwiniętej pozycji (po zwinięciu wszystkich zostaje ostatnie).
  const [shown, setShown] = useState(0);

  return (
    <Canvas height={921} inner="flex flex-col gap-6 px-5 pt-20 pb-16">
      <h2
        className="display abs text-[28px] leading-[1.6] tracking-[-0.01em] lg:text-[32px] lg:leading-[61.44px] lg:tracking-[-0.32px]"
        style={at(156, 110, 546)}
      >
        <span className="text-teal">Od pomysłu</span>
        <br />
        po kolejne sezony
      </h2>
      <p className="abs text-[18px] leading-[28px] lg:text-[20px] lg:leading-[32px]" style={at(738, 110, 546)}>
        Pomagamy zaplanować start, przygotować lokal
        <br className="hidden lg:inline" /> i zespół, a później <strong className="font-semibold">wspieramy Cię </strong>
        w codziennej pracy
        <br className="hidden lg:inline" /> i rozwoju.
      </p>

      {/* Frame 31 — akordeon 491px, odstępy 20, linie #000/20 */}
      <div className="abs mt-4 flex flex-col gap-5 lg:mt-0" style={at(156, 377, 491)}>
        {ITEMS.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={item.title} className="flex flex-col gap-5">
              {i > 0 && <hr className="border-black/20" />}
              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => {
                    setOpen(isOpen ? -1 : i);
                    if (!isOpen) setShown(i);
                  }}
                  className={`display flex items-start justify-between gap-2.5 text-left text-[14px] leading-[26.88px] tracking-[-0.14px] ${isOpen ? "text-teal" : "text-black"}`}
                >
                  {item.title}
                  <ArrowDown className={`size-5 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                >
                  <p className="overflow-hidden pr-14 text-[18px] leading-[28px] lg:text-[20px] lg:leading-[32px]">
                    {item.body}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Group 1 — maska: trzy zaokrąglone prostokąty 323×560 co 267px */}
      <div className="abs relative mt-8 aspect-[857/560] w-[140%] lg:mt-0 lg:aspect-auto" style={at(739, 232, 857, 560)}>
        <svg className="absolute size-0" aria-hidden>
          <clipPath id="pill-mask" clipPathUnits="objectBoundingBox">
            <rect x="0" y="0" width={323 / 857} height="1" rx={161.5 / 857} ry={161.5 / 560} />
            <rect x={267 / 857} y="0" width={323 / 857} height="1" rx={161.5 / 857} ry={161.5 / 560} />
            <rect x={534 / 857} y="0" width={323 / 857} height="1" rx={161.5 / 857} ry={161.5 / 560} />
          </clipPath>
        </svg>
        <div className="absolute inset-0 [clip-path:url(#pill-mask)]">
          {ITEMS.map((item, i) => (
            <div
              key={item.img}
              aria-hidden={shown !== i}
              className={`absolute inset-0 transition-[opacity,scale] duration-700 ease-[cubic-bezier(0.2,0.7,0.2,1)] ${
                shown === i ? "scale-100 opacity-100" : "scale-[1.04] opacity-0"
              }`}
            >
              <Pic
                src={item.img}
                alt={item.alt}
                sizes="(min-width:1024px) 1080px, 140vw"
                className="px-zoom abs absolute inset-0"
                style={at(item.rect[0], item.rect[1], item.rect[2], item.rect[3])}
              />
            </div>
          ))}
        </div>
      </div>
    </Canvas>
  );
}

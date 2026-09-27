"use client";

import { useState } from "react";
import { Canvas, Pic, Wave, at } from "../canvas";
import { ArrowRight } from "../icons";

// Figma 50:1355 „Na jakim etapie jesteś?” — białe tło z falistym dolnym brzegiem (Union 50:765).
// Karta pod kursorem przyjmuje stan „rozwinięty” z Figmy (jak „Rozwijam lodziarnię”):
// zdjęcie 493→340, tytuł w górę, opis + CTA. Bez hovera wszystkie karty są zwinięte.
// Opisy kart 1 i 3 nie istnieją w Figmie — to PLACEHOLDERY do podmiany.
const headingCls =
  "display text-[28px] leading-[1.6] tracking-[-0.01em] lg:text-[32px] lg:leading-[61.44px] lg:tracking-[-0.32px]";
const cardTitle = "display text-[14px] leading-[26.88px] tracking-[-0.14px]";

type Stage = {
  title: string;
  body: string;
  img: string;
  alt: string;
  x: number;
  /** Kadr zdjęcia z Figmy (względem ramki karty). */
  image: [x: number, y: number, w: number, h: number];
  /** Kadr dla zwiniętej karty (ramka 493 wys.), gdy kadr z Figmy jej nie pokrywa. */
  imageClosed?: [x: number, y: number, w: number, h: number];
};

const STAGES: Stage[] = [
  {
    title: "Otwieram lodziarnię",
    body: "Od pomysłu i lokalu po pierwszą gałkę. Pomożemy zaplanować start krok po kroku.",
    img: "/img/stage-open.webp",
    alt: "Otwarcie lodziarni",
    x: 100,
    image: [-225, -67, 836, 627],
  },
  {
    title: "Rozwijam lodziarnię",
    body: "Nowe smaki, szkolenia zespołu czy kolejny lokal? Dopasujemy wsparcie do Twojego następnego kroku.",
    img: "/img/stage-grow-v2.webp",
    alt: "Rozwój lodziarni",
    x: 527,
    image: [-173, -244, 810, 608],
    imageClosed: [-259, -244, 982, 737],
  },
  {
    title: "Prowadzę lokal HoReCa",
    body: "Desery, kawa i lody w karcie Twojego lokalu. Dobierzemy produkty i przeszkolimy zespół.",
    img: "/img/stage-horeca-v2.webp",
    alt: "Lokal HoReCa",
    x: 953,
    image: [-96, -115, 965, 644],
  },
];

const EASE = "duration-500 ease-[cubic-bezier(0.2,0.7,0.2,1)]";

export function Stages() {
  const [hovered, setHovered] = useState<number | null>(null);
  const active = hovered; // domyślnie wszystkie karty zwinięte

  return (
    <Canvas height={884} className="z-10 bg-white lg:bg-transparent" inner="flex flex-col gap-6 px-5 pt-14 pb-16">
      <Wave src="/svg/wave-white-v2.svg" y={0} h={934} />
      <h2 className={`abs ${headingCls}`} style={at(159, 56, 546)}>
        Na jakim
        <br />
        <span className="text-sun">etapie jesteś?</span>
      </h2>
      <p className="abs text-[18px] leading-[28px] lg:text-[20px] lg:leading-[32px]" style={at(742, 56, 546)}>
        Dopiero zaczynasz czy planujesz <strong className="font-semibold">kolejny krok?</strong> Zobacz, jak możemy Ci
        pomóc
      </p>

      <div className="mt-6 flex flex-col gap-10 lg:mt-0" onMouseLeave={() => setHovered(null)}>
        {STAGES.map((s, i) => {
          const open = active === i;
          return (
            <article
              key={s.title}
              className="abs flex flex-col gap-4 lg:gap-0"
              style={at(s.x, 234, 387, 560)}
              onMouseEnter={() => setHovered(i)}
              onFocus={() => setHovered(i)}
            >
              {/* Hover: zdjęcie lekko się zmniejsza (wycentrowane) — obok rozwijania karty */}
              <div
                className={`abs relative aspect-[387/400] overflow-hidden rounded-[40px] bg-brand-deep transition-[height,scale] lg:aspect-auto ${EASE} ${
                  hovered === i ? "lg:scale-[0.96]" : "lg:scale-100"
                }`}
                style={{ ...at(0, 0, 387, open ? 340 : 493), transformOrigin: "50% 50%" }}
              >
                <Pic
                  src={s.img}
                  alt={s.alt}
                  sizes="(min-width:1024px) 969px, 100vw"
                  className={`px-zoom abs absolute inset-0 transition-all ${EASE}`}
                  style={at(...(open ? s.image : (s.imageClosed ?? s.image)))}
                />
              </div>
              <h3 className={`abs transition-[top] ${EASE} ${cardTitle}`} style={at(0, open ? 380 : 533, 387)}>
                {s.title}
              </h3>
              <p
                className={`abs text-[16px] leading-[24px] transition-opacity ${EASE} ${open ? "lg:opacity-100 lg:delay-150" : "lg:pointer-events-none lg:opacity-0"}`}
                style={at(0, 417, 387)}
              >
                {s.body}
              </p>
              <a
                href="#kontakt"
                tabIndex={open ? 0 : -1}
                className={`display abs group flex items-center gap-5 text-[10px] leading-[19.2px] tracking-[-0.1px] transition-opacity ${EASE} ${open ? "lg:opacity-100 lg:delay-200" : "lg:pointer-events-none lg:opacity-0"}`}
                style={at(0, 540, 387, 20)}
              >
                Zobacz możliwości
                <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
              </a>
            </article>
          );
        })}
      </div>
    </Canvas>
  );
}

import type { CSSProperties } from "react";
import { Canvas, Pic, at, bleed } from "../canvas";
import { ExpertsSlider } from "./ExpertsSlider";

// Figma 50:932 „Wiedza od ludzi z praktyką” + awatary + 50:954 zdjęcie z kartami ekspertów.
export function Experts() {
  return (
    <Canvas height={1279} inner="flex flex-col px-5 pt-16">
      <div className="relative">
        <h2
          className="display abs text-[40px] leading-[1.5] tracking-[-0.01em] text-brand lg:text-[100px] lg:leading-[192px] lg:tracking-[-1px] lg:whitespace-nowrap"
          style={bleed(98, 192)}
        >
          <span className="px-drift inline-block lg:w-max">Wiedza od ludzi z praktyką</span>
        </h2>

        {/* Awatary (Frame 1430105288 / 1430105297): 92×119, r=10, obrócone. Obrót wokół środka (pod animację
            „pop-in”) — x/y przeliczone tak, by poza była identyczna jak w Figmie (tam obrót wokół rogu). */}
        <div
          className="pop-in abs absolute top-[70px] left-[38%] hidden lg:block h-[80px] w-[62px] -rotate-[9.4deg] overflow-hidden rounded-[10px] bg-teal lg:h-auto lg:w-auto"
          style={{ ...at(568, 194.99, 92, 119, -9.4), transformOrigin: "50% 50%" } as CSSProperties}
        >
          <Pic src="/img/avatar-igor.png" alt="Igor Zarębski" sizes="482px" className="abs absolute inset-0 lg:inset-auto" style={at(-176.5, -35.6, 482, 271, 9.4)} />
        </div>
        <div
          className="pop-in abs absolute -top-6 right-[18%] hidden lg:block h-[80px] w-[62px] rotate-[15deg] overflow-hidden rounded-[10px] bg-sun lg:h-auto lg:w-auto"
          style={{ ...at(831.83, 71.88, 92, 119, 15), transformOrigin: "50% 50%" } as CSSProperties}
        >
          <Pic src="/img/avatar-michal.png" alt="Michał Iwaniuk" sizes="141px" className="abs absolute inset-0 lg:inset-auto" style={at(-24, -2.9, 141, 210)} />
        </div>
      </div>

      <p className="abs mt-10 text-[20px] leading-[28px] lg:text-[24px] lg:leading-[32px]" style={at(739, 320, 545)}>
        Poznaj ekspertów, którzy dzielą się doświadczeniem i pomagają wdrożyć wiedzę w codzienną pracę Twojego zespołu.
      </p>

      {/* Frame 45 (50:954 / 84:2544): zdjęcie na całą szerokość + karuzela ekspertów */}
      <ExpertsSlider />
    </Canvas>
  );
}

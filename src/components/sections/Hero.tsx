import type { CSSProperties } from "react";
import { BLEED_X, Canvas, Pic, at, bleed, fromBottom, fromLeft, fromRight } from "../canvas";

/** at() z x przypiętym do krawędzi okna — hero rozciąga się na pełną szerokość. */
const edge = (x: string, y: number | string, w?: number, h?: number) =>
  ({ ...at(0, 0, w, h), "--x": x, "--y": typeof y === "number" ? `${y}px` : y }) as CSSProperties;
/** y z Figmy (ramka 905px) liczone od dołu hero — hero ma wysokość okna. */
const low = (y: number) => fromBottom(y, 905);
import { ConeSpin } from "../ConeSpin";
import { LiquidGlass } from "../LiquidGlass";
import { PlayVideoButton } from "../PlayVideoButton";
import { SignupTrigger } from "../EventSignup";
import { ArrowFromDot, Play } from "../icons";

// Figma 50:766 „Frame 14” — 1440×905, tło #fecb8c.
const NAV = ["Współpraca", "Świat Sempre", "Akademia", "Sklep Online", "Blog", "Porozmawiajmy"];

function MarqueeGroup() {
  return (
    <div className="flex shrink-0 items-center gap-6 pr-[98px]">
      <span>24 września</span>
      <span className="size-1 rounded-full bg-white" />
      <span>Demo SOSA Ingrediens z Polem Cabanasem w Pruszkowie</span>
      <span className="size-1 rounded-full bg-white" />
      <SignupTrigger
        eventName="Demo SOSA Ingrediens z Polem Cabanasem w Pruszkowie — 24 września"
        className="display cursor-pointer uppercase hover:underline"
      >
        Zapisz się
      </SignupTrigger>
    </div>
  );
}

export function Hero() {
  return (
    <Canvas height="var(--hh)" className="overflow-clip bg-peach" inner="hero-canvas flex min-h-[100svh] flex-col px-5 pt-5">
      <Pic
        src="/img/logo-sempre.webp"
        alt="Sempre"
        fit="cover"
        sizes="136px"
        preload
        className="abs h-[52px] w-[100px] lg:h-auto"
        style={edge(fromLeft(40), 20, 136, 71)}
      />

      <nav className="abs hidden items-center gap-10 text-[14px] leading-[15.862px] font-medium lg:flex" style={edge(fromRight(681), 56)}>
        {NAV.map((item) => (
          <a key={item} href={item === "Porozmawiajmy" ? "#kontakt" : "#"} className="whitespace-nowrap hover:opacity-60">
            {item}
          </a>
        ))}
      </nav>

      <h1
        className="display hero-title abs mt-10 text-center text-[44px] leading-[1.25] tracking-[-0.01em] text-white lg:text-[125.543px] lg:leading-[215.607px] lg:tracking-[-1.2554px] lg:whitespace-nowrap"
        style={{ "--x": `calc(${BLEED_X} - var(--vw) * 0.010417)`, "--y": "115px", "--w": "calc(var(--vw) * 1.021528)" } as CSSProperties}
      >
        <span className="px-hero-out block">Zacznij od Sempre</span>
      </h1>

      <ConeSpin
        className="px-cone abs mx-auto -mt-4 aspect-[432/714] w-[62%] max-w-[320px] [mask-image:linear-gradient(to_bottom,black_78%,transparent)] lg:max-w-none lg:[mask-image:none]"
        style={{ ...at(504, 0, 432, 714), "--y": low(144) } as CSSProperties}
      />

      <p className="abs mt-8 mb-10 text-[20px] leading-[28px] lg:text-[24px] lg:leading-[32px]" style={edge(fromLeft(100), low(632), 428)}>
        Pomagamy <strong className="font-semibold">otwierać i rozwijać</strong> lodziarnie oraz lokale HoReCa. Łączymy
        składniki, wiedzę i wsparcie ludzi, którzy znają ten biznes
      </p>

      {/* Miniatura wideo (Frame 18) */}
      <PlayVideoButton
        className="abs group hidden overflow-hidden rounded-[20px] bg-brand-deep lg:block"
        style={edge(fromRight(1148), low(642), 192, 108)}
      >
        <Pic src="/img/photo-meeting.webp" sizes="204px" className="abs" style={at(-6, -14, 204, 136)} />
        {/* Rectangle 13: biel 20% + efekt GLASS (Figma 70:2507) */}
        <LiquidGlass className="abs" style={at(0, 0, 192, 108)} radius={20} strength={12} edge={0.18} />
        <span
          className="abs flex items-center justify-center rounded-full bg-white text-black transition-transform group-hover:scale-110"
          style={at(71, 29, 50, 50)}
        >
          <Play />
        </span>
      </PlayVideoButton>

      {/* Szklany przycisk „przewiń” (Frame 49) */}
      <a
        href="#o-nas"
        aria-label="Przewiń w dół"
        className="abs group hidden items-center justify-center rounded-full text-white lg:flex"
        style={{ ...at(680, 0, 80, 80), "--y": low(724) } as CSSProperties}
      >
        {/* Frame 49: biel 20% + efekt GLASS (Figma 69:2500) */}
        <LiquidGlass className="absolute inset-0" radius={40} strength={12} edge={0.3} />
        <ArrowFromDot className="relative size-6 transition-transform duration-300 group-hover:translate-y-0.5" />
      </a>

      {/* Pasek wydarzeń (Frame 6) */}
      <div
        className="abs -mx-5 mt-auto h-[47px] shrink-0 overflow-hidden bg-brand lg:mx-0"
        style={{ ...bleed(0, 47), "--y": low(858) } as CSSProperties}
      >
        <div
          className="display marquee flex h-full w-max items-center text-[10px] leading-[19.2px] tracking-[0.2px] whitespace-nowrap text-white lg:ml-[-295px]"
        >
          <MarqueeGroup />
          <MarqueeGroup />
          <MarqueeGroup />
          <MarqueeGroup />
          <MarqueeGroup />
        </div>
      </div>
    </Canvas>
  );
}

import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";

/**
 * Pozycja elementu na płótnie desktop (px z Figmy, względem sekcji/rodzica).
 * Działa tylko z klasą `abs` i tylko od 1024px — na mobile element jest w zwykłym flow.
 */
export function at(x: number, y: number, w?: number, h?: number, r?: number): CSSProperties {
  const s: Record<string, string> = { "--x": `${x}px`, "--y": `${y}px` };
  if (w !== undefined) s["--w"] = `${w}px`;
  if (h !== undefined) s["--h"] = `${h}px`;
  if (r !== undefined) s["--r"] = `${r}deg`;
  return s as CSSProperties;
}

/**
 * Ścieżka do pliku z /public z uwzględnieniem basePath (GitHub Pages serwuje stronę pod /sempre/).
 * Przy statycznym eksporcie next/image (unoptimized) i zwykłe URL-e nie dostają basePath automatycznie.
 */
export const asset = (path: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;

/** Lewa krawędź okna w układzie płótna (płótno 1440 jest wyśrodkowane). */
export const BLEED_X = "calc(720px - var(--vw) / 2)";

/** Element od lewej do prawej krawędzi okna (tylko desktop — jak `at`). */
export function bleed(y: number, h?: number): CSSProperties {
  const s: Record<string, string> = { "--x": BLEED_X, "--y": `${y}px`, "--w": "var(--vw)" };
  if (h !== undefined) s["--h"] = `${h}px`;
  return s as CSSProperties;
}

/** x z Figmy zakotwiczony do LEWEJ krawędzi okna (na 1440 = Figma, szerzej — trzyma odstęp od krawędzi). */
export const fromLeft = (x: number) => `calc(${x}px + ${BLEED_X})`;
/** x z Figmy zakotwiczony do PRAWEJ krawędzi okna. */
export const fromRight = (x: number) => `calc(${x}px + (var(--vw) - 1440px) / 2)`;

/** y z Figmy zakotwiczone do DOŁU sekcji o wysokości --hh (hero na pełną wysokość okna). */
export const fromBottom = (figmaY: number, figmaH: number) => `calc(var(--hh) - ${figmaH - figmaY}px)`;

type CanvasProps = {
  /** Wysokość sekcji na desktopie (px z Figmy) albo wyrażenie CSS (np. zależne od wysokości okna). */
  height: number | string;
  /** Klasy zewnętrznego, pełnoszerokościowego wrappera (tło). */
  className?: string;
  /** Klasy płótna — tu layout mobile (ignorowany od 1024px). */
  inner?: string;
  id?: string;
  children: ReactNode;
  /** Warstwy pełnej szerokości (np. fale) — poza płótnem 1440. */
  bleed?: ReactNode;
};

export function Canvas({ height, className = "", inner = "", id, children, bleed }: CanvasProps) {
  return (
    <section id={id} className={`relative overflow-x-clip ${className}`}>
      {bleed}
      <div className={`canvas ${inner}`} style={{ "--ch": typeof height === "number" ? `${height}px` : height } as CSSProperties}>
        {children}
      </div>
    </section>
  );
}

type PicProps = {
  src: string;
  alt?: string;
  /** Klasy wrappera (pozycja/rozmiar/zaokrąglenie). */
  className?: string;
  style?: CSSProperties;
  /** Figma: FILL=cover, FIT=contain, STRETCH=fill. */
  fit?: "cover" | "contain" | "fill";
  sizes?: string;
  preload?: boolean;
};

export function Pic({ src, alt = "", className = "", style, fit = "cover", sizes = "50vw", preload }: PicProps) {
  const fitClass = fit === "cover" ? "object-cover" : fit === "contain" ? "object-contain" : "object-fill";
  return (
    <div className={`${/\babsolute\b/.test(className) ? "" : "relative "}${className}`} style={style}>
      <Image src={asset(src)} alt={alt} fill sizes={sizes} preload={preload} className={fitClass} />
    </div>
  );
}

/**
 * Kształt z falistą krawędzią (Figma „Union”, 1518px szer.). Siedzi w płótnie (skaluje się z nim),
 * a na ekranach >1440 rozciąga się na całą szerokość okna. Tylko desktop.
 */
export function Wave({ src, y, h }: { src: string; y: number; h: number }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute left-1/2 hidden -translate-x-1/2 bg-size-[100%_100%] lg:block"
      style={{ top: y, height: h, width: "max(1518px, calc(100vw + 80px))", backgroundImage: `url(${asset(src)})` }}
    />
  );
}

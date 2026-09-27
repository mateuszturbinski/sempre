import type { Metadata } from "next";
import { Boldonse, Figtree } from "next/font/google";
import "./globals.css";

const boldonse = Boldonse({
  variable: "--font-boldonse",
  weight: "400",
  subsets: ["latin", "latin-ext"],
});

// Zamiennik Jokkera (komercyjny) — patrz @font-face w globals.css.
const body = Figtree({
  variable: "--font-body",
  weight: ["400", "500", "600"],
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "Sempre — Zacznij od Sempre",
  description:
    "Pomagamy otwierać i rozwijać lodziarnie oraz lokale HoReCa. Łączymy składniki, wiedzę i wsparcie ludzi, którzy znają ten biznes.",
};

// Skala płótna 1440px dla szerokości 1024–1440 (patrz .canvas w globals.css).
// Oraz: włączenie animacji wejścia (js-reveal) przed pierwszym renderem — bez mignięcia treści.
// Bezpiecznik: jeśli React się nie załaduje w 3 s, zdejmujemy ukrywanie.
const zoomScript = `(function(){var d=document.documentElement;function f(){d.style.setProperty('--z',String(Math.min(1,d.clientWidth/1440)))}f();addEventListener('resize',f);if(!matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('js-reveal');setTimeout(function(){if(!window.__revealReady)d.classList.remove('js-reveal')},3000)}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pl" suppressHydrationWarning className={`${boldonse.variable} ${body.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: zoomScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

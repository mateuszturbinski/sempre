"use client";

import { useEffect } from "react";

/**
 * Ożywia wejście elementów płótna (.abs) przy scrollu. Elementy w kontenerze `.rv-each`
 * wchodzą pojedynczo (np. karty marek). Elementy wchodzące w tej samej klatce dostają
 * kaskadowe opóźnienie.
 */
export function Reveal() {
  useEffect(() => {
    const w = window as Window & { __revealReady?: boolean };
    w.__revealReady = true;
    const root = document.documentElement;
    if (!root.classList.contains("js-reveal")) return;

    const targets = new Set<HTMLElement>();
    const add = (el: Element) => {
      if (el instanceof HTMLElement && !el.hasAttribute("aria-hidden")) targets.add(el);
    };
    document
      .querySelectorAll(".canvas > .abs, .canvas > :not(.abs) > .abs, .canvas > :not(.abs) > :not(.abs) > .abs")
      .forEach((el) => {
        if (el.classList.contains("rv-each")) el.querySelectorAll(":scope > *").forEach(add);
        else add(el);
      });

    const byPosition = (a: DOMRect, b: DOMRect) => a.top - b.top || a.left - b.left;
    const show = (els: HTMLElement[]) =>
      els.forEach((el, i) => {
        const delay = Math.min(i, 8) * 90;
        el.style.setProperty("--rv-delay", `${delay}ms`);
        el.classList.add("rv-in");
        io.unobserve(el);
        // Po wjeździe oddajemy elementowi jego własne transition (hovery itp.).
        window.setTimeout(() => el.classList.remove("rv", "rv-in"), 1300 + delay);
      });

    const io = new IntersectionObserver(
      (entries) => {
        const entering = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => byPosition(a.boundingClientRect, b.boundingClientRect))
          .map((e) => e.target as HTMLElement);
        show(entering);
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );

    targets.forEach((el) => {
      el.classList.add("rv");
      io.observe(el);
    });

    // To, co widać od razu (hero), wjeżdża po chwili — nie czekamy na obserwator,
    // który w karcie w tle nie odpala się do czasu jej pokazania.
    const firstScreen = [...targets]
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return r.bottom > 0 && r.top < window.innerHeight;
      })
      .sort((a, b) => byPosition(a.getBoundingClientRect(), b.getBoundingClientRect()));
    const t = window.setTimeout(() => show(firstScreen), 60);

    return () => {
      window.clearTimeout(t);
      io.disconnect();
    };
  }, []);

  return null;
}

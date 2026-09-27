"use client";

import type { CSSProperties, ReactNode } from "react";
import { openVideo } from "./VideoModal";

/** Przycisk otwierający wspólny modal wideo (używany w hero, które jest komponentem serwerowym). */
export function PlayVideoButton({ className, style, children }: { className: string; style?: CSSProperties; children: ReactNode }) {
  return (
    <button type="button" aria-label="Odtwórz film" className={className} style={style} onClick={openVideo}>
      {children}
    </button>
  );
}

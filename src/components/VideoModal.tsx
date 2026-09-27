"use client";

import { useEffect, useRef, useState } from "react";
import { asset } from "./canvas";

/**
 * Wspólny modal wideo. Otwiera się zdarzeniem `sempre:video` (openVideo()) — z hero i z sekcji wideo.
 * Plik: public/video/sempre.mp4 (do dostarczenia). Bez pliku modal pokazuje komunikat zastępczy.
 */
export const VIDEO_SRC = asset("/video/sempre.mp4");
const EVENT = "sempre:video";

export function openVideo() {
  window.dispatchEvent(new Event(EVENT));
}

export function VideoModal() {
  const ref = useRef<HTMLDialogElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const open = () => {
      ref.current?.showModal();
      videoRef.current?.play().catch(() => {});
    };
    addEventListener(EVENT, open);
    return () => removeEventListener(EVENT, open);
  }, []);

  const close = () => {
    videoRef.current?.pause();
    ref.current?.close();
  };

  return (
    <dialog
      ref={ref}
      onClose={() => videoRef.current?.pause()}
      onClick={(e) => e.target === ref.current && close()}
      className="m-auto w-[min(92vw,1280px)] overflow-visible bg-transparent p-0 backdrop:bg-black/80 backdrop:backdrop-blur-sm"
    >
      <button
        type="button"
        onClick={close}
        aria-label="Zamknij film"
        className="absolute -top-12 right-0 flex size-10 items-center justify-center rounded-full bg-white text-black transition-transform hover:scale-110"
      >
        <svg viewBox="0 0 20 20" className="size-5" fill="none" aria-hidden>
          <path d="M5 5l10 10M15 5 5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
      <div className="relative aspect-video overflow-hidden rounded-[24px] bg-black">
        {failed ? (
          <p className="absolute inset-0 flex items-center justify-center p-6 text-center text-[18px] text-white/80">
            Film pojawi się tu wkrótce.
          </p>
        ) : (
          <video
            ref={videoRef}
            src={VIDEO_SRC}
            controls
            playsInline
            preload="none"
            poster={asset("/img/photo-team.webp")}
            onError={() => setFailed(true)}
            className="size-full object-cover"
          />
        )}
      </div>
    </dialog>
  );
}

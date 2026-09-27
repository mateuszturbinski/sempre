"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { ArrowRight } from "./icons";

/**
 * Figma 85:2631 „Overlay” — zapis na wydarzenie: tło #000/60 + blur 40, karta 642px (r=40, pad 56, gap 40,
 * cienie 0 8 42 #000/24 + 0 0 4 #000/12), pola jak w formularzu kontaktowym + NIP.
 * Otwierane zdarzeniem `sempre:signup` (openSignup(nazwa wydarzenia)) — z biletów i z paska w hero.
 * Brak backendu: po wysłaniu pokazujemy potwierdzenie (do podpięcia pod API/CRM).
 */
const EVENT = "sempre:signup";

export function openSignup(eventName: string) {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: eventName }));
}

const FIELDS = [
  { name: "name", label: "Twoje imię i nazwisko", placeholder: "Jak masz na imię i nazwisko?", type: "text", autoComplete: "name", inputMode: undefined },
  { name: "email", label: "Email", placeholder: "Podaj swój e-mail", type: "email", autoComplete: "email", inputMode: undefined },
  { name: "phone", label: "Telefon", placeholder: "Numer telefonu", type: "tel", autoComplete: "tel", inputMode: undefined },
  { name: "nip", label: "Nip", placeholder: "Wpisz nip firmy", type: "text", autoComplete: "off", inputMode: "numeric" as const },
] as const;

export function EventSignup() {
  const ref = useRef<HTMLDialogElement>(null);
  const [eventName, setEventName] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const open = (e: Event) => {
      setEventName((e as CustomEvent<string>).detail ?? "");
      setSent(false);
      ref.current?.showModal();
    };
    addEventListener(EVENT, open);
    return () => removeEventListener(EVENT, open);
  }, []);

  const close = () => ref.current?.close();

  return (
    <dialog
      ref={ref}
      aria-labelledby="signup-title"
      onClick={(e) => e.target === ref.current && close()}
      className="signup-dialog m-auto max-h-[calc(100dvh-32px)] w-[min(642px,calc(100vw-32px))] overflow-y-auto rounded-[32px] bg-white p-0 text-black shadow-[0_8px_42px_rgba(0,0,0,0.24),0_0_4px_rgba(0,0,0,0.12)] backdrop:bg-black/60 backdrop:backdrop-blur-[40px] lg:rounded-[40px]"
    >
      <div className="relative flex flex-col justify-center gap-10 p-6 sm:p-14">
        <button
          type="button"
          onClick={close}
          aria-label="Zamknij"
          className="absolute top-5 right-5 flex size-10 items-center justify-center rounded-full text-black/50 transition-colors hover:bg-black/5 hover:text-black sm:top-6 sm:right-6"
        >
          <svg viewBox="0 0 20 20" className="size-5" fill="none" aria-hidden>
            <path d="M5 5l10 10M15 5 5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <h2 id="signup-title" className="max-w-[304px] pr-8 text-[30px] leading-[34px] font-semibold sm:pr-0 sm:text-[36px] sm:leading-[40.788px]">
          {sent ? "Dziękujemy za zapis!" : "Zapisz się na wydarzenie."}
        </h2>

        {sent ? (
          <Confirmation>
            Potwierdzenie udziału{eventName ? <> w wydarzeniu <strong className="font-semibold">„{eventName}”</strong></> : null} wyślemy na
            podany adres e-mail.
          </Confirmation>
        ) : (
          <form
            className="flex flex-col gap-10"
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
          >
            <input type="hidden" name="event" value={eventName} />
            <div className="flex flex-col gap-2.5">
              {FIELDS.map((f) => (
                <label key={f.name} className="flex flex-col gap-3">
                  <span className="text-[16px] leading-[32px] font-semibold">{f.label}</span>
                  <input
                    name={f.name}
                    type={f.type}
                    autoComplete={f.autoComplete}
                    inputMode={f.inputMode}
                    placeholder={f.placeholder}
                    required={f.name === "name" || f.name === "email"}
                    className="h-[54px] rounded-full border border-black px-4 text-[18px] leading-[32px] font-medium outline-none placeholder:text-black/42 focus:ring-2 focus:ring-brand/40 sm:text-[20px]"
                  />
                </label>
              ))}
            </div>

            <div className="flex flex-col gap-5">
              <button
                type="submit"
                className="group flex h-[66px] items-center justify-center gap-4 rounded-full border border-brand bg-brand py-3 pr-6 pl-3 text-[16px] leading-[18.128px] font-semibold tracking-[0.64px] text-white transition-colors hover:bg-brand-deep"
              >
                <span className="flex size-10 items-center justify-center rounded-full bg-white p-2.5 text-brand transition-transform group-hover:translate-x-1">
                  <ArrowRight />
                </span>
                Wyślij wiadomość
              </button>
              <p className="text-center text-[14px] leading-[20px] font-medium text-black/42">
                Informacje o przetwarzaniu danych znajdziesz w{" "}
                <a href="#" className="underline hover:text-black">
                  polityce prywatności.
                </a>
              </p>
            </div>
          </form>
        )}
      </div>
    </dialog>
  );
}

function Confirmation({ children }: { children: ReactNode }) {
  return <p className="text-[20px] leading-[32px]">{children}</p>;
}

/** Przycisk/link otwierający zapis (do użycia w komponentach serwerowych). */
export function SignupTrigger({ eventName, className, children }: { eventName: string; className?: string; children: ReactNode }) {
  return (
    <button type="button" className={className} onClick={() => openSignup(eventName)}>
      {children}
    </button>
  );
}

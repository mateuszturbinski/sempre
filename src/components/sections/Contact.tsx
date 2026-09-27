"use client";

import { useState } from "react";
import { Canvas, at } from "../canvas";
import { ArrowRight } from "../icons";

// Figma 50:934 … 50:1004 — „Porozmawiajmy o Twoim biznesie.” + formularz (642×830, r=40, pad 80/56).
const TOPICS = ["Otwieram lodziarnie", "Rozwijam lokal", "Szukam produktów", "Szkolenia", "Inny temat"];

const FIELDS = [
  { name: "name", label: "Twoje imię", placeholder: "Jak masz na imię?", type: "text", autoComplete: "given-name" },
  { name: "email", label: "Email", placeholder: "Podaj swój e-mail", type: "email", autoComplete: "email" },
  { name: "phone", label: "Telefon", placeholder: "Numer telefonu", type: "tel", autoComplete: "tel" },
] as const;

export function Contact() {
  const [topic, setTopic] = useState(TOPICS[0]);
  const [sent, setSent] = useState(false);

  return (
    <Canvas id="kontakt" height={1031} inner="flex flex-col gap-6 px-5 pt-16 pb-20">
      <h2
        className="display abs text-[30px] leading-[1.6] tracking-[-0.01em] lg:text-[42px] lg:leading-[80.64px] lg:tracking-[-0.42px]"
        style={at(100, 152, 520)}
      >
        Porozmawiajmy
        <br />o Twoim biznesie.
      </h2>
      <p className="abs text-[20px] leading-[28px] lg:text-[24px] lg:leading-[32px]" style={at(100, 354, 531)}>
        Opowiedz nam o <strong className="font-semibold">swoim pomyśle.</strong>
        <br />
        Resztę ustalimy w rozmowie.
      </p>
      <div className="flex flex-col gap-5 lg:contents">
        <a href="tel:+48668884166" className="abs block hover:opacity-70" style={at(100, 449, 317)}>
          <span className="block text-[16px] leading-[32px] font-semibold text-black/42">telefon</span>
          <span className="block text-[22px] leading-[32px] font-semibold lg:text-[24px]">+48 668 884 166</span>
        </a>
        <a href="mailto:sempre@sempreinfo.pl" className="abs block hover:opacity-70" style={at(100, 533, 317)}>
          <span className="block text-[16px] leading-[32px] font-semibold text-black/42">email</span>
          <span className="block text-[22px] leading-[32px] font-semibold lg:text-[24px]">sempre@sempreinfo.pl</span>
        </a>
      </div>

      <form
        className="abs mt-6 flex flex-col items-center justify-center gap-10 rounded-[32px] bg-white px-5 py-10 lg:mt-0 lg:rounded-[40px] lg:px-14 lg:py-20"
        style={at(698, 81, 642, 830)}
        onSubmit={(ev) => {
          ev.preventDefault();
          setSent(true);
        }}
      >
        <div className="flex w-full max-w-[530px] flex-col gap-10">
          <fieldset className="flex flex-col gap-5">
            <legend className="mb-5 text-[16px] leading-[32px] font-semibold">Co planujesz?</legend>
            <div className="flex flex-wrap gap-2.5">
              {TOPICS.map((t) => {
                const active = t === topic;
                return (
                  <label
                    key={t}
                    className={`flex h-[52px] cursor-pointer items-center rounded-full px-4 text-[16px] leading-[32px] font-medium transition-colors ${
                      active ? "bg-black text-white" : "h-[54px] border border-black hover:bg-black/5"
                    }`}
                  >
                    <input
                      type="radio"
                      name="topic"
                      value={t}
                      checked={active}
                      onChange={() => setTopic(t)}
                      className="sr-only"
                    />
                    {t}
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className="flex flex-col gap-2.5">
            {FIELDS.map((f) => (
              <label key={f.name} className="flex flex-col gap-3">
                <span className="text-[16px] leading-[32px] font-semibold">{f.label}</span>
                <input
                  name={f.name}
                  type={f.type}
                  autoComplete={f.autoComplete}
                  placeholder={f.placeholder}
                  required={f.name !== "phone"}
                  className="h-[54px] rounded-full border border-black px-4 text-[18px] leading-[32px] font-medium outline-none placeholder:text-black/42 focus:ring-2 focus:ring-brand/40 lg:text-[20px]"
                />
              </label>
            ))}
          </div>
        </div>

        <div className="flex w-full max-w-[530px] flex-col gap-5">
          <button
            type="submit"
            className="group flex h-[66px] items-center justify-center gap-4 rounded-full border border-brand bg-brand py-3 pr-6 pl-3 text-[16px] leading-[18.128px] font-semibold tracking-[0.64px] text-white transition-colors hover:bg-brand-deep"
          >
            <span className="flex size-10 items-center justify-center rounded-full bg-white p-2.5 text-brand transition-transform group-hover:translate-x-1">
              <ArrowRight />
            </span>
            {sent ? "Dziękujemy — odezwiemy się!" : "Wyślij wiadomość"}
          </button>
          <p className="text-center text-[14px] leading-[20px] font-medium text-black/42">
            Informacje o przetwarzaniu danych znajdziesz w{" "}
            <a href="#" className="underline hover:text-black">
              polityce prywatności.
            </a>
          </p>
        </div>
      </form>
    </Canvas>
  );
}

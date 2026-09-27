import { Canvas, at } from "../canvas";

// Figma 50:1360 — „Czym jest Sempre?”. Zdjęcie zespołu i malina (50:798, 50:1576) są w <ExpandVideo>.
export function About() {
  return (
    <Canvas id="o-nas" height={369} inner="flex flex-col gap-6 px-5 pt-16 pb-10">
      <h2
        className="display abs text-[28px] leading-[1.6] tracking-[-0.01em] lg:text-[32px] lg:leading-[61.44px] lg:tracking-[-0.32px]"
        style={at(156, 70, 564)}
      >
        Czym jest
        <br />
        Sempre?
      </h2>
      <p className="abs text-[18px] leading-[28px] lg:text-[20px] lg:leading-[32px]" style={at(720, 70, 564)}>
        Łączymy dobre składniki, wiedzę i ludzi, żeby rozwijać <strong className="font-semibold">Twój biznes.</strong>
        <br />
        <br />
        Pomagamy otwierać i rozwijać lodziarnie oraz lokale HoReCa. Dostarczamy produkty, szkolimy zespoły i wspieramy
        właścicieli — od przygotowania lokalu po kolejne etapy działalności.
      </p>
    </Canvas>
  );
}

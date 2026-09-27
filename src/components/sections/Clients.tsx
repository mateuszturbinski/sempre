import { Canvas, Pic, at } from "../canvas";

// Figma 50:1631 „Zaufali nam” — 6 logotypów 89×89, space-between od x=368 do 1461.
const LOGOS = [
  "Lodożercy",
  "Istne lody rzemieślnicze",
  "Wytwórnia lody naturalne",
  "Lody tradycyjne Choszczno",
  "Lodziarnia Truskawkowa",
  "Polish lody",
];

export function Clients() {
  return (
    <Canvas height={251} className="bg-white" inner="flex flex-col gap-6 px-5 py-12">
      <p className="abs text-[20px] leading-[22.66px] font-semibold tracking-[-0.2px]" style={at(156, 114)}>
        Zaufali nam
      </p>
      <ul
        className="abs rv-each -mx-5 flex items-center gap-10 overflow-x-auto px-5 [scrollbar-width:none] lg:mx-0 lg:justify-between lg:gap-0 lg:overflow-visible lg:p-0"
        style={at(368, 83, 1093, 89)}
      >
        {LOGOS.map((name, i) => (
          <li key={name} className="shrink-0">
            <Pic src={`/img/client-${i + 1}.png`} alt={name} sizes="89px" className="size-[72px] lg:size-[89px]" />
          </li>
        ))}
      </ul>
    </Canvas>
  );
}

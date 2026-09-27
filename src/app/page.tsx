import { About } from "@/components/sections/About";
import { Brands } from "@/components/sections/Brands";
import { Clients } from "@/components/sections/Clients";
import { Contact } from "@/components/sections/Contact";
import { Events } from "@/components/sections/Events";
import { Experts } from "@/components/sections/Experts";
import { Hero } from "@/components/sections/Hero";
import { Process } from "@/components/sections/Process";
import { SempreBrand } from "@/components/sections/SempreBrand";
import { Stages } from "@/components/sections/Stages";
import { Stories } from "@/components/sections/Stories";
import { Reveal } from "@/components/Reveal";
import { ExpandVideo } from "@/components/sections/ExpandVideo";
import { VideoModal } from "@/components/VideoModal";
import { EventSignup } from "@/components/EventSignup";

export default function Home() {
  return (
    <main>
      <Hero />
      <About />
      <ExpandVideo />
      <Stages />
      <Process />
      <SempreBrand />
      <Brands />
      <Experts />
      <Events />
      <Stories />
      <Clients />
      <Contact />
      <Reveal />
      <VideoModal />
      <EventSignup />
    </main>
  );
}

"use client";

import dynamic from "next/dynamic";
const EnvelopeScrollSection = dynamic(() => import("@/components/EnvelopeScrollSection"), {
  ssr: false,
  loading: () => <div style={{ height: "300vh", background: "#1a1208" }} />,
});
import IntroSection from "@/components/sections/IntroSection";
import GreetingSection from "@/components/sections/GreetingSection";
import CalendarSection from "@/components/sections/CalendarSection";
import GallerySection from "@/components/sections/GallerySection";
import LocationSection from "@/components/sections/LocationSection";
import ContactSection from "@/components/sections/ContactSection";
import RSVPSection from "@/components/sections/RSVPSection";
import GuestbookSection from "@/components/sections/GuestbookSection";

export default function ClassicTemplate() {
  return (
    <main>
      <EnvelopeScrollSection />
      <IntroSection />
      <GreetingSection />
      <CalendarSection />
      <GallerySection />
      <LocationSection />
      <ContactSection />
      <RSVPSection />
      <GuestbookSection />
    </main>
  );
}

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getInvite, INVITES } from "@/invites";
import { WeddingProvider } from "@/context/WeddingContext";
import GSAPInit from "@/components/GSAPInit";
import EnvelopeScrollSection from "@/components/EnvelopeScrollSection";
import IntroSection from "@/components/sections/IntroSection";
import GreetingSection from "@/components/sections/GreetingSection";
import CalendarSection from "@/components/sections/CalendarSection";
import GallerySection from "@/components/sections/GallerySection";
import LocationSection from "@/components/sections/LocationSection";
import ContactSection from "@/components/sections/ContactSection";
import RSVPSection from "@/components/sections/RSVPSection";

export async function generateStaticParams() {
  return Object.keys(INVITES).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = getInvite(slug);
  if (!data) return {};
  return {
    title: `${data.groom.name} ♥ ${data.bride.name} 결혼합니다`,
    description: `${data.date.year}년 ${data.date.month}월 ${data.date.day}일 ${data.date.dayOfWeek} ${data.date.time}`,
  };
}

export default async function InvitePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = getInvite(slug);
  if (!data) notFound();

  return (
    <WeddingProvider data={data}>
      <main>
        <GSAPInit />
        <EnvelopeScrollSection />
        <IntroSection />
        <GreetingSection />
        <CalendarSection />
        <GallerySection />
        <LocationSection />
        <ContactSection />
        <RSVPSection />
      </main>
    </WeddingProvider>
  );
}

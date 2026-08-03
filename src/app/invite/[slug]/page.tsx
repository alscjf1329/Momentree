import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getInvite, INVITES } from "@/invites";
import { WeddingProvider } from "@/context/WeddingContext";
import ClassicTemplate from "@/templates/classic";
import EditorialTemplate from "@/templates/editorial";
import MinimalTemplate from "@/templates/minimal";
import RomanticTemplate from "@/templates/romantic";

const TEMPLATE_MAP: Record<string, React.ComponentType> = {
  classic: ClassicTemplate,
  editorial: EditorialTemplate,
  minimal: MinimalTemplate,
  romantic: RomanticTemplate,
};

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

  const Template = TEMPLATE_MAP[data.template] ?? ClassicTemplate;

  return (
    <WeddingProvider data={data}>
      <Template />
    </WeddingProvider>
  );
}
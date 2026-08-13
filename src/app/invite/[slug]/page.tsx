import { notFound } from "next/navigation";
import type { Metadata } from "next";
import fs from "fs/promises";
import path from "path";
import { getInvite } from "@/invites";
import { WEDDING } from "@/content";
import type { WeddingData } from "@/types";
import { WeddingProvider } from "@/context/WeddingContext";
import ClassicTemplate from "@/templates/classic";
import EditorialTemplate from "@/templates/editorial";
import MinimalTemplate from "@/templates/minimal";
import RomanticTemplate from "@/templates/romantic";
import TwilightTemplate from "@/templates/twilight";
import BlossomTemplate from "@/templates/blossom";
import ModernTemplate from "@/templates/modern";
import LuxuryTemplate from "@/templates/luxury";
import GardenTemplate from "@/templates/garden";

const TEMPLATE_MAP: Record<string, React.ComponentType> = {
  classic: ClassicTemplate,
  editorial: EditorialTemplate,
  minimal: MinimalTemplate,
  romantic: RomanticTemplate,
  twilight: TwilightTemplate,
  blossom: BlossomTemplate,
  modern: ModernTemplate,
  luxury: LuxuryTemplate,
  garden: GardenTemplate,
};

async function readClientFile(filename: string): Promise<WeddingData | null> {
  try {
    const raw = await fs.readFile(
      path.join(process.cwd(), "data", "clients", `${filename}.json`),
      "utf-8"
    );
    // 필드 추가 이전에 저장된 레거시 클라이언트 파일 대비 기본값과 병합
    return { ...WEDDING, ...JSON.parse(raw) } as WeddingData;
  } catch {
    return null;
  }
}

// ?file= 쿼리로 실시간 파일시스템 데이터를 읽는 완전 동적 라우트라
// 정적 생성(generateStaticParams)을 쓰지 않음 — dev 모드 on-demand ISR
// 동시 요청 레이스로 인한 hydration mismatch를 원천 차단
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ file?: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { file } = await searchParams;

  let data: WeddingData | null = null;
  if (file && slug in TEMPLATE_MAP) {
    data = await readClientFile(file);
  } else {
    data = getInvite(slug);
  }
  if (!data) return {};
  return {
    title: `${data.groom.name} ♥ ${data.bride.name} 결혼합니다`,
    description: `${data.date.year}년 ${data.date.month}월 ${data.date.day}일 ${data.date.dayOfWeek} ${data.date.time}`,
  };
}

export default async function InvitePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ file?: string }>;
}) {
  const { slug } = await params;
  const { file } = await searchParams;

  let data: WeddingData;

  if (file && slug in TEMPLATE_MAP) {
    // 파일 기반 동적 렌더링: /invite/editorial?file=kim-minjun
    const clientData = await readClientFile(file);
    if (!clientData) notFound();
    data = { ...clientData, template: slug };
  } else {
    // 기존 정적 slug 조회: /invite/demo-classic
    const invited = getInvite(slug);
    if (!invited) notFound();
    data = invited;
  }

  const Template = TEMPLATE_MAP[data.template] ?? ClassicTemplate;

  return (
    <WeddingProvider data={data}>
      <Template />
    </WeddingProvider>
  );
}
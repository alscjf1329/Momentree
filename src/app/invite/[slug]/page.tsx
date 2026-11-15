import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getInvite } from "@/invites";
import type { WeddingData } from "@/types";
import { isValidClientFilename } from "@/lib/newClient";
import { resolveShareId } from "@/lib/shareId";
import { EXAMPLE_FILE } from "@/lib/exampleInfo";
import { getCustomer, getPlan, getShareId } from "@/lib/customers";
import { hasWatermark } from "@/lib/plan";
import { WeddingProvider } from "@/context/WeddingContext";
import { TEMPLATE_MAP } from "@/templates/registry";

function readClientFile(filename: string): WeddingData | null {
  // ?file= 값은 사용자 입력이므로 형식을 먼저 검증
  if (!isValidClientFilename(filename)) return null;
  try {
    return getCustomer(filename);
  } catch {
    return null;
  }
}

// ?file= 쿼리로 실시간 파일시스템 데이터를 읽는 완전 동적 라우트라
// 정적 생성(generateStaticParams)을 쓰지 않음 — dev 모드 on-demand ISR
// 동시 요청 레이스로 인한 hydration mismatch를 원천 차단
export const dynamic = "force-dynamic";

// ?id=<공유 ID> 또는 레거시 ?file=<파일명>(이미 공유된 링크) → 고객 파일명
function resolveFileParam(q: { file?: string; id?: string }): string | undefined {
  if (q.id) return resolveShareId(q.id) ?? undefined;
  return q.file;
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ file?: string; id?: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const file = resolveFileParam(await searchParams);

  let data: WeddingData | null = null;
  if (file && slug in TEMPLATE_MAP) {
    data = readClientFile(file);
  } else {
    data = getInvite(slug);
  }
  if (!data) return {};
  const title = `${data.groom.name} ♥ ${data.bride.name} 결혼합니다`;
  const description = `${data.date.year}년 ${data.date.month}월 ${data.date.day}일 ${data.date.dayOfWeek} ${data.date.time}`;
  return {
    title,
    description,
    // 카카오톡 등 링크 공유 미리보기는 og:description을 읽으므로
    // 위 description과 별개로 openGraph에도 명시해야 반영됨
    openGraph: { title, description },
  };
}

export default async function InvitePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ file?: string; id?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const file = resolveFileParam(query);

  let data: WeddingData;
  let aiNote = false; // 랜딩 예시(example·demo-*)만
  let watermark = false; // 무료 고객의 청첩장만 (데모는 표시 안 함)

  // 폐기된 템플릿의 옛 공유 링크(/invite/classic?id=… 등)는 모노로 연다
  const tpl = slug in TEMPLATE_MAP ? slug : "mono";
  if (query.file || query.id) {
    // 파일 기반 동적 렌더링: /invite/editorial?id=<공유 ID> (레거시: ?file=kim-minjun)
    const clientData = file ? readClientFile(file) : null;
    if (!file || !clientData) notFound();
    // 클라이언트로 내려가는 slug(RSVP·방명록 API 키)는 파일명(이메일) 대신 공유 ID를 쓴다
    data = { ...clientData, template: tpl, slug: getShareId(file) ?? "" };
    watermark = hasWatermark(getPlan(file) ?? "free");
    aiNote = file === EXAMPLE_FILE;
  } else {
    // 기존 정적 slug 조회: /invite/demo-classic
    const invited = getInvite(slug);
    if (!invited) notFound();
    data = invited;
    aiNote = slug.startsWith("demo-") || slug === EXAMPLE_FILE; // 정적 예시 슬러그만
  }

  const Template = TEMPLATE_MAP[data.template] ?? TEMPLATE_MAP.mono;

  return (
    <WeddingProvider data={data} watermark={watermark} aiNote={aiNote}>
      <Template />
    </WeddingProvider>
  );
}
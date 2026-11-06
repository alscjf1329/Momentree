import { notFound } from "next/navigation";
import type { Metadata } from "next";
import fs from "fs/promises";
import path from "path";
import { getInvite } from "@/invites";
import { WEDDING } from "@/content";
import type { WeddingData } from "@/types";
import { applyToEncryptedFields, decrypt } from "@/lib/accountCrypto";
import { getSchemaForTemplate } from "@/lib/templateSchemas";
import { DATA_DIR } from "@/lib/paths";
import { isValidClientFilename } from "@/lib/newClient";
import { splitMeta } from "@/lib/clientMeta";
import { getOrCreateShareId, resolveShareId } from "@/lib/shareId";
import { WeddingProvider } from "@/context/WeddingContext";
import { TEMPLATE_MAP } from "@/templates/registry";
import ClassicTemplate from "@/templates/classic";

async function readClientFile(filename: string): Promise<WeddingData | null> {
  // ?file= 값이 그대로 경로에 들어가므로 ../ 같은 경로 순회 차단
  if (!isValidClientFilename(filename)) return null;
  try {
    const raw = await fs.readFile(
      path.join(DATA_DIR, "clients", `${filename}.json`),
      "utf-8"
    );
    // 필드 추가 이전에 저장된 레거시 클라이언트 파일 대비 기본값과 병합
    // (얕은 병합이라 groom/bride 안에 새로 추가된 필드는 별도로 다시 병합해야 함)
    const parsed = splitMeta(JSON.parse(raw)).data; // _meta(소유자 이메일 등)는 공개 페이지로 내려보내지 않음
    const data = {
      ...WEDDING,
      ...parsed,
      groom: { ...WEDDING.groom, ...parsed.groom },
      bride: { ...WEDDING.bride, ...parsed.bride },
    } as WeddingData;
    const schema = getSchemaForTemplate(data.template);
    return applyToEncryptedFields(data, schema, decrypt);
  } catch {
    return null;
  }
}

// ?file= 쿼리로 실시간 파일시스템 데이터를 읽는 완전 동적 라우트라
// 정적 생성(generateStaticParams)을 쓰지 않음 — dev 모드 on-demand ISR
// 동시 요청 레이스로 인한 hydration mismatch를 원천 차단
export const dynamic = "force-dynamic";

// ?id=<공유 ID> 또는 레거시 ?file=<파일명>(이미 공유된 링크) → 고객 파일명
async function resolveFileParam(q: { file?: string; id?: string }): Promise<string | undefined> {
  if (q.id) return (await resolveShareId(q.id)) ?? undefined;
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
  const file = await resolveFileParam(await searchParams);

  let data: WeddingData | null = null;
  if (file && slug in TEMPLATE_MAP) {
    data = await readClientFile(file);
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
  const file = await resolveFileParam(query);

  let data: WeddingData;

  if ((query.file || query.id) && slug in TEMPLATE_MAP) {
    // 파일 기반 동적 렌더링: /invite/editorial?id=<공유 ID> (레거시: ?file=kim-minjun)
    const clientData = file ? await readClientFile(file) : null;
    if (!file || !clientData) notFound();
    // 클라이언트로 내려가는 slug(RSVP·방명록 API 키)는 파일명(이메일) 대신 공유 ID를 쓴다
    data = { ...clientData, template: slug, slug: await getOrCreateShareId(file) };
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
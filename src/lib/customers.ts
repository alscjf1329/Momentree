import type { WeddingData } from "@/types";
import { getDb } from "@/lib/db";
import { encrypt, decrypt } from "@/lib/accountCrypto";
import { addMember, filesOf } from "@/lib/access";
import { newShareId } from "@/lib/newShareId";
import { DEFAULT_WEDDING_DATA as BLANK, generateFilename } from "@/lib/newClient";

// 고객(청첩장) 저장소 — 서버 전용.
// 청첩장 데이터 전체를 JSON으로 만들어 통째로 암호화해 data_enc에 저장한다 (계좌번호 포함 모든 필드).
// 검색·목록에 필요한 값(이메일, 표시 이름, 예식일, 템플릿)만 평문 컬럼으로 따로 둔다.

export interface CustomerSummary {
  file: string;
  label: string;
  shareId: string;
  owner: string; // 가입 이메일 (관리자가 만든 고객은 빈 문자열)
  weddingDate: string;
  template: string;
  updatedAt: string;
}

interface Row {
  file: string;
  email: string | null;
  share_id: string;
  label: string;
  wedding_date: string;
  template: string;
  data_enc: string;
  created_at: string;
  updated_at: string;
}

function seal(data: WeddingData): string {
  return encrypt(JSON.stringify(data));
}

function open(blob: string): WeddingData {
  const plain = decrypt(blob);
  // decrypt()는 실패 시 입력을 그대로 돌려주므로, 여전히 암호문이면 복호화 실패로 처리
  if (plain.startsWith("enc:")) throw new Error("고객 데이터를 복호화하지 못했습니다 (ENCRYPTION_KEY 확인)");
  const data = JSON.parse(plain) as WeddingData;
  // 이후에 필드가 추가돼도 오래된 데이터가 깨지지 않게 빈 기본값과 병합 (groom/bride는 한 단계 더).
  // 데모용 샘플(김민준·이서연…)이 아니라 빈 값이어야, 없는 필드가 고객 청첩장에 남의 정보로 나오지 않는다.
  return { ...BLANK, ...data, groom: { ...BLANK.groom, ...data.groom }, bride: { ...BLANK.bride, ...data.bride }, date: { ...BLANK.date, ...data.date }, venue: { ...BLANK.venue, ...data.venue } };
}

function labelOf(data: WeddingData): string {
  return [data.groom?.name, data.bride?.name].map((n) => n?.trim()).filter(Boolean).join(" ♥ ");
}

export function getCustomer(file: string): WeddingData | null {
  const row = getDb().prepare("select data_enc from customers where file = ?").get(file) as Pick<Row, "data_enc"> | undefined;
  return row ? open(row.data_enc) : null;
}

export function customerExists(file: string): boolean {
  return !!getDb().prepare("select 1 from customers where file = ?").get(file);
}

// 신규 고객 파일명 발급 — DB에 없는 값이 나올 때까지 재시도 (gen은 테스트용 주입)
export function newCustomerFile(gen: () => string = generateFilename): string {
  for (let i = 0; i < 20; i++) {
    const f = gen();
    if (!customerExists(f)) return f;
  }
  throw new Error("고객 파일명 발급 실패 (충돌 반복)");
}

// 이메일 → 로그인 시 열 파일: 멤버십 우선, 없으면 옛 방식(파일명=이메일) 고객, 그것도 없으면 null(신규)
export function fileForEmail(email: string): string | null {
  return filesOf(email)[0]?.file ?? (customerExists(email) ? email : null);
}

// 저장(없으면 생성). email은 새로 만들 때만 기록하고 그 사람을 소유자 멤버로 등록한다 (관리자가 대신 저장해도 소유자는 바뀌지 않음).
export function saveCustomer(file: string, data: WeddingData, email?: string | null): void {
  const existed = customerExists(file);
  const now = new Date().toISOString();
  getDb()
    .prepare(
      `insert into customers (file, email, share_id, label, wedding_date, template, data_enc, created_at, updated_at)
       values (@file, @email, @share_id, @label, @wedding_date, @template, @data_enc, @now, @now)
       on conflict(file) do update set
         label = excluded.label, wedding_date = excluded.wedding_date, template = excluded.template,
         data_enc = excluded.data_enc, updated_at = excluded.updated_at`
    )
    .run({
      file,
      email: email ?? null,
      share_id: newShareId(),
      label: labelOf(data),
      wedding_date: data.date?.iso ?? "",
      template: data.template,
      data_enc: seal(data),
      now,
    });
  if (!existed && email) addMember(file, email, "owner"); // 가입 이메일 = 소유자
}

export function deleteCustomer(file: string): boolean {
  return getDb().prepare("delete from customers where file = ?").run(file).changes > 0;
}

// 최근 수정 순. 검색은 이메일·고객ID(공유 ID)·표시 이름·파일명·예식일 부분 일치.
export function listCustomers(query = ""): CustomerSummary[] {
  const q = `%${query.trim().replace(/[\\%_]/g, "\\$&")}%`;
  const rows = getDb()
    .prepare(
      `select file, email, share_id, label, wedding_date, template, updated_at from customers
       where @q = '%%' or file like @q escape '\\' or email like @q escape '\\' or share_id like @q escape '\\' or label like @q escape '\\' or wedding_date like @q escape '\\'
       order by updated_at desc`
    )
    .all({ q }) as Pick<Row, "file" | "email" | "share_id" | "label" | "wedding_date" | "template" | "updated_at">[];
  return rows.map((r) => ({ file: r.file, shareId: r.share_id, label: r.label, owner: r.email ?? "", weddingDate: r.wedding_date, template: r.template, updatedAt: r.updated_at }));
}

export function getLabel(file: string): string {
  return (getDb().prepare("select label from customers where file = ?").pluck().get(file) as string | undefined) ?? "";
}

export function getTemplate(file: string): string {
  return (getDb().prepare("select template from customers where file = ?").pluck().get(file) as string | undefined) ?? "classic";
}

export function getShareId(file: string): string | null {
  const row = getDb().prepare("select share_id from customers where file = ?").get(file) as Pick<Row, "share_id"> | undefined;
  return row?.share_id ?? null;
}

export function fileByShareId(id: string): string | null {
  const row = getDb().prepare("select file from customers where share_id = ?").get(id) as Pick<Row, "file"> | undefined;
  return row?.file ?? null;
}

export type FieldType =
  | "text"
  | "textarea"
  | "boolean"
  | "array" // string[] — 줄바꿈 = 새 항목
  | "array-object" // 객체 배열 — itemFields로 각 항목 구조 정의
  | "image" // 드래그앤드롭/클릭 업로드 + 경로 직접 입력 (public/images/)
  | "file" // 이미지 외 파일 업로드 (예: 배경음악 mp3, public/audio/)
  | "encrypted-text" // 저장 시 암호화 대상 (입력 UI는 text와 동일)
  | "datetime"; // 연/월/일/요일/시간 복합 위젯

export interface FieldSchema {
  /** WeddingData 기준 dot-path. array-object의 itemFields는 항목(각 배열 원소) 내부 기준 상대 경로 */
  key: string;
  type: FieldType;
  label: string;
  /** true = 어드민 "기본 정보" 탭(전 템플릿 공유), 그 외 = 템플릿 전용 탭 */
  common?: boolean;
  /** common:true여도 이 배열에 든 템플릿에서는 숨김 (예: 봉투 이미지는 공용이지만 garden엔 없음) */
  excludeTemplates?: string[];
  required?: boolean;
  placeholder?: string;
  /** RegExp 문자열 */
  pattern?: string;
  errorMessage?: string;
  maxLength?: number;
  helpText?: string;
  /** array-object 전용: 각 항목의 필드 구조 */
  itemFields?: FieldSchema[];
}

export interface SectionSchema {
  title: string;
  fields: FieldSchema[];
}

export interface TemplateSchema {
  name: string;
  sections: SectionSchema[];
}

export function getByPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc == null) return undefined;
    return (acc as Record<string, unknown>)[key];
  }, obj);
}

export function setByPath<T>(obj: T, path: string, value: unknown): T {
  const next = structuredClone(obj) as unknown as Record<string, unknown>;
  const keys = path.split(".");
  let cur = next;
  for (let i = 0; i < keys.length - 1; i++) {
    cur = cur[keys[i]] as Record<string, unknown>;
  }
  cur[keys[keys.length - 1]] = value;
  return next as unknown as T;
}

function isEmpty(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

function validateField(
  field: FieldSchema,
  value: unknown,
  path: string,
  errors: Record<string, string>
) {
  if (field.type === "array-object") {
    const items = Array.isArray(value) ? value : [];
    if (field.required && items.length === 0) {
      errors[path] = field.errorMessage ?? `${field.label}은(는) 최소 1개 필요합니다`;
    }
    if (field.itemFields) {
      items.forEach((item, i) => {
        for (const sub of field.itemFields!) {
          validateField(sub, getByPath(item, sub.key), `${path}.${i}.${sub.key}`, errors);
        }
      });
    }
    return;
  }

  if (field.required && isEmpty(value)) {
    errors[path] = field.errorMessage ?? `${field.label}은(는) 필수입니다`;
    return;
  }

  if (typeof value === "string" && value) {
    if (field.pattern && !new RegExp(field.pattern).test(value)) {
      errors[path] = field.errorMessage ?? `${field.label} 형식이 올바르지 않습니다`;
    } else if (field.maxLength && value.length > field.maxLength) {
      errors[path] = field.errorMessage ?? `${field.label}은(는) ${field.maxLength}자 이내여야 합니다`;
    }
  }
}

export function validateBySchema(schema: TemplateSchema, data: unknown): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const section of schema.sections) {
    for (const field of section.fields) {
      validateField(field, getByPath(data, field.key), field.key, errors);
    }
  }
  return errors;
}

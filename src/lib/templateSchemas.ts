import type { TemplateSchema } from "@/lib/schema";
import { gardenSchema } from "@/templates/garden.schema";

// 템플릿별 스키마 파일이 생기면 여기 등록만 하면 됨.
// 아직 전용 스키마가 없는 템플릿은 gardenSchema를 그대로 폴백으로 써서
// "기본 정보"(common) + "{템플릿} 전용 옵션"(non-common) 구조가 동일하게 유지되도록 함.
const REGISTRY: Record<string, TemplateSchema> = {
  garden: gardenSchema,
};

// common:true여도 특정 템플릿에서는 의미 없는 필드(예: 봉투 이미지 — garden엔 봉투 UI 자체가 없음)를 숨김
function excludeForTemplate(schema: TemplateSchema, name: string): TemplateSchema {
  return {
    ...schema,
    sections: schema.sections
      .map((s) => ({ ...s, fields: s.fields.filter((f) => !f.excludeTemplates?.includes(name)) }))
      .filter((s) => s.fields.length > 0),
  };
}

export function getSchemaForTemplate(name: string): TemplateSchema {
  const schema = REGISTRY[name] ?? { ...gardenSchema, name };
  return excludeForTemplate(schema, name);
}

import type { TemplateSchema } from "@/lib/schema";
import { monoSchema } from "@/templates/mono.schema";

// 템플릿별 스키마 파일이 생기면 여기 등록만 하면 됨. 알 수 없는 이름은 monoSchema 로 본다.
const REGISTRY: Record<string, TemplateSchema> = {
  mono: monoSchema,
};

// common:true여도 특정 템플릿에서는 의미 없는 필드를 숨김
function excludeForTemplate(schema: TemplateSchema, name: string): TemplateSchema {
  return {
    ...schema,
    sections: schema.sections
      .map((s) => ({ ...s, fields: s.fields.filter((f) => !f.excludeTemplates?.includes(name)) }))
      .filter((s) => s.fields.length > 0),
  };
}

export function getSchemaForTemplate(name: string): TemplateSchema {
  const schema = REGISTRY[name] ?? { ...monoSchema, name };
  return excludeForTemplate(schema, name);
}

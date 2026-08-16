import { commonFieldsOnly, type TemplateSchema } from "@/lib/schema";
import { gardenSchema } from "@/templates/garden.schema";

// 템플릿별 스키마 파일이 생기면 여기 등록만 하면 됨.
// 아직 스키마가 없는 템플릿은 공통 필드만 있는 폴백으로 렌더링(폼이 깨지지 않게).
const REGISTRY: Record<string, TemplateSchema> = {
  garden: gardenSchema,
};

const COMMON_FALLBACK = commonFieldsOnly(gardenSchema);

export function getSchemaForTemplate(name: string): TemplateSchema {
  return REGISTRY[name] ?? { ...COMMON_FALLBACK, name };
}

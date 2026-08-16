import type { FieldSchema } from "@/lib/schema";

export interface FieldComponentProps {
  field: FieldSchema;
  path: string;
  value: unknown;
  onChange: (path: string, value: unknown) => void;
  error?: string;
}

export interface RenderFieldArgs {
  field: FieldSchema;
  data: unknown;
  basePath: string;
  onChange: (path: string, value: unknown) => void;
  errors?: Record<string, string>;
}

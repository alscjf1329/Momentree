"use client";

import { getByPath } from "@/lib/schema";
import type { RenderFieldArgs } from "./fields/types";
import TextField from "./fields/TextField";
import TextAreaField from "./fields/TextAreaField";
import ArrayField from "./fields/ArrayField";
import ArrayObjectField from "./fields/ArrayObjectField";
import BooleanField from "./fields/BooleanField";
import EncryptedField from "./fields/EncryptedField";
import ImageField from "./fields/ImageField";
import FileField from "./fields/FileField";
import DateTimeField from "./fields/DateTimeField";

// 필드 타입 → 컴포넌트 디스패처. array-object 항목 내부에서도 재귀적으로 이 함수를 그대로 재사용한다
// (ArrayObjectField가 이 함수를 renderItemField prop으로 받아서 호출 — 순환 import 방지).
export function renderField({ field, data, basePath, onChange, errors }: RenderFieldArgs): React.ReactNode {
  const path = basePath ? `${basePath}.${field.key}` : field.key;
  const value = getByPath(data, path);
  const error = errors?.[path];
  const common = { field, path, value, onChange, error };

  switch (field.type) {
    case "textarea":
      return <TextAreaField key={path} {...common} />;
    case "array":
      return <ArrayField key={path} {...common} />;
    case "array-object":
      return (
        <ArrayObjectField
          key={path}
          {...common}
          data={data}
          basePath={basePath}
          errors={errors}
          renderItemField={renderField}
        />
      );
    case "boolean":
      return <BooleanField key={path} {...common} />;
    case "encrypted-text":
      return <EncryptedField key={path} {...common} />;
    case "image":
      return <ImageField key={path} {...common} />;
    case "file":
      return <FileField key={path} {...common} />;
    case "datetime":
      return <DateTimeField key={path} {...common} />;
    case "text":
    default:
      return <TextField key={path} {...common} />;
  }
}

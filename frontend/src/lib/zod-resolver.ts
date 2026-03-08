import type { Resolver, FieldValues } from "react-hook-form";
import type { z } from "zod";

export function zodSafeResolver<TFieldValues extends FieldValues>(
  schema: z.ZodType<TFieldValues>,
): Resolver<TFieldValues> {
  return (async (values: TFieldValues) => {
    const result = await schema.safeParseAsync(values);

    if (result.success) {
      return { values: result.data as TFieldValues, errors: {} };
    }

    const errors: Record<string, { message: string; type: string }> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.map(String).join(".");
      if (path && !errors[path]) {
        errors[path] = {
          message: issue.message,
          type:
            ((issue as unknown as Record<string, unknown>).code as string) ??
            "validation",
        };
      }
    }

    return { values: {} as TFieldValues, errors };
  }) as unknown as Resolver<TFieldValues>;
}

/**
 * Zod request-body validator middleware factory.
 * Returns 422 with flattened field errors on failure.
 *
 * @param {import("zod").ZodSchema} schema
 */
export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(422).json({
        error: "Validation failed",
        issues: result.error.flatten().fieldErrors,
      });
    }
    req.body = result.data;
    next();
  };
}

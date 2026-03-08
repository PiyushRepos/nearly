/**
 * Global Express error handler.
 * Must be registered last — after all routes.
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  console.error("[Error]", err);

  if (err.name === "MulterError") {
    return res.status(400).json({ error: err.message });
  }

  const status = err.status ?? err.statusCode ?? 500;
  const message =
    process.env.NODE_ENV === "production" && status === 500
      ? "Internal server error"
      : (err.message ?? "Internal server error");

  res.status(status).json({ error: message });
}

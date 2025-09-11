export function handleApiError(error: unknown, context?: string) {
  if (import.meta.env.DEV) {
    console.error(context ? `[${context}]` : "", error);
  }
  return "Ocurrió un error. Intenta nuevamente.";
}

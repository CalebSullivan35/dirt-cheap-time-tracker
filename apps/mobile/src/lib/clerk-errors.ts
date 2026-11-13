/** Turns an error returned by Clerk's sign-in/sign-up methods into display text. */
export function clerkErrorMessage(error: unknown): string | null {
  if (!error) return null;
  const e = error as { longMessage?: string; message?: string; errors?: { longMessage?: string; message?: string }[] };
  return e.errors?.[0]?.longMessage ?? e.longMessage ?? e.errors?.[0]?.message ?? e.message ?? "Something went wrong";
}

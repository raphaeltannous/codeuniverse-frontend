/**
 * Custom fetch wrapper that automatically:
 * - Includes credentials for cookie-based auth
 * - Throws 401 errors to be caught by global error handlers
 */
export async function apiFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const response = await fetch(input, {
    ...init,
    credentials: "include",
  });

  if (response.status === 401) {
    throw new Error("401: Unauthorized");
  }

  return response;
}

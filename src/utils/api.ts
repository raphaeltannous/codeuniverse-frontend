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

  // Don't throw generic 401 on auth pages - let the mutation handle it
  const isAuthPage = window.location.pathname.startsWith("/accounts/login") || 
                    window.location.pathname.startsWith("/accounts/signup") ||
                    window.location.pathname.startsWith("/accounts/password");
  
  if (response.status === 401 && !isAuthPage) {
    throw new Error("401: Unauthorized");
  }

  if (response.status === 404) {
    throw new Error("404: Not Found");
  }

  return response;
}

// Helper to extract error message from response
export async function getErrorMessage(response: Response): Promise<string> {
  try {
    const data = await response.json();
    return data.message || `Error: ${response.statusText}`;
  } catch {
    return `Error: ${response.statusText}`;
  }
}

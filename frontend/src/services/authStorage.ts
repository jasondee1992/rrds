const ADMIN_ACCESS_TOKEN_KEY = "rrds_admin_access_token";

// Phase 4 stores the JWT in localStorage for development. This wrapper keeps
// the storage decision isolated so it can later move to HTTP-only cookies.
export function getAdminAccessToken() {
  return window.localStorage.getItem(ADMIN_ACCESS_TOKEN_KEY);
}

export function setAdminAccessToken(token: string) {
  window.localStorage.setItem(ADMIN_ACCESS_TOKEN_KEY, token);
}

export function clearAdminAccessToken() {
  window.localStorage.removeItem(ADMIN_ACCESS_TOKEN_KEY);
}

/**
 * Read the role and expiry out of a JWT payload.
 *
 * The API is the real authority — every admin route re-checks the role
 * server-side. This only stops the admin UI from rendering for a customer
 * token, where every request would fail with 403 and simply look broken.
 */
export const readToken = (token) => {
  try {
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
    );
    return {
      role: payload.role,
      expired: payload.exp ? payload.exp * 1000 < Date.now() : false,
    };
  } catch {
    return null;
  }
};

export const isAdminToken = (token) => {
  if (!token) return false;
  const claims = readToken(token);
  return Boolean(claims) && claims.role === "ADMIN" && !claims.expired;
};

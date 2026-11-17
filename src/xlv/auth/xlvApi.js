const API_URL = import.meta.env.VITE_API_URL; // or your existing base URL
export const XLV_TOKEN_KEY = "xlv_token"; // different from your main app's key

export async function xlvFetch(path, options = {}) {
  const token = localStorage.getItem(XLV_TOKEN_KEY);
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    localStorage.removeItem(XLV_TOKEN_KEY);
    window.location.href = "/xlv/login";
    throw new Error("Unauthorized");
  }
  return res;
}
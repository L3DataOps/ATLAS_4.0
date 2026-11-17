import { createContext, useContext, useEffect, useState } from "react";
import { xlvFetch, XLV_TOKEN_KEY } from "./xlvApi";

const XlvAuthContext = createContext(null);

export function XlvAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on refresh
  useEffect(() => {
    const token = localStorage.getItem(XLV_TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    xlvFetch("/xlv/auth/me")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setUser)
      .catch(() => localStorage.removeItem(XLV_TOKEN_KEY))
      .finally(() => setLoading(false));
  }, []);

  const login = async (username, password) => {
    const res = await xlvFetch("/xlv/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) throw new Error("Invalid credentials");
    const data = await res.json(); // expects { token, user }
    localStorage.setItem(XLV_TOKEN_KEY, data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem(XLV_TOKEN_KEY);
    setUser(null);
  };

  return (
    <XlvAuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </XlvAuthContext.Provider>
  );
}

export const useXlvAuth = () => useContext(XlvAuthContext);

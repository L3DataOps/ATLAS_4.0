import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setToken(null);
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      try {
        const decoded = jwtDecode(storedToken);

        if (decoded.exp * 1000 > Date.now()) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } else {
          console.log("Token expired");
          logout();
        }
      } catch (err) {
        console.error("Invalid token:", err);
        logout();
      }
    }

    setLoading(false);
  }, []);

  // Automatically log out when the token expires
  useEffect(() => {
    if (!token) return;

    const { exp } = jwtDecode(token);

    const timeout = exp * 1000 - Date.now();

    if (timeout <= 0) {
      logout();
      return;
    }

    const timer = setTimeout(() => {
      logout();
    }, timeout);

    return () => clearTimeout(timer);
  }, [token]);

  const login = (userData, jwt) => {
    localStorage.setItem("token", jwt);
    localStorage.setItem("user", JSON.stringify(userData));

    setUser(userData);
    setToken(jwt);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        loading,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useXlvAuth } from "../../auth/XlvAuthContext";
import "./XlvLogin.css";

export default function XlvLogin() {
  const { user, login } = useXlvAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from?.pathname || "/xlv";

  if (user) return <Navigate to={from} replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(username, password);
      navigate(from, { replace: true });
    } catch {
      setError("Invalid username or password");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="xlv-login-page">
      <form className="xlv-login-card" onSubmit={handleSubmit}>
        <span className="xlv-login-brand">XL Virtual Request Portal</span>
        <h2>Sign in</h2>
        <p className="xlv-login-subtitle">Enter your credentials to continue</p>

        <div className="xlv-field">
          <label htmlFor="xlv-username">Username</label>
          <input
            id="xlv-username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
        </div>

        <div className="xlv-field">
          <label htmlFor="xlv-password">Password</label>
          <input
            id="xlv-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>

        {error && <p className="xlv-login-error">{error}</p>}

        <button className="xlv-login-btn" type="submit" disabled={submitting}>
          {submitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../auth/authService";
import { useAuth } from "../../hooks/useAuth";
import "./LoginPage.css";
import logo from "../../images/logo.png";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");

      const data = await loginUser(username, password);

      login(data.user, data.token);

      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login">
      <img src={logo} alt="Logo" id="logo" />
      <form className="login-form" onSubmit={handleSubmit}>
        {error && <div className="error">{error}</div>}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="bubbleinput"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bubbleinput"
        />

        <button type="submit" id="login">
          Login
        </button>
      </form>
    </div>
  );
}

import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { logout } = useAuth();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div>
      <h1>ATLAS Home</h1>
      <h2>
        Welcome {user?.firstname} {user?.lastname}
      </h2>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import logo from "../../images/logo.png";
import CurrentTime from "./CurrentTime";
import CurrentDate from "./CurrentDate";

import "./Sidebar.css";

function Sidebar() {
  const { user, logout } = useAuth();
  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="sidebar">
      <CurrentTime />
      <img src={logo} alt="Logo" className="logo" />
      <CurrentDate />

      <nav>
        <NavLink to="/open-cases">Open Cases</NavLink>
        <NavLink to="/closed-cases">Closed Cases</NavLink>
        <NavLink to="/create-case">Create Case</NavLink>
        <NavLink to="/rnm-dashboard">RNM Dashboard</NavLink>
      </nav>

      <div className="settings">
        <br />
        <br />
        <h3>
          Welcome, <br />
        </h3>
        <h2>
          {user?.firstname} {user?.lastname}
        </h2>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}

export default Sidebar;

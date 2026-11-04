import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

import logo from "../../images/logo.png";
import CurrentTime from "./CurrentTime";
import CurrentDate from "./CurrentDate";
import logoutIcon from "../../images/logout.png";
import settingsIcon from "../../images/setting.png";

import "./Sidebar.css";

function Sidebar() {
  const { user, logout } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [openCasesExpanded, setOpenCasesExpanded] = useState(
    location.pathname === "/open-cases" ||
      location.pathname === "/rnm-open-cases",
  );

  const [closedCasesExpanded, setClosedCasesExpanded] = useState(
    location.pathname === "/closed-cases" ||
      location.pathname === "/rnm-closed-cases",
  );

  // Automatically expand the dropdown when navigating to a child page
  useEffect(() => {
    if (
      location.pathname === "/open-cases" ||
      location.pathname === "/rnm-open-cases"
    ) {
      setOpenCasesExpanded(true);
    }

    if (
      location.pathname === "/closed-cases" ||
      location.pathname === "/rnm-closed-cases"
    ) {
      setClosedCasesExpanded(true);
    }
  }, [location.pathname]);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="sidebar">
      {/* TOP SECTION */}
      <div className="top">
        <CurrentTime />

        <img src={logo} alt="Logo" className="logo" />

        <CurrentDate />

        <nav>
          {/* OPEN CASES DROPDOWN */}
          <div className="sidebar-dropdown">
            <button
              className={`dropdown-toggle ${
                openCasesExpanded ? "expanded" : ""
              }`}
              onClick={() => setOpenCasesExpanded(!openCasesExpanded)}
              aria-expanded={openCasesExpanded}
            >
              <span>Open Cases</span>

              <span className="dropdown-arrow">
                {openCasesExpanded ? "▾" : "▸"}
              </span>
            </button>

            <div
              className={`dropdown-content ${openCasesExpanded ? "show" : ""}`}
            >
              <NavLink to="/open-cases" end>
                SOF Open Cases
              </NavLink>

              <NavLink to="/rnm-open-cases">RNM Open Cases</NavLink>
            </div>
          </div>

          {/* CLOSED CASES DROPDOWN */}
          <div className="sidebar-dropdown">
            <button
              className={`dropdown-toggle ${
                closedCasesExpanded ? "expanded" : ""
              }`}
              onClick={() => setClosedCasesExpanded(!closedCasesExpanded)}
              aria-expanded={closedCasesExpanded}
            >
              <span>Closed Cases</span>

              <span className="dropdown-arrow">
                {closedCasesExpanded ? "▾" : "▸"}
              </span>
            </button>

            <div
              className={`dropdown-content ${
                closedCasesExpanded ? "show" : ""
              }`}
            >
              <NavLink to="/closed-cases" end>
                SOF Closed Cases
              </NavLink>

              <NavLink to="/rnm-closed-cases">RNM Closed Cases</NavLink>
            </div>
          </div>

          {/* STANDALONE NAVIGATION */}
          <NavLink to="/flagged-cases">Flagged Cases</NavLink>
        </nav>
      </div>

      {/* BOTTOM SECTION */}
      <div className="settings">
        <NavLink className="create-button" to="/create-case">
          + Create Case
        </NavLink>

        <div className="sidebar-user">
          <h3>Welcome,</h3>

          <h2>
            {user?.firstname} {user?.lastname}
          </h2>
        </div>

        <div className="sidebar-actions">
          <button onClick={handleLogout}>
            <img src={logoutIcon} alt="Logout" />
            <span>Logout</span>
          </button>

          <NavLink to="/settings" className="settings-link">
            <img src={settingsIcon} alt="Settings" />
            <span>Settings</span>
          </NavLink>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;

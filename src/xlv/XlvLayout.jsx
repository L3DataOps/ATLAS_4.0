import { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { useXlvAuth } from "./auth/XlvAuthContext";
import "./tera.css";

const navItems = [
  { to: "/xlv", label: "Dashboard", end: true },
  // Add more XLV pages here
  // { to: "/xlv/something", label: "Something" },
];

export default function XlvLayout() {
  const { user, logout } = useXlvAuth();
  const [open, setOpen] = useState(false);

  return (
    <div className="xlv-layout">
      <aside className={`xlv-sidebar ${open ? "open" : ""}`}>
        <div className="xlv-brand">XLV</div>

        <nav className="xlv-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `xlv-nav-link ${isActive ? "active" : ""}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="xlv-sidebar-footer">
          <div className="xlv-user">{user?.name || user?.username}</div>
          <button onClick={logout}>Log out</button>
        </div>
      </aside>

      {open && <div className="xlv-backdrop" onClick={() => setOpen(false)} />}

      <div className="xlv-main">
        <header className="xlv-topbar">
          <button
            className="xlv-menu-btn"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            ☰
          </button>
          <span className="xlv-topbar-title">XLV</span>
        </header>

        <main className="xlv-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

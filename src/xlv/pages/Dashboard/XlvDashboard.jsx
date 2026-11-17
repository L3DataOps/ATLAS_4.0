import { useEffect, useState } from "react";
import { useXlvAuth } from "../../auth/XlvAuthContext";
import { xlvFetch } from "../../auth/xlvApi";
import "./XlvDashboard.css";

export default function XlvDashboard() {
  const { user, logout } = useXlvAuth();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        // Replace with your real endpoints
        const [s, r] = await Promise.all([
          xlvFetch("/xlv/dashboard/stats").then((res) => res.json()),
          xlvFetch("/xlv/dashboard/recent").then((res) => res.json()),
        ]);
        setStats(s);
        setRecent(r);
      } catch {
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const cards = [
    { label: "Total", value: stats?.total },
    { label: "Active", value: stats?.active },
    { label: "Pending", value: stats?.pending },
    { label: "Completed", value: stats?.completed },
  ];

  return (
    <div className="xlv-dashboard">
      <header className="xlv-dash-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back, {user?.name || user?.username}</p>
        </div>
        <button onClick={logout}>Log out</button>
      </header>

      {error && <p className="xlv-error">{error}</p>}

      <section className="xlv-cards">
        {cards.map((c) => (
          <div key={c.label} className="xlv-card">
            <span className="xlv-card-label">{c.label}</span>
            <span className="xlv-card-value">
              {loading ? "…" : (c.value ?? 0)}
            </span>
          </div>
        ))}
      </section>

      <section className="xlv-panel">
        <h2>Recent activity</h2>
        {loading ? (
          <p>Loading...</p>
        ) : recent.length === 0 ? (
          <p>No recent activity.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.name}</td>
                  <td>{item.status}</td>
                  <td>{new Date(item.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

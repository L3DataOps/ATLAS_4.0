import { useEffect, useState } from "react";
import { useCase } from "../../../context/CaseContext";
import "./subcss.css";

const API_URL = import.meta.env.VITE_API;

const SiteDowntime = () => {
  const { caseItem, setCaseItem } = useCase();

  const [siteDownAt, setSiteDownAt] = useState(
    caseItem?.siteDownAt ? formatDateTimeLocal(caseItem.siteDownAt) : "",
  );

  const [siteUpAt, setSiteUpAt] = useState(
    caseItem?.siteUpAt ? formatDateTimeLocal(caseItem.siteUpAt) : "",
  );

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSiteDownAt(
      caseItem?.siteDownAt ? formatDateTimeLocal(caseItem.siteDownAt) : "",
    );

    setSiteUpAt(
      caseItem?.siteUpAt ? formatDateTimeLocal(caseItem.siteUpAt) : "",
    );
  }, [caseItem?.siteDownAt, caseItem?.siteUpAt]);

  function formatDateTimeLocal(date) {
    const d = new Date(date);

    const offset = d.getTimezoneOffset();
    const localDate = new Date(d.getTime() - offset * 60000);

    return localDate.toISOString().slice(0, 16);
  }

  const calculateDowntime = () => {
    if (!siteDownAt || !siteUpAt) {
      return null;
    }

    const down = new Date(siteDownAt);
    const up = new Date(siteUpAt);

    const difference = up - down;

    if (difference < 0) {
      return null;
    }

    return difference;
  };

  const formatDowntime = (milliseconds) => {
    if (milliseconds === null) {
      return "—";
    }

    let totalSeconds = Math.floor(milliseconds / 1000);

    const days = Math.floor(totalSeconds / 86400);
    totalSeconds %= 86400;

    const hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;

    const minutes = Math.floor(totalSeconds / 60);

    const parts = [];

    if (days > 0) {
      parts.push(`${days}d`);
    }

    if (hours > 0) {
      parts.push(`${hours}hrs`);
    }

    if (minutes > 0) {
      parts.push(`${minutes}m`);
    }

    if (parts.length === 0) {
      parts.push("0m");
    }

    return parts.join(" ");
  };

  const saveDowntime = async () => {
    const downtime = calculateDowntime();

    if (siteDownAt && siteUpAt && downtime === null) {
      alert("Site Up time cannot be before Site Down time.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(`${API_URL}/cases/${caseItem._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          // Include your Authorization header if your API requires it
        },
        body: JSON.stringify({
          siteDownAt: siteDownAt ? new Date(siteDownAt).toISOString() : null,

          siteUpAt: siteUpAt ? new Date(siteUpAt).toISOString() : null,

          siteTotalDowntime: downtime,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save site downtime");
      }

      const updatedCase = await response.json();

      setCaseItem(updatedCase);
    } catch (error) {
      console.error("Error saving site downtime:", error);
    } finally {
      setSaving(false);
    }
  };

  const downtime = calculateDowntime();

  return (
    <div className="site-downtime-card">
      <div className="site-downtime-fields">
        {/* SITE DOWN */}

        <div className="site-time-field">
          <label>Site Down</label>

          <div className="site-time-input-wrapper">
            <span className="calendar-icon">📅</span>

            <input
              type="datetime-local"
              value={siteDownAt}
              onChange={(e) => setSiteDownAt(e.target.value)}
            />
          </div>
        </div>

        {/* SITE UP */}

        <div className="site-time-field">
          <label>Site Up</label>

          <div className="site-time-input-wrapper">
            <span className="calendar-icon">📅</span>

            <input
              type="datetime-local"
              value={siteUpAt}
              onChange={(e) => setSiteUpAt(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* TOTAL DOWNTIME */}

      <div className="site-total-downtime">
        <span>Total Downtime</span>

        <strong>{formatDowntime(downtime)}</strong>
      </div>

      <button
        className="site-downtime-save"
        onClick={saveDowntime}
        disabled={saving}
      >
        {saving ? "Saving..." : "Save Downtime"}
      </button>
    </div>
  );
};

export default SiteDowntime;

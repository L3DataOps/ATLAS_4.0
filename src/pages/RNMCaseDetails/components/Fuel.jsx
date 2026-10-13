import { useEffect, useState } from "react";
import { useCase } from "../../../context/CaseContext";
import "./temp.css";

const API_BASE = "";

const PERCENTAGE_OPTIONS = [
  5, 10, 12, 15, 20, 25, 30, 35, 38, 40, 45, 50, 55, 60, 62, 65, 70, 75, 80, 85,
  88, 90, 95, 100,
];

const Fuel = () => {
  const { caseItem } = useCase();
  const [tanks, setTanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  console.log(tanks);

  // Tracks what the user has explicitly selected per tank this
  // session, separate from the tank's actual stored percentage.
  // Starts empty so the dropdown shows "Select %" until a choice
  // is made, then holds that choice so it doesn't revert to blank.
  const [selectedValues, setSelectedValues] = useState({});

  const siteId = caseItem?.siteId;

  useEffect(() => {
    if (siteId) {
      fetchTanks();
    }
  }, [siteId]);

  const fetchTanks = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/fuel/site/${siteId}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.status === 404) {
        setTanks([]);
        return;
      }

      if (!res.ok) {
        throw new Error(`Failed to fetch fuel tanks (${res.status})`);
      }

      const data = await res.json();
      setTanks(data);
    } catch (err) {
      console.error("FETCH FUEL TANKS ERROR:", err);
      setError("Failed to load fuel tanks");
    } finally {
      setLoading(false);
    }
  };

  const getLatestFuelRecord = (fuelHistory) => {
    const dated = (fuelHistory || []).filter((entry) => entry.recordDate);

    if (dated.length === 0) {
      return null;
    }

    return dated.reduce((latest, entry) =>
      new Date(entry.recordDate) > new Date(latest.recordDate) ? entry : latest,
    );
  };

  const handleUpdateLevel = async (tank, newPercentage) => {
    // Reflect the selection immediately in the dropdown itself
    setSelectedValues((prev) => ({ ...prev, [tank._id]: newPercentage }));

    const latest = getLatestFuelRecord(tank.fuelHistory);
    const previousPercentageAmount = latest?.currentPercentageAmount ?? null;

    const newRecord = {
      recordDate: new Date().toISOString(),
      recordCaseNumber: caseItem?.caseNumber ?? null,
      recordType: "Manual Update",
      previousPercentageAmount,
      currentPercentageAmount: newPercentage,
      gallonsFilled: null,
      lastFillVendor: null,
    };

    const updatedFuelHistory = [...(tank.fuelHistory || []), newRecord];

    setTanks((prev) =>
      prev.map((t) =>
        t._id === tank._id ? { ...t, fuelHistory: updatedFuelHistory } : t,
      ),
    );
    setUpdatingId(tank._id);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/fuel/${tank._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ fuelHistory: updatedFuelHistory }),
      });

      if (!res.ok) {
        throw new Error(`Failed to update fuel level (${res.status})`);
      }

      const updatedTank = await res.json();
      setTanks((prev) =>
        prev.map((t) => (t._id === tank._id ? updatedTank : t)),
      );
    } catch (err) {
      console.error("UPDATE FUEL LEVEL ERROR:", err);

      // Roll back both the tank data and the dropdown's shown value
      setTanks((prev) =>
        prev.map((t) =>
          t._id === tank._id ? { ...t, fuelHistory: tank.fuelHistory } : t,
        ),
      );
      setSelectedValues((prev) => ({
        ...prev,
        [tank._id]: previousPercentageAmount ?? "",
      }));
    } finally {
      setUpdatingId(null);
    }
  };

  if (!siteId) {
    return <div className="fuel-empty">No site loaded</div>;
  }

  if (loading) {
    return <div className="fuel-loading">Loading fuel tanks...</div>;
  }

  if (error) {
    return <div className="fuel-error">{error}</div>;
  }

  if (tanks.length === 0) {
    return <div className="fuel-empty">No fuel tanks found for this site</div>;
  }

  return (
    <div className="fuel">
      <h4 className="fuel-title">Fuel Tanks</h4>

      {tanks.map((tank) => {
        const latest = getLatestFuelRecord(tank.fuelHistory);
        const currentPercentage = latest?.currentPercentageAmount;
        const lastUpdated = latest?.recordDate
          ? new Date(latest.recordDate).toLocaleString()
          : null;

        return (
          <div key={tank._id} className="fuel-tank-card">
            <div className="fuel-tank-header">
              <span className="fuel-tank-name">{tank.equipmentName}</span>
            </div>

            <div className="fuel-level-row">
              <span className="fuel-level-label">Current Level:</span>
              <span className="fuel-level-value">
                {currentPercentage !== null && currentPercentage !== undefined
                  ? `${currentPercentage}%`
                  : "No data"}
              </span>
            </div>

            {lastUpdated && (
              <div className="fuel-level-row">
                <span className="fuel-last-updated-label">Last Updated:</span>
                <span className="fuel-last-updated-value">{lastUpdated}</span>
              </div>
            )}

            <div className="fuel-update-row">
              <label htmlFor={`fuel-select-${tank._id}`}>Update Level:</label>
              <select
                id={`fuel-select-${tank._id}`}
                value={selectedValues[tank._id] ?? ""}
                disabled={updatingId === tank._id}
                size={1}
                onChange={(e) =>
                  handleUpdateLevel(tank, Number(e.target.value))
                }
              >
                <option value="" disabled>
                  Select %
                </option>
                {PERCENTAGE_OPTIONS.map((pct) => (
                  <option key={pct} value={pct}>
                    {pct}%
                  </option>
                ))}
              </select>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Fuel;

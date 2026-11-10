import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useCase } from "../../../context/CaseContext";
import "./ActivityNotes.css";

const API_URL = import.meta.env.VITE_API;

const STATUS_OPTIONS = [
  "Enroute",
  "Onsite",
  "Leaving Site (Travel Time)",
  "Offsite",
];

// ========================================
// Status tracking
// ========================================
function applyStatusChange(tech, newStatus) {
  const now = new Date();
  const prevStatus = tech.currentStatus || null;
  const prevChangedAt = tech.lastStatusChangedAt
    ? new Date(tech.lastStatusChangedAt)
    : null;

  const elapsedMs = prevChangedAt ? now - prevChangedAt : 0;

  const updated = { ...tech };

  if (prevStatus === "Enroute") {
    updated.totalEnrouteTime = (updated.totalEnrouteTime || 0) + elapsedMs;
  }

  if (prevStatus === "Onsite") {
    updated.totalOnsiteTime = (updated.totalOnsiteTime || 0) + elapsedMs;
  }

  if (prevStatus === "Leaving Site (Travel Time)" && newStatus === "Offsite") {
    updated.techLeaveTravelTime = elapsedMs;
  }

  if (newStatus === "Enroute" && !updated.firstEnrouteTime) {
    updated.firstEnrouteTime = now.toISOString();
  }

  if (newStatus === "Onsite" && !updated.firstOnsiteTime) {
    updated.firstOnsiteTime = now.toISOString();
  }

  updated.techOnsite = newStatus === "Onsite";
  updated.currentStatus = newStatus;
  updated.lastStatusChangedAt = now.toISOString();

  updated.statusHistory = [
    ...(updated.statusHistory || []),
    { status: newStatus, timestamp: now.toISOString() },
  ];

  return updated;
}

function formatDuration(ms) {
  if (!ms || ms <= 0) return "0m";

  const totalMinutes = Math.round(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes}m`;

  return `${hours}h ${minutes}m`;
}

// ========================================
// Normalize MongoDB IDs
// ========================================
function toIdString(value) {
  if (!value) return null;

  if (typeof value === "string") return value;

  if (typeof value === "object" && value.$oid) {
    return value.$oid;
  }

  if (typeof value.toString === "function") {
    const str = value.toString();
    return str === "[object Object]" ? null : str;
  }

  return null;
}

// Every RNM technician is identified by rnmTechId.
// userId is retained as a fallback for older assignments.
function getTechKey(tech) {
  return toIdString(tech?.rnmTechId || tech?.userId);
}

function blankTech(row) {
  return {
    rnmTechId: row.rnmTechId,
    techName: row.techName,
    techPhone: row.techPhone,

    currentStatus: null,
    firstEnrouteTime: null,
    firstOnsiteTime: null,
    totalEnrouteTime: 0,
    totalOnsiteTime: 0,
    techOnsite: false,
    techLeaveTravelTime: null,
    lastStatusChangedAt: null,
    statusHistory: [],
  };
}

// ========================================
// RNM Assign Tech Modal
// ========================================
const AssignTechModal = ({
  pendingNewTechs,
  onChangePendingNewTechs,
  onClose,
}) => {
  const { token } = useAuth();
  const { caseItem, setCaseItem } = useCase();

  const [techs, setTechs] = useState([]);
  const [loadingTechs, setLoadingTechs] = useState(true);
  const [search, setSearch] = useState("");

  const [savingTechId, setSavingTechId] = useState(null);
  const [expandedTechId, setExpandedTechId] = useState(null);

  const [draftTech, setDraftTech] = useState(null);

  const popupRef = useRef(null);

  const committedTechs = caseItem?.techsAssigned || [];

  // The RNM case contains the original customerId and/or
  // the populated customer object.
  const customerId = toIdString(
    caseItem?.customer?._id || caseItem?.customerId,
  );

  // ========================================
  // FETCH RNM TECHNICIANS
  // ========================================
  useEffect(() => {
    if (!customerId) {
      setTechs([]);
      setLoadingTechs(false);
      return;
    }

    const fetchTechs = async () => {
      setLoadingTechs(true);

      try {
        const res = await fetch(
          `${API_URL}/rnm/customers/${customerId}/techs`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!res.ok) {
          throw new Error("Failed to fetch RNM technicians");
        }

        const data = await res.json();
        console.log("RNM TECHNICIAN API RESPONSE:", data);
        setTechs(data);
      } catch (err) {
        console.error("RNM TECH FETCH ERROR:", err);
        setTechs([]);
      } finally {
        setLoadingTechs(false);
      }
    };

    fetchTechs();
  }, [customerId, token]);

  // ========================================
  // CLOSE ON OUTSIDE CLICK
  // ========================================
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  // ========================================
  // ASSIGNED TECHNICIAN IDS
  // ========================================
  const assignedIds = new Set([
    ...committedTechs.map(getTechKey),
    ...pendingNewTechs.map(getTechKey),
  ]);

  // ========================================
  // AVAILABLE RNM TECHNICIANS
  // ========================================
  const searchLower = search.toLowerCase();

  const availableTechs = techs
    .filter((tech) => !assignedIds.has(toIdString(tech._id)))
    .filter((tech) => tech.techName?.toLowerCase().includes(searchLower))
    .sort((a, b) => (a.techName || "").localeCompare(b.techName || ""));

  // ========================================
  // MERGED DISPLAY ROWS
  // ========================================
  const rows = [
    ...committedTechs.map((t) => {
      const matchingTech = techs.find(
        (tech) => toIdString(tech._id) === getTechKey(t),
      );

      return {
        ...t,
        rnmTechId: t.rnmTechId || matchingTech?._id,
        techName:
          matchingTech?.techName ||
          t.techName ||
          `${t.firstname || ""} ${t.lastname || ""}`.trim() ||
          "Unknown technician",
        _kind: "committed",
      };
    }),

    ...pendingNewTechs.map((t) => ({
      ...t,
      _kind: "pending",
    })),

    ...availableTechs.map((tech) => ({
      rnmTechId: tech._id,
      techName: tech.techName,
      techPhone: tech.techPhone,
      _kind: "available",
    })),
  ];

  // ========================================
  // DRAFT STATUS
  // ========================================
  const handleDraftStatusChange = (newStatus) => {
    setDraftTech((prev) => applyStatusChange(prev, newStatus));
  };

  const handleSaveDraft = () => {
    if (!draftTech) return;

    onChangePendingNewTechs([...pendingNewTechs, draftTech]);
    setDraftTech(null);
    setExpandedTechId(null);
  };

  // ========================================
  // REMOVE PENDING TECH
  // ========================================
  const removePendingTech = (techId) => {
    onChangePendingNewTechs(
      pendingNewTechs.filter((t) => getTechKey(t) !== techId),
    );

    setExpandedTechId(null);
  };

  // ========================================
  // PENDING STATUS CHANGE
  // ========================================
  const handlePendingStatusChange = (techId, newStatus) => {
    onChangePendingNewTechs(
      pendingNewTechs.map((t) =>
        getTechKey(t) === techId ? applyStatusChange(t, newStatus) : t,
      ),
    );
  };

  // ========================================
  // COMMITTED STATUS CHANGE
  // ========================================
  const handleCommittedStatusChange = async (techId, newStatus) => {
    const updatedTechs = committedTechs.map((t) =>
      getTechKey(t) === techId ? applyStatusChange(t, newStatus) : t,
    );

    setSavingTechId(techId);

    try {
      const res = await fetch(`${API_URL}/rnm/case/${caseItem._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          techsAssigned: updatedTechs,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update RNM tech status");
      }

      const updatedCase = await res.json();
      setCaseItem(updatedCase);
    } catch (err) {
      console.error("RNM TECH STATUS ERROR:", err);
      alert("Failed to update technician status.");
    } finally {
      setSavingTechId(null);
    }
  };

  // ========================================
  // EXPAND / COLLAPSE ROW
  // ========================================
  const handleRowClick = (row) => {
    const techId = getTechKey(row);
    const alreadyExpanded = expandedTechId === techId;

    if (row._kind === "available") {
      if (alreadyExpanded) {
        setExpandedTechId(null);
        setDraftTech(null);
        return;
      }

      setDraftTech(blankTech(row));
      setExpandedTechId(techId);
      return;
    }

    setDraftTech(null);
    setExpandedTechId(alreadyExpanded ? null : techId);
  };

  // ========================================
  // EXPANDED TECHNICIAN DETAILS
  // ========================================
  const renderExpandedDetails = (row) => {
    const isDraft = row._kind === "available";
    const techId = getTechKey(row);

    const statusValue = isDraft
      ? draftTech?.currentStatus || ""
      : row.currentStatus || "";

    const onStatusChange = (e) => {
      const newStatus = e.target.value;

      if (isDraft) {
        handleDraftStatusChange(newStatus);
      } else if (row._kind === "committed") {
        handleCommittedStatusChange(techId, newStatus);
      } else {
        handlePendingStatusChange(techId, newStatus);
      }
    };

    const statsSource = isDraft ? draftTech : row;

    const disabled = row._kind === "committed" && savingTechId === techId;

    return (
      <div
        className="assign-tech-expanded"
        onClick={(e) => e.stopPropagation()}
      >
        <select
          value={statusValue}
          disabled={disabled}
          onChange={onStatusChange}
        >
          <option value="" disabled>
            Select status...
          </option>

          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <div className="assign-tech-status-stats">
          <div className="status-stat">
            <small>Onsite</small>
            <strong>{statsSource?.techOnsite ? "Yes" : "No"}</strong>
          </div>

          <div className="status-stat">
            <small>Enroute</small>
            <strong>{formatDuration(statsSource?.totalEnrouteTime)}</strong>
          </div>

          <div className="status-stat">
            <small>Onsite Time</small>
            <strong>{formatDuration(statsSource?.totalOnsiteTime)}</strong>
          </div>

          {statsSource?.techLeaveTravelTime != null && (
            <div className="status-stat">
              <small>Travel</small>
              <strong>{formatDuration(statsSource.techLeaveTravelTime)}</strong>
            </div>
          )}
        </div>

        {isDraft && (
          <button className="assign-tech-save-btn" onClick={handleSaveDraft}>
            Save
          </button>
        )}

        {row._kind === "pending" && (
          <button
            className="assign-tech-remove-btn"
            onClick={() => removePendingTech(techId)}
          >
            Remove
          </button>
        )}
      </div>
    );
  };

  // ========================================
  // RENDER
  // ========================================
  return (
    <div className="assign-tech-overlay">
      <div className="assign-tech-popup" ref={popupRef}>
        <div className="assign-tech-header">
          <h4>Assign RNM Techs</h4>
          <button onClick={onClose}>✕</button>
        </div>

        <input
          type="text"
          placeholder="Search technicians..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="assign-tech-search"
        />

        <div className="assign-tech-list">
          {loadingTechs ? (
            <p>Loading technicians...</p>
          ) : !customerId ? (
            <p>Could not identify the RNM customer for this case.</p>
          ) : rows.length > 0 ? (
            rows.map((row) => {
              const techId = getTechKey(row);
              const isExpanded = expandedTechId === techId;

              return (
                <div
                  key={techId}
                  className={`assign-tech-row assign-tech-row--${row._kind} ${
                    isExpanded ? "expanded" : ""
                  }`}
                  onClick={() => handleRowClick(row)}
                >
                  <div className="assign-tech-row-header">
                    <span>
                      {row.techName}
                      {row.techPhone && ` - ${row.techPhone}`}
                    </span>

                    {row._kind === "committed" && (
                      <span className="assign-tech-locked-label">Assigned</span>
                    )}

                    {row._kind === "pending" && (
                      <span className="assign-tech-pending-label">Pending</span>
                    )}
                  </div>

                  {isExpanded && renderExpandedDetails(row)}
                </div>
              );
            })
          ) : (
            <p>
              {techs.length === 0
                ? "No RNM technicians found for this customer."
                : "No technicians found."}
            </p>
          )}
        </div>

        <div className="assign-tech-footer">
          <button onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
};

export default AssignTechModal;

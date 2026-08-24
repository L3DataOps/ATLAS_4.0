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

// =========================
// Pure helper: given a tech's current tracking fields and a new
// status, returns the updated tech object. Centralized here so the
// same math runs whether the change is persisted immediately
// (committed techs) or held locally (pending / draft techs).
// =========================
function applyStatusChange(tech, newStatus) {
  const now = new Date();
  const prevStatus = tech.currentStatus || null;
  const prevChangedAt = tech.lastStatusChangedAt
    ? new Date(tech.lastStatusChangedAt)
    : null;
  const elapsedMs = prevChangedAt ? now - prevChangedAt : 0;

  const updated = { ...tech };

  // Accumulate time spent in the state we're leaving
  if (prevStatus === "Enroute") {
    updated.totalEnrouteTime = (updated.totalEnrouteTime || 0) + elapsedMs;
  }
  if (prevStatus === "Onsite") {
    updated.totalOnsiteTime = (updated.totalOnsiteTime || 0) + elapsedMs;
  }

  // Travel time = time spent between "Leaving Site" and "Offsite"
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

// Normalizes a Mongo id-like value to a plain string, regardless of
// whether it arrives as a plain string, an Extended JSON object
// ({ $oid: "..." }), or a raw ObjectId instance with .toString().
function toIdString(value) {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object" && value.$oid) return value.$oid;
  if (typeof value.toString === "function") {
    const str = value.toString();
    return str === "[object Object]" ? null : str;
  }
  return null;
}

function blankTech(row) {
  return {
    userId: row.userId,
    firstname: row.firstname,
    lastname: row.lastname,
    company: row.company,
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

// pendingNewTechs / onChangePendingNewTechs: techs already committed
// to being added THIS session (not yet on the case). Owned by the
// parent (so Cancel can discard them). Committed techs (already on
// caseItem.techsAssigned) are read straight from context and are
// locked + persisted live.
const AssignTechModal = ({
  pendingNewTechs,
  onChangePendingNewTechs,
  onClose,
}) => {
  const { token } = useAuth();
  const { caseItem, setCaseItem } = useCase();

  const [users, setUsers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [search, setSearch] = useState("");
  const [savingUserId, setSavingUserId] = useState(null);
  const [expandedUserId, setExpandedUserId] = useState(null);

  // Unsaved status draft for an available user who's expanded but
  // hasn't been added yet — nothing here is committed to
  // pendingNewTechs until "Save" is clicked.
  const [draftTech, setDraftTech] = useState(null);

  const popupRef = useRef(null);

  const committedTechs = caseItem.techsAssigned || [];

  // =========================
  // FETCH USERS
  // =========================
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${API_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch users");
        }

        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error(err);
        setUsers([]);
      }
    };

    fetchUsers();
  }, [token]);

  // =========================
  // FETCH VENDORS
  // (needed to resolve equipment.defaultVendor, which is an id,
  // into a vendor name — the only thing user.company holds)
  // =========================
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await fetch(`${API_URL}/vendors`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch vendors");
        }

        const data = await res.json();
        setVendors(data);
      } catch (err) {
        console.error(err);
        setVendors([]);
      }
    };

    fetchVendors();
  }, [token]);

  // =========================
  // CLOSE ON OUTSIDE CLICK
  // =========================
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const assignedIds = new Set([
    ...committedTechs.map((t) => t.userId),
    ...pendingNewTechs.map((t) => t.userId),
  ]);

  const searchLower = search.toLowerCase();
  const defaultVendorId = toIdString(caseItem?.equipment?.defaultVendor);
  const defaultVendorName =
    vendors.find((v) => toIdString(v._id) === defaultVendorId)?.vendorName ||
    null;

  const isDefaultVendorCompany = (company) =>
    Boolean(
      defaultVendorName &&
      company &&
      company.trim().toLowerCase() === defaultVendorName.trim().toLowerCase(),
    );

  // Available users are grouped into two tiers — techs from the
  // equipment's default vendor first, then everyone else — and
  // alphabetical (by last name, then first name) within each tier.
  const availableUsers = users
    .filter((u) => !assignedIds.has(u._id))
    .filter((u) => {
      const fullName = `${u.firstname} ${u.lastname}`.toLowerCase();
      return (
        fullName.includes(searchLower) ||
        u.email?.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      const aIsDefaultVendor = isDefaultVendorCompany(a.company);
      const bIsDefaultVendor = isDefaultVendorCompany(b.company);

      if (aIsDefaultVendor !== bIsDefaultVendor) {
        return aIsDefaultVendor ? -1 : 1;
      }

      const aName = `${a.lastname} ${a.firstname}`.toLowerCase();
      const bName = `${b.lastname} ${b.firstname}`.toLowerCase();

      return aName.localeCompare(bName);
    });

  // =========================
  // ONE merged, ordered list: locked (committed) techs first,
  // then pending (saved-this-session) techs, then everyone else.
  // Assigned techs stay pinned at the top regardless of search.
  // =========================
  const rows = [
    ...committedTechs.map((t) => {
      const user = users.find((u) => u._id === t.userId);

      return {
        ...t,
        company: user?.company || t.company || "Unknown",
        _kind: "committed",
      };
    }),

    ...pendingNewTechs.map((t) => {
      const user = users.find((u) => u._id === t.userId);

      return {
        ...t,
        company: user?.company || t.company || "Unknown",
        _kind: "pending",
      };
    }),

    ...availableUsers.map((u) => ({
      userId: u._id,
      firstname: u.firstname,
      lastname: u.lastname,
      company: u.company,
      _kind: "available",
      _isDefaultVendor: isDefaultVendorCompany(u.company),
    })),
  ];

  // Status change for a tech still in draft (not yet saved anywhere)
  const handleDraftStatusChange = (newStatus) => {
    setDraftTech((prev) => applyStatusChange(prev, newStatus));
  };

  // Commits the current draft into pendingNewTechs — this is the
  // moment an available user actually becomes "pending".
  const handleSaveDraft = () => {
    if (!draftTech) return;

    onChangePendingNewTechs([...pendingNewTechs, draftTech]);
    setDraftTech(null);
  };

  // Removes a tech that was added THIS session but hasn't been
  // saved to the case yet — e.g. the wrong person was picked.
  // Committed techs have no equivalent; once saved to the case
  // they're permanent.
  const removePendingTech = (userId) => {
    onChangePendingNewTechs(pendingNewTechs.filter((t) => t.userId !== userId));

    if (expandedUserId === userId) {
      setExpandedUserId(null);
    }
  };

  // Status change for a tech NOT yet saved to the case but already
  // committed to pendingNewTechs — stays local, saved to the case
  // together with the rest of the assignment on note save.
  const handlePendingStatusChange = (userId, newStatus) => {
    onChangePendingNewTechs(
      pendingNewTechs.map((t) =>
        t.userId === userId ? applyStatusChange(t, newStatus) : t,
      ),
    );
  };

  // Status change for a tech ALREADY on the case — persists
  // immediately, independent of any note being drafted.
  const handleCommittedStatusChange = async (userId, newStatus) => {
    const updatedTechs = committedTechs.map((t) =>
      t.userId === userId ? applyStatusChange(t, newStatus) : t,
    );

    setSavingUserId(userId);

    try {
      const res = await fetch(`${API_URL}/cases/${caseItem._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ techsAssigned: updatedTechs }),
      });

      if (!res.ok) {
        throw new Error("Failed to update tech status");
      }

      const updatedCase = await res.json();
      setCaseItem(updatedCase);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingUserId(null);
    }
  };

  const handleRowClick = (row) => {
    const alreadyExpanded = expandedUserId === row.userId;

    if (row._kind === "available") {
      if (alreadyExpanded) {
        setExpandedUserId(null);
        setDraftTech(null);
        return;
      }

      setDraftTech(blankTech(row));
      setExpandedUserId(row.userId);
      return;
    }

    // Switching to a committed/pending row discards any unsaved
    // available-user draft.
    setDraftTech(null);
    setExpandedUserId(alreadyExpanded ? null : row.userId);
  };

  const renderExpandedDetails = (row) => {
    const isDraft = row._kind === "available";

    const statusValue = isDraft
      ? draftTech?.currentStatus || ""
      : row.currentStatus || "";

    const onStatusChange = (e) => {
      const newStatus = e.target.value;

      if (isDraft) {
        handleDraftStatusChange(newStatus);
      } else if (row._kind === "committed") {
        handleCommittedStatusChange(row.userId, newStatus);
      } else {
        handlePendingStatusChange(row.userId, newStatus);
      }
    };

    const statsSource = isDraft ? draftTech : row;
    const disabled = row._kind === "committed" && savingUserId === row.userId;

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
            onClick={() => removePendingTech(row.userId)}
          >
            Remove
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="assign-tech-overlay">
      <div className="assign-tech-popup" ref={popupRef}>
        <div className="assign-tech-header">
          <h4>Assign Techs</h4>
          <button onClick={onClose}>✕</button>
        </div>

        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="assign-tech-search"
        />

        <div className="assign-tech-list">
          {rows.length > 0 ? (
            rows.map((row) => {
              const isExpanded = expandedUserId === row.userId;

              return (
                <div
                  key={row.userId}
                  className={`assign-tech-row assign-tech-row--${row._kind} ${
                    isExpanded ? "expanded" : ""
                  }`}
                  onClick={() => handleRowClick(row)}
                >
                  <div className="assign-tech-row-header">
                    <span>
                      {row.firstname} {row.lastname} - {row.company}
                    </span>

                    {row._kind === "committed" && (
                      <span className="assign-tech-locked-label">Assigned</span>
                    )}
                    {row._kind === "pending" && (
                      <span className="assign-tech-pending-label">Pending</span>
                    )}
                    {row._kind === "available" && row._isDefaultVendor && (
                      <span className="assign-tech-vendor-label">
                        Preferred Vendor
                      </span>
                    )}
                  </div>

                  {isExpanded && renderExpandedDetails(row)}
                </div>
              );
            })
          ) : (
            <p>No users found.</p>
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

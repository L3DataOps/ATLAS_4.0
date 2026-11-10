import { useEffect, useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useParams } from "react-router-dom";
import { CaseProvider, useCase } from "../../context/CaseContext";

import "./CaseDetails.css";

import flagIcon from "../../images/flag.png";
import redFlagIcon from "../../images/red-flag.png";

import TimeTile from "./components/TimeTile";
import InitialDesc from "./components/InitialDesc";
import AuxCard from "./components/AuxCard";
import EqInfoCard from "./components/EqInfoCard";
import ActivityNoteSection from "./components/ActivityNoteSection";
import TabCard from "./TabCardSection/TabCard";
import Timecard from "./components/Timecard";
import TechCard from "./components/TechCard";
import DQC from "./components/DQC";
import Checklist from "./components/Checklist";

const API_URL = import.meta.env.VITE_API;
const POLL_INTERVAL_MS = 1000;

// =========================
// OUTER COMPONENT
// =========================

const CaseDetails = () => {
  const { id } = useParams();

  const [initialCase, setInitialCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchCase = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/cases/${id}`);

        if (!response.ok) {
          throw new Error("Failed to fetch case.");
        }

        const data = await response.json();

        if (!cancelled) {
          setInitialCase(data);
        }
      } catch (err) {
        console.error(err);

        if (!cancelled) {
          setError(err.message || "Unable to load case.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchCase();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="sof-loading">
        <div className="sof-loading-spinner"></div>
        <p>Loading case details...</p>
      </div>
    );
  }

  if (!initialCase) {
    return (
      <div className="sof-error">
        <h2>Case not found</h2>
        <p>{error || "This case could not be located."}</p>
      </div>
    );
  }

  return (
    <CaseProvider initialCase={initialCase}>
      <CaseDetailsContent />
    </CaseProvider>
  );
};

const handleExportPDF = () => {
  window.print();
};

// =========================
// INNER COMPONENT
// =========================

const CaseDetailsContent = () => {
  const { token, user } = useAuth();
  const { caseItem, setCaseItem } = useCase();
  console.log(caseItem);

  const [category, setCategory] = useState(caseItem.category || "");
  const [togglingFlag, setTogglingFlag] = useState(false);

  const caseItemRef = useRef(caseItem);

  // Keep current case available to polling
  useEffect(() => {
    caseItemRef.current = caseItem;
  }, [caseItem]);

  useEffect(() => {
    setCategory(caseItem.category || "");
  }, [caseItem.category]);

  // =========================
  // CASE POLLING
  // =========================

  useEffect(() => {
    const id = caseItem._id;

    if (!id) return;

    const intervalId = setInterval(async () => {
      try {
        const response = await fetch(`${API_URL}/cases/${id}`);

        if (!response.ok) {
          throw new Error("Failed to refresh case.");
        }

        const freshCase = await response.json();

        setCaseItem((prev) => {
          const changed = JSON.stringify(prev) !== JSON.stringify(freshCase);

          return changed ? freshCase : prev;
        });
      } catch (err) {
        console.error("CASE POLL ERROR:", err);
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [caseItem._id, setCaseItem]);

  // =========================
  // CATEGORY
  // =========================

  const categories = [
    "Critical",
    "Major",
    "Minor",
    "Network",
    "Facilities",
    "Civil",
    "Site Access",
  ];

  const handleCategoryChange = async (e) => {
    const newCategory = e.target.value;
    const previousCategory = category;

    setCategory(newCategory);

    try {
      const response = await fetch(`${API_URL}/cases/${caseItem._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ category: newCategory }),
      });

      if (!response.ok) {
        throw new Error("Failed to update category");
      }

      const updatedCase = await response.json();
      setCaseItem(updatedCase);
    } catch (err) {
      console.error(err);
      setCategory(previousCategory);
    }
  };

  // =========================
  // FLAG
  // =========================

  const isFlaggedByMe = (caseItem.flaggedUsers || []).some(
    (uid) => String(uid) === String(user?.id),
  );

  const handleToggleFlag = async () => {
    if (!user?.id || togglingFlag) return;

    const currentFlags = caseItem.flaggedUsers || [];

    const updatedFlags = isFlaggedByMe
      ? currentFlags.filter((uid) => String(uid) !== String(user.id))
      : [...currentFlags, user.id];

    setCaseItem((prev) => ({
      ...prev,
      flaggedUsers: updatedFlags,
    }));

    setTogglingFlag(true);

    try {
      const response = await fetch(`${API_URL}/cases/${caseItem._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ flaggedUsers: updatedFlags }),
      });

      if (!response.ok) {
        throw new Error("Failed to update flag");
      }

      const updatedCase = await response.json();
      setCaseItem(updatedCase);
    } catch (err) {
      console.error("FLAG TOGGLE ERROR:", err);

      setCaseItem((prev) => ({
        ...prev,
        flaggedUsers: currentFlags,
      }));
    } finally {
      setTogglingFlag(false);
    }
  };

  // =========================
  // DATE FORMAT
  // =========================

  const formatDateTime = (iso) => {
    if (!iso) return "N/A";

    const d = new Date(iso);

    if (Number.isNaN(d.getTime())) return "N/A";

    const date = `${d.getMonth() + 1}/${d.getDate()}/${String(
      d.getFullYear(),
    ).slice(2)}`;

    const time = `${String(d.getHours()).padStart(2, "0")}:${String(
      d.getMinutes(),
    ).padStart(2, "0")}`;

    return `${date} ${time}`;
  };

  // =========================
  // RENDER
  // =========================

  return (
    <div className="sof-case-details-page">
      {/* =========================
          TOP SECTION
      ========================= */}

      <div className="sof-container">
        {/* LEFT: CASE INFORMATION */}

        <aside className="sof-title-card">
          <div className="sof-title-head">
            <div className="sof-case-heading">
              <span className="sof-overline">CASE DETAILS</span>

              <h3>
                {caseItem.equipment?.caseType || "SOF"}: {caseItem.caseNumber}
              </h3>
            </div>

            <button
              type="button"
              className="sof-flag-button"
              onClick={handleToggleFlag}
              disabled={togglingFlag}
              title={isFlaggedByMe ? "Remove flag" : "Flag case"}
              aria-label={isFlaggedByMe ? "Unflag case" : "Flag case"}
            >
              <img src={isFlaggedByMe ? redFlagIcon : flagIcon} alt="" />
            </button>
          </div>

          <div className="sof-title-subhead">
            <div className="sof-site-info">
              <h4>{caseItem.site?.siteName || "Unknown Site"}</h4>

              <p>{caseItem.site?.region?.slice(0, 4) || "N/A"}</p>
            </div>

            <select
              value={category}
              onChange={handleCategoryChange}
              aria-label="Case category"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="sof-border" />

          {/* TIME INFORMATION */}

          <div className="sof-time-section">
            <TimeTile
              label="Created"
              time={formatDateTime(caseItem.createdAt)}
            />

            <TimeTile
              label="Enroute"
              time={formatDateTime(caseItem.techEnroute)}
            />

            <TimeTile
              label="Onsite"
              time={formatDateTime(caseItem.techOnsite)}
            />

            <TimeTile
              label="Completed"
              time={formatDateTime(caseItem.completedAt)}
            />
          </div>

          <div className="sof-border" />

          {/* ASSIGNED TECHNICIANS */}

          <div className="tech-names">
            <TechCard />
          </div>

          <div className="sof-border" />

          {/* CURRENT STATUS */}

          <div className="sof-status-section">
            <span className="sof-overline">CURRENT STATUS</span>

            <div
              className={`sof-case-status-detail ${caseItem.status
                ?.toLowerCase()
                .replace(/\s+/g, "-")}`}
            >
              <p>{caseItem.status || "Unknown"}</p>
            </div>
          </div>
        </aside>

        {/* RIGHT: DESCRIPTION AND INFORMATION */}

        <main className="sof-sub-container">
          <InitialDesc
            caseItem={caseItem}
            description={caseItem.description}
            tags={caseItem.tags}
            time={formatDateTime(caseItem.createdAt)}
            casecategory={caseItem.category}
          />

          {/* DISPATCH AND EQUIPMENT */}

          <div className="sof-across">
            <div className="sof-aux-card">
              <AuxCard dispatchCenters={caseItem.dispatchCenterNotified} />
            </div>

            <div className="sof-eq-info-card">
              <EqInfoCard caseItem={caseItem} />
            </div>
          </div>
        </main>
      </div>

      {/* =========================
          ACTIVITY AND TABS
      ========================= */}

      <section className="sof-across-mod">
        <div className="sof-activity-section">
          <ActivityNoteSection caseItem={caseItem} setCaseItem={setCaseItem} />
        </div>

        <div className="sof-tab-section">
          <TabCard caseItem={caseItem} setCaseItem={setCaseItem} />
        </div>
      </section>

      {/* =========================
          TIME AND DQC
      ========================= */}

      <section className="sof-across sof-metrics-row">
        <div className="sof-timecard-section">
          <Timecard />
        </div>

        <div className="sof-dqc-section">
          <DQC />
        </div>
      </section>

      {/* =========================
          CHECKLIST
      ========================= */}

      <section className="sof-checklist-section">
        <Checklist />
      </section>
    </div>
  );
};

export default CaseDetails;

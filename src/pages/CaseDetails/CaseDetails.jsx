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
// OUTER: unchanged
// =========================
const CaseDetails = () => {
  const { id } = useParams();

  const [initialCase, setInitialCase] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCase = async () => {
      try {
        const response = await fetch(`${API_URL}/cases/${id}`);

        if (!response.ok) {
          throw new Error("Failed to fetch case.");
        }

        const data = await response.json();
        setInitialCase(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCase();
  }, [id]);

  if (loading) return <h2>Loading...</h2>;
  if (!initialCase) return <h2>Case not found.</h2>;

  return (
    <CaseProvider initialCase={initialCase}>
      <CaseDetailsContent />
    </CaseProvider>
  );
};

// =========================
// INNER
// =========================
const CaseDetailsContent = () => {
  const { token, user } = useAuth();
  const { caseItem, setCaseItem } = useCase();

  const [category, setCategory] = useState(caseItem.category || "");
  const [togglingFlag, setTogglingFlag] = useState(false);

  console.log("Rendering CaseDetailsContent with caseItem:", caseItem);

  const caseItemRef = useRef(caseItem);
  useEffect(() => {
    caseItemRef.current = caseItem;
  }, [caseItem]);

  useEffect(() => {
    setCategory(caseItem.category || "");
  }, [caseItem.category]);

  useEffect(() => {
    const id = caseItemRef.current._id;
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
  }, [caseItemRef.current._id, setCaseItem]);

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
    }
  };

  // =========================
  // TOGGLE FLAG
  // Adds/removes the current user's id from flaggedUsers so they
  // can later view all cases they've flagged on a separate page.
  // =========================
  const isFlaggedByMe = (caseItem.flaggedUsers || []).includes(user?.id);

  const handleToggleFlag = async () => {
    if (!user?.id || togglingFlag) return;

    const currentFlags = caseItem.flaggedUsers || [];
    const updatedFlags = isFlaggedByMe
      ? currentFlags.filter((uid) => uid !== user.id)
      : [...currentFlags, user.id];

    // Optimistic update
    setCaseItem((prev) => ({ ...prev, flaggedUsers: updatedFlags }));
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
      // Revert on failure
      setCaseItem((prev) => ({ ...prev, flaggedUsers: currentFlags }));
    } finally {
      setTogglingFlag(false);
    }
  };

  const formatDateTime = (iso) => {
    if (!iso) {
      return "N/A";
    }

    const d = new Date(iso);

    const date = `${d.getMonth() + 1}/${d.getDate()}/${String(
      d.getFullYear(),
    ).slice(2)}`;

    const time = `${String(d.getHours()).padStart(2, "0")}:${String(
      d.getMinutes(),
    ).padStart(2, "0")}`;

    return `${date} ${time}`;
  };

  return (
    <div className="case-details-page">
      <div className="container">
        <div className="title-card">
          <div className="title-head">
            <div>
              <h3>
                {caseItem.equipment?.caseType}: {caseItem.caseNumber}
              </h3>
            </div>

            <img
              src={isFlaggedByMe ? redFlagIcon : flagIcon}
              alt={isFlaggedByMe ? "Unflag case" : "Flag case"}
              onClick={handleToggleFlag}
              className="flag-icon"
              style={{
                cursor: togglingFlag ? "not-allowed" : "pointer",
                opacity: togglingFlag ? 0.6 : 1,
              }}
            />
          </div>

          <div className="title-subhead">
            <div className="site-info">
              <h4>{caseItem.site?.siteName}</h4>
              <p>{caseItem.site?.region?.slice(0, 4)}</p>
            </div>

            <select value={category} onChange={handleCategoryChange}>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="border"></div>

          <div className="time-section">
            <TimeTile
              label={"Created"}
              time={formatDateTime(caseItem.createdAt)}
            />
            <TimeTile
              label={"Enroute"}
              time={formatDateTime(caseItem.techEnroute)}
            />
            <TimeTile
              label={"Onsite"}
              time={formatDateTime(caseItem.techOnsite)}
            />
            <TimeTile
              label={"Completed"}
              time={formatDateTime(caseItem.completedAt)}
            />
          </div>

          <div className="border"></div>

          <div className="tech-names">
            <TechCard />
          </div>

          <div className="border"></div>

          <div className="case-status-detail">
            <p>{caseItem.status}</p>
          </div>
        </div>

        <div className="sub-container">
          <div className="initial-description-card">
            <InitialDesc
              caseItem={caseItem}
              description={caseItem.description}
              tags={caseItem.tags}
              time={formatDateTime(caseItem.createdAt)}
              casecategory={caseItem.category}
            />
          </div>

          <div className="across">
            <div className="aux-card">
              <AuxCard dispatchCenters={caseItem.dispatchCenterNotified} />
            </div>
            <div className="eq-info-card">
              <EqInfoCard caseItem={caseItem} />
            </div>
          </div>
        </div>
      </div>
      <div className="across-mod">
        <ActivityNoteSection caseItem={caseItem} setCaseItem={setCaseItem} />
        <TabCard caseItem={caseItem} setCaseItem={setCaseItem} />
      </div>
      <div className="across">
        <Timecard />
        <DQC />
      </div>
      <Checklist />
    </div>
  );
};

export default CaseDetails;

import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useParams } from "react-router-dom";
import { CaseProvider, useCase } from "../../context/CaseContext";

import "./CaseDetails.css";
import flagIcon from "../../images/flag.png";

import TimeTile from "./components/TimeTile";
import InitialDesc from "./components/InitialDesc";
import AuxCard from "./components/AuxCard";
import EqInfoCard from "./components/EqInfoCard";
import ActivityNoteSection from "./components/ActivityNoteSection";
import TabCard from "./TabCardSection/TabCard";

const API_URL = import.meta.env.VITE_API;

// =========================
// OUTER: fetches the case once, then hands off to the provider.
// This component no longer holds the "live" caseItem — after the
// initial load, the CaseProvider (and everything inside it) is the
// single source of truth.
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
// INNER: everything that renders or mutates the case now reads
// from context, so a toggle/patch in any child (AuxCard, TabCard,
// ActivityNoteSection, etc.) is immediately visible everywhere else.
// =========================
const CaseDetailsContent = () => {
  const { token } = useAuth();
  const { caseItem, setCaseItem } = useCase();

  const [category, setCategory] = useState(caseItem.category || "");

  // Keep the category dropdown in sync if caseItem changes from
  // elsewhere (e.g. another PATCH updates category indirectly).
  useEffect(() => {
    setCategory(caseItem.category || "");
  }, [caseItem.category]);

  const categories = [
    "Critical",
    "Major",
    "Minor",
    "Network",
    "Facilities",
    "Civil",
    "Site Access",
  ];

  // =========================
  // PATCH CATEGORY
  // =========================
  const handleCategoryChange = async (e) => {
    const newCategory = e.target.value;

    // optimistic UI update
    setCategory(newCategory);

    try {
      const response = await fetch(`${API_URL}/cases/${caseItem._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          category: newCategory,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update category");
      }

      const updatedCase = await response.json();

      // keep the single shared caseItem in sync with backend
      setCaseItem(updatedCase);
    } catch (err) {
      console.error(err);
    }
  };

  const formatDateTime = (iso) => {
    const d = new Date(iso);

    const date = `${d.getMonth() + 1}/${d.getDate()}/${String(d.getFullYear()).slice(2)}`;
    const time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

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

            <img src={flagIcon} alt={caseItem.status} />
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
              label={"Date Created"}
              time={formatDateTime(caseItem.createdAt)}
            />
            <TimeTile
              label={"Date Created"}
              time={formatDateTime(caseItem.createdAt)}
            />
            <TimeTile
              label={"Date Created"}
              time={formatDateTime(caseItem.createdAt)}
            />
            <TimeTile
              label={"Date Created"}
              time={formatDateTime(caseItem.createdAt)}
            />
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
    </div>
  );
};

export default CaseDetails;

import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useParams } from "react-router-dom";

import "./CaseDetails.css";
import flagIcon from "../../images/flag.png";

import TimeTile from "./components/TimeTile";
import InitialDesc from "./components/InitialDesc";
import AuxCard from "./components/AuxCard";
import EqInfoCard from "./components/EqInfoCard";
import ActivityNoteSection from "./components/ActivityNoteSection";
import TabCard from "./TabCardSection/TabCard";

const API_URL = import.meta.env.VITE_API;

const CaseDetails = () => {
  const { id } = useParams();
  const { user, token } = useAuth();

  const [caseItem, setCaseItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");

  // =========================
  // FETCH CASE
  // =========================
  useEffect(() => {
    const fetchCase = async () => {
      try {
        const response = await fetch(`${API_URL}/cases/${id}`);

        if (!response.ok) {
          throw new Error("Failed to fetch case.");
        }

        const data = await response.json();

        setCaseItem(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCase();
  }, [id]);

  //============================
  //Debugging Code
  //============================

  console.log(caseItem);

  // =========================
  // SYNC CATEGORY WHEN CASE LOADS
  // =========================
  useEffect(() => {
    if (caseItem) {
      setCategory(caseItem.category || "");
    }
  }, [caseItem]);

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
          category: newCategory, // 🔥 FIXED
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update category");
      }

      const updatedCase = await response.json();

      // keep frontend in sync with backend
      setCaseItem(updatedCase);
      setCategory(updatedCase.category || "");
    } catch (err) {
      console.error(err);
    }
  };

  // =========================
  // LOADING / GUARDS
  // =========================
  if (loading) return <h2>Loading...</h2>;
  if (!caseItem) return <h2>Case not found.</h2>;

  const formatDateTime = (iso) => {
    const d = new Date(iso);

    const date = `${d.getMonth() + 1}/${d.getDate()}/${String(d.getFullYear()).slice(2)}`;
    const time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

    return `${date} ${time}`;
  };

  // =========================
  // UI
  // =========================
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
              <AuxCard
                caseItem={caseItem}
                dispatchCenters={caseItem.dispatchCenterNotified}
                setCaseItem={setCaseItem}
              />
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

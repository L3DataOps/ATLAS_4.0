import { useEffect, useState } from "react";
import MiniCaseCard from "./MiniCaseCard";
import "./Tabs.css";

const API_URL = import.meta.env.VITE_API;

const OverviewCases = ({ site }) => {
  const [activeTab, setActiveTab] = useState("open");

  const [openCases, setOpenCases] = useState([]);
  const [closedCases, setClosedCases] = useState([]);

  useEffect(() => {
    if (!site) return;

    const fetchCases = async () => {
      try {
        const res = await fetch(`${API_URL}/cases/site/${site}`);

        const data = await res.json();

        setOpenCases(data.openCases || []);
        setClosedCases(data.closedCases || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCases();
  }, [site]);

  const cases = activeTab === "open" ? openCases : closedCases;

  return (
    <div>
      <div className="overview-tabs">
        <button
          onClick={() => setActiveTab("open")}
          className={activeTab === "open" ? "active" : ""}
        >
          Open ({openCases.length})
        </button>

        <button
          onClick={() => setActiveTab("closed")}
          className={activeTab === "closed" ? "active" : ""}
        >
          Closed ({closedCases.length})
        </button>
      </div>

      <div className="overview-case-list">
        {cases.map((item) => (
          <MiniCaseCard key={item._id} caseItem={item} />
        ))}
      </div>
    </div>
  );
};

export default OverviewCases;

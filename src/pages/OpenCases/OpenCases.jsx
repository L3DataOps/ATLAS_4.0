import { useEffect, useState } from "react";

import "./OpenCases.css";
import SearchTile from "./components/SearchTile";
import CaseCard from "./components/CaseCard";

const OpenCases = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch cases from the API when the component mounts
  useEffect(() => {
    const fetchCases = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API}/cases`);

        if (!response.ok) {
          throw new Error("Failed to fetch cases");
        }

        const data = await response.json();

        setCases(data);
      } catch (error) {
        console.error("Error fetching cases:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, []);

  return (
    <div>
      <h1>Open Cases</h1>
      <div className="header-container">
        <SearchTile title="Ticket #" />
        <SearchTile title="Category" />
        <SearchTile title="Site Name" />
        <SearchTile title="Region" />
        <SearchTile title="Problem" />
        <SearchTile title="Action Taken" />
        <SearchTile title="Equipment" />
      </div>
      <div className="break"></div>
      <div className="case-cards-container">
        {cases.map(
          (caseItem) =>
            console.log(caseItem) || (
              <CaseCard key={caseItem.id} case={caseItem} />
            ),
        )}
      </div>
    </div>
  );
};

export default OpenCases;

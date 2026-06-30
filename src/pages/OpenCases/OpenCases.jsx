import { useEffect, useState } from "react";

import "./OpenCases.css";
import SearchTile from "./components/SearchTile";
import CaseCard from "./components/CaseCard";
import SearchBar from "./components/SearchBar";

const OpenCases = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    ticket: "",
    category: "",
    siteName: "",
    region: "",
    tags: "",
    actionTaken: "",
    equipment: "",
  });

  const updateFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

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

  const filteredCases = cases.filter((c) => {
    const globalQuery = search.toLowerCase().trim();

    // =========================
    // MODE 1: GLOBAL SEARCH
    // =========================
    if (globalQuery) {
      return (
        String(c.caseNumber).includes(globalQuery) ||
        c.category?.toLowerCase().includes(globalQuery) ||
        c.site?.siteName?.toLowerCase().includes(globalQuery) ||
        c.site?.region?.toLowerCase().includes(globalQuery) ||
        c.equipment?.equipmentName?.toLowerCase().includes(globalQuery) ||
        c.description?.toLowerCase().includes(globalQuery) ||
        c.tags?.some((tag) => tag.name?.toLowerCase().includes(globalQuery))
      );
    }

    // =========================
    // MODE 2: INDIVIDUAL FILTERS
    // =========================
    return (
      (!filters.ticket || String(c.caseNumber).includes(filters.ticket)) &&
      (!filters.category ||
        c.category?.toLowerCase().includes(filters.category.toLowerCase())) &&
      (!filters.siteName ||
        c.site?.siteName
          ?.toLowerCase()
          .includes(filters.siteName.toLowerCase())) &&
      (!filters.region ||
        c.site?.region?.toLowerCase().includes(filters.region.toLowerCase())) &&
      (!filters.tags ||
        c.tags?.some((tag) =>
          tag.name?.toLowerCase().includes(filters.tags.toLowerCase()),
        )) &&
      (!filters.equipment ||
        c.equipment?.equipmentName
          ?.toLowerCase()
          .includes(filters.equipment.toLowerCase()))
    );
  });

  return (
    <div>
      <SearchBar value={search} onChange={setSearch} />
      <div className="header-container">
        <SearchTile
          title="Ticket #"
          value={filters.ticket}
          onChange={(v) => updateFilter("ticket", v)}
        />

        <SearchTile
          title="Category"
          value={filters.category}
          onChange={(v) => updateFilter("category", v)}
        />

        <SearchTile
          title="Site Name"
          value={filters.siteName}
          onChange={(v) => updateFilter("siteName", v)}
        />

        <SearchTile
          title="Region"
          value={filters.region}
          onChange={(v) => updateFilter("region", v)}
        />

        <SearchTile
          title="Problem"
          value={filters.tags}
          onChange={(v) => updateFilter("tags", v)}
        />

        <SearchTile
          title="Action Taken"
          value={filters.actionTaken}
          onChange={(v) => updateFilter("actionTaken", v)}
        />

        <SearchTile
          title="Equipment"
          value={filters.equipment}
          onChange={(v) => updateFilter("equipment", v)}
        />
      </div>
      <div className="break"></div>
      <div className="case-cards-container">
        {filteredCases.map((caseItem) => (
          <CaseCard key={caseItem._id} case={caseItem} />
        ))}
      </div>
    </div>
  );
};

export default OpenCases;

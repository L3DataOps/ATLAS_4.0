import { useState } from "react";
import SiteListTile from "./SiteListTile";
import "../components/CreateCaseComponents.css";

const SiteList = ({ sites, selectedSite, onSelectSite }) => {
  const [search, setSearch] = useState("");

  const filteredSites = sites.filter((site) => {
    const name = site.siteName?.toLowerCase() || "";
    const slers1 = site.altSiteName?.toLowerCase() || "";
    const slers2 = site.altSiteName?.toLowerCase() || "";
    const query = search.toLowerCase();

    return (
      name.includes(query) || slers1.includes(query) || slers2.includes(query)
    );
  });

  return (
    <div className="site-list-container">
      {/* SEARCH BAR */}
      <input
        type="text"
        placeholder="Search sites..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="site-search"
      />

      {/* LIST */}
      <ul>
        {filteredSites.map((site) => (
          <SiteListTile
            key={site._id}
            site={site}
            selected={selectedSite?._id === site._id}
            onSelect={onSelectSite}
          />
        ))}
      </ul>
    </div>
  );
};

export default SiteList;

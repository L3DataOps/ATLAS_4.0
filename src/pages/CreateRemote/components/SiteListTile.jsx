import "../components/CreateCaseComponents.css";

export default function SiteListTile({ site, selected, onSelect }) {
  // Matches "All" as a whole word, case-insensitive, so "All Sites"
  // matches but "Allen" or "Small" do not.
  const isAll = /\ball\b/i.test(site.siteName || "");

  return (
    <div
      className={`site-card ${isAll ? "site-card-all" : ""} ${selected ? "selected" : ""}`}
      onClick={() => onSelect(site)}
    >
      <h3>{site.siteName}</h3>
    </div>
  );
}

import "../components/CreateCaseComponents.css";

export default function SiteListTile({ site, selected, onSelect }) {
  return (
    <div
      className={`site-card ${selected ? "selected" : ""}`}
      onClick={() => onSelect(site)}
    >
      <h3>{site.siteName}</h3>
    </div>
  );
}

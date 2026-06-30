import "./CaseCard.css";
import TagBubble from "./TagBubble";

import openIcon from "../../../images/send.png";
import dispatchedIcon from "../../../images/send.png";
import inProgressIcon from "../../../images/active-user.png";
import tacIcon from "../../../images/tac.png";
import driveTimeIcon from "../../../images/awaitdrive.png";

const CaseCard = ({ case: caseItem }) => {
  console.log(caseItem);
  const sortedTags = [...(caseItem.tags || [])].sort(
    (a, b) => a.priority - b.priority,
  );

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "assigned to tac":
        return tacIcon;
      case "awaiting drive time":
        return driveTimeIcon;
      case "dispatched":
        return dispatchedIcon;
      case "in progress":
        return inProgressIcon;
      case "closed":
        return closedIcon;
      default:
        return openIcon;
    }
  };

  const formatElapsedTime = (createdAt) => {
    const created = new Date(createdAt);
    const now = new Date();

    let diff = Math.floor((now - created) / 1000); // seconds

    const intervals = [
      { label: "y", seconds: 31536000 },
      { label: "mth", seconds: 2592000 },
      { label: "d", seconds: 86400 },
      { label: "h", seconds: 3600 },
      { label: "min", seconds: 60 },
    ];

    const result = [];

    for (const unit of intervals) {
      const value = Math.floor(diff / unit.seconds);
      if (value > 0) {
        result.push(`${value}${unit.label}`);
        diff -= value * unit.seconds;
      }

      if (result.length === 2) break; // only top 2 units
    }

    return result.length ? result.join(" ") : "just now";
  };
  return (
    <div className="case-card">
      <div className="section">
        <h5>Ticket #</h5>
        <p>{caseItem.caseNumber}</p>
      </div>
      <div className="section">
        <h5>{caseItem.site?.region || "Unknown Site"}</h5>
        <p>{caseItem.site.siteName}</p>
      </div>
      <div className="section">
        <h5>
          {caseItem.tags?.reduce(
            (a, b) => (b.priority > a.priority ? b : a),
            caseItem.tags[0],
          )?.name || "No Tags"}
        </h5>
      </div>
      <div className="section">
        <h5>{formatElapsedTime(caseItem.createdAt)}</h5>
      </div>
      <div className="section">
        <div className="split-section">
          <img src={getStatusIcon(caseItem.status)} alt={caseItem.status} />

          <div className="status-row">
            <h5>Status -</h5>
            <h5>{caseItem.status}</h5>
          </div>
        </div>
      </div>
      <div className="section">
        <h5>{caseItem.equipment.equipmentName}</h5>
      </div>
      <div className="section">
        <div className="tag-list">
          {sortedTags.map((tag) => (
            <TagBubble key={tag.name} tag={tag} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CaseCard;

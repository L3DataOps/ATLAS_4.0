import "./CaseCard.css";
import TagBubble from "./TagBubble";
import { useNavigate } from "react-router-dom";

import dispatchedIcon from "../../../images/send.png";
import inProgressIcon from "../../../images/active-user.png";
import followUpIcon from "../../../images/followup.png";
import tacIcon from "../../../images/tac.png";
import driveTimeIcon from "../../../images/awaitdrive.png";
import awaitPMIcon from "../../../images/awaitpm.png";
import resolvedIcon from "../../../images/accept.png";
import enrouteIcon from "../../../images/lorry.png";
import notDoneIcon from "../../../images/notdone.png";
import quoteRequestedIcon from "../../../images/quoterequest.png";
import quoteAwaitingApprovalIcon from "../../../images/awaitingapproval.png";
import quoteApprovedIcon from "../../../images/approved.png";
import morningDispatchIcon from "../../../images/morning.png";

const CaseCard = ({ case: caseItem }) => {
  const navigate = useNavigate();

  // RNM tags are plain strings; normalize so TagBubble (which expects
  // an object with a name) keeps working.
  const tags = caseItem.tags || [];

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "assigned to tac":
        return tacIcon;
      case "pm scheduled":
        return awaitPMIcon;
      case "awaiting drive time":
        return driveTimeIcon;
      case "dispatched":
        return dispatchedIcon;
      case "in progress":
        return inProgressIcon;
      case "resolved":
        return resolvedIcon;
      case "tech enroute":
        return enrouteIcon;
      case "not done":
        return notDoneIcon;
      case "quote requested":
        return quoteRequestedIcon;
      case "quote awaiting approval":
        return quoteAwaitingApprovalIcon;
      case "quote approved":
        return quoteApprovedIcon;
      case "morning dispatch":
        return morningDispatchIcon;
      case "follow up required":
        return followUpIcon;
      default:
        return dispatchedIcon;
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
    <div
      className="case-card"
      onClick={() => navigate(`/rnm/case/${caseItem._id}`)}
    >
      <div className="section">
        <h5>RNM #</h5>
        <p>{caseItem.caseNumber}</p>
      </div>

      <div className="section">
        <h5>{caseItem.customer?.customerName || "Unknown Customer"}</h5>
        <p>{caseItem.site?.siteName || "Unknown Site"}</p>
      </div>

      <div className="section">
        <h5>{tags[0] || "No Tags"}</h5>
      </div>

      <div className="section">
        <h5>{formatElapsedTime(caseItem.createdAt)}</h5>
      </div>

      <div className="section">
        <div className="split-section">
          <img src={getStatusIcon(caseItem.status)} alt={caseItem.status} />

          <div className="status-row">
            <h5>Status -</h5>
            <h5 className="case-status">{caseItem.status}</h5>
          </div>
        </div>
      </div>

      <div className="section">
        <h5>{caseItem.equipment?.equipmentName || "Unknown Equipment"}</h5>
      </div>

      <div className="section">
        <div className="tag-list">
          {tags.map((tag) => (
            <TagBubble key={tag} tag={tag} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CaseCard;

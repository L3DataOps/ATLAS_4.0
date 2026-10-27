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

  const isRnm = caseItem.collection === "rnmCases";

  // RNM tags are plain strings, regular case tags are { name, priority }.
  // Normalize everything to objects so rendering and TagBubble stay consistent.
  const tags = (caseItem.tags || []).map((tag) =>
    typeof tag === "string" ? { name: tag } : tag,
  );

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

  // Regular cases have no customer, so lead with the site instead
  const primaryLabel = isRnm
    ? caseItem.customer?.customerName || "Unknown Customer"
    : caseItem.site?.siteName || "Unknown Site";

  const secondaryLabel = isRnm
    ? caseItem.site?.siteName || "Unknown Site"
    : caseItem.category || "";

  const equipmentLabel =
    caseItem.equipment?.equipmentName ||
    caseItem.equipment?.type ||
    "Unknown Equipment";

  // Adjust the non-RNM route to match your router
  const detailPath = isRnm
    ? `/rnm/case/${caseItem._id}`
    : `/cases/${caseItem._id}`;

  return (
    <div className="case-card" onClick={() => navigate(detailPath)}>
      <div className="section">
        <h5>{isRnm ? "RNM #" : "Ticket #"}</h5>
        <p>{caseItem.caseNumber}</p>
      </div>

      <div className="section">
        <h5>{primaryLabel}</h5>
        <p>{secondaryLabel}</p>
      </div>

      <div className="section">
        <h5>{tags[0]?.name || "No Tags"}</h5>
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
        <h5>{equipmentLabel}</h5>
      </div>

      <div className="section">
        <div className="tag-list">
          {tags.map((tag, i) => (
            <TagBubble key={`${tag.name}-${i}`} tag={tag} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CaseCard;

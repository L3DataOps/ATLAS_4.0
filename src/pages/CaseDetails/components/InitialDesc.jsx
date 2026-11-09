
import userIcon from "../../../images/user.png";
import "./CaseDetailComponents.css";

import TagBubble from "./TagBubble";

const API_URL = "http://10.40.255.21:5000";

const InitialDesc = ({ caseItem, description, tags, time, casecategory }) => {
  const categoryClass = casecategory
    ? casecategory.toLowerCase().replace(/\s+/g, "-")
    : "default";

  const profileImage = caseItem?.createdByIcon
    ? `${API_URL}/${caseItem.createdByIcon.replace(/^\/+/, "")}`
    : userIcon;

  return (
    <div className={`initial-description ${categoryClass}`}>
      <div className="init-desc-header">

        {/* Creator */}
        <div className="init-desc-header-section">
          <img
            src={profileImage}
            alt="User Icon"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = userIcon;
            }}
          />

          <div className="init-desc-creator">
            <h3>{caseItem?.createdBy || "Unknown User"}</h3>
          </div>
        </div>

        {/* Tags and Time */}
        <div className="init-desc-header-second-section">
          <div className="init-desc-tags">
            {tags?.map((tag) => (
              <TagBubble key={tag.name} tag={tag} />
            ))}
          </div>

          <div className="init-desc-time">
            {time}
          </div>
        </div>

      </div>

      <div className="border" />

      {/* Description */}
      <div className="init-desc-content">
        <p className="problem">{description || "No description provided."}</p>
      </div>
    </div>
  );
};

export default InitialDesc;

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
        <div className="init-desc-header-section">
          <img
            src={
              caseItem.createdByIcon
                ? `http://10.40.255.21:5000/${caseItem.createdByIcon.replace(/^\/+/, "")}`
                : userIcon
            }
            alt="User Icon"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = userIcon;
            }}
          />

          <h4>{caseItem.createdBy}</h4>
        </div>

        <div className="init-desc-header-second-section">
          {tags?.map((tag) => (
            <TagBubble key={tag.name} tag={tag} />
          ))}

          <h4>{time}</h4>
        </div>
      </div>

      <div className="border"></div>

      <p className="problem">{description}</p>
    </div>
  );
};

export default InitialDesc;

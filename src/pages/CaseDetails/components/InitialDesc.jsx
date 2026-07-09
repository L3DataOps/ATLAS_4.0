import userIcon from "../../../images/user.png";
import "./CaseDetailComponents.css";

import TagBubble from "./TagBubble";

const InitialDesc = ({ caseItem, description, tags, time, casecategory }) => {
  const categoryClass = casecategory
    ? casecategory.toLowerCase().replace(/\s+/g, "-")
    : "default";

  return (
    <div className={`initial-description ${categoryClass}`}>
      <div className="init-desc-header">
        <div className="init-desc-header-section">
          <img src={userIcon} alt="User Icon"></img>
          <h4>{caseItem.createdBy}</h4>
        </div>

        <div className="init-desc-header-second-section">
          {tags.map((tag) => (
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

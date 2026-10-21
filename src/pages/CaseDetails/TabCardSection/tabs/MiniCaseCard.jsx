import { useState } from "react";
import "../tabs/Tabs.css";

const CaseCard = ({ caseItem }) => {
  const [expanded, setExpanded] = useState(false);

  const tags = [...(caseItem.tags || [])].sort((a, b) => {
    const priorityA = typeof a === "object" ? a.priority : 99;
    const priorityB = typeof b === "object" ? b.priority : 99;

    return priorityA - priorityB;
  });

  const mainTag = tags[0];
  const remainingCount = tags.length - 1;

  return (
    <div
      className={`mini-case-card ${expanded ? "expanded" : ""}`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="sof-case-number">#{caseItem.caseNumber}</div>

      <div></div>

      <div className="sof-case-info">
        <span>{caseItem.status}</span>
      </div>

      <div className="sof-case-tags">
        {mainTag && (
          <span className="sof-priority-tag">
            {typeof mainTag === "object" ? mainTag.name : mainTag}
          </span>
        )}

        {remainingCount > 0 && (
          <span className="sof-tag-count">+{remainingCount}</span>
        )}
      </div>

      {expanded && (
        <div className="sof-case-details">
          <p>
            <strong>Category:</strong> {caseItem.category}
          </p>

          <p>
            <strong>Severity:</strong> {caseItem.severity}
          </p>

          <p>
            <strong>Issue:</strong> {caseItem.issueType}
          </p>

          <p>
            <strong>Description:</strong> {caseItem.description}
          </p>

          <div className="sof-all-tags">
            {tags.map((tag, index) => (
              <span key={index}>
                {typeof tag === "object" ? `${tag.name} ` : tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseCard;

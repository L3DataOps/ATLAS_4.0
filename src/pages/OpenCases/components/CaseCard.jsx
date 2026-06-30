import "./CaseCard.css";

const CaseCard = ({ case: caseItem }) => {
  console.log(caseItem);
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
        <h5>Elapsed Time</h5>
      </div>
      <div className="section">
        <div className="split-section">
          <h5>Icon</h5>
          <div className="section">
            <h5>Status -</h5>
            <h5>{caseItem.status}</h5>
          </div>
        </div>
      </div>
      <div className="section">
        <h5>Equipment</h5>
      </div>
    </div>
  );
};

export default CaseCard;

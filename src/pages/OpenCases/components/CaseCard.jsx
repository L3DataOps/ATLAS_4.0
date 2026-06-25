const CaseCard = ({ case: caseItem }) => {
  console.log(caseItem.siteid);
  return (
    <div className="case-card">
      <div className="section">
        <h3>Ticket #</h3>
        <p>{caseItem.caseNumber}</p>
      </div>
      <div className="section">
        <h3>{caseItem.siteid.siteName}</h3>
        <p>Site Name</p>
      </div>
      <div className="section">
        <h3>Problem</h3>
      </div>
      <div className="section">
        <h3>Elapsed Time</h3>
      </div>
      <div className="section">
        <div className="split-section">
          <h3>Icon</h3>
          <div className="section">
            <h3>Status -</h3>
            <h3>Action Taken</h3>
          </div>
        </div>
      </div>
      <div className="section">
        <h3>Equipment</h3>
      </div>
    </div>
  );
};

export default CaseCard;

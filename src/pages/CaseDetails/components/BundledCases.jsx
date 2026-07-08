const BundledCases = () => {
  return (
    <div className="bundled-card">
      <div className="bundled-header">
        <h3>Bundled Cases</h3>

        <button className="add-case-btn">+ Add Case</button>
      </div>

      <div className="bundled-list">
        {caseItem.bundledCases?.length ? (
          caseItem.bundledCases.map((ticket) => (
            <div className="bundled-row" key={ticket._id}>
              <div>
                <h4>#{ticket.caseNumber}</h4>
                <p>{ticket.site.siteName}</p>
              </div>

              <div>
                <span>{ticket.category}</span>
              </div>

              <div>
                <span>{ticket.status}</span>
              </div>

              <button>Open</button>
            </div>
          ))
        ) : (
          <p>No bundled cases.</p>
        )}
      </div>
    </div>
  );
};

export default BundledCases;

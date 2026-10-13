import "./Tabs.css";

const Overview = ({ caseItem }) => {
  console.log("caseItem", caseItem);
  return (
    <div className="overview-tab">
      <div className="overview-section">
        <div className="across">
          <h3>Equipment Name</h3>
          <h3>
            {caseItem.customer.customerName}/{caseItem.site.siteName}/
            {caseItem.equipment?.equipmentName}
          </h3>
        </div>

        <div className="across">
          <h5>Equipment Number</h5>
          <h5>{caseItem.equipment?.equipmentID}</h5>
        </div>

        <div className="border"></div>

        <h3>Response Actions</h3>
        <p>
          {caseItem.equipment?.responseAction ||
            "No response actions available."}
        </p>
      </div>

      <div className="sub-section">
        <div className="border"></div>
        <div className="across">
          <h5>Alarm Matrix</h5>
          <h5>
            <a
              href={caseItem.customer.alarmMatrix}
              target="_blank"
              rel="noopener noreferrer"
            >
              {caseItem.customer.alarmMatrix}
            </a>
          </h5>
        </div>
      </div>
    </div>
  );
};

export default Overview;

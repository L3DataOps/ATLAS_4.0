import "./Tabs.css";

const API_URL = import.meta.env.VITE_API;

const Overview = ({ caseItem }) => {
  const matrixPath = caseItem.customer?.alarmMatrix;
  const fileName = matrixPath?.split(/[\\/]/).pop();
  const fileUrl = fileName
    ? `${API_URL}/alarm-matrices/${encodeURIComponent(fileName)}`
    : null;
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
          {fileUrl ? (
            <h5>
              <a href={`ms-excel:ofe|u|${fileUrl}`}>{fileName}</a>
              {" · "}
              <a href={fileUrl} download>
                Download
              </a>
            </h5>
          ) : (
            <h5>N/A</h5>
          )}
        </div>
      </div>
    </div>
  );
};

export default Overview;

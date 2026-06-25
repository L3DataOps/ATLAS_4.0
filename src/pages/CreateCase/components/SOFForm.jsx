import "./SOFForm.css";

const SOFForm = ({
  selectedSite,
  selectedEquipment,
  category,
  setCategory,
  severity,
  setSeverity,
  issueType,
  setIssueType,
}) => {
  return (
    <div className="sof-form-container">
      <form>
        <div className="form-row">
          <label>Site Name:</label>
          <input
            type="text"
            value={selectedSite ? selectedSite.siteName : ""}
            readOnly
          />
        </div>

        <div className="form-row">
          <label>Equipment:</label>
          <input
            type="text"
            value={selectedEquipment ? selectedEquipment.equipmentName : ""}
            readOnly
          />
        </div>

        <div className="form-row">
          <label>Category:</label>
          <select
            onChange={(e) => setCategory(e.target.value)}
            value={category}
          >
            <option value="" disabled>
              Select Category
            </option>
            <option>Critical</option>
            <option>Major</option>
            <option>Minor</option>
            <option>Network</option>
            <option>Facilities</option>
            <option>Civil</option>
            <option>Site Access</option>
          </select>
        </div>

        <div className="form-row">
          <label>Issue Type:</label>
          <select
            onChange={(e) => setIssueType(e.target.value)}
            value={issueType}
          >
            <option value="" disabled>
              Select Issue Type
            </option>
            <option>Alarm</option>
            <option>Personnel Reported</option>
            <option>PM Repair</option>
          </select>
        </div>

        <div className="form-row">
          <label>Dispatch Severity:</label>
          <select
            onChange={(e) => setSeverity(e.target.value)}
            value={severity}
          >
            <option value="" disabled>
              Select Dispatch Severity
            </option>
            <option>Regular Hours</option>
            <option>Immediate</option>
          </select>
        </div>
      </form>
    </div>
  );
};

export default SOFForm;

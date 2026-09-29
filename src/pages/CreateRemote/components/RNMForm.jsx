import "./SOFForm.css";

const RNMForm = ({
  selectedCustomer,
  selectedSite,
  selectedEquipment,
  category,
  setCategory,
}) => {
  return (
    <div className="sof-form-container">
      <form>
        <div className="form-row">
          <label>Customer Name:</label>
          <input
            type="text"
            value={selectedCustomer ? selectedCustomer.customerName : ""}
            readOnly
          />
        </div>
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
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
            }}
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
      </form>
    </div>
  );
};

export default RNMForm;

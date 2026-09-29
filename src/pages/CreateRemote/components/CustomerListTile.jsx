import "../components/CreateCaseComponents.css";

const CustomerListTile = ({ customer, selected, onSelect }) => {
  return (
    <div
      className={`site-card ${selected ? "selected" : ""}`}
      onClick={() => onSelect(customer)}
    >
      <h4>{customer.customerName}</h4>
    </div>
  );
};

export default CustomerListTile;

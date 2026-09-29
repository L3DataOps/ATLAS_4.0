import "../components/CreateCaseComponents.css";

const CustomerListTile = ({ customer, selected, onSelect }) => {
  return (
    <div
      className={`customer-card ${selected ? "selected" : ""}`}
      onClick={() => onSelect(customer)}
    >
      <h4>{customer.customerName}</h4>
      <h5>Screen - {customer.screenNumber}</h5>
    </div>
  );
};

export default CustomerListTile;

import { useState } from "react";
import CustomerListTile from "./CustomerListTile";
import "../components/CreateCaseComponents.css";

const CustomerList = ({ customers, selectedCustomer, onSelectCustomer }) => {
  const [search, setSearch] = useState("");

  console.log("CustomerList customers:", customers);

  const filteredCustomers = customers.filter((customer) => {
    const name = customer.name?.toLowerCase() || "";
    const query = search.toLowerCase();

    return name.includes(query);
  });

  return (
    <div className="customer-list-container">
      {/* SEARCH BAR */}
      <input
        type="text"
        placeholder="Search customers..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="site-search"
      />

      {/* LIST */}
      <ul>
        {filteredCustomers.map((customer) => (
          <CustomerListTile
            key={customer._id}
            customer={customer}
            selected={selectedCustomer?._id === customer._id}
            onSelect={onSelectCustomer}
          />
        ))}
      </ul>
    </div>
  );
};

export default CustomerList;

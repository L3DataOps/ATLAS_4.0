import { useState } from "react";
import EquipmentListTile from "./EquipmentListTile";
import "../components/CreateCaseComponents.css";
import backIcon from "../../../images/back-arrow.png";

const EquipmentList = ({
  equipment,
  selectedEquipment,
  onSelectEquipment,
  onBack,
}) => {
  const [search, setSearch] = useState("");

  const filteredEquipment = equipment.filter((item) => {
    const name = item.equipmentName?.toLowerCase() || "";
    const id = item.equipmentID?.toLowerCase() || "";
    const query = search.toLowerCase();

    return name.includes(query) || id.includes(query);
  });

  return (
    <div className="equipment-list-container">
      <div className="equipment-list-toolbar">
        <button onClick={onBack} className="site-back-button">
          <img src={backIcon} alt="Back" className="back-icon" />
        </button>
        <input
          type="text"
          placeholder="Search equipment..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="equipment-search"
        />
      </div>

      {!equipment || equipment.length === 0 ? (
        <div className="empty-state">
          <h3>No Equipment Found</h3>
          <p>No equipment is associated with this site.</p>
        </div>
      ) : (
        <div className="equipment-list">
          {filteredEquipment.map((item) => (
            <EquipmentListTile
              key={item._id}
              equipment={item}
              isSelected={item._id === selectedEquipment?._id}
              onClick={() => onSelectEquipment(item)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default EquipmentList;

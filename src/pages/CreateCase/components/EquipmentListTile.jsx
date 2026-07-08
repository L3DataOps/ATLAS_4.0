import "./CreateCaseComponents.css";

const EquipmentListTile = ({ equipment, isSelected, onClick }) => {
  return (
    <div
      className={`equipment-list-tile ${isSelected ? "selected" : ""}`}
      onClick={onClick}
    >
      <h3>{equipment.equipmentName}</h3>
      <p>{equipment.equipmentID}</p>
    </div>
  );
};

export default EquipmentListTile;

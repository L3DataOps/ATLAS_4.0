import "./CaseDetailComponents.css";

const TimeTile = ({ label, time }) => {
  return (
    <div className="time-tile">
      <p>{label}</p>
      <span>{time || "N/A"}</span>
    </div>
  );
};

export default TimeTile;

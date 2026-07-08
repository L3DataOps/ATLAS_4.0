import "./CaseDetailComponents.css";

const TimeTile = ({ label, time }) => {

  return (
    <div className="time-tile">
      <p>{label}</p>
      <span>{time}</span>
    </div>
  );
};

export default TimeTile;
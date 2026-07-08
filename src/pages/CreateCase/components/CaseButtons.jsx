import { useNavigate } from "react-router-dom";

const CaseButtons = ({ onCancel, onCreate }) => {
  const navigate = useNavigate();

  const handleCancel = () => {
    onCancel();
    navigate("/open-cases");
  };

  return (
    <div className="button-section">
      <button className="cancel" onClick={handleCancel}>
        Cancel
      </button>

      <button className="create" onClick={onCreate}>
        Create
      </button>
    </div>
  );
};

export default CaseButtons;

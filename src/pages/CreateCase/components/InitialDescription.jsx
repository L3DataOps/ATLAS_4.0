import "./InitialDescription.css";

const InitialDescription = ({ description, setDescription }) => {
  return (
    <div className="description">
      <h4>Initial Description</h4>

      <textarea
        className="initial-desc"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Enter the initial description..."
      />
    </div>
  );
};

export default InitialDescription;

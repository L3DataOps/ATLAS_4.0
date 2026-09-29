import "./OpenCasesComponents.css";

const SearchTile = ({ title, value, onChange }) => {
  return (
    <div className="search-tile">
      <label>{title}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Search ${title}`}
      />
    </div>
  );
};

export default SearchTile;

import "./SearchBar.css";

const SearchBar = ({ value, onChange }) => {
  return (
    <div className="search-bar-container">
      <input
        type="text"
        placeholder="Search cases (ticket, site, tags, equipment...)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;

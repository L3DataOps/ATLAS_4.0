import "./OpenCasesComponents.css";

const SearchTile = ({ title }) => {
  return (
    <div className="search-tile">
      <h2>{title}</h2>
      <input
        className="search-input"
        type="text"
        placeholder={`Search by ${title}`}
      />
    </div>
  );
};

export default SearchTile;

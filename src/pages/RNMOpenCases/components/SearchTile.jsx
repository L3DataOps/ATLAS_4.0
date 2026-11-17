import { useState, useRef, useEffect } from "react";
import "./OpenCasesComponents.css";

const SearchTile = ({ title, value, onChange, options }) => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const wrapRef = useRef(null);

  const isDropdown = Array.isArray(options);

  const filtered = isDropdown
    ? options.filter((o) =>
        o.toLowerCase().includes((value || "").toLowerCase()),
      )
    : [];

  // Close when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const select = (option) => {
    onChange(option);
    setOpen(false);
    setActive(-1);
  };

  const handleKeyDown = (e) => {
    if (!isDropdown) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && open && active >= 0) {
      e.preventDefault();
      select(filtered[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="search-tile" ref={wrapRef}>
      <label>{title}</label>

      <input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          if (isDropdown) {
            setOpen(true);
            setActive(-1);
          }
        }}
        onFocus={() => isDropdown && setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={`Search ${title}`}
        autoComplete="off"
      />

      {isDropdown && open && (
        <ul className="search-dropdown" role="listbox">
          {value && (
            <li className="search-dropdown-clear" onClick={() => select("")}>
              Clear filter
            </li>
          )}

          {filtered.length === 0 ? (
            <li className="search-dropdown-empty">No matches</li>
          ) : (
            filtered.map((option, i) => (
              <li
                key={option}
                role="option"
                aria-selected={option === value}
                className={`search-dropdown-item${
                  i === active ? " active" : ""
                }${option === value ? " selected" : ""}`}
                onClick={() => select(option)}
                onMouseEnter={() => setActive(i)}
              >
                {option}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

export default SearchTile;

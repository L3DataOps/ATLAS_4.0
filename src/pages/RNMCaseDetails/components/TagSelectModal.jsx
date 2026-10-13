import { useRef, useEffect } from "react";
import "./ActivityNotes.css";

const TagSelectModal = ({ tags, selectedTags, onToggleTag, onClose }) => {
  const popupRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div className="assign-tech-overlay">
      <div className="assign-tag-popup" ref={popupRef}>
        <div className="assign-tech-header">
          <h4>Select Tags</h4>

          <button onClick={onClose}>✕</button>
        </div>

        <div className="assign-tag-list">
          {tags.length ? (
            tags.map((tag) => {
              const tagName = tag.name;

              return (
                <label key={tagName} className="assign-tag-option">
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(tagName)}
                    disabled={
                      !selectedTags.includes(tagName) &&
                      selectedTags.length >= 5
                    }
                    onChange={() => onToggleTag(tagName)}
                  />

                  <span className="bold">{tagName}</span>
                </label>
              );
            })
          ) : (
            <p>No tags available.</p>
          )}
        </div>

        <div className="assign-tech-footer">
          <button onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
};

export default TagSelectModal;

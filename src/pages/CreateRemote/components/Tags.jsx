import "./Tags.css";

const Tags = ({ tags, selectedTags, setSelectedTags }) => {
  const handleTagClick = (tag) => {
    const isSelected = selectedTags.includes(tag);

    if (isSelected) {
      setSelectedTags(selectedTags.filter((selected) => selected !== tag));
      return;
    }

    if (selectedTags.length >= 5) {
      alert("Maximum of 5 tags allowed.");
      return;
    }

    setSelectedTags([...selectedTags, tag]);
  };

  return (
    <div className="rnm-tags-container">
      {tags.map((tag) => (
        <div
          key={tag}
          className={`tag ${selectedTags.includes(tag) ? "selected" : ""}`}
          onClick={() => handleTagClick(tag)}
        >
          {tag}
        </div>
      ))}
    </div>
  );
};

export default Tags;

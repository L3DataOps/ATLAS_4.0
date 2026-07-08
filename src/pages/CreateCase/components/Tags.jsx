import "./Tags.css";

const Tags = ({ tags, selectedTags, setSelectedTags }) => {
  const handleTagClick = (tag) => {
    const isSelected = selectedTags.some(
      (selected) => selected.name === tag.name,
    );

    if (isSelected) {
      setSelectedTags(
        selectedTags.filter((selected) => selected.name !== tag.name),
      );
      return;
    }

    if (selectedTags.length >= 5) {
      alert("Maximum of 5 tags allowed.");
      return;
    }

    setSelectedTags([...selectedTags, tag]);
  };

  return (
    <div className="tags-container">
      {tags.map((tag) => (
        <p
          key={tag.name}
          className={`tag ${
            selectedTags.some((selected) => selected.name === tag.name)
              ? "selected"
              : ""
          }`}
          onClick={() => handleTagClick(tag)}
        >
          {tag.name}
        </p>
      ))}
    </div>
  );
};

export default Tags;

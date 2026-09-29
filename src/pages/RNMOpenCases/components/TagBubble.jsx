import "./TagBubble.css";

const TagBubble = ({ tag }) => {
  return (
    <div className={`tag-bubble priority-${tag.priority}`}>{tag.name}</div>
  );
};

export default TagBubble;

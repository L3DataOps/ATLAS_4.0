import "./TagBubble.css";

const TagBubble = ({ tag }) => {
  return <div className={`tag-bubble priority-${tag.priority}`}>{tag}</div>;
};

export default TagBubble;

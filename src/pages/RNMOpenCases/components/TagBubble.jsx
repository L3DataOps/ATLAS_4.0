import "./TagBubble.css";

const TagBubble = ({ tag }) => {
  console.log("TagBubble rendered with tag:", tag); // Debugging line
  return <div className={`tag-bubble priority-${tag.priority}`}>{tag}</div>;
};

export default TagBubble;

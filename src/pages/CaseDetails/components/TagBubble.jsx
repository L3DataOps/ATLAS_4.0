import "./CaseDetailComponents.css"

const TagBubble = ({ tag }) => {
  return (
    <div className="tag-bubble">
      <p>{tag.name}</p>
    </div>
  );
};

export default TagBubble;
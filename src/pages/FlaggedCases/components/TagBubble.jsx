const TagBubble = ({ tag }) => {
  const name = typeof tag === "string" ? tag : tag?.name;

  return <div className="tag-bubble">{name}</div>;
};

export default TagBubble;

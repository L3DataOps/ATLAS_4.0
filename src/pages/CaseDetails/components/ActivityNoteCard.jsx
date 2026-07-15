import "./ActivityNotes.css";

const ActivityNoteCard = ({ note }) => {
  const formattedDate = new Date(note.createdAt).toLocaleString();

  return (
    <div className="activity-note-card">
      <div className="activity-note-header">
        <div className="activity-note-author">
          <h4>
            {note.createdBy?.firstname || ""} {note.createdBy?.lastname || ""}
          </h4>
        </div>

        <div className="activity-note-meta">
          <div className="activity-note-status">
            {note.tags?.length > 0 && (
              <div className="activity-note-tags">
                {note.tags.map((tag, index) => {
                  const label = typeof tag === "string" ? tag : tag?.name;
                  if (!label) return null;

                  const key =
                    typeof tag === "string"
                      ? `${tag}-${index}`
                      : tag?._id || `${tag.name}-${index}`;

                  return (
                    <span key={key} className="note-tag">
                      {label}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
          <span className="activity-note-date">
            <span className="activity-note-status">{note.status}</span>
            <strong>{formattedDate}</strong>
          </span>
        </div>
      </div>

      <div className="border"></div>

      <div className="activity-note-body">
        <p>{note.text}</p>
      </div>
    </div>
  );
};

export default ActivityNoteCard;

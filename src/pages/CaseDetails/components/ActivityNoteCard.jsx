import "./ActivityNotes.css";

const ActivityNoteCard = ({ note }) => {
  const formattedDate = new Date(note.createdAt).toLocaleString();

  return (
    <div className="activity-note-card">
      <div className="activity-note-header">
        <div>
          <h4>
            {note.createdBy?.firstname || ""} {note.createdBy?.lastname || ""}
          </h4>
        </div>

        <div className="activity-note-meta">
          <div className="activity-note-status">
            {note.activityNoteStatus && (
              <span
                className={`note-type ${note.activityNoteStatus.toLowerCase()}`}
              >
                {note.activityNoteStatus}
              </span>
            )}
            {note.tags?.length > 0 && (
              <div className="activity-note-tags">
                {note.tags.map((tag) => (
                  <span key={tag} className="note-tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          <span className="activity-note-date">
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

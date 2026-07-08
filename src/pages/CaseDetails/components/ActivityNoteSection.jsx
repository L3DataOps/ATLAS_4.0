import { useState } from "react";
import "./ActivityNotes.css";
import ActivityNoteNew from "./ActivityNoteNew";
import ActivityNoteCard from "./ActivityNoteCard";

const ActivityNoteSection = ({ caseItem }) => {
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [notes, setNotes] = useState(caseItem?.caseNotes || []);

  const handleSaveNote = (note) => {
    setNotes((prev) => [note, ...prev]);
    setIsAddingNote(false);
  };

  const handleCancel = () => {
    setIsAddingNote(false);
  };

  return (
    <div className="activity-note-section">
      <div className="across">
        <h2>Activity Notes</h2>

        <button
          className="add-note-button"
          onClick={() => setIsAddingNote(true)}
          disabled={isAddingNote}
        >
          Add Note
        </button>
      </div>

      <div className="border"></div>

      <div className="activity-notes-container">
        {isAddingNote && (
          <ActivityNoteNew
            onSave={handleSaveNote}
            onCancel={handleCancel}
            caseItem={caseItem}
          />
        )}

        {notes.map((note) => (
          <ActivityNoteCard key={note.id} note={note} />
        ))}
      </div>
    </div>
  );
};

export default ActivityNoteSection;

import { useEffect, useState } from "react";
import "./ActivityNotes.css";
import ActivityNoteNew from "./ActivityNoteNew";
import ActivityNoteCard from "./ActivityNoteCard";
import noteIcon from "../../../images/file (1).png";

const ActivityNoteSection = ({ caseItem, setCaseItem }) => {
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [notes, setNotes] = useState([]);

  const handleSaveNote = (updatedCase) => {
    setCaseItem((prev) => ({
      ...prev,
      ...updatedCase,
      site: updatedCase.site ?? prev.site,
      equipment: updatedCase.equipment ?? prev.equipment,
    }));
    setIsAddingNote(false);
  };

  // Shared by edit + delete: same shape of response (a full,
  // repopulated case), same sync-into-context logic.
  const handleNoteUpdated = (updatedCase) => {
    setCaseItem((prev) => ({
      ...prev,
      ...updatedCase,
      site: updatedCase.site ?? prev.site,
      equipment: updatedCase.equipment ?? prev.equipment,
    }));
  };

  const handleCancel = () => {
    setIsAddingNote(false);
  };

  useEffect(() => {
    setNotes(caseItem?.caseNotes || []);
  }, [caseItem]);

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
          <img src={noteIcon} alt="Add Note" className="note-icon" />
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

        {[...notes]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .map((note, index) => (
            <ActivityNoteCard
              key={note._id || note.id || index}
              note={note}
              caseId={caseItem._id}
              caseItem={caseItem}
              onUpdated={handleNoteUpdated}
            />
          ))}
      </div>
    </div>
  );
};

export default ActivityNoteSection;

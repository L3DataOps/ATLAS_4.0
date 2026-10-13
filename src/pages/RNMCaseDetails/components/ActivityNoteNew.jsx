import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import AssignTechModal from "./AssignTechModal";
import TagSelectModal from "./TagSelectModal";
import "./ActivityNotes.css";

const API_URL = import.meta.env.VITE_API;

const ActivityNoteNew = ({ onSave, onCancel, caseItem }) => {
  const { user, token } = useAuth();

  const [note, setNote] = useState("");
  const [status, setStatus] = useState(caseItem?.status || "Dispatched");
  const [activityNoteStatus, setActivityNoteStatus] = useState("");

  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  // Techs added THIS session that are not yet saved to the case.
  // Committed techs (already on caseItem.techsAssigned) are locked
  // and managed live inside AssignTechModal — they are never part
  // of this state and are never removable from here.
  const [pendingNewTechs, setPendingNewTechs] = useState([]);

  const [showTags, setShowTags] = useState(false);
  const [showAssignTech, setShowAssignTech] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  const actionTakenStatuses = [
    "Dispatched",
    "Tech Enroute",
    "In Progress",
    "Follow Up Required",
    "Assigned to TAC",
    "Awaiting Drive Time",
    "Not Done",
    "Quote Requested",
    "Quote Awaiting Approval",
    "Quote Approved",
    "Morning Dispatch",
    "Resolved",
  ];

  const activityNoteStatuses = ["Customer Facing", "Internal", "Resolved"];

  // ====================================
  // Load Tags
  // ====================================

  useEffect(() => {
    if (!caseItem?.equipment?.type) {
      setTags([]);
      return;
    }

    const fetchTags = async () => {
      try {
        const res = await fetch(`${API_URL}/tags`);

        if (!res.ok) {
          throw new Error("Failed to fetch tags");
        }

        const data = await res.json();

        const match = data.find(
          (t) =>
            t.type?.toLowerCase() === caseItem.equipment.type.toLowerCase(),
        );

        setTags(match?.tags || []);
      } catch (err) {
        console.error(err);
        setTags([]);
      }
    };

    fetchTags();
  }, [caseItem]);

  // ====================================
  // Tag Selection
  // ====================================

  const toggleTag = (tagName) => {
    setSelectedTags((prev) => {
      if (prev.includes(tagName)) {
        return prev.filter((t) => t !== tagName);
      }

      if (prev.length >= 5) {
        return prev;
      }

      return [...prev, tagName];
    });
  };

  // ====================================
  // Cancel — discard the note AND any not-yet-saved tech additions.
  // Already-committed techs live in the case itself and are
  // untouched by this.
  // ====================================

  const handleCancel = () => {
    setPendingNewTechs([]);
    onCancel();
  };

  // ====================================
  // Save Note (+ newly added techs, together)
  // ====================================

  const handleSave = async () => {
    if (!note.trim() || isSaving) return;

    if (selectedTags.length === 0) {
      alert("Please select at least one tag.");
      return;
    }

    if (!activityNoteStatus) {
      alert("Please select an activity note status.");
      return;
    }

    setIsSaving(true);

    const newNote = {
      text: note.trim(),
      status,
      activityNoteStatus,
      tags: selectedTags,
      createdBy: {
        firstname: user.firstname,
        lastname: user.lastname,
        userId: user.id,
      },
    };

    try {
      const response = await fetch(`${API_URL}/cases/${caseItem._id}/notes`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newNote),
      });

      if (!response.ok) {
        throw new Error("Failed to save note");
      }

      let updatedCase = await response.json();

      // Append any newly-picked techs to whatever is already
      // committed on the case. Existing (committed) techs and their
      // live-tracked status are never overwritten here.
      if (pendingNewTechs.length > 0) {
        const combinedTechs = [
          ...(updatedCase.techsAssigned || []),
          ...pendingNewTechs,
        ];

        const techResponse = await fetch(`${API_URL}/cases/${caseItem._id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ techsAssigned: combinedTechs }),
        });

        if (!techResponse.ok) {
          throw new Error("Failed to save assigned techs");
        }

        updatedCase = await techResponse.json();
      }

      onSave(updatedCase);

      setNote("");
      setSelectedTags([]);
      setActivityNoteStatus("");
      setPendingNewTechs([]);
      setShowTags(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const totalAssignedCount =
    (caseItem?.techsAssigned?.length || 0) + pendingNewTechs.length;

  return (
    <div className="activity-note-new">
      <div className="activity-note-new-header">
        <h3>
          {user.firstname} {user.lastname}
        </h3>

        <div className="activity-note-new-controls">
          {/* Action Taken */}
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {actionTakenStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          {/* Tags */}
          <button
            className="assign-tag-button"
            onClick={() => setShowTags(true)}
          >
            Tags
            {selectedTags.length ? ` (${selectedTags.length})` : ""}
          </button>

          {/* Activity Note Status */}
          <select
            value={activityNoteStatus}
            onChange={(e) => setActivityNoteStatus(e.target.value)}
          >
            <option value="" disabled>
              Select type...
            </option>

            {activityNoteStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          {/* Assign Techs */}
          <button
            className="assign-tech-button"
            onClick={() => setShowAssignTech(true)}
          >
            Techs{totalAssignedCount ? ` (${totalAssignedCount})` : ""}
            {pendingNewTechs.length > 0 ? " •" : ""}
          </button>
        </div>
      </div>

      <textarea
        className="activity-note-textarea"
        placeholder="Enter activity note..."
        rows={5}
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      {pendingNewTechs.length > 0 && (
        <p className="assign-tech-pending-hint">
          {pendingNewTechs.length} new tech
          {pendingNewTechs.length !== 1 ? "s" : ""} will be assigned when this
          note is saved.
        </p>
      )}

      <div className="activity-note-actions">
        <button
          className="save-note-button"
          onClick={handleSave}
          disabled={
            !note.trim() ||
            selectedTags.length === 0 ||
            !activityNoteStatus ||
            isSaving
          }
        >
          {isSaving ? "Saving..." : "Save"}
        </button>

        <button
          className="cancel-note-button"
          onClick={handleCancel}
          disabled={isSaving}
        >
          Cancel
        </button>
      </div>

      {/* Tag Modal */}
      {showTags && (
        <TagSelectModal
          tags={tags}
          selectedTags={selectedTags}
          onToggleTag={toggleTag}
          onClose={() => setShowTags(false)}
        />
      )}

      {/* Assign Tech Modal */}
      {showAssignTech && (
        <AssignTechModal
          pendingNewTechs={pendingNewTechs}
          onChangePendingNewTechs={setPendingNewTechs}
          onClose={() => setShowAssignTech(false)}
        />
      )}
    </div>
  );
};

export default ActivityNoteNew;

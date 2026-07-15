import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import "./ActivityNotes.css";

const API_URL = import.meta.env.VITE_API;

const ActivityNoteNew = ({ onSave, onCancel, caseItem }) => {
  const { user, token } = useAuth();

  const [note, setNote] = useState("");
  const [status, setStatus] = useState(caseItem?.status || "Dispatched");
  const [activityNoteStatus, setActivityNoteStatus] = useState("");
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [showTags, setShowTags] = useState(false);
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

  const toggleTag = (tagName) => {
    setSelectedTags((prev) => {
      if (prev.includes(tagName)) {
        return prev.filter((tag) => tag !== tagName);
      }

      if (prev.length >= 5) {
        return prev;
      }

      return [...prev, tagName];
    });
  };

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
        userId: user._id,
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

      // Backend returns the full updated case (not just the note)
      const updatedCase = await response.json();

      onSave(updatedCase);

      setNote("");
      setSelectedTags([]);
      setActivityNoteStatus("");
      setShowTags(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="activity-note-new">
      <div className="activity-note-new-header">
        <h3>
          {user.firstname} {user.lastname}
        </h3>

        <div className="activity-note-new-controls">
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {actionTakenStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <div className="tag-dropdown">
            <button
              className="tag-dropdown-button"
              onClick={() => setShowTags(!showTags)}
            >
              Tags {selectedTags.length > 0 ? `(${selectedTags.length}) ` : ""}▼
            </button>

            {showTags && (
              <div className="tag-dropdown-menu">
                {tags.length > 0 ? (
                  tags.map((tag) => {
                    const tagName = tag.name;

                    return (
                      <label key={tagName} className="tag-option">
                        <input
                          type="checkbox"
                          checked={selectedTags.includes(tagName)}
                          disabled={
                            !selectedTags.includes(tagName) &&
                            selectedTags.length >= 5
                          }
                          onChange={() => toggleTag(tagName)}
                        />

                        {tagName}
                      </label>
                    );
                  })
                ) : (
                  <p>No tags available</p>
                )}
              </div>
            )}
          </div>

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
        </div>
      </div>

      <textarea
        className="activity-note-textarea"
        placeholder="Enter activity note..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={5}
      />

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
          onClick={onCancel}
          disabled={isSaving}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ActivityNoteNew;

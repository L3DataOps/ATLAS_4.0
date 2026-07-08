import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import "./ActivityNotes.css";

const API_URL = import.meta.env.VITE_API;

const ActivityNoteNew = ({ onSave, onCancel, caseItem }) => {
  const { user } = useAuth();

  const [note, setNote] = useState("");
  const [status, setStatus] = useState(caseItem?.status || "Dispatched");
  const [activityNoteStatus, setActivityNoteStatus] = useState("");
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [showTags, setShowTags] = useState(false);

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
    if (!note.trim()) return;

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
        },
        body: JSON.stringify(newNote),
      });

      if (!response.ok) {
        throw new Error("Failed to save note");
      }

      const savedNote = await response.json();

      onSave(savedNote);

      setNote("");
      setSelectedTags([]);
      setActivityNoteStatus("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="activity-note-new">
      <div className="activity-note-new-header">
        <h3>
          {user.firstname} {user.lastname}
        </h3>

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
            Tags ▼
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
          {activityNoteStatuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
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
          disabled={!note.trim()}
        >
          Save
        </button>

        <button className="cancel-note-button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ActivityNoteNew;

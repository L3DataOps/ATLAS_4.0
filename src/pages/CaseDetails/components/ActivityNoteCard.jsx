import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import TagSelectModal from "./TagSelectModal";
import "./ActivityNotes.css";

const API_URL = import.meta.env.VITE_API;

const toDateTimeLocal = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
};

const ActivityNoteCard = ({ note, caseId, caseItem, onUpdated }) => {
  const { user, token } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(note.text || "");
  const [editTags, setEditTags] = useState(
    (note.tags || []).map((tag) => (typeof tag === "string" ? tag : tag?.name)),
  );
  const [editCreatedAt, setEditCreatedAt] = useState(
    toDateTimeLocal(note.createdAt),
  );
  const [isSaving, setIsSaving] = useState(false);

  const [showTagModal, setShowTagModal] = useState(false);
  const [availableTags, setAvailableTags] = useState([]);

  const formattedDate = new Date(note.createdAt).toLocaleString();
  const formattedEditedDate = note.editedAt
    ? new Date(note.editedAt).toLocaleString()
    : null;

  const isOwner = user?.id && note?.createdBy?.userId === user.id;

  // Load the same predefined tag set ActivityNoteNew uses, scoped
  // to this case's equipment type.
  useEffect(() => {
    if (!caseItem?.equipment?.type) {
      setAvailableTags([]);
      return;
    }

    const fetchTags = async () => {
      try {
        const res = await fetch(`${API_URL}/tags`);
        if (!res.ok) throw new Error("Failed to fetch tags");

        const data = await res.json();
        const match = data.find(
          (t) =>
            t.type?.toLowerCase() === caseItem.equipment.type.toLowerCase(),
        );

        setAvailableTags(match?.tags || []);
      } catch (err) {
        console.error(err);
        setAvailableTags([]);
      }
    };

    fetchTags();
  }, [caseItem]);

  const toggleEditTag = (tagName) => {
    setEditTags((prev) => {
      if (prev.includes(tagName)) {
        return prev.filter((t) => t !== tagName);
      }
      if (prev.length >= 5) {
        return prev;
      }
      return [...prev, tagName];
    });
  };

  const handleSaveEdit = async () => {
    if (!editText.trim() || isSaving) return;

    setIsSaving(true);
    try {
      const res = await fetch(`${API_URL}/cases/${caseId}/notes/${note._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          text: editText.trim(),
          tags: editTags,
          createdAt: editCreatedAt
            ? new Date(editCreatedAt).toISOString()
            : note.createdAt,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update note");
      }

      const updatedCase = await res.json();
      onUpdated(updatedCase);
      setIsEditing(false);
    } catch (err) {
      console.error("EDIT NOTE ERROR:", err);
      alert("Failed to save note edit.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditText(note.text || "");
    setEditTags(
      (note.tags || []).map((tag) =>
        typeof tag === "string" ? tag : tag?.name,
      ),
    );
    setEditCreatedAt(toDateTimeLocal(note.createdAt));
    setShowTagModal(false);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this note?",
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`${API_URL}/cases/${caseId}/notes/${note._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to delete note");
      }

      const updatedCase = await res.json();
      onUpdated(updatedCase);
    } catch (err) {
      console.error("DELETE NOTE ERROR:", err);
      alert("Failed to delete note.");
    }
  };

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
            {!isEditing && note.tags?.length > 0 && (
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
            {isEditing ? (
              <input
                type="datetime-local"
                className="activity-note-date-edit"
                value={editCreatedAt}
                onChange={(e) => setEditCreatedAt(e.target.value)}
              />
            ) : (
              <strong>{formattedDate}</strong>
            )}
            {formattedEditedDate && !isEditing && (
              <em className="activity-note-edited">
                {" "}
                (edited {formattedEditedDate})
              </em>
            )}
          </span>
        </div>
      </div>

      <div className="border"></div>

      <div className="activity-note-body">
        {isEditing ? (
          <div className="activity-note-edit">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={4}
            />

            <div className="activity-note-tag-editor">
              {editTags.length > 0 && (
                <div className="activity-note-tags">
                  {editTags.map((tag) => (
                    <span key={tag} className="note-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <button
                type="button"
                className="activity-note-edit-tags-btn"
                onClick={() => setShowTagModal(true)}
              >
                Edit Tags {editTags.length ? `(${editTags.length})` : ""}
              </button>
            </div>

            <div className="activity-note-edit-actions">
              <button onClick={handleSaveEdit} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save"}
              </button>
              <button onClick={handleCancelEdit} disabled={isSaving}>
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isSaving}
                className="activity-note-delete"
              >
                Delete
              </button>
            </div>
          </div>
        ) : (
          <p>{note.text}</p>
        )}
      </div>

      {isOwner && !isEditing && (
        <div className="activity-note-owner-actions">
          <button onClick={() => setIsEditing(true)}>Edit</button>
        </div>
      )}

      {showTagModal && (
        <TagSelectModal
          tags={availableTags}
          selectedTags={editTags}
          onToggleTag={toggleEditTag}
          onClose={() => setShowTagModal(false)}
        />
      )}
    </div>
  );
};

export default ActivityNoteCard;

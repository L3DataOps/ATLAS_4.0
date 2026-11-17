import { useEffect, useState } from "react";
import CasePdfExport from "./CasePdfExport";
import "./Tabs.css";

const Email = ({ caseItem, onSave }) => {
  const [emails, setEmails] = useState(caseItem?.distributionList || []);
  const [newEmail, setNewEmail] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setEmails(caseItem?.distributionList || []);
  }, [caseItem?.distributionList]);

  // ADD EMAIL
  const handleAddEmail = () => {
    const email = newEmail.trim().toLowerCase();
    if (!email) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (emails.some((item) => item.toLowerCase() === email)) {
      setError("This email is already in the distribution list.");
      return;
    }

    setEmails((prev) => [...prev, email]);
    setNewEmail("");
    setError("");
  };

  // REMOVE EMAIL
  const handleRemoveEmail = (emailToRemove) => {
    setEmails((prev) => prev.filter((email) => email !== emailToRemove));
    setError("");
  };

  // SAVE DISTRIBUTION LIST
  const handleSave = async () => {
    if (!onSave || saving) return;
    try {
      setSaving(true);
      setError("");
      await onSave(emails);
    } catch (err) {
      console.error("Distribution list save error:", err);
      setError("Failed to save distribution list.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="distribution-list-container">
      <div className="distribution-list-header">
        <div>
          <h3>Distribution List</h3>
          <span>{emails.length} email addresses</span>
        </div>

        <CasePdfExport caseItem={caseItem} />
      </div>

      {/* ADD EMAIL */}
      <div className="distribution-list-input">
        <input
          type="email"
          placeholder="Enter email address..."
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddEmail();
            }
          }}
        />
        <button type="button" onClick={handleAddEmail}>
          <span>+</span> Add
        </button>
      </div>

      {error && <p className="distribution-list-error">{error}</p>}

      {/* EMAIL LIST */}
      <div className="distribution-list-emails">
        {emails.length > 0 ? (
          emails.map((email) => (
            <div className="distribution-email" key={email}>
              <div className="distribution-email-info">
                <span className="distribution-email-icon">✉</span>
                <span>{email}</span>
              </div>
              <button
                type="button"
                className="distribution-email-remove"
                onClick={() => handleRemoveEmail(email)}
                title="Remove email"
              >
                ×
              </button>
            </div>
          ))
        ) : (
          <p className="distribution-list-empty">No email addresses added.</p>
        )}
      </div>

      {/* FOOTER */}
      <div className="distribution-list-footer">
        <button
          type="button"
          className="distribution-save-button"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Distribution List"}
        </button>
      </div>
    </div>
  );
};

export default Email;

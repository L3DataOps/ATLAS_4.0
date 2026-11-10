import { useEffect, useState } from "react";
import html2pdf from "html2pdf.js";
import "./Tabs.css";

// Escape user data so it can't inject HTML into the report
const esc = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// All selectors are scoped to .pdf-report so they work in the iframe AND in the PDF render
const PDF_CSS = `
  .pdf-report, .pdf-report * { box-sizing: border-box; }
  .pdf-report {
    font-family: Arial, Helvetica, sans-serif;
    color: #1f2937;
    padding: 32px;
    font-size: 13px;
    line-height: 1.5;
    background: #fff;
  }
  .pdf-report .report-header {
    border-bottom: 3px solid #2563eb;
    padding-bottom: 12px;
    margin-bottom: 24px;
  }
  .pdf-report .report-header h1 { margin: 0; font-size: 24px; color: #111827; }
  .pdf-report .report-header p { margin: 4px 0 0; color: #6b7280; }
  .pdf-report .section { margin-bottom: 24px; }
  .pdf-report .section h2 {
    font-size: 15px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #2563eb;
    margin: 0 0 8px;
  }
  .pdf-report table { width: 100%; border-collapse: collapse; }
  .pdf-report th, .pdf-report td {
    text-align: left;
    padding: 8px 10px;
    border: 1px solid #e5e7eb;
  }
  .pdf-report th { background: #f3f4f6; width: 30%; }
  .pdf-report ul { margin: 0; padding-left: 18px; }
  .pdf-report li { padding: 2px 0; }
  .pdf-report .footer {
    margin-top: 32px;
    font-size: 11px;
    color: #9ca3af;
    text-align: center;
  }
  .report-header{
  display: flex;
  justify-content: space-between;
}

  .note{
    margin-bottom: 10px;
    border: 3px solid #3f3f3f;
    padding: 10px;
    border-radius: 4px;
  }

  .note-meta{
    display: flex;
    justify-content: space-between;
    font-size: 15px;}

  .note-tag{
  background-color: #e5e7eb;
  color: #111111;
  padding:6px;
  margin-top: 3px;
  border:1px solid black;
  border-radius: 15px;
  }
`;

// Formats a date/time value, with a fallback for missing or invalid dates
const formatDateTime = (value, fallback = "N/A") => {
  if (!value) return fallback;

  const date = new Date(value);
  if (isNaN(date.getTime())) return fallback;

  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const buildNotesHtml = (notes) => {
  const list = Array.isArray(notes) ? notes : [];

  if (!list.length) {
    return `
      <div class="section">
        <h2>Activity Notes (0)</h2>
        <p>No notes added.</p>
      </div>`;
  }

  // Oldest first. Swap a and b to show newest first.
  const sorted = [...list].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
  );

  return `
    <div class="section">
      <h2>Activity Notes (${sorted.length})</h2>
      ${sorted
        .map(
          (note) => `
        <div class="note">
          <div class="note-meta">
            <span><strong>${esc(note.createdBy?.name || "Unknown")} - ${note.status ? `<span class="note-badge status">${esc(note.status)}</span>` : ""}</strong></span>
            <span >
              ${esc(formatDateTime(note.createdAt))}
              ${note.editedAt ? ` (edited ${esc(formatDateTime(note.editedAt))})` : ""}
            </span>
          </div>

          

          <div class="note-text">${esc(note.text)}</div>

          <div>
          <p>  </p>
          </div>
          <div class="note-footer">
            ${(note.tags || []).map((tag) => `<span class="note-tag">${esc(tag)}</span>`).join("")}
          </div>
        </div>`,
        )
        .join("")}
    </div>`;
};

const buildReportBody = (caseItem, emails) =>
  `
  <div class="pdf-report">
    <div class="report-header">
      <h1>Case: ${esc(caseItem?.caseNumber)} - ${esc(caseItem?.caseIsOpened ? "Open" : "Closed")}</h1>
      <p>${esc(formatDateTime(new Date()))}</p>
    </div>

    <div class="section">
      <h2>${esc(caseItem?.equipment?.equipmentName)} - (${esc(caseItem?.site?.region)})</h2>
      <table>
        <tr><th>Initial Problem:</th><td>${esc(caseItem?.description)}</td></tr>
        <tr><th>Tags:</th><td>${esc(caseItem?.tags?.map((t) => t.name).join(", ") || "None")}</td></tr>
        <tr><th>Status</th><td>${esc(caseItem?.status)}</td></tr>
        <tr><th>Created</th><td>${esc(formatDateTime(caseItem?.createdAt))}</td></tr>
        <tr><th>Closed</th><td>${esc(formatDateTime(caseItem?.closedAt))}</td></tr>
        <tr><th>Created By</th><td>${esc(caseItem?.createdBy)}</td></tr>
        <tr><th>Category</th><td>${esc(caseItem?.category)}</td></tr>
      </table>
    </div>

    ${buildNotesHtml(caseItem?.caseNotes)}

    <div class="footer">ATLAS - L3Harris</div>
  </div>
`;

// Full document for the preview iframe
const buildPreviewHtml = (caseItem, emails) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <style>body { margin: 0; } ${PDF_CSS}</style>
  </head>
  <body>${buildReportBody(caseItem, emails)}</body>
</html>
`;

const Email = ({ caseItem, onSave }) => {
  const [emails, setEmails] = useState(caseItem?.distributionList || []);
  const [newEmail, setNewEmail] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // PDF modal state
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    setEmails(caseItem?.distributionList || []);
  }, [caseItem?.distributionList]);

  // Close modal with Escape key
  useEffect(() => {
    if (!showPdfModal) return;
    const onKey = (e) => e.key === "Escape" && setShowPdfModal(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showPdfModal]);

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

  // DOWNLOAD PDF (style + markup travel together in a detached element)
  const handleDownloadPdf = async () => {
    if (downloading) return;

    const container = document.createElement("div");
    container.innerHTML = `<style>${PDF_CSS}</style>${buildReportBody(caseItem, emails)}`;

    try {
      setDownloading(true);
      await html2pdf()
        .set({
          margin: 10,
          filename: `case-${caseItem?.id || "report"}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: {
            mode: ["css", "legacy"],
            avoid: ["tr", "li", ".section h2"],
          },
        })
        .from(container)
        .save();
    } catch (err) {
      console.error("PDF download error:", err);
      setError("Failed to generate PDF.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="distribution-list-container">
      <div className="distribution-list-header">
        <div>
          <h3>Distribution List</h3>
          <span>{emails.length} email addresses</span>
        </div>

        <button
          type="button"
          className="pdf-export-button"
          onClick={() => setShowPdfModal(true)}
        >
          Export PDF
        </button>
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

      {/* PDF PREVIEW MODAL */}
      {showPdfModal && (
        <div
          className="pdf-modal-overlay"
          onClick={() => setShowPdfModal(false)}
        >
          <div className="pdf-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pdf-modal-header">
              <h3>PDF Preview</h3>
              <button
                type="button"
                className="pdf-modal-close"
                onClick={() => setShowPdfModal(false)}
                title="Close"
              >
                ×
              </button>
            </div>

            <iframe
              className="pdf-modal-frame"
              title="Case PDF preview"
              srcDoc={buildPreviewHtml(caseItem, emails)}
            />

            <div className="pdf-modal-footer">
              <button
                type="button"
                className="pdf-cancel-button"
                onClick={() => setShowPdfModal(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="pdf-download-button"
                onClick={handleDownloadPdf}
                disabled={downloading}
              >
                {downloading ? "Generating..." : "Download PDF"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Email;

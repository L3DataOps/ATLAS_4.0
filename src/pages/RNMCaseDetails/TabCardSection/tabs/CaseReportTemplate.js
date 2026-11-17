// Escape user data so it can't inject HTML into the report
export const esc = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// Formats a date/time value, with a fallback for missing or invalid dates
export const formatDateTime = (value, fallback = "N/A") => {
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

// Every selector is scoped to .pdf-report so it works in the iframe AND in the PDF render
export const PDF_CSS = `
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
            <span><strong>${esc(note.createdBy?.name || "Unknown")}${note.status ? ` - ${esc(note.status)}` : ""}</strong></span>
            <span>
              ${esc(formatDateTime(note.createdAt))}
              ${note.editedAt ? ` (edited ${esc(formatDateTime(note.editedAt))})` : ""}
            </span>
          </div>

          <div class="note-text">${esc(note.text)}</div>

          <div class="note-footer">
            ${(note.tags || []).map((tag) => `<span class="note-tag">${esc(tag)}</span>`).join("")}
          </div>
        </div>`,
        )
        .join("")}
    </div>`;
};

export const buildReportBody = (caseItem) => `
  <div class="pdf-report">
    <div class="report-header">
      <h1>RNM Case: ${esc(caseItem?.caseNumber)} - ${esc(caseItem?.caseIsOpened ? "Open" : "Closed")}</h1>
      <p>${esc(formatDateTime(new Date()))}</p>
    </div>

    <div class="section">
      <h2>${esc(caseItem?.customer?.customerName)} - ${esc(caseItem?.site?.siteNumber)} - ${esc(caseItem?.site?.siteName)} - ${esc(caseItem?.equipment?.equipmentName)} </h2>
      <table>
        <tr><th>Initial Problem:</th><td>${esc(caseItem?.description)}</td></tr>
        <tr><th>Tags:</th><td>${esc(caseItem?.tags?.map((t) => t).join(", ") || "None")}</td></tr>
        <tr><th>Status</th><td>${esc(caseItem?.status)}</td></tr>
        <tr><th>Created</th><td>${esc(formatDateTime(caseItem?.createdAt))}</td></tr>
        <tr><th>Closed</th><td>${esc(formatDateTime(caseItem?.completedAt || caseItem?.closedAt))}</td></tr>
        <tr><th>Created By</th><td>${esc(caseItem?.createdBy)}</td></tr>
        <tr><th>Category</th><td>${esc(caseItem?.category)}</td></tr>
      </table>
    </div>

    ${buildNotesHtml(caseItem?.caseNotes)}

    <div class="footer">ATLAS - L3Harris</div>
  </div>
`;

// Full document for the preview iframe
export const buildPreviewHtml = (caseItem) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <style>body { margin: 0; } ${PDF_CSS}</style>
  </head>
  <body>${buildReportBody(caseItem)}</body>
</html>
`;
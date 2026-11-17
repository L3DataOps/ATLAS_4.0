import { useEffect, useMemo, useState } from "react";
import html2pdf from "html2pdf.js";
import {
  PDF_CSS,
  buildReportBody,
  buildPreviewHtml,
} from "./CaseReportTemplate";
import "./CasePDFExport.css";

const CasePdfExport = ({ caseItem, buttonLabel = "Export PDF" }) => {
  const [open, setOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  const close = () => {
    setOpen(false);
    setError("");
  };

  // Close with Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Only rebuild the preview when the case changes or the modal opens
  const previewHtml = useMemo(
    () => (open ? buildPreviewHtml(caseItem) : ""),
    [open, caseItem],
  );

  const handleDownload = async () => {
    if (downloading) return;

    // Detached element: style + markup travel together
    const container = document.createElement("div");
    container.innerHTML = `<style>${PDF_CSS}</style>${buildReportBody(caseItem)}`;

    try {
      setDownloading(true);
      setError("");

      await html2pdf()
        .set({
          margin: 10,
          filename: `case-${caseItem?.caseNumber || caseItem?._id || "report"}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: {
            mode: ["css", "legacy"],
            avoid: ["tr", "li", ".section h2", ".note"],
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
    <>
      <button
        type="button"
        className="pdf-export-button"
        onClick={() => setOpen(true)}
      >
        {buttonLabel}
      </button>

      {open && (
        <div className="pdf-modal-overlay" onClick={close}>
          <div className="pdf-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pdf-modal-header">
              <h3>PDF Preview</h3>
              <button
                type="button"
                className="pdf-modal-close"
                onClick={close}
                title="Close"
              >
                ×
              </button>
            </div>

            <iframe
              className="pdf-modal-frame"
              title="Case PDF preview"
              srcDoc={previewHtml}
            />

            <div className="pdf-modal-footer">
              {error && <span className="pdf-modal-error">{error}</span>}

              <button
                type="button"
                className="pdf-cancel-button"
                onClick={close}
              >
                Close
              </button>
              <button
                type="button"
                className="pdf-download-button"
                onClick={handleDownload}
                disabled={downloading}
              >
                {downloading ? "Generating..." : "Download PDF"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CasePdfExport;

import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useCase } from "../../../context/CaseContext";
import "./temp.css";

const API_URL = import.meta.env.VITE_API;
const RNM_CASE_URL = `${API_URL}/rnm/case`;

const RNMCloseCaseButton = () => {
  const { token } = useAuth();
  const { caseItem, setCaseItem } = useCase();

  const [closing, setClosing] = useState(false);

  if (!caseItem) {
    return null;
  }

  // -----------------------------------------------------
  // Checklist requirements
  // -----------------------------------------------------

  // 1) At least one note with both statuses set to "Resolved"
  const caseNotes = caseItem.caseNotes || [];
  const hasResolvedNote = caseNotes.some(
    (note) =>
      note.activityNoteStatus === "Resolved" && note.status === "Resolved",
  );

  // 2) Every assigned tech is offsite (no techs counts as fulfilled)
  const techsAssigned = caseItem.techsAssigned || [];
  const allTechsOffsite =
    techsAssigned.length === 0 ||
    techsAssigned.every((tech) => tech.currentStatus === "Offsite");

  const checklistFulfilled = hasResolvedNote && allTechsOffsite;

  const isClosed =
    caseItem.caseIsOpened === false || caseItem.status === "Closed";

  // -----------------------------------------------------
  // Close the case
  // -----------------------------------------------------
  const handleCloseCase = async () => {
    if (!caseItem?._id) {
      console.error("No case ID found.");
      return;
    }

    if (!checklistFulfilled) {
      alert("All checklist requirements must be met before closing this case.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to close this case?",
    );
    if (!confirmed) return;

    try {
      setClosing(true);

      const response = await fetch(`${RNM_CASE_URL}/${caseItem._id}/close`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to close case.");
      }

      setCaseItem(await response.json());
    } catch (error) {
      console.error("Error closing RNM case:", error);
      alert(error.message || "Failed to close case.");
    } finally {
      setClosing(false);
    }
  };

  return (
    <div className="close-case-button">
      <button
        className="close-case-button-btn"
        onClick={handleCloseCase}
        disabled={closing || isClosed || !checklistFulfilled}
        title={
          !checklistFulfilled
            ? "All Closeout Checklist items must be met before closing"
            : undefined
        }
      >
        {closing ? "Closing..." : isClosed ? "Case Closed" : "Close Case"}
      </button>

      {!checklistFulfilled && !isClosed && (
        <p className="close-case-hint">
          All Closeout Checklist items must be met before closing
        </p>
      )}
    </div>
  );
};

export default RNMCloseCaseButton;

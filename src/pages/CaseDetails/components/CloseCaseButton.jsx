import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useCase } from "../../../context/CaseContext";
import "./temp.css";

const API_URL = import.meta.env.VITE_API;

const CloseCaseButton = () => {
  const { token, user } = useAuth();
  const { caseItem, setCaseItem } = useCase();

  const [closing, setClosing] = useState(false);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [reasons, setReasons] = useState({});
  const [submittingReasons, setSubmittingReasons] = useState(false);

  if (!caseItem) {
    return null;
  }

  // -----------------------------------------------------
  // Checklist requirements (mirrors Checklist.jsx logic)
  // -----------------------------------------------------
  const caseNotes = caseItem.caseNotes || [];
  const hasResolvedNote = caseNotes.some(
    (note) =>
      note.activityNoteStatus === "Resolved" && note.status === "Resolved",
  );

  const techsAssigned = caseItem.techsAssigned || [];
  const allTechsOffsite =
    techsAssigned.length === 0 ||
    techsAssigned.every((tech) => tech.currentStatus === "Offsite");

  const dispatchCenters = caseItem.dispatchCenterNotified || [];
  const allDispatchNotNotified =
    dispatchCenters.length === 0 ||
    dispatchCenters.every((dc) => dc.hasBeenNotified === false);

  const checklistFulfilled =
    hasResolvedNote && allTechsOffsite && allDispatchNotNotified;

  const closingQuestions = caseItem.closingQuestions || [];
  const failedQuestions = closingQuestions.filter((q) => q.response === false);

  // -----------------------------------------------------
  // Kick off the close flow
  // -----------------------------------------------------
  const handleCloseCase = () => {
    if (!caseItem?._id) {
      console.error("No case ID found.");
      return;
    }

    if (!checklistFulfilled) {
      alert("All checklist requirements must be met before closing this case.");
      return;
    }

    if (failedQuestions.length > 0) {
      // Need a reason for each failed closing question first
      const initialReasons = {};
      failedQuestions.forEach((q) => {
        initialReasons[q.question] = "";
      });
      setReasons(initialReasons);
      setShowReasonModal(true);
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to close this case?",
    );
    if (!confirmed) return;

    closeCase();
  };

  // -----------------------------------------------------
  // Submit reasons for failed closing questions, add a
  // system note, then proceed to close the case
  // -----------------------------------------------------
  const handleSubmitReasons = async () => {
    const missing = failedQuestions.filter((q) => !reasons[q.question]?.trim());
    if (missing.length > 0) {
      alert("Please provide a reason for every unmet closing question.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to close this case?",
    );
    if (!confirmed) return;

    setSubmittingReasons(true);

    try {
      // 1) Update closingQuestions with the provided reasons
      const updatedClosingQuestions = closingQuestions.map((q) =>
        q.response === false ? { ...q, reason: reasons[q.question] } : q,
      );

      const patchRes = await fetch(`${API_URL}/cases/${caseItem._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ closingQuestions: updatedClosingQuestions }),
      });

      if (!patchRes.ok) {
        const errorData = await patchRes.json().catch(() => ({}));
        throw new Error(
          errorData.error || "Failed to save closing question reasons.",
        );
      }

      const caseAfterReasons = await patchRes.json();
      setCaseItem(caseAfterReasons);

      // 2) Add a system note summarizing the unmet items and their reasons
      const noteText = failedQuestions
        .map((q) => `"${q.question}" — ${reasons[q.question]}`)
        .join("; ");

      const noteRes = await fetch(`${API_URL}/cases/${caseItem._id}/notes`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          text: `Case closed with unmet closing questions: ${noteText}`,
          status: caseItem.status,
          activityNoteStatus: "System",
          tags: [],
          createdBy: user
            ? { firstname: user.firstname, lastname: user.lastname }
            : "System",
        }),
      });

      if (!noteRes.ok) {
        const errorData = await noteRes.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to add system note.");
      }

      const caseAfterNote = await noteRes.json();
      setCaseItem(caseAfterNote);

      setShowReasonModal(false);

      // 3) Proceed to actually close the case
      await closeCase();
    } catch (error) {
      console.error("Error saving closing question reasons:", error);
      alert(error.message || "Failed to save reasons.");
    } finally {
      setSubmittingReasons(false);
    }
  };

  // -----------------------------------------------------
  // Actually close the case
  // -----------------------------------------------------
  const closeCase = async () => {
    try {
      setClosing(true);

      const response = await fetch(`${API_URL}/cases/${caseItem._id}/close`, {
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

      const updatedCase = await response.json();
      setCaseItem(updatedCase);
    } catch (error) {
      console.error("Error closing case:", error);
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
        disabled={
          closing || caseItem?.status === "Closed" || !checklistFulfilled
        }
        title={
          !checklistFulfilled
            ? "All Closeout Checklist items must be met before closing"
            : undefined
        }
      >
        {closing
          ? "Closing..."
          : caseItem?.status === "Closed"
            ? "Case Closed"
            : "Close Case"}
      </button>

      {!checklistFulfilled && caseItem?.status !== "Closed" && (
        <p className="close-case-hint">
          All Closeout Checklist items must be met before closing
        </p>
      )}

      {showReasonModal && (
        <div className="reason-modal-overlay">
          <div className="reason-modal">
            <h4>Explain Unfulfilled Closing Questions</h4>
            <p className="reason-modal-subtitle">
              The following closing questions were marked "No." Please provide a
              reason for each before closing.
            </p>

            {failedQuestions.map((q) => (
              <div key={q.question} className="reason-field">
                <label>{q.question}</label>
                <textarea
                  value={reasons[q.question] || ""}
                  onChange={(e) =>
                    setReasons((prev) => ({
                      ...prev,
                      [q.question]: e.target.value,
                    }))
                  }
                  placeholder="Explain why this was not met..."
                  rows={3}
                />
              </div>
            ))}

            <div className="reason-modal-actions">
              <button
                onClick={() => setShowReasonModal(false)}
                disabled={submittingReasons}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReasons}
                disabled={submittingReasons}
                className="reason-modal-submit"
              >
                {submittingReasons ? "Saving..." : "Submit & Close Case"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CloseCaseButton;

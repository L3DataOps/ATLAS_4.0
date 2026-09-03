import { useCase } from "../../../context/CaseContext";
import resolvedIcon from "../../../images/accept.png";
import notDoneIcon from "../../../images/close.png";
import "./temp.css";
import ClosingQuestion from "./ClosingQuestion";
import Fuel from "./Fuel";
import CloseCaseButton from "./CloseCaseButton";

const Checklist = () => {
  const { caseItem } = useCase();

  if (!caseItem) {
    return <div className="checklist checklist-empty">No case loaded</div>;
  }

  // -----------------------------------------------------
  // 1) At least one case note must be fully resolved:
  //    both activityNoteStatus AND status === "Resolved"
  // -----------------------------------------------------
  const caseNotes = caseItem.caseNotes || [];
  const hasResolvedNote = caseNotes.some(
    (note) =>
      note.activityNoteStatus === "Resolved" && note.status === "Resolved",
  );

  // -----------------------------------------------------
  // 2) Every assigned tech must have currentStatus === "Offsite"
  // -----------------------------------------------------
  const techsAssigned = caseItem.techsAssigned || [];
  const allTechsOffsite =
    techsAssigned.length === 0 ||
    techsAssigned.every((tech) => tech.currentStatus === "Offsite");

  // -----------------------------------------------------
  // 3) Every dispatch center must have hasBeenNotified === false
  // -----------------------------------------------------
  const dispatchCenters = caseItem.dispatchCenterNotified || [];
  const allDispatchNotNotified =
    dispatchCenters.length > 0 &&
    dispatchCenters.every((dc) => dc.hasBeenNotified === false);

  // Overall: every requirement fulfilled
  const allFulfilled =
    hasResolvedNote && allTechsOffsite && allDispatchNotNotified;

  return (
    <div className="checklist">
      <div className="checklist-section">
        <h4 className="checklist-title">Closeout Checklist</h4>

        <ChecklistItem label="All requirements met" fulfilled={allFulfilled} />

        <ChecklistItem
          label="Case has a resolved note"
          fulfilled={hasResolvedNote}
        />

        <ChecklistItem
          label="All assigned techs are offsite"
          fulfilled={allTechsOffsite}
        />

        <ChecklistItem
          label="No dispatch centers have been notified"
          fulfilled={allDispatchNotNotified}
        />
      </div>

      <ClosingQuestion />
      <div className="fuel-section">
        <Fuel />
        <CloseCaseButton />
      </div>
    </div>
  );
};

// -----------------------------------------------------
// Single row: label + pass/fail icon, no sub-breakdown.
// -----------------------------------------------------
const ChecklistItem = ({ label, fulfilled }) => {
  return (
    <div
      className={`checklist-item ${fulfilled ? "fulfilled" : "unfulfilled"}`}
    >
      <span className="checklist-label">{label}</span>
      <img
        src={fulfilled ? resolvedIcon : notDoneIcon}
        alt={fulfilled ? "Requirement met" : "Requirement not met"}
        className="checklist-icon"
      />
    </div>
  );
};

export default Checklist;

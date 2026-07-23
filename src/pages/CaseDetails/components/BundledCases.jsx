import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useCase } from "../../../context/CaseContext";
import AddBundledCaseModal from "./AddBundledCaseModal";
import "./CaseDetailComponents.css";

const API_URL = import.meta.env.VITE_API;

const BundledCases = () => {
  const [showModal, setShowModal] = useState(false);
  const { token } = useAuth();
  const { caseItem, setCaseItem } = useCase();

  const handleRemove = async (bundledCaseId) => {
    const confirmed = window.confirm("Remove this case from the bundle?");
    if (!confirmed) return;

    try {
      const res = await fetch(`${API_URL}/cases/${caseItem._id}/unbundle`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bundledCaseId }),
      });

      if (!res.ok) {
        throw new Error("Failed to remove bundled case");
      }

      const updatedCase = await res.json();
      setCaseItem(updatedCase);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className="bundled-card">
        <div className="bundled-header">
          <h3>Bundled Cases</h3>

          <button className="add-case-btn" onClick={() => setShowModal(true)}>
            + Add Case
          </button>
        </div>

        <div className="bundled-list">
          {caseItem.bundledCases?.length ? (
            caseItem.bundledCases.map((ticket) => (
              <div className="bundled-row" key={ticket._id}>
                <div className="bundled-main">
                  <h4>#{ticket.caseNumber}</h4>

                  <p>{ticket.siteName || "No Site"}</p>
                </div>

                <div className="bundled-category">{ticket.category}</div>

                <div className="bundled-status">{ticket.status}</div>

                <button>Open</button>

                <button
                  className="remove-case-btn"
                  onClick={() => handleRemove(ticket._id)}
                >
                  Remove
                </button>
              </div>
            ))
          ) : (
            <p>No bundled cases.</p>
          )}
        </div>
      </div>

      {showModal && (
        <AddBundledCaseModal
          caseItem={caseItem}
          onClose={() => setShowModal(false)}
          onUpdated={(updatedCase) => {
            setCaseItem(updatedCase);

            setShowModal(false);
          }}
        />
      )}
    </>
  );
};

export default BundledCases;

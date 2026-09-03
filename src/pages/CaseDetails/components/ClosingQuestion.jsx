import { useState } from "react";
import { useCase } from "../../../context/CaseContext";
import "./temp.css";

const ClosingQuestion = () => {
  const { caseItem, setCaseItem } = useCase();
  const [savingIndex, setSavingIndex] = useState(null);

  if (!caseItem) {
    return (
      <div className="closing-questions closing-questions-empty">
        No case loaded
      </div>
    );
  }

  const closingQuestions = caseItem.closingQuestions || [];

  const handleToggle = async (index) => {
    const updatedQuestions = closingQuestions.map((q, i) =>
      i === index ? { ...q, response: !q.response } : q,
    );

    setCaseItem({ ...caseItem, closingQuestions: updatedQuestions });
    setSavingIndex(index);

    try {
      const token = localStorage.getItem("token"); // must match whatever key your login flow uses

      const res = await fetch(`/api/cases/${caseItem._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ closingQuestions: updatedQuestions }),
      });

      if (!res.ok) {
        throw new Error(`Failed to update closing question (${res.status})`);
      }

      const updatedCase = await res.json();
      setCaseItem(updatedCase);
    } catch (err) {
      console.error("CLOSING QUESTION UPDATE ERROR:", err);
      setCaseItem({ ...caseItem, closingQuestions });
    } finally {
      setSavingIndex(null);
    }
  };

  if (closingQuestions.length === 0) {
    return (
      <div className="closing-questions closing-questions-empty">
        No closing questions for this case
      </div>
    );
  }

  return (
    <div className="closing-questions">
      <h4 className="closing-questions-title">Closing Questions</h4>

      {closingQuestions.map((q, index) => (
        <div key={index} className="closing-question-row">
          <span className="closing-question-text">{q.question}</span>

          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={!!q.response}
              disabled={savingIndex === index}
              onChange={() => handleToggle(index)}
            />
            <span className="toggle-slider" />
          </label>
        </div>
      ))}
    </div>
  );
};

export default ClosingQuestion;

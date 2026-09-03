import { useCase } from "../../../context/CaseContext";
import "./subcss.css";

const DQC = () => {
  const { caseItem } = useCase();

  const questions = caseItem?.questionnaire || {};

  return (
    <div className="dqc">
      <div className="dqc-header">
        <h2>Initial Questions</h2>
      </div>

      <div className="dqc-content">
        {Object.entries(questions).length === 0 ? (
          <p className="dqc-empty">No initial questions recorded.</p>
        ) : (
          Object.entries(questions).map(([question, answer]) => (
            <div className="dqc-question" key={question}>
              <div className="dqc-question-text">{question}</div>

              <div
                className={`dqc-answer ${
                  answer.toLowerCase() === "yes"
                    ? "dqc-answer-yes"
                    : answer.toLowerCase() === "no"
                      ? "dqc-answer-no"
                      : ""
                }`}
              >
                {answer}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DQC;

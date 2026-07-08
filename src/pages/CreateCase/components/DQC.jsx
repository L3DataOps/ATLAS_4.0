import "./DQC.css";

const DQC = ({
  selectedEquipment,
  equipmentQuestions,
  questionResponses,
  setQuestionResponses,
}) => {
  const handleAnswer = (question, answer) => {
    setQuestionResponses((prev) => {
      const updated = {
        ...prev,
        [question]: answer,
      };

      console.log("Updated responses:", updated);

      return updated;
    });
  };

  console.log("questionResponses in DQC:", questionResponses);

  return (
    <div className="dqc-container">
      {equipmentQuestions?.length > 0 ? (
        equipmentQuestions.map((question, index) => {
          const answer = questionResponses?.[question];

          return (
            <div className="container">
              <div key={index} className="question-item">
                <p>{question}</p>

                <div className="radio-group">
                  <div
                    className={`answer-option ${
                      answer === "Yes" ? "selected" : ""
                    }`}
                    onClick={() => handleAnswer(question, "Yes")}
                  >
                    Yes
                  </div>

                  <div
                    className={`answer-option ${
                      answer === "No" ? "selected" : ""
                    }`}
                    onClick={() => handleAnswer(question, "No")}
                  >
                    No
                  </div>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <p>No questions available.</p>
      )}
    </div>
  );
};

export default DQC;

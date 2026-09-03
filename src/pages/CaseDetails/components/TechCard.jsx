import { useCase } from "../../../context/CaseContext";
import "./subcss.css";

const TechCard = () => {
  const { caseItem } = useCase();

  const techs = caseItem?.techsAssigned || [];

  const formatDuration = (milliseconds = 0) => {
    const totalMinutes = Math.floor(milliseconds / 60000);

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) {
      return `${hours}hr${minutes > 0 ? ` ${minutes}m` : ""}`;
    }

    return `${minutes}m`;
  };

  return (
    <div className="tech-card">
      {techs.length === 0 ? (
        <div className="tech-card-empty">No technicians assigned</div>
      ) : (
        techs.map((tech, index) => (
          <div className="tech-card-row" key={tech._id || index}>
            <div className="tech-name">
              {tech.firstname} {tech.lastname}
            </div>

            <div className="tech-time">
              <strong>
                {formatDuration(
                  (tech.techLeaveTravelTime || 0) +
                    (tech.totalEnrouteTime || 0),
                )}
                /{formatDuration(tech.totalOnsiteTime || 0)}
              </strong>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default TechCard;

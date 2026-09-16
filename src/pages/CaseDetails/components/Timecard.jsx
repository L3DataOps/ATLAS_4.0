import { useEffect, useState } from "react";
import { useCase } from "../../../context/CaseContext";
import SiteDowntime from "./SiteDowntime";
import "./subcss.css";

const Timecard = () => {
  const { caseItem } = useCase();
  const [elapsedTime, setElapsedTime] = useState("");

  useEffect(() => {
    if (!caseItem?.createdAt) return;

    const calculateElapsedTime = () => {
      const created = new Date(caseItem.createdAt);
      // Use completedAt as the end point once the case is done;
      // otherwise keep counting up against "now".
      const end = caseItem.completedAt
        ? new Date(caseItem.completedAt)
        : new Date();

      let totalSeconds = Math.floor((end - created) / 1000);

      if (totalSeconds < 0) {
        totalSeconds = 0;
      }

      const years = Math.floor(totalSeconds / (365.25 * 24 * 60 * 60));
      totalSeconds -= years * 365.25 * 24 * 60 * 60;

      const months = Math.floor(totalSeconds / (30.44 * 24 * 60 * 60));
      totalSeconds -= months * 30.44 * 24 * 60 * 60;

      const days = Math.floor(totalSeconds / (24 * 60 * 60));
      totalSeconds -= days * 24 * 60 * 60;

      const hours = Math.floor(totalSeconds / (60 * 60));
      totalSeconds -= hours * 60 * 60;

      const minutes = Math.floor(totalSeconds / 60);

      const seconds = totalSeconds % 60;

      const parts = [];

      if (years > 0) parts.push(`${years}y`);
      if (months > 0) parts.push(`${months}m`);
      if (days > 0) parts.push(`${days}d`);
      if (hours > 0) parts.push(`${hours}hrs`);
      if (minutes > 0) parts.push(`${minutes}m`);

      // Only show seconds when there are no larger units
      if (parts.length === 0) {
        parts.push(`${seconds}s`);
      }

      setElapsedTime(parts.join(" "));
    };

    calculateElapsedTime();

    // Once the case is completed, elapsed time is fixed — no need
    // to keep ticking every second. Only run the live interval
    // while the case is still open (completedAt is null).
    if (caseItem.completedAt) {
      return;
    }

    const interval = setInterval(calculateElapsedTime, 1000);

    return () => clearInterval(interval);
  }, [caseItem?.createdAt, caseItem?.completedAt]);

  return (
    <div className="time-card">
      <div className="time-card-header">
        <h4>Elapsed Time</h4>
        <p>{elapsedTime}</p>
      </div>
      <div className="border"></div>
      <SiteDowntime />
    </div>
  );
};

export default Timecard;

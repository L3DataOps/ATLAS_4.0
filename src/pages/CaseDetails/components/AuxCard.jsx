import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useCase } from "../../../context/CaseContext";
import "./CaseDetailComponents.css";

import BundledCases from "./BundledCases";

const API_URL = import.meta.env.VITE_API;

const AuxCard = ({ dispatchCenters }) => {
  const { token, user } = useAuth();
  const { caseItem, setCaseItem } = useCase();

  const [updatingId, setUpdatingId] = useState(null);

  const handleToggle = async (id) => {
    const dispatch = dispatchCenters.find((dispatch) => dispatch._id === id);

    if (!dispatch) return;

    // New toggle state
    const newNotificationState = !dispatch.hasBeenNotified;

    const updatedDispatch = dispatchCenters.map((dispatch) =>
      dispatch._id === id
        ? {
            ...dispatch,
            hasBeenNotified: newNotificationState,
          }
        : dispatch,
    );

    // Determine UP / DOWN
    const notificationStatus = newNotificationState
      ? "OFF NETWORK"
      : "ON NETWORK";

    // Get logged-in user's name
    const firstName = user?.firstname || user?.firstName || "";
    const lastName = user?.lastname || user?.lastName || "";

    const userName = `${firstName} ${lastName}`.trim() || "User";

    // Create the case note
    const newNote = {
      text: `${userName} notified ${dispatch.dispatchName} that the site is ${notificationStatus}.`,
      status: caseItem.status,
      activityNoteStatus: "Customer Facing",
      tags: ["System Generated", "Dispatch Notification"],
      createdBy: {
        firstname: "ATLAS System",
        lastname: "Notification",
      },
      createdAt: new Date().toISOString(),
    };

    // Update UI immediately
    setCaseItem((prev) => ({
      ...prev,
      dispatchCenterNotified: updatedDispatch,
      caseNotes: [...(prev.caseNotes || []), newNote],
    }));

    try {
      setUpdatingId(id);

      const response = await fetch(`${API_URL}/cases/${caseItem._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          dispatchCenterNotified: updatedDispatch,
          caseNotes: [...(caseItem.caseNotes || []), newNote],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update dispatch notification.");
      }

      const updatedCase = await response.json();

      setCaseItem((prev) => ({
        ...updatedCase,
        bundledCases: prev.bundledCases,
      }));
    } catch (err) {
      console.error("Error updating dispatch notification:", err);

      // Revert UI if API fails
      setCaseItem((prev) => ({
        ...prev,
        dispatchCenterNotified: dispatchCenters,
        caseNotes: prev.caseNotes?.slice(0, -1) || [],
      }));
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="aux-card">
      <h3>Dispatch Centers</h3>

      {dispatchCenters.map((dispatch) => (
        <div className="dispatch-row" key={dispatch._id}>
          <div className="dispatch-info">
            <h4>{dispatch.dispatchName}</h4>
            <p>{dispatch.dispatchPhoneNumber}</p>
          </div>

          <label className="switch">
            <input
              type="checkbox"
              checked={dispatch.hasBeenNotified}
              disabled={updatingId === dispatch._id}
              onChange={() => handleToggle(dispatch._id)}
            />

            <span className="slider"></span>
          </label>
        </div>
      ))}

      <BundledCases />
    </div>
  );
};

export default AuxCard;

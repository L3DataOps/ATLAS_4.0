import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useCase } from "../../../context/CaseContext";
import "./CaseDetailComponents.css";

import BundledCases from "./BundledCases";

const API_URL = import.meta.env.VITE_API;

const AuxCard = ({ dispatchCenters }) => {
  const { token } = useAuth();
  const { caseItem, setCaseItem } = useCase();

  console.log("Dispatch", caseItem);

  const handleToggle = async (id) => {
    const updatedDispatch = dispatchCenters.map((dispatch) =>
      dispatch._id === id
        ? {
            ...dispatch,
            hasBeenNotified: !dispatch.hasBeenNotified,
          }
        : dispatch,
    );

    // Update parent immediately
    setCaseItem((prev) => ({
      ...prev,
      dispatchCenterNotified: updatedDispatch,
    }));

    try {
      const response = await fetch(`${API_URL}/cases/${caseItem._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          dispatchCenterNotified: updatedDispatch,
        }),
      });

      const updatedCase = await response.json();

      setCaseItem((prev) => {
        return {
          ...updatedCase,
          bundledCases: prev.bundledCases,
        };
      });
    } catch (err) {
      console.error(err);
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

import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import "./CaseDetailComponents.css";

const API_URL = import.meta.env.VITE_API;

const AuxCard = ({ caseItem, dispatchCenters = [] }) => {
  const { token } = useAuth();

  const [dispatchList, setDispatchList] = useState([]);

  console.log(dispatchCenters)

  useEffect(() => {
    setDispatchList(dispatchCenters);
  }, [dispatchCenters]);

  const handleToggle = async (id) => {
    const updatedDispatch = dispatchList.map((dispatch) =>
      dispatch._id === id
        ? {
            ...dispatch,
            hasBeenNotified: !dispatch.hasBeenNotified,
          }
        : dispatch
    );

    // Update UI immediately
    setDispatchList(updatedDispatch);

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

      if (!response.ok) {
        throw new Error("Failed to update dispatch centers");
      }
    } catch (err) {
      console.error(err);

      // rollback if update failed
      setDispatchList(dispatchCenters);
    }
  };

  return (
    <div className="aux-card">
      <h3>Dispatch Centers</h3>

      {dispatchList.map((dispatch) => (
        <div className="dispatch-row" key={dispatch._id}>
          <div className="dispatch-info">
            <h4>{dispatch.dispatchName}</h4>
            <p>{dispatch.phone}</p>
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
    </div>
  );
};

export default AuxCard;
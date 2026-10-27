import "./Tabs.css";
import { useEffect, useState } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { useCase } from "../../../../context/CaseContext";
import { Fragment } from "react";

const API_URL = import.meta.env.VITE_API;
const RNM_CASE_URL = `${API_URL}/rnm/case`;

const DEFAULT_RESPONSE_ACTION =
  "Check the Alarm Matrix spreadsheet to determine the appropriate response action for this alarm.";

const RESPONSE_CATEGORIES = ["Critical", "Major", "Minor"];

const getResponseAction = (equipment, category) => {
  const actions = equipment?.responseAction;

  // Older equipment records may still store a single string
  if (typeof actions === "string" && actions.trim()) return actions;

  if (!actions || typeof actions !== "object") return DEFAULT_RESPONSE_ACTION;

  // Case-insensitive match so "major" or "Major " still works
  const match = RESPONSE_CATEGORIES.find(
    (c) => c.toLowerCase() === category?.trim().toLowerCase(),
  );

  return (match && actions[match]) || DEFAULT_RESPONSE_ACTION;
};

const Overview = ({ caseItem }) => {
  const { token } = useAuth();
  const { setCaseItem } = useCase();

  const [siteEquipment, setSiteEquipment] = useState([]);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState(
    caseItem.equipmentId || caseItem.equipment?._id || "",
  );

  const handleEquipmentChange = async (e) => {
    const newEquipmentId = e.target.value;
    setSelectedEquipmentId(newEquipmentId);

    try {
      const response = await fetch(`${RNM_CASE_URL}/${caseItem._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          equipmentId: newEquipmentId,
        }),
      });

      if (!response.ok) throw new Error("Failed to update equipment");

      setCaseItem(await response.json());
    } catch (err) {
      console.error("Error updating equipment:", err);

      // Revert to the original equipment on failure
      setSelectedEquipmentId(
        caseItem.equipmentId || caseItem.equipment?._id || "",
      );
    }
  };

  useEffect(() => {
    if (!caseItem.siteId) return;

    const fetchSiteEquipment = async () => {
      try {
        const res = await fetch(
          `${API_URL}/rnm/equipment/site/${caseItem.siteId}`,
        );

        if (!res.ok) throw new Error("Failed to fetch site equipment");

        const data = await res.json();
        setSiteEquipment(data);
      } catch (err) {
        console.error("Error fetching site equipment:", err);
        setSiteEquipment([]);
      }
    };

    fetchSiteEquipment();
  }, [caseItem.siteId]);

  useEffect(() => {
    setSelectedEquipmentId(
      caseItem.equipmentId || caseItem.equipment?._id || "",
    );
  }, [caseItem.equipmentId, caseItem.equipment?._id]);

  const matrixPath = caseItem.customer?.alarmMatrix;
  const fileName = matrixPath?.split(/[\\/]/).pop();
  const fileUrl = fileName
    ? `${API_URL}/alarm-matrices/${encodeURIComponent(fileName)}`
    : null;

  // Pick the response action text based on the case category
  const instructions = getResponseAction(caseItem.equipment, caseItem.category);

  // Split on "~" and put a line break between each piece
  const lines = instructions.split("~");

  return (
    <div className="overview-tab">
      <div className="overview-section">
        <div className="across">
          <h3>Equipment Name</h3>

          <select
            className="equipment-select"
            value={selectedEquipmentId}
            onChange={handleEquipmentChange}
          >
            <option value="" disabled>
              Select equipment...
            </option>

            {siteEquipment.map((equipment) => (
              <option key={equipment._id} value={equipment._id}>
                {equipment.equipmentName}
              </option>
            ))}
          </select>
        </div>

        <div className="across">
          <h5>Equipment Number</h5>
          <h5>{caseItem.equipment?.equipmentID}</h5>
        </div>

        <div className="border"></div>

        <h3>Response Actions</h3>
        <p className="response-actions">
          <strong>{caseItem.category}:</strong>
          {lines.map((line, index) => (
            <Fragment key={index}>
              {line.trim()}
              {index < lines.length - 1 && <br />}
            </Fragment>
          ))}
        </p>
      </div>

      <div className="sub-section">
        <div className="border"></div>
        <div className="across">
          <h5>Alarm Matrix</h5>
          {fileUrl ? (
            <h5>
              <a href={`ms-excel:ofe|u|${fileUrl}`}>{fileName}</a>
              {" · "}
              <a href={fileUrl} download>
                Download
              </a>
            </h5>
          ) : (
            <h5>N/A</h5>
          )}
        </div>
      </div>
    </div>
  );
};

export default Overview;

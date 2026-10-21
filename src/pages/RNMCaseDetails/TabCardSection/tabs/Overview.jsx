import "./Tabs.css";
import { useEffect, useState } from "react";
import { useAuth } from "../../../../context/AuthContext";

const API_URL = import.meta.env.VITE_API;
const RNM_CASE_URL = `${API_URL}/rnm/case`;

const Overview = ({ caseItem }) => {
  const { token, user } = useAuth();
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
  const [siteEquipment, setSiteEquipment] = useState([]);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState(
    caseItem.equipmentId || caseItem.equipment?._id || "",
  );

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
  console.log("caseItem", caseItem);
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
        <p>
          {caseItem.equipment?.responseAction ||
            "No response actions available."}
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

const API_URL = import.meta.env.VITE_API;
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import SiteList from "./components/SiteList";
import EquipmentList from "./components/EquipmentList";
import "./CreateCase.css";

const CreateCase = () => {
  const [loading, setLoading] = useState(true);
  const [sites, setSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState("");
  const [equipment, setEquipment] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("");
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [issueType, setIssueType] = useState("");

  const navigate = useNavigate();

  // Fetch all the sites in the DB
  useEffect(() => {
    const fetchSites = async () => {
      try {
        const response = await fetch(`${API_URL}/sites`);

        if (!response.ok) {
          throw new Error("Failed to fetch sites");
        }

        const data = await response.json();

        setSites(data);
      } catch (error) {
        console.error("Error fetching sites:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSites();
  }, []);

  // Fetch all the equipment for the selected site
  useEffect(() => {
    if (!selectedSite?._id) return;

    const fetchEquipment = async () => {
      try {
        const response = await fetch(`${API_URL}/equipment`);

        if (!response.ok) {
          throw new Error("Failed to fetch equipment");
        }

        const data = await response.json();

        const allEquipment = [
          ...data.mutualaid,
          ...data.microwave,
          ...data.generators,
        ];

        const filteredEquipment = allEquipment.filter(
          (item) => item.siteid === selectedSite._id,
        );

        setEquipment(filteredEquipment);
      } catch (error) {
        console.error("Error fetching equipment:", error);
      }
    };

    fetchEquipment();
  }, [selectedSite]);

  console.log("Fetched sites:", selectedSite);
  console.log("Fetched equipment:", equipment);
  console.log("Selected equipment:", selectedEquipment);

  return (
    <div className="create-case-container">
      {!selectedSite ? (
        <SiteList
          sites={sites}
          selectedSite={selectedSite}
          onSelectSite={setSelectedSite}
        />
      ) : (
        <EquipmentList
          equipment={equipment}
          selectedEquipment={selectedEquipment}
          onSelectEquipment={setSelectedEquipment}
          selectedSite={selectedSite}
          onBack={() => setSelectedSite(null)}
        />
      )}
      <button onClick={() => navigate("/open-cases")}>Go to Open Cases</button>
    </div>
  );
};

export default CreateCase;

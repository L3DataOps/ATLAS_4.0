const API_URL = import.meta.env.VITE_API;
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import SiteList from "./components/SiteList";
import EquipmentList from "./components/EquipmentList";
import HeaderLinks from "./components/HeaderLinks";
import Tags from "./components/Tags";
import SOFForm from "./components/SOFForm";
import DQC from "./components/DQC";
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
  const [questionBank, setQuestionBank] = useState([]);
  const [equipmentQuestions, setEquipmentQuestions] = useState([]);
  const [questionResponses, setQuestionResponses] = useState({});

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

  // Fetch all tags for the selected equipment
  useEffect(() => {
    if (!selectedEquipment?.type) {
      setTags([]);
      return;
    }

    const fetchTags = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API}/tags`);

        if (!response.ok) {
          throw new Error("Failed to fetch tags");
        }

        const data = await response.json();

        const matchingTags = data.find(
          (tagGroup) =>
            tagGroup.type?.toLowerCase() ===
            selectedEquipment.type?.toLowerCase(),
        );

        setTags(matchingTags?.tags || []);
      } catch (error) {
        console.error("Error fetching tags:", error);
        setTags([]);
      }
    };

    fetchTags();
  }, [selectedEquipment]);

  // Fetch all questions for the selected equipment
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch(`${API_URL}/questions`);
        const data = await res.json();
        setQuestionBank(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchQuestions();
  }, []);

  useEffect(() => {
    if (!selectedEquipment?.type || questionBank.length === 0) return;

    const group = questionBank[0]; // your API returns array with 1 object

    const questions = group[selectedEquipment.type] || [];

    setEquipmentQuestions(questions);
  }, [selectedEquipment?.type, questionBank]);

  console.log("Fetched sites:", selectedSite);
  console.log("Selected equipment:", selectedEquipment);
  console.log("Selected responses:", questionResponses);

  return (
    <div>
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
        <div className="form-container">
          <HeaderLinks />
          <div className="across">
            <SOFForm
              selectedSite={selectedSite}
              selectedEquipment={selectedEquipment}
              category={category}
              setCategory={setCategory}
              severity={severity}
              setSeverity={setSeverity}
              issueType={issueType}
              setIssueType={setIssueType}
            />
            <DQC
              selectedEquipment={selectedEquipment}
              equipmentQuestions={equipmentQuestions}
              questionResponses={questionResponses}
              setQuestionResponses={setQuestionResponses}
            />
          </div>

          <Tags
            tags={tags}
            selectedTags={selectedTags}
            setSelectedTags={setSelectedTags}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateCase;

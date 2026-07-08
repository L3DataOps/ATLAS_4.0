const API_URL = import.meta.env.VITE_API;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import SiteList from "./components/SiteList";
import EquipmentList from "./components/EquipmentList";
import HeaderLinks from "./components/HeaderLinks";
import SOFForm from "./components/SOFForm";
import InitialDescription from "./components/InitialDescription";
import Tags from "./components/Tags";
import DQC from "./components/DQC";
import CaseButtons from "./components/CaseButtons";

import "./CreateCase.css";

const CreateCase = () => {
  // =====================================================
  // Navigation + Auth
  // =====================================================
  const navigate = useNavigate();
  const { user, token } = useAuth();

  // =====================================================
  // State
  // =====================================================

  const [loading, setLoading] = useState(true);

  const [sites, setSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);

  const [equipment, setEquipment] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState(null);

  const [category, setCategory] = useState("");
  const [severity, setSeverity] = useState("");
  const [issueType, setIssueType] = useState("");
  const [description, setDescription] = useState("");

  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  const [questionBank, setQuestionBank] = useState([]);
  const [equipmentQuestions, setEquipmentQuestions] = useState([]);
  const [questionResponses, setQuestionResponses] = useState({});

  const [emailList, setEmailList] = useState([]);

  // =====================================================
  // Debug
  // =====================================================
  console.log({
    category,
    severity,
    issueType,
    description,
  });

  // =====================================================
  // Fetch Sites
  // =====================================================

  useEffect(() => {
    const fetchSites = async () => {
      try {
        const res = await fetch(`${API_URL}/sites`);
        if (!res.ok) throw new Error("Failed to fetch sites");

        const data = await res.json();
        setSites(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSites();
  }, []);

  // =====================================================
  // Fetch Equipment
  // =====================================================
  useEffect(() => {
    if (!selectedSite?._id) return;

    const fetchEquipment = async () => {
      try {
        const res = await fetch(`${API_URL}/equipment`);
        if (!res.ok) throw new Error("Failed to fetch equipment");

        const data = await res.json();

        const allEquipment = [
          ...data.mutualaid,
          ...data.microwave,
          ...data.generators,
        ];

        const filtered = allEquipment.filter(
          (item) => item.siteid === selectedSite._id,
        );

        setEquipment(filtered);
      } catch (err) {
        console.error(err);
      }
    };

    fetchEquipment();
  }, [selectedSite]);

  // =====================================================
  // Fetch Tags
  // =====================================================
  useEffect(() => {
    if (!selectedEquipment?.type) {
      setTags([]);
      return;
    }

    const fetchTags = async () => {
      try {
        const res = await fetch(`${API_URL}/tags`);
        if (!res.ok) throw new Error("Failed to fetch tags");

        const data = await res.json();

        const match = data.find(
          (t) =>
            t.type?.toLowerCase() === selectedEquipment.type?.toLowerCase(),
        );

        setTags(match?.tags || []);
      } catch (err) {
        console.error(err);
        setTags([]);
      }
    };

    fetchTags();
  }, [selectedEquipment]);

  // =====================================================
  // Fetch Question Bank
  // =====================================================
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

  // =====================================================
  // Set Equipment Questions
  // =====================================================
  useEffect(() => {
    if (!selectedEquipment?.type || !questionBank.length) return;

    const questions = questionBank[0]?.[selectedEquipment.type] ?? [];

    setEquipmentQuestions(questions);
  }, [selectedEquipment?.type, questionBank]);

  // =====================================================
  // Email List
  // =====================================================
  useEffect(() => {
    if (!selectedEquipment?.email) {
      setEmailList([]);
      return;
    }

    setEmailList([selectedEquipment.email]);
  }, [selectedEquipment?.email]);

  // =====================================================
  // Reset on Equipment Change
  // =====================================================
  useEffect(() => {
    setQuestionResponses({});
    setCategory("");
    setSeverity("");
    setIssueType("");
    setDescription("");
    setSelectedTags([]);
    setEmailList([]);
  }, [selectedEquipment?._id]);

  // =====================================================
  // Reset Form
  // =====================================================
  const resetForm = () => {
    setSelectedSite(null);
    setEquipment([]);
    setSelectedEquipment(null);

    setCategory("");
    setSeverity("");
    setIssueType("");
    setDescription("");

    setTags([]);
    setSelectedTags([]);

    setEquipmentQuestions([]);
    setQuestionResponses({});

    setEmailList([]);
  };

  // =====================================================
  // Validation
  // =====================================================
  const validateForm = () => {
    if (!selectedSite) return "Select a site";
    if (!selectedEquipment) return "Select equipment";
    if (!category) return "Select category";
    if (!issueType) return "Select issue type";
    if (!severity) return "Select severity";
    if (selectedTags.length === 0) return "Select at least one issue tag";
    if (!description.trim()) return "Enter a description";
    const allQuestionsAnswered = equipmentQuestions.every(
      (q) => questionResponses?.[q] !== undefined,
    );

    if (!allQuestionsAnswered) {
      return "Please answer all equipment questions";
    }
    return null;
  };

  // =====================================================
  // Create Case
  // =====================================================
  const handleCreate = async () => {
    const error = validateForm();
    if (error) {
      alert(error);
      return;
    }

    const payload = {
      siteId: selectedSite._id,
      equipmentId: selectedEquipment._id,

      category,
      severity,
      issueType,
      description,

      tags: selectedTags,
      questionnaire: questionResponses,

      createdBy: `${user.firstname} ${user.lastname}`,
      createdAt: new Date().toISOString(),
    };

    console.log("Payload:", payload);

    try {
      const res = await fetch(`${API_URL}/cases`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to create case");

      const data = await res.json();
      console.log("Case created:", data);

      resetForm();
      navigate("/open-cases");
    } catch (err) {
      console.error(err);
    }
  };

  // =====================================================
  // Render
  // =====================================================
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

          <div className="frame">
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

              <InitialDescription
                description={description}
                setDescription={setDescription}
              />
            </div>

            <div className="across">
              <Tags
                tags={tags}
                selectedTags={selectedTags}
                setSelectedTags={setSelectedTags}
              />

              <DQC
                selectedEquipment={selectedEquipment}
                equipmentQuestions={equipmentQuestions}
                questionResponses={questionResponses}
                setQuestionResponses={setQuestionResponses}
              />
            </div>

            <CaseButtons onCancel={resetForm} onCreate={handleCreate} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCase;

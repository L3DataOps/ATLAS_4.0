const API_URL = import.meta.env.VITE_API;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import CustomerList from "./components/CustomerList";
import SiteList from "./components/SiteList";
import EquipmentList from "./components/EquipmentList";
import HeaderLinks from "./components/HeaderLinks";
import RNMForm from "./components/RNMForm";
import InitialDescription from "./components/InitialDescription";
import Tags from "./components/Tags";
import CaseButtons from "./components/CaseButtons";

import "./CreateRemote.css";

const CreateCase = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();

  // =====================================================
  // State
  // =====================================================
  const [loading, setLoading] = useState(true);

  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [sites, setSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);

  const [equipment, setEquipment] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState(null);

  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  // =====================================================
  // Fetch Customers (once)
  // =====================================================
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetch(`${API_URL}/rnm`);
        if (!res.ok) throw new Error("Failed to fetch customers");

        setCustomers(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  // =====================================================
  // Fetch Sites for the selected customer
  // =====================================================
  useEffect(() => {
    // Clear everything downstream whenever the customer changes
    setSites([]);
    setSelectedSite(null);
    setEquipment([]);
    setSelectedEquipment(null);

    if (!selectedCustomer?._id) return;

    const fetchSites = async () => {
      try {
        const res = await fetch(
          `${API_URL}/rnm/customers/${selectedCustomer._id}/sites`,
        );
        if (!res.ok) throw new Error("Failed to fetch sites");

        setSites(await res.json());
      } catch (err) {
        console.error(err);
        setSites([]);
      }
    };

    fetchSites();
  }, [selectedCustomer?._id]);

  // =====================================================
  // Fetch Equipment for the selected site
  // =====================================================
  useEffect(() => {
    setEquipment([]);
    setSelectedEquipment(null);

    if (!selectedSite?._id) return;

    const fetchEquipment = async () => {
      try {
        const res = await fetch(
          `${API_URL}/rnm/equipment/site/${selectedSite._id}`,
        );
        if (!res.ok) throw new Error("Failed to fetch equipment");

        setEquipment(await res.json());
      } catch (err) {
        console.error(err);
        setEquipment([]);
      }
    };

    fetchEquipment();
  }, [selectedSite?._id]);

  // =====================================================
  // Fetch Tags for the selected equipment's type
  // =====================================================
  useEffect(() => {
    setTags([]);
    setSelectedTags([]);

    if (!selectedEquipment?.type) return;

    const fetchTags = async () => {
      try {
        const res = await fetch(
          `${API_URL}/rnm/tags/${selectedEquipment.type}`,
        );
        if (!res.ok) throw new Error("Failed to fetch tags");

        setTags(await res.json());
      } catch (err) {
        console.error(err);
        setTags([]);
      }
    };

    fetchTags();
  }, [selectedEquipment?.type]);
  // =====================================================
  // Reset form fields on Equipment Change
  // =====================================================
  useEffect(() => {
    setCategory("");
    setDescription("");
    setSelectedTags([]);
  }, [selectedEquipment?._id]);

  // =====================================================
  // Reset Form (clearing the customer also clears site/equipment
  // via the effects above)
  // =====================================================
  const resetForm = () => {
    setSelectedCustomer(null);
    setSelectedSite(null);
    setSelectedEquipment(null);
    setCategory("");
    setDescription("");

    setTags([]);
    setSelectedTags([]);
  };

  // =====================================================
  // Validation
  // =====================================================
  const validateForm = () => {
    if (!selectedCustomer) return "Select a customer";
    if (!selectedSite) return "Select a site";
    if (!selectedEquipment) return "Select equipment";
    if (!category) return "Select category";
    if (selectedTags.length === 0) return "Select at least one issue tag";
    if (!description.trim()) return "Enter a description";

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
      customerId: selectedCustomer._id,
      siteId: selectedSite._id,
      equipmentId: selectedEquipment._id,
      category,
      description,
      tags: selectedTags,

      createdBy: `${user.firstname} ${user.lastname}`,
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch(`${API_URL}/rnm/case/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to create case");

      resetForm();
      navigate("/open-cases");
    } catch (err) {
      console.error(err);
    }
  };

  // =====================================================
  // Render: left panel shows the current step in the flow
  // =====================================================
  const renderSelectionPanel = () => {
    if (!selectedCustomer) {
      return (
        <CustomerList
          customers={customers}
          selectedCustomer={selectedCustomer}
          onSelectCustomer={setSelectedCustomer}
          loading={loading}
        />
      );
    }

    if (!selectedSite) {
      return (
        <SiteList
          sites={sites}
          selectedSite={selectedSite}
          onSelectSite={setSelectedSite}
          selectedCustomer={selectedCustomer}
          onBack={() => setSelectedCustomer(null)}
        />
      );
    }

    return (
      <EquipmentList
        equipment={equipment}
        selectedEquipment={selectedEquipment}
        onSelectEquipment={setSelectedEquipment}
        selectedSite={selectedSite}
        onBack={() => setSelectedSite(null)}
      />
    );
  };

  return (
    <div>
      <div className="create-case-container">
        {renderSelectionPanel()}

        <div className="form-container">
          <HeaderLinks />

          <div className="frame">
            <div className="across">
              <RNMForm
                selectedCustomer={selectedCustomer}
                selectedSite={selectedSite}
                selectedEquipment={selectedEquipment}
                category={category}
                setCategory={setCategory}
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
            </div>

            <CaseButtons onCancel={resetForm} onCreate={handleCreate} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCase;

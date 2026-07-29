import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useCase } from "../../../context/CaseContext";
import "./ActivityNotes.css";

const API_URL = import.meta.env.VITE_API;

const AssignTechModal = ({ onClose }) => {
  const { token } = useAuth();
  const { caseItem, setCaseItem } = useCase();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(caseItem.techsAssigned || []);
  const [isSaving, setIsSaving] = useState(false);
  const popupRef = useRef(null);

  // =========================
  // FETCH USERS
  // =========================
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${API_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch users");
        }

        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error(err);
        setUsers([]);
      }
    };

    fetchUsers();
  }, [token]);

  // =========================
  // CLOSE ON OUTSIDE CLICK
  // =========================
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const filteredUsers = users
    .filter((u) => {
      const searchLower = search.toLowerCase();
      const fullName = `${u.firstname} ${u.lastname}`.toLowerCase();

      return (
        fullName.includes(searchLower) ||
        u.email?.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      const aAssigned = selected.some((t) => t.userId === a._id);
      const bAssigned = selected.some((t) => t.userId === b._id);

      // Assigned techs first
      if (aAssigned && !bAssigned) return -1;
      if (!aAssigned && bAssigned) return 1;

      // Then alphabetically
      return `${a.firstname} ${a.lastname}`.localeCompare(
        `${b.firstname} ${b.lastname}`,
      );
    });

  const isSelected = (userId) => selected.some((t) => t.userId === userId);

  const toggleUser = (u) => {
    setSelected((prev) => {
      if (prev.some((t) => t.userId === u._id)) {
        return prev.filter((t) => t.userId !== u._id);
      }

      return [
        ...prev,
        {
          userId: u._id,
          firstname: u.firstname,
          lastname: u.lastname,
        },
      ];
    });
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const res = await fetch(`${API_URL}/cases/${caseItem._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ techsAssigned: selected }),
      });

      if (!res.ok) {
        throw new Error("Failed to assign techs");
      }

      const updatedCase = await res.json();
      setCaseItem(updatedCase);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="assign-tech-overlay">
      <div className="assign-tech-popup" ref={popupRef}></div>
      <div className="assign-tech-popup" ref={popupRef}>
        <div className="assign-tech-header">
          <h4>Assign Techs</h4>
          <button onClick={onClose}>✕</button>
        </div>

        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="assign-tech-search"
        />

        <div className="assign-tech-list">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((u) => (
              <label key={u._id} className="assign-tech-option">
                <input
                  type="checkbox"
                  checked={isSelected(u._id)}
                  onChange={() => toggleUser(u)}
                />
                <span className="bold">
                  {u.firstname} {u.lastname}
                </span>
                -<span className="italic">{u.company}</span>
              </label>
            ))
          ) : (
            <p>No users found.</p>
          )}
        </div>

        <div className="assign-tech-footer">
          <button onClick={onClose} disabled={isSaving}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : `Assign (${selected.length})`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignTechModal;

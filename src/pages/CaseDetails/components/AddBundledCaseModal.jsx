import { useEffect, useMemo, useState } from "react";

const API_URL = import.meta.env.VITE_API;

const AddBundledCaseModal = ({ caseItem, onClose, onUpdated }) => {
  const [cases, setCases] = useState([]);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const res = await fetch(`${API_URL}/cases`);
        const data = await res.json();

        const bundledIds = new Set(
          (caseItem.bundledCases || []).map((x) => x._id),
        );

        const available = data.filter(
          (c) => c._id !== caseItem._id && !bundledIds.has(c._id),
        );

        setCases(available);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCases();
  }, []);

  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const searchLower = search.toLowerCase();

      return (
        c.caseNumber.toString().includes(searchLower) ||
        c.description?.toLowerCase().includes(searchLower) ||
        c.status?.toLowerCase().includes(searchLower)
      );
    });
  }, [cases, search]);

  const toggleCase = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`${API_URL}/cases/${caseItem._id}/bundle`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bundledCases: selected,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to add bundled cases");
      }

      const updatedCase = await res.json();

      onUpdated(updatedCase);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bundle-overlay">
      <div className="bundle-modal">
        <div className="bundle-title">
          <h2>Add Bundled Cases</h2>

          <button onClick={onClose}>✕</button>
        </div>

        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="bundle-results">
          {filteredCases.map((item) => (
            <div
              key={item._id}
              className={`bundle-case ${
                selected.includes(item._id) ? "selected" : ""
              }`}
              onClick={() => toggleCase(item._id)}
            >
              <input
                type="checkbox"
                checked={selected.includes(item._id)}
                readOnly
              />

              <div>
                <h4>#{item.caseNumber}</h4>

                <p>{item.status}</p>

                <small>{item.description}</small>
              </div>
            </div>
          ))}
        </div>

        <div className="bundle-footer">
          <button onClick={onClose}>Cancel</button>

          <button onClick={handleSave}>
            Add {selected.length} Case
            {selected.length !== 1 ? "s" : ""}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddBundledCaseModal;

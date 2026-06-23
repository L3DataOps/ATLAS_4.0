const API_URL = import.meta.env.VITE_API;
import { useEffect, useState } from "react";

const OpenCases = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const response = await fetch(`${API_URL}/cases`);

        if (!response.ok) {
          throw new Error("Failed to fetch cases");
        }

        const data = await response.json();
        setCases(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching cases:", error);
        setLoading(false);
      }
    };

    fetchCases();
  }, []);

  console.log("Fetched cases:", cases);

  return (
    <div>
      <h1>Open Cases</h1>
    </div>
  );
};

export default OpenCases;

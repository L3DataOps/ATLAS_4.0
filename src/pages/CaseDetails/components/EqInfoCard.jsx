import { useEffect, useState } from "react";
import "./CaseDetailComponents.css";

const VITE_API = import.meta.env.VITE_API;

const EqInfoCard = ({ caseItem }) => {
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const typePrefixes = {
    "Mutual Aid": "MA",
    Microwave: "MW",
    Generator: "GEN",
    HVAC: "HVAC",
    Electrical: "ELEC",
    UPS: "UPS",
    ATS: "ATS",
    "Fuel Tank": "FUEL",
    "Tower Light": "TL",
    Network: "NET",
    Camera: "CAM",
    Gate: "GATE",
    Security: "SEC",
  };

  const siteInfo = caseItem.site?.additionalInfo?.trim() || "";
  const equipmentInfo = caseItem.equipment?.additionalInfo?.trim() || "";

  const showEquipmentInfo = equipmentInfo && siteInfo !== equipmentInfo;

  const siteFolder = caseItem.site.siteName;

  const equipmentFolder = `${typePrefixes[caseItem.equipment.type]}-${caseItem.equipment.equipmentID}`;

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch(
          `${VITE_API}/equipment-images/${encodeURIComponent(
            siteFolder,
          )}/${encodeURIComponent(equipmentFolder)}`,
        );

        if (!response.ok) {
          throw new Error("Failed to load images");
        }

        const data = await response.json();

        setImages(data);
        setCurrentIndex(0);
      } catch (err) {
        console.error("Error loading equipment images:", err);
        setImages([]);
      }
    };

    if (siteFolder && equipmentFolder) {
      fetchImages();
    }
  }, [siteFolder, equipmentFolder]);

  const nextImage = () => {
    if (images.length === 0) return;

    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const previousImage = () => {
    if (images.length === 0) return;

    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const imageUrl = (image) =>
    `http://10.40.2.22:5000/equipment-images/${encodeURIComponent(
      siteFolder,
    )}/${encodeURIComponent(equipmentFolder)}/${encodeURIComponent(image)}`;

  return (
    <div className="eq-info-card">
      <div className="equipment-carousel">
        {images.length > 0 ? (
          <>
            <button
              onClick={previousImage}
              className="carousel-button"
              aria-label="Previous image"
            >
              ◀
            </button>

            <div className="carousel-image-container">
              <img
                src={imageUrl(images[currentIndex])}
                alt={images[currentIndex]}
                className="equipment-image"
              />
            </div>

            <button
              onClick={nextImage}
              className="carousel-button"
              aria-label="Next image"
            >
              ▶
            </button>
          </>
        ) : (
          <p>No equipment images found.</p>
        )}
      </div>

      <div className="equipment-details">
        <h4>Address Information</h4>
        <h4>{caseItem.site?.address}</h4>

        {siteInfo && <p>{siteInfo}</p>}

        {showEquipmentInfo && (
          <>
            <h4>EQ Information</h4>
            <p>{equipmentInfo}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default EqInfoCard;

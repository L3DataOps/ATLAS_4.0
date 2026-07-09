import { useEffect, useState } from "react";
import "./CaseDetailComponents.css";
import forwardIcon from "../../../images/next.png";
import backIcon from "../../../images/back.png";

const VITE_API = import.meta.env.VITE_API;

const EqInfoCard = ({ caseItem }) => {
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const siteInfo = caseItem.site?.additionalInfo?.trim() || "";
  const equipmentInfo = caseItem.equipment?.additionalInfo?.trim() || "";

  const showEquipmentInfo = equipmentInfo && siteInfo !== equipmentInfo;

  const siteFolder = caseItem.site.siteName;

  const equipmentId = caseItem.equipment.equipmentID;

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch(
          `${VITE_API}/equipment-images/${encodeURIComponent(siteFolder)}/${encodeURIComponent(equipmentId)}`,
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

    if (siteFolder && equipmentId) {
      fetchImages();
    }
  }, [siteFolder, equipmentId]);

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
    )}/${encodeURIComponent(equipmentId)}/${encodeURIComponent(image)}`;

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
              <img src={backIcon} alt="Previous" className="forward-icon" />
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
              <img src={forwardIcon} alt="Next" className="forward-icon" />
            </button>
          </>
        ) : (
          <p>No equipment images found.</p>
        )}
      </div>

      <div className="equipment-details">
        <h4>Address Information</h4>
        <div className="border"></div>
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

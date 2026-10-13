import { useEffect, useState } from "react";
import "./CaseDetailComponents.css";
import forwardIcon from "../../../images/next.png";
import backIcon from "../../../images/back.png";

const VITE_API = import.meta.env.VITE_API;

const EqInfoCard = ({ caseItem }) => {
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showInfoModal, setShowInfoModal] = useState(false);

  const siteInfo = caseItem.site?.additionalInfo?.trim() || "";
  const equipmentInfo = caseItem.equipment?.additionalInfo?.trim() || "";

  // Only show equipment info if it is different from the site info
  const showEquipmentInfo = equipmentInfo && equipmentInfo !== siteInfo;

  const siteFolder = caseItem.site?.siteName;
  const equipmentId = caseItem.equipment?.equipmentID;

  const address = caseItem.site?.address?.trim() || "";

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch(
          `${VITE_API}/equipment-images/${encodeURIComponent(
            siteFolder,
          )}/${encodeURIComponent(equipmentId)}`,
        );

        if (!response.ok) {
          throw new Error("Failed to load images");
        }

        const data = await response.json();

        setImages(data);
        setCurrentIndex(0);
      } catch (err) {
        console.error("Error loading images:", err);
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

  const openGoogleMaps = () => {
    if (!address) return;

    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      address,
    )}`;

    window.open(mapsUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="eq-info-card">
      {/* ================= CAROUSEL ================= */}
      <div className="equipment-carousel">
        {images.length > 0 ? (
          <>
            <button
              onClick={previousImage}
              className="carousel-button carousel-button-left"
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

              {/* Image counter */}
              {images.length > 1 && (
                <div className="carousel-counter">
                  {currentIndex + 1} / {images.length}
                </div>
              )}
            </div>

            <button
              onClick={nextImage}
              className="carousel-button carousel-button-right"
              aria-label="Next image"
            >
              <img src={forwardIcon} alt="Next" className="forward-icon" />
            </button>
          </>
        ) : (
          <div className="no-equipment-images">
            <p>No equipment images found.</p>
          </div>
        )}
      </div>

      {/* ================= BOTTOM BUTTONS ================= */}
      <div className="eq-info-actions">
        <button
          className="eq-info-action-button"
          onClick={() => setShowInfoModal(true)}
        >
          Site / Equipment Info
        </button>
      </div>

      {/* ================= INFO MODAL ================= */}
      {showInfoModal && (
        <div
          className="eq-info-modal-overlay"
          onClick={() => setShowInfoModal(false)}
        >
          <div className="eq-info-modal" onClick={(e) => e.stopPropagation()}>
            <div className="eq-info-modal-header">
              <h3>Site & Equipment Information</h3>

              <button
                className="eq-info-modal-close"
                onClick={() => setShowInfoModal(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="eq-info-modal-content">
              {/* SITE INFORMATION */}
              <div className="eq-modal-section">
                <h4>Site Information</h4>

                <div className="eq-modal-field">
                  <span>Site</span>
                  <strong>{caseItem.site?.siteName || "N/A"}</strong>
                </div>

                <div className="eq-modal-field">
                  <span>Address</span>
                  <strong>{address || "N/A"}</strong>
                </div>

                {siteInfo && (
                  <div className="eq-modal-description">
                    <span>Additional Information</span>
                    <p>{siteInfo}</p>
                  </div>
                )}
              </div>

              {/* EQUIPMENT INFORMATION */}
              {showEquipmentInfo && (
                <div className="eq-modal-section">
                  <h4>Equipment Information</h4>

                  <div className="eq-modal-field">
                    <span>Equipment</span>
                    <strong>{caseItem.equipment?.equipmentID || "N/A"}</strong>
                  </div>

                  {caseItem.equipment?.type && (
                    <div className="eq-modal-field">
                      <span>Type</span>
                      <strong>{caseItem.equipment.type}</strong>
                    </div>
                  )}

                  <div className="eq-modal-description">
                    <span>Additional Information</span>
                    <p>{equipmentInfo}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="eq-info-modal-footer">
              <button
                className="eq-info-modal-close-button"
                onClick={() => setShowInfoModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EqInfoCard;

/*


<button
          className="eq-info-action-button"
          onClick={openGoogleMaps}
          disabled={!address}
        >
          Open in Google Maps
        </button>

*/

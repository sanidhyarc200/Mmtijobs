import React, { useState } from "react";

const jobData = {
  Bhopal: { IT: 7, Hardware: 5, BeautyWellness: 10, Agriculture: 6 },
  Indore: { IT: 10, Hardware: 8, BeautyWellness: 5, Agriculture: 7 },
};

const cityAreas = {
  Bhopal: { x1: 578, y1: 494, x2: 636, y2: 575 },
  Indore: { x1: 330, y1: 619, x2: 426, y2: 662 },
};

const isInsideRect = (mouseX, mouseY, area) =>
  mouseX >= area.x1 && mouseX <= area.x2 && mouseY >= area.y1 && mouseY <= area.y2;

const styles = {
  jobCard: {
    position: "absolute",
    background: "#ffffff",
    padding: "18px",
    borderRadius: "16px",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
    minWidth: "280px",
    maxWidth: "320px",
    opacity: 0,
    transform: "translateY(12px)",
    transition: "opacity 0.4s ease-out, transform 0.4s ease-out",
    pointerEvents: "none",
    zIndex: 10,
    border: "1px solid rgba(0, 0, 0, 0.1)",
  },
  jobCardVisible: {
    opacity: 1,
    transform: "translateY(0)",
  },
  jobTitle: {
    margin: "0 0 16px 0",
    fontSize: "20px",
    color: "#34495e",
    fontWeight: "700",
    textAlign: "center",
  },
  jobList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  jobItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    borderRadius: "8px",
    background: "#f8f9fa",
    marginBottom: "10px",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.08)",
    fontSize: "16px",
  },
  jobType: {
    fontWeight: "500",
    color: "#7f8c8d",
  },
  jobCount: {
    fontWeight: "600",
    color: "#2e86c1",
  },
};

const MapPage = () => {
  const [hoveredCity, setHoveredCity] = useState(null);

  const handleMouseMove = (event) => {
    const img = document.getElementById("mp-map");
    if (!img) return;

    const imgRect = img.getBoundingClientRect();
    const mouseX = event.clientX - imgRect.left;
    const mouseY = event.clientY - imgRect.top;

    let detectedCity = null;
    Object.entries(cityAreas).forEach(([city, area]) => {
      if (isInsideRect(mouseX, mouseY, area)) {
        detectedCity = city;
      }
    });

    setHoveredCity(detectedCity);
  };

  const getCardPosition = (city) => {
    if (!city) return { top: 0, left: 0 };

    const img = document.getElementById("mp-map");
    if (!img) return { top: cityAreas[city].y1, left: cityAreas[city].x1 };

    const imgRect = img.getBoundingClientRect();
    const cardWidth = 280;
    const cardHeight = 180;

    let left = cityAreas[city].x1;
    let top = cityAreas[city].y1;

    if (left + cardWidth > imgRect.width) {
      left = cityAreas[city].x1 - cardWidth;
    }

    if (top + cardHeight > imgRect.height) {
      top = cityAreas[city].y1 - cardHeight;
    }

    return { top, left };
  };

  return (
    <div style={{ position: "relative", width: "100vw", textAlign: "center" }}>
      <img
        id="mp-map"
        src="/mp.png"
        alt="Madhya Pradesh Map"
        style={{ width: "100%", height: "auto" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredCity(null)}
      />

      {hoveredCity && (
        <div
          style={{
            ...styles.jobCard,
            ...(hoveredCity && styles.jobCardVisible),
            ...getCardPosition(hoveredCity),
          }}
        >
          <h3 style={styles.jobTitle}>{hoveredCity} Job Openings</h3>
          <ul style={styles.jobList}>
            {Object.entries(jobData[hoveredCity]).map(([type, count]) => (
              <li key={type} style={styles.jobItem}>
                <span style={styles.jobType}>{type}</span>
                <span style={styles.jobCount}>{count} openings</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MapPage;

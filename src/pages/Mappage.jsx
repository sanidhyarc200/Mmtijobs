import React, { useState } from "react";

const jobData = {
  Bhopal: { IT: 7, Hardware: 5, BeautyWellness: 10, Agriculture: 6 },
  Indore: { IT: 10, Hardware: 8, BeautyWellness: 5, Agriculture: 7 },
};

const cityDots = {
  Bhopal: { x: 610, y: 535 },
  Indore: { x: 380, y: 640 },
};

const DOT_RADIUS = 12;

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
    pointerEvents: "auto",
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
  cityDot: {
    position: "absolute",
    width: `${DOT_RADIUS}px`,
    height: `${DOT_RADIUS}px`,
    borderRadius: "50%",
    backgroundColor: "#ffffff",
    border: "2px solid #2e86c1",
    transform: "translate(-50%, -50%)",
    cursor: "pointer",
    zIndex: 5,
  },
};

const MapPage = () => {
  const [hoveredCity, setHoveredCity] = useState(null);

  const getCardPosition = (city) => {
    if (!city) return { top: 0, left: 0 };

    const dot = cityDots[city];
    const img = document.getElementById("mp-map");
    if (!img) return { top: dot.y, left: dot.x };

    const imgRect = img.getBoundingClientRect();

    const cardWidth = 300;
    const cardHeight = 180;

    let left = dot.x;
    let top = dot.y;

    if (left + cardWidth > imgRect.width) left -= cardWidth;
    if (top + cardHeight > imgRect.height) top -= cardHeight;

    return { left, top };
  };

  return (
    <div style={{ position: "relative", width: "100vw", textAlign: "center" }}>
      <img
        id="mp-map"
        src="/mp.png"
        alt="Madhya Pradesh Map"
        style={{ width: "100%", height: "auto" }}
        onMouseLeave={() => setHoveredCity(null)}
      />

      {/* White dots for each city */}
      {Object.entries(cityDots).map(([city, coords]) => (
        <div
          key={city}
          style={{
            ...styles.cityDot,
            top: coords.y,
            left: coords.x,
          }}
          onMouseEnter={() => setHoveredCity(city)}
          onMouseLeave={() => setHoveredCity(null)}
        />
      ))}

      {/* Floating Job Card */}
      {hoveredCity && (
        <div
          style={{
            ...styles.jobCard,
            ...styles.jobCardVisible,
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

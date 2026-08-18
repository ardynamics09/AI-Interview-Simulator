import React from "react";

/**
 * Pure SVG Interactive Skill Radar Chart
 * Renders multi-axis competency polygon with concentric grid & labels
 */
export default function RadarChart({ skills = [], size = 380 }) {
  if (!skills || skills.length === 0) return null;

  const center = size / 2;
  const radius = size * 0.36;
  const totalAxes = skills.length;
  const angleSlice = (Math.PI * 2) / totalAxes;

  // Grid levels (20%, 40%, 60%, 80%, 100%)
  const levels = [0.2, 0.4, 0.6, 0.8, 1.0];

  // Helper to convert polar to cartesian
  const getCoordinates = (valueRatio, index) => {
    const angle = angleSlice * index - Math.PI / 2;
    const r = radius * valueRatio;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  // Generate data polygon points string
  const dataPoints = skills.map((item, i) => {
    const ratio = Math.min(1, Math.max(0.1, item.score / 100));
    const { x, y } = getCoordinates(ratio, i);
    return `${x},${y}`;
  }).join(" ");

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", overflow: "hidden" }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ maxWidth: "100%", height: "auto", overflow: "visible" }}
      >
        <defs>
          {/* Radial Gradient for fill */}
          <radialGradient id="radarFillGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00e676" stopOpacity="0.5" />
            <stop offset="70%" stopColor="#2196f3" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#2196f3" stopOpacity="0.1" />
          </radialGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Concentric Grid Polygons */}
        {levels.map((level, lvlIdx) => {
          const gridPoints = skills.map((_, i) => {
            const { x, y } = getCoordinates(level, i);
            return `${x},${y}`;
          }).join(" ");

          return (
            <g key={lvlIdx}>
              <polygon
                points={gridPoints}
                fill="none"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="1"
                strokeDasharray={lvlIdx === levels.length - 1 ? "none" : "2,2"}
              />
              <text
                x={center + 4}
                y={center - radius * level - 2}
                fill="rgba(255, 255, 255, 0.25)"
                fontSize="9"
                fontFamily="monospace"
              >
                {Math.round(level * 100)}%
              </text>
            </g>
          );
        })}

        {/* Axis Lines & Labels */}
        {skills.map((item, i) => {
          const { x: endX, y: endY } = getCoordinates(1.0, i);
          const { x: labelX, y: labelY } = getCoordinates(1.18, i);

          // Label alignment based on position
          let textAnchor = "middle";
          if (labelX < center - 10) textAnchor = "end";
          else if (labelX > center + 10) textAnchor = "start";

          return (
            <g key={i}>
              <line
                x1={center}
                y1={center}
                x2={endX}
                y2={endY}
                stroke="rgba(255, 255, 255, 0.12)"
                strokeWidth="1"
              />
              <text
                x={labelX}
                y={labelY}
                textAnchor={textAnchor}
                dominantBaseline="central"
                fill="#cfd8dc"
                fontSize="11"
                fontWeight="600"
                fontFamily="inherit"
              >
                {item.skill}
              </text>
            </g>
          );
        })}

        {/* Candidate Data Polygon */}
        <polygon
          points={dataPoints}
          fill="url(#radarFillGrad)"
          stroke="#00e676"
          strokeWidth="2.5"
          filter="url(#glow)"
        />

        {/* Vertex Data Points */}
        {skills.map((item, i) => {
          const ratio = Math.min(1, Math.max(0.1, item.score / 100));
          const { x, y } = getCoordinates(ratio, i);
          return (
            <g key={i}>
              <circle
                cx={x}
                cy={y}
                r="4.5"
                fill="#00e676"
                stroke="#121212"
                strokeWidth="2"
              />
              <circle
                cx={x}
                cy={y}
                r="7"
                fill="none"
                stroke="rgba(0, 230, 118, 0.4)"
                strokeWidth="1.5"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

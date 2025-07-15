import React, { useRef, useEffect } from "react";

// AQI breakpoints and colors (US EPA standard)
const AQI_LEVELS = [
  { max: 50, color: "#4ade80" },      // Good (green)
  { max: 100, color: "#fde047" },     // Moderate (yellow)
  { max: 150, color: "#fbbf24" },     // Unhealthy for Sensitive Groups (orange)
  { max: 200, color: "#f87171" },     // Unhealthy (red)
  { max: 300, color: "#a78bfa" },     // Very Unhealthy (purple)
  { max: 500, color: "#a16207" },     // Hazardous (maroon)
];

export function getAqiColor(aqi) {
  for (const level of AQI_LEVELS) {
    if (aqi <= level.max) return level.color;
  }
  return AQI_LEVELS[AQI_LEVELS.length - 1].color;
}

export default function AqiGauge({ value = 0, min = 0, max = 500, size = 220 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const w = size * dpr;
    const h = size * dpr;
    canvas.width = w;
    canvas.height = h;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.clearRect(0, 0, w, h);

    // Gauge settings
    const center = w / 2;
    const radius = w * 0.38;
    const thickness = w * 0.13;
    const startAngle = 0.75 * Math.PI;
    const endAngle = 2.25 * Math.PI;
    const range = max - min;
    const percent = Math.max(0, Math.min(1, (value - min) / range));
    const angle = startAngle + (endAngle - startAngle) * percent;
    const color = getAqiColor(value);

    // Draw background arc
    ctx.beginPath();
    ctx.arc(center, center, radius, startAngle, endAngle, false);
    ctx.lineWidth = thickness;
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineCap = "round";
    ctx.stroke();

    // Draw value arc
    ctx.beginPath();
    ctx.arc(center, center, radius, startAngle, angle, false);
    ctx.strokeStyle = color;
    ctx.stroke();

    // Draw AQI value in center
    ctx.font = `${w * 0.22}px Inter, Arial, sans-serif`;
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(Math.round(value), center, center);

    // Draw label
    ctx.font = `${w * 0.09}px Inter, Arial, sans-serif`;
    ctx.fillStyle = "#6b7280";
    ctx.fillText("AQI", center, center + w * 0.16);
  }, [value, min, max, size]);

  return (
    <div className="flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        aria-label={`AQI Gauge: ${value}`}
        role="img"
        tabIndex={0}
        className="select-none"
        style={{ maxWidth: "100%", height: "auto", display: "block" }}
      />
    </div>
  );
} 
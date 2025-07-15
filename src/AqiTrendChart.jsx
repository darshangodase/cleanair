import React, { useRef, useEffect } from "react";
import { getAqiColor } from "./AqiGauge";

export default function AqiTrendChart({ data = [], size = 400, nowAqi }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const w = size * dpr;
    // Increase height for better label visibility
    const h = (size * 0.7) * dpr;
    canvas.width = w;
    canvas.height = h;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size * 0.7}px`;
    ctx.clearRect(0, 0, w, h);

    // Axis settings (more bottom padding for X label)
    const paddingLeft = w * 0.23;
    const paddingRight = w * 0.05;
    const paddingTop = h * 0.13;
    const paddingBottom = h * 0.26;
    const chartW = w - paddingLeft - paddingRight;
    const chartH = h - paddingTop - paddingBottom;

    // Dynamic Y-axis min/max with padding
    let minY = Math.min(...data);
    let maxY = Math.max(...data);
    if (!isFinite(minY) || !isFinite(maxY)) {
      minY = 0;
      maxY = 100;
    }
    minY = Math.max(0, Math.floor(minY - 10));
    maxY = Math.ceil(maxY + 5); // Only +5 for tight range
    if (maxY - minY < 10) maxY = minY + 10;
    const yRange = maxY - minY;

    // Y-axis ticks (5 ticks)
    const yTicks = [];
    for (let i = 0; i <= 4; i++) {
      yTicks.push(Math.round(minY + (yRange * i) / 4));
    }

    // X-axis ticks (time)
    const xTicks = data.length > 1 ? Array.from({ length: data.length }, (_, i) => (i === 0 ? "Now" : `+${i}h`)) : [];

    // Draw Y-axis
    ctx.strokeStyle = "#d1d5db";
    ctx.lineWidth = 1 * dpr;
    ctx.beginPath();
    ctx.moveTo(paddingLeft, paddingTop);
    ctx.lineTo(paddingLeft, paddingTop + chartH);
    ctx.stroke();

    // Draw Y-axis ticks and labels
    ctx.font = `${w * 0.035}px Inter, Arial, sans-serif`;
    ctx.fillStyle = "#6b7280";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    yTicks.forEach((tick) => {
      const y = paddingTop + chartH - ((tick - minY) / yRange) * chartH;
      ctx.beginPath();
      ctx.moveTo(paddingLeft - 6 * dpr, y);
      ctx.lineTo(paddingLeft, y);
      ctx.stroke();
      ctx.fillText(tick, paddingLeft - 10 * dpr, y);
    });

    // Draw X-axis
    ctx.strokeStyle = "#d1d5db";
    ctx.lineWidth = 1 * dpr;
    ctx.beginPath();
    ctx.moveTo(paddingLeft, paddingTop + chartH);
    ctx.lineTo(paddingLeft + chartW, paddingTop + chartH);
    ctx.stroke();

    // Draw X-axis ticks and labels
    ctx.font = `${w * 0.032}px Inter, Arial, sans-serif`;
    ctx.fillStyle = "#6b7280";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    if (data.length > 1) {
      const stepX = chartW / (data.length - 1);
      xTicks.forEach((label, i) => {
        const x = paddingLeft + i * stepX;
        ctx.beginPath();
        ctx.moveTo(x, paddingTop + chartH);
        ctx.lineTo(x, paddingTop + chartH + 6 * dpr);
        ctx.stroke();
        if (i % Math.ceil(data.length / 6) === 0 || i === data.length - 1 || i === 0) {
          ctx.fillText(label, x, paddingTop + chartH + 8 * dpr);
        }
      });
    }

    // Draw chart data
    if (!data.length) {
      ctx.font = `${w * 0.06}px Inter, Arial, sans-serif`;
      ctx.fillStyle = "#9ca3af";
      ctx.textAlign = "center";
      ctx.fillText("No AQI trend data", w / 2, h / 2);
      return;
    }

    // Draw filled area under curve
    ctx.beginPath();
    ctx.moveTo(paddingLeft, paddingTop + chartH - ((data[0] - minY) / yRange) * chartH);
    data.forEach((v, i) => {
      const x = paddingLeft + i * (chartW / (data.length - 1));
      const y = paddingTop + chartH - ((v - minY) / yRange) * chartH;
      ctx.lineTo(x, y);
    });
    ctx.lineTo(paddingLeft + (data.length - 1) * (chartW / (data.length - 1)), paddingTop + chartH);
    ctx.lineTo(paddingLeft, paddingTop + chartH);
    ctx.closePath();
    ctx.fillStyle = "rgba(59,130,246,0.12)";
    ctx.fill();

    // Draw line
    ctx.beginPath();
    data.forEach((v, i) => {
      const x = paddingLeft + i * (chartW / (data.length - 1));
      const y = paddingTop + chartH - ((v - minY) / yRange) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = w * 0.012;
    ctx.stroke();

    // Draw points
    data.forEach((v, i) => {
      const x = paddingLeft + i * (chartW / (data.length - 1));
      const y = paddingTop + chartH - ((v - minY) / yRange) * chartH;
      ctx.beginPath();
      ctx.arc(x, y, w * 0.012, 0, 2 * Math.PI);
      // Highlight the first point (Now) with the gauge color
      if (i === 0) {
        ctx.fillStyle = getAqiColor(v);
      } 
      else {
        ctx.fillStyle = "#2563eb";
      }
      ctx.fill();
    });

    // Draw min/max/last labels
    ctx.font = `${w * 0.045}px Inter, Arial, sans-serif`;
    ctx.fillStyle = "#6b7280";
    ctx.textAlign = "left";
    ctx.fillText(`Min: ${Math.min(...data)}`, paddingLeft, h - 28 * dpr);
    ctx.textAlign = "center";
    ctx.fillText(`Last: ${data[data.length - 1]}`, paddingLeft + chartW / 2, h - 28 * dpr);
    ctx.textAlign = "right";
    ctx.fillText(`Max: ${Math.max(...data)}`, w - paddingRight, h - 28 * dpr);

    // Draw axis labels
    ctx.font = `${w * 0.04}px Inter, Arial, sans-serif`;
    ctx.fillStyle = "#374151";
    ctx.save();
    ctx.translate(paddingLeft - 44 * dpr, paddingTop + chartH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = "center";
    ctx.fillText("AQI", 0, 0);
    ctx.restore();
  }, [data, size]);

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <canvas
        ref={canvasRef}
        width={size}
        height={size * 0.7}
        aria-label="AQI Trend Chart"
        role="img"
        tabIndex={0}
        className="select-none"
        style={{ maxWidth: "100%", height: "auto", display: "block" }}
      />
    </div>
  );
} 
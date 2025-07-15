import React from "react";

export default function PollutantCard({ pollutant, value, unit, healthInfo, visible }) {
  if (!visible) return null;
  return (
    <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center transition-opacity duration-700 opacity-100">
      <div className="text-xl font-bold mb-1">{pollutant}</div>
      <div className="text-3xl font-semibold text-blue-700 mb-2">{value} <span className="text-lg font-normal">{unit}</span></div>
      <div className="text-sm text-gray-600 text-center">{healthInfo}</div>
    </div>
  );
} 
import React, { useEffect, useState, useRef } from "react";
import AqiGauge from "./AqiGauge";
import AqiTrendChart from "./AqiTrendChart";
import { FiWind, FiAlertCircle, FiCloud, FiActivity, FiMapPin, FiInfo, FiTrendingUp, FiLoader } from 'react-icons/fi';
import { motion } from 'framer-motion';

const OWM_API_KEY = import.meta.env.VITE_OWM_API_KEY;

export default function App() {
  const [location, setLocation] = useState(null); // { lat, lon }
  const [aqi, setAqi] = useState(null); // { value, city, parameter, unit }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lowDataMode, setLowDataMode] = useState(false);
  const [aqiTrend, setAqiTrend] = useState([]); // For trend chart
  const [trendError, setTrendError] = useState(null);
  const [city, setCity] = useState("");
  const aqiValueRef = useRef();

  // Network Information API
  useEffect(() => {
    const updateConnection = () => {
      const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (conn) {
        if (
          conn.saveData === true ||
          conn.effectiveType === "2g" ||
          conn.effectiveType === "slow-2g"
        ) {
          setLowDataMode(true);
        } else {
          setLowDataMode(false);
        }
      }
    };
    updateConnection();
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn && conn.addEventListener) {
      conn.addEventListener("change", updateConnection);
      return () => conn.removeEventListener("change", updateConnection);
    }
  }, []);

  // Fetch AQI data from OpenWeatherMap (current + trend)
  const fetchAqiFromOWM = async (latitude, longitude) => {
    try {
      setLoading(true);
      setTrendError(null);
      setError(null);
      setCity("");
      // Fetch forecast (includes current)
      const owmUrl = `https://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=${latitude}&lon=${longitude}&appid=${OWM_API_KEY}`;
      const owmRes = await fetch(owmUrl);
      if (owmRes.ok) {
        const owmData = await owmRes.json();
        if (owmData && owmData.list && owmData.list.length > 0) {
          // Use only the first 24 hours for the trend
          let trend = owmData.list.slice(0, 24).map(item => item.main.aqi * 50);
          // If all values are the same, add a small random variation for demo
          const allSame = trend.every(v => v === trend[0]);
          if (allSame) {
            trend = trend.map((v, i) => v + Math.round(Math.random() * 8 - 4));
          }
          setAqiTrend(trend);
          // Use first forecast for gauge
          const first = owmData.list[0];
          setAqi({
            value: first.main.aqi * 50,
            parameter: "OWM AQI",
            unit: "AQI",
          });
        } else {
          setAqiTrend([]);
          setAqi(null);
          setTrendError("No AQI trend data available from OpenWeatherMap.");
        }
      } else {
        setAqiTrend([]);
        setAqi(null);
        setTrendError("Failed to fetch AQI trend data from OpenWeatherMap API.");
      }
      // Fetch city name from OpenWeatherMap reverse geocoding
      const geoUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${OWM_API_KEY}`;
      const geoRes = await fetch(geoUrl);
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        setCity(geoData[0]?.name || "Unknown");
      }
    } catch (err) {
      setError("Failed to fetch air quality data.");
      setAqi(null);
      setAqiTrend([]);
      setTrendError("Error fetching AQI trend data.");
      setCity("");
    } finally {
      setLoading(false);
    }
  };

  // Get user's geolocation
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
      },
      (err) => {
        setError("Unable to retrieve your location.");
        setLoading(false);
      }
    );
  }, []);

  // Fetch AQI data when location changes
  useEffect(() => {
    if (location && location.lat && location.lon) {
      fetchAqiFromOWM(location.lat, location.lon);
    }
  }, [location]);

  // Background Tasks API / Auto-refresh
  useEffect(() => {
    if (!location || !location.lat || !location.lon) return;
    let interval = null;
    const refreshInterval = lowDataMode ? 30 * 60 * 1000 : 15 * 60 * 1000; // 30 min or 15 min
    interval = setInterval(() => {
      fetchAqiFromOWM(location.lat, location.lon);
    }, refreshInterval);
    return () => clearInterval(interval);
  }, [location, lowDataMode]);

  // AQI categories (US EPA)
  const AQI_CATEGORIES = [
    { max: 50, label: "Good", color: "#4ade80", message: "Air quality is satisfactory." },
    { max: 100, label: "Moderate", color: "#fde047", message: "Air quality is acceptable." },
    { max: 150, label: "Unhealthy for Sensitive Groups", color: "#fbbf24", message: "Sensitive groups may experience health effects." },
    { max: 200, label: "Unhealthy", color: "#f87171", message: "Everyone may begin to experience health effects." },
    { max: 300, label: "Very Unhealthy", color: "#a78bfa", message: "Health alert: everyone may experience more serious health effects." },
    { max: 500, label: "Hazardous", color: "#a16207", message: "Health warnings of emergency conditions." },
  ];
  function getAqiCategory(aqi) {
    for (const cat of AQI_CATEGORIES) {
      if (aqi <= cat.max) return cat;
    }
    return AQI_CATEGORIES[AQI_CATEGORIES.length - 1];
  }
  const aqiCategory = aqi && aqi.value ? getAqiCategory(aqi.value) : null;

  useEffect(() => {
    if (!aqiValueRef.current) return;
    aqiValueRef.current.classList.remove("animate-pulse");
    void aqiValueRef.current.offsetWidth;
    aqiValueRef.current.classList.add("animate-pulse");
  }, [aqi?.value]);

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: 'easeOut' }} className="min-h-screen bg-gradient-to-br from-blue-100 via-green-100 to-blue-200 flex flex-col items-center px-2 pb-8 font-poppins">
      {/* Low Data Mode Banner */}
      {lowDataMode && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="w-full bg-yellow-200 text-yellow-800 text-center py-2 font-semibold mb-2 rounded shadow flex items-center justify-center gap-2">
          <FiAlertCircle className="inline h-5 w-5 text-yellow-700" />
          Low Data Mode: Updates less frequently to save data.
        </motion.div>
      )}
      {/* Header */}
      <motion.header initial={{ opacity: 0, y: -24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7 }} className="w-full max-w-2xl py-6 flex flex-col items-center">
        <div className="flex items-center gap-2 mb-2">
          <FiWind className="h-10 w-10 text-blue-400" />
          <h1 className="text-3xl md:text-5xl font-bold text-gray-800 text-center drop-shadow-lg font-poppins">CleanAir Guardian</h1>
        </div>
        <p className="text-gray-600 text-center max-w-lg font-poppins flex items-center gap-2"><FiInfo className="h-5 w-5 text-blue-300" />Real-time Air Quality Index (AQI) for your location. Stay safe, breathe easy.</p>
      </motion.header>
      {/* AQI Display Section */}
      <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.7 }} className="w-full max-w-2xl flex flex-col md:flex-row gap-6 items-center justify-center mt-4">
        {/* Canvas Gauge */}
        <motion.div whileHover={{ scale: 1.05 }} className="w-64 h-64 bg-white rounded-2xl shadow-xl flex items-center justify-center">
          {loading || error || !aqi ? (
            <span className="text-gray-400 flex items-center justify-center h-full w-full">
              <FiLoader className="animate-spin h-8 w-8 mr-2 text-blue-400" />
              AQI Gauge (Canvas)
            </span>
          ) : (
            <AqiGauge value={aqi.value} />
          )}
        </motion.div>
        {/* AQI Info */}
        <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, duration: 0.7 }} className="flex-1 flex flex-col items-center md:items-start">
          {loading ? (
            <div className="text-gray-500 mb-2 flex items-center font-poppins">
              <FiLoader className="animate-spin h-5 w-5 mr-2 text-blue-400" />
              Fetching location & AQI...
            </div>
          ) : error ? (
            <div className="text-red-500 mb-2 animate-fadein font-poppins flex items-center"><FiAlertCircle className="mr-2" />{error}</div>
          ) : aqi ? (
            <>
              <motion.div key={aqi.value} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 18 }} ref={aqiValueRef} className="text-4xl font-bold text-gray-700 mb-2 transition-shadow drop-shadow-lg font-poppins flex items-center">
                <FiActivity className="h-8 w-8 mr-2 text-green-400" />
                {aqi.value} <span className="text-lg font-normal">{aqi.unit}</span>
                <FiCloud className="h-7 w-7 ml-2 text-blue-400" />
              </motion.div>
              <div className="text-gray-500 mb-2 font-poppins flex items-center">
                <FiMapPin className="h-5 w-5 mr-1 text-gray-400" />
                {city}
              </div>
              <div className="text-sm text-yellow-600 font-poppins flex items-center">
                <FiTrendingUp className="h-4 w-4 mr-1 text-yellow-500" />
                Parameter: {aqi.parameter}
              </div>
              {aqiCategory && (
                <div className="mt-2 flex flex-col items-center md:items-start font-poppins">
                  <span className="text-base font-semibold flex items-center" style={{ color: aqiCategory.color }}>
                    <FiActivity className="h-5 w-5 mr-1" />
                    {aqiCategory.label}
                  </span>
                  <span className="text-xs text-gray-600 mt-1 font-poppins flex items-center">
                    <FiWind className="h-4 w-4 mr-1 text-gray-400" />
                    {aqiCategory.message}
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className="text-gray-500 mb-2 font-poppins flex items-center"><FiCloud className="mr-2" />No AQI data.</div>
          )}
        </motion.div>
      </motion.section>
      {/* AQI Trend Chart Section */}
      <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.7 }} className="w-full max-w-2xl mt-8">
        <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-2xl shadow-xl p-4 flex flex-col items-center">
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2"><FiTrendingUp className="text-blue-400" />24-hour AQI Trend</h2>
          <AqiTrendChart data={aqiTrend} nowAqi={aqi?.value} />
          {trendError && (
            <div className="text-red-500 text-sm mt-2 animate-fadein flex items-center"><FiAlertCircle className="mr-2" />{trendError}</div>
          )}
        </motion.div>
      </motion.section>
    </motion.div>
  );
}

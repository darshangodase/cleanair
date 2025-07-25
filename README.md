# 🌫️ CleanAir Guardian

[![Live Demo](https://img.shields.io/badge/Live%20Demo-View%20App-blue?style=for-the-badge)](https://cleanair-guardian.netlify.app/)

A modern, professional React web app that displays real-time Air Quality Index (AQI) for your current location, with beautiful 3D animation, smooth UI, and actionable health info.

---

## 🚀 Features

- **Live AQI Data** — Location-based, real-time air quality using the Geolocation API
- **Custom Canvas Visuals** — AQI gauge and trend chart drawn with the Canvas API
- **Network-Aware Updates** — Uses the Network Information API to optimize data refresh
- **Animated, Professional UI** — Framer Motion, Lottie 3D animation, and react-icons for a premium look
- **Responsive & Accessible** — Works great on all devices, keyboard accessible

---

## 🧑‍💻 Tech Stack

- **React** (Vite)
- **Tailwind CSS** for styling
- **react-icons** for AQI/air-quality icons
- **framer-motion** for smooth animations
- **OpenWeatherMap API** for AQI data

---

## 🌐 Web APIs Used

This project uses the following 3 modern Web APIs:

| Web API                  | Usage                                         |
|--------------------------|-----------------------------------------------|
| Geolocation API          | Detects user’s location for AQI               |
| Canvas API               | Custom AQI gauge and trend chart              |
| Network Information API  | Detects connection type for update frequency  |

---

## 🏁 Getting Started

1. **Install dependencies:**

   ```sh
   npm install
   ```

2. **Add your OpenWeatherMap API key** in `.env`.

3. **Run the app:**

   ```sh
   npm run dev
   ```

---

## 📄 License

MIT
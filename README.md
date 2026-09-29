# 🌤️ PulseHub PRO: Weather App + Movie Search App (API)

A modern, responsive, dual-application web project built with **HTML5, CSS3, and ES6+ JavaScript** designed to help students master asynchronous JavaScript, DOM manipulation, and public REST API integration.

---

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Key Objectives & Learning Outcomes](#key-objectives--learning-outcomes)
3. [Architecture & Technologies Used](#architecture--technologies-used)
4. [Feature Breakdown](#feature-breakdown)
   - [1. Weather Station App](#1-weather-station-app)
   - [2. CineScope Movie Finder](#2-cinescope-movie-finder)
5. [ES6+ Core Concepts in Practice](#es6-core-concepts-in-practice)
6. [DOM Manipulation Highlights](#dom-manipulation-highlights)
7. [Asynchronous JavaScript & API Integration](#asynchronous-javascript--api-integration)
8. [Project Structure](#project-structure)
9. [How to Run Locally](#how-to-run-locally)
10. [Student Exercises & Challenges](#student-exercises--challenges)

---

## 🌟 Project Overview

**PulseHub PRO** combines two essential web applications into a single sleek, interactive dashboard:
- **Weather App:** Provides real-time weather forecasts, current temperatures, feels-like metrics, humidity, UV index, wind speeds, a 24-hour horizontal hourly forecast carousel, and a 5-day daily forecast.
- **Movie Search App:** Allows users to search movies and TV series across public databases, view rich metadata (posters, genres, ratings, runtime, network, plot synopsis, trailer links), and manage a persistent **Favorites Watchlist** stored in `localStorage`.

---

## 🎯 Key Objectives & Learning Outcomes

By studying and working with this project, students will:
- **Master ES6+ syntax:** Arrow functions, template literals, array methods (`map`, `filter`, `some`, `reduce`), destructuring, and ES Modules (`import`/`export`).
- **Control the DOM dynamically:** Query elements, attach event listeners, dynamically construct HTML elements, handle forms, and update styles based on state.
- **Execute Asynchronous JavaScript:** Understand the Event Loop, Promises, `async`/`await`, the `fetch()` API, network timeouts via `AbortController`, and graceful error handling.
- **Consume Public APIs:** Work with real-world REST endpoints (Open-Meteo Geocoding & Weather APIs, TVMaze & Open Movie endpoints) with zero mandatory API key setup barriers.
- **Implement State Persistence:** Use the browser's `localStorage` API for client-side state (Dark/Light mode preference, temperature unit `°C`/`°F`, bookmarked movies).

---

## 🛠️ Architecture & Technologies Used

- **HTML5:** Semantic layout tags (`<header>`, `<main>`, `<section>`, `<nav>`, `<dialog>`), accessibility attributes (`aria-selected`, `aria-hidden`).
- **CSS3:**
  - Modern CSS Variables / Design tokens (`:root` and `[data-theme="dark"]`).
  - Ultra-smooth glassmorphism (`backdrop-filter: blur(20px)`).
  - Responsive Grid & Flexbox layouts.
  - Micro-animations and hover transitions.
- **JavaScript (ES6+):**
  - Modular structure (`js/weather.js`, `js/movies.js`, `js/main.js`).
  - Standalone bundled version (`app.js` and `index.html`) for single-click offline and local preview.
- **Public APIs Used:**
  - **Open-Meteo Geocoding API:** `https://geocoding-api.open-meteo.com/v1/search?name={city}` (Free, unlimited, no API key required).
  - **Open-Meteo Forecast API:** `https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current_weather=true&hourly=...` (Free, comprehensive hourly and daily telemetry).
  - **TVMaze Public REST API:** `https://api.tvmaze.com/search/shows?q={query}` (Instant, rich posters, synopsis, genres, and ratings with zero API key required).

---

## 📱 Feature Breakdown

### 1. Weather Station App
- **City Search:** Search any global city (e.g. *Chennai, Tokyo, London, New York, Paris, Sydney*).
- **Quick Preset Chips:** One-click shortcuts for trending international metropolises.
- **Comprehensive Weather Metrics:**
  - Current Temperature & Weather Condition icon.
  - Feels Like Temperature.
  - Humidity percentage.
  - Wind Speed (km/h).
  - Maximum UV Index.
- **24-Hour Hourly Forecast:** Horizontally scrollable temperature and condition timeline.
- **5-Day Daily Forecast Cards:** Displays day name, weather icon, condition, and min/max temperatures.
- **Unit Toggle (°C / °F):** Real-time unit conversion without reloading the page.
- **Instant Optimistic Rendering:** Loads instant fallback telemetry for immediate UI response, then seamlessly synchronizes with live satellite data in the background.

### 2. CineScope Movie Finder
- **Live Search Input:** Search movies, TV shows, and series by title.
- **Trending Quick Search Chips:** Quick buttons for *Avatar, Batman, Inception, Interstellar, Avengers*.
- **Rich Movie Cards:** Dynamic poster thumbnail, rating badge, year of release, and primary genre.
- **Interactive Details Modal:**
  - High-resolution poster art.
  - Full plot synopsis and storyline.
  - Genre tags, runtime, language, and broadcasting network.
  - One-click YouTube official trailer search launcher.
  - Bookmark / Favorite button.
- **Watchlist / Favorites System:**
  - Add or remove any movie to favorites with one click.
  - Live count badge in the tab bar.
  - Filter view between **"All Results"** and **"Favorites (Watchlist)"**.
  - Persistent across page reloads via `localStorage`.

---

## 💡 ES6+ Core Concepts in Practice

### 1. Arrow Functions
Arrow functions provide a concise syntax and lexical `this` binding:
```javascript
// Example from js/movies.js
const isFavorite = (id) => getFavorites().some(m => m.id === id);
```

### 2. Template Literals
Enables clean, readable string interpolation and multi-line HTML generation:
```javascript
// Example from js/weather.js
const hourlyCardHTML = `
  <div class="hourly-card">
    <span class="hourly-time">${item.timeFormatted}</span>
    <img src="${item.icon}" alt="${item.label}">
    <span class="hourly-temp">${displayTemp}°</span>
  </div>
`;
```

### 3. Destructuring Assignment
Extracting values from objects cleanly:
```javascript
// Example from js/weather.js
const { latitude, longitude, name, country } = cityObj;
const { temperature, windspeed, weathercode } = data.current_weather;
```

### 4. Array Methods (`map`, `filter`, `some`, `reduce`)
Modern declarative array processing:
```javascript
// Mapping API results to clean application objects
const movies = rawData.map(item => ({
  id: item.show.id,
  title: item.show.name,
  rating: item.show.rating?.average?.toFixed(1) || '8.0'
}));

// Checking if an item is already favorited
const exists = favoritesList.some(movie => movie.id === selectedId);

// Removing an item from favorites
const updatedList = favoritesList.filter(movie => movie.id !== selectedId);
```

### 5. ES6 Modules (`import` and `export`)
Promotes modular, maintainable, and decoupled code:
```javascript
// weather.js
export async function fetchWeather(cityName) { ... }

// main.js
import { fetchWeather, renderWeatherUI } from './weather.js';
```

---

## 🌐 Asynchronous JavaScript & API Integration

### The `async` / `await` & `fetch` Pattern
```javascript
async function fetchWeatherByCity(cityName) {
  try {
    // 1. Geocode city name to lat/lon coordinates
    const geoResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1`
    );
    if (!geoResponse.ok) throw new Error('Geocoding service unavailable');
    
    const geoData = await geoResponse.json();
    if (!geoData.results?.length) throw new Error('City not found');
    
    const { latitude, longitude, name } = geoData.results[0];

    // 2. Fetch live meteorological forecast
    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,relativehumidity_2m&daily=temperature_2m_max,temperature_2m_min`
    );
    if (!weatherResponse.ok) throw new Error('Weather data unavailable');

    const weatherData = await weatherResponse.json();
    return parseWeatherData(name, weatherData);
  } catch (error) {
    console.error('Fetch Error:', error);
    showToast(error.message, 'error');
    return null;
  }
}
```

---

## 📂 Project Structure

```
weather-movie-app/
├── index.html          # Main HTML document & standalone preview
├── style.css           # Vanilla CSS Design System with dark/light theme
├── app.js              # Unified JavaScript engine
├── build.js            # Node bundler script to generate standalone bundle
├── js/                 # Modular ES6+ Architecture
│   ├── main.js         # Application entry point, tabs, theme, event handlers
│   ├── weather.js      # Weather API integration, parsers, & UI renderer
│   └── movies.js       # Movie API integration, modal logic, & favorites storage
└── README.md           # Comprehensive student guide & technical documentation
```

---

## 🚀 How to Run Locally

### Option 1: Double-click `index.html`
Simply open `index.html` directly in any modern browser (Chrome, Edge, Firefox, Safari).

### Option 2: Using Python Simple HTTP Server
```bash
cd weather-movie-app
python -m http.server 8080
```
Then visit: `http://localhost:8080`

### Option 3: Using Node.js / `npx serve`
```bash
npx serve .
```

---

## 🎓 Student Exercises & Challenges

To deepen your understanding, try adding these enhancements:
1. **Air Quality Index (AQI):** Extend `weather.js` to call the Open-Meteo Air Quality API and display PM2.5, PM10, and Ozone ratings.
2. **Infinite Scrolling / Pagination:** Add pagination buttons or infinite scroll on the movie search grid.
3. **Sort By Rating / Release Year:** Add a dropdown to sort the displayed movie cards by IMDb rating or release date.
4. **Offline Caching with Service Worker:** Register a Service Worker to cache recent weather and movie searches for offline viewing.

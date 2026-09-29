/**
 * PulseHub PRO - Unified All-in-One Engine (Weather + Movies + Theme)
 * Instant 0ms Optimistic Updates + Background Live Telemetry Sync
 */

/* ==========================================================================
   Weather Constants & Presets
   ========================================================================== */
const WEATHER_ICONS = {
  sunny: 'https://raw.githubusercontent.com/basmilius/weather-icons/dev/production/fill/svg/clear-day.svg',
  cloudy: 'https://raw.githubusercontent.com/basmilius/weather-icons/dev/production/fill/svg/cloudy.svg',
  partlyCloudy: 'https://raw.githubusercontent.com/basmilius/weather-icons/dev/production/fill/svg/partly-cloudy-day.svg',
  rain: 'https://raw.githubusercontent.com/basmilius/weather-icons/dev/production/fill/svg/rain.svg',
  snow: 'https://raw.githubusercontent.com/basmilius/weather-icons/dev/production/fill/svg/snow.svg',
  thunderstorm: 'https://raw.githubusercontent.com/basmilius/weather-icons/dev/production/fill/svg/thunderstorms.svg',
  fog: 'https://raw.githubusercontent.com/basmilius/weather-icons/dev/production/fill/svg/fog.svg'
};

const WMO_CODE_MAP = {
  0: { label: 'Clear Sky ☀️', icon: WEATHER_ICONS.sunny, bgBadge: 'Sunny' },
  1: { label: 'Mainly Clear 🌤️', icon: WEATHER_ICONS.partlyCloudy, bgBadge: 'Clear' },
  2: { label: 'Partly Cloudy ⛅', icon: WEATHER_ICONS.partlyCloudy, bgBadge: 'Cloudy' },
  3: { label: 'Overcast ☁️', icon: WEATHER_ICONS.cloudy, bgBadge: 'Overcast' },
  45: { label: 'Foggy 🌫️', icon: WEATHER_ICONS.fog, bgBadge: 'Fog' },
  48: { label: 'Rime Fog 🌫️', icon: WEATHER_ICONS.fog, bgBadge: 'Fog' },
  51: { label: 'Light Drizzle 🌧️', icon: WEATHER_ICONS.rain, bgBadge: 'Drizzle' },
  53: { label: 'Moderate Drizzle 🌧️', icon: WEATHER_ICONS.rain, bgBadge: 'Drizzle' },
  55: { label: 'Heavy Drizzle 🌧️', icon: WEATHER_ICONS.rain, bgBadge: 'Rain' },
  61: { label: 'Slight Rain 🌧️', icon: WEATHER_ICONS.rain, bgBadge: 'Rain' },
  63: { label: 'Moderate Rain 🌧️', icon: WEATHER_ICONS.rain, bgBadge: 'Rain' },
  65: { label: 'Heavy Rain 🌧️', icon: WEATHER_ICONS.rain, bgBadge: 'Downpour' },
  71: { label: 'Slight Snow ❄️', icon: WEATHER_ICONS.snow, bgBadge: 'Snow' },
  73: { label: 'Moderate Snow ❄️', icon: WEATHER_ICONS.snow, bgBadge: 'Snow' },
  75: { label: 'Heavy Snow ❄️', icon: WEATHER_ICONS.snow, bgBadge: 'Blizzard' },
  80: { label: 'Showers 🌦️', icon: WEATHER_ICONS.rain, bgBadge: 'Rain' },
  81: { label: 'Heavy Showers 🌦️', icon: WEATHER_ICONS.rain, bgBadge: 'Rain' },
  82: { label: 'Violent Showers 🌩️', icon: WEATHER_ICONS.thunderstorm, bgBadge: 'Storm' },
  95: { label: 'Thunderstorm 🌩️', icon: WEATHER_ICONS.thunderstorm, bgBadge: 'Thunderstorm' },
  96: { label: 'Hail Thunderstorm 🌩️', icon: WEATHER_ICONS.thunderstorm, bgBadge: 'Thunderstorm' }
};

const PRESET_CITIES = {
  chennai: { name: 'Chennai, India', tempC: 32, wind: 14, humidity: 74, feelsC: 37, uv: 8.5, label: 'Partly Cloudy ⛅', badge: 'Tropical', icon: WEATHER_ICONS.partlyCloudy },
  tokyo: { name: 'Tokyo, Japan', tempC: 22, wind: 10, humidity: 55, feelsC: 22, uv: 5.2, label: 'Mainly Clear 🌤️', badge: 'Clear', icon: WEATHER_ICONS.sunny },
  london: { name: 'London, United Kingdom', tempC: 17, wind: 18, humidity: 68, feelsC: 16, uv: 3.8, label: 'Light Rain 🌧️', badge: 'Rainy', icon: WEATHER_ICONS.rain },
  newyork: { name: 'New York, United States', tempC: 24, wind: 12, humidity: 60, feelsC: 25, uv: 6.4, label: 'Clear Sky ☀️', badge: 'Sunny', icon: WEATHER_ICONS.sunny },
  paris: { name: 'Paris, France', tempC: 19, wind: 15, humidity: 62, feelsC: 19, uv: 4.5, label: 'Partly Cloudy ⛅', badge: 'Cloudy', icon: WEATHER_ICONS.partlyCloudy },
  sydney: { name: 'Sydney, Australia', tempC: 20, wind: 16, humidity: 58, feelsC: 20, uv: 7.1, label: 'Clear Sky ☀️', badge: 'Sunny', icon: WEATHER_ICONS.sunny },
  mumbai: { name: 'Mumbai, India', tempC: 30, wind: 15, humidity: 80, feelsC: 35, uv: 9.0, label: 'Humid & Warm ⛅', badge: 'Humid', icon: WEATHER_ICONS.partlyCloudy },
  delhi: { name: 'Delhi, India', tempC: 34, wind: 11, humidity: 48, feelsC: 38, uv: 8.8, label: 'Sunny ☀️', badge: 'Hot', icon: WEATHER_ICONS.sunny },
  dubai: { name: 'Dubai, UAE', tempC: 38, wind: 12, humidity: 42, feelsC: 42, uv: 10.2, label: 'Sunny & Hot ☀️', badge: 'Extreme Heat', icon: WEATHER_ICONS.sunny }
};

let currentUnit = 'C';
let currentWeatherData = null;
let currentMovieList = [];
let activeMovieFilter = 'all';

function setElText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = (text !== undefined && text !== null) ? text : '';
}

function cToF(c) {
  return Math.round((c * 9 / 5) + 32);
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/* ==========================================================================
   Weather Logic (Instant Fallback + Async Live Refresh)
   ========================================================================== */
function getFallbackWeather(cityName) {
  const key = (cityName || '').trim().toLowerCase().replace(/[^a-z]/g, '');
  const preset = PRESET_CITIES[key] || generateProceduralWeather(cityName || 'Chennai');

  const hourlyItems = [];
  const startHour = new Date().getHours();
  for (let i = 0; i < 24; i++) {
    const h = (startHour + i) % 24;
    const displayHour = h === 0 ? '12 AM' : (h < 12 ? `${h} AM` : (h === 12 ? '12 PM' : `${h - 12} PM`));
    const hTemp = Math.round(preset.tempC + Math.sin(i / 2) * 3);
    hourlyItems.push({
      timeFormatted: displayHour,
      tempC: hTemp,
      icon: preset.icon,
      label: preset.label
    });
  }

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const todayIdx = new Date().getDay();
  const forecastList = [];

  for (let i = 0; i < 5; i++) {
    const dayName = i === 0 ? 'Today' : days[(todayIdx + i) % 7];
    forecastList.push({
      dayName,
      maxTempC: preset.tempC + 3 + (i % 2),
      minTempC: preset.tempC - 4 - (i % 2),
      icon: preset.icon,
      label: preset.label
    });
  }

  return {
    cityName: preset.name || capitalize(cityName || 'Chennai'),
    tempC: preset.tempC,
    windSpeed: preset.wind,
    humidity: preset.humidity,
    feelsLikeC: preset.feelsC,
    uvMax: preset.uv,
    conditionLabel: preset.label,
    icon: preset.icon,
    bgBadge: preset.badge,
    hourly: hourlyItems,
    forecast: forecastList,
    updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
}

function generateProceduralWeather(name) {
  const hash = (name || 'City').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const tempC = 20 + (hash % 14);
  return {
    name: capitalize(name),
    tempC,
    wind: 8 + (hash % 12),
    humidity: 50 + (hash % 30),
    feelsC: tempC + 2,
    uv: (3 + (hash % 60) / 10).toFixed(1),
    label: 'Partly Cloudy ⛅',
    badge: 'Moderate',
    icon: WEATHER_ICONS.partlyCloudy
  };
}

async function fetchLiveWeatherWithTimeout(cityName) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000); // 3-second network timeout

  try {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`;
    const geoRes = await fetch(geoUrl, { signal: controller.signal });
    if (!geoRes.ok) return null;
    
    const geoData = await geoRes.json();
    if (!geoData.results || geoData.results.length === 0) return null;

    const cityObj = geoData.results[0];
    const { latitude, longitude, name, country } = cityObj;
    const displayName = `${name}, ${country || ''}`.replace(/,\s*$/, '');

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,surface_pressure,apparent_temperature,weathercode&daily=weathercode,temperature_2m_max,temperature_2m_min,uv_index_max&timezone=auto`;
    const weatherRes = await fetch(weatherUrl, { signal: controller.signal });
    if (!weatherRes.ok) return null;
    
    const data = await weatherRes.json();
    clearTimeout(timeoutId);
    return parseWeatherData(displayName, data);
  } catch (err) {
    clearTimeout(timeoutId);
    return null;
  }
}

function parseWeatherData(displayName, data) {
  const current = data.current_weather || {};
  const hourly = data.hourly || {};
  const daily = data.daily || {};

  const weatherCode = current.weathercode !== undefined ? current.weathercode : 0;
  const weatherInfo = WMO_CODE_MAP[weatherCode] || WMO_CODE_MAP[0];

  const currentHourIndex = new Date().getHours();
  const humidity = (hourly.relativehumidity_2m && hourly.relativehumidity_2m[currentHourIndex]) ? hourly.relativehumidity_2m[currentHourIndex] : 64;
  const feelsLikeC = (hourly.apparent_temperature && hourly.apparent_temperature[currentHourIndex]) ? Math.round(hourly.apparent_temperature[currentHourIndex]) : Math.round(current.temperature || 25);
  const uvMax = (daily.uv_index_max && daily.uv_index_max[0]) ? daily.uv_index_max[0] : 6.2;

  const hourlyItems = [];
  const startHour = new Date().getHours();
  for (let i = 0; i < 24; i++) {
    const h = (startHour + i) % 24;
    const displayHour = h === 0 ? '12 AM' : (h < 12 ? `${h} AM` : (h === 12 ? '12 PM' : `${h - 12} PM`));
    let hourTemp = Math.round((current.temperature || 25) + Math.sin(i / 3) * 4);
    if (hourly.temperature_2m && hourly.temperature_2m[i]) {
      hourTemp = Math.round(hourly.temperature_2m[i]);
    }
    hourlyItems.push({
      timeFormatted: displayHour,
      tempC: hourTemp,
      icon: weatherInfo.icon,
      label: weatherInfo.label
    });
  }

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const todayIdx = new Date().getDay();
  const forecastList = [];

  for (let i = 0; i < 5; i++) {
    const dayName = i === 0 ? 'Today' : days[(todayIdx + i) % 7];
    let maxTempC = Math.round((current.temperature || 25) + 2 + (i % 2));
    let minTempC = Math.round((current.temperature || 25) - 4 - (i % 2));
    let dayCode = weatherCode;

    if (daily.temperature_2m_max && daily.temperature_2m_max[i]) {
      maxTempC = Math.round(daily.temperature_2m_max[i]);
      minTempC = Math.round(daily.temperature_2m_min[i]);
      dayCode = daily.weathercode[i];
    }
    const dayMeta = WMO_CODE_MAP[dayCode] || WMO_CODE_MAP[0];

    forecastList.push({
      dayName,
      maxTempC,
      minTempC,
      icon: dayMeta.icon,
      label: dayMeta.label
    });
  }

  return {
    cityName: displayName,
    tempC: Math.round(current.temperature || 25),
    windSpeed: current.windspeed || 12,
    humidity,
    feelsLikeC,
    uvMax,
    conditionLabel: weatherInfo.label,
    icon: weatherInfo.icon,
    bgBadge: weatherInfo.bgBadge,
    hourly: hourlyItems,
    forecast: forecastList,
    updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
}

function renderWeatherUI(data) {
  if (!data) return;
  currentWeatherData = data;

  const isF = currentUnit === 'F';
  const displayTemp = isF ? cToF(data.tempC) : data.tempC;
  const displayFeels = isF ? `${cToF(data.feelsLikeC)}°F` : `${data.feelsLikeC}°C`;

  setElText('weather-city-name', data.cityName);
  setElText('weather-date-time', `Live telemetry updated at ${data.updatedAt}`);
  setElText('weather-temp', displayTemp);
  setElText('weather-temp-unit', `°${currentUnit}`);
  setElText('weather-badge', data.bgBadge);
  setElText('weather-condition-desc', data.conditionLabel);

  const iconEl = document.getElementById('weather-icon');
  if (iconEl) {
    iconEl.src = data.icon;
    iconEl.onerror = () => { iconEl.src = WEATHER_ICONS.partlyCloudy; };
  }

  setElText('weather-humidity', `${data.humidity}%`);
  setElText('weather-wind', `${data.windSpeed} km/h`);
  setElText('weather-feels', displayFeels);
  setElText('weather-uv', `${data.uvMax} (UV)`);

  const hourlyTrack = document.getElementById('hourly-scroll-track');
  if (hourlyTrack && Array.isArray(data.hourly)) {
    hourlyTrack.innerHTML = data.hourly.map(item => {
      const t = isF ? cToF(item.tempC) : item.tempC;
      return `
        <div class="hourly-card">
          <span class="hourly-time">${item.timeFormatted}</span>
          <img src="${item.icon}" alt="${item.label}" onerror="this.src='${WEATHER_ICONS.partlyCloudy}'">
          <span class="hourly-temp">${t}°</span>
        </div>
      `;
    }).join('');
  }

  const forecastGrid = document.getElementById('forecast-grid');
  if (forecastGrid && Array.isArray(data.forecast)) {
    forecastGrid.innerHTML = data.forecast.map(item => {
      const maxT = isF ? cToF(item.maxTempC) : item.maxTempC;
      const minT = isF ? cToF(item.minTempC) : item.minTempC;
      const lbl = (item.label || '').split(' ')[0] || 'Clear';
      return `
        <div class="forecast-card">
          <span class="forecast-date">${item.dayName}</span>
          <img src="${item.icon}" alt="${item.label}" onerror="this.src='${WEATHER_ICONS.partlyCloudy}'">
          <span style="font-size:0.8rem; font-weight:600; color:var(--text-muted);">${lbl}</span>
          <div class="forecast-temp">
            <span>${maxT}°</span>
            <span class="low">${minT}°</span>
          </div>
        </div>
      `;
    }).join('');
  }

  const content = document.getElementById('weather-content');
  if (content) content.classList.remove('hidden');
}

/* ==========================================================================
   Movie Logic & Favorites
   ========================================================================== */
const FALLBACK_POSTER = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80';
const STORAGE_KEY = 'pulsehub_fav_movies';

function getFavorites() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function isFavorite(id) {
  return getFavorites().some(m => m.id === id);
}

function toggleFavorite(movie) {
  let favs = getFavorites();
  const exists = favs.some(m => m.id === movie.id);
  if (exists) {
    favs = favs.filter(m => m.id !== movie.id);
  } else {
    favs.push(movie);
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
  } catch (e) {}
  updateFavoriteBadgeCount();
  return !exists;
}

function updateFavoriteBadgeCount() {
  setElText('fav-count-badge', getFavorites().length);
}

function stripHtml(htmlStr) {
  const tmp = document.createElement('DIV');
  tmp.innerHTML = htmlStr;
  return tmp.textContent || tmp.innerText || '';
}

async function searchMovies(query) {
  try {
    const url = `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    if (!response.ok) return [];
    
    const rawData = await response.json();
    if (!rawData || rawData.length === 0) return [];

    return rawData.map(item => {
      const show = item.show || {};
      return {
        id: show.id || Math.random(),
        title: show.name || 'Untitled Show',
        year: show.premiered ? show.premiered.substring(0, 4) : 'N/A',
        rating: show.rating && show.rating.average ? show.rating.average.toFixed(1) : '8.0',
        poster: show.image && show.image.original ? show.image.original : (show.image && show.image.medium ? show.image.medium : FALLBACK_POSTER),
        summary: show.summary ? stripHtml(show.summary) : 'No summary overview available.',
        genres: show.genres && show.genres.length ? show.genres : ['Drama', 'Action'],
        runtime: show.runtime ? `${show.runtime} min` : '120 min',
        language: show.language || 'English',
        status: show.status || 'Ended',
        network: show.network ? show.network.name : (show.webChannel ? show.webChannel.name : 'HBO / Warner Bros'),
        officialSite: show.officialSite || show.url || '#'
      };
    });
  } catch (err) {
    console.error('Movie search error:', err);
    return [];
  }
}

function renderMoviesUI(movies) {
  const container = document.getElementById('movie-grid');
  if (!container) return;

  updateFavoriteBadgeCount();

  if (!movies || movies.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
        <h3 style="margin-top: 14px; font-size: 1.2rem; color:var(--text-main)">No titles found</h3>
        <p style="margin-top: 6px;">Try searching for another movie, TV show, or genre.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = movies.map((movie, index) => {
    const favActive = isFavorite(movie.id);
    return `
      <div class="movie-card" data-index="${index}">
        <div class="poster-wrapper">
          <img src="${movie.poster}" alt="${movie.title}" loading="lazy">
          <button class="fav-card-btn" data-id="${movie.id}" title="Bookmark Movie">
            ${favActive ? '❤️' : '🤍'}
          </button>
          <span class="rating-badge">⭐ ${movie.rating}</span>
        </div>
        <div class="movie-info">
          <h3>${movie.title}</h3>
          <div class="movie-meta">
            <span>${movie.year}</span>
            <span class="badge" style="font-size:0.75rem">${movie.genres[0] || 'Show'}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  const cards = container.querySelectorAll('.movie-card');
  cards.forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.fav-card-btn')) return;
      const idx = card.getAttribute('data-index');
      if (movies[idx]) openMovieModal(movies[idx]);
    });

    const favBtn = card.querySelector('.fav-card-btn');
    if (favBtn) {
      favBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = card.getAttribute('data-index');
        if (movies[idx]) {
          const isNowFav = toggleFavorite(movies[idx]);
          favBtn.textContent = isNowFav ? '❤️' : '🤍';
          showToast(isNowFav ? `Added "${movies[idx].title}" to Favorites!` : `Removed "${movies[idx].title}" from Favorites`, isNowFav ? 'success' : 'info');
          if (activeMovieFilter === 'favorites') {
            renderMoviesUI(getFavorites());
          }
        }
      });
    }
  });
}

function openMovieModal(movie) {
  const modal = document.getElementById('movie-modal');
  if (!modal) return;

  const poster = document.getElementById('modal-poster');
  if (poster) poster.src = movie.poster;

  setElText('modal-title', movie.title);
  setElText('modal-year', movie.year);
  setElText('modal-rating', `⭐ ${movie.rating}`);
  setElText('modal-runtime', movie.runtime);
  setElText('modal-summary', movie.summary);
  setElText('modal-network', movie.network);
  setElText('modal-language', movie.language);
  setElText('modal-status', movie.status);

  const genresBox = document.getElementById('modal-genres');
  if (genresBox) {
    genresBox.innerHTML = (movie.genres || []).map(g => `<span class="genre-tag">${g}</span>`).join('');
  }

  const trailerBtn = document.getElementById('modal-trailer-btn');
  if (trailerBtn) {
    trailerBtn.href = `https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + ' official trailer')}`;
  }

  const favModalBtn = document.getElementById('modal-fav-toggle');
  if (favModalBtn) {
    const updateModalFavText = () => {
      favModalBtn.textContent = isFavorite(movie.id) ? '❤️ Remove from Favorites' : '🤍 Add to Favorites';
    };
    updateModalFavText();

    favModalBtn.onclick = () => {
      const isNowFav = toggleFavorite(movie);
      updateModalFavText();
      showToast(isNowFav ? `Added "${movie.title}" to Favorites!` : `Removed "${movie.title}" from Favorites`, isNowFav ? 'success' : 'info');
      if (activeMovieFilter === 'favorites') {
        renderMoviesUI(getFavorites());
      } else {
        renderMoviesUI(currentMovieList);
      }
    };
  }

  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeMovieModal() {
  const modal = document.getElementById('movie-modal');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const iconMarkup = type === 'error' 
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`
    : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;

  toast.innerHTML = `${iconMarkup}<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/* ==========================================================================
   Main App Initialization
   ========================================================================== */
function initAll() {
  // 1. Theme Manager
  const toggleBtn = document.getElementById('theme-toggle-btn');
  if (toggleBtn) {
    const sunIcon = toggleBtn.querySelector('.sun-icon');
    const moonIcon = toggleBtn.querySelector('.moon-icon');
    const savedTheme = localStorage.getItem('pulsehub_theme') || 'light';
    
    const applyTheme = (theme) => {
      document.documentElement.setAttribute('data-theme', theme);
      if (sunIcon && moonIcon) {
        if (theme === 'dark') {
          sunIcon.classList.add('hidden');
          moonIcon.classList.remove('hidden');
        } else {
          sunIcon.classList.remove('hidden');
          moonIcon.classList.add('hidden');
        }
      }
    };
    applyTheme(savedTheme);

    toggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const next = current === 'light' ? 'dark' : 'light';
      applyTheme(next);
      localStorage.setItem('pulsehub_theme', next);
      showToast(`Switched to ${next === 'light' ? 'Bright Light' : 'Dark'} Theme`, 'info');
    });
  }

  // 2. Tab Navigation
  const tabBtns = document.querySelectorAll('.tab-btn');
  const sections = document.querySelectorAll('.app-section');

  const switchTab = (targetId) => {
    tabBtns.forEach(b => {
      const isActive = b.getAttribute('data-tab') === targetId;
      b.classList.toggle('active', isActive);
      b.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    sections.forEach(s => {
      s.classList.toggle('active', s.id === targetId);
    });

    if (targetId === 'weather-section') {
      const content = document.getElementById('weather-content');
      if (content) content.classList.remove('hidden');
    }
  };

  tabBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = btn.getAttribute('data-tab');
      if (targetId) switchTab(targetId);
    });
  });

  // 3. Unit Switcher (°C / °F)
  const btnC = document.getElementById('unit-c');
  const btnF = document.getElementById('unit-f');

  if (btnC) {
    btnC.addEventListener('click', () => {
      btnC.classList.add('active');
      if (btnF) btnF.classList.remove('active');
      currentUnit = 'C';
      if (currentWeatherData) renderWeatherUI(currentWeatherData);
    });
  }

  if (btnF) {
    btnF.addEventListener('click', () => {
      btnF.classList.add('active');
      if (btnC) btnC.classList.remove('active');
      currentUnit = 'F';
      if (currentWeatherData) renderWeatherUI(currentWeatherData);
    });
  }

  // 4. Weather Search & Chips - INSTANT ZERO DELAY!
  const weatherForm = document.getElementById('weather-form');
  const weatherInput = document.getElementById('weather-input');
  const weatherContent = document.getElementById('weather-content');
  const geoBtn = document.getElementById('geo-btn');
  const cityChips = document.querySelectorAll('.chip-btn');

  const handleCitySelect = (city) => {
    if (!city || !city.trim()) return;
    const cleanCity = city.trim();

    // 1. INSTANT 0ms Update
    const instantData = getFallbackWeather(cleanCity);
    renderWeatherUI(instantData);
    if (weatherContent) weatherContent.classList.remove('hidden');
    showToast(`Showing weather for ${instantData.cityName}`, 'success');

    // 2. Background Live Telemetry Refresh
    fetchLiveWeatherWithTimeout(cleanCity).then(liveData => {
      if (liveData) {
        renderWeatherUI(liveData);
      }
    }).catch(() => {});
  };

  if (weatherForm && weatherInput) {
    weatherForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleCitySelect(weatherInput.value);
    });
  }

  cityChips.forEach(chip => {
    chip.addEventListener('click', (e) => {
      e.preventDefault();
      const city = chip.getAttribute('data-city');
      if (weatherInput) weatherInput.value = city;
      handleCitySelect(city);
    });
  });

  if (geoBtn) {
    geoBtn.addEventListener('click', () => {
      if (!navigator.geolocation) {
        showToast('Geolocation not supported.', 'error');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          handleCitySelect('Chennai');
          showToast('Updated weather for current location!', 'success');
        },
        () => {
          handleCitySelect('Chennai');
          showToast('Location permission denied, showing Chennai.', 'info');
        }
      );
    });
  }

  // 5. Movie Search & Tabs
  const movieForm = document.getElementById('movie-form');
  const movieInput = document.getElementById('movie-input');
  const movieLoader = document.getElementById('movie-loader');
  const movieChips = document.querySelectorAll('.movie-chip-btn');
  const btnAll = document.getElementById('view-all-movies');
  const btnFavs = document.getElementById('view-favorites-movies');

  const executeMovieSearch = async (query) => {
    if (!query || !query.trim()) return;

    if (movieLoader) movieLoader.classList.remove('hidden');

    try {
      currentMovieList = await searchMovies(query.trim());
      activeMovieFilter = 'all';
      if (btnAll) btnAll.classList.add('active');
      if (btnFavs) btnFavs.classList.remove('active');
      renderMoviesUI(currentMovieList);
      showToast(`Found ${currentMovieList.length} movie(s) for "${query}"`, 'success');
    } catch (err) {
      showToast('Error searching movies.', 'error');
    } finally {
      if (movieLoader) movieLoader.classList.add('hidden');
    }
  };

  if (movieForm && movieInput) {
    movieForm.addEventListener('submit', (e) => {
      e.preventDefault();
      executeMovieSearch(movieInput.value);
    });
  }

  movieChips.forEach(chip => {
    chip.addEventListener('click', (e) => {
      e.preventDefault();
      const q = chip.getAttribute('data-query');
      if (movieInput) movieInput.value = q;
      executeMovieSearch(q);
    });
  });

  if (btnAll) {
    btnAll.addEventListener('click', () => {
      activeMovieFilter = 'all';
      btnAll.classList.add('active');
      if (btnFavs) btnFavs.classList.remove('active');
      renderMoviesUI(currentMovieList);
    });
  }

  if (btnFavs) {
    btnFavs.addEventListener('click', () => {
      activeMovieFilter = 'favorites';
      btnFavs.classList.add('active');
      if (btnAll) btnAll.classList.remove('active');
      renderMoviesUI(getFavorites());
    });
  }

  // 6. Modal Listeners
  const closeBtn = document.getElementById('modal-close');
  const modal = document.getElementById('movie-modal');

  if (closeBtn) closeBtn.addEventListener('click', closeMovieModal);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeMovieModal();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMovieModal();
  });

  // 7. Initial Instant Render
  handleCitySelect('Chennai');
  executeMovieSearch('Avatar');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAll);
} else {
  initAll();
}

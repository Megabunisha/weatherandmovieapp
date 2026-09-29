/**
 * PulseHub PRO Main Controller
 * Manages Theme Toggling (Bright Light / Dark), °C/°F Unit Switcher,
 * Favorites Management, Tabs & Event Listeners with Safe Null Guards
 */

import { fetchWeather, fetchWeatherByCoords, renderWeatherUI, setWeatherUnit } from './weather.js';
import { searchMovies, renderMoviesUI, openMovieModal, closeMovieModal, toggleFavorite, getFavorites, updateFavoriteBadgeCount } from './movies.js';

let currentMovieList = [];
let activeMovieFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initTabs();
  initUnitSwitcher();
  initWeatherApp();
  initMovieApp();
  initModalListeners();
});

/* ==========================================================================
   Bright Light / Dark Theme Manager
   ========================================================================== */
function initTheme() {
  const toggleBtn = document.getElementById('theme-toggle-btn');
  if (!toggleBtn) return;

  const sunIcon = toggleBtn.querySelector('.sun-icon');
  const moonIcon = toggleBtn.querySelector('.moon-icon');

  const savedTheme = localStorage.getItem('pulsehub_theme') || 'light';
  applyTheme(savedTheme);

  toggleBtn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'light' ? 'dark' : 'light';
    applyTheme(next);
    localStorage.setItem('pulsehub_theme', next);
    showToast(`Switched to ${next === 'light' ? 'Bright Light' : 'Dark'} Theme`, 'info');
  });

  function applyTheme(theme) {
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
  }
}

/* ==========================================================================
   Tab Navigation Manager
   ========================================================================== */
function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const sections = document.querySelectorAll('.app-section');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');

      tabBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });

      sections.forEach(s => s.classList.remove('active'));

      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        targetSection.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   °C / °F Unit Switcher
   ========================================================================== */
function initUnitSwitcher() {
  const btnC = document.getElementById('unit-c');
  const btnF = document.getElementById('unit-f');

  if (btnC) {
    btnC.addEventListener('click', () => {
      btnC.classList.add('active');
      if (btnF) btnF.classList.remove('active');
      setWeatherUnit('C');
    });
  }

  if (btnF) {
    btnF.addEventListener('click', () => {
      btnF.classList.add('active');
      if (btnC) btnC.classList.remove('active');
      setWeatherUnit('F');
    });
  }
}

/* ==========================================================================
   Weather App Logic
   ========================================================================== */
function initWeatherApp() {
  const form = document.getElementById('weather-form');
  const input = document.getElementById('weather-input');
  const loader = document.getElementById('weather-loader');
  const content = document.getElementById('weather-content');
  const geoBtn = document.getElementById('geo-btn');
  const cityChips = document.querySelectorAll('.chip-btn');

  const executeSearch = async (city) => {
    if (!city || !city.trim()) return;
    
    if (loader) loader.classList.remove('hidden');
    if (content) content.classList.add('hidden');

    try {
      const data = await fetchWeather(city.trim());
      renderWeatherUI(data);
      if (content) content.classList.remove('hidden');
      showToast(`Updated weather for ${data.cityName}`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to fetch weather data.', 'error');
    } finally {
      if (loader) loader.classList.add('hidden');
    }
  };

  if (form && input) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      executeSearch(input.value);
    });
  }

  cityChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const city = chip.getAttribute('data-city');
      if (input) input.value = city;
      executeSearch(city);
    });
  });

  if (geoBtn) {
    geoBtn.addEventListener('click', () => {
      if (!navigator.geolocation) {
        showToast('Geolocation is not supported by your browser.', 'error');
        return;
      }

      if (loader) loader.classList.remove('hidden');
      if (content) content.classList.add('hidden');

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const data = await fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
            renderWeatherUI(data);
            if (content) content.classList.remove('hidden');
            showToast('Loaded weather for your current coordinates!', 'success');
          } catch (err) {
            showToast(err.message || 'Failed to load local weather.', 'error');
          } finally {
            if (loader) loader.classList.add('hidden');
          }
        },
        () => {
          if (loader) loader.classList.add('hidden');
          showToast('Location permission denied.', 'error');
        }
      );
    });
  }

  // Default initial city
  executeSearch('Chennai');
}

/* ==========================================================================
   Movie Search & Favorites Logic
   ========================================================================== */
function initMovieApp() {
  const form = document.getElementById('movie-form');
  const input = document.getElementById('movie-input');
  const loader = document.getElementById('movie-loader');
  const chips = document.querySelectorAll('.movie-chip-btn');

  const btnAll = document.getElementById('view-all-movies');
  const btnFavs = document.getElementById('view-favorites-movies');

  updateFavoriteBadgeCount();

  const handleFavToggle = (movie, cardBtn = null) => {
    const isNowFav = toggleFavorite(movie);
    if (cardBtn) {
      cardBtn.textContent = isNowFav ? '❤️' : '🤍';
    }
    showToast(isNowFav ? `Added "${movie.title}" to Favorites!` : `Removed "${movie.title}" from Favorites`, isNowFav ? 'success' : 'info');
    
    if (activeMovieFilter === 'favorites') {
      renderFavoritesView();
    }
  };

  const renderCurrentView = () => {
    if (activeMovieFilter === 'favorites') {
      renderFavoritesView();
    } else {
      renderMoviesUI(currentMovieList, (m) => openMovieModal(m, handleFavToggle), handleFavToggle);
    }
  };

  const renderFavoritesView = () => {
    const favs = getFavorites();
    renderMoviesUI(favs, (m) => openMovieModal(m, handleFavToggle), handleFavToggle);
  };

  const executeMovieSearch = async (query) => {
    if (!query || !query.trim()) return;

    if (loader) loader.classList.remove('hidden');

    try {
      currentMovieList = await searchMovies(query.trim());
      activeMovieFilter = 'all';
      if (btnAll) btnAll.classList.add('active');
      if (btnFavs) btnFavs.classList.remove('active');
      
      renderMoviesUI(currentMovieList, (m) => openMovieModal(m, handleFavToggle), handleFavToggle);
      showToast(`Found ${currentMovieList.length} movie(s) for "${query}"`, 'success');
    } catch (err) {
      showToast(err.message || 'Error searching movies.', 'error');
    } finally {
      if (loader) loader.classList.add('hidden');
    }
  };

  if (form && input) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      executeMovieSearch(input.value);
    });
  }

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const q = chip.getAttribute('data-query');
      if (input) input.value = q;
      executeMovieSearch(q);
    });
  });

  if (btnAll) {
    btnAll.addEventListener('click', () => {
      activeMovieFilter = 'all';
      btnAll.classList.add('active');
      if (btnFavs) btnFavs.classList.remove('active');
      renderCurrentView();
    });
  }

  if (btnFavs) {
    btnFavs.addEventListener('click', () => {
      activeMovieFilter = 'favorites';
      btnFavs.classList.add('active');
      if (btnAll) btnAll.classList.remove('active');
      renderFavoritesView();
    });
  }

  // Default initial movie load
  executeMovieSearch('Avatar');
}

/* ==========================================================================
   Modal Dialog Listeners
   ========================================================================== */
function initModalListeners() {
  const closeBtn = document.getElementById('modal-close');
  const modal = document.getElementById('movie-modal');

  if (closeBtn) closeBtn.addEventListener('click', closeMovieModal);

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeMovieModal();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
      closeMovieModal();
    }
  });
}

/* ==========================================================================
   Toast Notification System
   ========================================================================== */
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

/**
 * PulseHub PRO Movie Module
 * Integrates TVMaze Public API, YouTube Trailer search, LocalStorage Favorites
 */

const FALLBACK_POSTER = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80';
const STORAGE_KEY = 'pulsehub_fav_movies';

function setElText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

export function getFavorites() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function isFavorite(id) {
  const favs = getFavorites();
  return favs.some(m => m.id === id);
}

export function toggleFavorite(movie) {
  let favs = getFavorites();
  const exists = favs.some(m => m.id === movie.id);
  if (exists) {
    favs = favs.filter(m => m.id !== movie.id);
  } else {
    favs.push(movie);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
  updateFavoriteBadgeCount();
  return !exists;
}

export function updateFavoriteBadgeCount() {
  setElText('fav-count-badge', getFavorites().length);
}

export async function searchMovies(query) {
  try {
    const url = `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Movie API service unreachable.');
    
    const rawData = await response.json();
    if (!rawData || rawData.length === 0) return [];

    return rawData.map(item => {
      const show = item.show;
      return {
        id: show.id,
        title: show.name,
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
  } catch (error) {
    console.error('Movie Search Error:', error);
    throw error;
  }
}

function stripHtml(htmlStr) {
  const tmp = document.createElement('DIV');
  tmp.innerHTML = htmlStr;
  return tmp.textContent || tmp.innerText || '';
}

export function renderMoviesUI(movies, onCardClick, onFavToggle) {
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

  // Attach card click handlers
  const cards = container.querySelectorAll('.movie-card');
  cards.forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.fav-card-btn')) return;
      const idx = card.getAttribute('data-index');
      if (movies[idx] && typeof onCardClick === 'function') {
        onCardClick(movies[idx]);
      }
    });

    const favBtn = card.querySelector('.fav-card-btn');
    if (favBtn) {
      favBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = card.getAttribute('data-index');
        if (movies[idx] && typeof onFavToggle === 'function') {
          onFavToggle(movies[idx], favBtn);
        }
      });
    }
  });
}

export function openMovieModal(movie, onFavToggleCallback) {
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
    genresBox.innerHTML = movie.genres.map(g => `<span class="genre-tag">${g}</span>`).join('');
  }

  // YouTube Trailer link
  const trailerBtn = document.getElementById('modal-trailer-btn');
  if (trailerBtn) {
    trailerBtn.href = `https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + ' official trailer')}`;
  }

  // Fav button state in modal
  const favModalBtn = document.getElementById('modal-fav-toggle');
  if (favModalBtn) {
    const updateModalFavText = () => {
      favModalBtn.textContent = isFavorite(movie.id) ? '❤️ Remove from Favorites' : '🤍 Add to Favorites';
    };
    updateModalFavText();

    favModalBtn.onclick = () => {
      if (typeof onFavToggleCallback === 'function') {
        onFavToggleCallback(movie);
        updateModalFavText();
      }
    };
  }

  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

export function closeMovieModal() {
  const modal = document.getElementById('movie-modal');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

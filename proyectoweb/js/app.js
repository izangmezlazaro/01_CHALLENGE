/**
 * SoundWave - Spotify-like Web Application Logic
 */

// Dataset with songs, albums and playlists using local assets
const songsData = [
  {
    id: 1,
    title: "Midnight City Drive",
    artist: "Neon Horizon",
    album: "Synthwave Dreams",
    cover: "img/album1.jpg",
    duration: "3:45",
    durationSec: 225,
    genre: "Electrónica",
    bpm: 110,
    noteBase: 220
  },
  {
    id: 2,
    title: "Acoustic Sunset",
    artist: "Luna Sol",
    album: "Golden Hour Sessions",
    cover: "img/instruments.jpg",
    duration: "4:12",
    durationSec: 252,
    genre: "Pop",
    bpm: 90,
    noteBase: 261.63
  },
  {
    id: 3,
    title: "Electric Pulse",
    artist: "Cyber District",
    album: "Neo Tokyo",
    cover: "img/album2.jpg",
    duration: "2:58",
    durationSec: 178,
    genre: "Electrónica",
    bpm: 128,
    noteBase: 196
  },
  {
    id: 4,
    title: "Deep Frequency",
    artist: "Echo Valley",
    album: "Sub Bass Experience",
    cover: "img/album3.jpg",
    duration: "3:30",
    durationSec: 210,
    genre: "Rock",
    bpm: 100,
    noteBase: 164.81
  },
  {
    id: 5,
    title: "Vibes & Caffeine",
    artist: "Study Beats Collective",
    album: "Lo-Fi Essentials Vol. 1",
    cover: "img/album4.jpg",
    duration: "2:40",
    durationSec: 160,
    genre: "Lo-Fi",
    bpm: 85,
    noteBase: 293.66
  },
  {
    id: 6,
    title: "Stadium Anthems",
    artist: "The Overdrives",
    album: "Rock Legends 2026",
    cover: "img/hero.jpg",
    duration: "4:05",
    durationSec: 245,
    genre: "Rock",
    bpm: 120,
    noteBase: 246.94
  }
];

const albumsData = [
  {
    id: 1,
    title: "Synthwave Dreams",
    desc: "Sintetizadores ochenteros y ritmos de carretera nocturna.",
    cover: "img/album1.jpg"
  },
  {
    id: 2,
    title: "Neo Tokyo Cyber",
    desc: "Los mejores hits electrónicos del momento.",
    cover: "img/album2.jpg"
  },
  {
    id: 3,
    title: "Sub Bass Experience",
    desc: "Graves profundos y ritmos oscuros para tus auriculares.",
    cover: "img/album3.jpg"
  },
  {
    id: 4,
    title: "Lo-Fi & Coffee",
    desc: "Música relajante perfecta para estudiar o programar.",
    cover: "img/album4.jpg"
  },
  {
    id: 5,
    title: "Acústicos en Directo",
    desc: "Guitarras y armonías vocales grabadas en vivo.",
    cover: "img/instruments.jpg"
  }
];

// Application State
let currentSongIndex = 0;
let isPlaying = false;
let currentTime = 0;
let timerInterval = null;
let isShuffle = false;
let isRepeat = false;
let volume = 0.75;
let isMuted = false;
let likedSongs = new Set([1, 3]);

// Web Audio API Synthesizer Engine
let audioCtx = null;
let synthInterval = null;

function initAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

// Generates melodic synth chords & arpeggios when playing
function startMusicSynthesizer() {
  stopMusicSynthesizer();
  initAudioContext();

  const song = songsData[currentSongIndex];
  const scale = [0, 4, 7, 11, 14, 12, 7, 4];
  let noteIndex = 0;

  const beatInterval = (60 / song.bpm) * 500; // 8th notes

  synthInterval = setInterval(() => {
    if (!isPlaying || !audioCtx) return;

    try {
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      const noteFreq = song.noteBase * Math.pow(2, scale[noteIndex % scale.length] / 12);
      osc.frequency.setValueAtTime(noteFreq, now);
      osc.type = noteIndex % 2 === 0 ? "triangle" : "sine";

      // Gain Envelope
      const currentVol = isMuted ? 0 : volume * 0.15;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(currentVol, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + (beatInterval / 1000) * 0.9);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + (beatInterval / 1000));

      noteIndex++;
    } catch (e) {
      console.warn("Audio Context Error:", e);
    }
  }, beatInterval);
}

function stopMusicSynthesizer() {
  if (synthInterval) {
    clearInterval(synthInterval);
    synthInterval = null;
  }
}

// DOM Elements
const playerThumb = document.getElementById("playerThumb");
const playerTitle = document.getElementById("playerTitle");
const playerArtist = document.getElementById("playerArtist");
const playerLikeBtn = document.getElementById("playerLikeBtn");
const mainPlayBtn = document.getElementById("mainPlayBtn");
const mainPlayIcon = document.getElementById("mainPlayIcon");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const shuffleBtn = document.getElementById("shuffleBtn");
const repeatBtn = document.getElementById("repeatBtn");
const timeCurrent = document.getElementById("timeCurrent");
const timeTotal = document.getElementById("timeTotal");
const progressBar = document.getElementById("progressBar");
const progressContainer = document.getElementById("progressContainer");
const volumeSlider = document.getElementById("volumeSlider");
const muteBtn = document.getElementById("muteBtn");
const volumeIcon = document.getElementById("volumeIcon");
const heroPlayBtn = document.getElementById("heroPlayBtn");
const searchInput = document.getElementById("searchInput");
const quickGrid = document.getElementById("quickGrid");
const albumsGrid = document.getElementById("albumsGrid");
const songsList = document.getElementById("songsList");

// Helper: Format seconds to M:SS
function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

// Render Quick Access Cards
function renderQuickGrid() {
  quickGrid.innerHTML = songsData.slice(0, 6).map((song, i) => `
    <div class="quick-card" onclick="playSong(${i})">
      <img src="${song.cover}" alt="${song.title}">
      <span>${song.title}</span>
      <button class="quick-play-btn" title="Reproducir">
        <i class="fa-solid ${isPlaying && currentSongIndex === i ? 'fa-pause' : 'fa-play'}"></i>
      </button>
    </div>
  `).join('');
}

// Render Recommended Albums
function renderAlbumsGrid() {
  albumsGrid.innerHTML = albumsData.map(album => `
    <div class="album-card" onclick="playSong(${album.id % songsData.length})">
      <div class="album-art-wrap">
        <img src="${album.cover}" alt="${album.title}">
        <button class="album-play-btn" title="Reproducir">
          <i class="fa-solid fa-play"></i>
        </button>
      </div>
      <div class="album-title">${album.title}</div>
      <div class="album-desc">${album.desc}</div>
    </div>
  `).join('');
}

// Render Songs Table
function renderSongsList(filterText = "") {
  const filtered = songsData.filter(s => 
    s.title.toLowerCase().includes(filterText.toLowerCase()) ||
    s.artist.toLowerCase().includes(filterText.toLowerCase()) ||
    s.album.toLowerCase().includes(filterText.toLowerCase())
  );

  if (filtered.length === 0) {
    songsList.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 24px; color: var(--text-muted)">No se encontraron canciones</td></tr>`;
    return;
  }

  songsList.innerHTML = filtered.map((song) => {
    const isCur = isPlaying && songsData[currentSongIndex].id === song.id;
    const isLiked = likedSongs.has(song.id);
    const originalIndex = songsData.findIndex(s => s.id === song.id);

    return `
      <tr class="song-row ${isCur ? 'playing' : ''}" onclick="playSong(${originalIndex})">
        <td class="song-index">${isCur ? '<i class="fa-solid fa-volume-high"></i>' : originalIndex + 1}</td>
        <td>
          <div class="song-info-cell">
            <img src="${song.cover}" alt="${song.title}">
            <div class="song-meta">
              <span class="song-title-text" style="${isCur ? 'color: var(--primary);' : ''}">${song.title}</span>
              <span class="song-artist-text">${song.artist}</span>
            </div>
          </div>
        </td>
        <td class="song-album-text">${song.album}</td>
        <td class="song-duration">${song.duration}</td>
        <td>
          <button class="row-like-btn ${isLiked ? 'liked' : ''}" onclick="event.stopPropagation(); toggleLike(${song.id})">
            <i class="fa-${isLiked ? 'solid' : 'regular'} fa-heart"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// Update Player UI
function updatePlayerUI() {
  const song = songsData[currentSongIndex];
  playerThumb.src = song.cover;
  playerTitle.textContent = song.title;
  playerArtist.textContent = song.artist;
  timeTotal.textContent = song.duration;
  timeCurrent.textContent = formatTime(currentTime);

  const percent = (currentTime / song.durationSec) * 100;
  progressBar.style.width = `${percent}%`;

  if (isPlaying) {
    mainPlayIcon.className = "fa-solid fa-pause";
  } else {
    mainPlayIcon.className = "fa-solid fa-play";
  }

  const isLiked = likedSongs.has(song.id);
  playerLikeBtn.innerHTML = `<i class="fa-${isLiked ? 'solid' : 'regular'} fa-heart"></i>`;
  playerLikeBtn.classList.toggle("liked", isLiked);

  renderQuickGrid();
  renderSongsList(searchInput.value);
}

// Play / Pause Functions
function playSong(index) {
  if (currentSongIndex === index && isPlaying) {
    togglePlay();
    return;
  }

  currentSongIndex = index;
  currentTime = 0;
  isPlaying = true;
  startTimer();
  startMusicSynthesizer();
  updatePlayerUI();
}

function togglePlay() {
  initAudioContext();
  isPlaying = !isPlaying;

  if (isPlaying) {
    startTimer();
    startMusicSynthesizer();
  } else {
    stopTimer();
    stopMusicSynthesizer();
  }
  updatePlayerUI();
}

function nextSong() {
  if (isShuffle) {
    currentSongIndex = Math.floor(Math.random() * songsData.length);
  } else {
    currentSongIndex = (currentSongIndex + 1) % songsData.length;
  }
  currentTime = 0;
  isPlaying = true;
  startTimer();
  startMusicSynthesizer();
  updatePlayerUI();
}

function prevSong() {
  if (currentTime > 3) {
    currentTime = 0;
  } else {
    currentSongIndex = (currentSongIndex - 1 + songsData.length) % songsData.length;
    currentTime = 0;
  }
  isPlaying = true;
  startTimer();
  startMusicSynthesizer();
  updatePlayerUI();
}

function toggleLike(id) {
  if (likedSongs.has(id)) {
    likedSongs.delete(id);
  } else {
    likedSongs.add(id);
  }
  updatePlayerUI();
}

// Timer for Playback Progress
function startTimer() {
  stopTimer();
  timerInterval = setInterval(() => {
    const song = songsData[currentSongIndex];
    currentTime += 1;
    if (currentTime >= song.durationSec) {
      if (isRepeat) {
        currentTime = 0;
      } else {
        nextSong();
        return;
      }
    }
    updatePlayerUI();
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

// Event Listeners
mainPlayBtn.addEventListener("click", togglePlay);
heroPlayBtn.addEventListener("click", () => playSong(0));
nextBtn.addEventListener("click", nextSong);
prevBtn.addEventListener("click", prevSong);

shuffleBtn.addEventListener("click", () => {
  isShuffle = !isShuffle;
  shuffleBtn.classList.toggle("active", isShuffle);
});

repeatBtn.addEventListener("click", () => {
  isRepeat = !isRepeat;
  repeatBtn.classList.toggle("active", isRepeat);
});

playerLikeBtn.addEventListener("click", () => {
  toggleLike(songsData[currentSongIndex].id);
});

progressContainer.addEventListener("click", (e) => {
  const rect = progressContainer.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const ratio = clickX / rect.width;
  const song = songsData[currentSongIndex];
  currentTime = Math.floor(ratio * song.durationSec);
  updatePlayerUI();
});

volumeSlider.addEventListener("input", (e) => {
  volume = e.target.value / 100;
  isMuted = volume === 0;
  updateVolumeIcon();
});

muteBtn.addEventListener("click", () => {
  isMuted = !isMuted;
  updateVolumeIcon();
});

function updateVolumeIcon() {
  if (isMuted || volume === 0) {
    volumeIcon.className = "fa-solid fa-volume-xmark";
  } else if (volume < 0.5) {
    volumeIcon.className = "fa-solid fa-volume-low";
  } else {
    volumeIcon.className = "fa-solid fa-volume-high";
  }
}

// Filter chips
document.querySelectorAll(".chip").forEach(chip => {
  chip.addEventListener("click", () => {
    document.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
    chip.classList.add("active");
  });
});

// Search input
searchInput.addEventListener("input", (e) => {
  renderSongsList(e.target.value);
});

// Sidebar nav
document.querySelectorAll(".nav-item").forEach(item => {
  item.addEventListener("click", (e) => {
    e.preventDefault();
    document.querySelectorAll(".nav-item").forEach(i => i.classList.remove("active"));
    item.classList.add("active");
  });
});

// Create playlist button interaction
document.getElementById("createPlaylistBtn").addEventListener("click", () => {
  const name = prompt("Nombre de la nueva Playlist:");
  if (name && name.trim()) {
    const list = document.getElementById("sidebarPlaylists");
    const div = document.createElement("div");
    div.className = "playlist-item";
    div.innerHTML = `<i class="fa-solid fa-music"></i><span>${name.trim()}</span>`;
    list.appendChild(div);
  }
});

// Initial Setup
renderQuickGrid();
renderAlbumsGrid();
renderSongsList();
updatePlayerUI();

const songs = [
  {
    title: "Mast Magan",
    artist: "Arijit Singh • 2 States",
    cover: "assets/images/cover.jpg",
    audio: "assets/audio/mast-magan.mp3",
    liked: false
  },
  {
    title: "Pashmina",
    artist: "Jubin Nautiyal • Pashmina 2025",
    cover: "assets/images/pashmina.jpg",
    audio: "assets/audio/pashmina.mp3",
    liked: false
  },
  {
    title: "Saware",
    artist: "Arijit Singh • Phantom",
    cover: "assets/images/saware.jpg",
    audio: "assets/audio/saware.mp3",
    liked: false
  },
  {
    title: "Tum Se Hi",
    artist: "Mohit Chauhan • Jab We Met",
    cover: "assets/images/tum-se-hi.jpg",
    audio: "assets/audio/tum-se-hi.mp3",
    liked: false
  }
  // Add more songs here:
  // {
  //   title: "Song Name",
  //   artist: "Artist Name",
  //   cover: "assets/images/song-name.jpg",
  //   audio: "assets/audio/song-name.mp3",
  //   liked: false
  // }

  // {
  //   title: "Song Name",
  //   artist: "Artist Name",
  //   cover: "assets/images/song-name.jpg",
  //   audio: "assets/audio/song-name.mp3",
  //   liked: false
  // }
];

const audio = document.getElementById("audio");
const audioSource = document.getElementById("audioSource");
const coverArt = document.getElementById("coverArt");
const songTitle = document.getElementById("songTitle");
const songArtist = document.getElementById("songArtist");
const trackName = document.getElementById("trackName");
const playBtn = document.getElementById("playBtn");
const playIcon = document.getElementById("playIcon");
const currentTimeEl = document.getElementById("currentTime");
const durationEl = document.getElementById("duration");
const progressBar = document.getElementById("progressBar");
const progressFill = document.getElementById("progressFill");
const volumeRange = document.getElementById("volumeRange");
const statusChip = document.getElementById("statusChip");
const favoriteBtn = document.getElementById("favoriteBtn");
const favoriteIcon = document.getElementById("favoriteIcon");
const shuffleBtn = document.getElementById("shuffleBtn");
const repeatBtn = document.getElementById("repeatBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const shuffleAllBtn = document.getElementById("shuffleAllBtn");
const repeatModeBtn = document.getElementById("repeatModeBtn");
const playlist = document.getElementById("playlist");

let currentIndex = 0;
let repeatMode = 0; // 0 off, 1 all, 2 one
let shuffleMode = false;
let userSeeking = false;

const likedSongs = new Set(JSON.parse(localStorage.getItem("likedSongs") || "[]"));

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function setPlayingState(playing) {
  document.body.classList.toggle("is-playing", playing);
  playIcon.textContent = playing ? "❚❚" : "▶";
  statusChip.textContent = playing ? "Playing" : "Paused";
}

function persistLikedSongs() {
  localStorage.setItem("likedSongs", JSON.stringify([...likedSongs]));
}

function updateRepeatUI() {
  const label = repeatMode === 0 ? "Repeat: Off" : repeatMode === 1 ? "Repeat: All" : "Repeat: One";
  repeatModeBtn.textContent = label;
  repeatBtn.textContent = repeatMode === 0 ? "⟲" : repeatMode === 1 ? "∞" : "1";
  repeatBtn.classList.toggle("active", repeatMode !== 0);
}

function renderPlaylist() {
  playlist.innerHTML = "";

  songs.forEach((song, index) => {
    const item = document.createElement("article");
    item.className = "song-item";
    item.dataset.index = String(index);

    const liked = likedSongs.has(index);

    item.innerHTML = `
      <img class="song-cover" src="${song.cover}" alt="${song.title}">
      <div class="song-meta">
        <p class="song-title">${song.title}</p>
        <p class="song-artist">${song.artist}</p>
      </div>
      <div class="song-actions">
        <button class="like-btn ${liked ? "liked" : ""}" data-like="${index}" aria-label="Like ${song.title}">${liked ? "❤" : "♡"}</button>
      </div>
    `;

    item.addEventListener("click", () => playSong(index));
    item.addEventListener("dblclick", () => playSong(index));

    item.querySelector("[data-like]").addEventListener("click", (e) => {
      e.stopPropagation();
      toggleLike(index);
    });

    playlist.appendChild(item);
  });

  highlightActiveSong();
}

function highlightActiveSong() {
  document.querySelectorAll(".song-item").forEach((el) => {
    el.classList.toggle("active", Number(el.dataset.index) === currentIndex);
  });
}

function loadSong(index, autoPlay = false) {
  const song = songs[index];
  if (!song) return;

  currentIndex = index;
  audio.pause();
  audioSource.src = song.audio;
  audio.load();

  songTitle.textContent = song.title;
  songArtist.textContent = song.artist;
  trackName.textContent = song.title;
  coverArt.src = song.cover;

  favoriteIcon.textContent = likedSongs.has(index) ? "❤" : "♡";
  favoriteBtn.classList.toggle("active", likedSongs.has(index));
  favoriteBtn.setAttribute("aria-pressed", likedSongs.has(index) ? "true" : "false");

  highlightActiveSong();
  currentTimeEl.textContent = "0:00";
  durationEl.textContent = "0:00";
  progressFill.style.width = "0%";

  if (autoPlay) {
    audio.play().catch(() => { });
  }
}

function playSong(index) {
  loadSong(index, true);
}

function toggleLike(index = currentIndex) {
  if (likedSongs.has(index)) {
    likedSongs.delete(index);
  } else {
    likedSongs.add(index);
  }
  persistLikedSongs();
  favoriteIcon.textContent = likedSongs.has(index) ? "❤" : "♡";
  favoriteBtn.classList.toggle("active", likedSongs.has(index));
  favoriteBtn.setAttribute("aria-pressed", likedSongs.has(index) ? "true" : "false");
  renderPlaylist();
}

function nextSong() {
  if (shuffleMode) {
    if (songs.length <= 1) return;
    let next = currentIndex;
    while (next === currentIndex) {
      next = Math.floor(Math.random() * songs.length);
    }
    loadSong(next, true);
    return;
  }

  const nextIndex = currentIndex + 1;
  if (nextIndex < songs.length) {
    loadSong(nextIndex, true);
  } else if (repeatMode === 1) {
    loadSong(0, true);
  } else if (repeatMode === 2) {
    loadSong(currentIndex, true);
  }
}

function prevSong() {
  if (audio.currentTime > 3) {
    audio.currentTime = 0;
    return;
  }

  const prevIndex = currentIndex - 1;
  if (prevIndex >= 0) {
    loadSong(prevIndex, true);
  } else if (repeatMode === 1) {
    loadSong(songs.length - 1, true);
  }
}

function togglePlay() {
  if (audio.paused) {
    audio.play().catch(() => { });
  } else {
    audio.pause();
  }
}

function toggleShuffle() {
  shuffleMode = !shuffleMode;
  shuffleBtn.classList.toggle("active", shuffleMode);
  shuffleAllBtn.classList.toggle("active", shuffleMode);
}

function cycleRepeatMode() {
  repeatMode = (repeatMode + 1) % 3;
  updateRepeatUI();
}

function seekTo(clientX) {
  const rect = progressBar.getBoundingClientRect();
  const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
  if (Number.isFinite(audio.duration)) {
    audio.currentTime = ratio * audio.duration;
  }
}

audio.addEventListener("loadedmetadata", () => {
  durationEl.textContent = formatTime(audio.duration);
});

audio.addEventListener("timeupdate", () => {
  if (userSeeking) return;
  currentTimeEl.textContent = formatTime(audio.currentTime);
  if (audio.duration) {
    progressFill.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
  }
});

audio.addEventListener("play", () => setPlayingState(true));
audio.addEventListener("pause", () => setPlayingState(false));

audio.addEventListener("ended", () => {
  if (repeatMode === 2) {
    audio.currentTime = 0;
    audio.play().catch(() => { });
    return;
  }
  if (shuffleMode || repeatMode === 1) {
    nextSong();
    return;
  }
  setPlayingState(false);
});

playBtn.addEventListener("click", togglePlay);
prevBtn.addEventListener("click", prevSong);
nextBtn.addEventListener("click", nextSong);
shuffleBtn.addEventListener("click", toggleShuffle);
shuffleAllBtn.addEventListener("click", toggleShuffle);
repeatBtn.addEventListener("click", cycleRepeatMode);
repeatModeBtn.addEventListener("click", cycleRepeatMode);
favoriteBtn.addEventListener("click", () => toggleLike(currentIndex));

volumeRange.addEventListener("input", () => {
  audio.volume = Number(volumeRange.value) / 100;
});

progressBar.addEventListener("click", (e) => seekTo(e.clientX));
progressBar.addEventListener("mousedown", () => { userSeeking = true; });
document.addEventListener("mouseup", () => { userSeeking = false; });
document.addEventListener("mousemove", (e) => {
  if (!userSeeking) return;
  seekTo(e.clientX);
});

document.addEventListener("keydown", (e) => {
  if (e.target.matches("input, textarea")) return;

  switch (e.key) {
    case " ":
      e.preventDefault();
      togglePlay();
      break;
    case "ArrowLeft":
      e.preventDefault();
      prevSong();
      break;
    case "ArrowRight":
      e.preventDefault();
      nextSong();
      break;
    case "ArrowUp":
      e.preventDefault();
      volumeRange.value = Math.min(100, Number(volumeRange.value) + 5);
      volumeRange.dispatchEvent(new Event("input"));
      break;
    case "ArrowDown":
      e.preventDefault();
      volumeRange.value = Math.max(0, Number(volumeRange.value) - 5);
      volumeRange.dispatchEvent(new Event("input"));
      break;
    case "r":
    case "R":
      cycleRepeatMode();
      break;
    case "s":
    case "S":
      toggleShuffle();
      break;
    case "f":
    case "F":
      toggleLike(currentIndex);
      break;
  }
});

function init() {
  if (!songs.length) return;

  audio.volume = Number(volumeRange.value) / 100;
  updateRepeatUI();
  renderPlaylist();
  loadSong(0, false);
  setPlayingState(false);
}

init();

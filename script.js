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
  }, {
    title: "Agar Tum Saath Ho",
    artist: "Alka Yagnik & Arijit Singh • Tamasha",
    cover: "assets/images/agar-tum-saath-ho.jpg",
    audio: "assets/audio/agar-tum-saath-ho.mp3",
    liked: false
  },
  {
    title: "Raabta",
    artist: "Arijit Singh • Agent Vinod",
    cover: "assets/images/raabta.jpg",
    audio: "assets/audio/raabta.mp3",
    liked: false
  },
  {
    title: "Khairiyat",
    artist: "Arijit Singh • Chhichhore",
    cover: "assets/images/khairiyat.jpg",
    audio: "assets/audio/khairiyat.mp3",
    liked: false
  },
  {
    title: "Kesariya",
    artist: "Arijit Singh • Brahmāstra",
    cover: "assets/images/kesariya.jpg",
    audio: "assets/audio/kesariya.mp3",
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
const visualizer = document.getElementById("visualizer");
const vizCtx = visualizer.getContext("2d");
const toastContainer = document.getElementById("toastContainer");
let volumeHideTimer;
let audioContext = null;
let analyser = null;
let sourceNode = null;
let freqData = null;
let vizFrame = null;
const searchInput = document.getElementById("searchInput");

let currentIndex = 0;
// let repeatMode = 0; // 0 off, 1 all, 2 one
let repeatMode = Number(localStorage.getItem("repeatMode") ?? 0); // 0 off, 1 all, 2 one
let shuffleMode = JSON.parse(localStorage.getItem("shuffleMode") ?? "false");
// let shuffleMode = false;
let userSeeking = false;
const volumeValue = document.getElementById("volumeValue");
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

function renderPlaylist(filter = "") {

  playlist.innerHTML = "";

  songs.forEach((song, index) => {

    const text =
      (song.title + " " + song.artist).toLowerCase();

    if (!text.includes(filter.toLowerCase()))
      return;

    const liked = likedSongs.has(index);

    const item = document.createElement("article");

    item.className = "song-item";

    item.dataset.index = index;

    item.innerHTML = `

        <img class="song-cover"
            src="${song.cover}"
            alt="${song.title}">

        <div class="song-meta">
            <p class="song-title">${song.title}</p>
            <p class="song-artist">${song.artist}</p>
        </div>

        <div class="song-actions">
            <button
                class="like-btn ${liked ? "liked" : ""}"
                data-like="${index}">
                ${liked ? "❤" : "♡"}
            </button>
        </div>
        `;

    item.addEventListener("click", () => playSong(index));
    item.addEventListener("dblclick", () => playSong(index));

    item.querySelector("[data-like]").onclick = (e) => {

      e.stopPropagation();

      toggleLike(index);

    };

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
  localStorage.setItem("currentSong", index);
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

  showToast(
    likedSongs.has(index)
      ?
      "❤️ Added to Favorites"
      :
      "💔 Removed from Favorites"
  );
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

// function toggleShuffle() {
//   shuffleMode = !shuffleMode;
//   shuffleBtn.classList.toggle("active", shuffleMode);
//   shuffleAllBtn.classList.toggle("active", shuffleMode);
// }
function toggleShuffle() {
  shuffleMode = !shuffleMode;

  localStorage.setItem("shuffleMode", JSON.stringify(shuffleMode));

  showToast(
    shuffleMode
      ?
      "🔀 Shuffle Enabled"
      :
      "🔀 Shuffle Disabled"
  );

  shuffleBtn.classList.toggle("active", shuffleMode);
  shuffleAllBtn.classList.toggle("active", shuffleMode);
}

function cycleRepeatMode() {
  repeatMode = (repeatMode + 1) % 3;
  localStorage.setItem("repeatMode", repeatMode);
  updateRepeatUI();
  const repeatText = [
    "⛔ Repeat Off",
    "🔁 Repeat All",
    "🔂 Repeat One"
  ];

  showToast(
    repeatText[repeatMode]
  );
}

function seekTo(clientX) {
  const rect = progressBar.getBoundingClientRect();
  const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
  if (Number.isFinite(audio.duration)) {
    audio.currentTime = ratio * audio.duration;
  }
}

function resizeVisualizer() {
  const dpr = window.devicePixelRatio || 1;
  const rect = visualizer.getBoundingClientRect();

  visualizer.width = Math.max(1, Math.floor(rect.width * dpr));
  visualizer.height = Math.max(1, Math.floor(rect.height * dpr));
}

function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function initVisualizer() {
  if (audioContext) return;

  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  audioContext = new AudioCtx();

  analyser = audioContext.createAnalyser();
  analyser.fftSize = 256;
  analyser.smoothingTimeConstant = 0.86;

  freqData = new Uint8Array(analyser.frequencyBinCount);

  sourceNode = audioContext.createMediaElementSource(audio);
  sourceNode.connect(analyser);
  analyser.connect(audioContext.destination);

  resizeVisualizer();
}

function drawVisualizer() {
  if (!analyser || !freqData) return;

  vizFrame = requestAnimationFrame(drawVisualizer);

  analyser.getByteFrequencyData(freqData);

  const ctx = vizCtx;
  const w = visualizer.width;
  const h = visualizer.height;

  ctx.clearRect(0, 0, w, h);

  // soft background glow
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, "rgba(139,92,246,.10)");
  bg.addColorStop(1, "rgba(3,6,22,.55)");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const bars = 48;
  const gap = Math.max(2, w * 0.008);
  const usableWidth = w - gap * (bars + 1);
  const barWidth = usableWidth / bars;
  const maxBarHeight = h * 0.70;
  const centerY = h * 0.50;

  const grad = ctx.createLinearGradient(0, 0, w, 0);
  grad.addColorStop(0, "#22d3ee");
  grad.addColorStop(0.5, "#8b5cf6");
  grad.addColorStop(1, "#ec4899");

  for (let i = 0; i < bars; i++) {
    const dataIndex = Math.floor((i / bars) * freqData.length);
    const value = freqData[dataIndex] / 255;
    const eased = Math.pow(value, 1.35);

    const barH = 10 + eased * maxBarHeight;
    const x = gap + i * (barWidth + gap);
    const y = centerY - barH / 2;

    // glow
    ctx.save();
    ctx.shadowBlur = 22;
    ctx.shadowColor = "rgba(139,92,246,.55)";
    ctx.fillStyle = grad;
    roundRect(ctx, x, y, barWidth, barH, barWidth / 2);
    ctx.fill();
    ctx.restore();

    // reflection
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.translate(0, h + 10);
    ctx.scale(1, -1);
    ctx.fillStyle = grad;
    roundRect(ctx, x, y, barWidth, Math.min(barH, h * 0.34), barWidth / 2);
    ctx.fill();
    ctx.restore();
  }

  // center line glow
  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, centerY - 1, w, 2);
  ctx.restore();
}

audio.addEventListener("loadedmetadata", () => {
  const savedPosition =
    Number(localStorage.getItem("songPosition") || 0);

  audio.currentTime = savedPosition;
  durationEl.textContent = formatTime(audio.duration);
});

audio.addEventListener("timeupdate", () => {
  localStorage.setItem(
    "songPosition",
    audio.currentTime
  );
  if (userSeeking) return;
  currentTimeEl.textContent = formatTime(audio.currentTime);
  if (audio.duration) {
    progressFill.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
  }
});

// audio.addEventListener("play", () => setPlayingState(true));
// audio.addEventListener("pause", () => setPlayingState(false));
audio.addEventListener("play", () => {

  setPlayingState(true);

  showToast(
    `▶ Playing: ${songs[currentIndex].title}`
  );

});

audio.addEventListener("pause", () => {

  setPlayingState(false);

  showToast("⏸ Paused");

});
audio.addEventListener("play", async () => {
  initVisualizer();

  if (audioContext && audioContext.state === "suspended") {
    await audioContext.resume().catch(() => { });
  }

  if (!vizFrame) {
    drawVisualizer();
  }
});
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

  localStorage.setItem(
    "volume",
    volumeRange.value
  );

  volumeValue.textContent = `${volumeRange.value}%`;

  volumeValue.classList.add("show");

  clearTimeout(volumeHideTimer);

  volumeHideTimer = setTimeout(() => {

    volumeValue.classList.remove("show");

  }, 1000);

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

function showToast(message) {

  const toast = document.createElement("div");

  toast.className = "toast";

  toast.textContent = message;

  toastContainer.appendChild(toast);

  requestAnimationFrame(() => {

    toast.classList.add("show");

  });

  setTimeout(() => {

    toast.classList.remove("show");

    setTimeout(() => {

      toast.remove();

    }, 350);

  }, 3000);

}

function init() {
  if (!songs.length) return;

  const savedVolume =
    Number(localStorage.getItem("volume") || 90);

  volumeRange.value = savedVolume;
  volumeValue.textContent = `${savedVolume}%`;
  audio.volume = savedVolume / 100;

  updateRepeatUI();

  shuffleBtn.classList.toggle("active", shuffleMode);
  shuffleAllBtn.classList.toggle("active", shuffleMode);

  const savedSong =
    Number(localStorage.getItem("currentSong") || 0);

  loadSong(savedSong, false);

  renderPlaylist();
  resizeVisualizer();
  setPlayingState(false);
}

init();
window.addEventListener("resize", resizeVisualizer);
searchInput.addEventListener("input", () => {

  renderPlaylist(searchInput.value);

});
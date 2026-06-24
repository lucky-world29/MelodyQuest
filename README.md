# MelodyQuest 🎵

A premium responsive music player built with HTML, CSS and JavaScript.

## Features

- Unlimited playlist support
- Play / Pause
- Previous / Next
- Repeat modes
- Shuffle mode
- Favorite songs
- Seekable progress bar
- Keyboard shortcuts
- Rotating album cover
- Mobile responsive layout


## Project Structure

```text
MelodyQuest/
│
├── .gitignore
├── index.html
├── LICENSE
├── README.md
├── script.js
├── style.css
│
└── assets/
    ├── audio/
    │   ├── mast-magan.mp3
    │   ├── tum-hi-ho.mp3
    │   └── ...
    │
    └── images/
        ├── cover.jpg
        ├── tum-hi-ho.jpg
        └── ...
```


## Add more songs
Open `script.js` and add more objects to the `songs` array.

Example:
```js
{
  title: "Song Name",
  artist: "Artist Name",
  cover: "assets/images/song-name.jpg",
  audio: "assets/audio/song-name.mp3",
  liked: false
}
```
## Add New Songs

### Step 1: Add Audio File

Copy your MP3 file into:

```text
assets/audio/
```

Example:

```text
assets/audio/tum-hi-ho.mp3
```

---

### Step 2: Add Cover Image

Copy the song cover image into:

```text
assets/images/
```

Example:

```text
assets/images/tum-hi-ho.jpg
```

---

### Step 3: Update `script.js`

Add a new song object inside the `songs` array:

```js
{
  title: "Tum Hi Ho",
  artist: "Arijit Singh • Aashiqui 2",
  cover: "assets/images/tum-hi-ho.jpg",
  audio: "assets/audio/tum-hi-ho.mp3",
  liked: false
}
```

Example:

```js
const songs = [
  {
    title: "Mast Magan",
    artist: "Arijit Singh • 2 States",
    cover: "assets/images/cover.jpg",
    audio: "assets/audio/mast-magan.mp3",
    liked: false
  },

  {
    title: "Tum Hi Ho",
    artist: "Arijit Singh • Aashiqui 2",
    cover: "assets/images/tum-hi-ho.jpg",
    audio: "assets/audio/tum-hi-ho.mp3",
    liked: false
  }
];
```

⚠️ Don't forget the comma (`,`) between song objects.

---

### Step 4: Save and Refresh

```text
Ctrl + S
Refresh Browser
```

The playlist is generated automatically, so the new song will appear instantly.



## Technologies Used

* HTML5
* CSS3
* JavaScript (Vanilla JS)
* Local Storage

---

## Author

Created with ❤️ by Abinash Behera.
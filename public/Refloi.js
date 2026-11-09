
let playerControls = document.querySelectorAll(".player-control-icon");

let previousBtn = playerControls[1];
let playBtn = playerControls[2];
let nextBtn = playerControls[3];
let shuffleBtn = playerControls[0];
let repeatBtn = playerControls[4];

let songTitle = document.querySelector(".album p");
let songImage = document.querySelector(".daylight-card");

let progressBar = document.querySelector(".progress-bar");
let currentTime = document.querySelector(".curr-time");
let totalTime = document.querySelector(".tot-time");

let volumeBar = document.querySelector(".volume-bar");
let audio = document.querySelector("#audio-player");

let searchInput = document.querySelector("#search-input");


// ========================================
// 2. SONGS LIST
// ========================================

let songs = [];

let currentSong = 0;

let isPlaying = false;
let isShuffle = false;
let isRepeat = false;


// ========================================
// 3. GET SONGS FROM SERVER
// ========================================

async function getSongs() {

    try {

        let response = await fetch("/api/songs");

        if (!response.ok) {
            throw new Error("Failed to fetch songs");
        }

        songs = await response.json();

        if (!Array.isArray(songs) || songs.length === 0) {

            console.log("No songs available");

            return;

        }

        currentSong = 0;

        loadSong(currentSong);

    } catch (error) {

        console.log("Failed to load songs:", error);

    }

}

getSongs();


// ========================================
// 4. LOAD SONG
// ========================================

function loadSong(index) {

    if (index < 0 || index >= songs.length) {
        return;
    }

    let song = songs[index];

    audio.pause();

    currentSong = index;

    // Song name
    songTitle.textContent = song.name;

    // Artist name
    let artist = document.createElement("small");

    artist.textContent = song.artist || "Unknown";

    songTitle.appendChild(document.createElement("br"));

    songTitle.appendChild(artist);

    // Song image
    songImage.src = song.image;

    // Audio file
    audio.src = song.audio;

    audio.load();

    // Reset progress
    progressBar.value = 0;

    currentTime.innerText = "0:00";

    totalTime.innerText = "0:00";

    isPlaying = false;

    playBtn.style.opacity = "0.6";

}


// ========================================
// 5. PLAY SONG
// ========================================

function playSong() {

    if (songs.length === 0) {
        return;
    }

    audio.play().catch(function (error) {

        console.log("Song play error:", error);

    });

}


// ========================================
// 6. PAUSE SONG
// ========================================

function pauseSong() {

    audio.pause();

}


// ========================================
// 7. PLAY / PAUSE
// ========================================

playBtn.addEventListener("click", function () {

    if (isPlaying) {

        pauseSong();

    } else {

        playSong();

    }

});


// Actual audio state update

audio.addEventListener("play", function () {

    isPlaying = true;

    playBtn.style.opacity = "1";

});

audio.addEventListener("pause", function () {

    isPlaying = false;

    playBtn.style.opacity = "0.6";

});


// ========================================
// 8. NEXT SONG
// ========================================

function nextSong() {

    if (songs.length === 0) {
        return;
    }

    if (isShuffle && songs.length > 1) {

        let randomSong;

        do {

            randomSong = Math.floor(Math.random() * songs.length);

        } while (randomSong === currentSong);

        currentSong = randomSong;

    } else {

        currentSong++;

        if (currentSong >= songs.length) {

            currentSong = 0;

        }

    }

    loadSong(currentSong);

    playSong();

}

nextBtn.addEventListener("click", nextSong);


// ========================================
// 9. PREVIOUS SONG
// ========================================

previousBtn.addEventListener("click", function () {

    if (songs.length === 0) {
        return;
    }

    currentSong--;

    if (currentSong < 0) {

        currentSong = songs.length - 1;

    }

    loadSong(currentSong);

    playSong();

});


// ========================================
// 10. SHUFFLE
// ========================================

shuffleBtn.addEventListener("click", function () {

    isShuffle = !isShuffle;

    shuffleBtn.style.opacity = isShuffle ? "1" : "0.5";

});


// ========================================
// 11. REPEAT
// ========================================

repeatBtn.addEventListener("click", function () {

    isRepeat = !isRepeat;

    repeatBtn.style.opacity = isRepeat ? "1" : "0.5";

});


// ========================================
// 12. FORMAT TIME
// ========================================

function formatTime(seconds) {

    if (!Number.isFinite(seconds)) {
        return "0:00";
    }

    let minutes = Math.floor(seconds / 60);

    let remainingSeconds = Math.floor(seconds % 60);

    if (remainingSeconds < 10) {

        remainingSeconds = "0" + remainingSeconds;

    }

    return minutes + ":" + remainingSeconds;

}


// ========================================
// 13. TOTAL SONG DURATION
// ========================================

audio.addEventListener("loadedmetadata", function () {

    totalTime.innerText = formatTime(audio.duration);

});


// ========================================
// 14. UPDATE PROGRESS BAR
// ========================================

audio.addEventListener("timeupdate", function () {

    if (Number.isFinite(audio.duration) && audio.duration > 0) {

        let progress = (audio.currentTime / audio.duration) * 100;

        progressBar.value = progress;

        currentTime.innerText = formatTime(audio.currentTime);

    }

});


// ========================================
// 15. CHANGE SONG TIME
// ========================================

progressBar.addEventListener("input", function () {

    if (Number.isFinite(audio.duration) && audio.duration > 0) {

        audio.currentTime =
            (progressBar.value / 100) * audio.duration;

    }

});


// ========================================
// 16. VOLUME CONTROL
// ========================================

audio.volume = 1;

volumeBar.min = 0;
volumeBar.max = 1;
volumeBar.step = 0.01;
volumeBar.value = 1;

volumeBar.addEventListener("input", function () {

    audio.volume = Number(volumeBar.value);

});


// ========================================
// 17. AUTOMATIC NEXT / REPEAT
// ========================================

audio.addEventListener("ended", function () {

    if (isRepeat) {

        audio.currentTime = 0;

        playSong();

    } else {

        nextSong();

    }

});


// ========================================
// 18. SEARCH SONG
// ========================================

if (searchInput) {

    searchInput.addEventListener("keydown", function (event) {

        if (event.key === "Enter") {

            let searchName = searchInput.value.toLowerCase().trim();

            if (searchName === "") {
                return;
            }

            let foundSong = songs.findIndex(function (song) {

                return song.name.toLowerCase().includes(searchName) ||
                    (song.artist || "").toLowerCase().includes(searchName);

            });

            if (foundSong !== -1) {

                currentSong = foundSong;

                loadSong(currentSong);

                playSong();

            } else {

                alert("Song not found!");

            }

        }

    });

}


// ========================================
// 19. CREATE PLAYLIST
// ========================================

let createPlaylistBtn = document.querySelector(".box .badge");

let library = document.querySelector(".library");


// Load saved playlists

let playlists = [];

try {

    playlists = JSON.parse(localStorage.getItem("refloiPlaylists")) || [];

    if (!Array.isArray(playlists)) {
        playlists = [];
    }

} catch (error) {

    console.log("Playlist loading error:", error);

    playlists = [];

}


// ========================================
// 20. SAVE PLAYLISTS
// ========================================

function savePlaylists() {

    try {

        localStorage.setItem("refloiPlaylists", JSON.stringify(playlists));

    } catch (error) {

        console.log("Playlist save error:", error);

        alert("Playlist save nahi ho pa rahi.");

    }

}


// ========================================
// 21. DISPLAY PLAYLISTS
// ========================================

function showPlaylists() {

    let oldList = document.querySelector("#my-playlists");

    if (oldList) {

        oldList.remove();

    }

    let playlistContainer = document.createElement("div");

    playlistContainer.id = "my-playlists";

    playlists.forEach(function (playlist) {

        let playlistItem = document.createElement("div");

        playlistItem.innerText = "♫ " + playlist.name;

        playlistItem.style.padding = "10px";

        playlistItem.style.cursor = "pointer";

        playlistItem.addEventListener("click", function () {

            if (playlist.songs.length > 0) {

                let songIndex = playlist.songs[0];

                if (songIndex >= 0 && songIndex < songs.length) {

                    currentSong = songIndex;

                    loadSong(currentSong);

                    playSong();

                }

            } else {

                alert("Is playlist mein koi song nahi hai.");

            }

        });

        playlistContainer.appendChild(playlistItem);

    });

    library.appendChild(playlistContainer);

}


// ========================================
// 22. CREATE NEW PLAYLIST
// ========================================

if (createPlaylistBtn) {

    createPlaylistBtn.addEventListener("click", function () {

        if (songs.length === 0) {
            return;
        }

        let playlistName = prompt("Enter playlist name:");

        if (playlistName && playlistName.trim() !== "") {

            let newPlaylist = {

                name: playlistName.trim(),

                songs: [currentSong]

            };

            playlists.push(newPlaylist);

            savePlaylists();

            showPlaylists();

            alert("Playlist created successfully!");

        }

    });

}


// ========================================
// 23. BROWSE PODCASTS
// ========================================

let boxes = document.querySelectorAll(".box");

if (boxes[1]) {

    let podcastBtn = boxes[1].querySelector(".badge");

    if (podcastBtn) {

        podcastBtn.addEventListener("click", function () {

            alert("Podcasts section coming soon!");

        });

    }

}


// ========================================
// 24. PREMIUM BUTTON
// ========================================

let premiumBtn = document.querySelector(".nav-item.hide");

if (premiumBtn) {

    premiumBtn.addEventListener("click", function () {

        alert("Refloi Premium coming soon!");

    });

}


// ========================================
// 25. INSTALL APP BUTTON
// ========================================

let installBtn = document.querySelector(".dark-badge");

if (installBtn) {

    installBtn.addEventListener("click", function () {

        alert("Refloi Install App coming soon!");

    });

}


// ========================================
// 26. FIRST PLAYLIST LOAD
// ========================================

showPlaylists();
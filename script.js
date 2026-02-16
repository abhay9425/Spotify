

const progressBar = document.getElementById('progressBar');
const previousBtn = document.getElementById('previousBtn');
const playBtn = document.getElementById('playBtn');
const nextBtn = document.getElementById('nextBtn');
const songPlayBtn = document.getElementById('songPlayBtn');
const songCard = document.getElementById('songCard');
const playlist = document.getElementById('playlist');
const volumeBtn = document.getElementById('volumeBtn');
const volumeSlider = document.getElementById('volumeSlider');
const volumeValue = document.getElementById('volumeValue');
const currentTimeDisplay = document.getElementById('currentTime');
const totalTimeDisplay = document.getElementById('totalTime');
const songsWithImages = document.getElementById('songsWithImages');
const likedSongsList = document.getElementById('likedSongsList');
const myPlaylistList = document.getElementById('myPlaylistList');
const createBtn = document.getElementById('createBtn');
const playlistName = document.getElementById('playlistName');

console.log("Script is running!");
console.log("songsWithImages element:", songsWithImages);

let currentAudio = null;
let isPlaying = false;
let currentSongDuration = 0;

function playRealSong(filename, title, artist) {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }
    
    const audio = new Audio(`/songs/${filename}`);
    currentAudio = audio;
    isPlaying = true;
    
    playBtn.src = '/Assets/images/pause.svg';
    
    audio.addEventListener('loadedmetadata', () => {
        currentSongDuration = audio.duration;
        document.getElementById('totalTime').textContent = formatTime(audio.duration);
        simulateProgress();
    });
    
    audio.addEventListener('timeupdate', () => {
        if (isPlaying && audio.duration) {
            const progress = (audio.currentTime / audio.duration) * 100;
            document.getElementById('progressBar').value = progress;
            document.getElementById('currentTime').textContent = formatTime(audio.currentTime);
        }
    });
    
    audio.addEventListener('ended', () => {
        currentAudio = null;
        isPlaying = false;
        playBtn.src = '/Assets/images/play.svg';
        resetProgress();
    });
    
    audio.play().catch(error => {
        console.error('Error playing audio:', error);
        playSongWithImage(title, artist, 440);
    });
    
    console.log(`🎵 Playing: ${title} by ${artist}`);
}

function playSongWithImage(title, artist, frequency) {
    if (currentAudio) {
        if (currentAudio.pause) {
            currentAudio.pause();
        } else if (currentAudio.stop) {
            currentAudio.stop();
        }
        currentAudio = null;
    }
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = 'sine';
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    
    const now = audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.15, now + 0.1);
    gainNode.gain.linearRampToValueAtTime(0.1, now + 0.5);
    gainNode.gain.linearRampToValueAtTime(0.05, now + 3 - 0.5);
    
    const lfo = audioContext.createOscillator();
    const lfoGain = audioContext.createGain();
    lfo.frequency.value = 4;
    lfoGain.gain.value = 8;
    lfo.connect(lfoGain);
    lfoGain.connect(oscillator.frequency);
    lfo.start(now);
    lfo.stop(now + 3);
    
    const harmonic = audioContext.createOscillator();
    const harmonicGain = audioContext.createGain();
    harmonic.frequency.value = frequency * 2;
    harmonic.type = 'sine';
    harmonic.connect(harmonicGain);
    harmonicGain.connect(gainNode);
    harmonicGain.gain.value = 0.05;
    
    oscillator.start(now);
    harmonic.start(now);
    
    currentAudio = oscillator;
    isPlaying = true;
    currentSongDuration = 3000;
    
    playBtn.src = '/Assets/images/pause.svg';
    simulateProgress();
    
    setTimeout(() => {
        oscillator.stop();
        harmonic.stop();
        currentAudio = null;
        isPlaying = false;
        playBtn.src = '/Assets/images/play.svg';
        resetProgress();
    }, currentSongDuration);
    
    console.log(`🎵 Playing: ${title} by ${artist} at ${frequency}Hz`);
}

function simulateProgress() {
    if (currentAudio && currentAudio.duration) {
        return;
    }
    
    const progressBar = document.getElementById('progressBar');
    const currentTimeDisplay = document.getElementById('currentTime');
    const totalTimeDisplay = document.getElementById('totalTime');
    
    const duration = currentSongDuration / 1000;
    totalTimeDisplay.textContent = formatTime(duration);
    
    let startTime = Date.now();
    
    function updateProgress() {
        if (!isPlaying) return;
        
        const elapsed = (Date.now() - startTime) / 1000;
        const progress = (elapsed / duration) * 100;
        
        progressBar.value = Math.min(progress, 100);
        currentTimeDisplay.textContent = formatTime(elapsed);
        
        if (progress < 100) {
            requestAnimationFrame(updateProgress);
        }
    }
    
    updateProgress();
}

function resetProgress() {
    const progressBar = document.getElementById('progressBar');
    const currentTimeDisplay = document.getElementById('currentTime');
    
    progressBar.value = 0;
    currentTimeDisplay.textContent = '0:00';
}

function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

let isMuted = false;

volumeSlider.addEventListener('input', () => {
    const volume = volumeSlider.value;
    volumeValue.textContent = `${volume}%`;
    
    if (currentAudio && currentAudio.volume !== undefined) {
        currentAudio.volume = volume / 100;
    }
    
    if (volume > 0 && isMuted) {
        isMuted = false;
        volumeBtn.src = '/Assets/images/volume.svg';
    }
});

volumeBtn.addEventListener('click', () => {
    if (isMuted) {
        volumeSlider.value = 70;
        volumeValue.textContent = '70%';
        volumeBtn.src = '/Assets/images/volume.svg';
        isMuted = false;
        if (currentAudio && currentAudio.volume !== undefined) {
            currentAudio.volume = 0.7;
        }
    } else {
        volumeSlider.value = 0;
        volumeValue.textContent = '0%';
        volumeBtn.src = '/Assets/images/volume-mute.svg';
        isMuted = true;
        if (currentAudio && currentAudio.volume !== undefined) {
            currentAudio.volume = 0;
        }
    }
});

document.getElementById('playBtn').addEventListener('click', () => {
    if (isPlaying) {
        if (currentAudio) {
            if (currentAudio.pause) {
                currentAudio.pause();
            } else if (currentAudio.stop) {
                currentAudio.stop();
            }
            currentAudio = null;
        }
        isPlaying = false;
        playBtn.src = '/Assets/images/play.svg';
        resetProgress();
    } else {
        playRealSong('Blinding Lights (PenduJatt.Com.Se).mp3', 'Blinding Lights', 'The Weeknd');
    }
});

document.getElementById('progressBar').addEventListener('input', () => {
    if (!isPlaying || !currentAudio) return;
    
    if (currentAudio.duration && currentAudio.currentTime !== undefined) {
        const seekTime = (progressBar.value / 100) * currentAudio.duration;
        currentAudio.currentTime = seekTime;
        document.getElementById('currentTime').textContent = formatTime(seekTime);
    }
});

progressBar.addEventListener('mouseup', () => {
    if (!isPlaying || !currentAudio) return;
    
    if (currentAudio.duration && currentAudio.currentTime !== undefined) {
        const seekTime = (progressBar.value / 100) * currentAudio.duration;
        currentAudio.currentTime = seekTime;
    }
});

document.getElementById('previousBtn').addEventListener('click', () => {
    if (isPlaying) {
        playRealSong('Shape Of You (PenduJatt.Com.Se).mp3', 'Shape of You', 'Ed Sheeran');
    }
});

document.getElementById('nextBtn').addEventListener('click', () => {
    if (isPlaying) {
        playRealSong('Levitating.mp3', 'Levitating', 'Dua Lipa');
    }
});

const likedSongs = [
    {
        title: "Bohemian Rhapsody",
        artist: "Queen",
        duration: "5:55",
        liked: true
    },
    {
        title: "Hotel California",
        artist: "Eagles",
        duration: "6:30",
        liked: true
    },
    {
        title: "Stairway to Heaven",
        artist: "Led Zeppelin",
        duration: "8:02",
        liked: true
    }
];

const myPlaylist = [
    {
        title: "Imagine",
        artist: "John Lennon",
        duration: "3:03"
    },
    {
        title: "Hey Jude",
        artist: "The Beatles",
        duration: "3:07"
    },
    {
        title: "Billie Jean",
        artist: "Elton John",
        duration: "3:39"
    }
];


function displayLikedSongs() {
    likedSongsList.innerHTML = '';
    likedSongs.forEach((song, index) => {
        const li = document.createElement('li');
        li.className = 'songs';
        li.innerHTML = `
            <div class='info'>
                <span>${song.title} - ${song.artist}</span>
                <span class="duration">${song.duration}</span>
            </div>
        `;
        li.addEventListener('click', () => playLikedSong(song));
        likedSongsList.appendChild(li);
    });
}


function displayMyPlaylist() {
    myPlaylistList.innerHTML = '';
    myPlaylist.forEach((song, index) => {
        const li = document.createElement('li');
        li.className = 'songs';
        li.innerHTML = `
            <div class='info'>
                <span>${song.title} - ${song.artist}</span>
                <span class="duration">${song.duration}</span>
            </div>
        `;
        li.addEventListener('click', () => playMyPlaylistSong(song));
        myPlaylistList.appendChild(li);
    });
}


function playLikedSong(song) {
    const frequencies = [523, 587, 659, 698, 784];
    const frequency = frequencies[Math.floor(Math.random() * frequencies.length)];
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.value = frequency;
    gainNode.gain.value = 0.1;
    oscillator.start();
    setTimeout(() => {
        oscillator.stop();
    }, 2000);
    playBtn.src = '/Assets/images/pause.svg';
    console.log(`Playing liked song: ${song.title} by ${song.artist}`);
}


function playMyPlaylistSong(song) {
    const frequencies = [440, 494, 523, 587];
    const frequency = frequencies[Math.floor(Math.random() * frequencies.length)];
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.value = frequency;
    gainNode.gain.value = 0.1;
    oscillator.start();
    setTimeout(() => {
        oscillator.stop();
    }, 2000);
    playBtn.src = '/Assets/images/pause.svg';
    console.log(`Playing my playlist song: ${song.title} by ${song.artist}`);
}

createBtn.addEventListener('click', () => {
    const name = playlistName.value.trim();
    if (name) {
        alert(`Creating playlist: ${name}`);
        playlistName.value = '';
        const newPlaylist = {
            title: name,
            songs: []
        };
        console.log('New playlist created:', newPlaylist);
    }
});


let audio = new Audio();


let songs;
let cFolder;


async function getSongs(folder) {
    cFolder = folder;
    let req = await fetch(`uri/${cFolder}`);
    let res = await req.text();
    let div = document.createElement('div');
    div.innerHTML = res;
    const tags = div.getElementsByTagName('a');
    songs = [];
    for (let i = 0; i < tags.length; i++) {
        const element = tags[i];
        if (element.href.endsWith('.mp3')) {
            songs.push(element.href.split(`${cFolder}/`)[1]);
        }
    }
    const songUl = document.querySelector('#songsList');
    songUl.innerHTML = "";
    for (const song of songs) {
        songUl.innerHTML += `<li class="songs">
        <div class='info'>
        <span>${song.replaceAll('%20', ' ')}
        </span>
        </div></li>`;
    }
    Array.from(document.querySelector('#songsList').getElementsByTagName("li")).forEach(event => {
        event.addEventListener('click', (element) => {
            playSong(event.querySelector(".info").firstElementChild.innerHTML)
        })
    })
}


function playSong(song) {
    audio.src = `/${cFolder}/${song}`;
    console.log(audio.src);
    audio.play();
    playBtn.src = '/Assets/images/pause.svg';
}


async function getPlaylists() {
    let req = await fetch(`uri/songs`);
    let res = await req.text();
    let div = document.createElement('div');
    div.innerHTML = res;
    let allSongs = div.getElementsByTagName('a');
    let songArray = Array.from(allSongs);
    for (let index = 0; index < songArray.length; index++) {
        const e = songArray[index];
        if (e.href.includes('/songs/')) {
            let lists = e.href.split('/songs/')[1]
            let req = await fetch(`uri/songs/${lists}/metadata.json`);
            let res = await req.json();
            playlist.innerHTML += `<div data-folder="${lists}" class="card flex flex-col">
            <img class="banner rounded-sm" src="/Assets/banners/${lists}.jpeg" alt="">
            <h3 class="songTitle">${res.title}</h3>
            <span id="desc" class="singer">${res.desc}</span>
            <img id="songPlayBtn" src="/Assets/images/songPlay.svg" alt="">
            </div>`
        }
    }
    Array.from(document.getElementsByClassName('card')).forEach(event => {
        event.addEventListener("click", async (item) => {
            console.log(item.currentTarget.dataset);
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
        })
    })
}


function displaySongsWithImages() {
    console.log("displaySongsWithImages function called!");
    if (!songsWithImages) {
        console.error("songsWithImages element not found!");
        return;
    }
    songsWithImages.innerHTML = `
        <div class="song-item" style="background: #2a2a2a; padding: 12px; border-radius: 8px; margin: 5px;">
            <img src="/Assets/images/song1.jpg" style="width: 100%; height: 120px; object-fit: cover; border-radius: 6px; margin-bottom: 10px;">
            <h4 style="color: white; margin: 0;">Blinding Lights</h4>
            <p style="color: #b3b3b3; margin: 0;">The Weeknd</p>
            <p style="color: #888; margin: 0;">3:20</p>
        </div>
        <div class="song-item" style="background: #2a2a2a; padding: 12px; border-radius: 8px; margin: 5px;">
            <img src="/Assets/images/song2.jpg" style="width: 100%; height: 120px; object-fit: cover; border-radius: 6px; margin-bottom: 10px;">
            <h4 style="color: white; margin: 0;">Shape of You</h4>
            <p style="color: #b3b3b3; margin: 0;">Ed Sheeran</p>
            <p style="color: #888; margin: 0;">3:53</p>
        </div>
        <div class="song-item" style="background: #2a2a2a; padding: 12px; border-radius: 8px; margin: 5px;">
            <img src="/Assets/images/song3.jpg" style="width: 100%; height: 120px; object-fit: cover; border-radius: 6px; margin-bottom: 10px;">
            <h4 style="color: white; margin: 0;">Someone Like You</h4>
            <p style="color: #b3b3b3; margin: 0;">Adele</p>
            <p style="color: #888; margin: 0;">4:45</p>
        </div>
    `;
    console.log("Songs added successfully!");
}


function playSongWithImage(song) {
    const songFrequencies = {
        "Blinding Lights": 440,
        "Shape of You": 494,
        "Someone Like You": 523,
        "Starboy": 587,
        "Perfect": 659,
        "Levitating": 698
    };
    const frequency = songFrequencies[song.title] || 440;
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.value = frequency;
    gainNode.gain.value = 0.1;
    oscillator.start();
    setTimeout(() => {
        oscillator.stop();
    }, 2000);
    playBtn.src = '/Assets/images/pause.svg';
    console.log(`Playing: ${song.title} by ${song.artist} at ${frequency}Hz`);
}


async function main() {
    console.log("Main function started!");
    getPlaylists();
    await getSongs(`songs/Blue`);
    displaySongsWithImages();
    previousBtn.addEventListener('click', () => {
        let index = songs.indexOf(audio.src.split('/').slice(-1)[0])
        if ((index-1) >= 0) {
            playSong(songs[index - 1]);
        }
    })
    playBtn.addEventListener('click', () => {
        if (audio.paused) {
            audio.play();
            playBtn.src = '/Assets/images/pause.svg'

        }
        else {
            audio.pause();
            playBtn.src = '/Assets/images/play.svg'
        }
    })

    
    nextBtn.addEventListener('click', () => {
        let index = songs.indexOf(audio.src.split('/').slice(-1)[0])
        if ((index+1) < songs.length) {
            playSong(songs[index + 1]);
        }
    })

    
    audio.addEventListener('timeupdate', () => {
        if (!isNaN(audio.duration)) {
            const progress = (audio.currentTime / audio.duration) * 100;
            progressBar.value = progress;
            currentTimeDisplay.textContent = formatTime(audio.currentTime);
        }
        if (audio.currentTime === audio.duration) {
            playBtn.src = '/Assets/images/play.svg';
            progressBar.value = 0;
            currentTimeDisplay.textContent = '0:00';
        }
    })

    
    progressBar.addEventListener('input', () => {
        const seekTime = (progressBar.value / 100) * audio.duration
        audio.currentTime = seekTime;
    })

    
    audio.addEventListener('loadedmetadata', () => {
        progressBar.max = 100;
        progressBar.min = 0;
        progressBar.value = 0;
        totalTimeDisplay.textContent = formatTime(audio.duration);
    })


    function formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }


    audio.volume = 0.7;

    volumeSlider.addEventListener('input', () => {
        const volume = volumeSlider.value / 100;
        audio.volume = volume;
        volumeValue.textContent = `${volumeSlider.value}%`;
        updateVolumeIcon(volume);
    })

    
    volumeBtn.addEventListener('click', () => {
        if (audio.volume > 0) {
            audio.volume = 0;
            volumeSlider.value = 0;
            volumeValue.textContent = '0%';
            volumeBtn.src = '/Assets/images/volume-mute.svg';
        } else {
            audio.volume = 0.7;
            volumeSlider.value = 70;
            volumeValue.textContent = '70%';
            volumeBtn.src = '/Assets/images/volume.svg';
        }
    })


    function updateVolumeIcon(volume) {
        if (volume === 0) {
            volumeBtn.src = '/Assets/images/volume-mute.svg';
        } else {
            volumeBtn.src = '/Assets/images/volume.svg';
        }
    }
}
main();
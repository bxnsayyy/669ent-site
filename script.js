
// NUVOLE: velocità leggermente random --------------------------
function initCloudRandomSpeed() {
  const clouds = document.querySelectorAll(".cloud, .cloud-foreground");
  clouds.forEach((cloud) => {
    const base = 18000;
    const random = Math.random() * 8000;
    cloud.style.animationDuration = base + random + "ms";
  });
}

// HOME: click sugli artisti ------------------------------------
let popupBackdrop, popupWindow;

function initArtistsClick() {
  const cards = document.querySelectorAll(".artist-card");
  popupBackdrop = document.getElementById("artist-popup");
  popupWindow = document.getElementById("popup-window");

  if (!cards.length || !popupBackdrop || !popupWindow) return;

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      const artistKey = card.dataset.artist;
      openPopup(artistKey);
    });
  });
}

// POPUP MUSIC --------------------------------------------------
function initPopup() {
  popupBackdrop = document.getElementById("artist-popup");
  popupWindow = document.getElementById("popup-window");
  if (!popupBackdrop || !popupWindow) return;

  const closeBtn = document.getElementById("popup-close");
  closeBtn.addEventListener("click", closePopup);

  popupBackdrop.addEventListener("click", (e) => {
    if (e.target === popupBackdrop) {
      closePopup();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closePopup();
  });
}

function openPopup(artistKey) {
  const artist = ARTISTS[artistKey];
  if (!artist) return;

  // ---- NOME ARTISTA (GRANDE) ----
  const bigName = document.getElementById("popup-artist-name-big");
  if (bigName) bigName.textContent = artist.name || "";

  // ---- NOME ARTISTA (PICCOLO SOPRA LA GRIGLIA) ----
  const nameEl = document.getElementById("popup-artist-name");
  if (nameEl) nameEl.textContent = artist.name || "";

  // ---- BIO ----
  const bioEl = document.getElementById("popup-artist-bio");
  if (bioEl) bioEl.textContent = artist.bio || "";

  // ---- SOCIAL ----
  const socialBox = document.getElementById("popup-artist-social");
  if (socialBox) {
    socialBox.innerHTML = "";
    if (artist.social) {
      Object.entries(artist.social).forEach(([platform, url]) => {
        const link = document.createElement("a");
        link.href = url;
        link.target = "_blank";
        link.textContent = platform.toUpperCase();
        socialBox.appendChild(link);
      });
    }
  }

  // ---- MUSICA (GRID) ----
  const gridEl = document.getElementById("popup-grid");
  if (!gridEl) return;

  gridEl.innerHTML = "";

  (artist.releases || []).forEach((rel) => {
    const card = document.createElement("a");
    card.className = "music-card";
    card.href = rel.url || "#";
    card.target = "_blank";
    card.rel = "noopener noreferrer";

    const cover = document.createElement("div");
    cover.className = "music-cover";
    const img = document.createElement("img");
    img.src = rel.cover || "";
    img.alt = rel.title || "";
    cover.appendChild(img);

    const meta = document.createElement("div");
    meta.className = "music-meta";

    const type = document.createElement("div");
    type.className = "music-type";
    type.textContent = rel.type || "";

    const title = document.createElement("div");
    title.className = "music-title";
    title.textContent = rel.title || "";

    meta.appendChild(type);
    meta.appendChild(title);

    card.appendChild(cover);
    card.appendChild(meta);

    gridEl.appendChild(card);
  });

  // ---- APERTURA POPUP ----
  document.getElementById("artist-popup").classList.add("open");
}

function closePopup() {
  if (!popupBackdrop) return;
  popupBackdrop.classList.remove("open");
}

/* ---------------------------------------------------
   BACKGROUND MOVEMENT: mouse + phone motion
--------------------------------------------------- */

const bgImage = document.querySelector(".bg");
let motionEnabled = false;

// MOVIMENTO MOUSE (solo desktop)
document.addEventListener("mousemove", (e) => {
  if (!bgImage || motionEnabled) return;

  const x = (e.clientX / window.innerWidth - 0.5) * 10;
  const y = (e.clientY / window.innerHeight - 0.5) * 10;

  bgImage.style.transform = `translate(${x}px, ${y}px) scale(1.05)`;
});

// MOVIMENTO TELEFONO
window.addEventListener("deviceorientation", (e) => {
  if (!motionEnabled || !bgImage) return;

  const x = e.gamma;
  const y = e.beta;

  const moveX = (x / 30) * 10;
  const moveY = (y / 30) * 10;

  bgImage.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.05)`;
});

// TOGGLE PER ATTIVARE DISPOSITIVO MOBILE
function initMotionToggle() {
  const motionToggleBtn = document.getElementById("motion-toggle");
  if (!motionToggleBtn) return;

  motionToggleBtn.addEventListener("click", async () => {
    if (!motionEnabled) {
      if (typeof DeviceMotionEvent !== "undefined" &&
          typeof DeviceMotionEvent.requestPermission === "function") {
        try {
          const response = await DeviceMotionEvent.requestPermission();
          if (response === "granted") {
            motionEnabled = true;
            motionToggleBtn.textContent = "MOTION: ON";
          }
        } catch (err) {
          alert("Per usare il movimento bisogna dare il permesso.");
        }
      } else {
        motionEnabled = true;
        motionToggleBtn.textContent = "MOTION: OFF";
      }
    } else {
      motionEnabled = false;
      motionToggleBtn.textContent = "MOTION: ON";
      bgImage.style.transform = "scale(1.05)";
    }
  });
}

/* MENU LATERALE ----------------------------------------------- */

function initMenuPopup() {
  const menuBtn = document.querySelector(".menu-button");
  const menuPopup = document.getElementById("menu-popup");
  const menuClose = document.getElementById("menu-close");

  if (!menuBtn || !menuPopup || !menuClose) return;

  menuBtn.addEventListener("click", () => {
    menuPopup.classList.add("open");
  });

  menuClose.addEventListener("click", () => {
    menuPopup.classList.remove("open");
  });

  menuPopup.addEventListener("click", (e) => {
    if (e.target === menuPopup) {
      menuPopup.classList.remove("open");
    }
  });
}

///////////script x aggiornare
async function loadReleasesFromSheet() {
    const url = "https://docs.google.com/spreadsheets/d/1gDyVQ3bpzlY8EjGtr7KClyn3x5ZPU9sQJYkYclNZIOE/gviz/tq?tqx=out:json";

    const res = await fetch(url);
    const text = await res.text();
    const json = JSON.parse(text.substring(47, text.length - 2));

    const rows = json.table.rows;
    const releasesByArtist = {};

    for (const r of rows) {
        const c = r.c.map(x => (x ? x.v : ""));

        const [
            artist_key,
            title,
            type,
            isrc,
            upc,
            featurefm_link
        ] = c;

        let cover = null;
        let appleLink = null;

        // 🔥 Recupero automatico da Apple (ISRC se c'è)
        if (isrc || upc) {
            try {
                const identifier = isrc ? `isrc=${isrc}` : `upc=${upc}`;
                const appleRes = await fetch(`https://itunes.apple.com/lookup?${identifier}`);
                const appleData = await appleRes.json();

                if (appleData.results?.length > 0) {
                    const item = appleData.results[0];

                    // COVER HD AUTOMATICA (1000x1000)
                    if (item.artworkUrl100) {
                        cover = item.artworkUrl100.replace("100x100", "1000x1000");
                    }

                    // LINK APPLE UNIVERSALE
                    appleLink = item.trackViewUrl || item.collectionViewUrl || null;
                }
            } catch (err) {
                console.error("Errore Apple API UPC/ISRC:", err);
            }
        }

        if (!releasesByArtist[artist_key]) releasesByArtist[artist_key] = [];

        releasesByArtist[artist_key].push({
            title,
            type,
            isrc,
            upc,
            cover,
            featurefm: featurefm_link,
            links: {
                featurefm: featurefm_link,
                apple: appleLink
            }
        });
    }

    return releasesByArtist;
}

let ARTISTS = {};

window.addEventListener("load", async () => {
    // 1) carica dati fissi
    const res = await fetch("releases.json");
    ARTISTS = await res.json();

    // 2) carica releases dinamiche dal Google Sheet
    const sheetReleases = await loadReleasesFromSheet();

    // 3) unisci releases dinamiche agli artisti permanenti
    for (const key in sheetReleases) {
        if (ARTISTS[key]) {
            ARTISTS[key].releases = sheetReleases[key];
        }
    }

    console.log("ARTISTS FINAL:", ARTISTS);

    // ora puoi inizializzare il resto del sito
    initCloudRandomSpeed();
    initArtistsClick();
    initPopup();
});

// ============================================
// JFONS — Main JS
// ============================================

document.addEventListener('DOMContentLoaded', () => {

  // ---- SCROLL REVEAL ----
  const reveals = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  reveals.forEach(el => revealObserver.observe(el));

  // ---- NAV SCROLL ----
  const nav = document.getElementById('nav');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    if (currentScroll > 80) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    lastScroll = currentScroll;
  }, { passive: true });

  // ---- MOBILE MENU ----
  const toggle = document.querySelector('.nav-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    mobileMenu.classList.toggle('open');
    document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
  });

  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('active');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // ---- SMOOTH SCROLL FOR NAV LINKS ----
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ---- RELEASE CARD CLICK -> SPOTIFY ----
  document.querySelectorAll('.release-card').forEach(card => {
    card.addEventListener('click', () => {
      window.open('https://open.spotify.com/artist/3qzK6r7uVi9hDa8jfyqX6X', '_blank');
    });
    card.style.cursor = 'pointer';
  });

  // ---- DESKMAN PLAYER ----
  initDeskman();

  // ---- PARALLAX ON HERO ----
  const heroContent = document.querySelector('.hero-content');
  window.addEventListener('scroll', () => {
    const scroll = window.scrollY;
    if (scroll < window.innerHeight) {
      const opacity = 1 - (scroll / (window.innerHeight * 0.7));
      const translateY = scroll * 0.3;
      heroContent.style.opacity = Math.max(0, opacity);
      heroContent.style.transform = `translateY(${translateY}px)`;
    }
  }, { passive: true });

  // ---- CURSOR GLOW ON HERO ----
  const hero = document.getElementById('hero');
  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    hero.style.background = `
      radial-gradient(circle 400px at ${x}px ${y}px, rgba(201, 168, 76, 0.06) 0%, transparent 60%),
      radial-gradient(ellipse at 50% 30%, rgba(201, 168, 76, 0.08) 0%, transparent 60%),
      #000
    `;
  });

  hero.addEventListener('mouseleave', () => {
    hero.style.background = `
      radial-gradient(ellipse at 50% 30%, rgba(201, 168, 76, 0.08) 0%, transparent 60%),
      #000
    `;
  });

});

// ============================================
// DESKMAN PLAYER ENGINE
// ============================================
function initDeskman() {
  // Tracks with Spotify embed IDs
  const tracks = [
    { name: 'Mirame', album: 'MONARCA', plays: '17,145', spotifyId: '6uy0OuvzGMbaaABLV17H3h6x' },
    { name: 'Mil Veces', album: 'Mil Veces', plays: '16,657', spotifyId: '2KyeuWBPoXsRmHlOkhny3A' },
    { name: 'Dimelo Baby', album: 'Dimelo Baby', plays: '—', spotifyId: '6wnbqFuEVbgCa0miApxWxM' },
    { name: 'Madonna', album: 'MONARCA', plays: '—', spotifyId: '5AbfXcl3DdRBNteNbqomy5' },
    { name: 'Play Me', album: 'MONARCA', plays: '—', spotifyId: '3jdbKnZiaRlKTErXzPeU0C' },
    { name: 'MONARCA', album: 'MONARCA', plays: '—', spotifyId: '0fbWordfufvEOTEtxaXu1h' },
  ];

  let currentTrack = 0;
  let isPlaying = false;
  let eqInterval = null;

  // DOM refs
  const disc = document.getElementById('dk-disc');
  const tonearm = document.getElementById('dk-tonearm');
  const playBtn = document.getElementById('dk-play');
  const prevBtn = document.getElementById('dk-prev');
  const nextBtn = document.getElementById('dk-next');
  const iconPlay = playBtn.querySelector('.dk-icon-play');
  const iconPause = playBtn.querySelector('.dk-icon-pause');
  const lcdTitle = document.getElementById('dk-lcd-title');
  const lcdAlbum = document.getElementById('dk-lcd-album');
  const lcdFill = document.getElementById('dk-lcd-fill');
  const timeCurrent = document.getElementById('dk-time-current');
  const timeTotal = document.getElementById('dk-time-total');
  const discTitle = document.getElementById('dk-disc-title');
  const discTrack = document.getElementById('dk-disc-track');
  const eqBars = document.querySelectorAll('.dk-eq-bar');
  const trackBtns = document.querySelectorAll('.dk-track');
  const fxBtns = document.querySelectorAll('.dk-fx-btn');
  const volSlider = document.getElementById('dk-vol');
  const spotifyIframe = document.getElementById('dk-spotify');

  // Create the visible Spotify embed container
  const embedContainer = document.createElement('div');
  embedContainer.className = 'dk-spotify-embed';
  embedContainer.innerHTML = `<iframe
    id="dk-spotify-player"
    src="https://open.spotify.com/embed/track/${tracks[0].spotifyId}?utm_source=generator&theme=0"
    width="100%"
    height="80"
    frameBorder="0"
    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
    loading="lazy"
    style="border-radius:8px;"></iframe>`;
  // Insert after the LCD display
  const lcdParent = document.querySelector('.dk-lcd');
  lcdParent.parentNode.insertBefore(embedContainer, lcdParent.nextSibling);

  // Remove the old hidden iframe
  if (spotifyIframe) spotifyIframe.remove();

  function loadTrack(index) {
    currentTrack = index;
    const track = tracks[index];

    lcdTitle.textContent = track.name;
    lcdAlbum.textContent = `[ ] ALBUM ; ${track.album}`;
    discTrack.textContent = track.name;
    discTitle.textContent = 'JFONS';

    // Update active track in list
    trackBtns.forEach((btn, i) => {
      btn.classList.toggle('active', i === index);
    });

    // Update Spotify embed to the selected track
    const player = document.getElementById('dk-spotify-player');
    player.src = `https://open.spotify.com/embed/track/${track.spotifyId}?utm_source=generator&theme=0`;

    // Reset visual progress
    lcdFill.style.width = '0%';
    timeCurrent.textContent = '00:00';
    timeTotal.textContent = '03:30';
  }

  function setPlayState(playing) {
    isPlaying = playing;
    if (isPlaying) {
      playBtn.classList.add('active');
      iconPlay.style.display = 'none';
      iconPause.style.display = 'block';
      disc.classList.add('spinning');
      tonearm.classList.add('active');
      startEQ();
    } else {
      playBtn.classList.remove('active');
      iconPlay.style.display = 'block';
      iconPause.style.display = 'none';
      disc.classList.remove('spinning');
      tonearm.classList.remove('active');
      stopEQ();
    }
  }

  function togglePlay() {
    setPlayState(!isPlaying);
  }

  function startEQ() {
    stopEQ();
    eqInterval = setInterval(() => {
      eqBars.forEach(bar => {
        const height = 15 + Math.random() * 85;
        bar.style.height = height + '%';
      });
    }, 120);
  }

  function stopEQ() {
    if (eqInterval) clearInterval(eqInterval);
    eqBars.forEach(bar => {
      bar.style.height = '12%';
    });
  }

  function nextTrack() {
    const next = (currentTrack + 1) % tracks.length;
    loadTrack(next);
    setPlayState(true);
  }

  function prevTrack() {
    const prev = (currentTrack - 1 + tracks.length) % tracks.length;
    loadTrack(prev);
    setPlayState(true);
  }

  // Event listeners
  playBtn.addEventListener('click', togglePlay);
  nextBtn.addEventListener('click', nextTrack);
  prevBtn.addEventListener('click', prevTrack);

  trackBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index);
      loadTrack(idx);
      setPlayState(true);
    });
  });

  // FX toggles
  fxBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
    });
  });

  // Initialize
  loadTrack(0);
}

// ---- EMAIL SIGNUP ----
function handleSignup(e) {
  e.preventDefault();
  const form = e.target;
  const success = form.nextElementSibling;
  form.style.display = 'none';
  success.hidden = false;
}

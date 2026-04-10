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

// ---- EMAIL SIGNUP ----
function handleSignup(e) {
  e.preventDefault();
  const form = e.target;
  const success = form.nextElementSibling;
  form.style.display = 'none';
  success.hidden = false;
}

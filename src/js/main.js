// ── CURSOR GLOW ──
const cursorGlow = document.getElementById('cursorGlow');
document.addEventListener('mousemove', (e) => {
  cursorGlow.style.left = e.clientX + 'px';
  cursorGlow.style.top = e.clientY + 'px';
});

// ── NAVIGATION ──
const nav = document.getElementById('mainNav');
const navLinks = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('section[id]');
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 30);
});

// Mobile toggle
navToggle.addEventListener('click', () => {
  const isOpen = navToggle.classList.toggle('open');
  navMenu.classList.toggle('open');
  document.body.style.overflow = isOpen ? 'hidden' : 'auto';
});
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    navToggle.classList.remove('open');
    navMenu.classList.remove('open');
    document.body.style.overflow = 'auto';
  });
});

// Active link observer
const navObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navLinks.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === `#${e.target.id}`);
      });
    }
  });
}, { threshold: 0.3 });
sections.forEach(s => navObs.observe(s));

// Smooth scroll
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      window.scrollTo({ top: target.offsetTop - nav.offsetHeight, behavior: 'smooth' });
    }
  });
});

// ── TYPING EFFECT ──
const roles = [
  'Desarrollador Fullstack Junior',
  'Egresado en Ingeniería TI · ESPE',
  'Backend · NestJS · .NET Core',
  'Automatización con Power Automate'
];
let roleIndex = 0, charIndex = 0, deleting = false;
const typingEl = document.getElementById('typingText');

function typeEffect() {
  const current = roles[roleIndex];
  typingEl.textContent = current.substring(0, charIndex);
  if (deleting) {
    charIndex--;
    if (charIndex < 0) {
      deleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      charIndex = 0;
    }
  } else {
    charIndex++;
    if (charIndex > current.length) {
      setTimeout(() => {
        deleting = true;
        typeEffect();
      }, 2000);
      return;
    }
  }
  setTimeout(typeEffect, deleting ? 30 : 60);
}
typeEffect();

// ── PARTICLE CANVAS ──
const canvas = document.getElementById('heroCanvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let particles = [], w, h;
  function resize() { w = canvas.width = canvas.offsetWidth; h = canvas.height = canvas.offsetHeight; }
  resize(); window.addEventListener('resize', resize);

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * w; this.y = Math.random() * h;
      this.vx = (Math.random() - 0.5) * 0.3; this.vy = (Math.random() - 0.5) * 0.3;
      this.size = Math.random() * 1.5 + 0.5; this.alpha = Math.random() * 0.4 + 0.1;
    }
    update() {
      this.x += this.vx; this.y += this.vy;
      if (this.x < 0 || this.x > w || this.y < 0 || this.y > h) this.reset();
    }
    draw() {
      ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(99,102,241,${this.alpha})`; ctx.fill();
    }
  }
  for (let i = 0; i < 80; i++) particles.push(new Particle());

  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dist = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
        if (dist < 120) {
          ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(99,102,241,${0.06 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5; ctx.stroke();
        }
      }
    }
  }
  function animate() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => { p.update(); p.draw(); });
    drawLines();
    requestAnimationFrame(animate);
  }
  animate();
}

// ── SCROLL REVEAL ──
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('active'); });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll([
  '.section-header', '.sobre-text', '.sobre-stats-wrapper',
  '.timeline-item', '.project-card', '.stat-card',
  '.skill-group', '.curso-card', '.edu-card', '.hobby-card',
  '.contact-intro', '.contact-links', '.contact-location'
].join(',')).forEach((el, i) => {
  el.classList.add('reveal');
  // Stagger siblings
  const siblings = el.parentElement.children;
  const idx = Array.from(siblings).indexOf(el);
  if (idx >= 0 && idx < 7) el.classList.add(`stagger-${idx + 1}`);
  revealObs.observe(el);
});

// ── COUNTER ANIMATION ──
const counterObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const card = e.target;
      const target = Number.parseInt(card.dataset.count, 10);
      const numEl = card.querySelector('.stat-num');
      const hasSuffix = numEl.textContent.includes('+');
      let current = 0;
      const step = Math.ceil(target / 30);
      const interval = setInterval(() => {
        current += step;
        if (current >= target) { current = target; clearInterval(interval); }
        numEl.textContent = current + (hasSuffix ? '+' : '');
      }, 40);
      counterObs.unobserve(card);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('.stat-card[data-count]').forEach(c => counterObs.observe(c));

// ── PROJECT CARD GLOW (follow mouse) ──
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty('--mouse-x', x + '%');
    card.style.setProperty('--mouse-y', y + '%');
  });
});

// ── SKILLS CAROUSEL ──
const track = document.getElementById('skillsTrack');
const prevBtn = document.getElementById('skillsPrev');
const nextBtn = document.getElementById('skillsNext');
const dotsContainer = document.getElementById('skillsDots');

if (track && prevBtn && nextBtn && dotsContainer) {
  const cards = track.querySelectorAll('.skill-group');
  let currentSlide = 0;
  let cardsPerView = 3;
  let autoPlayInterval;

  function getCardsPerView() {
    if (globalThis.innerWidth < 768) return 1;
    if (globalThis.innerWidth < 1024) return 2;
    return 3;
  }

  function getTotalSlides() {
    return Math.max(1, cards.length - cardsPerView + 1);
  }

  function updateCarousel() {
    cardsPerView = getCardsPerView();
    const gap = 20; // 1.25rem
    const viewport = track.parentElement.offsetWidth;
    const cardWidth = (viewport - gap * (cardsPerView - 1)) / cardsPerView;

    cards.forEach(card => {
      card.style.minWidth = cardWidth + 'px';
    });

    const offset = currentSlide * (cardWidth + gap);
    track.style.transform = `translateX(-${offset}px)`;

    prevBtn.disabled = currentSlide === 0;
    nextBtn.disabled = currentSlide >= getTotalSlides() - 1;
    updateDots();
  }

  function createDots() {
    dotsContainer.innerHTML = '';
    const total = getTotalSlides();
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot' + (i === currentSlide ? ' active' : '');
      dot.addEventListener('click', () => { currentSlide = i; updateCarousel(); resetAutoPlay(); });
      dotsContainer.appendChild(dot);
    }
  }

  function updateDots() {
    const dots = dotsContainer.querySelectorAll('.carousel-dot');
    dots.forEach((dot, i) => dot.classList.toggle('active', i === currentSlide));
    if (dots.length !== getTotalSlides()) createDots();
  }

  function goNext() {
    if (currentSlide < getTotalSlides() - 1) { currentSlide++; updateCarousel(); }
    else { currentSlide = 0; updateCarousel(); }
  }
  function goPrev() {
    if (currentSlide > 0) { currentSlide--; updateCarousel(); }
  }

  prevBtn.addEventListener('click', () => { goPrev(); resetAutoPlay(); });
  nextBtn.addEventListener('click', () => { goNext(); resetAutoPlay(); });

  function startAutoPlay() { autoPlayInterval = setInterval(goNext, 4000); }
  function resetAutoPlay() { clearInterval(autoPlayInterval); startAutoPlay(); }

  // Touch/drag support
  let startX = 0, isDragging = false;
  track.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    isDragging = true;
  }, { passive: true });

  track.addEventListener('touchmove', e => {
    if (!isDragging) return;
    const moveX = e.touches[0].clientX;
    const diff = startX - moveX;
    // Prevent vertical scroll if horizontal swipe is detected
    if (Math.abs(diff) > 10) {
      // Logic to potentially shift track could go here
    }
  }, { passive: true });

  track.addEventListener('touchend', e => {
    if (!isDragging) return;
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) { // More sensitive threshold
      if (diff > 0) goNext();
      else goPrev();
      resetAutoPlay();
    }
    isDragging = false;
  });

  window.addEventListener('resize', () => { currentSlide = 0; createDots(); updateCarousel(); });
  createDots();
  updateCarousel();
  startAutoPlay();
}

// ── CERTIFICATE MODAL ──
const certModal = document.getElementById('certModal');
const certFrame = document.getElementById('certFrame');
const closeModal = document.querySelector('.close-modal');
const cursoCards = document.querySelectorAll('.curso-card');

if (certModal && certFrame && closeModal) {
  cursoCards.forEach(card => {
    card.addEventListener('click', () => {
      const pdfPath = card.dataset.pdf;
      if (pdfPath) {
        certFrame.src = pdfPath;
        certModal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Stop scrolling
      }
    });
  });

  const closeFunc = () => {
    certModal.style.display = 'none';
    certFrame.src = '';
    document.body.style.overflow = 'auto'; // Restore scrolling
  };

  closeModal.addEventListener('click', closeFunc);
  globalThis.addEventListener('click', (e) => {
    if (e.target === certModal) closeFunc();
  });
}

console.log('Portfolio v2.0 Loaded ✨');

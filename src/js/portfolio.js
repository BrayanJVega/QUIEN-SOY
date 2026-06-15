/* =============================================
   PORTFOLIO INTERACTIVO v2 — Brayan Vega Garófalo
   Poses individuales por sección + habitación completa
   ============================================= */
'use strict';

// ─── ZONES — mapa interactivo ──────────────────
const ZONES = [
  { id:'about',          num:'01', name:'Sobre mí',        name_en:'About me',        sub:'Presentación personal', sub_en:'Personal intro', x:'20%',  y:'25%', labelClass:'',          pose:'img/pose-about.png' },
  { id:'experience',     num:'02', name:'Experiencia',     name_en:'Experience',      sub:'Mi trayectoria',        sub_en:'Career path',    x:'25%',  y:'50%', labelClass:'',          pose:'img/pose-experience.png' },
  { id:'projects',       num:'03', name:'Proyectos',       name_en:'Projects',        sub:'Mis trabajos',          sub_en:'My work',        x:'38%',  y:'75%', labelClass:'',          pose:'img/pose-projects.png' },
  { id:'technologies',   num:'04', name:'Tecnologías',     name_en:'Technologies',    sub:'Stack tecnológico',     sub_en:'Tech stack',     x:'62%',  y:'40%', labelClass:'label-left', pose:'img/pose-tech.png' },
  { id:'certifications', num:'05', name:'Certificaciones', name_en:'Certifications',  sub:'Cursos y logros',       sub_en:'Achievements',   x:'85%',  y:'55%', labelClass:'label-left', pose:'img/pose-certs.png' },
  { id:'softSkills',     num:'06', name:'Soft Skills',     name_en:'Soft Skills',     sub:'Habilidades blandas',   sub_en:'People skills',  x:'75%',  y:'75%', labelClass:'label-left', pose:'img/pose-soft.png' }
];

// ─── STATE ─────────────────────────────────────
let cvData     = null;
let currentLang = 'es';
let activeZone = null;
let clockTimer = null;
let isBusy     = false;
let mouseX = 0, mouseY = 0;
let rafId      = null;

// ─── PRELOAD ───────────────────────────────────
function preloadPoses() {
  ZONES.forEach(z => { new Image().src = z.pose; });
}

// ─── DATA ──────────────────────────────────────
async function loadCV() {
  try {
    const r = await fetch('cv.json');
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.json();
  } catch (e) {
    console.error('[Portfolio] cv.json:', e);
    return null;
  }
}

// ─── HOTSPOTS ──────────────────────────────────
function buildHotspots() {
  const layer = document.getElementById('hotspotsLayer');
  if(!layer) return;
  layer.innerHTML = ''; // Clear existing
  const icons = {
    about: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    experience: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
    projects: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>',
    technologies: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
    certifications: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>',
    softSkills: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>'
  };

  ZONES.forEach(z => {
    const el = document.createElement('div');
    el.className = 'hotspot';
    el.id = `hs-${z.id}`;
    el.style.left = z.x;
    el.style.top  = z.y;
    el.style.animationDelay = `${Math.random()}s`;

    const nameStr = currentLang === 'en' ? z.name_en : z.name;
    const subStr  = currentLang === 'en' ? z.sub_en : z.sub;

    el.innerHTML = `
      <div class="hs-card" style="pointer-events:none">
        <div class="hs-badge">${z.num}</div>
        <div class="hs-icon">${icons[z.id] || ''}</div>
        <div class="hs-info">
          <div class="hs-name">${nameStr}</div>
          <div class="hs-sub">${subStr}</div>
        </div>
      </div>`;
    el.addEventListener('click',    () => { if (!isBusy) activateZone(z.id); });
    el.addEventListener('touchend', e => { e.preventDefault(); if (!isBusy) activateZone(z.id); });
    layer.appendChild(el);
  });
}

// ─── POSE SWITCH ───────────────────────────────
function switchPose(zoneId) {
  const zone      = ZONES.find(z => z.id === zoneId);
  const container = document.getElementById('avatarContainer');
  const imgEl     = document.getElementById('avatar');

  container.classList.remove('idle', 'reacting', 'hidden');
  container.classList.add('switching');

  setTimeout(() => {
    imgEl.src = zone.pose;
    // Remove switching once image is ready
    const done = () => {
      container.classList.remove('switching');
      container.classList.add('idle');
    };
    if (imgEl.complete) done();
    else imgEl.onload = done;
  }, 280);
}

// ─── ACTIVATE ZONE ─────────────────────────────
function activateZone(zoneId) {
  if (zoneId === activeZone || isBusy) return;
  isBusy = true;

  const zone = ZONES.find(z => z.id === zoneId);
  if (!zone) { isBusy = false; return; }

  // Hotspot active state
  document.querySelectorAll('.hotspot').forEach(h => h.classList.remove('active'));
  const hsDom = document.getElementById(`hs-${zoneId}`);
  if (hsDom) hsDom.classList.add('active');

  // Pose + reaction
  switchPose(zoneId);
  triggerAvatarReact();

  // Zone title
  const titleEl = document.getElementById('panelZoneTitle');
  if (titleEl) titleEl.textContent = currentLang === 'en' ? zone.name_en : zone.name;

  // Hide room hotspots and dim room
  const hsLayer = document.getElementById('hotspotsLayer');
  if(hsLayer) {
    hsLayer.style.opacity = '0';
    hsLayer.style.pointerEvents = 'none';
  }
  const overlay = document.querySelector('.scene-overlay');
  if(overlay) overlay.classList.add('dimmed');



  // Panel content
  const body = document.getElementById('panelBody');
  body.style.opacity   = '0';
  body.style.transform = 'translateY(-8px)';
  setTimeout(() => {
    if (clockTimer) { clearInterval(clockTimer); clockTimer = null; }
    body.innerHTML = renderSection(zoneId);
    body.scrollTop = 0;
    body.style.transition = 'opacity .3s ease, transform .3s ease';
    body.style.opacity    = '1';
    body.style.transform  = 'translateY(0)';
    setTimeout(() => { postRender(zoneId); isBusy = false; }, 120);
  }, 260);

  document.getElementById('infoPanel').classList.add('visible');
  document.getElementById('avatarContainer').classList.remove('hidden');
  document.getElementById('avatarContainer').classList.add('idle');
  activeZone = zoneId;
}

function closeZone() {
  if (isBusy || !activeZone) return;
  activeZone = null;
  
  // Hide panel
  document.getElementById('infoPanel').classList.remove('visible');
  
  // Show room hotspots and remove dim
  const hsLayer = document.getElementById('hotspotsLayer');
  if(hsLayer) {
    hsLayer.style.opacity = '1';
    hsLayer.style.pointerEvents = 'all';
  }
  const overlay = document.querySelector('.scene-overlay');
  if(overlay) overlay.classList.remove('dimmed');

  // Reset avatar to main yo3d.png and move to center
  const av = document.getElementById('avatarContainer');
  const imgEl = document.getElementById('avatar');
  av.classList.remove('idle');
  av.classList.add('switching');
  setTimeout(() => {
    imgEl.src = 'img/yo3d.png';
    const done = () => {
      av.classList.remove('switching');
      av.classList.add('hidden');
    };
    if (imgEl.complete) done();
    else imgEl.onload = done;
  }, 280);
  
  // Deselect hotspots
  document.querySelectorAll('.hotspot').forEach(h => h.classList.remove('active'));
}

function navigateZone(dir) {
  if (isBusy || !activeZone) return;
  const idx = ZONES.findIndex(z => z.id === activeZone);
  if (idx < 0) return;
  const newIdx = (idx + dir + ZONES.length) % ZONES.length;
  activateZone(ZONES[newIdx].id);
}

function updatePanelHeader(zone) {
  const titleEl = document.getElementById('panelZoneTitle');
  if (titleEl) titleEl.textContent = currentLang === 'en' ? zone.name_en : zone.name;
}

// ─── EFFECTS ───────────────────────────────────
function triggerAvatarReact() {
  const av = document.getElementById('avatarContainer');
  av.classList.remove('reacting');
  void av.offsetWidth;
  av.classList.add('reacting');
  setTimeout(() => av.classList.remove('reacting'), 500);
}

function triggerZoneGlow(zone) {
  const g = document.getElementById('zoneGlow');
  g.style.left = zone.x; g.style.top = zone.y;
  g.classList.remove('fade');
  g.classList.add('active');
  setTimeout(() => {
    g.classList.add('fade');
    setTimeout(() => g.classList.remove('active','fade'), 1400);
  }, 400);
}

function triggerBgZoom() {
  const bg = document.querySelector('.scene-bg');
  bg.style.transition = 'transform .6s ease';
  bg.style.transform  = 'scale(1.07)';
  setTimeout(() => {
    bg.style.transition = 'transform .35s ease';
    bg.style.transform  = '';
  }, 620);
}

// ─── PARALLAX ──────────────────────────────────
function initParallax() {
  document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });
  (function tick() {
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    const dx = (mouseX - cx) / cx;
    const dy = (mouseY - cy) / cy;
    const bg = document.querySelector('.scene-bg');
    if (bg && !bg.style.transition.includes('.6s')) {
      bg.style.transform = `scale(1.015) translate(${-dx * 6}px, ${-dy * 4}px)`;
    }
    rafId = requestAnimationFrame(tick);
  })();
}

// ─── LIVE CLOCK ────────────────────────────────
function startClock() {
  const update = () => {
    const el = document.getElementById('liveClock');
    if (!el) { if(clockTimer) clearInterval(clockTimer); clockTimer = null; return; }
    const now = new Date();
    const pad = n => String(n).padStart(2,'0');
    el.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  };
  update();
  clockTimer = setInterval(update, 1000);
}

// ─── LANGUAGE TOGGLE ───────────────────────────
function toggleLanguage() {
  currentLang = currentLang === 'es' ? 'en' : 'es';
  document.documentElement.lang = currentLang;
  
  const btn = document.getElementById('langToggleBtn');
  if (btn) {
    btn.innerHTML = currentLang === 'en' 
      ? '<span style="opacity:0.5">ES</span> | <strong>EN</strong>' 
      : '<strong>ES</strong> | <span style="opacity:0.5">EN</span>';
  }
  
  updateStaticText();
  buildHotspots();
  
  if (cvData) hydrateSocialBar();
  
  if (activeZone) {
    const body = document.getElementById('panelBody');
    body.innerHTML = renderSection(activeZone);
    const zone = ZONES.find(z => z.id === activeZone);
    updatePanelHeader(zone);
  }
}

function updateStaticText() {
  const tTitle = document.querySelector('.header-title');
  const tSub = document.querySelector('.header-sub');
  const tHint = document.querySelector('.header-hint');
  
  if (currentLang === 'en') {
    if(tTitle) tTitle.textContent = "MY INTERACTIVE PORTFOLIO";
    if(tSub) tSub.textContent = "Explore the setup and learn more about me";
    if(tHint) tHint.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Click on the interactive zones`;
  } else {
    if(tTitle) tTitle.textContent = "MI PORTAFOLIO INTERACTIVO";
    if(tSub) tSub.textContent = "Explora el setup y conoce más sobre mí";
    if(tHint) tHint.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Haz clic en las zonas interactivas`;
  }
}

// ─── SKILL BARS ────────────────────────────────
function animateBars(container) {
  container.querySelectorAll('.skill-fill').forEach((bar, i) => {
    bar.style.width = '0%';
    setTimeout(() => {
      bar.style.transition = `width ${.75 + Math.random()*.4}s cubic-bezier(.4,0,.2,1)`;
      bar.style.width = bar.dataset.level + '%';
    }, 80 + i * 65);
  });
}

// ─── POST-RENDER ───────────────────────────────
function postRender(zoneId) {
  if (zoneId === 'skills')  animateBars(document.getElementById('panelBody'));
  if (zoneId === 'contact') startClock();
}

// ─── RENDERERS ─────────────────────────────────
function renderSection(zoneId) {
  if(!cvData) return '';
  const data = cvData[currentLang];
  switch (zoneId) {
    case 'about': return renderAbout(data);
    case 'experience': return renderExperience(data);
    case 'skills': return renderSkills(data);
    case 'projects': return renderProjects(data);
    case 'technologies': return renderTech(data);
    case 'certifications': return renderCerts(data);
    case 'softSkills': return renderSoftSkills(data);
    case 'contact': return renderContact(data);
    default: return '';
  }
}

function renderAbout(data) {
  const { personal, about } = data;
  const t = currentLang === 'en' ? {
    pres: "Introduction", spec: "Specialties", inNum: "By the numbers", dlCv: "Download Full CV"
  } : {
    pres: "Presentación", spec: "Especialidades", inNum: "En números", dlCv: "Descargar CV Completo"
  };

  return `
    <div class="about-profile corner-card">
      <div class="about-avatar"><img src="${personal.photo}" alt="${personal.name}" loading="lazy"></div>
      <div>
        <div class="about-name">${personal.name}</div>
        <div class="about-title">${personal.title} · ${personal.subtitle}</div>
        <div class="about-location">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:2px"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
          ${personal.location}
        </div>
        <div class="avail-badge"><span class="dot"></span>${personal.availabilityText}</div>
      </div>
    </div>
    <div class="section-label">${t.pres}</div>
    ${about.description.map((p, i) => `<p class="about-desc" style="animation-delay:${i * 0.08}s">${p}</p>`).join('')}
    <div class="divider"></div>
    <div class="section-label">${t.spec}</div>
    <div class="highlights-grid">
      ${about.highlights.map(h => `<div class="hl-chip"><span class="hl-icon">${h.icon}</span><span>${h.text}</span></div>`).join('')}
    </div>
    <div class="section-label">${t.inNum}</div>
    <div class="stats-row">
      ${about.stats.map(s => `<div class="stat-box"><span class="stat-val">${s.value}</span><span class="stat-lbl">${s.label}</span></div>`).join('')}
    </div>
    <a href="${personal.cv}" target="_blank" rel="noopener" class="btn-primary">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
      ${t.dlCv}
    </a>`;
}

function renderExperience(data) {
  const t = currentLang === 'en' ? "Career Path" : "Trayectoria Profesional";
  const icons = ['⚡', '🛠', '🏛'];
  return `
    <div class="section-label">${t}</div>
    ${data.experience.map((exp, i) => `
      <div class="exp-card corner-card" style="border-left-color:${exp.color}">
        <div class="exp-meta">
          <span class="exp-period">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:2px"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            ${exp.period}
          </span>
          ${exp.badge ? `<span class="exp-badge"><span class="glow-dot" style="color:var(--cyan)"></span>${exp.badge}</span>` : ''}
        </div>
        <div class="exp-role">
          <span class="exp-role-icon" style="background:${exp.color}22;color:${exp.color};border:1px solid ${exp.color}44">${icons[i] || '▸'}</span>
          ${exp.role}
        </div>
        <div class="exp-company">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>
          ${exp.company} · ${exp.location}
        </div>
        <ul class="exp-list">${exp.achievements.map(a => `<li>${a}</li>`).join('')}</ul>
        ${exp.achievement_badge ? `<div class="exp-achievement"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> ${exp.achievement_badge}</div>` : ''}
      </div>`).join('')}
    <div class="divider"></div>`;
}

function renderSkills(data) {
  const t = currentLang === 'en' ? "Technical Skills" : "Habilidades Técnicas";
  return `
    <div class="section-label">${t}</div>
    ${data.skills.map(cat => `
      <div class="skill-cat">
        <div class="skill-cat-header">
          <span class="skill-cat-icon">${cat.icon}</span>
          <span class="skill-cat-name" style="color:${cat.color}">${cat.category}</span>
        </div>
        <div class="tech-chips" style="display:flex; flex-wrap:wrap; gap:0.5rem; margin-top:0.5rem; padding-left:1.8rem;">
          ${cat.items.map(item => `<span class="tech-chip" style="color:#e0e0e0; border: 1px solid ${cat.color}55; background:rgba(15,15,30,0.4); padding: 0.35rem 0.8rem; border-radius: 8px; font-size: 0.75rem;">${item.name}</span>`).join('')}
        </div>
      </div>`).join('')}
    <div class="divider"></div>`;
}

function renderProjects(data) {
  const t = currentLang === 'en' ? { proj: "Featured Projects", viewGh: "View on GitHub" } : { proj: "Proyectos Destacados", viewGh: "Ver en GitHub" };
  return `
    <div class="section-label">${t.proj}</div>
    ${data.projects.map(p => `
      <div class="project-card corner-card" style="border-left-color:${p.color}">
        <div class="proj-head">
          <span class="proj-num" style="color:${p.color};background:${p.color}15">${p.number}</span>
          <span class="proj-title">${p.title}</span>
        </div>
        <div class="proj-type">
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          ${p.type}
        </div>
        <div class="proj-desc">${p.description}</div>
        ${p.achievements ? `<ul class="exp-list" style="margin-top:.5rem">${p.achievements.map(a => `<li>${a}</li>`).join('')}</ul>` : ''}
        <div class="tags">
          ${p.tags.map(t => `<span class="tag" style="color:${p.color};border-color:${p.color}44;background:${p.color}12">${t}</span>`).join('')}
        </div>
        ${p.github ? `<a href="${p.github}" target="_blank" rel="noopener" class="cert-link" style="margin-top:.45rem">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg> ${t.viewGh}</a>` : ''}
      </div>`).join('')}
    <div class="divider"></div>`;
}

function renderTech(data) {
  const t = currentLang === 'en' ? {
    techEcosys: "Tech Ecosystem", techSub: "Full Stack · Cloud · DevOps · Automation · AI"
  } : {
    techEcosys: "Ecosistema Tecnológico", techSub: "Full Stack · Cloud · DevOps · Automatización · IA"
  };
  return `
    <div class="tech-intro">
      <div class="tech-intro-label">
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:3px"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
        ${t.techEcosys}
      </div>
      <div class="tech-intro-val">${t.techSub}</div>
    </div>
    ${data.technologies.categories.map(cat => `
      <div class="tech-cat">
        <div class="tech-cat-name">${cat.name}</div>
        <div class="tech-chips">
          ${cat.items.map(item => `<span class="tech-chip" style="color:${cat.color};border-color:${cat.color}44;background:${cat.color}12">${item}</span>`).join('')}
        </div>
      </div>`).join('')}
    <div class="divider"></div>`;
}

function renderCerts(data) {
  const t = currentLang === 'en' ? {
    edu: "Formal Education", certs: "Certifications & Courses", viewCert: "View PDF certificate"
  } : {
    edu: "Educación Formal", certs: "Certificaciones & Cursos", viewCert: "Ver certificado PDF"
  };
  return `
    <div class="section-label">${t.edu}</div>
    <div class="exp-card corner-card" style="border-left-color:#4CAF50; margin-bottom:1.2rem; background:linear-gradient(135deg,rgba(76,175,80,.06),rgba(76,175,80,.02));">
      <div class="exp-meta">
        <span class="exp-period">
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:2px"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          ${data.education.period}
        </span>
      </div>
      <div class="exp-role" style="color:var(--text-primary);font-size:1.05em;">
        <span class="exp-role-icon" style="background:rgba(76,175,80,.15);color:#4CAF50;border:1px solid rgba(76,175,80,.3)">🎓</span>
        ${data.education.degree}
      </div>
      <div class="exp-company" style="margin-top:.3rem;">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="vertical-align:middle;margin-right:3px"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
        ${data.education.institution}
      </div>
      <div class="exp-achievement" style="margin-top:.5rem;color:#4CAF50;border-color:rgba(76,175,80,.3);background:rgba(76,175,80,.08);">
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        ${data.education.status}
      </div>
    </div>
    <div class="section-label">${t.certs}</div>
    <div class="cert-timeline">
      ${data.certifications.map(cert => `
        <div class="cert-item corner-card" onclick="window.open('${cert.pdf.replace(/'/g, "\\'")}','_blank')" title="${t.viewCert}">
          <div class="cert-year">${cert.year}</div>
          <div class="cert-name">${cert.name}</div>
          <div class="cert-org">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:2px"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            ${cert.org}
          </div>
          <div class="cert-link">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            ${t.viewCert}
          </div>
        </div>`).join('')}
    </div>`;
}

function renderSoftSkills(data) {
  const t = currentLang === 'en' ? "Soft Skills" : "Habilidades Blandas";
  return `
    <div class="section-label">${t}</div>
    ${data.softSkills.map(s => `
      <div class="ss-item corner-card">
        <div class="ss-icon">${s.icon}</div>
        <div>
          <div class="ss-name">${s.name}</div>
          <div class="ss-desc">${s.desc}</div>
        </div>
      </div>`).join('')}
    <div class="divider"></div>`;
}

function renderContact(data) {
  const { contact } = data;
  const sub = currentLang === 'en' ? "Local time · Quito, Ecuador (UTC-5)" : "Hora local · Quito, Ecuador (UTC-5)";
  const lblView = currentLang === 'en' ? "View profile" : "Ver perfil";
  const lblRepo = currentLang === 'en' ? "View repos" : "Ver repos";
  const lblChat = currentLang === 'en' ? "Chat now" : "Chatear";
  const dlCv = currentLang === 'en' ? "Download Full CV" : "Descargar CV Completo";
  return `
    <div class="clock-wrap">
      <span class="clock-digits" id="liveClock">00:00:00</span>
      <span class="clock-sub">${sub}</span>
    </div>
    <div class="contact-msg">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="vertical-align:middle;margin-right:3px;opacity:.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
      ${contact.message}
    </div>
    <div class="contact-grid">
      <a href="mailto:${contact.email}" class="contact-btn-card cb-email">
        <span class="cb-icon">✉️</span><span class="cb-label">Email</span>
        <span class="cb-sub">${contact.email}</span>
      </a>
      <a href="${contact.linkedin}" target="_blank" rel="noopener" class="contact-btn-card cb-linkedin">
        <span class="cb-icon">💼</span><span class="cb-label">LinkedIn</span><span class="cb-sub">${lblView}</span>
      </a>
      <a href="${contact.github}" target="_blank" rel="noopener" class="contact-btn-card cb-github">
        <span class="cb-icon">🐙</span><span class="cb-label">GitHub</span><span class="cb-sub">${lblRepo}</span>
      </a>
      <a href="${contact.whatsapp}" target="_blank" rel="noopener" class="contact-btn-card cb-whatsapp">
        <span class="cb-icon">💬</span><span class="cb-label">WhatsApp</span><span class="cb-sub">${lblChat}</span>
      </a>
    </div>
    <div class="contact-loc">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:3px"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
      ${contact.location}
    </div>
    <a href="${contact.cv}" target="_blank" rel="noopener" class="btn-primary" style="margin-top:.85rem">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
      ${dlCv}
    </a>`;
}

function hydrateSocialBar() {
  if (!cvData) return;
  const p = cvData[currentLang].personal;
  const g = id => document.getElementById(id);
  g('sb-github').href   = p.github;
  g('sb-linkedin').href = p.linkedin;
  g('sb-email').href    = `mailto:${p.email}`;
}

// ─── WELCOME ───────────────────────────────────
function runWelcome() {
  document.querySelectorAll('.hotspot').forEach((hs, i) => {
    setTimeout(() => {
      hs.style.transition = 'opacity .4s ease, transform .5s cubic-bezier(.34,1.56,.64,1)';
      hs.style.opacity    = '1';
      hs.style.transform  = 'translate(-50%,-50%) scale(1)';
    }, 200 + i * 90);
  });
  
  // Bind navigation buttons
  const closeBtn = document.getElementById('closePanelBtn');
  const prevBtn  = document.getElementById('prevZoneBtn');
  const nextBtn  = document.getElementById('nextZoneBtn');
  if (closeBtn) closeBtn.addEventListener('click', closeZone);
  if (prevBtn)  prevBtn.addEventListener('click', () => navigateZone(-1));
  if (nextBtn)  nextBtn.addEventListener('click', () => navigateZone(1));
}

// ─── LOADER ────────────────────────────────────
function runLoader(onDone) {
  const fill = document.getElementById('loaderFill');
  let progress = 0;
  const step = () => {
    progress += Math.random() * 18 + 5;
    if (progress >= 100) {
      fill.style.width = '100%';
      setTimeout(() => {
        const loader = document.getElementById('loader');
        loader.classList.add('out');
        setTimeout(() => { loader.style.display = 'none'; onDone(); }, 620);
      }, 280);
    } else {
      fill.style.width = progress + '%';
      setTimeout(step, 90 + Math.random() * 55);
    }
  };
  setTimeout(step, 300);
}

// ─── UTILS ─────────────────────────────────────
function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ─── INIT ──────────────────────────────────────
async function init() {
  cvData = await loadCV();
  buildHotspots();
  preloadPoses();
  initParallax();
  if (cvData) hydrateSocialBar();
  
  const langBtn = document.getElementById('langToggleBtn');
  if(langBtn) langBtn.addEventListener('click', toggleLanguage);
  
  runLoader(runWelcome);
}

document.addEventListener('DOMContentLoaded', init);

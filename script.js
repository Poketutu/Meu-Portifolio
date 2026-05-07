/* ═══════════════════════════════════════════════
   PORTFOLIO GAMER/TECH — script.js
   Autor: Seu Nome
   ═══════════════════════════════════════════════ */

'use strict';

// ────────────────────────────────────────────────
// 1. CURSOR PERSONALIZADO
// ────────────────────────────────────────────────
(function initCursor() {
  const dot  = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if (!dot || !ring) return;

  let mouseX = 0, mouseY = 0;
  let ringX  = 0, ringY  = 0;
  let animId;

  // Atualiza posição do ponto instantaneamente
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top  = mouseY + 'px';
  });

  // Anel segue com delay (lerp)
  function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';
    animId = requestAnimationFrame(animateRing);
  }
  animateRing();

  // Efeito hover em links e botões
  const hoverTargets = document.querySelectorAll('a, button, .stack-card, .projeto-card, .hex-item, .contact-card');
  hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hovered'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hovered'));
  });

  // Esconder cursor fora da janela
  document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = '1'; });
})();


// ────────────────────────────────────────────────
// 2. CANVAS DE PARTÍCULAS
// ────────────────────────────────────────────────
(function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles = [];
  const PARTICLE_COUNT = 80;
  const COLORS = ['#bd00ff', '#00d4ff', '#00ff88', '#0084ff'];

  // Redimensionar canvas
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  // Classe Partícula
  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x     = Math.random() * W;
      this.y     = Math.random() * H;
      this.vx    = (Math.random() - 0.5) * 0.35;
      this.vy    = (Math.random() - 0.5) * 0.35;
      this.r     = Math.random() * 1.5 + 0.5;
      this.alpha = Math.random() * 0.5 + 0.1;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      // Rebater nas bordas
      if (this.x < 0 || this.x > W) this.vx *= -1;
      if (this.y < 0 || this.y > H) this.vy *= -1;
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle   = this.color;
      ctx.shadowBlur  = 6;
      ctx.shadowColor = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Criar partículas
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle());
  }

  // Desenhar linhas de conexão entre partículas próximas
  function drawConnections() {
    const MAX_DIST = 100;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          const alpha = (1 - dist / MAX_DIST) * 0.07;
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.strokeStyle = '#bd00ff';
          ctx.lineWidth   = 0.5;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
  }

  // Loop de animação
  function animate() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    requestAnimationFrame(animate);
  }
  animate();
})();


// ────────────────────────────────────────────────
// 3. NAVBAR — scroll e menu mobile
// ────────────────────────────────────────────────
(function initNavbar() {
  const navbar   = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-link');
  const navLinks   = document.querySelectorAll('.nav-links a');

  // Efeito scroll
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });

  // Toggle menu mobile
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
    document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
  });

  // Fechar ao clicar em link
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // Link ativo baseado na seção visível
  const sections = document.querySelectorAll('section[id]');
  const observerOptions = {
    root: null,
    rootMargin: '-40% 0px -40% 0px',
    threshold: 0
  };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.dataset.section === id);
        });
      }
    });
  }, observerOptions);
  sections.forEach(s => observer.observe(s));
})();


// ────────────────────────────────────────────────
// 4. SMOOTH SCROLL
// ────────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    const offset = 70; // altura da navbar
    const top    = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});


// ────────────────────────────────────────────────
// 5. TYPING TAG NA HERO
// ────────────────────────────────────────────────
(function initTypingTag() {
  const el   = document.getElementById('tagTyping');
  if (!el) return;
  const text = 'STATUS: DISPONÍVEL PARA PROJETOS';
  let   i    = 0;

  function type() {
    if (i < text.length) {
      el.textContent += text[i++];
      setTimeout(type, 55);
    }
  }
  setTimeout(type, 800);
})();


// ────────────────────────────────────────────────
// 6. ANIMAÇÃO DE CONTADORES (hero stats)
// ────────────────────────────────────────────────
(function initCounters() {
  const nums = document.querySelectorAll('.stat-num[data-target]');
  let started = false;

  function animateCounters() {
    nums.forEach(el => {
      const target   = parseInt(el.dataset.target);
      const duration = 1800;
      const start    = performance.now();

      function update(now) {
        const elapsed  = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Easing out quart
        const eased = 1 - Math.pow(1 - progress, 4);
        el.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(update);
        else el.textContent = target;
      }
      requestAnimationFrame(update);
    });
  }

  // Dispara quando hero está visível
  const heroObs = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !started) {
      started = true;
      setTimeout(animateCounters, 600);
    }
  }, { threshold: 0.5 });
  const hero = document.getElementById('home');
  if (hero) heroObs.observe(hero);
})();


// ────────────────────────────────────────────────
// 7. REVEAL NO SCROLL (IntersectionObserver)
// ────────────────────────────────────────────────
(function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

  els.forEach(el => observer.observe(el));
})();


// ────────────────────────────────────────────────
// 8. BARRAS DE PROGRESSO DE SKILLS
// ────────────────────────────────────────────────
(function initSkillBars() {
  const bars = document.querySelectorAll('.skill-bar-fill');
  if (!bars.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar   = entry.target;
        const width = bar.dataset.width;
        const color = bar.dataset.color;

        // Delay escalonado
        const idx   = Array.from(bars).indexOf(bar);
        setTimeout(() => {
          bar.style.width      = width + '%';
          bar.style.background = `linear-gradient(90deg, ${color}88, ${color})`;
          bar.style.boxShadow  = `0 0 10px ${color}88`;
        }, idx * 120);

        observer.unobserve(bar);
      }
    });
  }, { threshold: 0.5 });

  bars.forEach(bar => observer.observe(bar));
})();


// ────────────────────────────────────────────────
// 9. COR DAS STACK CARDS (CSS var dinâmica)
// ────────────────────────────────────────────────
document.querySelectorAll('.stack-card[data-color]').forEach(card => {
  card.style.setProperty('--card-color', card.dataset.color);
});


// ────────────────────────────────────────────────
// 10. BOTÃO VOLTAR AO TOPO
// ────────────────────────────────────────────────
(function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


// ────────────────────────────────────────────────
// 11. ANO NO FOOTER
// ────────────────────────────────────────────────
const yearEl = document.getElementById('footerYear');
if (yearEl) yearEl.textContent = new Date().getFullYear();


// ────────────────────────────────────────────────
// 12. EFEITO GLITCH NO NOME HERO (hover)
// ────────────────────────────────────────────────
(function initGlitch() {
  const accentLine = document.querySelector('.accent-glow');
  if (!accentLine) return;

  accentLine.addEventListener('mouseenter', () => {
    accentLine.style.animation = 'glitch 0.4s steps(2, end) 2';
  });
  accentLine.addEventListener('animationend', () => {
    accentLine.style.animation = '';
  });

  // Injetar keyframe de glitch
  const style = document.createElement('style');
  style.textContent = `
    @keyframes glitch {
      0%   { text-shadow: 0 0 20px #00d4ff, 0 0 60px #00d4ff44; clip-path: inset(0 0 100% 0); }
      20%  { text-shadow: -3px 0 #bd00ff, 3px 0 #00d4ff; clip-path: inset(30% 0 40% 0); }
      40%  { text-shadow: 3px 0 #00ff88, -3px 0 #0084ff; clip-path: inset(60% 0 20% 0); }
      60%  { text-shadow: -3px 0 #bd00ff, 3px 0 #00d4ff; clip-path: inset(10% 0 70% 0); }
      80%  { text-shadow: 3px 0 #00ff88, -3px 0 #0084ff; clip-path: inset(80% 0 5% 0); }
      100% { text-shadow: 0 0 20px #00d4ff, 0 0 60px #00d4ff44; clip-path: inset(0 0 0 0); }
    }
  `;
  document.head.appendChild(style);
})();


// ────────────────────────────────────────────────
// 13. EFEITO DE LINHA DE SCAN NAS SEÇÕES
//     (decorativo, leve scanline no hover de cards)
// ────────────────────────────────────────────────
(function initScanlines() {
  document.querySelectorAll('.projeto-card').forEach(card => {
    const scanLine = document.createElement('div');
    scanLine.style.cssText = `
      position: absolute;
      top: -100%;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, rgba(0,212,255,0.4), transparent);
      pointer-events: none;
      transition: top 0s;
      z-index: 10;
    `;
    card.style.position = 'relative';
    card.appendChild(scanLine);

    let animating = false;
    card.addEventListener('mouseenter', () => {
      if (animating) return;
      animating = true;
      scanLine.style.transition = 'top 0.5s linear';
      scanLine.style.top = '110%';
      setTimeout(() => {
        scanLine.style.transition = 'none';
        scanLine.style.top = '-100%';
        animating = false;
      }, 520);
    });
  });
})();


// ────────────────────────────────────────────────
// 14. INICIALIZAÇÃO GERAL
// ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Pequeno fade-in no body ao carregar
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.5s ease';
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.body.style.opacity = '1';
    });
  });

  console.log(
    '%c< PORTFOLIO GAMER /> \n%cSeu Nome — Front-end Developer\nVersão 1.0 — Feito com ❤️ e muito ☕',
    'color: #00d4ff; font-size: 18px; font-weight: bold; font-family: monospace;',
    'color: #bd00ff; font-size: 12px; font-family: monospace;'
  );
});

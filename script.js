(function () {
  const STORAGE_KEY = 'bricemg_site_content_v1';

  function getContent() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return window.defaultContent;
    try {
      const parsed = JSON.parse(raw);
      return {
        ...window.defaultContent,
        ...parsed,
        site: {
          ...(window.defaultContent.site || {}),
          ...(parsed.site || {})
        },
        theme: {
          ...(window.defaultContent.theme || {}),
          ...(parsed.theme || {})
        },
        cards: parsed.cards || window.defaultContent.cards,
        projects: parsed.projects || window.defaultContent.projects
      };
    } catch (error) {
      return window.defaultContent;
    }
  }

  function render() {
    const content = getContent();
    const app = document.getElementById('app');
    if (!app) return;

    app.innerHTML = `
      <div class="sheet">
        <div class="row row--three">
          <div class="cell">
            <div class="cell-top"><span class="dot title">${content.site.title.split(' / ')[0]}</span></div>
            <div class="cell-body">
              <div class="meta">
                <b>${content.site.title.split(' / ')[1] || 'STUDIO'}</b>
                ${content.site.subtitle}<br />
                INDEX V0.1<br />
                LANGUAGE : FR
              </div>
            </div>
          </div>

          <div class="cell">
            <div class="cell-top"><span class="dot title">NOUS</span></div>
            <div class="cell-body">
              <div class="meta">
                <b>CRÉ ER</b>
                ${content.site.intro}
              </div>
              <div class="meta">
                <b>RÉFLEXION</b>
                PENSER, CONCEVOIR ET DÉVELOPPER DE A À Z.
              </div>
              <div class="meta">
                <b>OBJECTIF</b>
                ${content.site.about}
              </div>
            </div>
          </div>

          <div class="cell cell--play" id="field">
            <div class="play" aria-hidden="true"><canvas></canvas></div>
            <div class="cell-body">
              <p class="claim">${content.site.heroClaim}</p>
            </div>
          </div>
        </div>

        <div class="bar">
          <span class="dot">A</span>
          <h2>ATELIER</h2>
          <span class="count">/ ${content.cards.length}</span>
        </div>
        <div class="row">
          ${content.cards.map((card, index) => `
            <a class="cell tool" data-tool="${card.id}" data-released="2026-10-05" href="#" target="_self">
              <div class="cell-top"><span class="dot idx">${String(index + 1).padStart(2, '0')}</span><span class="cue"></span></div>
              <div class="name">${card.title}</div>
              <div class="cell-body">
                <div class="meta">
                  <span class="code">${card.code}</span>
                  <span class="desc">${card.desc}</span>
                </div>
                <dl class="dates">
                  <div><dt>TYPE</dt><dd>${card.type}</dd></div>
                  <div><dt>STATUT</dt><dd>${card.status}</dd></div>
                </dl>
                <div class="go">VOIR<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3.5 8.5 8.5 3.5M4.5 3.5H8.5V7.5" fill="none" stroke="currentColor" stroke-width="1.4"/></svg></div>
              </div>
            </a>
          `).join('')}
        </div>

        <div class="bar">
          <span class="dot">B</span>
          <h2>PROJETS</h2>
          <span class="count">/ ${content.projects.length}</span>
        </div>
        <div class="row">
          ${content.projects.map((project, index) => `
            <a class="cell tool" data-tool="${project.id}" data-released="2026-10-05" href="#" target="_self">
              <div class="cell-top"><span class="dot idx">${String(index + 5).padStart(2, '0')}</span><span class="cue"></span></div>
              <div class="name">${project.title}</div>
              <div class="cell-body">
                <div class="meta">
                  <span class="code">${project.code}</span>
                  <span class="desc">${project.desc}</span>
                </div>
                <dl class="dates">
                  <div><dt>TYPE</dt><dd>${project.type}</dd></div>
                  <div><dt>PHASE</dt><dd>${project.phase}</dd></div>
                </dl>
                <div class="go">VOIR<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3.5 8.5 8.5 3.5M4.5 3.5H8.5V7.5" fill="none" stroke="currentColor" stroke-width="1.4"/></svg></div>
              </div>
            </a>
          `).join('')}
        </div>

        <div class="row row--three">
          <div class="cell plate">
            <div class="cell-top"><span class="dot idx">F</span></div>
            <div class="label">INFO</div>
            <div class="cell-body">
              <div class="meta">
                <b>ÉTAT</b>
                CRÉATION D'UNE BASE VISUELLE ET D'UNE PREMIÈRE VERSION D'EXPOSITION.
              </div>
              <div class="meta">
                <b>FOCUS</b>
                DESIGN, DÉVELOPPEMENT, EXPÉRIMENTATION ET STORYTELLING.
              </div>
            </div>
          </div>

          <div class="cell plate">
            <div class="cell-top"><span class="dot idx">G</span></div>
            <div class="label">APPROCHE</div>
            <div class="cell-body">
              <div class="meta">
                <b>PRINCIPE</b>
                CLARTÉ, RÉPÉTITION, RYTHME, STRUCTURE ET PLAINES DE COULEUR.
              </div>
              <div class="meta">
                <b>MOOD</b>
                MINIMAL, CALME, MODERNE, UN PEU TECHNIQUE ET CURIEUX.
              </div>
            </div>
          </div>

          <div class="cell plate">
            <div class="cell-top"><span class="dot idx">H</span><span class="rdot"></span></div>
            <div class="label">CONTACT</div>
            <div class="cell-body">
              <div class="meta">
                POUR UN PROJET, UNE COLLABORATION, OU UNE DISCUSSION.<br />
                ÉCRIS À <a class="mailto" href="mailto:${content.site.email}">${content.site.email}</a>
              </div>
            </div>
          </div>
        </div>

        <div class="foot">
          <span>${content.site.title.split(' / ')[0]}</span>
          <span>${content.site.subtitle}</span>
          <span>DESIGN / CODE / VISION</span>
          <span>${content.site.email}</span>
          <span>&copy; 2026</span>
        </div>
      </div>

      <a href="admin.html" class="cms-link">CMS</a>
    `;
  }

  function initAnimation() {
    const cell = document.getElementById('field');
    if (!cell) return;

    const host = cell.querySelector('.play');
    if (!host) return;

    const canvas = host.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const INK = '#0a0a0a';
    const PAPER = (getComputedStyle(document.documentElement)
      .getPropertyValue('--cell') || '#f0f0f0').trim() || '#f0f0f0';
    let FIELD = 150;
    const PULL = 0.20;
    const DAMP_IDLE = 0.995;
    const DAMP_PULL = 0.985;
    const STEER = 0.012;
    const VMIN = 0.16;
    const VMAX = 0.85;
    const VCAP = 6;
    const EASE = 0.06;
    const WALL = 0.98;
    const BOUNCE = 0.85;

    let w = 0, h = 0, bodies = [], raf = 0, last = 0;
    const pointer = { x: 0, y: 0, on: false };
    const still = window.matchMedia('(prefers-reduced-motion: reduce)');

    function measure() {
      const r = host.getBoundingClientRect();
      w = Math.max(1, Math.round(r.width));
      h = Math.max(1, Math.round(r.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      FIELD = Math.max(110, Math.min(230, (w + h) * 0.5));
    }

    function idealCount() {
      return Math.max(22, Math.min(90, Math.round((w * h) / 1900)));
    }

    function seed() {
      const n = idealCount();
      const big = Math.min(w, h) < 160 ? 6.5 : 8.5;
      bodies = [];
      for (let i = 0; i < n; i++) {
        const rad = 3 + Math.pow(Math.random(), 1.8) * big;
        const sp = VMIN + Math.random() * (VMAX - VMIN);
        const a = Math.random() * Math.PI * 2;
        bodies.push({
          x: rad + Math.random() * Math.max(1, w - rad * 2),
          y: rad + Math.random() * Math.max(1, h - rad * 2),
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          r: rad,
          m: rad * rad
        });
      }
    }

    function step(dt) {
      const pulling = pointer.on;
      const damp = Math.pow(pulling ? DAMP_PULL : DAMP_IDLE, dt);

      for (let i = 0; i < bodies.length; i++) {
        const b = bodies[i];
        if (pulling) {
          const dx = pointer.x - b.x;
          const dy = pointer.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy) || 0.01;
          if (d < FIELD) {
            const f = PULL * (1 - d / FIELD) * dt;
            b.vx += (dx / d) * f;
            b.vy += (dy / d) * f;
          }
        }

        b.vx += (Math.random() - 0.5) * STEER * dt;
        b.vy += (Math.random() - 0.5) * STEER * dt;
        b.vx *= damp;
        b.vy *= damp;

        const sp = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
        if (sp < 0.0001) {
          b.vx = (Math.random() - 0.5) * VMIN * 2;
          b.vy = (Math.random() - 0.5) * VMIN * 2;
        } else if (pulling) {
          if (sp > VCAP) {
            b.vx *= VCAP / sp;
            b.vy *= VCAP / sp;
          }
        } else {
          const want = sp < VMIN ? VMIN : (sp > VMAX ? VMAX : sp);
          if (want !== sp) {
            const k = 1 + (want / sp - 1) * Math.min(1, EASE * dt);
            b.vx *= k;
            b.vy *= k;
          }
        }

        b.x += b.vx * dt;
        b.y += b.vy * dt;

        if (b.x - b.r < 0) {
          b.x = b.r;
          b.vx = Math.abs(b.vx) * WALL;
        } else if (b.x + b.r > w) {
          b.x = w - b.r;
          b.vx = -Math.abs(b.vx) * WALL;
        }

        if (b.y - b.r < 0) {
          b.y = b.r;
          b.vy = Math.abs(b.vy) * WALL;
        } else if (b.y + b.r > h) {
          b.y = h - b.r;
          b.vy = -Math.abs(b.vy) * WALL;
        }
      }

      for (let i = 0; i < bodies.length; i++) {
        for (let j = i + 1; j < bodies.length; j++) {
          const a = bodies[i];
          const c = bodies[j];
          let ox = c.x - a.x;
          let oy = c.y - a.y;
          let dist = Math.sqrt(ox * ox + oy * oy);
          const min = a.r + c.r;
          if (dist === 0) {
            dist = 0.01;
            ox = 0.01;
            oy = 0;
          }
          if (dist >= min) continue;

          const nx = ox / dist;
          const ny = oy / dist;
          const over = min - dist;
          const tm = a.m + c.m;
          a.x -= nx * over * (c.m / tm);
          a.y -= ny * over * (c.m / tm);
          c.x += nx * over * (a.m / tm);
          c.y += ny * over * (a.m / tm);

          const sep = (c.vx - a.vx) * nx + (c.vy - a.vy) * ny;
          if (sep >= 0) continue;
          const imp = -(1 + BOUNCE) * sep / (1 / a.m + 1 / c.m);
          a.vx -= (imp / a.m) * nx;
          a.vy -= (imp / a.m) * ny;
          c.vx += (imp / c.m) * nx;
          c.vy += (imp / c.m) * ny;
        }
      }
    }

    function draw() {
      ctx.fillStyle = PAPER;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = INK;

      for (let i = 0; i < bodies.length; i++) {
        const b = bodies[i];
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function frame(now) {
      const dt = last ? Math.min((now - last) / 16.667, 2.5) : 1;
      last = now;
      step(dt);
      draw();
      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (still.matches) return;
      if (!raf) {
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    }

    function stop() {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    }

    function onPointerMove(event) {
      const rect = cell.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.on = true;
    }

    function onPointerLeave() {
      pointer.on = false;
    }

    measure();
    seed();
    draw();

    cell.addEventListener('pointermove', onPointerMove);
    cell.addEventListener('pointerleave', onPointerLeave);
    window.addEventListener('resize', function () {
      measure();
      seed();
      draw();
    });

    if (!still.matches) start();
  }

  // Render the page
  render();

  // Wait a tick for the DOM to update, then initialize animation
  requestAnimationFrame(() => {
    initAnimation();
  });
})();

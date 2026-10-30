// Canvas animation controller with universal browser support (Chrome, Canary, Opera, Safari, Firefox)

class CanvasAnimation {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) throw new Error('Canvas context not available');

    // Physics constants
    this.PULL = 0.20;
    this.DAMP_IDLE = 0.995;
    this.DAMP_PULL = 0.985;
    this.STEER = 0.012;
    this.VMIN = 0.16;
    this.VMAX = 0.85;
    this.VCAP = 6;
    this.EASE = 0.06;
    this.WALL = 0.98;
    this.BOUNCE = 0.85;

    // State
    this.w = 0;
    this.h = 0;
    this.bodies = [];
    this.raf = 0;
    this.last = 0;
    this.pointer = { x: 0, y: 0, on: false };
    this.FIELD = 150;
    this.resizeObserver = null;

    this.refreshColors();

    // Gentle motion instead of total freeze for prefers-reduced-motion
    this.still = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.isReducedMotion = this.still.matches;
    if (this.still.addEventListener) {
      this.still.addEventListener('change', (e) => {
        this.isReducedMotion = e.matches;
      });
    }
  }

  refreshColors() {
    const style = getComputedStyle(document.documentElement);
    this.INK = (style.getPropertyValue('--ink') || '#0a0a0a').trim() || '#0a0a0a';
    this.INK_SOFT = (style.getPropertyValue('--ink-soft') || '#6b6b6b').trim() || '#6b6b6b';
    this.PAPER = (style.getPropertyValue('--cell') || '#f0f0f0').trim() || '#f0f0f0';
  }

  // Robust measurement with fallback
  measure() {
    const parent = this.canvas.parentElement;
    const r = parent ? parent.getBoundingClientRect() : null;
    const measuredW = r && r.width ? Math.round(r.width) : 0;
    const measuredH = r && r.height ? Math.round(r.height) : 0;

    if (measuredW > 20 && measuredH > 20) {
      this.w = measuredW;
      this.h = measuredH;
    } else if (this.w < 20) {
      // Sensible default fallback while layout settles
      this.w = Math.max(280, Math.round(window.innerWidth * 0.3));
      this.h = 330;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(this.w * dpr);
    this.canvas.height = Math.round(this.h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.FIELD = Math.max(110, Math.min(230, (this.w + this.h) * 0.5));
  }

  idealCount() {
    return Math.max(22, Math.min(90, Math.round((this.w * this.h) / 1900)));
  }

  seed() {
    const n = this.idealCount();
    const big = Math.min(this.w, this.h) < 160 ? 6.5 : 8.5;

    // Number of "soft" circles : between 5 and 10, capped by n
    const softCount = Math.floor(n / 10)//Math.min(n, 5 + Math.floor(Math.random() * 6));

    this.bodies = [];
    for (let i = 0; i < n; i++) {
      const rad = 2 + 8 * Math.random()//3 + Math.pow(Math.random(), 1.8) * big;
      const sp = this.VMIN + Math.random() * (this.VMAX - this.VMIN);
      const a = Math.random() * Math.PI * 2;
      this.bodies.push({
        x: rad + Math.random() * Math.max(1, this.w - rad * 2),
        y: rad + Math.random() * Math.max(1, this.h - rad * 2),
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        r: rad,
        m: rad * rad,
        soft: i < softCount
      });
    }
  }

  step(dt) {
    const pulling = this.pointer.on;
    const damp = Math.pow(pulling ? this.DAMP_PULL : this.DAMP_IDLE, dt);

    for (let i = 0; i < this.bodies.length; i++) {
      const b = this.bodies[i];
      if (pulling) {
        const dx = this.pointer.x - b.x;
        const dy = this.pointer.y - b.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 0.01;
        if (d < this.FIELD) {
          const f = this.PULL * (1 - d / this.FIELD) * dt;
          b.vx += (dx / d) * f;
          b.vy += (dy / d) * f;
        }
      }

      b.vx += (Math.random() - 0.5) * this.STEER * dt;
      b.vy += (Math.random() - 0.5) * this.STEER * dt;
      b.vx *= damp;
      b.vy *= damp;

      const sp = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
      if (sp < 0.0001) {
        b.vx = (Math.random() - 0.5) * this.VMIN * 2;
        b.vy = (Math.random() - 0.5) * this.VMIN * 2;
      } else if (pulling) {
        if (sp > this.VCAP) {
          b.vx *= this.VCAP / sp;
          b.vy *= this.VCAP / sp;
        }
      } else {
        const want = sp < this.VMIN ? this.VMIN : (sp > this.VMAX ? this.VMAX : sp);
        if (want !== sp) {
          const k = 1 + (want / sp - 1) * Math.min(1, this.EASE * dt);
          b.vx *= k;
          b.vy *= k;
        }
      }

      b.x += b.vx * dt;
      b.y += b.vy * dt;

      if (b.x - b.r < 0) {
        b.x = b.r;
        b.vx = Math.abs(b.vx) * this.WALL;
      } else if (b.x + b.r > this.w) {
        b.x = this.w - b.r;
        b.vx = -Math.abs(b.vx) * this.WALL;
      }

      if (b.y - b.r < 0) {
        b.y = b.r;
        b.vy = Math.abs(b.vy) * this.WALL;
      } else if (b.y + b.r > this.h) {
        b.y = this.h - b.r;
        b.vy = -Math.abs(b.vy) * this.WALL;
      }
    }

    for (let i = 0; i < this.bodies.length; i++) {
      for (let j = i + 1; j < this.bodies.length; j++) {
        this.collide(this.bodies[i], this.bodies[j]);
      }
    }
  }

  collide(a, c) {
    let ox = c.x - a.x;
    let oy = c.y - a.y;
    let dist = Math.sqrt(ox * ox + oy * oy);
    const min = a.r + c.r;
    if (dist === 0) {
      dist = 0.01;
      ox = 0.01;
      oy = 0;
    }
    if (dist >= min) return;

    const nx = ox / dist;
    const ny = oy / dist;
    const over = min - dist;
    const tm = a.m + c.m;
    a.x -= nx * over * (c.m / tm);
    a.y -= ny * over * (c.m / tm);
    c.x += nx * over * (a.m / tm);
    c.y += ny * over * (a.m / tm);

    const sep = (c.vx - a.vx) * nx + (c.vy - a.vy) * ny;
    if (sep >= 0) return;
    const imp = -(1 + this.BOUNCE) * sep / (1 / a.m + 1 / c.m);
    a.vx -= (imp / a.m) * nx;
    a.vy -= (imp / a.m) * ny;
    c.vx += (imp / c.m) * nx;
    c.vy += (imp / c.m) * ny;
  }

  draw() {
    this.refreshColors();
    this.ctx.fillStyle = this.PAPER;
    this.ctx.fillRect(0, 0, this.w, this.h);

    for (let i = 0; i < this.bodies.length; i++) {
      const b = this.bodies[i];
      this.ctx.fillStyle = b.soft ? this.INK_SOFT : this.INK;
      this.ctx.beginPath();
      this.ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }


  // draw() {
  //   this.refreshColors();
  //   this.ctx.fillStyle = this.PAPER;
  //   this.ctx.fillRect(0, 0, this.w, this.h);

  //   for (let i = 0; i < this.bodies.length; i++) {
  //     const b = this.bodies[i];
  //     this.drawCross(b.x, b.y, b.r, b.soft ? this.INK_SOFT : this.INK);
  //   }
  // }

  // drawCross(x, y, r, color) {
  //   const arm = r * 0.75;
  //   const thick = Math.max(1.5, r * 1.5);
  //   this.ctx.save();
  //   this.ctx.translate(x, y);
  //   this.ctx.rotate(0 * Math.PI / 4);
  //   this.ctx.fillStyle = color;
  //   this.ctx.fillRect(-arm, -thick / 2, arm * 2, thick);
  //   this.ctx.fillRect(-thick / 2, -arm, thick, arm * 2);
  //   this.ctx.restore();
  // }

  frame = (now) => {
    let dt = this.last ? Math.min((now - this.last) / 16.667, 2.5) : 1;
    // If reduced-motion is requested by browser/system, slow down gently instead of freezing
    if (this.isReducedMotion) {
      dt *= 0.35;
    }
    this.last = now;
    this.step(dt);
    this.draw();
    this.raf = requestAnimationFrame(this.frame);
  };

  start() {
    if (!this.raf) {
      this.last = 0;
      this.raf = requestAnimationFrame(this.frame);
    }
  }

  stop() {
    if (this.raf) {
      cancelAnimationFrame(this.raf);
      this.raf = 0;
    }
  }

  init(element) {
    this.element = element;
    this.isVisible = true;
    this.measure();
    this.seed();
    this.draw();
    this.start();

    // ResizeObserver for accurate sizing across Canary, Opera, Chrome
    if (window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          const cr = entry.contentRect;
          if (cr.width > 20 && cr.height > 20) {
            const dw = Math.abs(cr.width - this.w);
            const dh = Math.abs(cr.height - this.h);
            if (dw > 4 || dh > 4) {
              this.measure();
              if (this.bodies.length === 0) this.seed();
              this.draw();
              if (this.isVisible) this.start();
            }
          }
        }
      });
      this.resizeObserver.observe(element);
    }

    // IntersectionObserver : pause les calculs physiques quand le canvas n'est pas dans le viewport
    if ('IntersectionObserver' in window) {
      this.intersectionObserver = new IntersectionObserver((entries) => {
        for (let entry of entries) {
          if (entry.isIntersecting) {
            this.isVisible = true;
            this.last = 0;
            this.start();
          } else {
            this.isVisible = false;
            this.stop();
          }
        }
      }, { threshold: 0.05 });
      this.intersectionObserver.observe(element);
    }

    // Interactive pointer
    element.addEventListener('pointerenter', () => {
      if (this.isVisible) this.start();
    });

    element.addEventListener('pointermove', (e) => {
      const rect = element.getBoundingClientRect();
      this.pointer.x = e.clientX - rect.left;
      this.pointer.y = e.clientY - rect.top;
      this.pointer.on = true;
      if (!this.raf && this.isVisible) this.start();
    });

    element.addEventListener('pointerleave', () => {
      this.pointer.on = false;
    });

    window.addEventListener('resize', () => {
      this.measure();
      this.seed();
      this.draw();
      if (this.isVisible) this.start();
    });

    // Redraw & wake loop on focus and visibility change
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.isVisible) {
        this.last = 0;
        this.measure();
        this.draw();
        this.start();
      } else {
        this.stop();
      }
    });

    window.addEventListener('focus', () => {
      if (this.isVisible) {
        this.last = 0;
        this.measure();
        this.draw();
        this.start();
      }
    });
  }

  destroy() {
    this.stop();
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = null;
    }
  }
}

window.CanvasAnimation = CanvasAnimation;
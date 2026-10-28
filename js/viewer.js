/* =========================================================================
   Visualizador 360°
   - Fotos: arraste para girar (cada foto é um ângulo), pinça / roda do
     mouse / duplo toque para zoom, arraste para mover quando ampliado.
   - Modelo 3D (.glb): usa <model-viewer> do Google, com rotação livre
     e Realidade Aumentada no celular.
   ========================================================================= */
(function () {
  "use strict";

  const MODEL_VIEWER_SRC = "https://cdn.jsdelivr.net/npm/@google/model-viewer@3.5.0/dist/model-viewer.min.js";
  const MAX_ZOOM = 4;
  const FLIP_AT = 24;      // graus de arraste para trocar de ângulo
  const MAX_TILT_Y = 42;
  const MAX_TILT_X = 14;

  let modelViewerLoading = null;
  function loadModelViewer() {
    if (window.customElements && customElements.get("model-viewer")) return Promise.resolve();
    if (!modelViewerLoading) {
      modelViewerLoading = new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.type = "module";
        s.src = MODEL_VIEWER_SRC;
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      });
    }
    return modelViewerLoading;
  }

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  // Resistência elástica ao passar do limite
  const rubber = (v, max) => (Math.abs(v) <= max ? v : Math.sign(v) * (max + (Math.abs(v) - max) * 0.25));
  const icon = (id) => `<svg class="ico"><use href="#${id}"/></svg>`;

  class Viewer {
    constructor(host, product) {
      this.root = document.createElement("div");
      host.appendChild(this.root);
      this.product = product;
      this.frames = product.images;
      this.index = 0;
      this.mode = product.model ? "3d" : "photos";
      this.cur = { ry: 0, rx: 0, s: 1, x: 0, y: 0 };
      this.tgt = { ry: 0, rx: 0, s: 1, x: 0, y: 0 };
      this.pointers = new Map();
      this.flipDir = 0;
      this.raf = 0;
      this.lastTap = 0;
      this.timers = [];

      this.tick = this.tick.bind(this);
      this.onFsChange = () => { if (!this.isFullscreen()) this.root.classList.remove("is-fullscreen"); };
      document.addEventListener("fullscreenchange", this.onFsChange);
      document.addEventListener("webkitfullscreenchange", this.onFsChange);

      this.frames.forEach((src) => { const i = new Image(); i.src = src; });
      this.render();
    }

    /* ---------- estrutura ---------- */
    render() {
      const p = this.product;
      this.root.className = "viewer" + (p.fit === "cover" ? " viewer--cover" : "");
      const tabs = p.model
        ? `<div class="viewer__tabs" role="tablist">
             <button class="viewer__tab" role="tab" data-mode="3d" aria-selected="${this.mode === "3d"}">${icon("i-cube")} 3D</button>
             <button class="viewer__tab" role="tab" data-mode="photos" aria-selected="${this.mode === "photos"}">Fotos</button>
           </div>`
        : "";
      this.root.innerHTML = tabs + `<div class="viewer__body" style="position:absolute;inset:0"></div>`;
      this.body = this.root.querySelector(".viewer__body");
      this.root.querySelectorAll(".viewer__tab").forEach((t) =>
        t.addEventListener("click", () => this.setMode(t.dataset.mode))
      );
      this.mode === "3d" ? this.render3D() : this.renderPhotos();
    }

    setMode(mode) {
      if (mode === this.mode) return;
      this.mode = mode;
      this.teardownPhotos();
      this.root.querySelectorAll(".viewer__tab").forEach((t) => t.setAttribute("aria-selected", t.dataset.mode === mode));
      mode === "3d" ? this.render3D() : this.renderPhotos();
    }

    render3D() {
      const p = this.product;
      this.body.innerHTML = `
        <model-viewer src="${p.model}" alt="Modelo 3D ${p.name}" poster="${p.images[0]}"
          camera-controls auto-rotate auto-rotate-delay="800" rotation-per-second="18deg"
          interaction-prompt="auto" touch-action="pan-y" shadow-intensity="1.1" shadow-softness="0.8"
          exposure="1.05" environment-image="neutral" ar ar-modes="webxr scene-viewer quick-look">
          <button slot="ar-button" class="btn btn--primary btn--sm" style="position:absolute;right:16px;bottom:16px">${icon("i-cube")} Ver no meu espaço</button>
        </model-viewer>`;
      loadModelViewer().catch(() => this.setMode("photos"));
    }

    renderPhotos() {
      const multi = this.frames.length > 1;
      this.body.innerHTML = `
        <div class="viewer__stage" tabindex="0" aria-label="Visualização 360° de ${this.product.name}. Use as setas para girar e + ou - para zoom.">
          <div class="viewer__float">
            <div class="viewer__obj">
              <img class="viewer__img" src="${this.frames[this.index]}" alt="${this.product.name}" draggable="false">
              <div class="viewer__sheen"></div>
            </div>
          </div>
          <div class="viewer__floor"></div>
        </div>
        <div class="viewer__hint">${icon("i-360")} Arraste para girar · Pinça para zoom</div>
        ${multi ? `<div class="viewer__thumbs">${this.frames.map((f, i) =>
          `<button class="viewer__thumb${i === this.index ? " is-active" : ""}" data-i="${i}" aria-label="Ângulo ${i + 1}"><img src="${f}" alt=""></button>`).join("")}</div>` : ""}
        <div class="viewer__bar">
          ${multi ? `<button class="viewer__btn" data-act="prev" aria-label="Ângulo anterior">${icon("i-chev-l")}</button>
            <div class="viewer__dots">${this.frames.map((_, i) => `<span class="viewer__dot${i === this.index ? " is-active" : ""}"></span>`).join("")}</div>
            <button class="viewer__btn" data-act="next" aria-label="Próximo ângulo">${icon("i-chev-r")}</button>
            <span class="viewer__sep"></span>` : ""}
          <button class="viewer__btn" data-act="out" aria-label="Diminuir zoom">${icon("i-zoom-out")}</button>
          <button class="viewer__btn" data-act="in" aria-label="Aumentar zoom">${icon("i-zoom-in")}</button>
          <button class="viewer__btn" data-act="reset" aria-label="Centralizar">${icon("i-reset")}</button>
          <button class="viewer__btn" data-act="fs" aria-label="Tela cheia">${icon("i-expand")}</button>
        </div>`;

      this.stage = this.body.querySelector(".viewer__stage");
      this.obj = this.body.querySelector(".viewer__obj");
      this.img = this.body.querySelector(".viewer__img");
      this.hint = this.body.querySelector(".viewer__hint");
      this.cur = { ry: 0, rx: 0, s: 1, x: 0, y: 0 };
      this.tgt = { ry: 0, rx: 0, s: 1, x: 0, y: 0 };

      this.bindPhotos();
      this.apply();

      // Pequena "dica" de movimento ao abrir
      this.timers.push(setTimeout(() => { this.tgt.ry = -16; this.kick(); }, 450));
      this.timers.push(setTimeout(() => { if (!this.pointers.size) { this.tgt.ry = 0; this.kick(); } }, 1050));
    }

    /* ---------- eventos ---------- */
    bindPhotos() {
      const st = this.stage;
      this.h = {
        down: (e) => this.onDown(e),
        move: (e) => this.onMove(e),
        up: (e) => this.onUp(e),
        wheel: (e) => this.onWheel(e),
        key: (e) => this.onKey(e)
      };
      st.addEventListener("pointerdown", this.h.down);
      st.addEventListener("pointermove", this.h.move);
      st.addEventListener("pointerup", this.h.up);
      st.addEventListener("pointercancel", this.h.up);
      st.addEventListener("wheel", this.h.wheel, { passive: false });
      st.addEventListener("keydown", this.h.key);

      this.body.querySelectorAll("[data-act]").forEach((b) =>
        b.addEventListener("click", () => {
          const a = b.dataset.act;
          if (a === "prev") this.flip(1);
          if (a === "next") this.flip(-1);
          if (a === "in") this.zoomTo(this.tgt.s * 1.5);
          if (a === "out") this.zoomTo(this.tgt.s / 1.5);
          if (a === "reset") this.reset();
          if (a === "fs") this.toggleFullscreen();
          this.hideHint();
        })
      );
      this.body.querySelectorAll(".viewer__thumb").forEach((t) =>
        t.addEventListener("click", () => this.goTo(+t.dataset.i))
      );
    }

    teardownPhotos() {
      this.timers.forEach(clearTimeout);
      this.timers = [];
      cancelAnimationFrame(this.raf);
      this.raf = 0;
      this.pointers.clear();
      this.stage = null;
    }

    onDown(e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      this.stage.setPointerCapture(e.pointerId);
      this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      this.hideHint();
      if (this.pointers.size === 1) {
        this.drag = { x: e.clientX, y: e.clientY, t: performance.now(), ry: this.tgt.ry, rx: this.tgt.rx, px: this.tgt.x, py: this.tgt.y, moved: 0 };
        this.stage.classList.add("is-dragging");
      } else if (this.pointers.size === 2) {
        this.pinch = { d: this.pointerDist(), s: this.tgt.s };
      }
    }

    onMove(e) {
      if (!this.pointers.has(e.pointerId)) return;
      this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (this.pointers.size >= 2 && this.pinch) {
        this.zoomTo(this.pinch.s * (this.pointerDist() / this.pinch.d), true);
        return;
      }
      if (!this.drag) return;
      const dx = e.clientX - this.drag.x;
      const dy = e.clientY - this.drag.y;
      this.drag.moved = Math.max(this.drag.moved, Math.hypot(dx, dy));

      if (this.isZoomed()) {
        this.tgt.x = this.drag.px + dx;
        this.tgt.y = this.drag.py + dy;
        this.clampPan();
      } else if (!this.flipDir) {
        this.tgt.ry = rubber(this.drag.ry + dx * 0.35, MAX_TILT_Y);
        this.tgt.rx = rubber(this.drag.rx - dy * 0.15, MAX_TILT_X);
      }
      this.kick();
    }

    onUp(e) {
      if (!this.pointers.has(e.pointerId)) return;
      this.pointers.delete(e.pointerId);
      if (this.pointers.size === 1) {
        // terminou a pinça: recomeça arraste com o dedo restante
        const [p] = this.pointers.values();
        this.pinch = null;
        this.drag = { x: p.x, y: p.y, t: performance.now(), ry: this.tgt.ry, rx: this.tgt.rx, px: this.tgt.x, py: this.tgt.y, moved: 99 };
        return;
      }
      if (this.pointers.size) return;
      this.stage.classList.remove("is-dragging");
      this.pinch = null;

      const d = this.drag;
      this.drag = null;
      if (!d) return;

      // duplo toque / duplo clique = zoom
      const now = performance.now();
      if (d.moved < 8 && now - d.t < 300) {
        if (now - this.lastTap < 320) {
          this.lastTap = 0;
          this.isZoomed() ? this.reset() : this.zoomAt(2.4, e.clientX, e.clientY);
          return;
        }
        this.lastTap = now;
      }

      if (!this.isZoomed() && !this.flipDir) {
        if (this.frames.length > 1 && Math.abs(this.tgt.ry) > FLIP_AT) {
          this.flip(Math.sign(this.tgt.ry));
        } else {
          this.tgt.ry = 0;
          this.tgt.rx = 0;
        }
      }
      this.kick();
    }

    onWheel(e) {
      e.preventDefault();
      this.hideHint();
      const factor = Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0018));
      this.zoomAt(this.tgt.s * factor, e.clientX, e.clientY);
    }

    onKey(e) {
      const k = e.key;
      if (k === "ArrowLeft") this.flip(1);
      else if (k === "ArrowRight") this.flip(-1);
      else if (k === "+" || k === "=") this.zoomTo(this.tgt.s * 1.5);
      else if (k === "-") this.zoomTo(this.tgt.s / 1.5);
      else if (k === "0") this.reset();
      else return;
      e.preventDefault();
      this.hideHint();
    }

    /* ---------- ações ---------- */
    // dir > 0: gira para a direita (ângulo anterior); dir < 0: próximo ângulo
    flip(dir) {
      if (this.frames.length < 2 || this.flipDir) return;
      this.reset(true);
      this.flipDir = dir;
      this.tgt.ry = dir * 90;
      this.tgt.rx = 0;
      this.kick();
    }

    goTo(i) {
      if (i === this.index || this.flipDir) return;
      this.pendingIndex = i;
      this.flip(i > this.index ? -1 : 1);
    }

    setFrame(i) {
      const n = this.frames.length;
      this.index = ((i % n) + n) % n;
      this.img.src = this.frames[this.index];
      this.body.querySelectorAll(".viewer__dot").forEach((d, k) => d.classList.toggle("is-active", k === this.index));
      this.body.querySelectorAll(".viewer__thumb").forEach((d, k) => d.classList.toggle("is-active", k === this.index));
    }

    zoomTo(s, keepPan) {
      this.tgt.s = clamp(s, 1, MAX_ZOOM);
      if (this.tgt.s <= 1.01) { this.tgt.s = 1; this.tgt.x = 0; this.tgt.y = 0; }
      else { this.tgt.ry = 0; this.tgt.rx = 0; }
      if (!keepPan) this.clampPan();
      this.stage.classList.toggle("is-zoomed", this.isZoomed());
      this.kick();
    }

    // Zoom mantendo o ponto sob o cursor/dedo parado
    zoomAt(s, cx, cy) {
      const r = this.stage.getBoundingClientRect();
      const ox = cx - (r.left + r.width / 2);
      const oy = cy - (r.top + r.height / 2);
      const prev = this.tgt.s;
      const next = clamp(s, 1, MAX_ZOOM);
      const k = next / prev;
      this.tgt.x = ox - (ox - this.tgt.x) * k;
      this.tgt.y = oy - (oy - this.tgt.y) * k;
      this.zoomTo(next);
    }

    clampPan() {
      const r = this.stage.getBoundingClientRect();
      const mx = ((this.tgt.s - 1) * r.width) / 2;
      const my = ((this.tgt.s - 1) * r.height) / 2;
      this.tgt.x = clamp(this.tgt.x, -mx, mx);
      this.tgt.y = clamp(this.tgt.y, -my, my);
    }

    reset(silent) {
      Object.assign(this.tgt, { ry: 0, rx: 0, s: 1, x: 0, y: 0 });
      if (this.stage) this.stage.classList.remove("is-zoomed");
      if (!silent) this.kick();
    }

    isZoomed() { return this.tgt.s > 1.01; }

    pointerDist() {
      const [a, b] = [...this.pointers.values()];
      return Math.hypot(a.x - b.x, a.y - b.y) || 1;
    }

    hideHint() { if (this.hint) this.hint.classList.add("is-hidden"); }

    isFullscreen() { return !!(document.fullscreenElement || document.webkitFullscreenElement); }

    toggleFullscreen() {
      const el = this.root;
      if (this.isFullscreen()) {
        (document.exitFullscreen || document.webkitExitFullscreen).call(document);
        return;
      }
      const req = el.requestFullscreen || el.webkitRequestFullscreen;
      const cssFallback = () => el.classList.toggle("is-fullscreen"); // iPhone: tela cheia via CSS
      if (!req) return cssFallback();
      const r = req.call(el);
      if (r && r.catch) r.catch(cssFallback);
    }

    /* ---------- animação ---------- */
    kick() { if (!this.raf) this.raf = requestAnimationFrame(this.tick); }

    tick() {
      this.raf = 0;
      if (!this.stage) return;
      const c = this.cur, t = this.tgt;
      const k = this.drag && !this.flipDir ? 0.35 : this.flipDir ? 0.2 : 0.14;
      let moving = false;
      for (const key in c) {
        const d = t[key] - c[key];
        if (Math.abs(d) > 0.01) { c[key] += d * k; moving = true; }
        else c[key] = t[key];
      }

      // meio do giro: troca a foto e completa a volta pelo outro lado
      if (this.flipDir && Math.abs(c.ry - t.ry) < 8) {
        const dir = this.flipDir;
        const next = this.pendingIndex != null ? this.pendingIndex : this.index - dir;
        this.pendingIndex = null;
        this.setFrame(next);
        c.ry = -dir * 90;
        t.ry = 0;
        this.flipDir = 0;
        moving = true;
      }

      this.apply();
      if (moving || this.drag) this.raf = requestAnimationFrame(this.tick);
    }

    apply() {
      const c = this.cur;
      this.obj.style.transform =
        `translate3d(${c.x.toFixed(2)}px, ${c.y.toFixed(2)}px, 0) scale(${c.s.toFixed(4)}) rotateX(${c.rx.toFixed(2)}deg) rotateY(${c.ry.toFixed(2)}deg)`;
      this.obj.style.setProperty("--sheen", `${(50 - c.ry * 1.4).toFixed(1)}%`);
    }

    destroy() {
      this.teardownPhotos();
      document.removeEventListener("fullscreenchange", this.onFsChange);
      document.removeEventListener("webkitfullscreenchange", this.onFsChange);
      if (this.isFullscreen()) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
      this.root.remove();
    }
  }

  window.MihaViewer = Viewer;
})();

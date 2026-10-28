/* =========================================================================
   MIHA COMPANY — aplicação
   ========================================================================= */
(function () {
  "use strict";

  const CFG = window.MIHA_CONFIG;
  const CATS = window.MIHA_CATEGORIES;
  const PRODUCTS = window.MIHA_PRODUCTS;
  const byId = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const icon = (id) => `<svg class="ico"><use href="#${id}"/></svg>`;
  const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- WhatsApp ---------- */
  const waLink = (msg) => `https://wa.me/${CFG.whatsapp}?text=${encodeURIComponent(msg)}`;
  const productUrl = (p) => `${location.origin}${location.pathname}#modelo/${p.id}`;
  const productMsg = (p) =>
    `Olá, ${CFG.company}! Tenho interesse na *${p.name}* (${CATS[p.category]}).\n` +
    `Poderia me passar valor, cores e disponibilidade?\n\n${productUrl(p)}`;

  $$("[data-wa]").forEach((a) => (a.href = waLink(a.dataset.wa)));
  $$("[data-wa-number]").forEach((el) => (el.textContent = CFG.whatsappDisplay));

  /* ---------- Preço ---------- */
  function priceHTML(p) {
    if (p.price == null) {
      return `<span class="price__label">Valor</span><span class="price__value price__value--ask">Sob consulta</span>`;
    }
    return `<span class="price__label">${p.oldPrice ? "Por" : "A partir de"}</span>
      ${p.oldPrice ? `<span class="price__old">${brl.format(p.oldPrice)}</span>` : ""}
      <span class="price__value">${brl.format(p.price)}</span>
      ${p.installments ? `<span class="price__inst">ou ${p.installments.times}x de ${brl.format(p.installments.value)}</span>` : ""}`;
  }

  /* ---------- Lista de interesse ---------- */
  const WISH_KEY = "miha:wish";
  let wish = [];
  try { wish = JSON.parse(localStorage.getItem(WISH_KEY) || "[]").filter((id) => byId[id]); } catch (_) {}

  function saveWish() {
    try { localStorage.setItem(WISH_KEY, JSON.stringify(wish)); } catch (_) {}
    renderWish();
  }
  function toggleWish(id) {
    const on = !wish.includes(id);
    wish = on ? [...wish, id] : wish.filter((x) => x !== id);
    saveWish();
    toast(on ? `${byId[id].name} adicionada à lista` : `${byId[id].name} removida da lista`);
  }
  function renderWish() {
    const bar = $("#wishbar");
    const n = wish.length;
    bar.hidden = n === 0;
    document.body.classList.toggle("has-wish", n > 0);
    $("#wishCount").textContent = n;
    $("#wishLabel").textContent = n === 1 ? "modelo na sua lista" : "modelos na sua lista";
    const names = wish.map((id) => `• ${byId[id].name}`).join("\n");
    $("#wishSend").href = waLink(`Olá, ${CFG.company}! Gostaria de um orçamento destes modelos:\n${names}`);
    $$(".card__wish").forEach((b) => {
      const on = wish.includes(b.dataset.id);
      b.setAttribute("aria-pressed", on);
      b.innerHTML = icon(on ? "i-check" : "i-plus");
      b.setAttribute("aria-label", on ? "Remover da lista" : "Adicionar à lista");
    });
    if (current) syncModalWish();
  }
  $("#wishClear").addEventListener("click", () => { wish = []; saveWish(); });

  /* ---------- Filtros ---------- */
  let filter = "all";
  function renderFilters() {
    const counts = PRODUCTS.reduce((a, p) => ((a[p.category] = (a[p.category] || 0) + 1), a), {});
    const items = [["all", "Todas", PRODUCTS.length], ...Object.keys(CATS).filter((k) => counts[k]).map((k) => [k, CATS[k], counts[k]])];
    $("#filters").innerHTML = items
      .map(([k, label, n]) => `<button class="filter" role="tab" data-f="${k}" aria-selected="${k === filter}">${label} <span class="filter__count">${n}</span></button>`)
      .join("");
  }
  $("#filters").addEventListener("click", (e) => {
    const b = e.target.closest(".filter");
    if (!b || b.dataset.f === filter) return;
    filter = b.dataset.f;
    $$(".filter").forEach((x) => x.setAttribute("aria-selected", x === b));
    b.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    renderGrid();
  });

  /* ---------- Catálogo ---------- */
  function cardHTML(p, i) {
    return `
      <article class="card" style="animation-delay:${Math.min(i, 8) * 60}ms">
        <div class="card__media${p.fit === "contain" ? " card__media--contain" : ""}" data-open="${p.id}" role="button" tabindex="0" aria-label="Ver ${esc(p.name)} em 360°">
          ${p.badge ? `<span class="card__badge">${esc(p.badge)}</span>` : ""}
          <img class="card__img" src="${p.images[0]}" alt="${esc(p.name)}" loading="${i < 6 ? "eager" : "lazy"}">
          <span class="card__360">${icon(p.model ? "i-cube" : "i-360")} ${p.model ? "Modelo 3D" : "Ver em 360°"}</span>
        </div>
        <button class="card__wish" data-id="${p.id}" aria-pressed="false" aria-label="Adicionar à lista">${icon("i-plus")}</button>
        <div class="card__body">
          <span class="card__cat">${CATS[p.category]}</span>
          <h3 class="card__title">${esc(p.name)}</h3>
          <p class="card__tagline">${esc(p.tagline)}</p>
          <div class="card__foot">
            <div class="price">${priceHTML(p)}</div>
            <div class="card__actions">
              <button class="icon-btn" data-open="${p.id}" aria-label="Detalhes de ${esc(p.name)}">${icon("i-arrow")}</button>
              <a class="icon-btn icon-btn--wa" href="${waLink(productMsg(p))}" target="_blank" rel="noopener" aria-label="Perguntar sobre ${esc(p.name)} no WhatsApp">${icon("i-wa")}</a>
            </div>
          </div>
        </div>
      </article>`;
  }

  function renderGrid() {
    const list = filter === "all" ? PRODUCTS : PRODUCTS.filter((p) => p.category === filter);
    $("#grid").innerHTML = list.length ? list.map(cardHTML).join("") : `<p class="empty">Nenhum modelo nesta categoria ainda.</p>`;
    renderWish();
  }

  document.addEventListener("click", (e) => {
    const wishBtn = e.target.closest(".card__wish");
    if (wishBtn) return toggleWish(wishBtn.dataset.id);
    const opener = e.target.closest("[data-open]");
    if (opener) { e.preventDefault(); openProduct(opener.dataset.open); }
  });
  document.addEventListener("keydown", (e) => {
    if ((e.key === "Enter" || e.key === " ") && e.target.matches(".card__media[data-open]")) {
      e.preventDefault();
      openProduct(e.target.dataset.open);
    }
  });

  /* ---------- Modal do produto ---------- */
  const modal = $("#modal");
  let current = null;
  let viewer = null;
  let lastFocus = null;

  function openProduct(id, fromHash) {
    const p = byId[id];
    if (!p) return;
    current = p;
    lastFocus = document.activeElement;

    $("#mCat").textContent = CATS[p.category];
    $("#mTitle").textContent = p.name;
    $("#mTagline").textContent = p.tagline;
    $("#mPrice").innerHTML = priceHTML(p);
    $("#mColors").innerHTML = (p.colors || []).map((c) => `<span>${esc(c)}</span>`).join("");
    $("#mHighlights").innerHTML = p.highlights.map((h) => `<li>${icon("i-check")}<span>${esc(h)}</span></li>`).join("");
    $("#mSpecs").innerHTML = Object.entries(p.specs || {})
      .map(([k, v]) => `<div><dt>${esc(k)}</dt><dd${v == null ? ' class="is-soon"' : ""}>${v == null ? "Em breve" : esc(v)}</dd></div>`)
      .join("");
    $("#mWa").href = waLink(productMsg(p));
    syncModalWish();

    modal.hidden = false;
    document.body.classList.add("is-locked");
    $(".modal__panel").scrollTop = 0;
    $(".modal__info").scrollTop = 0;

    if (viewer) viewer.destroy();
    viewer = new window.MihaViewer($("#mViewer"), p);

    if (!fromHash) history.pushState({ modal: id }, "", `#modelo/${id}`);
    $(".modal__close").focus({ preventScroll: true });
  }

  function closeProduct(fromHistory) {
    if (modal.hidden) return;
    modal.hidden = true;
    document.body.classList.remove("is-locked");
    if (viewer) { viewer.destroy(); viewer = null; }
    current = null;
    if (!fromHistory) {
      if (history.state && history.state.modal) history.back();
      else history.replaceState(null, "", location.pathname + location.search);
    }
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  function syncModalWish() {
    const on = wish.includes(current.id);
    $("#mWish").innerHTML = `${icon(on ? "i-check" : "i-plus")} <span>${on ? "Na sua lista" : "Adicionar à lista"}</span>`;
  }

  $$("[data-close]", modal).forEach((el) => el.addEventListener("click", () => closeProduct()));
  $("#mWish").addEventListener("click", () => current && toggleWish(current.id));
  $("#mShare").addEventListener("click", async () => {
    if (!current) return;
    const url = productUrl(current);
    const data = { title: `${current.name} · ${CFG.company}`, text: current.tagline, url };
    try {
      if (navigator.share) return await navigator.share(data);
      await navigator.clipboard.writeText(url);
      toast("Link copiado!");
    } catch (err) {
      if (err && err.name === "AbortError") return;
      prompt("Copie o link:", url);
    }
  });

  document.addEventListener("keydown", (e) => {
    if (modal.hidden) return;
    if (e.key === "Escape") closeProduct();
    if (e.key === "Tab") {
      // mantém o foco dentro do modal
      const f = $$('button, a[href], [tabindex]:not([tabindex="-1"])', modal).filter((el) => el.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // Botão "voltar" do celular fecha o modal; links #modelo/id abrem direto
  function routeFromHash() {
    const m = location.hash.match(/^#modelo\/([\w-]+)/);
    if (m && byId[m[1]]) openProduct(m[1], true);
    else closeProduct(true);
  }
  window.addEventListener("popstate", routeFromHash);

  /* ---------- Toast ---------- */
  let toastTimer;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("is-show"), 2200);
  }

  /* ---------- Header / menu ---------- */
  const nav = $("#nav");
  const toggle = $("#navToggle");
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 10);
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("load", onScroll);
  onScroll();
  function setMenu(open) {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open);
    toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  }
  toggle.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
  $$("#navLinks a").forEach((a) => a.addEventListener("click", () => setMenu(false)));

  /* ---------- Hero: inclinação 3D seguindo o cursor ---------- */
  const heroVisual = $("#heroVisual");
  const heroBike = $("#heroBike");
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    heroVisual.addEventListener("pointermove", (e) => {
      const r = heroVisual.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      heroBike.style.transform = `perspective(1200px) rotateY(${x * 18}deg) rotateX(${-y * 10}deg) scale(1.03)`;
    });
    heroVisual.addEventListener("pointerleave", () => (heroBike.style.transform = ""));
  }

  /* ---------- Revelar ao rolar ---------- */
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    $$(".reveal").forEach((el) => io.observe(el));
    // garantia: o que já está na tela ao abrir (ex.: link com #âncora) aparece
    window.addEventListener("load", () => {
      $$(".reveal:not(.is-in)").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < innerHeight && r.bottom > 0) el.classList.add("is-in");
      });
    });
  } else {
    $$(".reveal").forEach((el) => el.classList.add("is-in"));
  }

  /* ---------- Início ---------- */
  $("#year").textContent = new Date().getFullYear();
  $("#statModels").textContent = PRODUCTS.length;
  renderFilters();
  renderGrid();
  routeFromHash();
  // links diretos para seções (#modelos, #contato) após o catálogo montar
  const section = /^#[\w-]+$/.test(location.hash) && document.getElementById(location.hash.slice(1));
  if (section) window.addEventListener("load", () => section.scrollIntoView());
})();

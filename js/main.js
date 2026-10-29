/* ==========================================================================
   Dra. Juliane Mendes | Harmonização Facial
   main.js · JavaScript puro (ES6+) com GSAP + ScrollTrigger + Lenis (CDN)
   --------------------------------------------------------------------------
   Índice
   00. Configuração e utilitários
   01. Links de WhatsApp
   02. Smooth scroll (Lenis + ScrollTrigger)
   03. Preloader e entrada do hero
   04. Header (estado, esconder ao descer / mostrar ao subir)
   05. Menu mobile
   06. Âncoras
   07. Split de texto e reveals
   08. Manifesto (palavras acendendo com o scroll)
   09. Parallax
   10. Procedimentos (acordeão)
   11. Jornada (linha do tempo)
   12. Contadores
   13. Galeria (carrossel) e lightbox
   14. Depoimentos
   15. FAQ
   16. CTAs flutuantes
   17. Cor de fundo entre seções
   18. Aviso de cookies
   19. Inicialização
   ========================================================================== */

(() => {
  'use strict';

  /* ========================================================================
     00. CONFIGURAÇÃO E UTILITÁRIOS
     ======================================================================== */
  const CONFIG = {
    // Número com DDI e DDD, só dígitos. Ex.: '5565999999999'
    whatsappNumber: '[NUMERO_COM_DDI]',
    whatsappMessage: 'Olá, Dra. Juliane! Gostaria de agendar uma avaliação.',
  };

  const root = document.documentElement;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const pad = (n) => String(n).padStart(2, '0');

  const mq = {
    reduced: window.matchMedia('(prefers-reduced-motion: reduce)'),
    finePointer: window.matchMedia('(hover: hover) and (pointer: fine)'),
    desktop: window.matchMedia('(min-width: 1024px)'),
  };

  const hasGSAP = Boolean(window.gsap && window.ScrollTrigger);
  const motionOK = hasGSAP && !mq.reduced.matches;

  // Equivalente GSAP de cubic-bezier(0.16, 1, 0.3, 1)
  const EASE = 'expo.out';

  let lenis = null;

  // localStorage pode falhar (aba anônima, bloqueio de cookies): sempre com try/catch
  const store = {
    get(key) { try { return window.localStorage.getItem(key); } catch (e) { return null; } },
    set(key, value) { try { window.localStorage.setItem(key, value); } catch (e) { /* sem persistência */ } },
  };

  // Recalcula as posições do ScrollTrigger depois de mudanças de altura (acordeões)
  let refreshTimer;
  const refreshSoon = (delay = 950) => {
    if (!motionOK) return;
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => window.ScrollTrigger.refresh(), delay);
  };

  // Executa cada módulo isolado: um erro não derruba o restante da página
  const safe = (fn, onError) => {
    try { fn(); } catch (err) {
      console.error(`[${fn.name}]`, err);
      if (onError) onError(err);
    }
  };


  /* ========================================================================
     01. LINKS DE WHATSAPP
     Todos os [data-whatsapp] recebem o link com a mensagem pré-preenchida.
     data-wa-message personaliza a mensagem (ex.: por procedimento).
     ======================================================================== */
  function initWhatsApp() {
    $$('[data-whatsapp]').forEach((link) => {
      const message = link.dataset.waMessage || CONFIG.whatsappMessage;
      link.href = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
      link.target = '_blank';
      link.rel = 'noopener';
    });
  }


  /* ========================================================================
     02. SMOOTH SCROLL (LENIS + SCROLLTRIGGER)
     ======================================================================== */
  function initSmoothScroll() {
    if (!motionOK || typeof window.Lenis === 'undefined') return;

    lenis = new window.Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenis.on('scroll', window.ScrollTrigger.update);
    window.gsap.ticker.add((time) => lenis.raf(time * 1000));
    window.gsap.ticker.lagSmoothing(0);
  }


  /* ========================================================================
     03. PRELOADER E ENTRADA DO HERO
     Monograma desenhado (stroke-dashoffset) → cortina sobe → hero entra.
     Duração total ≤ 2,2s. Se o JS chegar tarde, o preloader é pulado.
     ======================================================================== */
  function initIntro() {
    const { gsap } = window;
    const preloader = $('.preloader');

    if (!motionOK) {
      if (preloader) preloader.remove();
      return;
    }

    // Se o CSS de segurança já escondeu o preloader (JS lento), não o reexibe
    const late = performance.now() > 2200;
    const usePreloader = Boolean(preloader) && !late;
    if (!usePreloader && preloader) preloader.remove();

    root.classList.add('is-loading');
    if (lenis) lenis.stop();

    const tl = gsap.timeline({ defaults: { ease: EASE } });
    const start = usePreloader ? 1.3 : 0.05;

    if (usePreloader) {
      tl.fromTo($$('.preloader__path', preloader),
        { strokeDashoffset: 1 },
        { strokeDashoffset: 0, duration: 1.05, ease: 'power2.inOut', stagger: 0.08 }, 0)
        .fromTo('.preloader__label', { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.8 }, 0.45)
        .to(preloader, { yPercent: -100, duration: 0.9, ease: 'power4.inOut' }, 1.25)
        .add(() => preloader.remove(), 2.16);
    }

    tl.add(() => {
      root.classList.remove('is-loading');
      if (lenis) lenis.start();
    }, start)
      .fromTo('.hero__media .media__img', { scale: 1.12 }, { scale: 1, duration: 2.2, ease: 'power2.out' }, usePreloader ? 1.2 : 0)
      // y: 0 descarta o translateY(110%) do CSS, que o GSAP leria como deslocamento em px
      .fromTo('.hero__line-inner', { y: 0, yPercent: 110 }, { y: 0, yPercent: 0, duration: 1.3, stagger: 0.12 }, start)
      .fromTo('.hero__accent-inner', { y: 0, yPercent: 110 }, { y: 0, yPercent: 0, duration: 1.3 }, start + 0.5)
      .fromTo('.header__inner', { opacity: 0, y: -16 }, { opacity: 1, y: 0, duration: 1.2, clearProps: 'transform' }, start + 0.35)
      .fromTo('[data-hero-fade]', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1.2, stagger: 0.1 }, start + 0.55);
  }

  // Fallback se a entrada falhar: devolve todo o conteúdo visível
  function revealEverything() {
    root.classList.remove('anim', 'is-loading');
    const preloader = $('.preloader');
    if (preloader) preloader.remove();
    if (lenis) lenis.start();
  }


  /* ========================================================================
     04. HEADER
     Transparente sobre o hero → ivory com blur ao rolar.
     Esconde ao descer e reaparece ao subir.
     ======================================================================== */
  function initHeader() {
    const header = $('.header');
    if (!header) return;

    let lastY = window.scrollY;
    let ticking = false;

    const update = () => {
      const y = window.scrollY;
      header.classList.toggle('is-scrolled', y > 24);

      if (!root.classList.contains('is-menu-open')) {
        if (y > lastY && y > 160) header.classList.add('is-hidden');
        else if (y < lastY || y <= 160) header.classList.remove('is-hidden');
      }

      lastY = y;
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });

    // Navegação por teclado: o header nunca fica escondido com foco dentro dele
    header.addEventListener('focusin', () => header.classList.remove('is-hidden'));
    update();
  }


  /* ========================================================================
     05. MENU MOBILE
     ======================================================================== */
  const menuState = { open: false, lastFocus: null };

  function openMenu() {
    const menu = $('#menu');
    const toggle = $('.header__toggle');
    if (!menu || !toggle || menuState.open) return;

    menuState.open = true;
    menuState.lastFocus = document.activeElement;
    menu.inert = false;
    root.classList.add('is-menu-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Fechar menu');
    if (lenis) lenis.stop();

    const first = $('.menu__link', menu);
    if (first) window.setTimeout(() => first.focus({ preventScroll: true }), 350);
  }

  function closeMenu({ restoreFocus = true } = {}) {
    const menu = $('#menu');
    const toggle = $('.header__toggle');
    if (!menu || !toggle || !menuState.open) return;

    menuState.open = false;
    menu.inert = true;
    root.classList.remove('is-menu-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menu');
    if (lenis) lenis.start();
    if (restoreFocus) toggle.focus({ preventScroll: true });
  }

  function initMenu() {
    const menu = $('#menu');
    const toggle = $('.header__toggle');
    if (!menu || !toggle) return;

    toggle.addEventListener('click', () => (menuState.open ? closeMenu() : openMenu()));

    document.addEventListener('keydown', (e) => {
      if (!menuState.open) return;

      if (e.key === 'Escape') {
        closeMenu();
        return;
      }

      // Mantém o foco dentro do menu (botão de fechar + links)
      if (e.key === 'Tab') {
        const focusables = [toggle, ...$$('a, button', menu)];
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });

    // Ao chegar no desktop, o menu mobile deixa de existir
    mq.desktop.addEventListener('change', (e) => { if (e.matches) closeMenu({ restoreFocus: false }); });
  }


  /* ========================================================================
     06. ÂNCORAS
     ======================================================================== */
  function initAnchors() {
    $$('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        const hash = link.getAttribute('href');
        if (!hash || hash === '#') return;

        const target = hash === '#top' ? document.body : document.querySelector(hash);
        if (!target) return;

        e.preventDefault();
        const wasOpen = menuState.open;
        closeMenu({ restoreFocus: false });

        const go = () => {
          if (lenis) lenis.scrollTo(hash === '#top' ? 0 : target, { duration: 1.4 });
          else if (hash === '#top') window.scrollTo({ top: 0, behavior: mq.reduced.matches ? 'auto' : 'smooth' });
          else target.scrollIntoView({ behavior: mq.reduced.matches ? 'auto' : 'smooth', block: 'start' });

          // Move o foco para o destino (leitores de tela e teclado)
          if (hash !== '#top') {
            if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
            target.focus({ preventScroll: true });
          }
        };

        // Espera a cortina do menu começar a subir antes de rolar
        if (wasOpen) window.setTimeout(go, 250);
        else go();
      });
    });
  }


  /* ========================================================================
     07. SPLIT DE TEXTO E REVEALS
     Split manual por palavra (máscara + translateY), preservando <em>.
     Uma cópia do texto original fica disponível para leitores de tela.
     ======================================================================== */
  function wrapWords(node) {
    Array.from(node.childNodes).forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(' '));
            return;
          }
          const word = document.createElement('span');
          const inner = document.createElement('span');
          word.className = 'word';
          inner.className = 'word__inner';
          inner.textContent = part;
          word.appendChild(inner);
          frag.appendChild(word);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== 'BR') {
        wrapWords(child);
      }
    });
  }

  function splitWords(el) {
    if (el.dataset.splitDone === 'true') return $$('.word__inner', el);

    const label = el.textContent.replace(/\s+/g, ' ').trim();
    const visual = document.createElement('span');
    visual.setAttribute('aria-hidden', 'true');
    visual.innerHTML = el.innerHTML;
    wrapWords(visual);

    const sr = document.createElement('span');
    sr.className = 'sr-only';
    sr.textContent = label;

    el.replaceChildren(sr, visual);
    el.dataset.splitDone = 'true';
    return $$('.word__inner', visual);
  }

  function initReveals() {
    if (!motionOK) return;
    const { gsap } = window;

    // Títulos: palavras subindo de dentro da máscara
    $$('[data-split="words"]').forEach((el) => {
      const words = splitWords(el);
      gsap.fromTo(words, { yPercent: 115 }, {
        yPercent: 0,
        duration: 1.3,
        ease: EASE,
        stagger: 0.035,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
    });

    // Blocos simples: fade + 40px
    $$('[data-reveal="fade"]').forEach((el) => {
      gsap.fromTo(el, { opacity: 0, y: 40 }, {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: EASE,
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      });
    });

    // Grupos: cartões/linhas com stagger de 0.12s
    $$('[data-reveal-group]').forEach((group) => {
      const items = $$('[data-reveal-item]', group);
      if (!items.length) return;
      gsap.fromTo(items, { opacity: 0, y: 40 }, {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: EASE,
        stagger: 0.12,
        clearProps: 'opacity,transform', // libera estados de hover controlados pelo CSS
        scrollTrigger: { trigger: group, start: 'top 85%', once: true },
      });
    });

    // Imagens: máscara clip-path abrindo + leve zoom inverso
    $$('[data-reveal="image"]').forEach((frame) => {
      const img = $('.media__img', frame);
      const tl = gsap.timeline({ scrollTrigger: { trigger: frame, start: 'top 85%', once: true } });
      tl.fromTo(frame,
        { clipPath: 'inset(100% 0% 0% 0%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: EASE, clearProps: 'clipPath' });
      if (img) tl.fromTo(img, { scale: 1.2 }, { scale: 1, duration: 1.8, ease: EASE }, 0);
    });

    // Linhas finas que se desenham
    $$('[data-reveal="line"]').forEach((line) => {
      gsap.fromTo(line, { scaleX: 0 }, {
        scaleX: 1,
        duration: 1.4,
        ease: EASE,
        scrollTrigger: { trigger: line, start: 'top 92%', once: true },
      });
    });
  }


  /* ========================================================================
     08. MANIFESTO
     As palavras "acendem" conforme a leitura avança com o scroll.
     ======================================================================== */
  function initManifesto() {
    const el = $('[data-split="scrub"]');
    if (!el || !motionOK) return;

    const words = splitWords(el);
    window.gsap.fromTo(words, { opacity: 0.14 }, {
      opacity: 1,
      ease: 'none',
      stagger: 0.1,
      scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: 0.6 },
    });
  }


  /* ========================================================================
     09. PARALLAX
     data-parallax="0.06"  → imagem mais lenta que o scroll (fundo)
     data-parallax="-0.12" → cartão mais rápido (primeiro plano)
     ======================================================================== */
  function initParallax() {
    if (!motionOK) return;
    const { gsap } = window;
    const factor = mq.desktop.matches ? 1 : 0.6;

    $$('[data-parallax]').forEach((el) => {
      const amount = (parseFloat(el.dataset.parallax) || 0) * 100 * factor;
      if (!amount) return;
      gsap.fromTo(el, { yPercent: -amount }, {
        yPercent: amount,
        ease: 'none',
        scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });

    // Hero: imagem desce devagar e o conteúdo se afasta suavemente
    const hero = $('.hero');
    const heroInner = $('[data-hero-parallax]');
    if (hero && heroInner) {
      gsap.to(heroInner, {
        yPercent: 6,
        ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
      });
      gsap.to('.hero__content', {
        y: -60,
        opacity: 0.25,
        ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
      });
    }
  }


  /* ========================================================================
     ACORDEÃO GENÉRICO (procedimentos no mobile + FAQ)
     ======================================================================== */
  function setupAccordion({ items, trigger, single = true, isLocked = () => false }) {
    const setOpen = (item, open) => {
      item.classList.toggle('is-open', open);
      $(trigger, item).setAttribute('aria-expanded', String(open));
    };

    items.forEach((item) => {
      $(trigger, item).addEventListener('click', () => {
        if (isLocked()) return;
        const open = !item.classList.contains('is-open');
        if (single && open) items.forEach((other) => { if (other !== item) setOpen(other, false); });
        setOpen(item, open);
        refreshSoon();
      });
    });

    return setOpen;
  }


  /* ========================================================================
     10. PROCEDIMENTOS
     Desktop: lista aberta (descrição ao lado). Mobile: acordeão com abertura suave.
     ======================================================================== */
  function initProcedures() {
    const list = $('.proc');
    if (!list) return;
    const items = $$('.proc__item', list);

    setupAccordion({ items, trigger: '.proc__head', isLocked: () => mq.desktop.matches });

    // No desktop as descrições ficam sempre visíveis: sincroniza o aria-expanded
    const syncAria = () => {
      items.forEach((item) => {
        const open = mq.desktop.matches || item.classList.contains('is-open');
        $('.proc__head', item).setAttribute('aria-expanded', String(open));
      });
    };
    mq.desktop.addEventListener('change', syncAria);
    syncAria();
  }


  /* ========================================================================
     11. JORNADA
     A linha vertical se desenha com o scroll; os passos acendem ao serem alcançados.
     ======================================================================== */
  function initJourney() {
    const timeline = $('.journey__timeline');
    if (!timeline) return;
    const steps = $$('.journey__step', timeline);

    if (!motionOK) {
      steps.forEach((step) => step.classList.add('is-active'));
      return;
    }

    window.gsap.fromTo('.journey__progress', { scaleY: 0 }, {
      scaleY: 1,
      ease: 'none',
      scrollTrigger: { trigger: timeline, start: 'top 60%', end: 'bottom 60%', scrub: 0.5 },
    });

    steps.forEach((step) => {
      window.ScrollTrigger.create({
        trigger: step,
        start: 'top 60%',
        onEnter: () => step.classList.add('is-active'),
        onLeaveBack: () => step.classList.remove('is-active'),
      });
    });
  }


  /* ========================================================================
     12. CONTADORES
     Só animam números reais (data-count numérico). Placeholders ficam como estão.
     ======================================================================== */
  function initCounters() {
    $$('[data-count]').forEach((el) => {
      const target = parseFloat(el.dataset.count);
      if (!Number.isFinite(target)) return;

      const suffix = el.dataset.suffix || '';
      const format = (v) => `${Math.round(v).toLocaleString('pt-BR')}${suffix}`;

      if (!motionOK) {
        el.textContent = format(target);
        return;
      }

      const counter = { value: 0 };
      el.textContent = format(0);
      window.gsap.to(counter, {
        value: target,
        duration: 1.8,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        onUpdate: () => { el.textContent = format(counter.value); },
      });
    });
  }


  /* ========================================================================
     13. GALERIA (CARROSSEL) E LIGHTBOX
     Carrossel próprio movido por transform (GPU): acompanha o dedo/mouse,
     trava a direção do gesto (vertical rola a página, horizontal move a
     galeria), resistência elástica nas bordas e assentamento suave em um
     card por vez. Sem GSAP, cai para o scroll nativo com snap.
     ======================================================================== */
  function initGallery() {
    const gallery = $('.gallery');
    const track = $('.gallery__track');
    if (!gallery || !track) return;

    const bar = $('.gallery__progress-bar');
    const prev = $('[data-gallery-prev]');
    const next = $('[data-gallery-next]');
    const items = $$('.gallery__item', track);
    if (!items.length) return;

    // Carrega as fotos antes de chegarem (fora da tela à direita o lazy-load não dispara)
    if ('IntersectionObserver' in window) {
      const preload = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        preload.disconnect();
        $$('img[loading="lazy"]', track).forEach((img) => { img.loading = 'eager'; });
      }, { rootMargin: '600px 0px' });
      preload.observe(gallery);
    }

    // Fallback sem GSAP: scroll nativo + setas
    if (!hasGSAP) {
      const step = () => items[0].getBoundingClientRect().width + (parseFloat(getComputedStyle(track).columnGap) || 0);
      if (prev) prev.addEventListener('click', () => track.scrollBy({ left: -step() }));
      if (next) next.addEventListener('click', () => track.scrollBy({ left: step() }));
      return;
    }

    const { gsap } = window;
    gallery.classList.add('is-slider');

    const DURATION = mq.reduced.matches ? 0 : 0.9;
    const setX = gsap.quickSetter(track, 'x', 'px');
    const state = { pos: 0 };
    let snaps = [0];
    let max = 0;
    let index = 0;

    // Posições de encaixe de cada card (a última respeita o fim da trilha)
    const measure = () => {
      const padEnd = parseFloat(getComputedStyle(track).paddingRight) || 0;
      const last = items[items.length - 1];
      const first = items[0].offsetLeft;
      max = Math.max(0, last.offsetLeft + last.offsetWidth + padEnd - track.clientWidth);
      snaps = items.map((item) => Math.min(item.offsetLeft - first, max));
      snaps = snaps.filter((s, i) => i === 0 || s - snaps[i - 1] > 1);
      index = Math.min(index, snaps.length - 1);
    };

    const render = () => {
      setX(-state.pos);
      const progress = max > 0 ? Math.min(1, Math.max(0, state.pos / max)) : 1;
      const visible = Math.min(1, track.clientWidth / (track.clientWidth + max));
      if (bar) bar.style.transform = `scaleX(${visible + (1 - visible) * progress})`;
    };

    const updateButtons = () => {
      if (prev) prev.disabled = index <= 0;
      if (next) next.disabled = index >= snaps.length - 1;
    };

    const goTo = (i, duration = DURATION) => {
      index = Math.max(0, Math.min(snaps.length - 1, i));
      updateButtons();
      gsap.to(state, { pos: snaps[index], duration, ease: EASE, overwrite: true, onUpdate: render });
    };

    const nearestIndex = (pos) => snaps.reduce((best, s, i) => (Math.abs(s - pos) < Math.abs(snaps[best] - pos) ? i : best), 0);

    measure();
    render();
    updateButtons();

    if (prev) prev.addEventListener('click', () => goTo(index - 1));
    if (next) next.addEventListener('click', () => goTo(index + 1));

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { measure(); goTo(index, 0); }, 150);
    });

    // Teclado: ao focar um card fora da área visível, a galeria vai até ele
    track.addEventListener('focusin', (e) => {
      const item = e.target.closest('.gallery__item');
      gallery.scrollLeft = 0; // o foco não pode rolar o container recortado
      if (item) {
        const target = nearestIndex(Math.min(item.offsetLeft - items[0].offsetLeft, max));
        if (target !== index) goTo(target);
      }
    });

    // Arraste (dedo e mouse) com trava de direção
    let pointerId = null;
    let startX = 0;
    let startY = 0;
    let startPos = 0;
    let startIndex = 0;
    let axis = null; // null | 'x' | 'y'
    let moved = false;
    let lastX = 0;
    let lastT = 0;
    let velocity = 0; // px/ms (positivo = arrastando para a direita)

    const onDown = (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      pointerId = e.pointerId;
      startX = lastX = e.clientX;
      startY = e.clientY;
      startPos = state.pos;
      startIndex = nearestIndex(state.pos);
      lastT = performance.now();
      velocity = 0;
      axis = null;
      moved = false;
    };

    const onMove = (e) => {
      if (pointerId !== e.pointerId) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      if (axis === null) {
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
        axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
        if (axis === 'y') { pointerId = null; return; } // gesto vertical: deixa a página rolar
        gsap.killTweensOf(state);
        gallery.classList.add('is-dragging');
        if (track.setPointerCapture) track.setPointerCapture(e.pointerId);
      }

      moved = true;
      let pos = startPos - dx;
      if (pos < 0) pos *= 0.3;                       // resistência elástica no início
      if (pos > max) pos = max + (pos - max) * 0.3;  // e no fim
      state.pos = pos;
      render();

      const now = performance.now();
      const dt = Math.max(1, now - lastT);
      velocity = velocity * 0.6 + ((e.clientX - lastX) / dt) * 0.4;
      lastX = e.clientX;
      lastT = now;
    };

    const onUp = (e) => {
      if (pointerId !== e.pointerId) return;
      pointerId = null;
      gallery.classList.remove('is-dragging');
      if (axis !== 'x') return;

      // Um card por gesto: avança se arrastou ~1/5 do card ou com um gesto rápido
      const dx = e.clientX - startX;
      const step = snaps[1] !== undefined ? snaps[1] - snaps[0] : track.clientWidth;
      let target = startIndex;
      if (dx < -step * 0.2 || velocity < -0.35) target = startIndex + 1;
      else if (dx > step * 0.2 || velocity > 0.35) target = startIndex - 1;
      goTo(target);
    };

    track.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);

    // Um arraste não deve abrir o lightbox
    track.addEventListener('click', (e) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
        moved = false;
      }
    }, true);

    track.addEventListener('dragstart', (e) => e.preventDefault());
  }

  function initLightbox() {
    const dialog = $('.lightbox');
    if (!dialog || typeof dialog.showModal !== 'function') return;

    const triggers = $$('.gallery__open');
    const stage = $('.lightbox__stage', dialog);
    const caption = $('.lightbox__caption', dialog);
    const count = $('.lightbox__count', dialog);
    let index = 0;
    let opener = null;
    let closing = false;

    const render = (i, direction = 0) => {
      index = (i + triggers.length) % triggers.length;
      const trigger = triggers[index];

      // Clona a imagem do card (data-full, se existir, troca por uma versão maior)
      const node = $('img', trigger).cloneNode(true);
      node.removeAttribute('style');
      node.className = 'lightbox__img';
      node.loading = 'eager';
      if (trigger.dataset.full) node.src = trigger.dataset.full;

      stage.replaceChildren(node);
      caption.textContent = trigger.dataset.caption || '';
      count.textContent = `${pad(index + 1)} / ${pad(triggers.length)}`;

      if (motionOK && direction) {
        window.gsap.fromTo(stage, { opacity: 0, x: 24 * direction }, { opacity: 1, x: 0, duration: 0.8, ease: EASE });
      }
    };

    const open = (i, trigger) => {
      opener = trigger;
      render(i);
      dialog.showModal();
      if (lenis) lenis.stop();
      requestAnimationFrame(() => requestAnimationFrame(() => dialog.classList.add('is-visible')));
    };

    const close = () => {
      if (closing || !dialog.open) return;
      closing = true;
      dialog.classList.remove('is-visible');
      if (lenis) lenis.start();
      window.setTimeout(() => {
        dialog.close();
        closing = false;
        if (opener) opener.focus({ preventScroll: true });
      }, mq.reduced.matches ? 0 : 500);
    };

    triggers.forEach((trigger, i) => trigger.addEventListener('click', () => open(i, trigger)));

    $('.lightbox__close', dialog).addEventListener('click', close);
    $('.lightbox__prev', dialog).addEventListener('click', () => render(index - 1, -1));
    $('.lightbox__next', dialog).addEventListener('click', () => render(index + 1, 1));

    // Esc com animação de saída
    dialog.addEventListener('cancel', (e) => {
      e.preventDefault();
      close();
    });

    dialog.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') render(index - 1, -1);
      if (e.key === 'ArrowRight') render(index + 1, 1);
    });

    // Clique fora da imagem fecha
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog || e.target.classList.contains('lightbox__inner')) close();
    });

    // Swipe no lightbox (touch)
    let touchX = null;
    dialog.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') touchX = e.clientX; });
    dialog.addEventListener('pointerup', (e) => {
      if (touchX === null) return;
      const dx = e.clientX - touchX;
      touchX = null;
      if (Math.abs(dx) > 50) render(index + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
    });
  }


  /* ========================================================================
     14. DEPOIMENTOS
     Troca suave por fade; autoplay pausa no hover, no foco e fora da tela.
     ======================================================================== */
  function initTestimonials() {
    const slider = $('.testimonials__slider');
    if (!slider) return;

    const slides = $$('.testimonial', slider);
    const viewport = $('.testimonials__viewport', slider);
    const counter = $('[data-testimonial-count]', slider);
    const DELAY = 7000;
    let current = 0;
    let timer = null;
    let inView = false;

    const show = (n, byUser = false) => {
      current = (n + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        slide.classList.toggle('is-active', i === current);
        slide.setAttribute('aria-hidden', String(i !== current));
      });
      if (counter) counter.textContent = `${pad(current + 1)} / ${pad(slides.length)}`;
      viewport.setAttribute('aria-live', byUser ? 'polite' : 'off');
    };

    const stop = () => { window.clearInterval(timer); timer = null; };
    const play = () => {
      stop();
      if (mq.reduced.matches || slides.length < 2 || !inView) return;
      timer = window.setInterval(() => show(current + 1), DELAY);
    };

    const prev = $('[data-testimonial-prev]', slider);
    const next = $('[data-testimonial-next]', slider);
    if (prev) prev.addEventListener('click', () => { show(current - 1, true); play(); });
    if (next) next.addEventListener('click', () => { show(current + 1, true); play(); });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', play);
    slider.addEventListener('focusin', stop);
    slider.addEventListener('focusout', play);

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
        if (inView) play();
        else stop();
      }, { threshold: 0.3 }).observe(slider);
    }

    show(0);
  }


  /* ========================================================================
     15. FAQ
     ======================================================================== */
  function initFaq() {
    const items = $$('.faq__item');
    if (items.length) setupAccordion({ items, trigger: '.faq__btn' });
  }


  /* ========================================================================
     MAPA
     O iframe do Google Maps "prende" o dedo/scroll. Uma camada por cima deixa
     a página rolar; um toque/clique libera o mapa, que volta a ser bloqueado
     ao tocar fora, tirar o mouse ou sair da tela.
     ======================================================================== */
  function initMap() {
    const map = $('.contact__map');
    const cover = map && $('.contact__map-cover', map);
    if (!cover) return;

    const hint = $('.contact__map-hint', cover);
    if (hint && mq.finePointer.matches) hint.textContent = 'Clique para usar o mapa';

    const lock = () => map.classList.remove('is-active');
    cover.addEventListener('click', () => map.classList.add('is-active'));
    map.addEventListener('mouseleave', lock);
    document.addEventListener('pointerdown', (e) => { if (!map.contains(e.target)) lock(); });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) lock(); }).observe(map);
    }
  }


  /* ========================================================================
     16. CTAs FLUTUANTES
     Barra inferior (mobile) e WhatsApp (desktop) aparecem depois do hero
     e saem de cena perto do CTA final/rodapé.
     ======================================================================== */
  function initFloating() {
    const hero = $('.hero');
    if (!hero || !('IntersectionObserver' in window)) {
      root.classList.add('is-past-hero');
      return;
    }

    new IntersectionObserver(([entry]) => {
      const past = entry.intersectionRatio < 0.2 && entry.boundingClientRect.top < 0;
      root.classList.toggle('is-past-hero', past);
    }, { threshold: [0, 0.2] }).observe(hero);

    const endZones = $$('.cta-final, .footer');
    const visible = new Set();
    const endObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      });
      root.classList.toggle('is-near-end', visible.size > 0);
    }, { threshold: 0.15 });
    endZones.forEach((zone) => endObserver.observe(zone));
  }


  /* ========================================================================
     17. COR DE FUNDO ENTRE SEÇÕES
     A camada fixa .page-bg faz crossfade (só opacidade) entre ivory, sand e
     olive-deep conforme a seção que ocupa o centro da tela.
     ======================================================================== */
  function initPageBackground() {
    if (!motionOK || !$('.page-bg')) return;
    const sections = $$('[data-bg]');
    if (!sections.length) return;

    const setBg = (value) => {
      if (value && root.dataset.pageBg !== value) root.dataset.pageBg = value;
    };

    sections.forEach((section) => {
      window.ScrollTrigger.create({
        trigger: section,
        start: 'top 55%',
        end: 'bottom 55%',
        onToggle: (self) => { if (self.isActive) setBg(section.dataset.bg); },
      });
    });

    const mid = window.innerHeight * 0.55;
    const current = sections.find((s) => {
      const r = s.getBoundingClientRect();
      return r.top <= mid && r.bottom > mid;
    }) || sections[0];

    setBg(current.dataset.bg);
    root.classList.add('bg-flow');
  }


  /* ========================================================================
     18. AVISO DE COOKIES
     ======================================================================== */
  function initCookies() {
    const banner = $('.cookie');
    if (!banner) return;
    const KEY = 'jm-cookie-consent';

    const show = () => {
      banner.hidden = false;
      requestAnimationFrame(() => requestAnimationFrame(() => banner.classList.add('is-visible')));
    };

    const hide = (value) => {
      store.set(KEY, value);
      banner.classList.remove('is-visible');
      window.setTimeout(() => { banner.hidden = true; }, mq.reduced.matches ? 0 : 800);
    };

    $$('[data-cookie]', banner).forEach((btn) => btn.addEventListener('click', () => hide(btn.dataset.cookie)));
    $$('[data-cookie-open]').forEach((btn) => btn.addEventListener('click', show));

    if (store.get(KEY)) return;

    // Aparece quando a visitante deixa o hero (ou após 10s), sem cobrir a primeira dobra
    let shown = false;
    const showOnce = () => {
      if (shown) return;
      shown = true;
      show();
    };
    const hero = $('.hero');
    if (hero && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.5) {
          observer.disconnect();
          showOnce();
        }
      }, { threshold: [0.5] });
      window.setTimeout(() => observer.observe(hero), 1000);
    }
    window.setTimeout(showOnce, 10000);
  }


  /* ========================================================================
     19. INICIALIZAÇÃO
     ======================================================================== */
  function initYear() {
    $$('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });
  }

  function init() {
    if (motionOK) {
      window.gsap.registerPlugin(window.ScrollTrigger);
      root.classList.add('anim');
    }

    safe(initWhatsApp);
    safe(initYear);
    safe(initSmoothScroll);
    safe(initIntro, revealEverything);
    safe(initHeader);
    safe(initMenu);
    safe(initAnchors);
    safe(initReveals);
    safe(initManifesto);
    safe(initParallax);
    safe(initProcedures);
    safe(initJourney);
    safe(initCounters);
    safe(initGallery);
    safe(initLightbox);
    safe(initTestimonials);
    safe(initFaq);
    safe(initMap);
    safe(initFloating);
    safe(initPageBackground);
    safe(initCookies);

    if (motionOK) {
      // Fontes e imagens mudam alturas: recalcula os gatilhos
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => window.ScrollTrigger.refresh());
      window.addEventListener('load', () => window.ScrollTrigger.refresh());
    }
  }

  // Sem GSAP (CDN bloqueada): remove o preloader e segue sem animações
  if (!hasGSAP) {
    const preloader = document.querySelector('.preloader');
    if (preloader) preloader.remove();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

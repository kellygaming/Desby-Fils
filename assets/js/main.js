/* Desby & Fils — animations et interactions */
(() => {
  const doc = document.documentElement;
  const reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const aGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  if (reduit) doc.classList.add('reduit');
  if (!aGsap) doc.classList.add('js-off');

  /* ---------- année du pied de page ---------- */
  document.querySelectorAll('[data-annee]').forEach(el => { el.textContent = new Date().getFullYear(); });

  /* ---------- menu mobile ---------- */
  const burger = document.getElementById('burger');
  const entete = document.getElementById('entete');
  if (burger) {
    burger.addEventListener('click', () => {
      const ouvert = document.body.classList.toggle('menu-ouvert');
      burger.setAttribute('aria-expanded', ouvert);
    });
    document.querySelectorAll('#nav a').forEach(a => a.addEventListener('click', () => {
      document.body.classList.remove('menu-ouvert');
      burger.setAttribute('aria-expanded', 'false');
    }));
  }

  /* ---------- en-tête : solide après le haut de page, caché en descendant ---------- */
  let dernierY = 0;
  const majEntete = y => {
    if (!entete) return;
    entete.classList.toggle('est-solide', y > 60 || entete.classList.contains('entete--sombre'));
    const enDescente = y > dernierY && y > 400;
    entete.classList.toggle('est-cache', enDescente && !document.body.classList.contains('menu-ouvert'));
    dernierY = y;
  };
  majEntete(window.scrollY);

  /* ---------- formulaire : message de remerciement ---------- */
  if (location.search.includes('merci')) {
    const m = document.querySelector('.merci');
    if (m) m.classList.add('visible');
  }

  /* ---------- son de la société : lecture / pause ---------- */
  const audio = new Audio('assets/audio/desby-fils.mp3');
  audio.preload = 'none';
  const lecteur = document.createElement('button');
  lecteur.className = 'lecteur-son';
  lecteur.type = 'button';
  lecteur.setAttribute('aria-label', 'Écouter le son Desby & Fils');
  lecteur.innerHTML = `<span class="rond">
      <svg class="anneau" viewBox="0 0 50 50" aria-hidden="true"><circle cx="25" cy="25" r="24"/></svg>
      <svg class="ico lecture" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
      <svg class="ico pause" viewBox="0 0 24 24" fill="currentColor"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>
    </span><span class="texte">Écouter<small>Le son Desby &amp; Fils</small></span><span class="barres" aria-hidden="true"><i></i><i></i><i></i></span>`;
  document.body.appendChild(lecteur);
  const anneau = lecteur.querySelector('.anneau circle');
  lecteur.addEventListener('click', () => { audio.paused ? audio.play() : audio.pause(); });
  audio.addEventListener('play', () => { lecteur.classList.add('joue'); lecteur.setAttribute('aria-label', 'Mettre le son en pause'); });
  audio.addEventListener('pause', () => { lecteur.classList.remove('joue'); lecteur.setAttribute('aria-label', 'Écouter le son Desby & Fils'); });
  audio.addEventListener('ended', () => { audio.currentTime = 0; anneau.style.strokeDashoffset = 150.8; });
  audio.addEventListener('timeupdate', () => {
    if (audio.duration) anneau.style.strokeDashoffset = 150.8 * (1 - audio.currentTime / audio.duration);
  });
  // une seule source sonore à la fois : couper le son si une vidéo démarre
  document.querySelectorAll('video').forEach(v => v.addEventListener('play', () => audio.pause()));

  /* ---------- bande photo : défile seule, flèches et glisser ---------- */
  document.querySelectorAll('.bande').forEach(bande => {
    const piste = bande.querySelector('.bande__piste');
    const pas = () => (piste.querySelector('figure')?.offsetWidth || 300) + 18;
    let pause = false, reprise = null, x = piste.scrollLeft;
    const arreter = (ms = 4000) => { pause = true; clearTimeout(reprise); reprise = setTimeout(() => { pause = false; x = piste.scrollLeft; }, ms); };
    // la piste contient les photos en double : on revient au début sans que ça se voie
    // vers l'avant : passé la moitié, on recule d'une moitié ; vers l'arrière : trop près du début, on avance d'une moitié
    const boucler = (arriere = false) => {
      const moitie = piste.scrollWidth / 2;
      if (piste.scrollLeft >= moitie) piste.scrollLeft -= moitie;
      else if (arriere && piste.scrollLeft < pas() * 1.5) piste.scrollLeft += moitie;
      x = piste.scrollLeft;
    };
    if (!reduit) {
      const avancer = () => {
        if (!pause) {
          // x garde les fractions de pixel que scrollLeft arrondit
          x += 0.45;
          const moitie = piste.scrollWidth / 2;
          if (x >= moitie) x -= moitie;
          piste.scrollLeft = x;
        }
        requestAnimationFrame(avancer);
      };
      requestAnimationFrame(avancer);
    }
    bande.querySelector('.fleche--prec')?.addEventListener('click', () => { arreter(); boucler(true); piste.scrollBy({ left: -pas(), behavior: 'smooth' }); });
    bande.querySelector('.fleche--suiv')?.addEventListener('click', () => { arreter(); boucler(); piste.scrollBy({ left: pas(), behavior: 'smooth' }); });
    piste.addEventListener('mouseenter', () => { pause = true; });
    piste.addEventListener('mouseleave', () => arreter(800));
    piste.addEventListener('touchstart', () => arreter(), { passive: true });
    piste.addEventListener('wheel', () => arreter(), { passive: true });
    // glisser à la souris
    let depart = null;
    piste.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; depart = { x: e.clientX, s: piste.scrollLeft }; piste.classList.add('saisie'); arreter(); });
    window.addEventListener('pointermove', e => { if (!depart) return; const avant = piste.scrollLeft; piste.scrollLeft = depart.s - (e.clientX - depart.x); if (piste.scrollLeft !== avant) { boucler(piste.scrollLeft < avant); depart = { x: e.clientX, s: piste.scrollLeft }; } });
    window.addEventListener('pointerup', () => { if (depart) { depart = null; piste.classList.remove('saisie'); arreter(); } });
  });

  /* ---------- visionneuse des albums ---------- */
  const albums = document.querySelectorAll('[data-album]');
  if (albums.length) {
    const v = document.createElement('div');
    v.className = 'visionneuse';
    v.setAttribute('role', 'dialog'); v.setAttribute('aria-modal', 'true'); v.setAttribute('aria-label', 'Photo agrandie');
    v.innerHTML = `<span class="compte"></span><figure><img alt=""><figcaption></figcaption></figure>
      <button class="fermer" aria-label="Fermer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
      <button class="prec" aria-label="Photo précédente"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 6l-6 6 6 6"/></svg></button>
      <button class="suiv" aria-label="Photo suivante"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg></button>`;
    document.body.appendChild(v);
    const img = v.querySelector('img'), leg = v.querySelector('figcaption'), compte = v.querySelector('.compte');
    let liste = [], i = 0, dernierFocus = null;
    const montrer = n => {
      i = (n + liste.length) % liste.length;
      const b = liste[i];
      img.src = b.dataset.grand || b.querySelector('img').src;
      img.alt = b.querySelector('img').alt;
      leg.textContent = b.querySelector('span')?.textContent || '';
      compte.textContent = `${String(i + 1).padStart(2, '0')} / ${String(liste.length).padStart(2, '0')}`;
    };
    const ouvrir = (album, n) => { liste = [...album.querySelectorAll('button')]; dernierFocus = document.activeElement; montrer(n); v.classList.add('ouverte'); document.documentElement.style.overflow = 'hidden'; v.querySelector('.fermer').focus(); };
    const fermer = () => { v.classList.remove('ouverte'); document.documentElement.style.overflow = ''; dernierFocus?.focus(); };
    albums.forEach(album => album.querySelectorAll('button').forEach((b, n) => b.addEventListener('click', () => ouvrir(album, n))));
    v.querySelector('.fermer').addEventListener('click', fermer);
    v.querySelector('.prec').addEventListener('click', () => montrer(i - 1));
    v.querySelector('.suiv').addEventListener('click', () => montrer(i + 1));
    v.addEventListener('click', e => { if (e.target === v) fermer(); });
    document.addEventListener('keydown', e => {
      if (!v.classList.contains('ouverte')) return;
      if (e.key === 'Escape') fermer(); else if (e.key === 'ArrowLeft') montrer(i - 1); else if (e.key === 'ArrowRight') montrer(i + 1);
    });
    let tx = null;
    v.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
    v.addEventListener('touchend', e => { if (tx === null) return; const d = e.changedTouches[0].clientX - tx; if (Math.abs(d) > 50) montrer(i + (d < 0 ? 1 : -1)); tx = null; });
  }

  if (!aGsap) { window.addEventListener('scroll', () => majEntete(window.scrollY), { passive: true }); return; }

  gsap.registerPlugin(ScrollTrigger);

  /* ---------- défilement doux (Lenis) ---------- */
  let lenis = null;
  if (!reduit && typeof window.Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    lenis.on('scroll', e => { ScrollTrigger.update(); majEntete(e.scroll); });
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const cible = document.querySelector(a.getAttribute('href'));
      if (cible) { e.preventDefault(); lenis.scrollTo(cible, { offset: -20, duration: 1.6 }); }
    }));
  } else {
    window.addEventListener('scroll', () => majEntete(window.scrollY), { passive: true });
  }

  /* ---------- hero : entrée du titre ---------- */
  const lignes = document.querySelectorAll('.hero__ligne > span');
  if (lignes.length && !reduit) {
    gsap.from(lignes, { yPercent: 110, duration: 1.3, ease: 'power4.out', stagger: 0.12, delay: 0.2 });
    gsap.from('.hero .surtitre, .hero .lead, .hero__actions, .hero__bas', { opacity: 0, y: 24, duration: 1.1, ease: 'power3.out', stagger: 0.1, delay: 0.6 });
  }
  document.querySelectorAll('[data-parallaxe]').forEach(el => {
    gsap.to(el, { yPercent: parseFloat(el.dataset.parallaxe) * 40, ease: 'none',
      scrollTrigger: { trigger: el.parentElement, start: 'top top', end: 'bottom top', scrub: true } });
  });
  document.querySelectorAll('[data-parallaxe-img]').forEach(img => {
    gsap.fromTo(img, { yPercent: -8 }, { yPercent: 8, ease: 'none',
      scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  /* ---------- apparitions ---------- */
  if (!reduit) {
    ScrollTrigger.batch('.revele', {
      start: 'top 88%',
      onEnter: els => gsap.to(els, { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out', stagger: 0.09, overwrite: true })
    });
  }

  /* ---------- compteurs ---------- */
  document.querySelectorAll('[data-compte]').forEach(el => {
    const fin = parseFloat(el.dataset.compte);
    const suffixe = el.dataset.suffixe || '';
    const obj = { v: 0 };
    ScrollTrigger.create({
      trigger: el, start: 'top 90%', once: true,
      onEnter: () => gsap.to(obj, { v: fin, duration: reduit ? 0 : 2.2, ease: 'power2.out',
        onUpdate: () => { el.textContent = Math.round(obj.v).toLocaleString('fr-FR') + suffixe; } })
    });
  });

  /* ==========================================================
     Lecteur de séquence d'images piloté par le scroll
     (utilisé dès que les vidéos générées sont découpées en images)
     ========================================================== */
  function creerSequence(scene) {
    const total = parseInt(scene.dataset.seqCount || '0', 10);
    if (!total) return null;
    const chemin = scene.dataset.seqPath;
    const ext = scene.dataset.seqExt || 'webp';
    const inverse = scene.dataset.seqReverse === 'true';
    const canvas = scene.querySelector('canvas.seq');
    const ctx = canvas.getContext('2d');
    const images = new Array(total);
    const fondHaut = scene.dataset.seqFondHaut || 'rgba(239,231,214,1)';
    const fondBas = scene.dataset.seqFondBas || '#c9773f';
    let courant = -1, pret = false;

    const taille = () => {
      const r = canvas.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = r.width * dpr; canvas.height = r.height * dpr;
      const i = courant; courant = -1; dessiner(i < 0 ? 0 : i);
    };
    const nom = i => chemin + String(i + 1).padStart(4, '0') + '.' + ext;
    const charger = i => {
      if (images[i]) return images[i];
      const img = new Image(); img.decoding = 'async'; img.src = nom(i); images[i] = img; return img;
    };
    function dessiner(i) {
      i = Math.max(0, Math.min(total - 1, i));
      if (i === courant) return;
      let img = images[i];
      // si l'image n'est pas encore là, prendre la plus proche déjà chargée
      if (!img || !img.complete || !img.naturalWidth) {
        for (let d = 1; d < total; d++) {
          const a = images[i - d], b = images[i + d];
          if (a && a.complete && a.naturalWidth) { img = a; break; }
          if (b && b.complete && b.naturalWidth) { img = b; break; }
        }
      }
      if (!img || !img.naturalWidth) return;
      courant = i;
      const cw = canvas.width, ch = canvas.height, iw = img.naturalWidth, ih = img.naturalHeight;
      if (cw / ch >= 1) {
        // écran horizontal : la vidéo remplit tout
        const s = Math.max(cw / iw, ch / ih), w = iw * s, h = ih * s;
        ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
      } else {
        // écran vertical : on garde toute la scène lisible, posée en bas, fondue dans le sable en haut
        const s = Math.max(cw * 1.55 / iw, ch * 0.5 / ih), w = iw * s, h = ih * s;
        const y = ch - h - ch * 0.06;
        ctx.clearRect(0, 0, cw, ch);
        ctx.drawImage(img, (cw - w) / 2, y, w, h);
        ctx.fillStyle = fondBas; ctx.fillRect(0, y + h - 1, cw, ch - (y + h) + 1);
        const g = ctx.createLinearGradient(0, y, 0, y + h * 0.35);
        g.addColorStop(0, fondHaut); g.addColorStop(1, 'rgba(247,241,230,0)');
        ctx.fillStyle = g; ctx.fillRect(0, y - 1, cw, h * 0.35 + 1);
      }
    }
    // la première image décide si on passe en mode séquence
    const premiere = charger(inverse ? total - 1 : 0);
    premiere.onload = () => {
      pret = true; scene.classList.add('a-sequence'); taille();
      for (let i = 0; i < total; i++) charger(i);
    };
    // suit la vraie taille du canvas (rotation du téléphone, barre d'adresse, fenêtre redimensionnée)
    new ResizeObserver(() => pret && taille()).observe(canvas);
    return {
      maj(p) { if (!pret) return; const f = Math.round(p * (total - 1)); dessiner(inverse ? total - 1 - f : f); }
    };
  }

  /* ==========================================================
     Poussière (petites particules couleur latérite)
     ========================================================== */
  function creerPoussiere(canvas) {
    const ctx = canvas.getContext('2d');
    const parts = [];
    let actif = false;
    const taille = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.clientWidth * dpr; canvas.height = canvas.clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    taille(); new ResizeObserver(taille).observe(canvas);
    function boucle() {
      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.x += p.vx; p.y += p.vy; p.vy += p.g; p.vx *= 0.985; p.vie -= p.usure; p.r += p.croit;
        if (p.vie <= 0) { parts.splice(i, 1); continue; }
        ctx.globalAlpha = Math.max(0, p.vie) * p.a;
        ctx.fillStyle = p.c;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (parts.length) requestAnimationFrame(boucle); else actif = false;
    }
    return {
      emettre(x, y, n, opts = {}) {
        if (reduit) return;
        for (let i = 0; i < n && parts.length < 420; i++) {
          const nuage = Math.random() < (opts.nuage ?? 0.55);
          parts.push({
            x: x + (Math.random() - 0.5) * (opts.largeur || 40), y: y + (Math.random() - 0.5) * 10,
            vx: (Math.random() - 0.5) * (opts.vx || 1.6) + (opts.dx || 0), vy: nuage ? -Math.random() * 0.7 : -Math.random() * 2.2,
            g: nuage ? -0.004 : 0.09, r: nuage ? 6 + Math.random() * 12 : 1 + Math.random() * 2.2,
            croit: nuage ? 0.18 : 0, vie: 1, usure: nuage ? 0.007 + Math.random() * 0.008 : 0.02,
            a: nuage ? 0.14 : 0.8, c: opts.couleur || (nuage ? '#d9c3a0' : '#9c6a44')
          });
        }
        if (!actif) { actif = true; requestAnimationFrame(boucle); }
      }
    };
  }

  // coordonnées SVG -> pixels de la scène
  function versEcran(svg, x, y, scene) {
    const pt = svg.createSVGPoint(); pt.x = x; pt.y = y;
    const m = svg.getScreenCTM(); if (!m) return { x: 0, y: 0 };
    const p = pt.matrixTransform(m), r = scene.getBoundingClientRect();
    return { x: p.x - r.left, y: p.y - r.top };
  }

  /* ==========================================================
     SCÈNE 1 — la maison se démonte : toit, murs, sol, terrain propre
     ========================================================== */
  const sMaison = document.getElementById('scene-maison');
  if (sMaison) {
    const pin = sMaison.querySelector('.scene__pin');
    const svg = sMaison.querySelector('.illus svg');
    const seq = creerSequence(sMaison);
    const poussiere = creerPoussiere(sMaison.querySelector('canvas.poussiere'));
    const etapes = sMaison.querySelectorAll('.etapes li');
    const titre = document.getElementById('titre-terrain');
    // découpe du titre en mots pour l'apparition
    titre.innerHTML = titre.innerHTML.replace(/(<em>.*?<\/em>|[^\s<]+)/g, m => `<span class="mot"><span>${m}</span></span>`);

    const clipMurs = document.getElementById('clip-murs-rect');
    const clipDalle = document.getElementById('clip-dalle-rect');
    const pans = gsap.utils.toArray('#toit .pan');
    gsap.set(pans, { transformOrigin: '50% 100%' });

    const tl = gsap.timeline({ defaults: { ease: 'none' } });
    tl.to('.scene--maison .scene__intro', { opacity: 0, y: -30, duration: 0.06 }, 0.02)
      // 1. la toiture, pan par pan
      .to(pans, { y: -170, rotation: (i) => [-6, -3, 4, 7, 2][i] || 0, opacity: 0, stagger: 0.035, duration: 0.11, ease: 'power1.in' }, 0.08)
      // 2. les murs, démontés du haut vers le bas
      .to(clipMurs, { attr: { y: 470 }, duration: 0.24 }, 0.3)
      // 3. le sol : dalle puis aménagements
      .to(clipDalle, { attr: { y: 494 }, duration: 0.08 }, 0.56)
      .to('#sol-amenagements', { opacity: 0, y: 8, duration: 0.1 }, 0.62)
      // 4. le terrain propre et borné
      .to('#bornes', { opacity: 1, duration: 0.06 }, 0.74)
      .from('#bornes .borne', { y: -30, opacity: 0, stagger: 0.012, duration: 0.05, ease: 'back.out(2)' }, 0.74)
      .fromTo('#titre-terrain .mot > span', { yPercent: 105 }, { yPercent: 0, stagger: 0.012, duration: 0.08, ease: 'power3.out' }, 0.8)
      .to('#sous-titre-terrain', { opacity: 1, duration: 0.06 }, 0.9)
      .to({}, { duration: 0.06 }, 0.94);

    let dernierP = 0;
    ScrollTrigger.create({
      trigger: sMaison, pin, start: 'top top', end: () => '+=' + window.innerHeight * 3.6,
      scrub: 0.6, animation: tl, anticipatePin: 1,
      onUpdate(self) {
        const p = self.progress, vitesse = Math.abs(p - dernierP); dernierP = p;
        if (seq) seq.maj(gsap.utils.clamp(0, 1, gsap.utils.mapRange(0.06, 0.76, 0, 1, p)));
        // la vidéo (jouée à l'envers) n'a pas tout à fait le même rythme que le dessin
        const n = sMaison.classList.contains('a-sequence')
          ? (p < 0.24 ? 1 : p < 0.48 ? 2 : p < 0.66 ? 3 : 4)
          : (p < 0.29 ? 1 : p < 0.55 ? 2 : p < 0.73 ? 3 : 4);
        etapes.forEach(li => li.classList.toggle('actif', +li.dataset.etape === n && p > 0.04));
        // poussière au point de démontage
        if (vitesse > 0.0004 && !sMaison.classList.contains('a-sequence')) {
          const n2 = Math.min(10, Math.ceil(vitesse * 900));
          if (p > 0.08 && p < 0.3) { const q = versEcran(svg, 600 + Math.random() * 200, 240, pin); poussiere.emettre(q.x, q.y, n2, { largeur: 260 }); }
          else if (p >= 0.3 && p < 0.54) {
            const y = 196 + (470 - 196) * ((p - 0.3) / 0.24);
            const x0 = y < 320 ? 520 : 200, x1 = y < 320 ? 820 : 900;
            const q0 = versEcran(svg, x0, y, pin), q1 = versEcran(svg, x1, y, pin);
            poussiere.emettre((q0.x + q1.x) / 2, q0.y, n2 + 2, { largeur: Math.abs(q1.x - q0.x) });
          } else if (p >= 0.56 && p < 0.72) { const q0 = versEcran(svg, 150, 486, pin), q1 = versEcran(svg, 950, 486, pin); poussiere.emettre((q0.x + q1.x) / 2, q0.y, n2, { largeur: q1.x - q0.x }); }
        }
      }
    });
  }

  /* ==========================================================
     SCÈNE 2 — camion, chargeuse et compacteur font la route
     ========================================================== */
  const sRoute = document.getElementById('scene-route');
  if (sRoute) {
    const pin = sRoute.querySelector('.scene__pin');
    const svg = sRoute.querySelector('.illus svg');
    const seq = creerSequence(sRoute);
    const poussiere = creerPoussiere(sRoute.querySelector('canvas.poussiere'));
    const camion = document.getElementById('camion');
    const benne = document.getElementById('benne');
    const chargeuse = document.getElementById('chargeuse');
    const bras = document.getElementById('bras');
    const rouleau = document.getElementById('rouleau');
    const remblai = document.getElementById('remblai-rect');
    const compacte = document.getElementById('compacte-rect');
    const tas = gsap.utils.toArray('#tas .tas');
    const tasX = [560, 860, 1160];
    const compteur = document.getElementById('compteur-metres');
    const roues = c => c.querySelectorAll('.roue');
    gsap.set(sRoute.querySelectorAll('.roue'), { transformOrigin: '50% 50%' });
    gsap.set(tas, { transformOrigin: '50% 100%', scale: 0 });
    gsap.set(benne, { transformOrigin: '0% 100%' });
    gsap.set(bras, { transformOrigin: '5% 60%' });

    const L = (a, b, t) => a + (b - a) * t;
    const seg = (p, a, b) => gsap.utils.clamp(0, 1, (p - a) / (b - a));
    const lisse = t => t * t * (3 - 2 * t);
    const etat = { p: 0 };
    let precX = { c: 0, h: 0, r: 0 };

    function rendu(p) {
      if (seq) seq.maj(p);
      const xc = L(-460, 1720, lisse(seg(p, 0.02, 0.58)));
      const xh = L(-760, 1720, lisse(seg(p, 0.14, 0.8)));
      const xr = L(-640, 1720, lisse(seg(p, 0.3, 0.98)));
      camion.setAttribute('transform', `translate(${xc} 0)`);
      chargeuse.setAttribute('transform', `translate(${xh} 0)`);
      rouleau.setAttribute('transform', `translate(${xr} 0)`);
      gsap.set(roues(camion), { rotation: xc * 1.7 });
      gsap.set(roues(chargeuse), { rotation: xh * 1.3 });
      gsap.set(roues(rouleau), { rotation: xr * 1.1 });
      // la benne se lève au-dessus de chaque point de déchargement
      let bascule = 0;
      tasX.forEach(x => { bascule = Math.max(bascule, 1 - Math.abs((xc + 20) - (x + 40)) / 110); });
      gsap.set(benne, { rotation: -22 * Math.max(0, bascule) });
      gsap.set(bras, { rotation: Math.sin(xh / 60) * 4 - 2 });
      // remblai derrière le camion, compactage derrière le rouleau
      remblai.setAttribute('width', Math.max(0, xc + 30));
      compacte.setAttribute('width', Math.max(0, xr + 20));
      // tas : déposés par le camion, étalés par la chargeuse
      tas.forEach((t, i) => {
        const pose = gsap.utils.clamp(0, 1, ((xc + 20) - tasX[i]) / 60);
        const etale = gsap.utils.clamp(0, 1, ((xh + 318) - (tasX[i] + 40)) / 90);
        gsap.set(t, { scaleY: pose * (1 - etale), scaleX: pose * (1 + etale * 0.6) });
      });
      compteur.textContent = Math.round(seg(p, 0.02, 0.98) * 1200).toLocaleString('fr-FR');
      // poussière sous les roues quand ça roule
      if (!sRoute.classList.contains('a-sequence')) {
        [['c', xc, 70, 620, 30], ['h', xh, 50, 620, 40], ['r', xr, 30, 616, 16]].forEach(([k, x, off, y, n]) => {
          const d = Math.abs(x - precX[k]); precX[k] = x;
          if (d > 1.2 && x > -200 && x < 1650) { const q = versEcran(svg, x + off, y, pin); poussiere.emettre(q.x, q.y, Math.min(4, Math.ceil(d / 6)), { largeur: 50, dx: -0.6, nuage: 0.8 }); }
        });
      }
    }
    rendu(0);

    gsap.to(etat, {
      p: 1, ease: 'none',
      onUpdate: () => rendu(etat.p),
      scrollTrigger: { trigger: sRoute, pin, start: 'top top', end: () => '+=' + window.innerHeight * 3, scrub: 0.8, anticipatePin: 1 }
    });
    gsap.from('.route__texte > *', { opacity: 0, y: 30, stagger: 0.1, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: sRoute, start: 'top 60%' } });
  }

  window.addEventListener('load', () => ScrollTrigger.refresh());
})();

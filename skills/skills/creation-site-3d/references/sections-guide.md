# Guide des Sections — Référence d'Implémentation Détaillée

Ce document contient les patterns d'implémentation exacts pour chaque section du site
scroll-stop. Lire la section pertinente lors de la construction de cette partie du site.

## Table des Matières

1. [Fond Étoilé](#1-fond-étoilé)
2. [Loader](#2-loader)
3. [Barre de Progression Scroll](#3-barre-de-progression-scroll)
4. [Navbar (Scroll-to-Pill)](#4-navbar)
5. [Section Hero](#5-section-hero)
6. [Animation Scroll (Séquence de Frames)](#6-animation-scroll)
7. [Cartes d'Annotation (Snap-Stop)](#7-cartes-dannotation)
8. [Section Specs (Count-Up)](#8-section-specs)
9. [Grille Fonctionnalités](#9-grille-fonctionnalités)
10. [Section CTA](#10-section-cta)
11. [Témoignages (Optionnel)](#11-témoignages)
12. [Card Scanner (Optionnel)](#12-card-scanner)
13. [Footer](#13-footer)

---

## 1. Fond Étoilé

Un canvas fixe derrière tout le contenu, créant un fond vivant subtil d'étoiles scintillantes
qui dérivent lentement.

### Structure

```html
<canvas id="starscape"></canvas>
```

### Style

```css
#starscape {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
  opacity: 0.6;
}
```

### JavaScript

Générer ~180 étoiles, chacune avec :
- Position x, y aléatoire
- Rayon aléatoire (0.3–1.5px)
- Opacité de base aléatoire (0.2–0.8)
- Vitesse de dérive aléatoire (x: -0.02 à 0.02, y: -0.01 à 0.01)
- Vitesse et phase de scintillement aléatoires

Boucle d'animation :
```javascript
function animateStars() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  stars.forEach(star => {
    star.x += star.driftX;
    star.y += star.driftY;
    // Rebouclage aux bords
    if (star.x < 0) star.x = canvas.width;
    if (star.x > canvas.width) star.x = 0;
    if (star.y < 0) star.y = canvas.height;
    if (star.y > canvas.height) star.y = 0;
    // Scintillement
    const twinkle = Math.sin(Date.now() * star.twinkleSpeed + star.twinklePhase);
    const opacity = star.baseOpacity + twinkle * 0.3;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, opacity)})`;
    ctx.fill();
  });
  requestAnimationFrame(animateStars);
}
```

Redimensionner le canvas pour devicePixelRatio au resize.

---

## 2. Loader

Overlay plein écran affiché pendant le préchargement des frames. Disparaît en fondu une fois
toutes les frames chargées.

### Structure

```html
<div id="loader">
  <div class="loader-content">
    <div class="loader-logo"><!-- Logo de marque ici --></div>
    <p class="loader-text">Chargement</p>
    <div class="loader-bar-track">
      <div class="loader-bar-fill" id="loaderBar"></div>
    </div>
  </div>
</div>
```

### Style

- Plein viewport, `position: fixed`, `z-index: 9999`
- Fond : même que la couleur de fond du site
- Logo : centré, max-width ~120px
- Texte "Chargement" : uppercase, letter-spacing 3px, couleur atténuée
- Track barre de progression : 200px de large, 3px de haut, arrondie, fond atténué
- Remplissage barre : couleur accent, `transition: width 0.3s ease`

### Comportement

Mettre à jour `loaderBar.style.width` au fur et à mesure du chargement des frames :
```javascript
const pct = (loadedCount / totalFrames) * 100;
loaderBar.style.width = pct + '%';
```

Quand toutes les frames sont chargées :
```javascript
loader.style.opacity = '0';
loader.style.transition = 'opacity 0.6s ease';
setTimeout(() => loader.style.display = 'none', 600);
```

---

## 3. Barre de Progression Scroll

Fine barre tout en haut du viewport montrant la progression globale du scroll.

### Structure

```html
<div id="scrollProgress"></div>
```

### Style

```css
#scrollProgress {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  width: 0%;
  background: linear-gradient(90deg, var(--accent), var(--accent-light, var(--accent)));
  z-index: 10000;
  transition: width 0.1s linear;
}
```

### JavaScript

```javascript
window.addEventListener('scroll', () => {
  const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
  scrollProgress.style.width = pct + '%';
}, { passive: true });
```

---

## 4. Navbar

Commence comme une barre pleine largeur, puis au scroll se transforme en pill flottante centrée
avec style glass-morphism.

### Structure

```html
<nav id="navbar">
  <div class="nav-inner">
    <div class="nav-logo">
      <!-- Logo + nom de marque -->
    </div>
    <div class="nav-links">
      <a href="#features">Fonctionnalités</a>
      <a href="#specs">Specs</a>
      <a href="#cta" class="nav-cta">Commencer</a>
    </div>
  </div>
</nav>
```

### Style

État par défaut :
```css
#navbar {
  position: fixed;
  top: 12px;
  left: 0;
  right: 0;
  z-index: 1000;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.nav-inner {
  max-width: 100%;
  margin: 0 auto;
  padding: 12px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
```

État scrollé (pill) — appliqué via la classe `.nav-scrolled` :
```css
#navbar.nav-scrolled .nav-inner {
  max-width: 820px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 100px;
  padding: 10px 24px;
}
```

### JavaScript

```javascript
window.addEventListener('scroll', () => {
  navbar.classList.toggle('nav-scrolled', window.scrollY > 80);
}, { passive: true });
```

### Mobile

Cacher `.nav-links` sur écrans < 768px. Afficher seulement le logo dans la pill.

---

## 5. Section Hero

La section d'ouverture avec titre, sous-titre, boutons CTA, et éléments décoratifs.

### Structure

```html
<section id="hero">
  <div class="hero-bg">
    <div class="orb orb-1"></div>
    <div class="orb orb-2"></div>
    <div class="grid-overlay"></div>
  </div>
  <div class="hero-content">
    <h1 class="hero-title"><!-- Du contenu utilisateur --></h1>
    <p class="hero-subtitle"><!-- Du contenu utilisateur --></p>
    <div class="hero-buttons">
      <a href="#cta" class="btn-primary"><!-- Texte CTA --></a>
      <a href="#features" class="btn-secondary">En savoir plus</a>
    </div>
    <div class="scroll-hint">
      <span>Scrollez pour explorer</span>
      <div class="scroll-arrow"></div>
    </div>
  </div>
</section>
```

### Éléments Décoratifs

**Orbes** : Grands cercles floutés utilisant la couleur accent à faible opacité :
```css
.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.15;
}
.orb-1 {
  width: 500px; height: 500px;
  background: var(--accent);
  top: -200px; right: -100px;
}
.orb-2 {
  width: 400px; height: 400px;
  background: var(--accent);
  bottom: -150px; left: -100px;
  opacity: 0.1;
}
```

**Grille overlay** : Lignes de grille CSS subtiles :
```css
.grid-overlay {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
  background-size: 60px 60px;
  pointer-events: none;
}
```

**Indication de scroll** : Flèche animée rebondissante en bas du hero.

### Boutons

```css
.btn-primary {
  background: var(--accent);
  color: #000;
  padding: 14px 32px;
  border-radius: 12px;
  font-weight: 600;
  text-decoration: none;
  box-shadow: 0 0 20px rgba(var(--accent-rgb), 0.3);
  transition: all 0.3s ease;
}
.btn-primary:hover {
  box-shadow: 0 0 30px rgba(var(--accent-rgb), 0.5);
  transform: translateY(-2px);
}
.btn-secondary {
  background: transparent;
  color: #fff;
  padding: 14px 32px;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.3s ease;
}
```

---

## 6. Animation Scroll

Le cœur du site — un canvas sticky qui joue la vidéo en avant/arrière en fonction du scroll.

### Structure

```html
<section class="scroll-animation">
  <div class="scroll-sticky">
    <canvas id="frameCanvas"></canvas>
    <!-- Les cartes d'annotation vont ici (voir section 7) -->
  </div>
</section>
```

### Style

```css
.scroll-animation {
  height: 350vh; /* Contrôle la vitesse de scroll : plus de hauteur = plus lent */
  position: relative;
}
.scroll-sticky {
  position: sticky;
  top: 0;
  height: 100vh;
  width: 100%;
  overflow: hidden;
}
#frameCanvas {
  position: absolute;
  top: 0;
  left: 0;
}
```

### Hauteurs responsive

```css
@media (max-width: 1024px) { .scroll-animation { height: 300vh; } }
@media (max-width: 768px)  { .scroll-animation { height: 250vh; } }
```

### JavaScript — Préchargement des frames

```javascript
const frameCount = /* total frames extraites */;
const frames = [];
let loadedFrames = 0;

for (let i = 1; i <= frameCount; i++) {
  const img = new Image();
  img.src = `frames/frame_${String(i).padStart(4, '0')}.jpg`;
  img.onload = () => {
    loadedFrames++;
    updateLoader(loadedFrames / frameCount);
    if (loadedFrames === frameCount) onAllFramesLoaded();
  };
  frames.push(img);
}
```

### JavaScript — Mapping scroll-to-frame

```javascript
let currentFrame = -1;
let ticking = false;

window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      const section = document.querySelector('.scroll-animation');
      const rect = section.getBoundingClientRect();
      const scrollableHeight = section.offsetHeight - window.innerHeight;
      const progress = Math.min(1, Math.max(0, -rect.top / scrollableHeight));
      const frameIndex = Math.min(frameCount - 1, Math.floor(progress * frameCount));

      if (frameIndex !== currentFrame) {
        currentFrame = frameIndex;
        drawFrame(frameIndex);
      }
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });
```

### JavaScript — Dessin avec cover-fit

```javascript
function drawFrame(index) {
  const img = frames[index];
  if (!img) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const cw = canvas.width;
  const ch = canvas.height;

  ctx.clearRect(0, 0, cw, ch);

  // Calcul cover-fit
  const imgRatio = img.width / img.height;
  const canvasRatio = cw / ch;
  let drawW, drawH, drawX, drawY;

  if (window.innerWidth > 768) {
    // Desktop : cover-fit (remplit le canvas, rogne le débordement)
    if (canvasRatio > imgRatio) {
      drawW = cw;
      drawH = cw / imgRatio;
    } else {
      drawH = ch;
      drawW = ch * imgRatio;
    }
    drawX = (cw - drawW) / 2;
    drawY = (ch - drawH) / 2;
  } else {
    // Mobile : contain-fit zoomé (centré, légèrement agrandi)
    const zoom = 1.2;
    if (canvasRatio > imgRatio) {
      drawH = ch * zoom;
      drawW = drawH * imgRatio;
    } else {
      drawW = cw * zoom;
      drawH = drawW / imgRatio;
    }
    drawX = (cw - drawW) / 2;
    drawY = (ch - drawH) / 2;
  }

  ctx.drawImage(img, drawX, drawY, drawW, drawH);
}
```

### Handler de redimensionnement canvas

```javascript
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  if (currentFrame >= 0) drawFrame(currentFrame);
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();
```

---

## 7. Cartes d'Annotation

Cards qui apparaissent par-dessus l'animation scroll à des points de progression spécifiques.
Le scroll se fige brièvement à chaque carte, créant un rythme staccato de "révélation".

### Structure

```html
<div class="annotation-card" data-show="0.15" data-hide="0.35">
  <div class="card-number">01</div>
  <div class="card-body">
    <h3 class="card-title"><!-- Titre --></h3>
    <p class="card-desc"><!-- Description --></p>
    <div class="card-stat">
      <span class="card-stat-number"><!-- ex: 99.9% --></span>
      <span class="card-stat-label"><!-- ex: Précision --></span>
    </div>
  </div>
</div>
```

Placer ces éléments dans `.scroll-sticky`. Utiliser `data-show` et `data-hide` pour contrôler
quand chaque carte apparaît en fonction de la progression scroll (0.0–1.0).

### Style

```css
.annotation-card {
  position: absolute;
  bottom: 8vh;
  left: 5vw;
  max-width: 360px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 28px;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.4s ease, transform 0.4s ease;
  pointer-events: none;
  z-index: 10;
}
.annotation-card.visible {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}
.card-number {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  color: var(--accent);
  margin-bottom: 8px;
}
.card-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.2rem;
  margin-bottom: 8px;
}
.card-desc {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 16px;
}
.card-stat-number {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--accent);
}
.card-stat-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
  display: block;
}
```

### Style mobile compact

```css
@media (max-width: 768px) {
  .annotation-card {
    bottom: 1.5vh;
    left: 2vw;
    right: 2vw;
    max-width: none;
    padding: 12px 16px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .card-desc, .card-stat { display: none; }
  .card-number { margin-bottom: 0; }
}
```

### JavaScript — Afficher/masquer + snap-stop

```javascript
const SNAP_ZONES = []; // Peuplé depuis les attributs data-show
const HOLD_DURATION = 600; // ms pour figer le scroll à chaque point de snap
let isSnapping = false;

const cards = document.querySelectorAll('.annotation-card');
cards.forEach(card => {
  SNAP_ZONES.push({
    show: parseFloat(card.dataset.show),
    hide: parseFloat(card.dataset.hide),
    snapped: false
  });
});

function updateCards(progress) {
  cards.forEach((card, i) => {
    const zone = SNAP_ZONES[i];
    const visible = progress >= zone.show && progress <= zone.hide;
    card.classList.toggle('visible', visible);

    // Snap-stop : figer le scroll brièvement à l'entrée d'une zone de snap
    if (visible && !zone.snapped && !isSnapping) {
      zone.snapped = true;
      isSnapping = true;
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        document.body.style.overflow = '';
        isSnapping = false;
      }, HOLD_DURATION);
    }
    if (!visible) {
      zone.snapped = false;
    }
  });
}
```

Appeler `updateCards(progress)` depuis le handler scroll aux côtés du dessin de frame.

---

## 8. Section Specs

Quatre chiffres stats qui comptent de 0 à la cible quand on scrolle dans la vue.

### Structure

```html
<section id="specs">
  <div class="specs-grid">
    <div class="spec-item" data-target="99.9" data-suffix="%">
      <span class="spec-number">0</span>
      <span class="spec-label"><!-- Label --></span>
    </div>
    <!-- Répéter pour chaque spec -->
  </div>
</section>
```

### Style

```css
.specs-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 40px;
  max-width: 1000px;
  margin: 0 auto;
  padding: 120px 32px;
  text-align: center;
}
.spec-number {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 3.5rem;
  font-weight: 700;
  display: block;
  transition: text-shadow 0.3s ease;
}
.spec-number.counting {
  text-shadow: 0 0 20px rgba(var(--accent-rgb), 0.5);
}
.spec-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-top: 8px;
  display: block;
}

@media (max-width: 768px) {
  .specs-grid { grid-template-columns: repeat(2, 1fr); gap: 32px; }
  .spec-number { font-size: 2.5rem; }
}
```

### JavaScript — Count-up avec easeOutExpo

```javascript
function easeOutExpo(t) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function countUp(el, target, suffix = '', duration = 2000) {
  const start = performance.now();
  el.classList.add('counting');

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeOutExpo(progress);
    const current = eased * target;

    // Format : les entiers restent entiers, les décimaux gardent une décimale
    el.textContent = (target % 1 === 0 ? Math.floor(current) : current.toFixed(1)) + suffix;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = target + suffix;
      el.classList.remove('counting');
    }
  }
  requestAnimationFrame(update);
}

// Déclencher avec IntersectionObserver
const specObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const items = entry.target.querySelectorAll('.spec-item');
      items.forEach((item, i) => {
        setTimeout(() => {
          const numEl = item.querySelector('.spec-number');
          const target = parseFloat(item.dataset.target);
          const suffix = item.dataset.suffix || '';
          countUp(numEl, target, suffix);
        }, i * 200); // Décalé
      });
      specObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

specObserver.observe(document.getElementById('specs'));
```

---

## 9. Grille Fonctionnalités

Cards glass-morphism dans une grille responsive.

### Structure

```html
<section id="features">
  <h2 class="section-title"><!-- ex: "Fonctionnalités" --></h2>
  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-icon"><!-- Icône ou emoji --></div>
      <h3><!-- Titre fonctionnalité --></h3>
      <p><!-- Description fonctionnalité --></p>
    </div>
    <!-- Répéter -->
  </div>
</section>
```

### Style

```css
.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  max-width: 1100px;
  margin: 0 auto;
  padding: 80px 32px;
}
.feature-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 32px;
  transition: transform 0.3s ease, border-color 0.3s ease;
}
.feature-card:hover {
  transform: translateY(-4px);
  border-color: rgba(var(--accent-rgb), 0.2);
}
.feature-icon {
  font-size: 2rem;
  margin-bottom: 16px;
}

@media (max-width: 768px) {
  .features-grid { grid-template-columns: 1fr; }
}
```

---

## 10. Section CTA

Une section appel à l'action focalisée.

### Structure

```html
<section id="cta">
  <div class="cta-content">
    <h2><!-- Titre CTA --></h2>
    <p><!-- Texte de soutien --></p>
    <a href="#" class="btn-primary btn-large"><!-- Texte bouton CTA --></a>
  </div>
</section>
```

### Style

```css
#cta {
  text-align: center;
  padding: 120px 32px;
  position: relative;
}
.btn-large {
  font-size: 1.1rem;
  padding: 18px 48px;
}
```

Ajouter un orbe derrière le CTA pour l'emphase visuelle.

---

## 11. Témoignages (Optionnel)

Inclure seulement si l'utilisateur a opté pendant l'entretien. Cards en scroll horizontal drag.

### Structure

```html
<section id="testimonials">
  <h2 class="section-title">Ce qu'ils en disent</h2>
  <div class="testimonials-track">
    <div class="testimonial-card">
      <p class="testimonial-text">"<!-- Citation -->"</p>
      <div class="testimonial-author">
        <span class="author-name"><!-- Nom --></span>
        <span class="author-role"><!-- Rôle/Entreprise --></span>
      </div>
    </div>
    <!-- Répéter -->
  </div>
</section>
```

### Style

```css
.testimonials-track {
  display: flex;
  gap: 24px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding: 40px 32px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.testimonials-track::-webkit-scrollbar { display: none; }
.testimonial-card {
  min-width: 350px;
  scroll-snap-align: start;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 32px;
  flex-shrink: 0;
}
```

### JavaScript — Drag-to-scroll

```javascript
const track = document.querySelector('.testimonials-track');
let isDown = false, startX, scrollLeft;

track.addEventListener('mousedown', (e) => {
  isDown = true;
  startX = e.pageX - track.offsetLeft;
  scrollLeft = track.scrollLeft;
});
track.addEventListener('mouseleave', () => isDown = false);
track.addEventListener('mouseup', () => isDown = false);
track.addEventListener('mousemove', (e) => {
  if (!isDown) return;
  e.preventDefault();
  const x = e.pageX - track.offsetLeft;
  track.scrollLeft = scrollLeft - (x - startX);
});
```

---

## 12. Card Scanner (Optionnel)

Inclure seulement si l'utilisateur a opté. Un effet de particules basé sur Three.js qui montre
un objet (carte, appareil, etc.) composé de particules en streaming.

### Dépendances

Inclure Three.js depuis un CDN :
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
```

### Structure

```html
<section id="card-scanner">
  <div class="scanner-content">
    <h2 class="section-title"><!-- Titre --></h2>
    <canvas id="scannerCanvas"></canvas>
  </div>
</section>
```

### Notes d'Implémentation

C'est une section complexe. Le système de particules crée une grille de points qui forment la
forme de l'objet. Les particules arrivent depuis des positions aléatoires et se positionnent à
leurs emplacements cibles quand la section scrolle dans la vue.

Paramètres clés :
- Nombre de particules : 2000–5000
- Taille des particules : 2–4px
- Couleur : couleur accent
- Animation : les particules arrivent depuis des positions aléatoires, se placent en formation grille
- Déclencheur : IntersectionObserver quand la section est 30% visible

Cette section est entièrement optionnelle et ajoute une complexité significative. Ne la construire
que si l'utilisateur la demande spécifiquement.

---

## 13. Footer

Footer simple avec nom de marque et liens optionnels.

### Structure

```html
<footer>
  <div class="footer-inner">
    <div class="footer-brand">
      <!-- Logo + nom de marque -->
    </div>
    <div class="footer-links">
      <a href="#">Confidentialité</a>
      <a href="#">Mentions légales</a>
    </div>
    <p class="footer-copy">&copy; 2026 <!-- Nom de Marque -->. Tous droits réservés.</p>
  </div>
</footer>
```

### Style

```css
footer {
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding: 60px 32px 40px;
  text-align: center;
}
.footer-brand {
  margin-bottom: 24px;
}
.footer-links {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-bottom: 24px;
}
.footer-links a {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.9rem;
}
.footer-copy {
  color: var(--text-secondary);
  font-size: 0.8rem;
}
```

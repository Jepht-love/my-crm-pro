---
name: creation-site-3d
description: >
  Prend un fichier vidéo (ex: animation de déconstruction/assemblage produit) et construit un site
  web performant avec animation pilotée par le scroll. La vidéo avance/recule quand l'utilisateur
  scrolle, créant un effet scroll-stopping captivant. Utilise l'extraction de frames via FFmpeg,
  le rendu canvas, et les techniques modernes d'animation scroll-driven. Inclut : fond étoilé animé,
  cartes d'annotation avec snap-stop au scroll, section specs avec animations count-up, navbar avec
  transformation scroll-to-pill, loader, et responsive mobile complet.
  Se déclenche quand l'utilisateur dit "création site 3D", "site animation scroll", "vidéo au scroll",
  "construire le site scroll-stop", ou fournit un fichier vidéo et demande de le rendre contrôlé au scroll.
  Se déclenche aussi si l'utilisateur mentionne "animation scroll style Apple" ou "vidéo sur scroll".
---

# Création Site 3D — Skill

Tu prends un fichier vidéo et tu construis un site web de qualité production où la lecture vidéo
est contrôlée par la position de scroll — créant un effet dramatique, scroll-stopping, style Apple.

Avant de construire quoi que ce soit, tu DOIS recueillir les informations de l'utilisateur via
un bref entretien. Ne suppose aucun nom de marque, aucune couleur, aucun contenu — tout est
personnalisé par projet.

---

## Étape 0 : L'Entretien (OBLIGATOIRE)

Avant de toucher au code ou d'extraire des frames, pose ces questions. Ne saute pas cette étape
— le but du skill est de construire quelque chose de sur-mesure, pas générique.

### Questions Obligatoires

Pose-les de façon naturelle et conversationnelle — pas comme un interrogatoire numéroté :

1. **Nom de marque** — « Quel est le nom de la marque ou du produit pour ce site ? »
2. **Logo** — « Tu as un fichier logo que je peux utiliser ? (SVG ou PNG de préférence) »
3. **Couleur d'accent** — « Quelle est ta couleur d'accent principale ? (code hex, ou décris-la et je proposerai des options) »
4. **Couleur de fond** — « Quelle couleur de fond tu veux ? (les fonds sombres marchent le mieux pour cet effet) »
5. **Ambiance générale** — « Quelle est l'ambiance visée ? (ex : lancement tech premium, luxe, ludique, minimaliste, bold) »

### Sourcing du Contenu

Demande à l'utilisateur comment il veut fournir le contenu du site :

- **Option A : Basé sur un site existant** — « C'est basé sur un site existant ? Si oui, partage l'URL et j'extrairai le vrai contenu (nom produit, fonctionnalités, specs, textes) pour alimenter le site. »
- **Option B : Coller le contenu** — « Si tu n'as pas de site, tu peux coller le contenu souhaité — descriptions produit, liste de fonctionnalités, specs, témoignages, etc. »

Si l'utilisateur fournit une URL, utiliser `WebFetch` pour récupérer le contenu de la page et
extraire les textes pertinents, détails produit, descriptions de fonctionnalités, chiffres specs,
et tout autre contenu exploitable.

### Sections Optionnelles

Demande si l'utilisateur veut les inclure :

- **Témoignages** — « Tu veux une section témoignages ? Si oui, fournis-les ou je les extrairai du site que tu as partagé. »
- **Confettis** — « Tu veux un effet confettis quelque part ? (ex : au clic sur le bouton CTA, au chargement de la page) »
- **Card Scanner** — « Tu veux une section showcase particules 3D ? (basée sur Three.js — parfait pour mettre en valeur une carte, un appareil ou un objet) »

N'inclure ces sections que si l'utilisateur opte explicitement pour.

---

## Prérequis

- **FFmpeg** doit être installé (`brew install ffmpeg` sinon)
- L'utilisateur fournit un fichier vidéo (MP4, MOV, WebM, etc.)
- La vidéo doit être relativement courte (3-10 secondes idéal)
- **La première frame de la vidéo DOIT être sur fond blanc.** C'est une exigence stricte — le plan d'ouverture doit montrer le produit/objet propre sur blanc. Si la vidéo de l'utilisateur ne commence pas ainsi, le prévenir et demander un ré-export ou une image hero séparée sur fond blanc.

---

## Design System (Construit à partir des Réponses)

Une fois l'entretien terminé, construire le design system à partir des réponses :

- **Polices** : Space Grotesk (titres), Archivo (corps), JetBrains Mono (code/mono)
- **Couleur d'accent** : De la réponse utilisateur (utilisée pour boutons, glows, barres de progression, surlignages)
- **Couleur de fond** : De la réponse utilisateur (utilisée pour body, sections)
- **Couleurs texte** : Dériver du fond — si fond sombre, utiliser blanc primaire + secondaire atténué ; si fond clair, utiliser sombre primaire + secondaire atténué
- **Sélection** : Fond couleur d'accent avec texte contrastant
- **Scrollbar** : Track sombre avec thumb en gradient utilisant la couleur d'accent, glow au hover
- **Cards** : Glass-morphism — bg semi-transparent, bordure subtile, `backdrop-filter: blur(20px)`, `border-radius: 20px`
- **Boutons** : Primaire = fond accent avec texte contrastant + glow accent ; Secondaire = transparent avec bordure blanche/sombre
- **Effets** : Orbes flottants (teintes accent, floutés), grille overlay subtile, fond étoilé animé
- **Nom de marque & logo** : Utilisés dans navbar, footer, loader, et partout où le branding apparaît

---

## Technique : Séquence de Frames + Canvas

L'approche la plus fiable pour la vidéo scroll-driven :

1. **Extraire les frames** de la vidéo avec FFmpeg
2. **Précharger toutes les frames** comme images avec indicateur de chargement
3. **Dessiner les frames sur un canvas** en fonction de la position de scroll
4. La position de scroll correspond à un index de frame — scroller en avant avance la vidéo, scroller en arrière la recule

C'est la même technique qu'Apple utilise pour ses pages produit.

**Pourquoi pas `<video>` avec `currentTime` ?**
Les décodeurs vidéo des navigateurs ne sont pas optimisés pour le seeking à chaque événement scroll.
Canvas + frames pré-extraites est ultra fluide et donne un contrôle frame-perfect.

---

## Le Processus de Construction

### Étape 1 : Analyser la Vidéo

```bash
ffprobe -v quiet -print_format json -show_streams -show_format "{CHEMIN_VIDEO}"
```

Extraire durée, fps, résolution, nombre total de frames. Viser 60-150 frames au total.

### Étape 2 : Extraire les Frames

```bash
mkdir -p "{DOSSIER_SORTIE}/frames"
ffmpeg -i "{CHEMIN_VIDEO}" -vf "fps={FPS_CIBLE},scale=1920:-2" -q:v 2 "{DOSSIER_SORTIE}/frames/frame_%04d.jpg"
```

Utiliser `-q:v 2` pour du JPEG haute qualité. JPEG pas PNG pour des fichiers plus légers.

### Étape 3 : Construire le Site Web

Créer un fichier HTML unique. Le site a ces sections (de haut en bas) :

1. **Fond étoilé** — Canvas fixe derrière tout avec des étoiles animées scintillantes
2. **Loader** — Plein écran avec logo de marque, texte "Chargement", barre de progression couleur accent
3. **Barre de progression scroll** — Fixe en haut, gradient accent, 3px de hauteur
4. **Navbar** — Logo + nom de marque, se transforme de pleine largeur en pill centrée au scroll
5. **Hero** — Titre, sous-titre, boutons CTA, indication de scroll, orbes + grille en arrière-plan
6. **Animation Scroll** — Canvas sticky avec séquence de frames, cartes d'annotation avec snap-stop
7. **Specs** — Quatre chiffres stats avec animation count-up au scroll
8. **Fonctionnalités** — Cards glass-morphism en grille
9. **CTA** — Section appel à l'action
10. **Témoignages** — *(seulement si l'utilisateur a opté)* Cards témoignages en scroll horizontal drag
11. **Card Scanner** — *(seulement si l'utilisateur a opté)* Showcase particules Three.js
12. **Footer** — Nom de marque et liens

Pour les détails complets d'implémentation de chaque section, lire `references/sections-guide.md`.

### Étape 4 : Patterns d'Implémentation Clés

**Rendu canvas avec support Retina :**

```javascript
canvas.width = window.innerWidth * window.devicePixelRatio;
canvas.height = window.innerHeight * window.devicePixelRatio;
canvas.style.width = window.innerWidth + 'px';
canvas.style.height = window.innerHeight + 'px';
```

**Cover-fit (desktop) — contain-fit zoomé (mobile) :**
Sur desktop, utiliser cover-fit pour que la frame remplisse bord-à-bord. Sur mobile, utiliser
une approche contain-fit légèrement zoomée pour que l'objet reste centré et visible.

**Cartes d'annotation avec snap-stop scroll :**
Les cartes d'annotation apparaissent à des points précis de progression scroll (attributs data-show/data-hide).
Le scroll SE FIGE brièvement à chaque position de carte — créant un effet "boom, boom, boom" où
chaque carte apparaît quand on s'arrête. Utilise un snap JS : détecte quand la progression scroll entre
dans une zone de snap, scrolle à la position exacte, verrouille l'overflow du body pendant ~600ms, puis relâche.
Le nombre de cartes d'annotation est flexible — l'adapter au contenu fourni par l'utilisateur.

**Transformation navbar scroll-to-pill :**
La navbar commence en pleine largeur, puis au scroll rétrécit en pill centrée (max-width ~820px)
avec coins arrondis et fond glass-morphism.

**Animation count-up :**
Les chiffres specs s'animent de 0 à la cible avec easing easeOutExpo, décalés de 200ms chacun.
Les chiffres reçoivent un glow pulse couleur accent pendant le comptage. Déclenché par IntersectionObserver.

**Fond étoilé animé :**
Un canvas fixe derrière tout avec ~180 étoiles qui dérivent lentement et scintillent. Chaque étoile
a une vitesse de dérive aléatoire, une vitesse/phase de scintillement, et une opacité. Crée un
fond vivant subtil.

### Étape 5 : Personnaliser le Contenu

Tout le contenu vient de l'entretien (Étape 0). Utiliser le vrai nom de marque, les vrais détails
produit, et les vrais textes — jamais de placeholder "Lorem ipsum". Si le contenu vient d'une URL
de site web, utiliser le texte réel de ce site. Adapter :

- Titre et sous-titre hero
- Labels, descriptions et stats des cartes d'annotation
- Chiffres et labels des specs
- Cards fonctionnalités
- Texte CTA
- Témoignages (si inclus)

### Étape 6 : Servir & Tester

```bash
cd "{DOSSIER_SORTIE}" && python3 -m http.server 8080
```

Ouvrir `http://localhost:8080` et tester. Puis ouvrir l'URL dans le navigateur pour l'utilisateur.

---

## Responsive Mobile

Adaptations mobile clés :

- **Cartes d'annotation** : Design compact une ligne — cacher le paragraphe, les chiffres stats et les labels. Afficher seulement numéro de carte + titre en flex row. Positionner en bas du viewport.
- **Hauteur animation scroll** : Réduire de 350vh (desktop) à 300vh (tablette) à 250vh (mobile)
- **Navbar** : Cacher les liens sur mobile, afficher seulement le logo + forme pill
- **Témoignages** (si inclus) : Touch-scrollable, snap aux bords des cards
- **Cards fonctionnalités** : Stack en colonne unique
- **Specs** : Grille 2x2 sur mobile

---

## Bonnes Pratiques

1. **`requestAnimationFrame` pour le dessin** — Ne jamais dessiner directement dans le handler scroll
2. **`{ passive: true }` sur le listener scroll** — Active les optimisations de scroll
3. **Canvas avec `devicePixelRatio`** — Net sur écrans Retina
4. **Précharger toutes les frames avant d'afficher** — Pas de pop-in pendant le scroll
5. **Déduplication de frames** — N'appeler `drawFrame` que quand l'index de frame change
6. **Pas de `scroll-behavior: smooth`** — Interférerait avec le mapping frame-accurate du scroll
7. **Pas de grosses librairies JS** — Vanilla JS pur sauf Three.js pour le card scanner (si inclus)
8. **Canvas sticky** — `position: sticky` maintient le canvas fixe dans le viewport pendant que le container scroll
9. **Première frame blanche** — La vidéo doit commencer sur un fond blanc propre

---

## Résolution de Problèmes

| Problème | Solution |
| --- | --- |
| Les frames ne chargent pas | Vérifier les chemins de fichiers, s'assurer que le serveur local tourne (impossible de charger depuis `file://`) |
| L'animation est saccadée | Réduire le nombre de frames, s'assurer d'utiliser JPEG pas PNG, vérifier les tailles de fichiers (<100KB chacun) |
| Le canvas est flou | S'assurer que le scaling `devicePixelRatio` est appliqué |
| Le scroll est trop rapide/lent | Ajuster la hauteur de `.scroll-animation` (200vh=rapide, 500vh=lent, 800vh=cinématique) |
| Les cards mobile chevauchent le contenu | Utiliser le design compact une ligne, positionner à `bottom: 1.5vh` |
| Le snap-stop est brusque | Réduire HOLD_DURATION à 400ms ou augmenter SNAP_ZONE |
| Les étoiles sont trop brillantes/ternes | Ajuster l'opacité du canvas étoilé (défaut 0.6) |
| La première frame n'est pas blanche | Demander à l'utilisateur de ré-exporter la vidéo avec une frame d'ouverture blanche |

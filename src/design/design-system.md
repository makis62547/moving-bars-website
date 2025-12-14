# MOVING BARS · DESIGN SYSTEM (IST-STAND)

Dieses Dokument bildet den aktuellen funktionierenden Zustand der Website ab.
Es dient als Referenz für konsistente Weiterentwicklung – ohne bestehende Komponenten zu verändern.

---

## 1. FARBEN

### Primärfarben
- Hintergrund: #000000
- Text: #ffffff
- Akzent: #E07501
- Border: rgba(255, 255, 255, 0.1)

### Zusatzfarben
- Intro Copy: rgba(255,255,255,0.86)

---

## 2. TYPOGRAPHIE (IST)

### Schriftarten
- Headings: Montserrat (200)
- Fließtext: Inter

### Semantische Größen
- H1 → .display-size-h1
- H2/H3 → Montserrat 200

### Visuelle Variante (H2/H3 wie H1)
visual-heading:
  font-size: clamp(2.25rem, 4.4vw, 3.25rem)
  line-height: 1.05
  letter-spacing: 0.01em
  text-transform: uppercase

---

## 3. LAYOUT / CONTAINER

--content-max: 1240px
--content-pad: clamp(10px, 1.8vw, 24px)
--header-h: 72px

### Hero Container
max-width: var(--content-max)
padding-top: 140px
translateY(-18px)
gap: 2.5rem

### Intro Panel Grid
Desktop: 0.62fr | 1px | 0.38fr
Mobile: 1fr

---

## 4. SPACING (IST)

### Hero
USP offset: -32px  
Hero-shell offset: -18px  
Abstand Hero → Intro: 44px  

### Intro Panel
padding-block: clamp(1.25rem, 2.4vw, 2.6rem)
padding-right: clamp(1.5rem, 3.5vw, 2.75rem)
text-gap: 1rem

### Banner
height: clamp(520px, 75vh, 980px)
CSS-Parallax über background-attachment

---

## 5. ICON SYSTEM
Cocktail Icon:
  clamp(140px, 18vw, 230px)
  outline ~2px

---

## 6. PARALLAX SYSTEM
CSS-only: background-attachment fixed (pointer: fine), scroll (pointer: coarse)
keine JS-Abhängigkeiten

---

## 7. PATTERNS (IST)
Hero: full bleed, overlay, USP animation, arrow bounce  
Intro Panel: 3-Spalten Grid, Divider, Icon rechts  
Banner: Parallax, 75vh Höhe  

---

## 8. MAPPING (noch nicht aktiv)
H1 → var(--h1-size) (pending)  
H2 → var(--h2-size) (pending)  
H3 → var(--h3-size) (pending)  
Intro-H1 → var(--visual-heading-size)  
USP-Font → var(--usp-font-size)

# Moving Bars Website

Dieses Projekt baut die Seite https://www.moving-bars.de/ in Astro nach und bringt ein robustes Visual-Regression-Setup mit.

## 🚀 Projektstruktur

```text
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
├── scripts/
│   └── vr.mjs
├── vr/
└── package.json
```

## 🧪 Visuelle Regression

Dev-Dependencies: `playwright`, `pixelmatch`, `pngjs` (siehe `package.json`). Playwright benötigt lokal einen Chromium-Download (`npx playwright install chromium`).

Kommandos (immer im Repo-Root ausführen):

| Command | Aktion |
| :-- | :-- |
| `npm run vr:baseline` | Zieht Referenz-Screenshots von https://www.moving-bars.de/ und legt sie in `vr/baseline/<viewport>/<page>.png` ab. |
| `npm run vr` | Fotografiert die lokale Seite (`http://localhost:4321/` muss laufen) und vergleicht gegen die Baseline. Diffs landen in `vr/diff/...`; Exit-Code 1 bei Abweichungen >0,5 %. |
| `npm run vr:update` | Überschreibt die Baseline bewusst mit den aktuellen lokalen Screenshots. |

Workflow-Empfehlung:

1. `npm install` (falls noch nicht geschehen) und `npx playwright install chromium` zum Laden des Browsers.
2. Referenz ziehen: `npm run vr:baseline` (nach Änderungen an den Screenshot-Einstellungen unbedingt erneuern).
3. Dev-Server starten: `npm run dev`.
4. Vergleich fahren: `npm run vr` (CI-geeignet, bricht bei nennenswerten Diffs ab).
5. Bei gewollten Änderungen Baseline bewusst erneuern: `npm run vr:update`.

Stabilitäts-Features des Skripts:

- Warten auf `networkidle` und geladene Webfonts (`document.fonts.ready`).
- CSS-Injektion deaktiviert Animationen/Transitions, vermeidet Soft-UI/Blur-Effekte.
- Cookie-Banner wird robust über Button-Texte (Deutsch/Englisch) weggeclickt, keine fragilen Selektoren.
- Screenshots werden viewport-basiert (kein `fullPage`) mit `scale: "css"` erstellt; optionale Vollseiten-Shots landen separat unter `vr/*-fullpage/...`.

Troubleshooting:

- **Fehlende Baseline:** `npm run vr:baseline` ausführen.
- **Playwright fehlt:** `npx playwright install chromium` (bzw. `--with-deps` in CI-Containern).
- **Registry/Proxy blockiert Downloads:** ggf. Proxy-Variablen anpassen oder alternative Registry nutzen; danach erneut `npm install` ausführen.

## Parallax nutzen

- Nutze die feste Struktur:
  ```html
  <section class="parallax-section" data-parallax data-speed="0.3">
    <div class="parallax-bg" data-parallax-bg></div>
    <div class="parallax-fg"><!-- Inhalt --></div>
  </section>
  ```
- `data-speed` (Default: `0.3`), `data-start` und `data-end` steuern die ScrollTrigger-Konfiguration je Section.
- Nur die Ebene mit `data-parallax-bg` wird bewegt (`yPercent`); Vordergrund bleibt unverändert.
- `src/scripts/parallax.ts` lädt GSAP + ScrollTrigger erst im Client, initialisiert nach Page Load und räumt bei Astro Page Transitions sauber auf.

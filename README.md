# Kiroshiatsu — Massagepraxis Victor A. Koldobsky

Landing page premium · Wellness Minimal · Bielefeld.

## Struktur

```
kiroshiatsu/
├── index.html      # Markup mit allen Sektionen
├── style.css       # Design-System · Wellness Minimal
├── script.js       # Interaktionen · Animationen
├── assets/         # (Bilder, Fonts, Icons — leer)
└── README.md
```

## Lokal testen

Einfach `index.html` im Browser öffnen, oder einen kleinen Static-Server starten:

```bash
# Python
python -m http.server 8000

# Node
npx serve .
```

## Deployment · GitHub Pages

1. Neues Repository erstellen auf GitHub (z. B. `kiroshiatsu`).
2. Dateien committen und pushen:

```bash
cd kiroshiatsu
git init
git add .
git commit -m "feat: initial landing"
git branch -M main
git remote add origin https://github.com/<BENUTZER>/kiroshiatsu.git
git push -u origin main
```

3. Im Repo öffnen: **Settings → Pages**
4. Unter **Source**: `Deploy from a branch` · Branch: `main` · Folder: `/ (root)` · **Save**
5. Nach ~1 Minute ist die Seite unter
   `https://<BENUTZER>.github.io/kiroshiatsu/` erreichbar.

## Anpassungen

- **Farben & Typografie**: Design-Tokens oben in `style.css` (`:root`).
- **Inhalte**: direkt in `index.html`.
- **Formular**: Frontend-Validierung in `script.js` — Backend-Anbindung
  (z. B. Formspree, EmailJS, eigener Endpoint) nachträglich ergänzbar.
- **WhatsApp-Button**: Nummer in `index.html` (`wa.me/4952197174457`).

## Technik

- Semantisches HTML5, BEM-ähnliche Klassen.
- Vanilla CSS mit Custom Properties — keine Dependencies.
- Vanilla JS — IntersectionObserver, Cursor-Follow, Magnetic Buttons,
  3D-Tilt, Count-Up, Parallax, Form-Validation.
- Responsive Mobile-First, `prefers-reduced-motion` respektiert.

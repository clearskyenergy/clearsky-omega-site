# ClearSky OMEGA — multi-page marketing site

Static site (no build step). Deploys straight to Vercel via GitHub, same as your other repos.
Every page shares one header (logo-only), one footer, and one full-screen video modal —
identical across pages because they all link the same `omega.css` / `omega.js`.

## Mirrors the SAP hero
- **Header:** logo only (the ClearSky cloud + wordmark PNG). No separate text next to it.
- **Home hero:** minimal — eyebrow, one headline, one short line, two buttons. That's it.
- **The neon ring is the video button.** Clicking the neon frame (or "See OMEGA in action")
  opens a **full-screen white modal** that fades in — title top-left, share/email/close
  icons top-right, and the film playing large on a black stage. Exactly like SAP's
  "See Joule in action" -> modal flow.

## Pages
- `index.html` — home (SAP-style hero, neon video trigger, ecosystem pillars, links out)
- `platform.html` / `data.html` / `marketplace.html` / `energy.html` / `enterprise.html`
  / `ahj.html` / `partners.html` — interior pages (split hero: copy left, neon video right)
- `contact.html` — request a demo (mailto form)
- `login.html` — OMEGA gateway -> portal (`?go=1` auto-forwards; logic preserved)

## Shared files
- `omega.css` — all styles (header, hero, cards, bands, footer, full-screen video modal, responsive)
- `omega.js` — mobile nav + video modal open/close with fade (ES5, no build)

## The neon hero image
`neon-hero.jpg` is a high-resolution 2400x1000 recreation of the neon circular frame you
uploaded — clean teal->cyan->blue ring, glow, smoke, and a rippled water reflection. It's the
hero centerpiece on every page and the backdrop of the video modal.

## Dropping in the showcase film (when we make it)
Open any page and find the block id="videoStage" inside the modal. Replace the placeholder
<img> + .video-placeholder with:

    <video controls autoplay playsinline>
      <source src="/omega-showcase.mp4" type="video/mp4">
    </video>

(Or paste a YouTube/Vimeo <iframe> in the same spot.) The stage is already 16:9-friendly and
fills the modal. Since the modal markup is identical on every page, a find-and-replace across
the .html files updates them all at once.

## Header login
Top-right of the dark utility bar: "Log in to OMEGA" -> /login.html -> portal.
Main-nav right side: "Request a demo" -> /contact.html.

## Note on local preview
Pages use absolute paths (/omega.css, /neon-hero.jpg). These resolve correctly when served
from a web root (Vercel, or `python3 -m http.server`). Opening the .html files directly with
file:// will not load the CSS/JS/images — always preview through a server or after deploy.

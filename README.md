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
- `login.html` — the OMEGA gateway: every tenant signs in here, and the page routes
  them to their own workspace. See "Tenant sign-in" below.

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
Top-right of the dark utility bar: "Log in to OMEGA" -> /login.html.
Main-nav right side: "Request a demo" -> /contact.html.

## Tenant sign-in (`login.html`)
It used to be a link to the admin console, which meant anyone who wasn't ClearSky
staff hit "admin access only". Now every tenant signs in on this page:

1. Email + password, or Google.
2. The OMEGA loading screen covers the lookup.
3. The page reads the account's own role docs (`omega_staff`, `org_members`,
   `fin_profiles`, `mkt_profiles`, `vdc_profiles`) plus its email domain, folds
   domain aliases exactly the way `orgAlias()` in firestore.rules does, and works
   out which workspace it reaches.
4. One workspace -> straight in. More than one -> a short chooser, remembered
   for next time. None -> plain copy explaining what's still pending.

**Before it works you must paste the Firebase web config** into the block at the
top of the page's module script. Until then the page falls back to the old
"Continue to OMEGA" button, so nothing is broken in the meantime.

Handoff to the portal is one switch (`HANDOFF`) near the same block; it ships on
`'prefill'`. `SSO-HANDOFF.md` explains the options and has the two small files
that make the second login disappear entirely.

## The flag
`us-flag.svg` — official 1:1.9 proportions, real 50-star union, EO 10834 colours
(#B31942 / #0A3161). Drawn once by `.util-flag` in `omega.css`, so every page
picks it up. It replaced a three-band CSS gradient that was not the US flag.

## Note on local preview
Pages use absolute paths (/omega.css, /neon-hero.jpg). These resolve correctly when served
from a web root (Vercel, or `python3 -m http.server`). Opening the .html files directly with
file:// will not load the CSS/JS/images — always preview through a server or after deploy.

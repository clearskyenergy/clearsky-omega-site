# Seamless handoff: gateway → portal

`login.html` signs a person in, works out which workspace they belong to, and
sends them to it. This file covers the last hop.

## The thing that bites everyone

A Firebase session belongs to **the origin that created it**. A sign-in on
`clearskyomega.com` is not a session on `clearsky-portal-h7d9.vercel.app` — the
credentials live in that origin's IndexedDB and no amount of client code shares
them across domains. So the gateway has to hand the session over deliberately.

`login.html` has one switch near the top for how:

| `HANDOFF` | What happens | Needs |
|---|---|---|
| `'prefill'` | Portal's own login opens with the email filled in | nothing — **shipped as the default** |
| `'token'` | Portal signs them in silently. No second login. | the two files below |
| `'same'` | Nothing to pass — this page is served from the portal's own origin | nothing |

`'prefill'` is the default so the page works the moment you paste in the
Firebase config. Move to `'token'` once the two files below are live.

---

## Option A — skip all of this

Deploy `login.html` **inside the portal repo too**, at
`clearsky-portal-h7d9.vercel.app/login.html`, and point the marketing site's
"Log in to OMEGA" at that URL instead of `/login.html`. Same origin, so the
session is already real. Set `HANDOFF = 'same'`.

You'd want to inline the small amount of `omega.css` the header uses, or drop
the site header from that copy. Zero backend, nothing to keep in sync but the
tenant list.

---

## Option B — the token exchange

Two files in the **portal** repo. The gateway sends an ID token in the URL
fragment; this trades it for a custom token, which does create a session on the
portal's origin.

### 1. `api/omega-sso.js`

```js
// Vercel serverless function. Verifies an ID token minted by the gateway and
// returns a custom token for THIS origin. The ID token proves who they are;
// the custom token is what signInWithCustomToken() will accept.
import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    )
  });
}

// Only origins you actually run. An open list here would let any site mint
// sessions for your users.
const ALLOWED = [
  'https://clearskyomega.com',
  'https://www.clearskyomega.com',
  'https://clearsky-portal-h7d9.vercel.app'
];

export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  if (ALLOWED.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  }
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  try {
    const { idToken } = req.body || {};
    if (!idToken) return res.status(400).json({ error: 'idToken required' });

    // checkRevoked: a disabled or signed-out account can't ride an old token in.
    const decoded = await admin.auth().verifyIdToken(idToken, true);

    // Issued in the last 5 minutes. A token copied out of a URL and used an
    // hour later is not a live handoff.
    if (Date.now() / 1000 - decoded.auth_time > 300) {
      return res.status(401).json({ error: 'stale' });
    }

    const customToken = await admin.auth().createCustomToken(decoded.uid, {
      via: 'omega-gateway'
    });
    return res.status(200).json({ customToken });
  } catch (err) {
    console.error('[omega-sso]', err);
    return res.status(401).json({ error: 'invalid' });
  }
}
```

Set `FIREBASE_SERVICE_ACCOUNT` in Vercel to the whole service-account JSON, on
one line. Project settings → Service accounts → Generate new private key.
It is a secret: never put it in the repo, never expose it to the browser.

### 2. Consume it, before the portal draws its login

Run this **before** anything that decides whether to show a login screen —
first thing in the portal's auth bootstrap.

```js
// Trade ?#omega_sso=... for a real session on this origin.
export async function acceptOmegaHandoff(auth) {
  const params = new URLSearchParams(location.hash.slice(1));
  const idToken = params.get('omega_sso');
  if (!idToken) return false;

  // Strip it from the URL immediately — no token in history, no token in a
  // screenshot, no token in the next page's Referer.
  history.replaceState(null, '', location.pathname + location.search);

  try {
    const r = await fetch('/api/omega-sso', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken })
    });
    if (!r.ok) return false;
    const { customToken } = await r.json();
    await signInWithCustomToken(auth, customToken);
    return true;
  } catch (_) {
    return false;   // fall through to the normal login form
  }
}
```

Then flip `HANDOFF` to `'token'` in `login.html`.

Every failure path here falls through to the portal's own login form, so a bad
deploy of this costs a second sign-in — not a lockout.

---

## What the portal receives either way

- `?tenant=` — the resolved org, already alias-folded (`fenecon.de` →
  `fenecon.com`), so the portal can open the right workspace without
  re-deriving it.
- `?via=omega-gateway` — useful for telling gateway traffic apart in logs.
- `?email=` — on `prefill` only.
- `#omega_sso=` — on `token` only.

## Keeping the two in step

`login.html` mirrors `firestore.rules` on purpose, so nothing is promised that
the database will refuse. Three places drift if you only change one side:

- `ORG_ALIAS` in `login.html` ↔ `orgAlias()` in the rules.
- `ADMIN_DOMAINS` ↔ `isAdmin()`.
- The role reads (`omega_staff`, `org_members`, `fin_profiles`,
  `mkt_profiles`, `vdc_profiles`) ↔ the collections those rules gate.

Drift here is not a security hole — the rules are still the thing that
enforces — but it does route someone to a workspace that then looks empty.

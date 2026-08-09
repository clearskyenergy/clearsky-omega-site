/* ============================================================================
   OMEGA SSO — token exchange
   POST /api/omega-sso   { idToken }  →  { customToken }

   Why this exists: a Firebase session belongs to the ORIGIN that created it.
   Signing in at clearskyomega.com is not a session at ogisolar.com, even
   though both are the same Firebase project. The browser cannot bridge that
   on its own, and passing the password through would put a credential in the
   URL bar, browser history and the next page's Referer header.

   So the gateway hands over a short-lived ID TOKEN instead. This endpoint
   verifies it with the Admin SDK — which is the only thing that can prove a
   token is genuine — and returns a CUSTOM TOKEN, which is the only thing
   signInWithCustomToken() will accept. Nothing secret ever rides in the URL,
   and the token is useless more than five minutes after the sign-in.

   SETUP (once):
     1. Firebase Console → Project settings → Service accounts →
        Generate new private key. You get a JSON file.
     2. Vercel → this project → Settings → Environment Variables →
        add FIREBASE_SERVICE_ACCOUNT, value = that entire JSON on one line.
        It is a SECRET: never commit it, never expose it to the browser.
     3. Add every origin that may hand off, below, in ALLOWED.
     4. Redeploy.

   The service account can act as any user in the project. Treat it like a
   root password: environment variable only.
   ========================================================================= */

import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    )
  });
}

/* Only origins you actually run. An open list here would let any website on
   the internet mint sessions for your users, which is the whole ballgame. */
const ALLOWED = [
  'https://clearskyomega.com',
  'https://www.clearskyomega.com',
  'https://clearsky-portal-h7d9.vercel.app',
  'https://ogisolar.com',
  'https://www.ogisolar.com',
  'https://alpha.clearskyomega.com',
  'https://tools.csebuilders.com',
  'https://financing.csebuilders.com',
  'https://nextnrg.csebuilders.com',
  'https://sunesol.clearskyomega.com',
  'https://fenecon.clearskyomega.com'
];

export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  if (ALLOWED.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  }
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  /* A request from an origin we don't run is refused outright — not merely
     left without CORS headers, which a non-browser client would ignore. */
  if (origin && !ALLOWED.includes(origin)) {
    return res.status(403).json({ error: 'origin_not_allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const idToken = body.idToken;
    if (!idToken) return res.status(400).json({ error: 'idToken_required' });

    /* checkRevoked: an account disabled or signed out since the token was
       issued cannot ride an old one through. */
    const decoded = await admin.auth().verifyIdToken(idToken, true);

    /* The sign-in itself must be recent. A token copied out of a URL and
       replayed an hour later is not a live handoff. auth_time is when the
       user actually authenticated, not when the token was minted. */
    if (Math.floor(Date.now() / 1000) - decoded.auth_time > 300) {
      return res.status(401).json({ error: 'stale_signin' });
    }

    /* Belt and braces: the account must still exist and still be enabled. */
    const user = await admin.auth().getUser(decoded.uid);
    if (user.disabled) return res.status(403).json({ error: 'user_disabled' });

    const customToken = await admin.auth().createCustomToken(decoded.uid, {
      via: 'omega-gateway'
    });
    return res.status(200).json({ customToken });
  } catch (err) {
    console.error('[omega-sso]', err && err.code, err && err.message);
    return res.status(401).json({ error: 'invalid_token' });
  }
}

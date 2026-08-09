/* ============================================================================
   OMEGA SSO — token exchange, as a Firebase Cloud Function
   POST  https://us-central1-clearsky-portal.cloudfunctions.net/omegaSso
   Body: { idToken }  →  { customToken }

   WHY THIS RUNS HERE AND NOT ON VERCEL

   Your Google Cloud organisation has iam.disableServiceAccountKeyCreation
   switched on, so no downloadable service-account key can be created. That
   policy exists for a good reason: a JSON key that can act as any user in
   the project is the single most common way cloud credentials leak.

   Code running inside the project doesn't need one. initializeApp() with no
   arguments picks up the runtime's own identity (Application Default
   Credentials), which grants exactly the same Admin SDK powers with nothing
   to download, nothing to paste into a dashboard, and nothing to rotate.
   The org policy stays on.

   WHAT IT DOES

   A Firebase session belongs to the ORIGIN that created it, so signing in at
   clearskyomega.com is not a session at ogi.clearskyomega.com even though
   both are this same project. The gateway therefore hands over a short-lived
   ID TOKEN in the URL fragment; this verifies it — only the Admin SDK can
   prove a token is genuine — and returns a CUSTOM TOKEN, which is the only
   thing signInWithCustomToken() accepts. No password ever travels in a URL.

   DEPLOY
     npm install -g firebase-tools     (once)
     firebase login                    (once)
     firebase deploy --only functions:omegaSso

   v1 is used deliberately: its URL is deterministic
   (https://<region>-<project>.cloudfunctions.net/<name>), so the tenant
   script can hardcode it. v2 URLs include a generated hash that changes
   between projects and would have to be copied out of the deploy output.
   ========================================================================= */

const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');

/* No credential argument. The runtime supplies the project's own identity. */
admin.initializeApp();

/* Origins on other domains, listed explicitly. */
const ALLOWED = [
  'https://clearskyomega.com',
  'https://www.clearskyomega.com',
  'https://clearsky-portal-h7d9.vercel.app',
  'https://tools.csebuilders.com',
  'https://financing.csebuilders.com',
  'https://nextnrg.csebuilders.com'
];

/* Every tenant lives at <slug>.clearskyomega.com, so they are matched by
   shape rather than listed. Otherwise onboarding a tenant would mean editing
   and redeploying this file, and the first time somebody forgot, sign-in
   would break for that tenant alone.

   Anchored and single-label on purpose: it matches ogi.clearskyomega.com and
   does NOT match clearskyomega.com.attacker.example or
   evil.ogi.clearskyomega.com. */
const ALLOWED_PATTERN = /^https:\/\/[a-z0-9-]+\.clearskyomega\.com$/;

function originAllowed(origin) {
  return ALLOWED.includes(origin) || ALLOWED_PATTERN.test(origin);
}

exports.omegaSso = functions.https.onRequest(async (req, res) => {
  const origin = req.get('origin') || '';

  if (originAllowed(origin)) {
    res.set('Access-Control-Allow-Origin', origin);
    res.set('Vary', 'Origin');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  }
  if (req.method === 'OPTIONS') return res.status(204).send('');
  if (req.method !== 'POST') return res.status(405).json({ error: 'post_only' });

  /* Refused outright, not merely left without CORS headers — a non-browser
     client would ignore missing headers entirely. */
  if (origin && !originAllowed(origin)) {
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
       replayed later is not a live handoff. auth_time is when the person
       actually authenticated, not when the token was minted. */
    if (Math.floor(Date.now() / 1000) - decoded.auth_time > 300) {
      return res.status(401).json({ error: 'stale_signin' });
    }

    const user = await admin.auth().getUser(decoded.uid);
    if (user.disabled) return res.status(403).json({ error: 'user_disabled' });

    const customToken = await admin.auth().createCustomToken(decoded.uid, {
      via: 'omega-gateway'
    });
    return res.status(200).json({ customToken });
  } catch (err) {
    console.error('[omegaSso]', err && err.code, err && err.message);
    return res.status(401).json({ error: 'invalid_token' });
  }
});

# One sign-in, every tenant

Sign in once at `clearskyomega.com/login.html`, land inside your tenant
already signed in. No second password prompt.

Everything runs on one Firebase project, `clearsky-portal`, which is what
makes this possible at all.

## Why a token, and why no key

A Firebase session belongs to the **origin that created it**. Signing in at
`clearskyomega.com` is not a session at `ogi.clearskyomega.com`, same project
or not — the credentials live in that origin's IndexedDB and no client-side
code shares them across domains.

Passing the password through would work and would be a real credential leak:
URLs land in browser history, server access logs, and the `Referer` header of
the next request. So the gateway hands over a short-lived **ID token** in the
URL *fragment* (never sent to a server), the tenant trades it for a **custom
token**, and that creates the session.

The exchange runs as a **Cloud Function inside the Firebase project**, not on
Vercel, because your Google Cloud organisation blocks service-account key
creation (`iam.disableServiceAccountKeyCreation`). Code running in the project
authenticates as the project — `initializeApp()` with no arguments — so there
is no key to download, paste, leak or rotate. The policy stays on. This is the
better arrangement regardless of the policy.

## Deploy the function

From the repo root, once:

```bash
npm install -g firebase-tools
firebase login
```

Then, any time the function changes:

```bash
firebase deploy --only functions:omegaSso
```

`firebase.json` and `.firebaserc` are already here and point at
`clearsky-portal`, so there is nothing to configure. First deploy takes a
couple of minutes and may ask to enable the Cloud Functions and Cloud Build
APIs — say yes.

Deploy prints the URL. It should be:

```
https://us-central1-clearsky-portal.cloudfunctions.net/omegaSso
```

If it prints something different, put that URL in `EXCHANGE` at the top of
`omega-sso.js`.

Check it answers:

```js
fetch('https://us-central1-clearsky-portal.cloudfunctions.net/omegaSso', {method:'POST'})
  .then(r => r.json()).then(console.log)
// expect: { error: "idToken_required" }  ← alive
```

## One script tag per tenant

In the `<head>` of every app the gateway sends people to — the tenants, the
ops console, the portal — add this as the **first** script:

```html
<script type="module" src="https://clearskyomega.com/omega-sso.js"></script>
```

That is the entire integration. It ignores normal visits and only acts when it
sees `#omega_sso=` in the URL: it takes the token out of the address bar,
exchanges it, signs in, and reloads clean so the app boots with a live user.

It does **not** need to know how the app is built. Firebase stores the session
under a key derived from the API key and app name, so the app's own
`getAuth()` picks it up on the next load — even if it bundles a different copy
of the SDK.

## Failure behaviour

Every failure path falls through to the app's normal login screen. A bad
deploy, an expired token, a blocked network — the cost is the sign-in the user
would have had anyway. Nobody is locked out. A one-shot `sessionStorage` guard
prevents a reload loop.

## Where each tenant lands

Resolved in this order, first match wins:

1. `omega_orgs/{orgId}` in Firestore — `portalUrl`, `url`, `appUrl` or `site`
2. A named exception in `TENANT_PORTALS` in `login.html`
3. The pattern `https://{slug}.clearskyomega.com`, slug = first label of the
   email domain
4. The shared portal

Named exceptions today: `ogisolar.com` → `ogi.clearskyomega.com` (the slug
would have been "ogisolar", which is wrong — this is why the list still
exists), `nextnrg.com` → `nextnrg.csebuilders.com`, and ClearSky staff →
`alpha.clearskyomega.com`.

Adding a tenant is best done in Firestore: document ID = the email domain,
field `portalUrl` = the URL. No redeploy, and it beats both the list and the
pattern. Hosts under `clearskyomega.com` are already allowed by the function's
origin pattern; a host on any other domain must be added to `ALLOWED` in
`functions/index.js`.

## Worth settling

`isConsoleViewer()` in the Firestore rules grants `ogisolar.com` and
`sunesol.com` a **cross-org read of every tenant's `/projects`** — FENECON's,
Concord's and iQGen's included. Your own rules file flags this above the
function. Seamless sign-in makes it easier to reach, not more contained, so it
deserves a decision before OGI Solar's trial opens.

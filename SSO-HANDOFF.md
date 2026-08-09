# One sign-in, every tenant

Sign in once at `clearskyomega.com/login.html`, land inside your tenant's app
already signed in. No second password prompt.

Everything runs on the one Firebase project, `clearsky-portal`, which is what
makes this possible at all.

## Why a token and not the password

A Firebase session belongs to the **origin that created it**. A sign-in at
`clearskyomega.com` is not a session at `ogisolar.com`, same project or not —
the credentials live in that origin's IndexedDB and no client-side code shares
them across domains.

Passing the password through would work and would be a real credential leak:
URLs land in browser history, server access logs, and the `Referer` header of
the next request. So the gateway hands over a short-lived **ID token** in the
URL *fragment* (never sent to a server), the tenant app trades it for a
**custom token**, and that creates the session. Nothing secret is exposed, and
the token is refused more than five minutes after sign-in.

## Three steps

### 1. Service account key

Firebase Console → Project settings → Service accounts → **Generate new
private key**. You get a JSON file.

In Vercel, on the **clearsky-omega-site** project → Settings → Environment
Variables, add:

| Name | Value |
|---|---|
| `FIREBASE_SERVICE_ACCOUNT` | the entire JSON, on one line |

This key can act as any user in the project. Environment variable only —
never in the repo, never in the browser.

### 2. Deploy the site

`api/omega-sso.js` and `package.json` are already in the repo. Vercel sees the
`api` folder and runs it as a serverless function; `package.json` tells it to
install `firebase-admin`. Push and it builds.

Check it answers:

```js
fetch('https://clearskyomega.com/api/omega-sso', {method:'POST'})
  .then(r => r.json()).then(console.log)
// expect: { error: "idToken_required" }  ← the function is alive
```

A 404 means the function didn't deploy. A 500 means the service account
variable is missing or malformed.

### 3. One script tag per tenant app

In the `<head>` of each app the gateway sends people to — the ClearSky portal,
OGI Solar, the ops console, financing — add this as the **first** script:

```html
<script type="module" src="https://clearskyomega.com/omega-sso.js"></script>
```

That's the whole integration. It ignores normal visits entirely and only acts
when it sees `#omega_sso=` in the URL: it pulls the token out of the address
bar, exchanges it, signs in, and reloads clean so your app boots with a live
user.

It does **not** need to know how your app is built. Firebase stores the session
under a key derived from the API key and app name, so your app's own
`getAuth()` picks it up on that next load — even if it bundles a different copy
of the SDK.

**Add each app's origin to `ALLOWED` in `api/omega-sso.js`.** A request from an
origin that isn't listed is refused. The current list covers clearskyomega.com,
the portal, ogisolar.com, alpha, tools and financing — add the rest.

## Failure behaviour

Every failure path falls through to the app's normal login screen. A bad
deploy, an expired token, a blocked network — the cost is the sign-in the user
would have had anyway. Nobody gets locked out.

There is also a one-shot guard in `sessionStorage` so a token that exchanges
but somehow doesn't satisfy the app can't cause a reload loop.

## Where each tenant lands

The destination comes from Firestore, not from code. After sign-in the gateway
reads `omega_orgs/{orgId}` and uses the first of `portalUrl`, `url`, `appUrl`,
`site` that it finds:

```
omega_orgs/ogisolar.com  →  { portalUrl: "https://ogisolar.com", name: "OGI Solar" }
```

`name` is what the loading screen says. Adding a tenant is a Firestore edit —
no redeploy. `TENANT_PORTALS` in `login.html` is only a fallback for orgs with
no document yet.

## Worth settling while you're in here

`isConsoleViewer()` in the rules grants `ogisolar.com` and `sunesol.com` a
**cross-org read of every tenant's `/projects`** — FENECON's, Concord's and
iQGen's included. Your own rules file flags this above the function. Seamless
sign-in makes that easier to reach, not more contained, so it is worth a
decision before OGI Solar's trial opens.

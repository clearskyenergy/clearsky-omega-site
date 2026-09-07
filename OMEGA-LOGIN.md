# Where "Log in to OMEGA" goes, and why it is not this repo

Every **Log in to OMEGA** link on this site points at

    https://silmarillion.clearskyomega.com/login.html

not at the `login.html` sitting next to this file.

## Why not the local one

A Firebase session belongs to **the origin that created it**. A sign-in on
`clearskyomega.com` is not a session on the platform — the credentials live in
that origin's IndexedDB and no client code shares them across domains. The copy
in this repo shipped with `HANDOFF = "prefill"`, which means: sign in here, then
sign in *again* on arrival, with the email box helpfully filled.

`SSO-HANDOFF.md` in this repo calls the fix **Option A**, and that is what was
done. The same page is now served from the platform's own origin, out of the
`omega-core` repo, so the session it creates is the session the workspace
reads. One login.

## The copy in this repo

`login.html` here is now unreachable from the navigation and is kept only as a
design reference. It cannot sign anyone in — its Firebase config is still
`PASTE_API_KEY`.

**If the login design changes, change it in `omega-core/login.html`.** That is
the one that works. This one will drift, and it does not matter that it does.

## If the platform host is renamed

One string, in every `.html` here:

    href="https://silmarillion.clearskyomega.com/login.html"

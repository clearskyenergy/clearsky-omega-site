/* ============================================================
   ClearSky OMEGA — showcase reel
   © 2025–2026 ClearSky Energy Solutions LLC.

   A silent, looping, sixty-second film built from markup rather
   than footage. It plays in the video modal on the home page.

   WHY THIS AND NOT AN MP4. The tease has to change every time the
   product does, and a cut film goes stale the week after it is
   delivered. This is the same type, the same palette and the same
   drawing vocabulary the platform itself uses, so it stays true by
   construction and costs a text edit to revise.

   ONE THROUGH-LINE: the same project, handed to four different
   businesses. That is the actual claim — one codebase, one project
   record, four verticals reading it for four different reasons —
   and it is the only thing here a competitor cannot restage.

   EVERY NUMBER IS ILLUSTRATIVE. This is a public page. It carries
   no customer's real coordinates, capacity or cost.

   Drop-in replacement: if a produced film ever lands, put it at
   /omega-showcase.mp4 and set REEL_VIDEO below. The reel steps
   aside and the transport hands over to the <video>.
   ============================================================ */
(function () {
  'use strict';

  var REEL_VIDEO = null;   /* e.g. '/omega-showcase.mp4' */

  var ACTS = [
    {
      k: '#00AEEF', chapter: 'The site', eyebrow: 'One project record',
      dur: 12000,
      title: 'Raw land is a question.',
      sub: 'Trace a boundary and OMEGA answers it — what fits, what the grid will carry, what it costs, and what it is worth. Before anyone options the dirt.',
      note: 'Boundary to buildable in a single afternoon.',
      plot: true,
      panel: {
        head: ['Site model', 'Live'],
        rows: [
          ['Buildable area',        '412 ac',      0],
          ['Compute load',          '180 MW',      0],
          ['On-site generation',    '196 MW',      0],
          ['Utility at the POI',    '138 kV',      0],
          ['Gap closed on site',    '58 MW',       1]
        ],
        chip: 'Interconnection headroom · verified against the feeder'
      }
    },
    {
      k: '#00AEEF', chapter: 'OEM & channel', eyebrow: 'OEM & technology channel',
      dur: 10000,
      title: 'Your hardware, specified before the RFQ exists.',
      sub: 'When a developer places your SKU, the bill of materials writes itself and the opportunity lands in your queue — sized, sited and already engineered around your product.',
      note: 'The buyer stays anonymous until they accept your quote.',
      panel: {
        head: ['Bill of materials', 'Routed'],
        rows: [
          ['Modular compute pod ×180',  '180,000 kW', 0],
          ['Battery container ×8',      '32.0 MWh',   0],
          ['MV switchgear ×12',         '38 kV',      0],
          ['Main transformer ×9',       '138/34.5 kV',0],
          ['Opportunity value',              'Qualified',  1]
        ],
        chip: 'Routed to 3 vendors · your lines only'
      }
    },
    {
      k: '#F2B44C', chapter: 'Developers & capital', eyebrow: 'Developers, owners & capital',
      dur: 10000,
      title: 'Know the ceiling before you buy the dirt.',
      sub: 'Interconnection headroom, an hour-by-hour dispatch across the full year, and a pro forma that reconciles to it. Then apply for financing without rebuilding a single number.',
      note: 'Sizing is simulated on all 8,760 hours, not estimated from peaks.',
      panel: {
        head: ['Investment case', 'Class 4'],
        rows: [
          ['Nameplate',              '196 MW',   0],
          ['Capacity factor',        '61.4 %',   0],
          ['Total installed cost',   '$412 M',   0],
          ['Levelised cost',         '$41 /MWh', 0],
          ['Unlevered IRR',          '14.2 %',   1]
        ],
        chip: 'Apply for financing · routed to our capital partner'
      }
    },
    {
      k: '#8FA6FF', chapter: 'EPC & engineering', eyebrow: 'EPC & engineering services',
      dur: 10000,
      title: 'Drawings and quantities from the same model.',
      sub: 'The one-line, the plot plan and the take-off all read the one project. Move a compartment and the trench re-routes, the schedule re-counts, and the estimate follows.',
      note: 'Separations checked live against NFPA 855 and IFC 1207.',
      panel: {
        head: ['Take-off', 'AACE Class 4'],
        rows: [
          ['Trench',                 '4,120 ft',  0],
          ['Conduit runs',           '18',        0],
          ['Access road',            '1,146 ft',  0],
          ['Fenced compounds',       '5',         0],
          ['Estimate confidence',    '−15 / +30 %', 1]
        ],
        chip: 'One-line · plot plan · schedule — one source'
      }
    },
    {
      k: '#5FD9A0', chapter: 'Installers & sales', eyebrow: 'Installers & sales channel',
      dur: 10000,
      title: 'Quote it from the cab of the truck.',
      sub: 'Pull the meter data, size the system, and hand over a branded proposal before you leave the site. It runs in whatever browser you have on you.',
      note: 'No install, no plug-in, nothing to sync when you get back.',
      panel: {
        head: ['Site visit', '6 min'],
        rows: [
          ['Interval data',          'Imported', 0],
          ['Recommended system',     '2 × 215 kWh', 0],
          ['Demand saving',          '$41,800 /yr', 0],
          ['Simple payback',         '5.8 yr',   0],
          ['Proposal',               'Sent',     1]
        ],
        chip: 'Your logo, your pricing, your customer'
      }
    },
    {
      k: '#00AEEF', chapter: 'One platform', eyebrow: '', dur: 9000, close: true,
      title: 'One project. Four ways in.',
      sub: 'Everyone who touches an energy project is working from a different file. ClearSky OMEGA is the one they can all open.',
      quad: [
        ['OEM & channel',       'Demand, routed to your product', '#00AEEF'],
        ['Developers & capital','Feasibility through financing',  '#F2B44C'],
        ['EPC & engineering',   'Drawings and quantities',        '#8FA6FF'],
        ['Installers & sales',  'Sized and quoted on site',       '#5FD9A0']
      ]
    }
  ];

  var TOTAL = 0, i;
  for (i = 0; i < ACTS.length; i++) { ACTS[i].t0 = TOTAL; TOTAL += ACTS[i].dur; }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* The parcel and the campus that grows inside it. Deliberately not a
     real site: an irregular boundary, a pod field, a fenced yard. */
  /* The parcel and the campus that grows inside it. Deliberately not a
     real site: an irregular boundary, a pod field, a fenced yard.

     Composition matters more than accuracy here. The copy owns the left
     of the frame, so the campus is placed right of centre and a scrim
     (.rs-plot::after) fades the drawing out under the type — without it
     the pod field lands straight on the headline and neither reads. */
  function plotSvg() {
    var pods = '', c = 0, r, q;
    for (r = 0; r < 6; r++) {
      for (q = 0; q < 11; q++) {
        pods += '<rect class="plot-pod" x="' + (604 + q * 26) + '" y="' + (150 + r * 22) + '"'
             +  ' width="19" height="15" rx="2" fill="rgba(0,174,239,0.42)"'
             +  ' style="animation-delay:' + (2400 + c * 26) + 'ms"/>';
        c++;
      }
    }
    return '<svg viewBox="0 0 1200 620" preserveAspectRatio="xMidYMid slice" aria-hidden="true">'
      + '<path class="plot-line plot-trace" stroke="rgba(95,217,160,0.6)"'
      + ' d="M410 92 L900 68 L1078 300 L836 552 L486 508 L352 300 Z"/>'
      + '<rect class="plot-pod" x="588" y="136" width="306" height="152" rx="4" fill="none"'
      + ' stroke="rgba(0,174,239,0.38)" stroke-width="1.5" stroke-dasharray="7 5"'
      + ' style="animation-delay:2200ms"/>'
      + pods
      + '<rect class="plot-pod" x="924" y="150" width="86" height="66" rx="3" fill="none"'
      + ' stroke="rgba(242,180,76,0.55)" stroke-width="1.5" stroke-dasharray="7 5"'
      + ' style="animation-delay:4300ms"/>'
      + '<path class="plot-pod" d="M967 150 L967 104 L1046 104" fill="none"'
      + ' stroke="rgba(242,180,76,0.5)" stroke-width="1.6" style="animation-delay:4600ms"/>'
      + '<circle class="plot-pod" cx="1052" cy="104" r="7" fill="rgba(242,180,76,0.75)"'
      + ' style="animation-delay:4800ms"/>'
      + '</svg>';
  }

  function actHtml(a, idx) {
    var h = '<section class="rs' + (a.close ? ' rs-close' : '') + '" data-i="' + idx
          + '" style="--k:' + a.k + '">';
    if (a.plot) { h += '<div class="rs-plot">' + plotSvg() + '</div>'; }
    h += '<div class="rs-body">';
    if (a.eyebrow) {
      h += '<div class="rs-eyebrow anim" style="color:' + a.k + ';animation-delay:120ms">'
        +  '<i></i>' + esc(a.eyebrow) + '</div>';
    }
    h += '<h2 class="rs-title anim" style="animation-delay:220ms">' + esc(a.title) + '</h2>';
    h += '<p class="rs-sub anim" style="animation-delay:360ms">' + esc(a.sub) + '</p>';
    if (a.note) { h += '<p class="rs-note anim" style="animation-delay:520ms">' + esc(a.note) + '</p>'; }
    if (a.quad) {
      h += '<div class="rs-quad">';
      for (var j = 0; j < a.quad.length; j++) {
        h += '<div style="--k:' + a.quad[j][2] + ';animation-delay:' + (620 + j * 130) + 'ms">'
          +  esc(a.quad[j][0]) + '<em>' + esc(a.quad[j][1]) + '</em></div>';
      }
      h += '</div>';
    }
    h += '</div>';
    if (a.panel) {
      h += '<aside class="rs-panel anim" style="animation-delay:460ms">'
        +  '<div class="rs-panel-h"><span>' + esc(a.panel.head[0]) + '</span>'
        +  '<span style="color:' + a.k + '">' + esc(a.panel.head[1]) + '</span></div>';
      for (var m = 0; m < a.panel.rows.length; m++) {
        var row = a.panel.rows[m];
        h += '<div class="rs-row' + (row[2] ? ' hi' : '') + '"'
          +  ' style="animation-delay:' + (700 + m * 170) + 'ms">'
          +  '<b>' + esc(row[0]) + '</b><span>' + esc(row[1]) + '</span></div>';
      }
      if (a.panel.chip) {
        h += '<div class="rs-chip" style="animation-delay:' + (700 + a.panel.rows.length * 170 + 160) + 'ms">'
          +  esc(a.panel.chip) + '</div>';
      }
      h += '</aside>';
    }
    return h + '</section>';
  }

  var ICON_PAUSE = '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>';
  var ICON_PLAY  = '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3"/></svg>';

  function build() {
    var h = '<div class="reel-grid"></div><div class="reel-wash"></div>'
          + '<div class="reel-hud"><span>ClearSky OMEGA</span><b id="reelChapter">'
          + esc(ACTS[0].chapter) + '</b></div>'
          + '<div class="reel-scenes">';
    for (var j = 0; j < ACTS.length; j++) { h += actHtml(ACTS[j], j); }
    h += '</div><div class="reel-transport">'
      +  '<button class="reel-btn" id="reelToggle" aria-label="Pause">' + ICON_PAUSE + '</button>'
      +  '<div class="reel-chapters" id="reelChapters">';
    for (var n = 0; n < ACTS.length; n++) {
      h += '<button class="reel-chap" data-i="' + n + '" style="--k:' + ACTS[n].k + '"'
        +  ' aria-label="Chapter ' + (n + 1) + ': ' + esc(ACTS[n].chapter) + '">'
        +  '<span class="reel-chap-bar"><i></i></span>'
        +  '<span class="reel-chap-l">' + esc(ACTS[n].chapter) + '</span></button>';
    }
    h += '</div><a class="reel-cta" href="/contact.html">Request a demo</a></div>';
    return h;
  }

  /* ── the timeline ─────────────────────────────────────────── */
  var stage, reel, raf = null, t0 = 0, elapsed = 0, playing = false, act = -1;

  function bars() { return reel.querySelectorAll('.reel-chap-bar i'); }
  function chaps() { return reel.querySelectorAll('.reel-chap'); }
  function scenes() { return reel.querySelectorAll('.rs'); }

  function showAct(n) {
    if (n === act) { return; }
    act = n;
    var s = scenes(), cs = chaps(), j;
    for (j = 0; j < s.length; j++) { s[j].classList.toggle('is-live', j === n); }
    for (j = 0; j < cs.length; j++) { cs[j].setAttribute('aria-current', j === n ? 'true' : 'false'); }
    reel.setAttribute('data-act', String(n));
    var lbl = document.getElementById('reelChapter');
    if (lbl) { lbl.textContent = ACTS[n].chapter; }
  }

  function paint() {
    var b = bars(), j;
    for (j = 0; j < b.length; j++) {
      var a = ACTS[j];
      var p = (elapsed - a.t0) / a.dur;
      b[j].style.width = (p <= 0 ? 0 : p >= 1 ? 100 : p * 100).toFixed(1) + '%';
    }
    for (j = ACTS.length - 1; j >= 0; j--) {
      if (elapsed >= ACTS[j].t0) { showAct(j); break; }
    }
  }

  function frame(now) {
    if (!playing) { return; }
    elapsed = now - t0;
    if (elapsed >= TOTAL) { t0 = now; elapsed = 0; act = -1; }
    paint();
    raf = requestAnimationFrame(frame);
  }

  function play() {
    if (playing) { return; }
    playing = true;
    t0 = performance.now() - elapsed;
    raf = requestAnimationFrame(frame);
    var b = document.getElementById('reelToggle');
    if (b) { b.innerHTML = ICON_PAUSE; b.setAttribute('aria-label', 'Pause'); }
  }

  function pause() {
    playing = false;
    if (raf) { cancelAnimationFrame(raf); raf = null; }
    var b = document.getElementById('reelToggle');
    if (b) { b.innerHTML = ICON_PLAY; b.setAttribute('aria-label', 'Play'); }
  }

  /* Jumping re-runs the act from its first frame: the CSS animations are
     keyed off .is-live, so the class has to actually leave and come back
     or a replayed chapter shows its end state with nothing moving. */
  function seek(n) {
    elapsed = ACTS[n].t0;
    t0 = performance.now() - elapsed;
    var s = scenes(), j;
    for (j = 0; j < s.length; j++) { s[j].classList.remove('is-live'); }
    act = -1;
    void reel.offsetWidth;
    paint();
  }

  function mount() {
    stage = document.getElementById('videoStage');
    if (!stage || stage.querySelector('.reel')) { return; }

    if (REEL_VIDEO) {
      stage.innerHTML = '<video src="' + REEL_VIDEO + '" controls playsinline '
                      + 'poster="/neon-hero.jpg"></video>';
      return;
    }

    var host = document.createElement('div');
    host.className = 'reel';
    host.id = 'omegaReel';
    host.setAttribute('data-act', '0');
    host.innerHTML = build();
    stage.innerHTML = '';
    stage.appendChild(host);
    reel = host;

    var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (still) {
      /* Not a degraded film — the same six acts, laid out at once and
         readable as a page. A reel nobody can watch should still say
         everything the reel says. */
      host.setAttribute('data-static', '1');
      var s = scenes();
      for (var j = 0; j < s.length; j++) { s[j].classList.add('is-live'); }
      var tp = host.querySelector('.reel-transport');
      if (tp) { tp.style.display = 'none'; }
      return;
    }

    host.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target.closest('.reel-chap, #reelToggle') : null;
      if (!t) { return; }
      e.stopPropagation();
      if (t.id === 'reelToggle') { playing ? pause() : play(); return; }
      seek(+t.getAttribute('data-i'));
      play();
    });

    showAct(0);
    play();
  }

  /* The reel only runs while the modal is open — a rAF loop behind a
     hidden dialog is battery someone else paid for. */
  function wire() {
    var openFn = window.openVideo, closeFn = window.closeVideo;
    window.openVideo = function () {
      if (typeof openFn === 'function') { openFn.apply(this, arguments); }
      mount();
      if (reel && !reel.getAttribute('data-static')) { seek(0); play(); }
    };
    window.closeVideo = function () {
      pause();
      if (typeof closeFn === 'function') { closeFn.apply(this, arguments); }
    };
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { pause(); }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wire);
  } else { wire(); }
})();

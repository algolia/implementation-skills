#!/usr/bin/env python3
"""Generate the Algolia Implementation Skills enablement kit.

Five standalone, self-contained HTML pages that share one template.
Structure of every role page: animated flow, then three steps, then
everything else collapsed behind <details>.

  index.html      role picker hub
  csm.html        CSM / CSA
  technical.html  SE / Support / Implementation Consultant
  ae.html         Account Executive
  customer.html   Customer-facing quick start
"""

import html
import os
import re
import sys

OUT = sys.argv[1] if len(sys.argv) > 1 else "."
# Pass "external-js" to emit kit.js alongside the pages and reference it with
# <script src>. Required for the Netlify site, whose CSP sets script-src 'self'
# with no 'unsafe-inline' — an inline <script> is silently blocked there.
EXTERNAL_JS = len(sys.argv) > 2 and sys.argv[2] == "external-js"
# "artifact" mode: self-contained Cowork artifacts. No cross-page links (each
# artifact is separate), no Google Fonts (artifact sandbox blocks the network),
# and customer references point at the live site instead of a sibling file.
ARTIFACT = len(sys.argv) > 2 and sys.argv[2] == "artifact"
CUSTOMER_URL = "https://community.algolia.com/implementation-skills/start/"
SITE = "https://community.algolia.com/implementation-skills/"
DL = SITE + "#catalog"

# ---------------------------------------------------------------- shared CSS

CSS = r"""
@import url("https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap");
*,*::before,*::after{box-sizing:border-box}
:root{
  color-scheme:light;
  --blue:#0052ff; --blue-2:#256bff; --cyan:#00a2ff;
  --navy:#0b1526; --navy-2:#122a5c;
  --text:#0b1526; --muted:#526078; --soft:#1d2b44;
  --bg:#f5f8ff; --card:#ffffff;
  --border:rgba(20,48,92,.16); --divider:rgba(20,48,92,.10);
  --tag-text:#0b58d8; --tag-bg:rgba(0,82,255,.10); --tag-border:rgba(0,82,255,.26);
  --ok-text:#08733f; --ok-bg:rgba(17,166,82,.10); --ok-border:rgba(17,166,82,.26);
  --warn-bg:#fff7e8; --warn-border:#f0d9a8; --warn-text:#7a5410;
  --shadow:0 22px 80px rgba(21,56,117,.13);
  --shadow-sm:0 2px 10px rgba(21,56,117,.07);
  --ease:cubic-bezier(.22,.61,.36,1);
  --mono:ui-monospace,SFMono-Regular,Menlo,Consolas,"Liberation Mono",monospace;
}
html{scroll-behavior:smooth}
body{
  margin:0; background:var(--bg); color:var(--text);
  font-family:"Sora",ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
  font-size:15px; line-height:1.55; -webkit-font-smoothing:antialiased;
}
a{color:var(--blue); text-decoration:none}
a:hover{text-decoration:underline}
.wrap{max-width:940px; margin:0 auto; padding:0 28px}

/* ---- header ---- */
header.top{
  background:
    radial-gradient(circle at 88% 8%,rgba(0,162,255,.30),transparent 42%),
    linear-gradient(135deg,var(--navy) 0%,var(--navy-2) 100%);
  color:#fff; padding:30px 0 26px;
}
header.top .eyebrow{
  font-size:11.5px; font-weight:700; letter-spacing:.10em; text-transform:uppercase;
  color:#7fb4ff; margin:0 0 9px;
}
header.top h1{font-size:31px; line-height:1.14; font-weight:800; margin:0 0 9px; letter-spacing:-.015em}
header.top p.sub{margin:0; color:#a8c0e8; font-size:16px; max-width:58ch}
header.top .hmeta{margin:16px 0 0; display:flex; flex-wrap:wrap; gap:7px}
header.top .hmeta span{
  font-size:12px; font-weight:600; padding:4px 11px; border-radius:999px;
  background:rgba(255,255,255,.11); border:1px solid rgba(255,255,255,.18); color:#dce9ff;
}
.backlink{display:inline-block; margin:0 0 14px; font-size:13px; font-weight:600; color:#a8c0e8}
.backlink:hover{color:#fff}

main{padding:30px 0 64px}
h2.step-h{font-size:22px; font-weight:800; letter-spacing:-.01em; margin:34px 0 4px; display:flex; align-items:center; gap:12px}
h2.step-h .num{
  flex:0 0 auto; display:grid; place-items:center; width:32px; height:32px; border-radius:10px;
  background:linear-gradient(160deg,var(--blue),var(--blue-2)); color:#fff; font-size:15px; font-weight:800;
}
h2.plain{font-size:21px; font-weight:800; letter-spacing:-.01em; margin:0 0 6px}
h3{font-size:14.5px; font-weight:700; color:var(--blue); margin:20px 0 7px}
.lede{color:var(--muted); font-size:15px; margin:0 0 14px}
.stepnote{color:var(--muted); font-size:14.5px; margin:0 0 12px; padding-left:44px}
@media(max-width:600px){.stepnote{padding-left:0}}
p{margin:0 0 11px}
ul,ol{margin:0 0 11px; padding-left:21px}
li{margin:4px 0}
code{font-family:var(--mono); font-size:.87em; background:rgba(2,10,24,.06); padding:2px 6px; border-radius:5px; color:#123a80}

/* ---- cards ---- */
.card{background:var(--card); border:1px solid var(--border); border-radius:14px; padding:18px 20px; margin:12px 0; box-shadow:var(--shadow-sm)}
.card > :last-child{margin-bottom:0}
.card h4{margin:0 0 6px; font-size:15.5px; font-weight:700}
.grid{display:grid; gap:12px; margin:12px 0}
.grid.g2{grid-template-columns:repeat(2,minmax(0,1fr))}
@media(max-width:820px){.grid.g2{grid-template-columns:1fr}}

/* ---- chips / callouts ---- */
.chip{display:inline-block; font-size:11.5px; font-weight:700; padding:3px 10px; border-radius:999px;
  background:var(--tag-bg); color:var(--tag-text); border:1px solid var(--tag-border); margin:0 5px 5px 0}
.chip.ok{background:var(--ok-bg); color:var(--ok-text); border-color:var(--ok-border)}
.chip.grey{background:rgba(9,35,80,.055); color:var(--muted); border-color:var(--divider)}
.note{border-radius:12px; padding:12px 15px; margin:12px 0; font-size:13.5px;
  background:var(--warn-bg); border:1px solid var(--warn-border); color:var(--warn-text)}
.note.blue{background:rgba(0,82,255,.055); border-color:var(--tag-border); color:#123a80}
.note.ok{background:var(--ok-bg); border-color:var(--ok-border); color:var(--ok-text)}
.note > :last-child{margin-bottom:0}

/* ---- prompt / code blocks ---- */
.block{position:relative; margin:11px 0}
.block .copy{position:absolute; top:9px; right:9px; z-index:2;
  border:1px solid var(--border); background:#fff; color:var(--blue);
  font-family:inherit; font-weight:700; font-size:11.5px; padding:5px 11px; border-radius:7px;
  cursor:pointer; transition:background .15s var(--ease), transform .15s var(--ease)}
.block .copy:hover{background:#eef3ff}
.block .copy:active{transform:scale(.96)}
.block .copy.done{background:var(--ok-bg); border-color:var(--ok-border); color:var(--ok-text)}
.prompt{background:var(--card); border:1px solid var(--border); border-left:3px solid var(--blue);
  border-radius:12px; padding:16px 92px 16px 18px; margin:0; white-space:pre-wrap;
  font-family:inherit; font-size:14px; line-height:1.6; color:var(--soft)}
.prompt.hero{box-shadow:0 10px 34px rgba(0,82,255,.12); border-left-width:4px}
.term{background:#050b18; border:1px solid #1b2c4d; border-radius:12px;
  padding:14px 92px 14px 16px; margin:0; overflow-x:auto;
  font-family:var(--mono); font-size:12.5px; line-height:1.7; color:#cfe0ff}
.term .c{color:#6f87b8}
.term .p{color:#00c98a}
.term .copy{background:rgba(255,255,255,.07); border-color:#2a3f68; color:#8fc2ff}
.term .copy:hover{background:rgba(255,255,255,.14)}
.cap{font-size:12.5px; color:var(--muted); margin:6px 0 0}

/* ---- big download button ---- */
a.dlbtn{display:inline-flex; align-items:center; gap:9px; margin:4px 0 0;
  background:linear-gradient(160deg,var(--blue),var(--blue-2)); color:#fff;
  font-weight:700; font-size:15px; padding:13px 22px; border-radius:12px;
  box-shadow:0 14px 32px rgba(0,82,255,.26); transition:transform .16s var(--ease), box-shadow .16s var(--ease)}
a.dlbtn:hover{text-decoration:none; transform:translateY(-2px); box-shadow:0 18px 40px rgba(0,82,255,.34)}
a.dlbtn svg{flex:0 0 auto}

/* ---- 3-step animation ---- */
.flow{background:linear-gradient(135deg,var(--navy),var(--navy-2)); border-radius:16px;
  padding:22px; margin:0 0 8px; overflow:hidden; box-shadow:var(--shadow)}
.flow .rail{display:grid; grid-template-columns:1fr auto 1fr auto 1fr; align-items:stretch; gap:10px}
@media(max-width:820px){.flow .rail{grid-template-columns:1fr; gap:12px} .flow .arrow{display:none}}
.step{background:rgba(255,255,255,.055); border:1px solid rgba(255,255,255,.14);
  border-radius:13px; padding:14px 15px; position:relative; overflow:hidden;
  animation:stepGlow 9s var(--ease) infinite}
.step:nth-child(1){animation-delay:0s}
.step:nth-child(3){animation-delay:3s}
.step:nth-child(5){animation-delay:6s}
@keyframes stepGlow{
  0%,4%{background:rgba(255,255,255,.055); border-color:rgba(255,255,255,.14); transform:translateY(0)}
  8%,30%{background:rgba(0,82,255,.28); border-color:var(--cyan); transform:translateY(-3px)}
  36%,100%{background:rgba(255,255,255,.055); border-color:rgba(255,255,255,.14); transform:translateY(0)}}
.step .n{font-family:var(--mono); font-size:10.5px; font-weight:800; letter-spacing:.06em; color:#7fb4ff; display:block; margin-bottom:6px}
.step .t{color:#fff; font-weight:700; font-size:15px; display:block; margin-bottom:3px}
.step .d{color:#a8c0e8; font-size:12.5px; display:block; line-height:1.5}
.step .ico{position:absolute; top:12px; right:13px; opacity:.5}
.arrow{align-self:center; color:#4a6ba8}
.arrow svg{display:block}
.arrow.a1{animation:dash 9s linear infinite; animation-delay:1.6s}
.arrow.a2{animation:dash 9s linear infinite; animation-delay:4.6s}
@keyframes dash{0%,10%{color:#4a6ba8}14%,26%{color:var(--cyan)}30%,100%{color:#4a6ba8}}
.flow .out{margin:14px 0 0; background:rgba(2,8,20,.55); border:1px solid rgba(255,255,255,.12);
  border-radius:11px; padding:12px 14px; font-family:var(--mono); font-size:11.5px; color:#9fb8e0}
.flow .out .ln{display:block; opacity:0; animation:lnIn 9s var(--ease) infinite}
.flow .out .ln:nth-child(1){animation-delay:6.2s}
.flow .out .ln:nth-child(2){animation-delay:6.7s}
.flow .out .ln:nth-child(3){animation-delay:7.2s}
.flow .out .ln:nth-child(4){animation-delay:7.7s}
@keyframes lnIn{0%{opacity:0; transform:translateX(-6px)}6%,30%{opacity:1; transform:translateX(0)}36%,100%{opacity:0; transform:translateX(-6px)}}
.flow .out .ck{color:#00c98a; font-weight:700}
@media(prefers-reduced-motion:reduce){
  .step,.arrow.a1,.arrow.a2,.flow .out .ln{animation:none!important}
  .flow .out .ln{opacity:1}
  .step{background:rgba(0,82,255,.16); border-color:rgba(255,255,255,.22)}}

/* ---- tool tabs ---- */
.tabs{margin:12px 0}
.tabs .tabbar{display:flex; flex-wrap:wrap; gap:6px; margin:0 0 -1px}
.tabs .tabbar button{font-family:inherit; font-size:13px; font-weight:600; cursor:pointer;
  padding:8px 14px; border-radius:10px 10px 0 0; border:1px solid var(--border);
  border-bottom-color:transparent; background:rgba(255,255,255,.6); color:var(--soft);
  transition:background .15s var(--ease), color .15s var(--ease)}
.tabs .tabbar button:hover{background:#fff}
.tabs .tabbar button[aria-selected="true"]{background:var(--blue); border-color:var(--blue); color:#fff}
.tabs .panels{background:var(--card); border:1px solid var(--border);
  border-radius:0 14px 14px 14px; padding:18px 20px; box-shadow:var(--shadow-sm)}
.tabs [role="tabpanel"]{display:none}
.tabs [role="tabpanel"].on{display:block}
.tabs [role="tabpanel"] > :first-child{margin-top:0}
.tabs [role="tabpanel"] > :last-child{margin-bottom:0}
ol.steps{list-style:none; padding:0; margin:0; counter-reset:s}
ol.steps > li{counter-increment:s; position:relative; padding:0 0 13px 38px; margin:0 0 0 13px; border-left:2px solid var(--divider)}
ol.steps > li:last-child{border-left-color:transparent; padding-bottom:0}
ol.steps > li::before{content:counter(s); position:absolute; left:-14px; top:-2px;
  width:25px; height:25px; border-radius:8px; display:grid; place-items:center;
  background:var(--card); border:1.5px solid var(--blue); color:var(--blue); font-size:11.5px; font-weight:800}
ol.steps > li > :first-child{margin-top:0}
ol.steps > li > :last-child{margin-bottom:0}

/* ---- collapsed details ---- */
.moreband{margin:44px 0 0; padding:22px 0 0; border-top:1px solid var(--border)}
.moreband > .mh{font-size:12px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:var(--muted); margin:0 0 12px}
details.more{background:var(--card); border:1px solid var(--border); border-radius:12px; margin:9px 0; box-shadow:var(--shadow-sm)}
details.more > summary{cursor:pointer; padding:14px 18px; font-weight:700; font-size:14.5px;
  list-style:none; display:flex; align-items:center; justify-content:space-between; gap:14px}
details.more > summary::-webkit-details-marker{display:none}
details.more > summary::marker{content:""}
details.more > summary::after{content:"+"; color:var(--blue); font-weight:800; font-size:19px; line-height:1; flex:0 0 auto}
details.more[open] > summary::after{content:"\2013"}
details.more > summary:hover{color:var(--blue)}
details.more[open] > summary{border-bottom:1px solid var(--divider)}
details.more .db{padding:16px 18px 18px}
details.more .db > :first-child{margin-top:0}
details.more .db > :last-child{margin-bottom:0}
details.more .db h3:first-child{margin-top:0}

/* ---- tables ---- */
table{border-collapse:collapse; width:100%; font-size:13.5px}
th,td{text-align:left; padding:9px 11px; border-bottom:1px solid var(--divider); vertical-align:top}
th{color:var(--muted); font-weight:700; font-size:11.5px; text-transform:uppercase; letter-spacing:.04em}
tr:last-child td{border-bottom:none}
.card.tbl{padding:5px 9px}

/* ---- role picker (hub) ---- */
.roles{display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:14px; margin:16px 0}
@media(max-width:820px){.roles{grid-template-columns:1fr}}
a.role{display:block; background:var(--card); border:1px solid var(--border); border-radius:16px;
  padding:20px 21px; color:inherit; box-shadow:var(--shadow-sm);
  transition:transform .18s var(--ease), box-shadow .18s var(--ease), border-color .18s var(--ease)}
a.role:hover{text-decoration:none; transform:translateY(-3px); border-color:var(--blue); box-shadow:0 18px 44px rgba(21,56,117,.16)}
a.role .rt{display:block; font-size:18px; font-weight:800; margin:0 0 4px; letter-spacing:-.01em}
a.role .rw{display:block; font-size:13.5px; color:var(--muted); margin:0 0 11px; line-height:1.5}
a.role .go{font-size:13px; font-weight:700; color:var(--blue)}
a.role .go::after{content:" \2192"; transition:margin .18s var(--ease)}
a.role:hover .go::after{margin-left:4px}

/* ---- footer ---- */
footer{border-top:1px solid var(--border); padding:24px 0 40px; font-size:13px; color:var(--muted)}
footer .wrap{display:flex; flex-wrap:wrap; gap:14px; justify-content:space-between}
footer a{font-weight:600}
"""

JS = r"""
document.querySelectorAll('.block .copy').forEach(function(btn){
  btn.addEventListener('click', function(){
    var src = btn.parentElement.querySelector('pre');
    if(!src) return;
    var txt = src.innerText.replace(/ /g,' ');
    // Terminal blocks show a "$ " prompt marker. Strip it so the copy pastes
    // straight into a shell instead of running a command called "$".
    if(src.classList.contains('term')){
      txt = txt.split('\n').map(function(l){ return l.replace(/^\s*\$\s/,''); }).join('\n');
    }
    txt = txt.trim();
    var done = function(){
      var old = btn.getAttribute('data-label') || btn.textContent;
      btn.setAttribute('data-label', old);
      btn.textContent = 'Copied ✓'; btn.classList.add('done');
      setTimeout(function(){ btn.textContent = old; btn.classList.remove('done'); }, 1700);
    };
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(txt).then(done, function(){ fallback(txt, done); });
    } else { fallback(txt, done); }
  });
});
function fallback(txt, cb){
  var ta = document.createElement('textarea');
  ta.value = txt; ta.setAttribute('readonly','');
  ta.style.position='fixed'; ta.style.top='-1000px';
  document.body.appendChild(ta); ta.select();
  try { document.execCommand('copy'); cb(); } catch(e){}
  document.body.removeChild(ta);
}

document.querySelectorAll('.tabs').forEach(function(group){
  var btns = Array.prototype.slice.call(group.querySelectorAll('.tabbar button'));
  var pans = Array.prototype.slice.call(group.querySelectorAll('[role="tabpanel"]'));
  function show(i, focus){
    btns.forEach(function(b,j){
      b.setAttribute('aria-selected', j===i ? 'true' : 'false');
      b.tabIndex = j===i ? 0 : -1;
    });
    pans.forEach(function(p,j){ p.classList.toggle('on', j===i); });
    if(focus) btns[i].focus();
    try { localStorage.setItem('alg-tool-tab', btns[i].dataset.tool); } catch(e){}
  }
  btns.forEach(function(b,i){
    b.addEventListener('click', function(){ show(i, false); });
    b.addEventListener('keydown', function(e){
      var d = e.key==='ArrowRight' ? 1 : e.key==='ArrowLeft' ? -1 : 0;
      if(!d) return;
      e.preventDefault();
      show((i + d + btns.length) % btns.length, true);
    });
  });
  var want = null;
  if(location.hash.indexOf('#tool-')===0) want = location.hash.replace('#tool-','');
  if(!want){ try { want = localStorage.getItem('alg-tool-tab'); } catch(e){} }
  var idx = 0;
  if(want){ btns.forEach(function(b,j){ if(b.dataset.tool===want) idx = j; }); }
  show(idx, false);
});
"""

# ---------------------------------------------------------------- helpers


def esc(s):
    return html.escape(s, quote=False)


_MD_CODE = re.compile(r"`([^`]+)`")
_MD_BOLD = re.compile(r"\*\*([^*]+)\*\*")
_MD_LINK = re.compile(r"\[([^\]]+)\]\(([^)]+)\)")


def md(s):
    s = esc(s)
    s = _MD_CODE.sub(lambda m: "<code>%s</code>" % m.group(1), s)
    s = _MD_BOLD.sub(lambda m: "<strong>%s</strong>" % m.group(1), s)
    s = _MD_LINK.sub(lambda m: '<a href="%s">%s</a>' % (m.group(2), m.group(1)), s)
    return s


def p(s):
    return "<p>%s</p>" % md(s)


def prompt(text, cap=None, hero=False):
    c = '<p class="cap">%s</p>' % md(cap) if cap else ""
    return (
        '<div class="block"><button class="copy" type="button">Copy prompt</button>'
        '<pre class="prompt%s">%s</pre></div>%s'
        % (" hero" if hero else "", esc(text.strip()), c)
    )


def term(lines, cap=None):
    out = []
    for ln in lines:
        if ln.startswith("#"):
            out.append('<span class="c">%s</span>' % esc(ln))
        elif ln.startswith("$ "):
            out.append('<span class="p">$</span> %s' % esc(ln[2:]))
        else:
            out.append(esc(ln))
    c = '<p class="cap">%s</p>' % md(cap) if cap else ""
    return (
        '<div class="block"><button class="copy" type="button">Copy</button>'
        '<pre class="term">%s</pre></div>%s' % ("\n".join(out), c)
    )


def ul(items):
    return "<ul>%s</ul>" % "".join("<li>%s</li>" % md(i) for i in items)


def steps(items):
    return '<ol class="steps">%s</ol>' % "".join("<li>%s</li>" % i for i in items)


def table(head, rows):
    h = "".join("<th>%s</th>" % md(x) for x in head)
    b = "".join("<tr>%s</tr>" % "".join("<td>%s</td>" % md(c) for c in r) for r in rows)
    return '<div class="card tbl"><table><tr>%s</tr>%s</table></div>' % (h, b)


def card(inner):
    return '<div class="card">%s</div>' % inner


def note(inner, kind=""):
    return '<div class="note %s">%s</div>' % (kind, inner)


def details(summary, body):
    return '<details class="more"><summary>%s</summary><div class="db">%s</div></details>' % (
        md(summary),
        body,
    )


def dlbtn(label, href=DL):
    ico = (
        '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
        'stroke-width="2.2" stroke-linecap="round"><path d="M12 3v12M7 11l5 5 5-5M4 20h16"/></svg>'
    )
    return '<p><a class="dlbtn" href="%s">%s%s</a></p>' % (href, ico, esc(label))


def step(num, title, note_line, body):
    return (
        '<h2 class="step-h"><span class="num">%s</span>%s</h2>'
        '<p class="stepnote">%s</p>%s' % (num, esc(title), md(note_line), body)
    )


ICO = {
    "dl": '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9fc4ff" stroke-width="2" stroke-linecap="round"><path d="M12 3v12M7 11l5 5 5-5M4 20h16"/></svg>',
    "folder": '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9fc4ff" stroke-width="2" stroke-linecap="round"><path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>',
    "spark": '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9fc4ff" stroke-width="2" stroke-linecap="round"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/></svg>',
}
ARROW = (
    '<svg width="28" height="14" viewBox="0 0 28 14" fill="none" stroke="currentColor" '
    'stroke-width="2" stroke-linecap="round"><path d="M1 7h22M18 2l5 5-5 5"/></svg>'
)


def flow(s1, s2, s3, out_lines):
    def st(n, ico, t, d):
        return (
            '<div class="step"><span class="ico">%s</span><span class="n">STEP %s</span>'
            '<span class="t">%s</span><span class="d">%s</span></div>'
            % (ICO[ico], n, esc(t), md(d))
        )

    lns = "".join(
        '<span class="ln"><span class="ck">✓</span> %s</span>' % md(l)
        for l in out_lines
    )
    return (
        '<div class="flow"><div class="rail">%s<div class="arrow a1">%s</div>%s'
        '<div class="arrow a2">%s</div>%s</div><div class="out">%s</div></div>'
        % (st("01", "dl", *s1), ARROW, st("02", "folder", *s2), ARROW, st("03", "spark", *s3), lns)
    )


def tool_tabs(tools, gid):
    bar = "".join(
        '<button type="button" role="tab" data-tool="%s" aria-controls="%s-%s" '
        'aria-selected="false" tabindex="-1">%s</button>' % (k, gid, k, esc(lbl))
        for k, lbl, _ in tools
    )
    pans = "".join(
        '<div role="tabpanel" id="%s-%s" aria-label="%s">%s</div>' % (gid, k, esc(lbl), body)
        for k, lbl, body in tools
    )
    return (
        '<div class="tabs"><div class="tabbar" role="tablist">%s</div>'
        '<div class="panels">%s</div></div>' % (bar, pans)
    )


VERIFY = (
    "<strong>It worked if</strong> the skill shows up in your tool's skill list, and your first "
    "prompt comes back <em>asking you questions</em> instead of writing code."
)

# --- per-tool install bodies ----------------------------------------------


def t_claude_desktop(zips, invoke):
    return (
        p("No terminal. About three minutes.")
        + steps([
            p("Claude → **Settings → Capabilities** → turn on **Code execution and file creation**. The Skills section is hidden until you do."),
            p("Download the ZIPs. **Don't unzip them.**")
            + '<p>%s</p>' % ", ".join("<code>%s</code>" % z for z in zips),
            p("Go to **Customize → Skills** ([claude.ai/customize/skills](https://claude.ai/customize/skills))."),
            p("**+ → Create skill → Upload a skill.** One ZIP at a time."),
            p("Type `/` in the message box. You should see `%s`." % invoke),
        ])
        + note(md("Upload the **individual** skill ZIPs, not `algolia-skills-library.zip` — the uploader takes one skill at a time. If a ZIP is rejected, unzip it and re-zip just the `algolia-…` folder (right-click → Compress)."))
    )


def t_claude_code():
    return (
        p("Copy folders. Don't upload.")
        + term([
            "$ unzip ~/Downloads/algolia-skills-library.zip -d /tmp/alg",
            "$ mkdir -p ~/.claude/skills",
            "$ cp -R /tmp/alg/algolia-* ~/.claude/skills/",
        ], cap="Use `.claude/skills/` inside a repo instead, to scope the skills to one project.")
        + p("Then in a session: `/algolia-discovery-planning`")
        + note(md("**Don't use `npx skills add` for Claude Code.** It installs to `~/.agents/skills/`, which Claude Code doesn't read."))
    )


def t_codex():
    return (
        p("Codex CLI and the Codex IDE extension read `.agents/skills/`.")
        + term([
            "$ unzip ~/Downloads/algolia-skills-library.zip -d /tmp/alg",
            "$ mkdir -p .agents/skills",
            "$ cp -R /tmp/alg/algolia-* .agents/skills/",
        ], cap="Or `~/.agents/skills/` to make them available in every project.")
        + p("Then: `/skills` to list, `$algolia-discovery-planning` to invoke.")
        + note(md("`.agents/skills/` is the documented cross-tool location, but **`~/.codex/skills/` still loads** for backward compatibility — you do not have to move existing folders."))
        + note(md("Codex budgets its startup skill list to **2% of the model’s context window** (8,000 characters when that is unknown). Past that it shortens descriptions, then omits skills and warns you. Install only the skills you need now."), "blue")
    )


def t_chatgpt():
    return (
        p("Native Skills, GA on **Business, Enterprise, Healthcare and Edu**.")
        + steps([
            p("Sidebar → **Plugins → Plugin Directory → Skills**."),
            p("**Create → Upload from your computer.** One skill ZIP at a time."),
            p("Wait for the security scan. Uploads can come back **Needs Review**."),
        ])
        + note(md("Personal skills **don't sync** between the desktop app and web. Add them in both."))
        + details(
            "No Skills tab on your plan?",
            p("Make a **Project**, then ••• → **Project settings**, and paste the skill's `SKILL.md` into the project instructions. Upload the `references/` files to the project too. You lose automatic triggering, but the guidance applies to every chat in that project.")
            + p("On the desktop app you can instead point a Project at a local folder (**Edit project → Add folder → Make primary**) and put the skills in that folder's `.agents/skills/`."),
        )
    )


def t_cursor():
    return (
        p("Native since Cursor 2.4. It also reads Claude and Codex skill folders, so an existing install often needs nothing.")
        + term([
            "$ unzip ~/Downloads/algolia-skills-library.zip -d /tmp/alg",
            "$ mkdir -p .cursor/skills",
            "$ cp -R /tmp/alg/algolia-* .cursor/skills/",
        ])
        + p("Then: `/algolia-discovery-planning`, or `@algolia-discovery-planning` to attach as context.")
        + note(md("Use `.cursor/skills/`, **not** `.cursor/rules/`. Rules need a `.mdc` extension and a `.md` there is silently ignored."))
    )


def t_copilot():
    return (
        p("GA in VS Code 1.109+ (1.108 shipped it as experimental).")
        + term([
            "$ unzip ~/Downloads/algolia-skills-library.zip -d /tmp/alg",
            "$ mkdir -p .github/skills",
            "$ cp -R /tmp/alg/algolia-* .github/skills/",
        ], cap="Copilot also reads `.claude/skills/` and `.agents/skills/` in the workspace.")
        + p("Then: `/algolia-discovery-planning`, optionally with context — `/algolia-release-qa for the checkout page`.")
    )


def t_windsurf():
    return (
        p("Windsurf is now **Devin Desktop**. It currently offers Cascade and the newer Devin Local agent, with Cascade being superseded. `.agents/skills/` is the recommended path; `.devin/skills/` and the legacy `.windsurf/skills/` also load.")
        + term([
            "$ unzip ~/Downloads/algolia-skills-library.zip -d /tmp/alg",
            "$ mkdir -p .windsurf/skills",
            "$ cp -R /tmp/alg/algolia-* .windsurf/skills/",
        ])
        + p("Then: `@algolia-discovery-planning` in Cascade, `/algolia-discovery-planning` in Devin Local.")
    )


def t_other():
    return (
        p("These follow the open [Agent Skills spec](https://agentskills.io/specification) — 44 products are listed on its client showcase, and that list is not exhaustive. The spec standardises the skill folder, not where each tool looks for it, so try the most widely read path first:")
        + term(["$ mkdir -p .agents/skills", "$ cp -R /tmp/alg/algolia-* .agents/skills/"])
        + note(md("**One folder covers most tools.** `.agents/skills/` works in Codex, Copilot, Cursor, Gemini CLI, Antigravity and Devin Desktop. The exceptions: Claude Code (`~/.claude/skills/`), Kiro (`.kiro/skills/`), and the ZIP-upload surfaces (Claude app, ChatGPT web)."), "ok")
        + details(
            "Gemini CLI, Antigravity, Kiro specifics",
            "<h3>Gemini CLI</h3>"
            + term(["$ gemini skills install https://github.com/algolia/skills", "> /skills list"])
            + p("It asks for consent before activating a skill. That's expected.")
            + "<h3>Antigravity</h3>"
            + p("Workspace `.agents/skills/`. Google's docs disagree on the global path — use the workspace one.")
            + "<h3>Kiro</h3>"
            + p("`.kiro/skills/` — Kiro is the one holdout that doesn't read `.agents/skills/`."),
        )
    )


NOCODE = lambda zips, invoke: [
    ("claude-desktop", "Claude app", t_claude_desktop(zips, invoke)),
    ("chatgpt", "ChatGPT", t_chatgpt()),
    ("claude-code", "Claude Code", t_claude_code()),
    ("other", "Something else", t_other()),
]

DEVTOOLS = [
    ("claude-code", "Claude Code", t_claude_code()),
    ("cursor", "Cursor", t_cursor()),
    ("codex", "Codex", t_codex()),
    ("copilot", "Copilot / VS Code", t_copilot()),
    ("windsurf", "Windsurf / Devin", t_windsurf()),
    ("claude-desktop", "Claude app", t_claude_desktop(["algolia-discovery-planning.zip"], "/algolia-discovery-planning")),
    ("other", "Anything else", t_other()),
]

ALLTOOLS = [
    ("claude-desktop", "Claude app", t_claude_desktop(["algolia-discovery-planning.zip"], "/algolia-discovery-planning")),
    ("claude-code", "Claude Code", t_claude_code()),
    ("cursor", "Cursor", t_cursor()),
    ("codex", "Codex", t_codex()),
    ("chatgpt", "ChatGPT", t_chatgpt()),
    ("copilot", "Copilot / VS Code", t_copilot()),
    ("windsurf", "Windsurf / Devin", t_windsurf()),
    ("other", "Anything else", t_other()),
]

TROUBLE = [
    ["Agent ignores the skills", "Wrong folder for that tool, or `SKILL.md` isn't at the top of the skill folder. Unzipping often doubles the folder — check for `algolia-events-insights/algolia-events-insights/SKILL.md`."],
    ["Claude rejected the ZIP", "Upload individual skill ZIPs, not the full library. Still rejected? Unzip and re-zip just the `algolia-…` folder."],
    ["No Skills section in Claude", "Turn on **Settings → Capabilities → Code execution and file creation** first."],
    ["Some skills load, others don't", "Codex budgets the startup list to 2% of the context window (8,000 characters if unknown), then trims descriptions and warns. Install fewer."],
    ["It writes code without asking anything", "The discovery skill didn't trigger. Name it: `/algolia-discovery-planning`."],
]

# ---------------------------------------------------------------- template

PAGE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<style>{css}</style>
</head>
<body>
<header class="top">
  <div class="wrap">
    {back}
    <p class="eyebrow">{eyebrow}</p>
    <h1>{h1}</h1>
    <p class="sub">{sub}</p>
    <div class="hmeta">{meta}</div>
  </div>
</header>
<main><div class="wrap">
{body}
</div></main>
<footer><div class="wrap">
  <div>Algolia Implementation Skills &middot; MIT licensed</div>
  <div><a href="{site}">Library</a> &middot; <a href="https://github.com/algolia/skills">Official Algolia skills</a> &middot; <a href="https://www.algolia.com/doc/guides/get-started/build-with-ai/">Build with AI</a></div>
</div></footer>
{script}
</body>
</html>
"""


def build(fn, title, desc, eyebrow, h1, sub, meta, body, back=True):
    script = (
        '<script src="kit.js"></script>'
        if EXTERNAL_JS
        else "<script>%s</script>" % JS
    )
    out = PAGE.format(
        title=esc(title),
        desc=esc(desc),
        css=CSS,
        script=script,
        back=(
            '<a class="backlink" href="index.html">&larr; All versions</a>'
            if back and not ARTIFACT
            else ""
        ),
        eyebrow=esc(eyebrow),
        h1=esc(h1),
        sub=md(sub),
        meta="".join("<span>%s</span>" % esc(m) for m in meta),
        body=body,
        site=SITE,
    )
    if ARTIFACT:
        out = out.replace('href="customer.html"', 'href="%s"' % CUSTOMER_URL)
        out = out.replace(
            '@import url("https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap");',
            "/* webfont omitted: the artifact sandbox blocks network requests */",
        )
        out = out.replace('"Sora",ui-sans-serif', "ui-sans-serif")
    path = os.path.join(OUT, fn)
    with open(path, "w", encoding="utf-8") as f:
        f.write(out)
    print("wrote %s (%.0f KB)" % (path, len(out) / 1024))


def moreband(items, heading="If you want more"):
    return '<div class="moreband"><p class="mh">%s</p>%s</div>' % (
        esc(heading),
        "".join(items),
    )


# ================================================================ HUB

hub = (
    '<h2 class="plain">Pick your version</h2>'
    + '<p class="lede">%s</p>'
    % md(
        "The customer version is the product. The three internal versions are about "
        "getting it into your customers' hands and talking about it well."
    )
    + '<div class="roles">'
    '<a class="role" href="customer.html"><span class="rt">Customers</span>'
    '<span class="rw">The actual walkthrough. Download, load, ask. Send this one.</span>'
    '<span class="go">Open</span></a>'
    '<a class="role" href="csm.html"><span class="rt">CSM &amp; CSA</span>'
    '<span class="rw">Position it as config and optimization of the Algolia they already own.</span>'
    '<span class="go">Open</span></a>'
    '<a class="role" href="technical.html"><span class="rt">SE, Support &amp; IC</span>'
    '<span class="rw">How to set a customer up and hand over so it sticks.</span>'
    '<span class="go">Open</span></a>'
    '<a class="role" href="ae.html"><span class="rt">Account Executives</span>'
    '<span class="rw">What it is in business terms and the conversation it opens.</span>'
    '<span class="go">Open</span></a>'
    "</div>"
    + note(
        md(
            "**Only `customer.html` goes to customers.** The other three contain positioning, "
            "objection handling and guardrails meant for us."
        )
    )
    + flow(
        ("Position it", "One sentence the customer actually cares about."),
        ("Hand it over", "Send the quick start. Copy is written for you."),
        ("Make it land", "Run one prompt with them. Use what comes back."),
        [
            "Customer's agent stops guessing and starts asking",
            "Data contract and events locked before the UI",
            "Assumptions recorded with an owner",
            "You get an evidence-based gap map to work from",
        ],
    )
    + moreband(
        [
            details(
                "What these actually are",
                p(
                    "Any AI agent can write InstantSearch code in seconds. Almost every one ships a "
                    "search box with no click events, no facets and no launch plan — so analytics "
                    "can't be trusted, and the AI features the customer already pays for have "
                    "nothing to learn from."
                )
                + p(
                    "These are **eleven open-source skills** that make a customer's AI tool behave "
                    "like a senior Algolia implementation consultant instead. Live account "
                    "operations route to the official `algolia-mcp` and `algolia-cli`, so they "
                    "strengthen the official tooling rather than competing with it."
                ),
            ),
            details(
                "The eleven skills",
                p(
                    "Customers rarely install all of them. `algolia-discovery-planning` is the front "
                    "door — it works out which others the request needs."
                )
                + table(
                    ["Skill", "What it owns"],
                    [
                        ["`algolia-discovery-planning`", "**Start here.** Asks the right questions, classifies maturity, routes to the rest."],
                        ["`algolia-search-implementation`", "Guided end-to-end build for new search, browse and autocomplete."],
                        ["`algolia-data-modeling`", "Records, variants, SKUs, indices, replicas, objectIDs."],
                        ["`algolia-index-configuration`", "Relevance, ranking, facets, synonyms, rules, merchandising."],
                        ["`algolia-events-insights`", "Click, conversion and purchase events; queryID and userToken."],
                        ["`algolia-instantsearch-ui`", "Build and review InstantSearch experiences."],
                        ["`algolia-autocomplete`", "Autocomplete, query suggestions, federated panels."],
                        ["`algolia-neuralsearch`", "NeuralSearch readiness, semantic query sets, rollout."],
                        ["`algolia-agent-studio`", "Agent Studio tools, guardrails, auth, tool security."],
                        ["`algolia-release-qa`", "Pre-release audit and evidence matrix. Works on existing builds."],
                        ["`algolia-ui-libraries`", "Living selector for current InstantSearch and mobile SDKs."],
                    ],
                )
                + "<h3>Five use-case bundles</h3>"
                + p(
                    "When the customer's project type is known, point them at a bundle instead. Each "
                    "ships a `BUNDLE.md` with the priority decisions and launch gates: **ecommerce "
                    "search**, **B2B catalog**, **marketplace**, **support knowledge base**, **AI "
                    "shopping assistant**."
                ),
            ),
        ],
        "More context",
    )
)

build(
    "index.html",
    "Algolia Implementation Skills — enablement kit",
    "How to position the skills to customers, and the quick start to send them.",
    "Enablement kit",
    "Put this in your customers' hands",
    "One customer-facing quick start, plus how each internal team positions it.",
    ["4 versions", "Copy written for you"],
    hub,
    back=False,
)

# ================================================================ CSM / CSA

CSM_PITCH = """Your Algolia instance is running. The question is whether it's configured to do what you're paying for.

Most of the levers that decide search quality are settings, not code — searchable attributes and their order, custom ranking, facets, synonyms, query rules, sort replicas, merchandising, no-results handling. They get set once during implementation and then nobody revisits them, because knowing which one to change requires knowing Algolia deeply.

Algolia's official skills fix that. Your team drops them into whatever AI tool they already use and it becomes able to audit and tune your configuration — tell you which settings are working against you, which capabilities on your plan aren't switched on, and what order to fix them in.

Free, MIT licensed, about ten minutes."""

CSM_EMAIL = """Subject: Tuning your Algolia config — ten minutes, free

Hi <name>,

Something worth ten minutes of your team's time, and there's nothing attached to it.

Most of what determines Algolia search quality is configuration rather than code — which attributes are searchable and in what order, custom ranking, facets, synonyms, query rules, sort replicas, merchandising. Those usually get set during the original implementation and then stay untouched, because knowing which dial to turn takes real Algolia depth.

Algolia has published a set of official AI skills that give your team that depth on demand. They install into whatever AI assistant your engineers already use, and it can then audit your configuration and tell you what's working against you, what capabilities on your plan aren't turned on, and what to fix first.

Free, MIT licensed, ten minutes: <link>

Happy to run it with your team on our next call.

<you>"""

CSM_INCALL = """Before we wrap — when did anyone last look at your Algolia configuration itself? Not the code, the settings: searchable attributes, ranking, facets, synonyms, rules.

[if "not since launch" — the common answer] That's worth an hour. Algolia published official AI skills that let your team's AI assistant audit the configuration and tell you which settings are working against you. Free, ten minutes to install. Want me to send it?

[if they have a search team] Then you'll probably find it useful as a second opinion — it produces an evidence-based config review your team can argue with."""

CSM_LIVE = """Audit our Algolia configuration and tell us what to optimize.

Go through our index settings: searchable attributes and their order, custom ranking and tie-breaking, facets and their display, synonyms, query rules and merchandising, sort replicas, typo tolerance, and no-results handling. For each one, tell us what's currently set, whether it's serving our use case, and what you'd change.

Then check which capabilities on our plan aren't configured at all — personalization, Dynamic Re-Ranking, Recommend, NeuralSearch, A/B testing — and what's blocking each.

Rank everything by impact against effort. For anything you can't verify without access to our account, say "not verified" rather than assuming."""

CSM_AUDIT_SELF = """Help me work out what's likely misconfigured in this customer's Algolia setup.

Context: <paste what you know — their use case, plan, what they've built, complaints they've raised, anything from the last QBR>

Walk through the configuration levers that usually go wrong: searchable attributes and their order, custom ranking, facets, synonyms, query rules and merchandising, sort replicas, typo tolerance, no-results handling. For each, tell me what a well-configured version looks like for their use case and what the likely gap is.

Then tell me which capabilities on their plan probably aren't switched on, and what typically blocks each. Ask me what you need to know, and mark clearly which conclusions need an SE to confirm before I raise them."""

csm = (
    flow(
        ("Position it", "Configuration they already own, never revisited."),
        ("Hand it over", "Send the quick start. Copy is written below."),
        ("Make it land", "Run the config audit on a call. Work the list."),
        [
            "Every index setting reviewed against their actual use case",
            "Capabilities on their plan that were never switched on",
            "Ranked by impact against effort",
            "A tuning list their engineers can act on this sprint",
        ],
    )
    + step(
        1,
        "Position it",
        "The frame is configuration, not implementation. Nothing to rebuild — dials to turn on what's already running.",
        prompt(
            CSM_PITCH,
            "Your reference version. Two sentences of it is plenty on a live call.",
            hero=True,
        )
        + "<h3>The optimization levers worth naming</h3>"
        + p(
            "These are settings, not code. Knowing which one is wrong is the hard part, and that's "
            "exactly what the skills supply."
        )
        + table(
            ["Setting", "What goes wrong", "Say it like this"],
            [
                ["**Searchable attributes and their order**", "Everything marked searchable, or ordered arbitrarily, so titles don't outrank descriptions.", "“Your search can't tell a product name from a footnote.”"],
                ["**Custom ranking**", "Left at default, so popularity, margin and stock never influence results.", "“Nothing tells Algolia which of two equally-matching products you'd rather sell.”"],
                ["**Facets**", "Never configured, or configured on fields nobody filters by.", "“Your customers can't narrow down, so they leave instead.”"],
                ["**Synonyms**", "Empty, so their industry's vocabulary returns nothing.", "“When someone searches your customers' words instead of yours, they get zero results.”"],
                ["**Query rules and merchandising**", "Unused, so campaigns and promotions can't be reflected in search.", "“Merchandising is happening everywhere except the place people actually look.”"],
                ["**Sort replicas**", "Missing, so there's no price-low-to-high that respects relevance.", "“Sorting and relevance are fighting each other.”"],
                ["**No-results handling**", "Dead end instead of a recovery path.", "“Every zero-result search is a customer you've lost silently.”"],
                ["**Events**", "Not sent, which gates personalization, Recommend, Dynamic Re-Ranking and NeuralSearch.", "“The AI features on your plan have nothing to learn from.”"],
            ],
        )
        + "<h3>What to lead with, by account</h3>"
        + table(
            ["If the account…", "Lead with"],
            [
                ["**Hasn't touched settings since launch**", "“Your config was tuned for the catalogue you had then, not the one you have now.”"],
                ["**Has flat or declining search conversion**", "“Before you rebuild anything, it's worth checking whether the ranking is actually expressing your priorities.”"],
                ["**Complains about result quality**", "“That's usually four or five settings, not a platform problem. This finds which ones.”"],
                ["**Pays for AI features they don't use**", "“Those need configuration and behavioural data. This maps what's missing and in what order.”"],
                ["**Has grown catalogue or entered a new market**", "“Config that worked at your old scale often stops working. Worth a re-tune.”"],
                ["**Is about to ask for a rebuild**", "“Let's rule out configuration first — it's days of work rather than a quarter.”"],
            ],
        )
        + note(
            md(
                "**Say:** “tune what you already own”, “configuration, not a rebuild”, “settings "
                "working against you”, “capabilities on your plan that aren't switched on”. "
                "**Don't say:** data contract, event taxonomy, indexing contract, lifecycle. That's "
                "builder vocabulary and it hands the conversation to someone else."
            )
        ),
    )
    + step(
        2,
        "Hand it over",
        "Send them the customer quick start — no internal language in it.",
        dlbtn("Open the customer quick start", "customer.html")
        + '<p class="cap">%s</p>'
        % md("Or send the library directly: [%s](%s)" % (SITE, SITE))
        + "<h3>Email</h3>"
        + prompt(CSM_EMAIL, "Replace `<link>` with the quick start URL. Put it in your own voice.")
        + "<h3>On a call</h3>"
        + prompt(CSM_INCALL)
        + "<h3>When to bring it up</h3>"
        + ul(
            [
                "**Any account that hasn't reviewed settings since go-live.** That's most of them.",
                "**Four to six weeks before a QBR**, so there's a tuning list to walk through.",
                "**When they raise result quality** — before it becomes a platform complaint.",
                "**When catalogue size, locales or markets have changed** since launch.",
                "**Before they ask for a rebuild.** Configuration is the cheaper answer and often the right one.",
                "**When they ask about personalization, Recommend or NeuralSearch** and you suspect the config and events aren't there.",
            ]
        ),
    )
    + step(
        3,
        "Make it land",
        "Sending a link rarely works alone. Run the config audit with them, live, and leave with a ranked list.",
        prompt(
            CSM_LIVE,
            "Written for **the customer** to paste in their own tool while you're both on the call. Note the “we” — it's their audit.",
            hero=True,
        )
        + "<h3>Then work the output with them</h3>"
        + ul(
            [
                "Ask which finding **surprised them**. That's your real agenda item.",
                "Push for the **top three by impact-over-effort**. A list of twenty gets ignored.",
                "Anything marked **“not verified”** is your specific, warm reason to bring in an SE.",
                "If **events are the blocker**, that's the QBR headline: every AI feature on their plan is inert until it's fixed.",
                "Get **an owner and a date** for the top item before the call ends.",
                "Ask whether they've **ever run an A/B test** on a config change. Usually not — and that's how the next one gets proven.",
            ]
        ),
    )
    + moreband(
        [
            details(
                "Objections you'll hear",
                table(
                    ["They say", "You say"],
                    [
                        ["“We don't have engineering time for this.”", "“Most of these are settings changes, not code. The audit is ten minutes and tells you which three are worth an afternoon.”"],
                        ["“Is this an official Algolia product?”", "“Yes — it's in Algolia's official skills repo, built and used by our own engineers. Open source and MIT licensed, so your team can read every line before installing it.”"],
                        ["“We already tuned it at launch.”", "“Right — for the catalogue and traffic you had then. Config that fit two years ago usually doesn't fit now.”"],
                        ["“Our search is fine.”", "“Might well be. Ten minutes either confirms that or finds something. Both are useful to know.”"],
                        ["“Won't changing settings break things?”", "“That's why the audit ranks by effort and risk, and why we'd A/B test anything meaningful. Nothing changes just from running it.”"],
                        ["“Isn't this you selling us more Algolia?”", "“It's free and it's mostly about switching on what you already pay for. If it finds nothing, that's a good result.”"],
                    ],
                ),
            ),
            details(
                "When not to recommend it",
                ul(
                    [
                        "**The relationship is strained over reliability or billing.** Fix that first; a tool recommendation reads as deflection.",
                        "**Nobody on their side uses an AI coding assistant.** The value is conditional on that.",
                        "**They have a mature search team with their own tuning practice.** Offer it as a second opinion, not as guidance.",
                        "**Mid-escalation.** Wait.",
                        "**They expect it to change settings for them.** It produces recommendations and touches nothing unless their team connects the MCP or CLI. Be clear or you'll create a false expectation.",
                    ]
                ),
            ),
            details(
                "Prep your own view before a QBR",
                p(
                    "Useful when you want a hypothesis before the customer has one. Install "
                    "`algolia-discovery-planning.zip`, `algolia-index-configuration.zip` and "
                    "`algolia-release-qa.zip` — the [customer quick start](customer.html) has the "
                    "install steps, they're identical."
                )
                + prompt(CSM_AUDIT_SELF)
                + note(
                    md(
                        "**This is a hypothesis, not a finding.** Without account access the agent is "
                        "reasoning from what you told it. Validate anything technical with an SE "
                        "before the customer hears it."
                    )
                ),
            ),
            details(
                "Guardrails",
                ul(
                    [
                        "**It's official** — the skills live in Algolia's official `algolia/skills` repo and our own engineers use them. No need to hedge. Open source and MIT licensed, so their team can read every line.",
                        "**Never paste customer credentials, API keys or exported records** into a chat. Live account access is an SE with `algolia-mcp` — not a copy-paste.",
                        "**Recommendations aren't changes.** Nothing touches their configuration unless their team wires up the MCP or CLI themselves.",
                        "**Don't promise a result from a settings change.** Anything meaningful should be A/B tested, and that's their call.",
                        "**Loop in the SE before the second technical conversation.** The audit opens the door; the tuning is theirs.",
                    ]
                ),
            ),
        ]
    )
)

build(
    "csm.html",
    "Positioning the Implementation Skills — for CSMs and CSAs",
    "How to position the skills as Algolia configuration and optimization, not implementation.",
    "For CSMs &amp; CSAs",
    "Optimize the Algolia they already own",
    "Position it as configuration and tuning, send the quick start, run the audit on a call.",
    ["Config &amp; optimization angle", "Copy written for you"],
    csm,
)

# ================================================================ TECHNICAL

TECH_PITCH = """Your team's AI assistant can write InstantSearch faster than either of us. What it can't do is know that grouping variants the wrong way will cost you a re-index, or that dropping queryID breaks attribution silently rather than loudly.

These are eleven open-source skills that give it that judgment. They're procedural, not magic: the agent maps the request across the lifecycle, locks the data contract and event taxonomy before any UI exists, records assumptions with owners instead of inventing answers, and won't mark a phase done without validation evidence.

Every live account operation routes to the official Algolia MCP and CLI. The skills don't touch your data — they decide what to ask and in what order.

MIT licensed. Read every line before you install it."""

TECH_STANDING = """For any non-trivial Algolia work, start with algolia-discovery-planning even if the task looks already scoped or names one feature. Enumerate the in-scope phases up front and state which skill owns each and in what order. Load each in-scope skill for its phase and apply it — don't stop at the first matching skill, and don't substitute your own knowledge for a skill that applies. If you deliberately skip a phase, say so and why. Report which skills ran and what each changed."""

TECH_DEMO = """Use the Algolia Discovery Planning skill to scope this before implementing anything.

Context: <the thing the customer's team actually wants to build next>

Map the request across the whole lifecycle and tell us which phases are in scope and in what order. Then work through them — lock the data contract and event taxonomy before any UI exists. Where a decision is provisional, keep moving but record the assumption, the owner, the risk, and the validation follow-up.

Produce the indexing contract, the event taxonomy, and the release QA plan as artifacts."""

TECH_TEAM_EVENTS = """Use the Algolia Events & Insights skill to design the smallest event setup that would make our analytics trustworthy.

Start from what we already send, not a blank slate. We need the userToken strategy, the click and conversion taxonomy, where queryID / objectID / position / index must be preserved through the funnel, who owns each emission point, deduplication, and how each event gets validated end to end.

Flag every place our current setup would silently attribute to the wrong query or drop a queryID."""

TECH_TEAM_QA = """Use the Algolia Release QA skill to audit this before we ship and produce an evidence matrix.

For every check: what you verified, how, the evidence, and whether it passes, fails, or can't be determined. Do not mark anything as passing because the code looks right — say "not verified" instead.

Then rank the failures by blast radius: what breaks for users, what silently corrupts analytics, and what blocks an AI feature we already pay for."""

tech = (
    flow(
        ("Position it", "Engineer-credible framing. No magic claims."),
        ("Install in their environment", "Committed to their repo, not your laptop."),
        ("Hand over", "One live prompt, then leave the artifacts behind."),
        [
            "Their repo carries the skills and the standing rule",
            "Their agent asks before it builds, for every engineer",
            "MCP scoped to a non-production app",
            "Artifacts in their tickets, not your chat history",
        ],
    )
    + step(
        1,
        "Position it to their engineers",
        "Engineers reject tools that overclaim. Lead with the boundaries, not the benefits.",
        prompt(
            TECH_PITCH,
            "Your reference framing. The last line matters — inviting audit is what earns trust here.",
            hero=True,
        )
        + "<h3>Why engineers accept it</h3>"
        + ul(
            [
                "**It's procedural, not predictive.** It changes what the agent asks and in what order — nothing hidden.",
                "**It has explicit boundaries.** Each skill carries `do NOT use for X` and routes live operations to the official CLI and MCP.",
                "**It's readable.** Eleven `SKILL.md` files, MIT licensed, no build step, no telemetry.",
                "**It's removable.** Delete the folder and their setup is exactly as before.",
                "**It produces artifacts they'd have had to write anyway** — indexing contract, event taxonomy, QA matrix.",
            ]
        )
        + "<h3>What to emphasise, by engagement</h3>"
        + table(
            ["Engagement", "Emphasise"],
            [
                ["**Greenfield build**", "Phase ordering. Data and events before UI is the difference between a launch and a re-index."],
                ["**Migration or replatform**", "The indexing contract as a written artifact both sides can review before anything moves."],
                ["**Underperforming search**", "Release QA against what exists, and honest “not verified” rather than a clean bill of health."],
                ["**AI feature rollout**", "Event readiness as a hard gate. NeuralSearch and personalization can't learn from data that isn't there."],
                ["**Support-driven cleanup**", "The evidence matrix — something they can attach to a ticket instead of arguing about."],
            ],
        ),
    )
    + step(
        2,
        "Install it in their environment",
        "Commit it into their repo so every engineer and every agent session gets it. Don't leave it on your laptop.",
        term(
            [
                "# in the customer's repo — .agents/skills covers most tools at once",
                "$ unzip algolia-skills-library.zip -d /tmp/alg",
                "$ mkdir -p .agents/skills && cp -R /tmp/alg/algolia-* .agents/skills/",
                "",
                "# Claude Code doesn't read .agents/skills — add a copy",
                "$ mkdir -p .claude/skills && cp -R /tmp/alg/algolia-* .claude/skills/",
                "",
                "$ git add .agents/skills .claude/skills && git commit -m 'Add Algolia implementation skills'",
            ],
            cap="Committing them means the skills are versioned with the code and survive your engagement ending.",
        )
        + "<h3>Add the standing rule to their AGENTS.md</h3>"
        + p(
            "Each skill carries tight `do NOT use for X` boundaries so they don't collide. That "
            "raises precision but lowers recall — left alone, a model fires one skill and misses "
            "the rest of the suite. This backstops it:"
        )
        + prompt(TECH_STANDING, "Paste into `AGENTS.md` at their repo root, or `CLAUDE.md` for Claude Code. Both are read automatically.")
        + "<h3>Scope MCP to a non-production app</h3>"
        + term(["$ claude mcp add --transport http algolia https://mcp.algolia.com/mcp"])
        + note(
            md(
                "**Do this with their credentials, on their machine, pointed at a non-production "
                "app.** These skills make an agent cautious, but an agent with write access to a "
                "production index is still an agent with write access to a production index."
            )
        )
        + "<h3>Their team's tool</h3>"
        + p("Pick whatever they actually use — the install target differs.")
        + tool_tabs(DEVTOOLS, "tech")
        + note(VERIFY, "ok"),
    )
    + step(
        3,
        "Hand over with one live prompt",
        "The demo is the handover. Watching it ask questions instead of guessing is what converts a sceptic.",
        prompt(
            TECH_DEMO,
            "Run this **with their team**, on their next real piece of work — not a toy example.",
            hero=True,
        )
        + "<h3>Leave behind</h3>"
        + ul(
            [
                "The [customer quick start](customer.html) so new joiners can self-serve.",
                "The **artifacts from the demo** — indexing contract, event taxonomy, QA plan — in their tracker, not in a chat log.",
                "**Who owns each open assumption**, written down.",
                "A named person on their side who'll keep the standing rule in `AGENTS.md` when it gets refactored.",
            ]
        ),
    )
    + moreband(
        [
            details(
                "Prompts to leave with their team",
                "<h3>Fix the event foundation</h3>"
                + prompt(TECH_TEAM_EVENTS, "The highest-leverage one. Broken attribution silently invalidates everything downstream.")
                + "<h3>Pre-release QA</h3>"
                + prompt(TECH_TEAM_QA),
            ),
            details(
                "What good output looks like",
                p("Tell them what to expect, so they can tell when it's misfiring.")
                + ul(
                    [
                        "**Phases enumerated up front**, with which skill owns each. Greenfield should run data modeling → index configuration → UI → events → release QA.",
                        "**“Not verified” used honestly.** An audit that passes everything without account access is describing the code, not reality.",
                        "**Assumptions carry an owner and a validation step**, not just a caveat.",
                        "**Artifacts, not prose.**",
                        "**Skipped phases stated with a reason.** Silence means it forgot — re-prompt naming the skill.",
                    ]
                ),
            ),
            details(
                "Troubleshooting their setup",
                table(
                    ["Symptom", "Fix"],
                    TROUBLE
                    + [
                        ["`npx skills add` didn't work in Claude Code", "It writes to `~/.agents/skills/`, which Claude Code doesn't read. Copy to `~/.claude/skills/` or use `/plugin marketplace add`."],
                        ["Codex can't find them after older docs", "`.agents/skills/` is the documented location now; `~/.codex/skills/` still loads too."],
                        ["Skill loads but references are ignored", "In Copilot, `references/` files only load if a relative Markdown link in `SKILL.md` points at them."],
                        ["New skills dir not picked up mid-session", "Claude Code needs a restart if you create a top-level `.claude/skills/` that didn't exist at session start."],
                        ["Works for you, not for their team", "You installed to a personal dir. Commit to the repo instead."],
                    ],
                ),
            ),
            details(
                "When not to recommend it",
                ul(
                    [
                        "**They have a mature search team with their own standards.** Offer it as a peer artifact to compare against, not as guidance.",
                        "**Nobody uses an AI assistant.** The value is entirely conditional on that.",
                        "**They want a guarantee.** It improves the odds and produces evidence; it doesn't certify anything.",
                        "**Their agent has production write access and no review process.** Fix that first.",
                        "**Mid-incident.** Wait.",
                    ]
                ),
            ),
            details(
                "Using it for your own work",
                p(
                    "Same install, your own machine — see the [customer quick start](customer.html). "
                    "The prompts above work unchanged; swap “we” and “our” for the customer's name."
                ),
            ),
        ]
    )
)

build(
    "technical.html",
    "Positioning the Implementation Skills — for SEs, support and ICs",
    "How to position the skills in an engagement, install them in the customer's environment, and hand over.",
    "For SEs, support &amp; implementation consultants",
    "Set your customers up so it sticks",
    "Position it to their engineers, commit it to their repo, hand over with a live demo.",
    ["Engineer-credible framing", "7 tools covered"],
    tech,
)

# ================================================================ AE

AE_PITCH = """Most Algolia customers use a fraction of what they're paying for — and it's rarely because the product fell short. It's because the setup skipped a step that's invisible until it matters. No click tracking means the analytics can't be trusted, and every AI feature on the contract has nothing to learn from.

Our team open-sourced a set of AI skills that fix that from the inside. A customer's engineering team drops them into whatever AI assistant they already use, and it starts behaving like a senior Algolia implementation consultant — asking the right setup questions instead of guessing.

Free, MIT licensed, nothing to sign, about ten minutes."""

AE_EMAIL = """Subject: Not a pitch — free tool your team might want

Hi <name>,

Sending this because it's useful, not because it's attached to anything.

Your engineers almost certainly use an AI coding assistant. Those tools are quick, but on search work they tend to skip the unglamorous parts — click tracking, facets, launch checks — which is exactly what determines whether your analytics can be trusted and whether AI features have anything to learn from.

Our team open-sourced a set of skills that fix that. Your team adds them to the assistant they already use, and it starts asking the right setup questions instead of guessing.

MIT licensed, ten minutes, nothing to sign: <link>

If it turns up something worth talking about, happy to bring our solutions engineer into a conversation.

<you>"""

AE_LINKEDIN = """Every AI coding tool can build a search box in about a minute.

Almost none of them set up click tracking, facets, or a launch check — so the analytics can't be trusted, and any AI features sitting on top have nothing to learn from.

Our team open-sourced eleven skills that fix that from the inside. Drop them into whatever AI assistant your team already uses and it starts behaving like a senior implementation consultant instead: right questions first, data and events before UI, no "done" without evidence.

MIT licensed, free, about ten minutes to install."""

AE_PREP = """I have a call with an Algolia customer and I want to ask better questions than "how's search going?"

What I know: <paste account context — industry, what they bought, what they've told you>

Give me eight to ten questions that would reveal whether they're actually getting value from what they own. For each one, tell me what a concerning answer sounds like and what it would mean.

Plain business language — I'm not technical and neither is my main contact. Mark which answers should trigger me bringing in a solutions engineer."""

ae = (
    flow(
        ("Position it", "Money already spent that isn't working."),
        ("Send it", "Email, LinkedIn or in-call. Copy written below."),
        ("Open the conversation", "What to ask once they've run it."),
        [
            "A free, credible reason to be in touch",
            "Their own evidence instead of your deck",
            "“You're blocked on events” — a fix, not an upsell",
            "A warm, specific reason to bring in an SE",
        ],
    )
    + step(
        1,
        "Position it",
        "The frame is money they've already spent that isn't working. Never a new purchase.",
        prompt(CSM_PITCH if False else AE_PITCH, "Your reference version. Two sentences of it is plenty on a call.", hero=True)
        + note(
            md(
                "**Say:** “unlock what you already own”, “analytics you can trust”, “readiness for the "
                "AI features on your contract”. **Don't say:** lifecycle, data contract, indexing "
                "contract, event taxonomy. That's builder language and it hands the conversation to "
                "someone else."
            )
        ),
    )
    + step(
        2,
        "Send it",
        "Send the customer quick start — never this page.",
        dlbtn("Open the customer quick start", "customer.html")
        + '<p class="cap">%s</p>' % md("Or the library directly: [%s](%s)" % (SITE, SITE))
        + "<h3>Email</h3>"
        + prompt(AE_EMAIL, "Replace `<link>`. Put it in your own voice — this reads too clean as-is.")
        + "<h3>LinkedIn or social</h3>"
        + prompt(AE_LINKEDIN)
        + "<h3>When to send it</h3>"
        + ul(
            [
                "**After a discovery call** where search came up but nothing concrete landed.",
                "**When a prospect is evaluating** and you want a reason to be useful before there's a contract.",
                "**When an existing customer mentions a redesign or replatform** — before the build starts.",
                "**When AI features come up** and you suspect the data foundations aren't there.",
                "**As a re-engagement reason** on a quiet account. It's free, so it doesn't read as a chase.",
            ]
        ),
    )
    + step(
        3,
        "Open the conversation",
        "The point isn't the tool. It's what they find when they run it.",
        card(
            p(
                "**The line that does the work:** “you're paying for AI features that have nothing "
                "to learn from, because the click data was never wired up.” Personalization, "
                "Recommend, Dynamic Re-Ranking and NeuralSearch all need behavioural signals. "
                "Without events they're inert — and that's a fix, not a purchase."
            )
        )
        + "<h3>What to ask after they've tried it</h3>"
        + ul(
            [
                "“**What did it flag that surprised you?**” — the honest opener.",
                "“**Did it say anything was ‘not verified’?**” — that's your reason to offer an SE, specifically rather than generically.",
                "“**Who owns fixing the first one?**” — tells you whether anything will actually happen.",
                "“**What would it be worth to have analytics you trusted?**” — moves it to value without pitching.",
            ]
        )
        + note(
            md(
                "**The moment it gets technical, bring in an SE.** “Let me get our solutions "
                "engineer to confirm what's involved” is a stronger move than a technical answer you "
                "can't defend."
            )
        ),
    )
    + moreband(
        [
            details(
                "Objections you'll hear",
                table(
                    ["They say", "You say"],
                    [
                        ["“Is this an official Algolia product?”", "“Yes — it's in Algolia's official skills repo and our own engineers use it. Open source, MIT licensed, nothing hidden.”"],
                        ["“What's the catch?”", "“None. It's MIT licensed and public. It makes our product work better for you, which is enough of a reason for us.”"],
                        ["“We don't have engineering time.”", "“It's ten minutes of setup, not a project. And it makes the engineering time you already spend land properly.”"],
                        ["“We tried AI tools for this and it went badly.”", "“That's the problem this addresses. Left alone those tools skip events and facets. This makes them ask first.”"],
                        ["“Isn't this just you selling us more Algolia?”", "“If it finds you're already getting everything you pay for, that's a good result. Mostly it finds something that's free to fix.”"],
                    ],
                ),
            ),
            details(
                "Guardrails",
                ul(
                    [
                        "**It is official** — it lives in Algolia's official `algolia/skills` repo. Say so. It's also open source and MIT licensed, which is what makes it easy to hand over.",
                        "**Never put customer data, credentials or exported records into a chat.** Account context in your own words is fine.",
                        "**Don't make technical claims you can't defend.** Bring the SE in.",
                        "**Don't promise outcomes.** It produces a plan; their engineers execute it.",
                        "**Be clear it doesn't touch their account** unless their team connects it themselves. Getting this wrong creates a security question you don't want.",
                    ]
                ),
            ),
            details(
                "Prep a call with it yourself",
                p(
                    "Install `algolia-discovery-planning.zip` — the [customer quick start](customer.html) "
                    "has the steps, they're the same."
                )
                + prompt(AE_PREP)
                + note(md("Treat any confident technical claim as something to verify with an SE, not to repeat.")),
            ),
        ]
    )
)

build(
    "ae.html",
    "Positioning the Implementation Skills — for Account Executives",
    "What it is in business terms, when to send it, and the conversation it opens.",
    "For Account Executives",
    "Give it to customers and prospects",
    "A free, credible reason to be useful — and the conversation it opens.",
    ["Copy written for you", "Objection handling"],
    ae,
)

# ================================================================ CUSTOMER

CUST_START = """Use the Algolia Discovery Planning skill to help me choose the right implementation path.

Ask me only the questions you need to understand my goal, my data, my search UI, my events, and my launch risk. Assume I may not know which technical details matter yet.

Then recommend the next Algolia skill to use, the smallest useful first milestone, and the validation artifact I should create."""

CUST_BUILD = """Use the Algolia Search Implementation skill to build this search experience with clear decision points for the data contract, event taxonomy, index configuration, UI implementation, and release QA.

If any decision is provisional or deferred, keep moving — but document the assumption, the owner, the risk, and the validation follow-up in the completion summary."""

CUST_AUDIT = """Audit our current Algolia implementation.

Tell me which capabilities we're paying for but not using, what's blocking each one, and the fastest path to unlock them. For anything you can't verify without access to our account, say "not verified" rather than assuming."""

BUNDLES = [
    ("Ecommerce search", "Product and variant records, event attribution, relevance and merchandising, autocomplete.",
     "Use the Algolia skills library to plan an ecommerce search experience. Start with product and variant records, then define event attribution, relevance and merchandising, search and autocomplete UX, NeuralSearch readiness, and launch QA. Preserve assumptions, owners, validation evidence, and rollback decisions."),
    ("B2B catalog", "Account, region and entitlement boundaries, price lists, secured filtering, part numbers.",
     "Use the Algolia skills library to plan a B2B catalog search experience. Begin with account, region, permission, price-list, and availability boundaries. Then define event ownership, relevance, UI behavior, secured filtering, and launch QA without exposing restricted records or commercial terms."),
    ("Marketplace", "Product / offer / seller identity, seller fairness, sponsored placement, duplicate listings.",
     "Use the Algolia skills library to plan a marketplace search experience. Start with product, offer, seller, region, inventory, and permission identity. Then define ranking and seller-policy boundaries, event attribution, search and autocomplete UX, AI readiness, and launch QA. Make marketplace-specific tradeoffs explicit."),
    ("Support knowledge base", "Article structure and chunking, freshness, permissions, deflection, citations, escalation.",
     "Use the Algolia skills library to plan a support knowledge-base experience. Start with article structure, hierarchy, permissions, freshness, and chunking. Then define query and deflection events, search and autocomplete UX, NeuralSearch and Agent Studio readiness, escalation, and launch QA."),
    ("AI shopping assistant", "Agent Studio contract, tool allowlist, grounding, guardrails, cost controls, rollout.",
     "Use the Algolia skills library to plan an AI shopping assistant. Begin with product and variant data, search quality, permissions, and event readiness. Then define the Agent Studio contract, approved tools and actions, NeuralSearch evaluation, feedback, guardrails, escalation, cost controls, and limited-rollout QA."),
]

cust = (
    flow(
        ("Download", "One ZIP."),
        ("Load", "Upload it, or copy a folder into your project."),
        ("Ask", "Paste one prompt. It asks you questions first."),
        [
            "Asks about your catalog, events and launch risk before coding",
            "Produces an indexing contract and event taxonomy",
            "Records every assumption with an owner",
            "Won't call a launch done without QA evidence",
        ],
    )
    + step(
        1,
        "Download the skills",
        "Not sure which you need? Take the full library — the discovery skill works the rest out.",
        dlbtn("Download the full library")
        + '<p class="cap">%s</p>'
        % md("`algolia-skills-library.zip` — all eleven skills. Individual skills are on the same page if you only have one thing to fix.")
        + details(
            "Already know your project type? Take a bundle instead",
            p("Each bundle includes a `BUNDLE.md` with the priority decisions, required outputs and launch gates for that scenario — plus the start prompt below, written for it.")
            + "".join(card("<h4>%s</h4>" % esc(n) + p(d) + prompt(sp)) for n, d, sp in BUNDLES),
        ),
    )
    + step(
        2,
        "Load them into your AI tool",
        "These follow the open [Agent Skills spec](https://agentskills.io/specification). If your tool isn't listed, `.agents/skills/<name>/SKILL.md` in your project usually just works.",
        tool_tabs(ALLTOOLS, "cust") + note(VERIFY, "ok"),
    )
    + step(
        3,
        "Paste this prompt",
        "Expect questions back before you get an answer. A good plan needs to know your catalog, what you measure, and your launch risk.",
        prompt(CUST_START, hero=True),
    )
    + moreband(
        [
            details(
                "Two more prompts",
                "<h3>Building something new</h3>" + prompt(CUST_BUILD)
                + "<h3>Improving what you have</h3>" + prompt(CUST_AUDIT),
            ),
            details(
                "What good output looks like",
                ul(
                    [
                        "It **asks before it builds**. If it writes code immediately, the skill didn't load.",
                        "It **names the phases** and the order: data → events → index configuration → UI → QA.",
                        "It gives you **artifacts** — indexing contract, event taxonomy, QA plan — not just an explanation.",
                        "It says **“not verified”** rather than assuming, when it can't see your account.",
                        "It records **assumptions with an owner**.",
                    ]
                ),
            ),
            details(
                "Add the official Algolia tools",
                p("These skills are a workflow layer and deliberately don't touch your account. For live data and index operations, add the official tooling.")
                + table(
                    ["Tool", "For", "Install"],
                    [
                        ["**Algolia MCP**", "Live analytics, index inspection, account-aware review.", "`claude mcp add --transport http algolia https://mcp.algolia.com/mcp`"],
                        ["**Algolia CLI**", "Indices, settings, rules, synonyms, records.", "`brew install algolia`"],
                        ["**Official Algolia skills**", "Official MCP, CLI and InstantSearch workflows.", "`npx skills add https://github.com/algolia/skills`"],
                    ],
                )
                + note(md("**Point MCP at a non-production app while you explore.** These skills make an agent cautious, but an agent with write access to a production index is still an agent with write access to a production index."))
                + p("[Build with AI guide](https://www.algolia.com/doc/guides/get-started/build-with-ai/) · [github.com/algolia/skills](https://github.com/algolia/skills)"),
            ),
            details("If something doesn't work", table(["Symptom", "Fix"], TROUBLE)),
        ]
    )
)

build(
    "customer.html",
    "Get started with the Algolia Implementation Skills",
    "Download a ZIP, load it into your AI tool, paste one prompt.",
    "Quick start",
    "Give your AI tool a senior Algolia implementer",
    "Eleven free skills that stop your AI tool shipping a search box with no events, no facets and no launch plan.",
    ["Free · MIT licensed", "~10 minutes"],
    cust,
    back=False,
)

if EXTERNAL_JS:
    kp = os.path.join(OUT, "kit.js")
    with open(kp, "w", encoding="utf-8") as f:
        f.write(JS.strip() + "\n")
    print("wrote %s (%.1f KB)" % (kp, len(JS) / 1024))

print("done")

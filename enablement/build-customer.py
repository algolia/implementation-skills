#!/usr/bin/env python3
"""Customer quick start — what to do, how, and when.

Emits two files from one source:
  index.html  standalone page (own header + page background) for /start/
  embed.html  headerless, transparent, for embedding inside the skills site
"""

import html
import os
import re
import sys

OUT = sys.argv[1] if len(sys.argv) > 1 else "."
LIB = "https://community.algolia.com/implementation-skills/"
DL = LIB + "#catalog"

CSS = r"""
*,*::before,*::after{box-sizing:border-box}
:root{
  color-scheme:light;
  --blue:#0052ff; --blue-2:#256bff; --cyan:#00a2ff;
  --navy:#0b1526; --navy-2:#122a5c;
  --text:#0b1526; --muted:#54637d; --soft:#1d2b44;
  --bg:#f5f8ff; --card:#fff;
  --border:rgba(20,48,92,.15); --divider:rgba(20,48,92,.10);
  --ok-text:#08733f; --ok-bg:rgba(17,166,82,.10); --ok-border:rgba(17,166,82,.24);
  --warn-bg:#fff7e8; --warn-border:#f0d9a8; --warn-text:#7a5410;
  --ease:cubic-bezier(.22,.61,.36,1);
  --mono:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
}
.alg{color:var(--text);font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,
  "Segoe UI",sans-serif;font-size:16px;line-height:1.55;-webkit-font-smoothing:antialiased}
.alg *{font-family:inherit}
.wrap{max-width:900px;margin:0 auto;padding:0 26px}
.alg a{color:var(--blue);text-decoration:none}
.alg a:hover{text-decoration:underline}
.alg p{margin:0 0 11px}
.alg ul{margin:0 0 11px;padding-left:20px}
.alg li{margin:4px 0}
.alg code{font-family:var(--mono);font-size:.87em;background:rgba(2,10,24,.06);
  padding:2px 6px;border-radius:5px;color:#123a80}

/* header (standalone only) */
header.top{background:radial-gradient(circle at 90% 6%,rgba(0,162,255,.28),transparent 44%),
  linear-gradient(135deg,var(--navy),var(--navy-2));color:#fff;padding:32px 0 30px}
header.top .eyebrow{margin:0 0 9px;font-size:11.5px;font-weight:700;letter-spacing:.11em;
  text-transform:uppercase;color:#7fb4ff}
header.top h1{margin:0 0 10px;font-size:32px;line-height:1.14;font-weight:800;letter-spacing:-.015em}
header.top p{margin:0;color:#a8c0e8;font-size:16.5px;max-width:58ch}
header.top .chips{margin:17px 0 0;display:flex;flex-wrap:wrap;gap:7px}
header.top .chips span{font-size:12px;font-weight:600;padding:4px 12px;border-radius:999px;
  background:rgba(255,255,255,.11);border:1px solid rgba(255,255,255,.18);color:#dce9ff}

/* promise */
.promise{margin:0 0 6px;font-size:24px;font-weight:800;letter-spacing:-.015em;line-height:1.3}
.promise em{font-style:normal;color:var(--blue)}
.psub{margin:0 0 18px;color:var(--muted);font-size:16px;max-width:62ch}

/* animated flow */
.flow{background:linear-gradient(135deg,var(--navy),var(--navy-2));border-radius:18px;
  padding:26px;box-shadow:0 20px 60px rgba(21,56,117,.15)}
.rail{display:grid;grid-template-columns:1fr auto 1fr auto 1fr;align-items:stretch;gap:12px}
@media(max-width:760px){.rail{grid-template-columns:1fr;gap:14px}.arrow{display:none}}
.fstep{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.14);border-radius:14px;
  padding:17px 18px;position:relative;animation:glow 9s var(--ease) infinite}
.fstep:nth-child(1){animation-delay:0s}
.fstep:nth-child(3){animation-delay:3s}
.fstep:nth-child(5){animation-delay:6s}
@keyframes glow{
  0%,4%{background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.14);transform:translateY(0)}
  8%,30%{background:rgba(0,82,255,.30);border-color:var(--cyan);transform:translateY(-4px)}
  36%,100%{background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.14);transform:translateY(0)}}
.fstep .n{display:block;font-family:var(--mono);font-size:11px;font-weight:800;letter-spacing:.07em;
  color:#7fb4ff;margin-bottom:8px}
.fstep .t{display:block;color:#fff;font-weight:700;font-size:17px;margin-bottom:4px}
.fstep .d{display:block;color:#a8c0e8;font-size:13.5px;line-height:1.5}
.fstep .ico{position:absolute;top:15px;right:16px;opacity:.5}
.arrow{align-self:center;color:#4a6ba8}
.arrow svg{display:block}
.arrow.a1{animation:dash 9s linear infinite;animation-delay:1.6s}
.arrow.a2{animation:dash 9s linear infinite;animation-delay:4.6s}
@keyframes dash{0%,10%{color:#4a6ba8}14%,26%{color:var(--cyan)}30%,100%{color:#4a6ba8}}
.time{margin:16px 0 0;font-size:13px;color:#7fb4ff;text-align:center}
@media(prefers-reduced-motion:reduce){
  .fstep,.arrow.a1,.arrow.a2{animation:none!important}
  .fstep{background:rgba(0,82,255,.16);border-color:rgba(255,255,255,.22)}}

/* numbered steps */
h2.sh{margin:40px 0 6px;font-size:22px;font-weight:800;letter-spacing:-.01em;
  display:flex;align-items:center;gap:12px}
h2.sh .num{flex:0 0 auto;display:grid;place-items:center;width:32px;height:32px;border-radius:10px;
  background:linear-gradient(160deg,var(--blue),var(--blue-2));color:#fff;font-size:15px;font-weight:800}
.snote{margin:0 0 14px;color:var(--muted);font-size:15px;padding-left:44px}
@media(max-width:600px){.snote{padding-left:0}}
h3{margin:22px 0 8px;font-size:14.5px;font-weight:700;color:var(--blue)}
h2.plain{margin:44px 0 6px;font-size:22px;font-weight:800;letter-spacing:-.01em}

.card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:18px 20px;
  margin:12px 0;box-shadow:0 2px 10px rgba(21,56,117,.06)}
.card>:last-child{margin-bottom:0}

/* download button */
a.btn{display:inline-flex;align-items:center;gap:9px;
  background:linear-gradient(160deg,var(--blue),var(--blue-2));color:#fff;font-weight:700;
  font-size:15.5px;padding:14px 24px;border-radius:12px;box-shadow:0 14px 32px rgba(0,82,255,.26);
  transition:transform .16s var(--ease),box-shadow .16s var(--ease)}
a.btn:hover{text-decoration:none;transform:translateY(-2px);box-shadow:0 18px 40px rgba(0,82,255,.34)}
.cap{margin:11px 0 0;font-size:13px;color:var(--muted)}

/* when-to-use grid */
.when{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:13px;margin:14px 0}
@media(max-width:820px){.when{grid-template-columns:1fr}}
.wc{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:17px 18px;
  box-shadow:0 2px 10px rgba(21,56,117,.06)}
.wc .wt{display:block;font-size:15px;font-weight:700;margin-bottom:6px;letter-spacing:-.005em}
.wc .wd{display:block;font-size:13.5px;color:var(--muted);line-height:1.5;margin-bottom:9px}
.wc .ws{display:inline-block;font-family:var(--mono);font-size:11.5px;font-weight:600;
  background:rgba(0,82,255,.08);color:#0b58d8;border:1px solid rgba(0,82,255,.2);
  border-radius:6px;padding:3px 8px;word-break:break-all}

/* tabs */
.tabs{margin:14px 0}
.tabbar{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 -1px}
.tabbar button{font-family:inherit;font-size:13px;font-weight:600;cursor:pointer;padding:8px 14px;
  border-radius:10px 10px 0 0;border:1px solid var(--border);border-bottom-color:transparent;
  background:rgba(255,255,255,.65);color:var(--soft);transition:background .15s var(--ease)}
.tabbar button:hover{background:#fff}
.tabbar button[aria-selected="true"]{background:var(--blue);border-color:var(--blue);color:#fff}
.panels{background:var(--card);border:1px solid var(--border);border-radius:0 14px 14px 14px;
  padding:18px 20px;box-shadow:0 2px 10px rgba(21,56,117,.06)}
[role="tabpanel"]{display:none}
[role="tabpanel"].on{display:block}
[role="tabpanel"]>:first-child{margin-top:0}
[role="tabpanel"]>:last-child{margin-bottom:0}
ol.mini{list-style:none;padding:0;margin:0;counter-reset:m}
ol.mini>li{counter-increment:m;position:relative;padding:0 0 11px 34px;margin:0}
ol.mini>li:last-child{padding-bottom:0}
ol.mini>li::before{content:counter(m);position:absolute;left:0;top:1px;width:22px;height:22px;
  border-radius:7px;display:grid;place-items:center;background:rgba(0,82,255,.08);
  border:1px solid rgba(0,82,255,.22);color:var(--blue);font-size:11.5px;font-weight:800}

/* prompt / code */
.block{position:relative;margin:12px 0}
.block .copy{position:absolute;top:9px;right:9px;z-index:2;border:1px solid var(--border);
  background:#fff;color:var(--blue);font-family:inherit;font-weight:700;font-size:11.5px;
  padding:5px 11px;border-radius:7px;cursor:pointer;transition:background .15s var(--ease)}
.block .copy:hover{background:#eef3ff}
.block .copy.done{background:var(--ok-bg);border-color:var(--ok-border);color:var(--ok-text)}
.block pre.prompt{margin:0;background:var(--card);border:1px solid var(--border);
  border-left:4px solid var(--blue);border-radius:12px;padding:17px 96px 17px 18px;
  white-space:pre-wrap;font-family:inherit;font-size:14.5px;line-height:1.6;color:var(--soft);
  box-shadow:0 8px 28px rgba(0,82,255,.10)}
.block pre.term{margin:0;background:#050b18;border:1px solid #1b2c4d;border-radius:11px;
  padding:14px 92px 14px 16px;overflow-x:auto;font-family:var(--mono);font-size:12.5px;
  line-height:1.7;color:#cfe0ff}
.block pre.term .c{color:#6f87b8}
.block pre.term .p{color:#00c98a}
.block pre.term ~ .copy,.term+.copy{}
.term-wrap .copy{background:rgba(255,255,255,.07);border-color:#2a3f68;color:#8fc2ff}
.term-wrap .copy:hover{background:rgba(255,255,255,.14)}

.note{border-radius:12px;padding:13px 16px;margin:13px 0;font-size:13.5px;
  background:var(--warn-bg);border:1px solid var(--warn-border);color:var(--warn-text)}
.note.ok{background:var(--ok-bg);border-color:var(--ok-border);color:var(--ok-text)}
.note>:last-child{margin-bottom:0}
details.more{background:var(--card);border:1px solid var(--border);border-radius:12px;margin:12px 0}
details.more>summary{cursor:pointer;padding:14px 18px;font-weight:700;font-size:14.5px;
  list-style:none;display:flex;align-items:center;justify-content:space-between;gap:14px}
details.more>summary::-webkit-details-marker{display:none}
details.more>summary::after{content:"+";color:var(--blue);font-weight:800;font-size:19px;flex:0 0 auto}
details.more[open]>summary::after{content:"\2013"}
details.more[open]>summary{border-bottom:1px solid var(--divider)}
details.more .db{padding:16px 18px 18px}
details.more .db>:first-child{margin-top:0}
details.more .db>:last-child{margin-bottom:0}
footer.foot{border-top:1px solid var(--border);margin-top:44px;padding:22px 0 8px;
  font-size:13px;color:var(--muted)}
"""

JS = r"""
document.querySelectorAll('.alg .block .copy').forEach(function(b){
  b.addEventListener('click', function(){
    var pre = b.parentElement.querySelector('pre');
    if(!pre) return;
    var t = pre.innerText.replace(/ /g,' ');
    if(pre.classList.contains('term')){
      t = t.split('\n').map(function(l){ return l.replace(/^\s*\$\s/,''); }).join('\n');
    }
    t = t.trim();
    var lbl = b.textContent;
    var done = function(){
      b.textContent='Copied ✓'; b.classList.add('done');
      setTimeout(function(){ b.textContent=lbl; b.classList.remove('done'); },1700);
    };
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(t).then(done,function(){fb(t,done);});
    } else { fb(t,done); }
  });
});
function fb(t,cb){
  var a=document.createElement('textarea');
  a.value=t; a.setAttribute('readonly',''); a.style.position='fixed'; a.style.top='-1000px';
  document.body.appendChild(a); a.select();
  try{document.execCommand('copy');cb();}catch(e){}
  document.body.removeChild(a);
}
document.querySelectorAll('.alg .tabs').forEach(function(g){
  var bs=[].slice.call(g.querySelectorAll('.tabbar button'));
  var ps=[].slice.call(g.querySelectorAll('[role="tabpanel"]'));
  function show(i,f){
    bs.forEach(function(b,j){
      b.setAttribute('aria-selected', j===i?'true':'false');
      b.tabIndex = j===i?0:-1;
    });
    ps.forEach(function(p,j){ p.classList.toggle('on', j===i); });
    if(f) bs[i].focus();
    try{ localStorage.setItem('alg-tool', bs[i].dataset.tool); }catch(e){}
  }
  bs.forEach(function(b,i){
    b.addEventListener('click',function(){ show(i,false); });
    b.addEventListener('keydown',function(e){
      var d = e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0;
      if(!d) return;
      e.preventDefault(); show((i+d+bs.length)%bs.length,true);
    });
  });
  var w=null;
  try{ w=localStorage.getItem('alg-tool'); }catch(e){}
  var idx=0;
  if(w) bs.forEach(function(b,j){ if(b.dataset.tool===w) idx=j; });
  show(idx,false);
});
"""


def esc(s):
    return html.escape(s, quote=False)


def md(s):
    s = esc(s)
    s = re.sub(r"`([^`]+)`", r"<code>\1</code>", s)
    s = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", s)
    s = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r'<a href="\2">\1</a>', s)
    # Escaping is deliberate so literal placeholders survive, but <em> is used for
    # emphasis in headlines — restore just that tag.
    s = s.replace("&lt;em&gt;", "<em>").replace("&lt;/em&gt;", "</em>")
    return s


def p(s):
    return "<p>%s</p>" % md(s)


def prompt(text, label="Copy prompt"):
    return ('<div class="block"><button class="copy" type="button">%s</button>'
            '<pre class="prompt">%s</pre></div>' % (label, esc(text.strip())))


def term(lines):
    out = []
    for l in lines:
        if l.startswith("#"):
            out.append('<span class="c">%s</span>' % esc(l))
        elif l.startswith("$ "):
            out.append('<span class="p">$</span> %s' % esc(l[2:]))
        else:
            out.append(esc(l))
    return ('<div class="block term-wrap"><button class="copy" type="button">Copy</button>'
            '<pre class="term">%s</pre></div>' % "\n".join(out))


def mini(items):
    return '<ol class="mini">%s</ol>' % "".join("<li>%s</li>" % i for i in items)


ICO = {
    "dl": '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#9fc4ff" stroke-width="2" stroke-linecap="round"><path d="M12 3v12M7 11l5 5 5-5M4 20h16"/></svg>',
    "drop": '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#9fc4ff" stroke-width="2" stroke-linecap="round"><path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>',
    "ask": '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#9fc4ff" stroke-width="2" stroke-linecap="round"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/></svg>',
}
ARROW = ('<svg width="30" height="14" viewBox="0 0 30 14" fill="none" stroke="currentColor" '
         'stroke-width="2" stroke-linecap="round"><path d="M1 7h24M20 2l5 5-5 5"/></svg>')

FLOW = (
    '<div class="flow"><div class="rail">'
    '<div class="fstep"><span class="ico">{dl}</span><span class="n">STEP 01</span>'
    '<span class="t">Download</span><span class="d">One ZIP from the skills library.</span></div>'
    '<div class="arrow a1">{ar}</div>'
    '<div class="fstep"><span class="ico">{drop}</span><span class="n">STEP 02</span>'
    '<span class="t">Drop it in</span><span class="d">Into the AI tool you already use.</span></div>'
    '<div class="arrow a2">{ar}</div>'
    '<div class="fstep"><span class="ico">{ask}</span><span class="n">STEP 03</span>'
    '<span class="t">Ask</span><span class="d">Paste one prompt. It asks you questions first.</span></div>'
    '</div><p class="time">About ten minutes, start to finish.</p></div>'
).format(dl=ICO["dl"], drop=ICO["drop"], ask=ICO["ask"], ar=ARROW)

BTN_ICO = ('<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
           'stroke-width="2.2" stroke-linecap="round"><path d="M12 3v12M7 11l5 5 5-5M4 20h16"/></svg>')

# ------------------------------------------------------------------ tools

TOOLS = [
    ("claude", "Claude app", (
        p("No terminal needed.")
        + mini([
            p("**Settings → Capabilities** → turn on **Code execution and file creation**."),
            p("**Customize → Skills → + → Create skill → Upload a skill.**"),
            p("Pick one skill ZIP. Repeat for each skill you want."),
            p("Type `/` in the message box — the skill should be listed."),
        ])
        + '<div class="note">%s</div>' % md(
            "Upload the **individual** skill ZIPs, not the full-library ZIP — the uploader takes "
            "one skill at a time.")
    )),
    ("claude-code", "Claude Code", (
        p("Copy the folders into your skills directory.")
        + term([
            "$ unzip algolia-skills-library.zip -d /tmp/alg",
            "$ mkdir -p ~/.claude/skills",
            "$ cp -R /tmp/alg/algolia-* ~/.claude/skills/",
        ])
        + p("Then in a session: `/algolia-discovery-planning`")
    )),
    ("cursor", "Cursor", (
        term([
            "$ unzip algolia-skills-library.zip -d /tmp/alg",
            "$ mkdir -p .cursor/skills",
            "$ cp -R /tmp/alg/algolia-* .cursor/skills/",
        ])
        + p("Then `/algolia-discovery-planning`, or `@algolia-discovery-planning` to attach it.")
    )),
    ("codex", "Codex", (
        term([
            "$ unzip algolia-skills-library.zip -d /tmp/alg",
            "$ mkdir -p .agents/skills",
            "$ cp -R /tmp/alg/algolia-* .agents/skills/",
        ])
        + p("Then `/skills` to list, `$algolia-discovery-planning` to use one.")
    )),
    ("chatgpt", "ChatGPT", (
        p("Sidebar → **Plugins → Plugin Directory → Skills → Create → Upload from your computer**. "
          "Add one skill at a time. ChatGPT scans each upload, so a skill can come back "
          "**Needs Review** or **Blocked** before you can use it.")
        + '<div class="note">%s</div>' % md(
            "Skills are generally available on Business, Enterprise, Healthcare and Edu — but on "
            "Enterprise and Edu an admin has to switch them on. Skills also don't sync between the "
            "desktop app and web, so add them in both.")
    )),
    ("copilot", "Copilot / VS Code", (
        term([
            "$ unzip algolia-skills-library.zip -d /tmp/alg",
            "$ mkdir -p .github/skills",
            "$ cp -R /tmp/alg/algolia-* .github/skills/",
        ])
        + p("Then `/algolia-discovery-planning` in Copilot Chat.")
    )),
    ("other", "Another tool", (
        p("These follow the open [Agent Skills spec](https://agentskills.io/specification), which "
          "standardises the skill folder itself. Each tool still decides where it looks for one, so "
          "try the most widely read path first:")
        + term([
            "$ mkdir -p .agents/skills",
            "$ cp -R algolia-* .agents/skills/",
        ])
        + p("That works in Codex, Cursor, Copilot, Gemini CLI, Antigravity and Devin Desktop "
            "(formerly Windsurf). Two tools need their own location: Claude Code reads "
            "`~/.claude/skills/`, and Kiro reads `.kiro/skills/`.")
    )),
]


def tabs():
    bar = "".join(
        '<button type="button" role="tab" data-tool="%s" aria-controls="t-%s" '
        'aria-selected="false" tabindex="-1">%s</button>' % (k, k, esc(l))
        for k, l, _ in TOOLS)
    pans = "".join(
        '<div role="tabpanel" id="t-%s" aria-label="%s">%s</div>' % (k, esc(l), b)
        for k, l, b in TOOLS)
    return ('<div class="tabs"><div class="tabbar" role="tablist">%s</div>'
            '<div class="panels">%s</div></div>' % (bar, pans))


# ------------------------------------------------------------------ when

WHEN = [
    ("You're building something new",
     "Use it before you write any code. Getting the data shape and events right up front is the whole game — retrofitting them is the expensive part.",
     "algolia-discovery-planning"),
    ("Your results feel wrong",
     "Ranking, searchable attributes, facets, synonyms and rules are usually the cause. It reviews your settings against what you're actually trying to do.",
     "algolia-index-configuration"),
    ("Your analytics don't add up",
     "If click and conversion events aren't wired correctly, your dashboards are guessing — and so is every AI feature on your plan.",
     "algolia-events-insights"),
    ("You're about to launch",
     "It audits what you've built and produces launch evidence, saying “not verified” rather than guessing when it can't confirm something.",
     "algolia-release-qa"),
    ("You're turning on AI features",
     "NeuralSearch, personalization and Recommend need good records and trustworthy behavioural data. It checks whether you're ready first.",
     "algolia-neuralsearch"),
    ("You're migrating or replatforming",
     "It writes down the record shape, variants and objectID strategy as a contract both sides can review before anything moves.",
     "algolia-data-modeling"),
]

WHEN_HTML = '<div class="when">%s</div>' % "".join(
    '<div class="wc"><span class="wt">%s</span><span class="wd">%s</span>'
    '<span class="ws">%s</span></div>' % (esc(t), md(d), esc(s))
    for t, d, s in WHEN)

START_PROMPT = """Use the Algolia Discovery Planning skill to help me choose the right implementation path.

Ask me only the questions you need to understand my goal, my data, my search UI, my events, and my launch risk. Assume I may not know which technical details matter yet.

Then recommend the next Algolia skill to use, the smallest useful first milestone, and the validation artifact I should create."""

# ------------------------------------------------------------------ body

BODY = (
    '<p class="promise">%s</p>' % md("Three steps: <em>download, drop it in, ask</em>.")
    + '<p class="psub">%s</p>' % md(
        "Algolia's official skills make the AI tool your team already uses good at Algolia "
        "specifically — so it asks the right questions instead of guessing. Free and MIT licensed.")
    + FLOW

    + '<h2 class="sh"><span class="num">1</span>Download</h2>'
    + '<p class="snote">%s</p>' % md(
        "Not sure which you need? Take the full library — the first skill works out the rest.")
    + '<p><a class="btn" href="%s">%sDownload the full library</a></p>' % (DL, BTN_ICO)
    + '<p class="cap">%s</p>' % md(
        "`algolia-skills-library.zip` — all eleven skills. Individual skills and project-type "
        "bundles (ecommerce, B2B catalog, marketplace, support knowledge base, AI shopping "
        "assistant) are on the same page.")

    + '<h2 class="sh"><span class="num">2</span>Drop it in</h2>'
    + '<p class="snote">%s</p>' % md("Pick the tool your team already uses.")
    + tabs()
    + '<div class="note ok">%s</div>' % md(
        "**It worked if** the skill name appears in your tool's skill list — and your first prompt "
        "comes back asking you questions instead of writing code.")

    + '<h2 class="sh"><span class="num">3</span>Ask</h2>'
    + '<p class="snote">%s</p>' % md(
        "Start with this whatever your situation. It works out which skill you actually need.")
    + prompt(START_PROMPT)
    + '<p class="cap">%s</p>' % md(
        "Expect questions back before you get an answer. A good plan needs to know your catalogue, "
        "what you measure today, and what your launch risk is.")

    + '<h2 class="plain">When to use it</h2>'
    + '<p class="psub">%s</p>' % md(
        "You don't need to know which skill to pick — the prompt above routes you. This is just so "
        "you know when reaching for it is worth it.")
    + WHEN_HTML

    + '<details class="more"><summary>What good output looks like</summary><div class="db">'
    + "<ul>"
    + "".join("<li>%s</li>" % md(x) for x in [
        "It **asks before it builds**. If it starts writing code immediately, the skill didn't load.",
        "It **names the phases** and the order: data → events → settings → UI → launch checks.",
        "It gives you **documents you can keep** — a record contract, an event plan, a launch checklist.",
        "It says **“not verified”** instead of assuming, when it can't see your account.",
        "It writes down **assumptions and who owns them**, rather than quietly inventing answers.",
    ])
    + "</ul></div></details>"

    + '<details class="more"><summary>Add live account access (optional)</summary><div class="db">'
    + p("The skills decide what to ask and in what order. They don't touch your Algolia account. "
        "If you want your AI tool to read real analytics and index settings, add the official tooling:")
    + term([
        "# live analytics, index inspection",
        "$ claude mcp add --transport http algolia https://mcp.algolia.com/mcp",
        "",
        "# indices, settings, rules, synonyms, records",
        "$ brew install algolia/algolia-cli/algolia",
    ])
    + '<div class="note">%s</div>' % md(
        "**Point it at a non-production app while you explore.** These skills make an agent "
        "cautious, but an agent with write access to a production index is still an agent with "
        "write access to a production index.")
    + "</div></details>"

    + '<details class="more"><summary>If something doesn\'t work</summary><div class="db">'
    + "<ul>"
    + "".join("<li>%s</li>" % md(x) for x in [
        "**Nothing happens.** Check `SKILL.md` sits at the top level of the skill folder. Unzipping often creates a doubled folder — look for `algolia-events-insights/algolia-events-insights/`.",
        "**Claude rejected the ZIP.** Upload individual skill ZIPs, not the full library. If one is still rejected, unzip it and re-zip just the `algolia-…` folder.",
        "**Can't use Skills in Claude.** Skills need code execution — turn on Settings → Capabilities → Code execution and file creation first.",
        "**Some load, others don't.** Codex budgets its startup skill list to 2% of the model's "
        "context window (8,000 characters if that's unknown). Past that it shortens descriptions, "
        "then omits skills and warns you. Install just the ones you need.",
        "**It writes code without asking anything.** Name the skill explicitly: `/algolia-discovery-planning`.",
    ])
    + "</ul></div></details>"
)

FOOT = ('<footer class="foot">%s</footer>' % md(
    "Official Algolia skills · [Library and downloads](%s) · "
    "[github.com/algolia/skills](https://github.com/algolia/skills) · "
    "[Build with AI](https://www.algolia.com/doc/guides/get-started/build-with-ai/)" % LIB))

STANDALONE = """<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Get started with the Algolia skills</title>
<meta name="description" content="Download a ZIP, drop it into the AI tool you already use, paste one prompt. About ten minutes.">
<style>body{{margin:0;background:var(--bg,#f5f8ff)}}
{css}</style></head>
<body class="alg">
<header class="top"><div class="wrap">
<p class="eyebrow">Quick start</p>
<h1>Make your AI tool good at Algolia</h1>
<p>Download a ZIP, drop it into the tool your team already uses, paste one prompt. About ten minutes.</p>
<div class="chips"><span>Free &middot; MIT licensed</span><span>Works with most AI tools</span></div>
</div></header>
<main><div class="wrap">{body}{foot}</div></main>
<script>{js}</script></body></html>
"""

EMBED = """<!-- Algolia skills quick start — embeddable fragment.
     Self-contained: scoped styles, no external requests, no <html>/<body>.
     Drop into any page, or serve standalone and iframe it. -->
<style>{css}</style>
<div class="alg alg-embed"><div class="wrap">{body}</div></div>
<script>{js}</script>
"""

EMBED_EXTRA = """
/* embed: no page chrome, inherit the host page's background */
.alg-embed{background:transparent}
.alg-embed .wrap{padding:0;max-width:none}
.alg-embed .promise{font-size:22px}
.alg-embed h2.sh{margin-top:34px}
.alg-embed footer.foot{margin-top:36px}
"""

def _blocks(css):
    """Split CSS into (prelude, body) pairs at brace depth 0."""
    out, depth, start, cut = [], 0, 0, None
    for i, ch in enumerate(css):
        if ch == "{":
            if depth == 0:
                cut = i
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                out.append((css[start:cut], css[cut + 1:i]))
                start = i + 1
    return out


def _scope_selector(sel, root):
    keep = "".join(re.findall(r"/\*.*?\*/", sel, re.S))
    sel = re.sub(r"/\*.*?\*/", "", sel, flags=re.S).strip()
    parts = []
    for one in (s.strip() for s in sel.split(",")):
        if not one:
            continue
        # Custom properties must land on the container, not the document root,
        # or they override the host page's design tokens (and its dark mode).
        parts.append(root if one == ":root" else
                     one if one.startswith(root) else
                     "%s %s" % (root, one))
    return keep + ",".join(parts)


def scope_css(css, root=".alg"):
    """Confine every rule to `root` so the fragment cannot restyle its host.

    @keyframes bodies are copied verbatim — their `from`/`to`/percentage stops
    are not element selectors and must not be prefixed.
    """
    out = []
    for prelude, body in _blocks(css):
        pre = prelude.strip()
        if pre.startswith(("@keyframes", "@font-face", "@import", "@charset")):
            out.append("%s{%s}" % (pre, body))
        elif pre.startswith(("@media", "@supports", "@layer", "@container")):
            out.append("%s{%s}" % (pre, scope_css(body, root)))
        elif pre.startswith("@"):
            out.append("%s{%s}" % (pre, body))
        else:
            out.append("%s{%s}" % (_scope_selector(pre, root), body))
    return "\n".join(out)


os.makedirs(OUT, exist_ok=True)


def words(s):
    s = re.sub(r"<(script|style)[^>]*>.*?</\1>", "", s, flags=re.S)
    return len(re.findall(r"[A-Za-z0-9']+", re.sub(r"<[^>]+>", " ", s)))


# The site's CSP sets script-src 'self' with no 'unsafe-inline', so an inline
# <script> is silently blocked there. Ship the JS as a sibling file instead.
# Note: the CSP also sets frame-ancestors 'none', so the page cannot be iframed
# even same-origin — which is why embed.html is an inline fragment, not an iframe.
KIT = "kit.js"
EMBED_KIT = "/implementation-skills/start/kit.js"

open(os.path.join(OUT, KIT), "w", encoding="utf-8").write(JS.strip() + "\n")
print("wrote %s/%s — %.1f KB" % (OUT, KIT, len(JS) / 1024))

a = STANDALONE.format(css=CSS, js="", body=BODY, foot=FOOT)
a = a.replace("<script></script>", '<script src="%s"></script>' % KIT)
open(os.path.join(OUT, "index.html"), "w", encoding="utf-8").write(a)
print("wrote %s/index.html — %d visible words" % (OUT, words(a)))

b = EMBED.format(css=scope_css(CSS) + EMBED_EXTRA, js="", body=BODY + FOOT)
b = b.replace(
    "<script></script>",
    "<!-- Loads the copy buttons and tool tabs. Adjust the path if your base path differs. -->\n"
    '<script src="%s"></script>' % EMBED_KIT,
)
open(os.path.join(OUT, "embed.html"), "w", encoding="utf-8").write(b)
print("wrote %s/embed.html — %d visible words" % (OUT, words(b)))
print("done")

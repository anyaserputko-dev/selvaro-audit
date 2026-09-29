# -*- coding: utf-8 -*-
# build.py — data-driven deck generator (Rinfit-style). Content lives in deck.json; this file only renders.
import io, os, json
BASE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(BASE)
css = open(os.path.join(BASE,'base.css'), encoding='utf-8').read()
DECK = json.load(open(os.path.join(BASE,'deck.json'), encoding='utf-8'))
COMP = json.load(open(os.path.join(BASE,'comp.json'), encoding='utf-8')) if os.path.exists(os.path.join(BASE,'comp.json')) else {}
RATE = DECK.get('rate', 40); SITE = DECK['site']; DATE = DECK['date']

EXTRA_CSS = """
.phone{aspect-ratio:9/20.1}
.view{background:#f6f0e9}.view>img.shot{object-fit:contain;object-position:top;background:#f6f0e9}
.ccard .do::before{content:"We fix: "!important}
.two{align-items:start}.stats b{overflow-wrap:anywhere}
.sev.low{background:#EFF3EF;color:#3d5a45;border:1.5px solid #9bb3a2}
.comp{margin-top:12px;padding-top:10px;border-top:1px dashed #cfcfcf;font-size:13px;line-height:1.45;color:#444}
.comp a{color:#1136d6;font-weight:700;text-decoration:none}.comp a:hover{text-decoration:underline}
.qlist{list-style:none;padding:0;margin:0;display:grid;gap:12px}
.qlist li{background:#fff;border-radius:14px;padding:16px 18px;box-shadow:0 10px 26px rgba(0,0,0,.06);font-size:15px;line-height:1.5;display:flex;gap:12px}
.qlist li i{font-style:normal;font:800 14px/1 'Montserrat',sans-serif;color:#1136d6;flex:none;padding-top:3px}
.fine-note{font-size:12.5px;color:#777;margin-top:10px}
.tmap{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
.tmap .t{background:#fff;border-radius:14px;padding:18px 20px;box-shadow:0 10px 26px rgba(0,0,0,.07);border-left:4px solid var(--red)}
.tmap .t.ok{border-left-color:var(--green)}.tmap .t.mid{border-left-color:#c9a227}
.tmap .t b{display:block;font:800 15px/1.2 'Montserrat',sans-serif;margin-bottom:6px}
.tmap .t span{font-size:13.5px;color:#444;line-height:1.5;display:block}
.tmap .t em{font-style:normal;display:block;margin-top:8px;font:600 12px/1 'Montserrat',sans-serif;color:#777}
@media (max-width:640px){.tmap{grid-template-columns:minmax(0,1fr)}}
"""
SB = ('<div class="sbar"><span>9:41</span><svg viewBox="0 0 24 11"><rect x=".5" y=".5" width="20" height="10" rx="3" fill="none" stroke="#111"/>'
      '<rect x="2" y="2" width="16" height="7" rx="1.5" fill="#111"/><rect x="21.5" y="3.5" width="1.8" height="4" rx=".9" fill="#111"/></svg></div>')
CONN = ('<svg class="conn" viewBox="0 0 54 12"><path d="M0 6h50M45 1.5 50 6l-5 4.5" fill="none" stroke="#6d6d6d" stroke-width="1.5"/></svg>')
ARROW = ('<span class="arrow"><svg width="14" height="16" viewBox="0 0 14 16"><path d="M7 1v13M1.5 8.5 7 14l5.5-5.5" fill="none" stroke="#444" stroke-width="1.6"/></svg></span>')

def phone(img, cap='', url=SITE):
    c = '<div class="cap">%s</div>' % cap if cap else ''
    return ('<div><div class="phone"><div class="screen"><div class="island"></div>%s'
            '<div class="view"><img class="shot" src="img/%s" alt=""></div>'
            '<div class="url"><span>%s</span></div></div></div>%s</div>' % (SB, img, url, c))

def comp_line(sid):
    c = COMP.get(sid)
    if not c: return ''
    return '<div class="comp">Like at <a href="%s" target="_blank" rel="noopener">%s ↗</a> — %s</div>' % (c['url'], c['name'], c['why'])

SLIDES = []  # (num, sevlab, title, hours)
def ps(x):  # list of paragraphs → html
    return ''.join('<p>%s</p>' % p for p in x) if isinstance(x, list) else x

def slide(s, sev, sevlab):
    hours = s['hours']; price = '$%s' % format(hours*RATE, ',')
    SLIDES.append((s['num'], sevlab, s['title'], hours))
    s1, s2 = s['stats']
    return f'''
<section class="slide" id="{s['id']}">
  <img class="silk sm" src="img/silk.png" alt="">
  <div class="shead"><span class="num">{s['num']}</span><h2><span class="sev {sev}">{sevlab}</span>{s['title']}</h2></div>
  <div class="pbody">
    <div class="txt t1"><div class="lbl"><span class="pill">Today</span>{CONN}</div>{ps(s['today'])}<p class="fine-note">Verified on iPhone (390×844), {DATE}.</p></div>
    <div class="v1">{phone(s['now_img'], s['cap_now'], s.get('url_now', SITE))}</div>
    <div class="txt t2"><div class="lbl"><span class="pill">We propose</span>{CONN}</div>{ps(s['propose'])}</div>
    <div class="v2">{phone(s['fix_img'], s['cap_fix'], s.get('url_fix', SITE))}</div>
    <div class="cardcol">
      <div class="benefit-top"><span class="pill">Why it pays</span>{ARROW}</div>
      <div class="card"><p>{s['benefit']}</p><div class="stats"><div><b>{s1[0]}</b><span>{s1[1]}</span></div><div><b>{s2[0]}</b><span>{s2[1]}</span></div></div>{comp_line(s['id'])}</div>
      <div class="ptag"><span>Price</span><b>{price}</b><em>{hours} h &#183; ${RATE}/h</em></div>
    </div>
  </div>
</section>'''

def tech(s, sev, sevlab):
    hours = s['hours']; SLIDES.append((s['num'], sevlab, s['title'], hours))
    items = ''.join('<div class="t %s"><b>%s</b><span>%s</span><em>%s</em></div>' % (it.get('cls',''), it['h'], it['p'], it['tag']) for it in s['items'])
    return f'''
<section class="slide" id="{s['id']}">
  <img class="silk sm" src="img/silk.png" alt="">
  <div class="shead"><span class="num">{s['num']}</span><h2><span class="sev {sev}">{sevlab}</span>{s['title']}</h2></div>
  <p class="lead">{s['lead']}</p>
  <div class="tmap">{items}</div>
  <div class="ptag" style="margin-top:24px;max-width:320px"><span>Price</span><b>${format(hours*RATE, ',')}</b><em>{hours} h &#183; ${RATE}/h</em></div>
</section>'''

out = io.StringIO()
M = DECK['meta']
secs = DECK['sections']  # [{id, sev, sevlab, divider_h2, toc, slides:[...]}]
toc = ''.join(f'<a href="#{x["id"]}">{len(x["slides"])} {x["toc"]}</a>' for x in secs)
out.write(f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{SITE} — store audit</title>
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 32 32%27%3E%3Crect width=%2732%27 height=%2732%27 rx=%277%27 fill=%27%23141414%27/%3E%3Ctext x=%2716%27 y=%2722%27 font-family=%27Arial%27 font-weight=%27800%27 font-size=%2716%27 fill=%27%23fff%27 text-anchor=%27middle%27%3EM%3C/text%3E%3C/svg%3E">
<meta name="description" content="Store audit of {SITE} by MileDevs: what is costing the store sales, and what it costs to fix.">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Open+Sans:wght@400;600;700&display=swap" rel="stylesheet">
<style>
{css}
{EXTRA_CSS}
</style>
</head>
<body>
<section class="slide cover">
  <img class="silk" src="img/silk.png" alt="">
  <div class="brand">MILEDEVS × {DECK['client_caps']}</div>
  <img class="logo" src="img/logo-md.png" alt="MileDevs">
  <h1>{M['h1']}</h1>
  <p class="sub">{M['sub']}</p>
  <p class="meta">{M['meta']}</p>
  <nav class="toc">
    <a href="#summary">The short version</a>
    <a href="#strong">What already works</a>
    {toc}
    <a href="#price">Pricing</a>
    <a href="#questions">Questions</a>
  </nav>
</section>

<section class="slide" id="summary">
  <img class="silk sm" src="img/silk.png" alt="">
  <div class="shead"><h2>The short version</h2></div>
  {''.join('<p class="lead">%s</p>' % p for p in DECK['summary'])}
  <div class="kpis" style="margin-top:34px">__KPIS__</div>
</section>

<section class="slide" id="strong">
  <img class="silk sm" src="img/silk.png" alt="">
  <div class="shead"><h2>What already works<small>{DECK['strong_sub']}</small></h2></div>
  <div class="good">
    {''.join('<div class="gcard"><div class="ck">✓</div><h3>%s</h3><p>%s</p></div>' % (g[0], g[1]) for g in DECK['strong'])}
  </div>
</section>
''')

for x in secs:
    out.write(f'''
<section class="slide divider" id="{x['id']}">
  <img class="silk" src="img/silk.png" alt="">
  <span class="sev {x['sev']}">{x['sevlab']}</span>
  <h2>{len(x['slides'])} {x['divider_h2']}</h2>
</section>''')
    for s in x['slides']:
        out.write(tech(s, x['sev'], x['sevlab']) if s.get('items') else slide(s, x['sev'], x['sevlab']))

def tot(sevlab):
    h = sum(h for (n, s, t, h) in SLIDES if s == sevlab); return h, h*RATE
def plist(title, sev, sevlab):
    h, p = tot(sevlab)
    body = ''.join(f'<div class="prow"><i>{n}</i><span>{t}</span><em>{hh} h</em><b>${format(hh*RATE, ",")}</b></div>' for (n, s, t, hh) in SLIDES if s == sevlab)
    return (f'<div class="plist"><h4><span class="sev {sev}">{sevlab}</span>{title}</h4>{body}'
            f'<div class="ptotal"><span>Subtotal</span><span>{h} h · ${format(p, ",")}</span></div></div>')
tots = [tot(x['sevlab']) for x in secs]
TH = sum(t[0] for t in tots); TP = sum(t[1] for t in tots)
out.write(f'''
<section class="slide" id="price">
  <img class="silk sm" src="img/silk.png" alt="">
  <div class="shead"><h2>Time and price<small>Development hours at a fixed ${RATE}/hour. One row per slide; the price of each item is on its slide.</small></h2></div>
  <div class="pcol">
    {''.join(plist(x['price_title'], x['sev'], x['sevlab']) for x in secs)}
  </div>
  <div class="pbox" style="margin-top:30px">
    <p>Total estimate</p>
    <div class="sum">{TH} h &#183; ${format(TP, ",")}</div>
    <p>Fixed price for development, at ${RATE} per hour.</p>
    <div class="terms">{''.join('<span>%s — %d h</span>' % (x['sevlab'], t[0]) for x, t in zip(secs, tots))}</div>
  </div>
  <p class="fine" style="margin-top:22px">{DECK['price_note']}</p>
</section>

<section class="slide">
  <img class="silk sm" src="img/silk.png" alt="">
  <div class="shead"><h2>Proven results<small>The same conversion approach on a store we run it for.</small></h2></div>
  <img class="chart" src="img/results.png" alt="Total sales curve, +19% versus the previous period" style="width:100%;max-width:900px;display:block;border-radius:14px;box-shadow:0 10px 26px rgba(0,0,0,.08)">
  <p class="lead" style="margin-top:18px">Total sales over the period: <b>$168,636 — +19% against the prior period</b>. Solid line is the period running our approach, dotted is before.</p>
</section>

<section class="slide" id="questions">
  <img class="silk sm" src="img/silk.png" alt="">
  <div class="shead"><h2>Questions before we start<small>Things we could not verify from outside, or that need your decision.</small></h2></div>
  <ul class="qlist">
    {''.join('<li><i>%02d</i><span>%s</span></li>' % (i+1, q) for i, q in enumerate(DECK['questions']))}
  </ul>
</section>

<section class="slide end">
  <img class="silk sm" src="img/silk.png" alt="">
  <img src="img/logo-md.png" alt="MileDevs">
  <h2>Next step</h2>
  <p>{DECK['next'].replace('__CH__', str(tots[0][0]))}</p>
  <p class="fine">{DECK['fine']}</p>
</section>
</body>
</html>''')

html = out.getvalue()
kp = ''.join('<div class="kpi"><b>%d</b><span>%s</span></div>' % (len(x['slides']), x['kpi']) for x in secs)
kp += f'<div class="kpi"><b>{TH} h</b><span>Dev time</span></div><div class="kpi"><b>${format(TP, ",")}</b><span>Fixed price</span></div>'
html = html.replace('__KPIS__', kp)
open(os.path.join(ROOT,'index.html'),'w',encoding='utf-8').write(html)
json.dump({'slides':SLIDES,'totals':{'sections':[[x['sevlab'], t[0], t[1]] for x, t in zip(secs, tots)],'all':[TH,TP]}}, open(os.path.join(BASE,'slides.json'),'w'), ensure_ascii=False, indent=1)
print('written', len(html), 'chars;', len(SLIDES), 'slides; totals', tots, TH, TP)

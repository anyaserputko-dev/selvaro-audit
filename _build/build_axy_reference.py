# -*- coding: utf-8 -*-
import io, os, json
BASE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(BASE)
css = open(os.path.join(BASE,'base.css'), encoding='utf-8').read()
COMP = json.load(open(os.path.join(BASE,'comp.json'), encoding='utf-8')) if os.path.exists(os.path.join(BASE,'comp.json')) else {}
RATE = 40

EXTRA_CSS = """
.phone{aspect-ratio:9/20.1}
.view{background:#0b1a2e}.view>img.shot{object-fit:contain;object-position:top;background:#0b1a2e}
.ccard .do::before{content:"We fix: "!important}
.two{align-items:start}.stats b{overflow-wrap:anywhere}
.sev.low{background:#EFF3EF;color:#3d5a45;border:1.5px solid #9bb3a2}
.tmap{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
.tmap .t{background:#fff;border-radius:14px;padding:18px 20px;box-shadow:0 10px 26px rgba(0,0,0,.07);border-left:4px solid var(--red)}
.tmap .t.ok{border-left-color:var(--green)}.tmap .t.mid{border-left-color:#c9a227}
.tmap .t b{display:block;font:800 15px/1.2 'Montserrat',sans-serif;margin-bottom:6px}
.tmap .t span{font-size:13.5px;color:#444;line-height:1.5;display:block}
.tmap .t em{font-style:normal;display:block;margin-top:8px;font:600 12px/1 'Montserrat',sans-serif;color:#777}
@media (max-width:640px){.tmap{grid-template-columns:minmax(0,1fr)}}
.comp{margin-top:12px;padding-top:10px;border-top:1px dashed #cfcfcf;font-size:13px;line-height:1.45;color:#444}
.comp a{color:#1136d6;font-weight:700;text-decoration:none}.comp a:hover{text-decoration:underline}
.qlist{list-style:none;padding:0;margin:0;display:grid;gap:12px}
.qlist li{background:#fff;border-radius:14px;padding:16px 18px;box-shadow:0 10px 26px rgba(0,0,0,.06);font-size:15px;line-height:1.5;display:flex;gap:12px}
.qlist li i{font-style:normal;font:800 14px/1 'Montserrat',sans-serif;color:#1136d6;flex:none;padding-top:3px}
.fine-note{font-size:12.5px;color:#777;margin-top:10px}
"""

SB = ('<div class="sbar"><span>9:41</span><svg viewBox="0 0 24 11"><rect x=".5" y=".5" width="20" height="10" rx="3" fill="none" stroke="#111"/>'
      '<rect x="2" y="2" width="16" height="7" rx="1.5" fill="#111"/><rect x="21.5" y="3.5" width="1.8" height="4" rx=".9" fill="#111"/></svg></div>')
CONN = ('<svg class="conn" viewBox="0 0 54 12"><path d="M0 6h50M45 1.5 50 6l-5 4.5" fill="none" stroke="#6d6d6d" stroke-width="1.5"/></svg>')
ARROW = ('<span class="arrow"><svg width="14" height="16" viewBox="0 0 14 16"><path d="M7 1v13M1.5 8.5 7 14l5.5-5.5" fill="none" stroke="#444" stroke-width="1.6"/></svg></span>')

def phone(img, cap='', url='axyglobal.com'):
    c = '<div class="cap">%s</div>' % cap if cap else ''
    return ('<div><div class="phone"><div class="screen"><div class="island"></div>%s'
            '<div class="view"><img class="shot" src="img/%s" alt=""></div>'
            '<div class="url"><span>%s</span></div></div></div>%s</div>' % (SB, img, url, c))

def comp_line(sid):
    c = COMP.get(sid)
    if not c: return ''
    return '<div class="comp">Like at <a href="%s" target="_blank" rel="noopener">%s ↗</a> — %s</div>' % (c['url'], c['name'], c['why'])

SLIDES = []  # (num, sevlab, title, hours)
def slide(num, sev, sevlab, title, today, propose, now_img, fix_img, cap_now, cap_fix, benefit, s1, s2, hours, sid, url_now='axyglobal.com', url_fix='axyglobal.com'):
    price = '$%s' % format(hours*RATE, ',')
    SLIDES.append((num, sevlab, title, hours))
    return f'''
<section class="slide" id="{sid}">
  <img class="silk sm" src="img/silk.png" alt="">
  <div class="shead"><span class="num">{num}</span><h2><span class="sev {sev}">{sevlab}</span>{title}</h2></div>
  <div class="pbody">
    <div class="txt t1"><div class="lbl"><span class="pill">Today</span>{CONN}</div>{today}<p class="fine-note">Verified on iPhone (390×844), 28 Sep 2026.</p></div>
    <div class="v1">{phone(now_img, cap_now, url_now)}</div>
    <div class="txt t2"><div class="lbl"><span class="pill">We propose</span>{CONN}</div>{propose}</div>
    <div class="v2">{phone(fix_img, cap_fix, url_fix)}</div>
    <div class="cardcol">
      <div class="benefit-top"><span class="pill">Why it pays</span>{ARROW}</div>
      <div class="card"><p>{benefit}</p><div class="stats"><div><b>{s1[0]}</b><span>{s1[1]}</span></div><div><b>{s2[0]}</b><span>{s2[1]}</span></div></div>{comp_line(sid)}</div>
      <div class="ptag"><span>Price</span><b>{price}</b><em>{hours} h &#183; ${RATE}/h</em></div>
    </div>
  </div>
</section>'''

out = io.StringIO()
out.write(f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>axyglobal.com — second-stage plan</title>
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 32 32%27%3E%3Crect width=%2732%27 height=%2732%27 rx=%277%27 fill=%27%23141414%27/%3E%3Ctext x=%2716%27 y=%2722%27 font-family=%27Arial%27 font-weight=%27800%27 font-size=%2716%27 fill=%27%23fff%27 text-anchor=%27middle%27%3EM%3C/text%3E%3C/svg%3E">
<meta name="description" content="Store audit of axyglobal.com by MileDevs: what is costing the site leads, and what it costs to fix.">
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
  <div class="brand">MILEDEVS × AXY</div>
  <img class="logo" src="img/logo-md.png" alt="MileDevs">
  <h1>Second-stage<br>plan</h1>
  <p class="sub">What is costing axyglobal.com leads — and what it costs to fix</p>
  <p class="meta">September 2026 · lead-generation site we built, EN + RU · every point checked live on an iPhone (390×844) and on desktop, 28 Sep 2026</p>
  <nav class="toc">
    <a href="#summary">The short version</a>
    <a href="#strong">What already works</a>
    <a href="#critical">4 first-wave</a>
    <a href="#medium">8 second-wave</a>
    <a href="#low">2 small fixes</a>
    <a href="#price">Pricing</a>
    <a href="#questions">Questions</a>
  </nav>
</section>

<section class="slide" id="summary">
  <img class="silk sm" src="img/silk.png" alt="">
  <div class="shead"><h2>The short version</h2></div>
  <p class="lead">We built this site, so we look at it from the inside. <b>The foundation holds:</b> the positioning “we are active sellers” reads in a second, ten cases carry real numbers, the team is named, the header comes back on every scroll-up with the button, and each request arrives with its source button, UTM tags and country attached — better attribution than most agency sites have.</p>
  <p class="lead"><b>What we noticed.</b> Every button on the page leads to one form titled “Contact Us”, whose first required question is the budget; there is no email field, and after sending the window simply closes after 1.5 seconds. On a phone, once the header slides away there is no visible way to request the audit until the very bottom. The phone also downloads a 5.4 MB video and a 1.6 MB image that are never shown on it. And a handful of small things — invisible social icons, “© 2024”, an English footer opening a Russian policy — sit exactly where a visitor decides whether to write.</p>
  <p class="lead"><b>What we propose.</b> Fourteen items in three waves. First the four that stand directly between traffic and a request: the form, the thank-you screen, a persistent mobile button, and the media the phone should not download. Then the second wave — hero copy, service hierarchy, the audit block, case buttons, footer, tap targets, tracking. Then two small fixes. No redesign: layout, copy and proof stay, we work point by point. Every figure below is ours, measured on 28 September 2026.</p>
  <div class="kpis" style="margin-top:34px">
    <div class="kpi"><b>4</b><span>First wave</span></div>
    <div class="kpi"><b>8</b><span>Second wave</span></div>
    <div class="kpi"><b>2</b><span>Small fixes</span></div>
    <div class="kpi"><b>52 h</b><span>Dev time</span></div>
    <div class="kpi"><b>$2,080</b><span>Fixed price</span></div>
  </div>
</section>

<section class="slide" id="strong">
  <img class="silk sm" src="img/silk.png" alt="">
  <div class="shead"><h2>What already works<small>The parts we keep — and build the second stage on.</small></h2></div>
  <div class="good">
    <div class="gcard"><div class="ck">✓</div><h3>A header that never loses the button</h3><p>It hides while scrolling down and slides back on the first scroll up — we measured the transform going from −74 px to 0. On desktop “Book a Consultation” is always one scroll away.</p></div>
    <div class="gcard"><div class="ck">✓</div><h3>Every request arrives with its context</h3><p>The site records which of the 6 buttons was pressed, five UTM parameters kept for the whole session, the visitor’s country and the language. Sales knows where each lead came from.</p></div>
    <div class="gcard"><div class="ck">✓</div><h3>A request cannot get lost</h3><p>Each submission goes to three places at once — Google Sheets, a Telegram alert and the LeadFlow webhook — each with its own error handling.</p></div>
    <div class="gcard"><div class="ck">✓</div><h3>Fast server, light code</h3><p>Netlify answers in 472 ms; the page ships 9 script files at 245 KB and zero console errors. All the weight sits in media — and that is fixable.</p></div>
    <div class="gcard"><div class="ck">✓</div><h3>Proof and people on the page</h3><p>Ten cases with numbers across three tabs, three Shopify cases linking to the live stores, a named founder and six team members, and two full-width WhatsApp / Telegram buttons (48 px tall) in the footer.</p></div>
    <div class="gcard"><div class="ck">✓</div><h3>Both languages wired correctly</h3><p>hreflang for en, ru and x-default, one H1, Organization schema, and all three legal pages open (200) — the “6 broken links” from the September report were a false alarm caused by the base href.</p></div>
  </div>
</section>

<section class="slide divider" id="critical">
  <img class="silk" src="img/silk.png" alt="">
  <span class="sev crit">First wave</span>
  <h2>4 changes<br>on the path to a request</h2>
</section>
''')

# ---------- CRITICAL ----------
out.write(slide('01','crit','First wave','The form opens with a budget question and has no email field',
 '<p>All 6 “Get Free Audit” / “Book a Consultation” buttons open the same window titled <b>“Contact Us”</b>. The first field — required — is <b>“How much are you ready to invest right now?”</b>, then name, phone and a Telegram/WhatsApp handle, both required.</p>'
 '<p>There is no email field and no place to paste the store or listing the visitor wants audited.</p>',
 '<p>Keep the same window and make it match the promise: the title becomes <b>“Get Your Free Store Audit”</b>, fields go name → email → one contact field (phone, Telegram or WhatsApp) → optional store link → budget last and optional. Button: “Get my free audit”.</p>'
 '<p>On the right is <b>your own form</b> with that change and nothing else.</p>',
 'now-form.jpg','fix-form.jpg','Today — budget first, two required contact channels, no email','The same window — audit-first, email added, budget optional',
 'People hand over a contact before they have thought about a budget, and you gain an email — the one channel that can actually deliver the audit and follow up if WhatsApp goes quiet.',
 ('0','email fields on the site today'),('2','contact channels required at once'),
 6,'p01'))

out.write(slide('02','crit','First wave','After sending, the window just closes',
 '<p>We read the submit code rather than sending a test lead into your Telegram. On success the button turns green with <b>“✓ Sent!”</b>, the form resets and the window closes after <b>1.5 seconds</b>. No confirmation screen, no reply time, no next step, no thank-you address.</p>'
 '<p>The visitor is back on the same page, unsure whether anything happened — and free to send it again.</p>',
 '<p>Replace the flash with a <b>thank-you state in the same window</b>: what happens next in three lines, your real reply time, and a link to the cases while they wait. The same state gets its own URL so ad platforms can count it as a conversion.</p>',
 'now-form-sent.jpg','fix-thanks.jpg','The 1.5-second state, reproduced from the site code','The same window, replaced by a thank-you screen',
 'The person knows the request arrived and when to expect you; you stop getting duplicates and get a conversion event you can optimise ads on.',
 ('1.5 s','the confirmation is visible today'),('0','next steps offered after sending'),
 3,'p02'))

out.write(slide('03','crit','First wave','On a phone, the request button disappears after the first screen',
 '<p>The mobile header holds only the logo and a burger — “Book a Consultation” sits inside the menu. Once the visitor scrolls, the header slides away. We scrolled to <b>3,000 px</b> (the cases): the header is off-screen and <b>zero</b> request buttons are visible.</p>'
 '<p>The next one appears at the “Get a Free Audit” block, near the bottom of a 7,898 px page.</p>',
 '<p>Add a slim <b>bottom bar with the same “Get Free Audit” button</b> on mobile, hidden only while the form or the audit block is on screen. Same button, same colours — just always reachable.</p>',
 'now-midpage.jpg','fix-midpage-bar.jpg','Mid-page today — cases, no button in sight','The same frame with the bottom bar',
 'Most of your paid traffic from TikTok and Meta lands on a phone. Today it reads the cases and has to hunt for the button; with the bar the next tap is always one thumb away.',
 ('0','request buttons visible mid-page'),('7,898 px','page height on a phone'),
 3,'p03'))

out.write(slide('04','crit','First wave','The phone downloads 7 MB of media it never shows',
 '<p>The hero video and the large hero image live in a block marked <b>hidden on screens under 1024 px</b> — on a phone both render at 0×0. Yet the network log shows the phone fetching <b>banner.mp4 (5.4 MB)</b> and <b>image.png (1.6 MB)</b> in full.</p>'
 '<p>So the mobile visitor pays for the heaviest assets on the site and sees a text-only first screen.</p>',
 '<p>Serve the video and the image only above 1024 px, and give the phone a <b>light still frame from your own video</b> (about 19 KB) under the button — so the first screen has a visual and stops downloading what it hides.</p>',
 'now-hero.jpg','fix-hero-visual.jpg','Today — text only, 7 MB loading in the background','The same screen with a light frame from your own video',
 'The first screen appears faster on exactly the connection your ads are seen on, and the phone gets the product visual the desktop already has.',
 ('5.4 MB','video fetched and never shown on mobile'),('1.6 MB','image fetched and never shown'),
 3,'p04'))

# ---------- MEDIUM ----------
out.write('''
<section class="slide divider" id="medium">
  <img class="silk" src="img/silk.png" alt="">
  <span class="sev imp">Second wave</span>
  <h2>8 changes<br>to clarity and trust</h2>
</section>''')

out.write(slide('05','imp','Second wave','The hero explains three scenarios in one dense paragraph',
 '<p>Under the headline sits a <b>51-word paragraph in three sentences</b> — not selling yet, already selling, Shopify audit — with eight bold fragments. At 16 px on a phone it is 182 px tall and takes real reading before the button.</p>',
 '<p>Turn the three scenarios into <b>three short chips</b> and keep one line for the offer. Headline, button and trust rows stay where they are.</p>',
 'now-hero.jpg','fix-hero-chips.jpg','Today — 51 words before the button','The same screen — three chips, one line',
 'A visitor recognises “that one is me” in a glance instead of reading, and reaches the button sooner.',
 ('51 words','in the sub-headline today'),('3 chips','instead of three sentences'),
 3,'p05'))

out.write(slide('06','imp','Second wave','Ten services carry the same weight',
 '<p>The services grid shows <b>10 identical cards</b>, each with an icon and a name — no outcome, no price range, nothing that says which three you are known for. To learn anything the visitor opens a modal, and the modal has no price either.</p>',
 '<p>Lift <b>three flagship services</b> into full-width cards, each with one line of result taken from your own cases, and keep the other seven as they are below. You choose the three; we used Amazon launch, Shopify and TikTok Shop as an example.</p>',
 'now-services.jpg','fix-services.jpg','Today — ten equal cards','The same grid — three flagships with a case line',
 'The visitor sees where to start and what it leads to before opening anything — and your strongest cases get read in the services block, not only in the cases tab.',
 ('10','cards with equal weight today'),('0','cards with an outcome or price line'),
 5,'p06'))

out.write(slide('07','imp','Second wave','“Free audit” is never explained where it is asked for',
 '<p>The closing block says “Fill out the form and our experts will contact you” — nothing about what the audit contains, what you get back or on what terms. The three scenarios that do explain it are only in the hero — this block starts at 6,494 px on a phone.</p>',
 '<p>Add the three lines from your own hero under the heading — what we check for each scenario — and one trust line under the button: “Free · No obligation · Reply on Telegram or WhatsApp”. Add your real reply time once you confirm it.</p>',
 'now-audit.jpg','fix-audit.jpg','Today — heading, two sentences, button','The same block with what’s included and a trust line',
 'The warmest visitors — the ones who scrolled to the end — get concrete reasons to press the button right where it is.',
 ('3 lines','of what the audit includes'),('1','trust line under the button'),
 3,'p07'))

out.write(slide('08','imp','Second wave','The case button is invisible on touch screens',
 '<p>Each case card has a “Learn More” button styled to appear only on mouse hover (opacity 0 → 1). A phone has no hover, so every card ends in an <b>empty 40 px strip</b>. The card does open on tap — we checked — but nothing tells the visitor that.</p>',
 '<p>Show the button by default and keep the hover effect for mouse users only. One CSS rule — the card, text and photo do not change.</p>',
 'now-casecard.jpg','fix-casecard.jpg','Today — an empty strip where the button is','The same card with the button visible',
 'Your strongest proof — the full case — stops depending on an accidental tap, and the card no longer looks unfinished.',
 ('0','button opacity on touch today'),('10','cases that gain a visible call to action'),
 1,'p08'))

out.write(slide('09','imp','Second wave','The social icons in the footer are gone',
 '<p>The footer links to LinkedIn, Instagram and Facebook — but the three icons render at <b>0×0 px</b>. The cause: the icon library is loaded as “latest” and its newer versions dropped brand icons, so the placeholders never turn into pictures.</p>'
 '<p>An agency selling social growth shows no social links of its own.</p>',
 '<p>Draw the three icons with Font Awesome, which the page already loads, at a 44 px tap size — and pin the icon library version so it cannot change under you again.</p>',
 'now-footer.jpg','fix-footer-icons.jpg','Today — a gap where the icons should be','The same footer with the three icons back',
 'The links exist and lead to real profiles; making them visible costs an hour and returns a trust signal a marketing agency is expected to have.',
 ('0×0 px','three social icons today'),('44 px','tap size after the fix'),
 1,'p09'))

out.write(slide('10','imp','Second wave','The English footer opens a Russian privacy policy',
 '<p>In the /en/ footer, “Privacy Policy” points to privacy-policy.html — the <b>Russian</b> page (“Политика конфиденциальности”). The English version exists and is what the form checkbox opens: privacy-policy-en.html. Two identical links on one page, two languages.</p>',
 '<p>Point the footer link to the English file — the same one the form already uses. One line.</p>',
 'now-privacy-ru.jpg','fix-privacy-en.jpg','What the footer link opens today','What it should open — the existing English page',
 'An English-speaking prospect who checks who they are giving a phone number to sees a document in their language, not one they cannot read.',
 ('2','privacy links on /en/ leading to two languages'),('1 line','to fix'),
 1,'p10', url_now='axyglobal.com/privacy-policy.html', url_fix='axyglobal.com/privacy-policy-en.html'))

out.write(slide('11','imp','Second wave','13 of 21 tappable elements are under 44 px',
 '<p>Measured on the 390×844 screen: footer links are <b>20 px</b> tall, the legal links <b>17 px</b>, the case buttons 40 px, the burger 40×40. The recommended minimum is 44 px — below it, mis-taps are common.</p>',
 '<p>Raise line heights and padding so every link and button has at least a 44 px tap zone. Nothing moves visually beyond a little more air.</p>',
 'now-footer.jpg','fix-footer-touch.jpg','Today — 20 px links','The same footer with 44 px tap zones',
 'People hit the right link the first time — on a phone this is the most common cause of small frustrations and lost taps.',
 ('13 of 21','elements below 44 px today'),('20 → 44 px','footer links'),
 2,'p11'))

# ---- 12 tracking & follow-up (no phones) ----
SLIDES.append(('12','Second wave','Tracking and follow-up after the request',11))
out.write(f'''
<section class="slide" id="p12">
  <img class="silk sm" src="img/silk.png" alt="">
  <div class="shead"><span class="num">12</span><h2><span class="sev imp">Second wave</span>Tracking and follow-up after the request</h2></div>
  <p class="lead">We read every tag and every network request on the page. What is in place is solid; four things would let you measure and reuse the traffic you already pay for.</p>
  <div class="tmap">
    <div class="t ok"><b>Meta Pixel, GTM and Clarity are live</b><span>Pixel 1285343753046437 fires a Lead on submit, GTM-WR5634BL loads GA4, Microsoft Clarity records sessions. The base is there.</span><em>keep</em></div>
    <div class="t"><b>Google receives no lead event from the site code</b><span>The only conversion call in the code is Meta’s. Whether a GTM tag forwards the lead to GA4 or Google Ads we cannot see from outside — we need a look inside the container. If not, one dataLayer push on the thank-you state closes it.</span><em>3 h · $120</em></div>
    <div class="t"><b>No TikTok pixel</b><span>TikTok Shop is a headline service and a whole cases tab, yet the page makes zero requests to TikTok. Traffic from TikTok cannot be retargeted or optimised.</span><em>1 h · $40</em></div>
    <div class="t mid"><b>Two Clarity projects record every session</b><span>Tags vtlc6avxzj and wqhxb45k2d both load, so heatmaps are split across two dashboards. Keep one.</span><em>1 h · $40</em></div>
    <div class="t"><b>No email, so no follow-up</b><span>Once slide 01 adds an email field: a confirmation with the audit scope, the audit itself, and a reminder with a case a few days later. Service choice (Brevo, Klaviyo, Mailchimp) is yours.</span><em>6 h · $240</em></div>
    <div class="t ok"><b>What we keep</b><span>Source button, five UTM parameters, country and language on every lead; Sheets + Telegram + webhook delivery.</span><em>keep</em></div>
  </div>
  <div class="ptag" style="margin-top:24px;max-width:320px"><span>Price</span><b>$440</b><em>11 h &#183; $40/h</em></div>
</section>''')

# ---------- LOW ----------
out.write('''
<section class="slide divider" id="low">
  <img class="silk" src="img/silk.png" alt="">
  <span class="sev low">Small fixes</span>
  <h2>2 items<br>of housekeeping</h2>
</section>''')

out.write(slide('13','low','Small fix','The footer still says © 2024',
 '<p>The copyright line reads <b>“© 2024 AXY Marketing”</b> — two years behind, and it sits directly above the contact buttons where a visitor decides whether the business is still active.</p>',
 '<p>Print the year automatically so it never goes stale again.</p>',
 'now-footer.jpg','fix-footer-year.jpg','Today — © 2024','The same footer with the current year',
 'The site stops looking abandoned in the one place people look before they write.',
 ('2024','the year shown today'),('1 line','of code, permanent'),
 1,'p13'))

SLIDES.append(('14','Small fix','Technical housekeeping',9))
out.write(f'''
<section class="slide" id="p14">
  <img class="silk sm" src="img/silk.png" alt="">
  <div class="shead"><span class="num">14</span><h2><span class="sev low">Small fix</span>Technical housekeeping</h2></div>
  <p class="lead">Nothing here is visible to a visitor on its own, so we group it into one item. All six were checked live today.</p>
  <div class="tmap">
    <div class="t mid"><b>The English page points Google to the redirect page</b><span>/en/ declares canonical https://axyglobal.com/ — the empty redirect — while /ru/ correctly points to itself. Set /en/ to itself.</span><em>1 h · $40</em></div>
    <div class="t mid"><b>No robots.txt and no sitemap.xml</b><span>Both return 404. A two-language sitemap helps Google pair the pages correctly.</span><em>1 h · $40</em></div>
    <div class="t mid"><b>The logo sends Russian visitors to the English page</b><span>The logo link is “#”, which resolves to the root and its redirect to /en/. We clicked it on /ru/ and landed on /en/. Point it to the current language.</span><em>1 h · $40</em></div>
    <div class="t mid"><b>Escape closes none of the three windows</b><span>Case, service and form windows ignore the Escape key; only the reviews lightbox handles it. Add Escape and keep focus inside the window.</span><em>2 h · $80</em></div>
    <div class="t mid"><b>41 of 51 images load immediately</b><span>Only 10 use lazy loading, so reviews and team photos far below the fold download with the first screen.</span><em>1 h · $40</em></div>
    <div class="t mid"><b>Styles are compiled in the browser on every visit</b><span>The page loads the Tailwind Play CDN — a development tool that generates CSS at runtime. Compile once at build time.</span><em>3 h · $120</em></div>
  </div>
  <div class="ptag" style="margin-top:24px;max-width:320px"><span>Price</span><b>$360</b><em>9 h &#183; $40/h</em></div>
</section>''')

# ---------- PRICING ----------
def rows(sevlab):
    return [(t, '%d h' % h, '$%s' % format(h*RATE, ',')) for (n, s, t, h) in SLIDES if s == sevlab]
def tot(sevlab):
    h = sum(h for (n, s, t, h) in SLIDES if s == sevlab); return h, h*RATE
def plist(title, sev, sevlab):
    rs = rows(sevlab); h, p = tot(sevlab)
    body = ''.join(f'<div class="prow"><i>{n}</i><span>{t}</span><em>{hh} h</em><b>${format(hh*RATE, ",")}</b></div>' for (n, s, t, hh) in SLIDES if s == sevlab)
    return (f'<div class="plist"><h4><span class="sev {sev}">{sevlab}</span>{title}</h4>{body}'
            f'<div class="ptotal"><span>Subtotal</span><span>{h} h · ${format(p, ",")}</span></div></div>')
ch, cp = tot('First wave'); mh, mp = tot('Second wave'); lh, lp = tot('Small fix')
TH, TP = ch+mh+lh, cp+mp+lp
out.write(f'''
<section class="slide" id="price">
  <img class="silk sm" src="img/silk.png" alt="">
  <div class="shead"><h2>Time and price<small>Development hours at a fixed $40/hour. One row per slide; the price of each item is on its slide.</small></h2></div>
  <div class="pcol">
    {plist("First wave — on the path to a request","crit","First wave")}
    {plist("Second wave — clarity and trust","imp","Second wave")}
    {plist("Small fixes","low","Small fix")}
  </div>
  <div class="pbox" style="margin-top:30px">
    <p>Total estimate</p>
    <div class="sum">{TH} h &#183; ${format(TP, ",")}</div>
    <p>Fixed price for development, at $40 per hour.</p>
    <div class="terms"><span>First wave — {ch} h</span><span>Second wave — {mh} h</span><span>Small fixes — {lh} h</span></div>
  </div>
  <p class="fine" style="margin-top:22px">Development only. Content from your side (client names and permissions for the cases, real reply time, copy for emails) and third-party subscriptions (email service, TikTok Ads account) are not included.</p>
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
    <li><i>01</i><span><b>GTM container GTM-WR5634BL.</b> Does any tag forward the lead to GA4 (G-5CBQT3ZJFR) or Google Ads? The site code itself only calls Meta. We need a view of the container to answer slide 12 precisely.</span></li>
    <li><i>02</i><span><b>Where the requests live.</b> Each one goes to Google Sheets, Telegram and the LeadFlow webhook — which of these is the system of record, who replies, and what is the real reply time we can print on the site?</span></li>
    <li><i>03</i><span><b>Speed score.</b> Google’s PageSpeed API refused every request today (daily quota). Our in-browser figures on a fast connection: first paint 1.26 s, full load 5.3 s. We will re-run the official score before work starts.</span></li>
    <li><i>04</i><span><b>Names in the cases and an external review profile.</b> Seven Amazon and TikTok cases are labelled by category only; we found no AXY profile on Clutch, Trustpilot or Google today. Which clients may be named, and is there a review profile we should link?</span></li>
    <li><i>05</i><span><b>The Russian version.</b> Should the same changes ship on /ru/ at the same time? The two pages share the code, so most items carry over at little extra cost.</span></li>
    <li><i>06</i><span><b>Email service.</b> For the follow-up sequence on slide 12 — Brevo, Klaviyo or Mailchimp, and who holds the subscription.</span></li>
    <li><i>07</i><span><b>Contact and decision-maker.</b> Team Pro holds no call notes for AXY; requests so far came through Ivan. Who signs off on this plan?</span></li>
  </ul>
</section>

<section class="slide end">
  <img class="silk sm" src="img/silk.png" alt="">
  <img src="img/logo-md.png" alt="MileDevs">
  <h2>Next step</h2>
  <p>We agree on the first wave and start there — the form, the thank-you state, the mobile button and the media the phone should not download. {ch} hours of work, and it is the part that changes how many requests you get from the same traffic.</p>
  <p class="fine">Every figure in this document was measured live on axyglobal.com on 28 September 2026 — iPhone viewport 390×844 and desktop 1440×900, network requests, tags and DOM read in the browser, submit behaviour read from the site’s own code (no test request was sent). The “We propose” screens are your own page with one element changed; they are illustrative, not final design.</p>
</section>
</body>
</html>''')

html = out.getvalue()
open(os.path.join(ROOT,'index.html'),'w',encoding='utf-8').write(html)
json.dump({'slides':SLIDES,'totals':{'crit':[ch,cp],'med':[mh,mp],'low':[lh,lp],'all':[TH,TP]}}, open(os.path.join(BASE,'slides.json'),'w'), ensure_ascii=False, indent=1)
print('written', len(html), 'chars;', len(SLIDES), 'slides; totals', ch,cp, mh,mp, lh,lp, TH,TP)

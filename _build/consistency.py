import re, html, json, sys, os
BASE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(BASE)
s=open(os.path.join(ROOT,'index.html'),encoding='utf-8').read()
txt=re.sub(r'<style.*?</style>','',s,flags=re.S); plain=html.unescape(re.sub(r'<[^>]+>',' ',txt))
fail=[]
ids=set(re.findall(r'id="([^"]+)"',s)); links=re.findall(r'href="#([^"]+)"',s)
bad=[l for l in links if l not in ids]; print('broken anchors:',bad or 'none'); fail+=bad
RATE=20
# slides: num, sev label (Anna 01.10: no per-slide prices; pricing = 3 lines in EUR)
slides=[]; props=[]
for m in re.finditer(r'<span class="num">(\d+)</span><h2><span class="sev (\w+)">([^<]+)</span>([^<]+)</h2>',s):
    num,sev,lab,title=m.groups(); seg=s[m.end():s.index('</section>',m.end())]
    if sev=='extra':
        if 'class="ptag"' not in seg: fail.append(f'slide {num}: no price tag')
        props.append(num); print(f'  slide {num} [{lab:12}] {title.strip()[:55]} (proposal)'); continue
    pt=re.search(r'<div class="ptag"><span>Price</span><b>€([\d,]+)</b><em>(\d+) h',seg)
    if not pt: fail.append(f'slide {num}: no price/hours tag'); continue
    price=int(pt.group(1).replace(',','')); hrs=int(pt.group(2)); slides.append((num,sev,lab,title.strip(),hrs,price))
    if price!=hrs*RATE: fail.append(f'slide {num} €{price} != {hrs}*{RATE}')
    print(f'  slide {num} [{lab:12}] {title.strip()[:55]:55} {hrs:>2} h €{price}')
if '$' in plain: fail.append('dollar sign in deck (EUR only)')
for sec in ['Proven results','Questions before we start','Bewertungen']:
    if sec in plain: fail.append('removed content back: '+sec)
nums=sorted([int(x[0]) for x in slides]+[int(x) for x in props])
if nums!=list(range(1,len(nums)+1)): fail.append(f'numbering {nums}')
rows=re.findall(r'<div class="prow(?: prop)?"[^>]*><i>([^<]*)</i><span[^>]*>(.*?)</span><em[^>]*>([^<]+)</em><b[^>]*>([^<]+)</b></div>',s)
print('price rows:',rows)
if len(rows)!=3 or not all(r[3].startswith('€') for r in rows): fail.append('pricing must be 3 EUR lines')
TH0=sum(x[4] for x in slides)
if rows and (rows[0][3]!=f'€{TH0*RATE:,}' or f'{TH0} h' not in rows[0][2]): fail.append(f'store line {rows[0][2:]} != {TH0} h €{TH0*RATE}')
order=['crit','imp','low']; groups={g:[0,0] for g in order}
cnt={g:sum(1 for x in slides if x[1]==g) for g in order}
for g,pat in [('crit',r'<span class="sev crit">(?:Critical|First wave)</span>\s*<h2>(\d+) changes'),('imp',r'<span class="sev imp">(?:Medium|Second wave)</span>\s*<h2>(\d+) changes'),('low',r'<span class="sev low">Small fix</span>\s*<h2>(\d+)')]:
    m=re.search(pat,s)
    if not m or int(m.group(1))!=cnt[g]: fail.append(f'divider {g} {m and m.group(1)} != {cnt[g]}')
for g,pat in [('crit',r'<a href="#critical">(\d+) (?:critical|first-wave)'),('imp',r'<a href="#medium">(\d+) (?:medium|second-wave)'),('low',r'<a href="#low">(\d+) small fixes')]:
    m=re.search(pat,s)
    if not m or int(m.group(1))!=cnt[g]: fail.append(f'toc {g} {m and m.group(1)} != {cnt[g]}')
TH=sum(x[4] for x in slides); TP=TH*RATE
kp=re.findall(r'<div class="kpi"><b>([^<]+)</b><span>([^<]+)</span>',s)
kd=dict((b,a) for a,b in kp)
if (kd.get('Critical') or kd.get('First wave'))!=str(cnt['crit']) or (kd.get('Medium') or kd.get('Second wave'))!=str(cnt['imp']) or kd.get('Small fixes')!=str(cnt['low']) or 'Dev time' in kd or 'Fixed price' in kd: fail.append(f'kpis (no hours/price before the items) {kd}')
if f'Fourteen items' not in plain and len(slides)==14: pass
# images exist
imgs=set(re.findall(r'src="img/([^"]+)"',s)); missing=[i for i in imgs if not os.path.exists(os.path.join(ROOT,'img',i))]
print('images',len(imgs),'missing',missing or 'none'); fail+=missing
# cyrillic / AI
cyr=re.findall(r'[А-Яа-яЇїІіЄєҐґ]+',plain.replace('Политика конфиденциальности',''))  # quoted RU page title is evidence, allowed; print('cyrillic tokens:',cyr[:10] or 'none'); fail+=cyr
ai=re.findall(r'\bAI\b',plain.replace('AI Blog Automation','').replace('AI-search',''))  # product name approved by Anna (LinaBurduk, 15.09); print('AI mentions:',ai or 'none'); fail+=ai
# numbers vs verify.json
V=json.load(open(os.path.join(BASE,'verify.json')))
def flat(o,acc):
    if isinstance(o,dict): [flat(v,acc) for v in o.values()]
    elif isinstance(o,list): [flat(v,acc) for v in o]
    elif isinstance(o,bool): pass
    elif isinstance(o,(int,float)): acc.add(str(o).rstrip('0').rstrip('.') if isinstance(o,float) else str(o))
    elif isinstance(o,str): [acc.add(n) for n in re.findall(r'\d[\d,]*\.?\d*',o)]
allowed=set(); flat(V,allowed); allowed|={n.replace(',','') for n in allowed}
for n in range(1,31): allowed.add(str(n)); allowed.add('%02d'%n)
allowed|={str(x[5]) for x in slides}|{str(x[4]) for x in slides}|{str(TH),str(TP),'320'}
allowed|={str(v) for v in [RATE,700,750,1110,20,40,80,120,240,2026,29,390,844,1440,900,19,168636,9,41]}
found=re.findall(r'\d[\d,]*(?:\.\d+)?',plain)
unk=sorted({f for f in found if f.replace(',','') not in allowed and f not in allowed})
print('numbers not in verify.json:',unk or 'none'); fail+=unk
print('RESULT:','PASS' if not fail else 'FAIL '+str(fail))
sys.exit(0 if not fail else 1)

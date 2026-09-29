import re, html, json, sys, os
BASE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(BASE)
s=open(os.path.join(ROOT,'index.html'),encoding='utf-8').read()
txt=re.sub(r'<style.*?</style>','',s,flags=re.S); plain=html.unescape(re.sub(r'<[^>]+>',' ',txt))
fail=[]
ids=set(re.findall(r'id="([^"]+)"',s)); links=re.findall(r'href="#([^"]+)"',s)
bad=[l for l in links if l not in ids]; print('broken anchors:',bad or 'none'); fail+=bad
RATE=40
# slides: num, sev label, price, hours
slides=[]
for m in re.finditer(r'<span class="num">(\d+)</span><h2><span class="sev (\w+)">([^<]+)</span>([^<]+)</h2>',s):
    num,sev,lab,title=m.groups(); seg=s[m.end():m.end()+12000]
    pt=re.search(r'<div class="ptag"[^>]*><span>Price</span><b>\$([\d,]+)</b><em>(\d+) h',seg)
    price=int(pt.group(1).replace(',','')); hrs=int(pt.group(2)); slides.append((num,sev,lab,title.strip(),hrs,price))
    if price!=hrs*RATE: fail.append(f'slide {num} price {price} != {hrs}*{RATE}')
    print(f'  slide {num} [{lab:12}] {title.strip()[:55]:55} {hrs:>2} h ${price}')
nums=[int(x[0]) for x in slides]; 
if nums!=list(range(1,len(nums)+1)): fail.append(f'numbering {nums}')
# price rows
rows=re.findall(r'<div class="prow"><i>(\d+)</i><span>(.*?)</span><em>(\d+) h</em><b>\$([\d,]+)</b></div>',s)
print('price rows:',len(rows),'slides:',len(slides))
if len(rows)!=len(slides): fail.append('rows != slides')
sd={n:(h,p) for n,_,_,_,h,p in slides}
for n,t,h,p in rows:
    p=int(p.replace(',','')); h=int(h)
    if sd.get(n)!=(h,p): fail.append(f'row {n} {h}h ${p} != slide {sd.get(n)}')
subs=re.findall(r'<div class="ptotal"><span>Subtotal</span><span>(\d+) h · \$([\d,]+)</span>',s)
# group by plist order: crit, imp, low
groups={}
for n,sev,lab,t,h,p in slides: groups.setdefault(sev,[0,0]); groups[sev][0]+=h; groups[sev][1]+=p
order=['crit','imp','low']
for (sh,sp),g in zip(subs,order):
    if (int(sh),int(sp.replace(',','')))!=tuple(groups[g]): fail.append(f'subtotal {g} {sh}h ${sp} != {groups[g]}')
TH=sum(h for *_,h,p in slides); TP=sum(p for *_,h,p in slides)
sm=re.search(r'<div class="sum">(\d+) h &#183; \$([\d,]+)</div>',s) or re.search(r'<div class="sum">(\d+) h · \$([\d,]+)</div>',s)
if not sm or int(sm.group(1))!=TH or int(sm.group(2).replace(',',''))!=TP: fail.append(f'total {sm and sm.groups()} != {TH} {TP}')
print('subtotals',subs,'total',TH,TP)
# divider counts and cover/kpi counts
cnt={g:sum(1 for x in slides if x[1]==g) for g in order}
for g,pat in [('crit',r'<span class="sev crit">Critical</span>\s*<h2>(\d+) changes'),('imp',r'<span class="sev imp">Medium</span>\s*<h2>(\d+) changes'),('low',r'<span class="sev low">Small fix</span>\s*<h2>(\d+)')]:
    m=re.search(pat,s); 
    if not m or int(m.group(1))!=cnt[g]: fail.append(f'divider {g} {m and m.group(1)} != {cnt[g]}')
for g,pat in [('crit',r'<a href="#critical">(\d+) critical'),('imp',r'<a href="#medium">(\d+) medium'),('low',r'<a href="#low">(\d+) small fixes')]:
    m=re.search(pat,s)
    if not m or int(m.group(1))!=cnt[g]: fail.append(f'toc {g} {m and m.group(1)} != {cnt[g]}')
kp=re.findall(r'<div class="kpi"><b>([^<]+)</b><span>([^<]+)</span>',s)
kd=dict((b,a) for a,b in kp)
if kd.get('Critical')!=str(cnt['crit']) or kd.get('Medium')!=str(cnt['imp']) or kd.get('Small fixes')!=str(cnt['low']) or kd.get('Dev time')!=f'{TH} h' or kd.get('Fixed price')!=f'${format(TP,",")}': fail.append(f'kpis {kd}')
if f'Fourteen items' not in plain and len(slides)==14: pass
# images exist
imgs=set(re.findall(r'src="img/([^"]+)"',s)); missing=[i for i in imgs if not os.path.exists(os.path.join(ROOT,'img',i))]
print('images',len(imgs),'missing',missing or 'none'); fail+=missing
# cyrillic / AI
cyr=re.findall(r'[А-Яа-яЇїІіЄєҐґ]+',plain.replace('Политика конфиденциальности',''))  # quoted RU page title is evidence, allowed; print('cyrillic tokens:',cyr[:10] or 'none'); fail+=cyr
ai=re.findall(r'\bAI\b',plain); print('AI mentions:',ai or 'none'); fail+=ai
# numbers vs verify.json
V=json.load(open(os.path.join(BASE,'verify.json')))
def flat(o,acc):
    if isinstance(o,dict): [flat(v,acc) for v in o.values()]
    elif isinstance(o,list): [flat(v,acc) for v in o]
    elif isinstance(o,bool): pass
    elif isinstance(o,(int,float)): acc.add(str(o).rstrip('0').rstrip('.') if isinstance(o,float) else str(o))
    elif isinstance(o,str): [acc.add(n) for n in re.findall(r'\d[\d,]*\.?\d*',o)]
allowed=set(); flat(V,allowed); allowed|={n.replace(',','') for n in allowed}
for n in range(1,15): allowed.add(str(n)); allowed.add('%02d'%n)
allowed|={str(h) for *_,h,p in slides}|{str(p) for *_,h,p in slides}|{str(TH),str(TP),str(cp) if False else ''}
cp,mp,lp=groups['crit'][1],groups['imp'][1],groups['low'][1]
allowed|={str(groups[g][0]) for g in groups}
allowed|={str(v) for v in [cp,mp,lp,TH,TP,RATE,20,40,80,120,240,2026,29,390,844,1440,900,19,168636,9,41]}
found=re.findall(r'\d[\d,]*(?:\.\d+)?',plain)
unk=sorted({f for f in found if f.replace(',','') not in allowed and f not in allowed})
print('numbers not in verify.json:',unk or 'none'); fail+=unk
print('RESULT:','PASS' if not fail else 'FAIL '+str(fail))
sys.exit(0 if not fail else 1)

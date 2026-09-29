const puppeteer=require('/Users/annserputko/Desktop/штаб/_Технічне/chrome-mcp-server/node_modules/puppeteer-core');
const fs=require('fs');
const CHROME='/Users/annserputko/.cache/puppeteer/chrome/mac_arm-127.0.6533.88/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const OUT='shots/'; const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const FRAME='data:image/jpeg;base64,'+fs.readFileSync('hero-frame.jpg').toString('base64');
(async()=>{
 const b=await puppeteer.launch({executablePath:CHROME,headless:'new',args:['--no-sandbox','--hide-scrollbars']});
 const p=await b.newPage();
 await p.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1');
 await p.setViewport({width:390,height:844,deviceScaleFactor:3,isMobile:true,hasTouch:true});
 const reqs=[]; p.on('response',r=>{try{reqs.push({url:r.url(),status:r.status(),len:+(r.headers()['content-length']||0)})}catch(e){}});
 await p.goto('https://axyglobal.com/en/',{waitUntil:'networkidle0',timeout:90000}); await sleep(1500);
 const R={};
 R.thirdParty=[...new Set(reqs.map(r=>{try{return new URL(r.url).host}catch(e){return 'x'}}))];
 R.clarity=reqs.filter(r=>/clarity\.ms/.test(r.url)).map(r=>r.url.slice(0,70));
 R.tiktok=reqs.filter(r=>/tiktok/.test(r.url)).length; R.fb=reqs.filter(r=>/facebook|fbevents/.test(r.url)).length; R.gtm=reqs.filter(r=>/googletagmanager/.test(r.url)).map(r=>r.url.slice(0,80)); R.ga=reqs.filter(r=>/google-analytics|analytics\.google|collect\?v=2/.test(r.url)).length;
 R.tailwindCDN=reqs.some(r=>/cdn\.tailwindcss\.com/.test(r.url));
 R.videoBytes=reqs.filter(r=>/banner\.mp4/.test(r.url)).reduce((a,r)=>a+r.len,0); R.imagePngBytes=reqs.filter(r=>/image\.png/.test(r.url)).reduce((a,r)=>a+r.len,0);
 R.totalBytes=reqs.reduce((a,r)=>a+r.len,0);
 // hero paragraph
 R.heroPara=await p.evaluate(()=>{const el=[...document.querySelectorAll('#hero *')].filter(e=>e.innerText&&e.innerText.includes('Get a free audit')&&e.innerText.length<600&&!e.querySelector('a')).sort((a,b)=>a.innerText.length-b.innerText.length)[0];const t=el.innerText.trim();return {tag:el.tagName,cls:el.className,words:t.split(/\s+/).length,chars:t.length,sentences:(t.match(/[.!?](\s|$)/g)||[]).length,fs:getComputedStyle(el).fontSize,h:Math.round(el.getBoundingClientRect().height)}});
 // mobile: is any CTA visible when scrolled mid-page (header hidden)?
 R.midPage=await p.evaluate(async()=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));for(let y=0;y<=3000;y+=250){scrollTo(0,y);await sl(100)}await sl(600);const vis=[...document.querySelectorAll('a,button')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&r.bottom>0&&r.top<innerHeight&&e.closest('#mobile-menu')==null&&/audit|consult|contact|request/i.test(e.innerText||e.getAttribute('data-source')||'')});const h=document.querySelector('header').getBoundingClientRect();return {scrollY:Math.round(scrollY),headerTop:Math.round(h.top),ctaVisible:vis.map(v=>v.innerText.trim())}});
 // BEFORE: mid-page with no CTA (cases section)
 await p.evaluate(async()=>{scrollTo(0,0);await new Promise(r=>setTimeout(r,300));for(let y=0;y<=3100;y+=250){scrollTo(0,y);await new Promise(r=>setTimeout(r,90))}await new Promise(r=>setTimeout(r,700))});
 await p.screenshot({path:OUT+'axy-now-midpage-m.png'});
 R.midShot=await p.evaluate(()=>({scrollY:Math.round(scrollY),headerTop:Math.round(document.querySelector('header').getBoundingClientRect().top)}));
 // AFTER: bottom bar
 await p.evaluate(()=>{const bar=document.createElement('div');bar.id='mock-bar';bar.style.cssText='position:fixed;left:0;right:0;bottom:0;z-index:60;padding:10px 16px 18px;background:rgba(10,20,40,.92);backdrop-filter:blur(8px);border-top:1px solid rgba(99,179,237,.35)';const hero=document.querySelector('#hero [data-source]');const a=hero.cloneNode(true);a.removeAttribute('data-source');a.style.cssText='display:flex;justify-content:center;align-items:center;width:100%;padding:16px;';bar.appendChild(a);document.body.appendChild(bar)}); await sleep(400);
 await p.screenshot({path:OUT+'axy-fix-midpage-bar-m.png'}); await p.evaluate(()=>document.getElementById('mock-bar').remove());
 // HERO before at top
 await p.evaluate(()=>scrollTo(0,0)); await sleep(700); await p.screenshot({path:OUT+'axy-now-hero-m.png'});
 // AFTER hero chips
 const para=await p.evaluate(()=>{const el=[...document.querySelectorAll('#hero *')].filter(e=>e.innerText&&e.innerText.includes('Get a free audit')&&e.innerText.length<600&&!e.querySelector('a')).sort((a,b)=>a.innerText.length-b.innerText.length)[0];el.dataset.orig=el.innerHTML;el.innerHTML='<div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin:6px 0 4px"><span style="border:1px solid rgba(99,179,237,.55);border-radius:999px;padding:9px 14px;font-size:15px;line-height:1.2;color:#e2e8f0;background:rgba(99,179,237,.10)">Not selling yet → we check demand</span><span style="border:1px solid rgba(99,179,237,.55);border-radius:999px;padding:9px 14px;font-size:15px;line-height:1.2;color:#e2e8f0;background:rgba(99,179,237,.10)">Already selling → we analyze your listing</span><span style="border:1px solid rgba(99,179,237,.55);border-radius:999px;padding:9px 14px;font-size:15px;line-height:1.2;color:#e2e8f0;background:rgba(99,179,237,.10)">Shopify store → developer audit</span></div><p style="margin:12px 0 0;font-size:17px;color:#cbd5e1">Get a <b>free audit</b> for your case.</p>';return true}); await sleep(400);
 await p.screenshot({path:OUT+'axy-fix-hero-chips-m.png'});
 await p.evaluate(()=>{const el=document.querySelector('#hero [data-orig]');el.innerHTML=el.dataset.orig});
 // AFTER hero light visual (frame from their own video) placed under the trust rows
 await p.evaluate(src=>{const cta=document.querySelector('#hero [data-source]');const wrap=cta.parentElement;const img=document.createElement('img');img.id='mock-visual';img.src=src;img.style.cssText='display:block;width:100%;border-radius:16px;margin:22px 0 0;box-shadow:0 12px 30px rgba(0,0,0,.4)';const partners=[...document.querySelectorAll('#hero *')].find(e=>e.children.length===0&&/OFFICIAL PARTNERS/i.test(e.innerText||''));const anchor=partners?partners.parentElement:wrap;anchor.parentElement.insertBefore(img,anchor)},FRAME); await sleep(600);
 await p.screenshot({path:OUT+'axy-fix-hero-visual-m.png'}); await p.evaluate(()=>document.getElementById('mock-visual').remove());
 // FORM before
 await p.evaluate(()=>document.querySelector('#hero [data-source]').click()); await sleep(1100);
 await p.screenshot({path:OUT+'axy-now-form-m.png'});
 // sent state (reproduced from the site's own success code path — NOT submitted)
 await p.evaluate(()=>{const b=document.querySelector('#multi-step-form button[type=submit]');b.dataset.o=b.textContent;b.textContent='✓ Sent!';b.style.backgroundColor='#22c55e'}); await sleep(300);
 await p.screenshot({path:OUT+'axy-now-form-sent-m.png'});
 await p.evaluate(()=>{const b=document.querySelector('#multi-step-form button[type=submit]');b.textContent=b.dataset.o;b.style.backgroundColor=''});
 // AFTER form: reorder + email + one messenger field + budget optional last + title
 await p.evaluate(()=>{const c=document.getElementById('form-modal-content');const h=c.querySelector('h2,h3');h.dataset.o=h.innerHTML;h.innerHTML='Get Your Free Store Audit';const sub=c.querySelector('p');sub.dataset.o=sub.innerHTML;sub.innerHTML='Tell us where you sell — we review the store and reply with concrete steps';
  const f=document.getElementById('multi-step-form');const box=f.querySelector('.space-y-6');const kids=[...box.children];const [budget,name,phone,tg]=kids;
  const email=name.cloneNode(true);const ei=email.querySelector('input');ei.type='email';ei.name='email';ei.placeholder='Your Email';
  const store=name.cloneNode(true);const si=store.querySelector('input');si.type='url';si.name='store';si.placeholder='Link to your store or listing (optional)';si.required=false;
  phone.querySelector('input').placeholder='Phone, Telegram or WhatsApp';
  const lbl=budget.querySelector('label');lbl.textContent='Budget you are considering (optional)';budget.querySelector('select').required=false;
  box.innerHTML='';[name,email,phone,store,budget].forEach(k=>box.appendChild(k));tg.remove();
  const btn=f.querySelector('button[type=submit]');btn.dataset.o=btn.textContent;btn.textContent='Get my free audit';}); await sleep(400);
 await p.screenshot({path:OUT+'axy-fix-form-m.png'});
 // AFTER thank-you panel (same modal, content replaced)
 await p.evaluate(()=>{const c=document.getElementById('form-modal-content');const f=document.getElementById('multi-step-form');const h=c.querySelector('h2,h3');const sub=c.querySelector('p');h.innerHTML='Thanks — your request is in';sub.innerHTML='We reply on Telegram or WhatsApp within one business day.';f.dataset.o=f.innerHTML;f.innerHTML='<div style="margin-top:8px;border:1px solid rgba(99,179,237,.4);border-radius:14px;padding:20px;text-align:left;color:#e2e8f0;font-size:16px;line-height:1.5"><div style="font-weight:700;margin-bottom:10px;color:#fff">What happens next</div><div style="margin-bottom:8px">1. We look at your store or listing</div><div style="margin-bottom:8px">2. You get a short list of what to fix and why</div><div>3. We agree on a call if you want us to do it</div></div><a href="#cases" style="display:flex;justify-content:center;align-items:center;margin-top:20px;padding:18px;border-radius:12px;background:linear-gradient(90deg,#63B3ED,#3182CE);color:#fff;font-weight:700;font-size:18px">See how similar brands grew →</a>';}); await sleep(400);
 await p.screenshot({path:OUT+'axy-fix-thanks-m.png'});
 await p.evaluate(()=>{const m=document.getElementById('form-modal-backdrop');m.querySelector('button').click()}); await sleep(600);
 // SERVICES before/after
 await p.evaluate(async()=>{document.getElementById('services').scrollIntoView({block:'start'});await new Promise(r=>setTimeout(r,900))});
 await p.screenshot({path:OUT+'axy-now-services-m.png'});
 R.servicesTop=await p.evaluate(()=>Math.round(document.getElementById('services-grid').getBoundingClientRect().top));
 await p.evaluate(()=>{const g=document.getElementById('services-grid');const cards=[...g.children];const flag={'Amazon Brand Launch & Management':'Case: sales +400% in 6 months, ACoS 18%','TikTok Shop Management':'Case: $100k+ sales in 2 days from one viral video','Shopify Store Creation':'Case: inquiries +180% with a Shopify site + app'};const picked=[];cards.forEach(c=>{const t=c.innerText.replace(/\s+/g,' ').trim();for(const k in flag)if(t.startsWith(k))picked.push([c,flag[k]])});picked.forEach(([c,res])=>{c.style.gridColumn='1 / -1';c.style.minHeight='0';c.style.height='auto';c.style.padding='18px 18px 18px';const inner=c.firstElementChild;if(inner){inner.style.flexDirection='row';inner.style.alignItems='center';inner.style.gap='14px';inner.style.textAlign='left'}const tag=document.createElement('div');tag.textContent='Flagship';tag.style.cssText='position:absolute;top:10px;right:12px;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#0b1a2e;background:#63B3ED;border-radius:999px;padding:4px 9px;font-weight:700';c.style.position='relative';c.appendChild(tag);const r=document.createElement('div');r.textContent=res;r.style.cssText='margin-top:10px;font-size:14px;color:#94a3b8;text-align:left';c.appendChild(r);g.insertBefore(c,g.firstChild)});picked.reverse().forEach(([c])=>g.insertBefore(c,g.firstChild));}); await sleep(500);
 await p.evaluate(async()=>{document.getElementById('services').scrollIntoView({block:'start'});await new Promise(r=>setTimeout(r,700))});
 await p.screenshot({path:OUT+'axy-fix-services-m.png'});
 await p.reload({waitUntil:'networkidle0'}); await sleep(1200);
 // AUDIT block before/after
 await p.evaluate(async()=>{document.getElementById('audit').scrollIntoView({block:'start'});await new Promise(r=>setTimeout(r,900))});
 await p.screenshot({path:OUT+'axy-now-audit-m.png'});
 await p.evaluate(()=>{const s=document.getElementById('audit');const cta=s.querySelector('[data-source]');const p=s.querySelector('p');p.dataset.o=p.innerHTML;p.innerHTML='<div style="text-align:left;display:inline-block;margin:0 auto;font-size:17px;line-height:1.55;color:#cbd5e1"><div>✓ Not selling yet — we check demand for your product on Amazon</div><div style="margin-top:8px">✓ Already selling — we analyze your listing and show how to grow sales</div><div style="margin-top:8px">✓ Shopify store — a developer reviews your site</div></div>';const line=document.createElement('div');line.textContent='Free · No obligation · Reply on Telegram or WhatsApp';line.style.cssText='margin-top:14px;font-size:14px;color:#94a3b8';cta.parentElement.appendChild(line)}); await sleep(400);
 await p.evaluate(async()=>{document.getElementById('audit').scrollIntoView({block:'start'});await new Promise(r=>setTimeout(r,500))});
 await p.screenshot({path:OUT+'axy-fix-audit-m.png'});
 await p.reload({waitUntil:'networkidle0'}); await sleep(1200);
 // FOOTER before + after icons (Font Awesome is already loaded on the site)
 await p.evaluate(async()=>{document.getElementById('contacts').scrollIntoView({block:'start'});await new Promise(r=>setTimeout(r,900))});
 await p.screenshot({path:OUT+'axy-now-footer-m.png'});
 R.faLoaded=await p.evaluate(()=>[...document.styleSheets].some(s=>(s.href||'').includes('font-awesome')));
 await p.evaluate(()=>{const map={linkedin:'fa-linkedin-in',instagram:'fa-instagram',facebook:'fa-facebook-f'};document.querySelectorAll('footer i[data-lucide]').forEach(i=>{const k=i.getAttribute('data-lucide');if(map[k]){const a=i.parentElement;a.style.cssText='display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:12px;border:1px solid rgba(99,179,237,.4);color:#e2e8f0;font-size:20px;margin-right:12px';i.className='fa-brands '+map[k];i.removeAttribute('data-lucide')}})}); await sleep(500);
 R.footerIconsAfter=await p.evaluate(()=>[...document.querySelectorAll('footer a[href*=linkedin],footer a[href*=instagram],footer a[href*=facebook]')].map(a=>({w:Math.round(a.getBoundingClientRect().width),h:Math.round(a.getBoundingClientRect().height),top:Math.round(a.getBoundingClientRect().top)})));
 await p.screenshot({path:OUT+'axy-fix-footer-icons-m.png'});
 await p.reload({waitUntil:'networkidle0'}); await sleep(1200);
 // year
 await p.evaluate(async()=>{document.getElementById('contacts').scrollIntoView({block:'start'});await new Promise(r=>setTimeout(r,900))});
 await p.evaluate(()=>{const f=document.querySelector('footer');const el=[...f.querySelectorAll('*')].find(e=>e.children.length===0&&/© 2024/.test(e.innerText));el.textContent=el.textContent.replace('2024','2026')}); await sleep(300);
 await p.screenshot({path:OUT+'axy-fix-footer-year-m.png'});
 await p.reload({waitUntil:'networkidle0'}); await sleep(1200);
 // touch targets: footer nav links 20px -> 44px
 await p.evaluate(async()=>{document.getElementById('contacts').scrollIntoView({block:'start'});await new Promise(r=>setTimeout(r,900))});
 await p.evaluate(()=>{document.querySelectorAll('footer a[href^="#"],footer a[href^="mailto"],footer a[href*="policy"]').forEach(a=>{a.style.display='inline-flex';a.style.alignItems='center';a.style.minHeight='44px'})}); await sleep(300);
 R.touchAfter=await p.evaluate(()=>[...document.querySelectorAll('footer a')].filter(a=>a.getBoundingClientRect().width>0).map(a=>({t:a.innerText.trim().slice(0,20),h:Math.round(a.getBoundingClientRect().height)})));
 await p.screenshot({path:OUT+'axy-fix-footer-touch-m.png'});
 await p.reload({waitUntil:'networkidle0'}); await sleep(1200);
 // reviews before/after captions
 await p.evaluate(async()=>{document.getElementById('reviews').scrollIntoView({block:'start'});await new Promise(r=>setTimeout(r,900))});
 await p.screenshot({path:OUT+'axy-now-reviews-m.png'});
 R.reviewTitles=await p.evaluate(()=>[...document.querySelectorAll('#reviews img')].slice(0,12).map(i=>i.alt||''));
 // RU logo behaviour
 await p.goto('https://axyglobal.com/ru/',{waitUntil:'networkidle0',timeout:90000}); await sleep(800);
 R.ruLogo=await p.evaluate(()=>{const a=document.querySelector('header a');return {href:a.getAttribute('href'),resolved:a.href,hasImg:!!a.querySelector('img')}});
 await p.evaluate(()=>document.querySelector('header a').click()); await sleep(2500);
 R.ruLogoLandsOn=p.url();
 fs.writeFileSync('reshoot.json',JSON.stringify(R,null,1)); console.log(JSON.stringify(R,null,1));
 await b.close();
})().catch(e=>{console.error(e);process.exit(1)});

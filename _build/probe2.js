const puppeteer=require('/Users/annserputko/Desktop/штаб/_Технічне/chrome-mcp-server/node_modules/puppeteer-core');
const fs=require('fs');
const CHROME='/Users/annserputko/.cache/puppeteer/chrome/mac_arm-127.0.6533.88/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const URL='https://axyglobal.com/en/'; const OUT='shots/';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await puppeteer.launch({executablePath:CHROME,headless:'new',args:['--no-sandbox','--hide-scrollbars']});
 const p=await b.newPage();
 await p.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1');
 await p.setViewport({width:390,height:844,deviceScaleFactor:3,isMobile:true,hasTouch:true});
 await p.goto(URL,{waitUntil:'networkidle0',timeout:90000}); await sleep(1200);
 const R={};
 // hero paragraph
 R.heroText=await p.evaluate(()=>{const ps=[...document.querySelectorAll('#hero p')].map(e=>({t:e.innerText.trim(),len:e.innerText.trim().length,words:e.innerText.trim().split(/\s+/).length,fs:getComputedStyle(e).fontSize,h:Math.round(e.getBoundingClientRect().height)}));const cta=document.querySelector('#hero a[data-source],#hero button[data-source],#hero a');return {ps,ctaY:Math.round(cta.getBoundingClientRect().top),ctaBottom:Math.round(cta.getBoundingClientRect().bottom),ctaSource:cta.getAttribute('data-source'),ctaTag:cta.tagName,ctaHref:cta.getAttribute('href')}});
 // all CTA buttons that open form
 R.ctas=await p.evaluate(()=>[...document.querySelectorAll('[data-source]')].map(e=>({t:e.innerText.trim().slice(0,30),src:e.getAttribute('data-source'),y:Math.round(e.getBoundingClientRect().top+scrollY)})));
 // open form via element click
 await p.evaluate(()=>{const c=document.querySelector('#hero [data-source]');c.click()}); await sleep(1200);
 R.formModal=await p.evaluate(()=>{const m=document.getElementById('form-modal-backdrop');const c=document.getElementById('form-modal-content');const fields=[...c.querySelectorAll('input,select,button[type=submit],label')].map(i=>{const r=i.getBoundingClientRect();return {tag:i.tagName,name:i.name||'',type:i.type||'',req:i.required,y:Math.round(r.y),h:Math.round(r.height),checked:i.checked,text:(i.placeholder||i.innerText||'').trim().slice(0,60)}});return {visible:!m.classList.contains('hidden'),opacity:getComputedStyle(m).opacity,title:c.querySelector('h2,h3')?.innerText,sub:c.querySelector('p')?.innerText,fields,source:document.getElementById('form-source')?.value,modalH:Math.round(c.getBoundingClientRect().height),modalTop:Math.round(c.getBoundingClientRect().top),scrollable:c.scrollHeight>c.clientHeight+2,vh:innerHeight}});
 await p.screenshot({path:OUT+'axy-form-modal-m.png'});
 await p.keyboard.press('Escape'); await sleep(600);
 R.formEsc=await p.evaluate(()=>!document.getElementById('form-modal-backdrop').classList.contains('hidden')?'still open':'closed');
 // close form modal via its button
 await p.evaluate(()=>{const m=document.getElementById('form-modal-backdrop');const x=m.querySelector('button:not([type=submit])');x&&x.click()}); await sleep(700);
 R.formClosedByX=await p.evaluate(()=>document.getElementById('form-modal-backdrop').classList.contains('hidden'));
 // services: tap first card
 await p.evaluate(async()=>{document.getElementById('services').scrollIntoView({block:'start'});await new Promise(r=>setTimeout(r,900))});
 await p.screenshot({path:OUT+'axy-sec-services-m.png'});
 R.serviceCards=await p.evaluate(()=>[...document.querySelectorAll('#services-grid > *')].map(c=>({t:c.innerText.replace(/\s+/g,' ').trim().slice(0,60),h:Math.round(c.getBoundingClientRect().height),w:Math.round(c.getBoundingClientRect().width),hasPrice:/\$/.test(c.innerText),hasResult:/%|x|\d/.test(c.innerText)})));
 await p.evaluate(()=>document.querySelector('#services-grid > *').click()); await sleep(1000);
 R.serviceModal=await p.evaluate(()=>{const m=document.getElementById('service-modal-backdrop');const d=document.getElementById('service-modal-details');return {visible:!m.classList.contains('hidden'),text:d.innerText.replace(/\s+/g,' ').slice(0,600),hasPrice:/\$/.test(d.innerText),ctas:[...d.querySelectorAll('a,button')].map(a=>a.innerText.trim().slice(0,40))}});
 await p.screenshot({path:OUT+'axy-service-modal-m.png'});
 await p.keyboard.press('Escape'); await sleep(500);
 R.serviceEsc=await p.evaluate(()=>!document.getElementById('service-modal-backdrop').classList.contains('hidden')?'still open':'closed');
 await p.evaluate(()=>{const m=document.getElementById('service-modal-backdrop');const x=m.querySelector('button');x&&x.click()}); await sleep(600);
 // cases: tabs, modal content details (proofs?)
 await p.evaluate(()=>document.querySelector('.portfolio-case').click()); await sleep(900);
 R.caseModal=await p.evaluate(()=>{const c=document.getElementById('case-modal-content');const imgs=[...c.querySelectorAll('img')].map(i=>i.getAttribute('src').split('/').pop());return {text:c.innerText.replace(/\s+/g,' ').slice(0,1500),imgs,ctas:[...c.querySelectorAll('a,button')].map(a=>({t:a.innerText.trim().slice(0,40),src:a.getAttribute('data-source')}))}});
 await p.evaluate(()=>{const m=document.getElementById('case-modal-backdrop');const x=m.querySelector('button');x&&x.click()}); await sleep(600);
 // case card AFTER state: make buttons visible
 await p.evaluate(async()=>{const c=document.querySelector('.portfolio-case');c.scrollIntoView({block:'center'});await new Promise(r=>setTimeout(r,800))});
 await p.screenshot({path:OUT+'axy-sec-casecard-m.png'});
 await p.evaluate(()=>{document.querySelectorAll('.case-details-btn').forEach(b=>{b.style.opacity='1'})}); await sleep(300);
 R.caseBtnText=await p.evaluate(()=>document.querySelector('.case-details-btn').innerText.trim());
 await p.screenshot({path:OUT+'axy-fix-casecard-m.png'});
 await p.evaluate(()=>{document.querySelectorAll('.case-details-btn').forEach(b=>{b.style.opacity=''})});
 // cases: all 10 titles and proof presence
 R.caseCards=await p.evaluate(()=>[...document.querySelectorAll('.portfolio-case')].map(c=>({t:c.innerText.replace(/\s+/g,' ').trim().slice(0,90),tab:c.closest('[id$=-cases]')?.id})));
 // reviews section
 await p.evaluate(async()=>{document.getElementById('reviews').scrollIntoView({block:'start'});await new Promise(r=>setTimeout(r,900))});
 await p.screenshot({path:OUT+'axy-sec-reviews-m.png'});
 R.reviews=await p.evaluate(()=>{const s=document.getElementById('reviews');return {text:s.innerText.replace(/\s+/g,' '),imgs:s.querySelectorAll('img').length,hasStars:/★|⭐|\d\.\d\/5|rating/i.test(s.innerHTML),anim:[...s.querySelectorAll('*')].some(e=>getComputedStyle(e).animationName!=='none')}});
 // team
 await p.evaluate(async()=>{document.getElementById('team').scrollIntoView({block:'start'});await new Promise(r=>setTimeout(r,900))});
 await p.screenshot({path:OUT+'axy-sec-team-m.png'});
 await p.evaluate(async()=>{scrollBy(0,700);await new Promise(r=>setTimeout(r,700))});
 await p.screenshot({path:OUT+'axy-sec-team2-m.png'});
 R.team=await p.evaluate(()=>{const s=document.getElementById('team');return {imgs:[...s.querySelectorAll('img')].filter(i=>i.getBoundingClientRect().width>0).map(i=>({src:i.getAttribute('src').split('/').pop(),w:Math.round(i.getBoundingClientRect().width)})),links:[...s.querySelectorAll('a')].map(a=>a.href),partnerNode:!!s.querySelector('[data-lucide=handshake], svg.lucide-handshake'),text:s.innerText.replace(/\s+/g,' ').slice(0,900)}});
 // audit section
 await p.evaluate(async()=>{document.getElementById('audit').scrollIntoView({block:'start'});await new Promise(r=>setTimeout(r,900))});
 await p.screenshot({path:OUT+'axy-sec-audit-m.png'});
 R.audit=await p.evaluate(()=>{const s=document.getElementById('audit');return {text:s.innerText.replace(/\s+/g,' '),ctas:[...s.querySelectorAll('a,button')].map(a=>a.innerText.trim())}});
 R.auditMentions=await p.evaluate(()=>(document.body.innerText.match(/free audit/gi)||[]).length);
 // footer AFTER: icons rendered + year
 await p.evaluate(async()=>{document.getElementById('contacts').scrollIntoView({block:'start'});await new Promise(r=>setTimeout(r,900))});
 await p.screenshot({path:OUT+'axy-b4-footer-m.png'});
 R.footerIconsBefore=await p.evaluate(()=>[...document.querySelectorAll('footer a[href*=linkedin],footer a[href*=instagram],footer a[href*=facebook]')].map(a=>({h:a.href.slice(0,40),w:Math.round(a.getBoundingClientRect().width),inner:a.innerHTML.trim().slice(0,80)})));
 await p.evaluate(()=>{lucide.createIcons();document.querySelectorAll('footer a[href*=linkedin],footer a[href*=instagram],footer a[href*=facebook]').forEach(a=>{const s=a.querySelector('svg');if(s){s.style.width='24px';s.style.height='24px';s.style.color='#cbd5e1'}});const f=document.querySelector('footer');f.innerHTML=f.innerHTML.replace('© 2024','© 2026')}); await sleep(400);
 R.footerIconsAfter=await p.evaluate(()=>[...document.querySelectorAll('footer a[href*=linkedin],footer a[href*=instagram],footer a[href*=facebook]')].map(a=>({w:Math.round(a.getBoundingClientRect().width),h:Math.round(a.getBoundingClientRect().height)})));
 await p.screenshot({path:OUT+'axy-fix-footer-m.png'});
 // legal pages screenshots
 await p.goto('https://axyglobal.com/privacy-policy.html',{waitUntil:'networkidle0'}); await sleep(600); await p.screenshot({path:OUT+'axy-privacy-ru-m.png'});
 R.privacyRu=await p.evaluate(()=>({lang:document.documentElement.lang,h1:document.querySelector('h1')?.innerText,title:document.title}));
 await p.goto('https://axyglobal.com/privacy-policy-en.html',{waitUntil:'networkidle0'}); await sleep(600); await p.screenshot({path:OUT+'axy-privacy-en-m.png'});
 R.privacyEn=await p.evaluate(()=>({lang:document.documentElement.lang,h1:document.querySelector('h1')?.innerText,title:document.title}));
 fs.writeFileSync('probe2.json',JSON.stringify(R,null,1)); console.log(JSON.stringify(R,null,1));
 await b.close();
})().catch(e=>{console.error(e);process.exit(1)});

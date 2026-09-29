// Mobile probe: iPhone 390x844 DPR3, network log, section screenshots, measurements
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
 const reqs=[]; p.on('response',async r=>{try{const h=r.headers();reqs.push({url:r.url(),status:r.status(),type:r.request().resourceType(),len:+(h['content-length']||0)})}catch(e){}});
 const consoleErrs=[]; p.on('pageerror',e=>consoleErrs.push(String(e))); p.on('console',m=>{if(m.type()==='error')consoleErrs.push(m.text())});
 const t0=Date.now();
 await p.goto(URL,{waitUntil:'networkidle0',timeout:90000});
 const loadMs=Date.now()-t0;
 await sleep(1500);
 const R={date:new Date().toISOString(),viewport:'390x844 DPR3',loadMs};
 // perf
 R.perf=await p.evaluate(()=>{const n=performance.getEntriesByType('navigation')[0]||{};const r=performance.getEntriesByType('resource');const pnt=performance.getEntriesByType('paint');const fcp=(pnt.find(x=>x.name==='first-contentful-paint')||{}).startTime||null;let tot=0,js=0,img=0,jsN=0,imgN=0,med=0,medN=0;r.forEach(x=>{const b=x.transferSize||0;tot+=b;if(x.initiatorType==='script'||/\.js(\?|$)/.test(x.name)){js+=b;jsN++;}if(x.initiatorType==='img'||/\.(png|jpe?g|webp|avif|gif|svg)(\?|$)/.test(x.name)){img+=b;imgN++;}if(/\.(mp4|webm|mov)(\?|$)/.test(x.name)){med+=b;medN++}});return {ttfb_ms:Math.round(n.responseStart||0),dcl_ms:Math.round(n.domContentLoadedEventEnd||0),load_ms:Math.round(n.loadEventEnd||0),fcp_ms:fcp?Math.round(fcp):null,requests:r.length,totalKB:Math.round(tot/1024),jsKB:Math.round(js/1024),jsFiles:jsN,imgKB:Math.round(img/1024),imgFiles:imgN,mediaKB:Math.round(med/1024),mediaFiles:medN,scriptTags:document.querySelectorAll('script[src]').length}});
 // initial state hero
 R.initial=await p.evaluate(()=>{const q=s=>document.querySelector(s);const rect=e=>{if(!e)return null;const r=e.getBoundingClientRect();return {x:Math.round(r.x),y:Math.round(r.y+scrollY),w:Math.round(r.width),h:Math.round(r.height),display:getComputedStyle(e).display,visible:r.width>0&&r.height>0}};
  const h1=q('h1'); const heroCta=[...document.querySelectorAll('#hero a,#hero button')].map(a=>({t:a.innerText.trim().slice(0,40),...rect(a)}));
  const video=q('video'); const vidWrap=video&&video.closest('.hidden'); 
  const heroImgs=[...document.querySelectorAll('#hero img')].map(i=>({src:i.getAttribute('src'),...rect(i),natural:i.naturalWidth+'x'+i.naturalHeight,complete:i.complete}));
  const header=q('header')||q('nav'); const bodyFs=getComputedStyle(document.body).fontSize;
  const sub=q('#hero p'); 
  return {docH:document.documentElement.scrollHeight,h1:h1&&{text:h1.innerText.trim(),...rect(h1),fs:getComputedStyle(h1).fontSize},sub:sub&&{text:sub.innerText.trim().slice(0,300),len:sub.innerText.trim().length,...rect(sub),fs:getComputedStyle(sub).fontSize},heroCta,video:video&&{...rect(video),wrapClass:vidWrap&&vidWrap.className,readyState:video.readyState,paused:video.paused,poster:video.getAttribute('poster')},heroImgs,header:header&&{...rect(header),position:getComputedStyle(header).position},bodyFs};
 });
 await p.screenshot({path:OUT+'axy-b11-hero-m.png'});
 // sticky header behaviour
 R.sticky=await p.evaluate(async()=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));const vis=()=>{const h=document.querySelector('header')||document.querySelector('nav');if(!h)return null;const r=h.getBoundingClientRect();return {top:Math.round(r.top),h:Math.round(r.height),visible:r.bottom>0&&r.top<80&&getComputedStyle(h).visibility!=='hidden'&&getComputedStyle(h).opacity!=='0',transform:getComputedStyle(h).transform,position:getComputedStyle(h).position}};
  const atTop=vis(); for(let y=0;y<=1600;y+=200){scrollTo(0,y);await sl(120)} await sl(500); const down=vis(); scrollTo(0,1400);await sl(150);scrollTo(0,1250);await sl(600); const up=vis(); return {atTop,onScrollDown:down,onScrollUp:up}});
 await p.screenshot({path:OUT+'axy-b1-header-scrolled-m.png'});
 // step scroll through whole page to trigger lazy/reveal, record height growth
 R.heights=await p.evaluate(async()=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));const hs=[];for(let y=0;y<document.documentElement.scrollHeight+800;y+=400){scrollTo(0,y);await sl(130);hs.push(document.documentElement.scrollHeight)}scrollTo(0,0);await sl(400);return {min:Math.min(...hs),max:Math.max(...hs),final:document.documentElement.scrollHeight}});
 // images
 R.images=await p.evaluate(()=>{const im=[...document.images];return {total:im.length,lazy:im.filter(i=>i.loading==='lazy').length,noAlt:im.filter(i=>!i.hasAttribute('alt')||!i.alt.trim()).length,webp:im.filter(i=>/\.webp/i.test(i.currentSrc||i.src)).length,rendered0:im.filter(i=>{const r=i.getBoundingClientRect();return r.width===0||r.height===0}).length,list:im.map(i=>{const r=i.getBoundingClientRect();return {src:(i.currentSrc||i.src).split('/').pop().slice(0,50),w:Math.round(r.width),h:Math.round(r.height),nat:i.naturalWidth+'x'+i.naturalHeight,lazy:i.loading}})}});
 // touch targets
 R.touch=await p.evaluate(()=>{const els=[...document.querySelectorAll('a,button,input,select,[role=button]')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&e.closest('#mobile-menu,#form-modal-backdrop,#case-modal-backdrop,#service-modal-backdrop,#reviewLightbox')==null});const small=els.filter(e=>{const r=e.getBoundingClientRect();return r.width<44||r.height<44});return {total:els.length,small:small.length,smallList:small.map(e=>{const r=e.getBoundingClientRect();return {t:(e.innerText||e.getAttribute('aria-label')||e.getAttribute('href')||e.tagName).trim().slice(0,30),w:Math.round(r.width),h:Math.round(r.height),where:(e.closest('footer')?'footer':e.closest('header,nav')?'header':e.closest('section')&&e.closest('section').id||'')}})}});
 // fonts
 R.fonts=await p.evaluate(()=>{const c={};[...document.querySelectorAll('p,li,a,span,label,input,select,button')].forEach(e=>{const r=e.getBoundingClientRect();if(r.width===0||!e.innerText||!e.innerText.trim())return;const fs=getComputedStyle(e).fontSize;c[fs]=(c[fs]||0)+1});const inputs=[...document.querySelectorAll('input,select')].map(i=>({name:i.name,type:i.type,fs:getComputedStyle(i).fontSize,autocomplete:i.getAttribute('autocomplete'),inputmode:i.getAttribute('inputmode'),required:i.required,checked:i.checked}));return {textSizes:c,inputs}});
 // footer
 await p.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight)); await sleep(800);
 R.footer=await p.evaluate(()=>{const f=document.querySelector('footer');if(!f)return null;const links=[...f.querySelectorAll('a')].map(a=>{const r=a.getBoundingClientRect();const svg=a.querySelector('svg,i');return {text:a.innerText.trim().slice(0,30),href:a.getAttribute('href'),resolved:a.href,w:Math.round(r.width),h:Math.round(r.height),icon:svg?{tag:svg.tagName,w:Math.round(svg.getBoundingClientRect().width),h:Math.round(svg.getBoundingClientRect().height)}:null}});return {text:f.innerText.replace(/\s+/g,' ').slice(0,700),links,lucidePlaceholders:f.querySelectorAll('i[data-lucide]').length,svgs:f.querySelectorAll('svg').length}});
 await p.screenshot({path:OUT+'axy-b4-footer-m.png'});
 // sections screenshots
 const secs=['services','cases','reviews','team','audit','contacts'];
 R.sections={};
 for(const id of secs){const ok=await p.evaluate(async id=>{const e=document.getElementById(id);if(!e)return false;e.scrollIntoView({block:'start'});await new Promise(r=>setTimeout(r,900));return {y:Math.round(e.getBoundingClientRect().top+scrollY),h:Math.round(e.getBoundingClientRect().height),text:e.innerText.replace(/\s+/g,' ').slice(0,900)}},id);R.sections[id]=ok;await p.screenshot({path:OUT+`axy-sec-${id}-m.png`});}
 // services cards
 R.services=await p.evaluate(()=>[...document.querySelectorAll('#services-grid > *')].map(c=>({t:c.innerText.replace(/\s+/g,' ').slice(0,80),h:Math.round(c.getBoundingClientRect().height),hasBtn:!!c.querySelector('a,button'),cursor:getComputedStyle(c).cursor})));
 // cases
 R.cases=await p.evaluate(()=>{const cards=[...document.querySelectorAll('.portfolio-case')];return {count:cards.length,visibleCount:cards.filter(c=>c.getBoundingClientRect().height>0).length,first:cards.slice(0,3).map(c=>{const btn=c.querySelector('.case-details-btn');return {t:c.innerText.replace(/\s+/g,' ').slice(0,120),btn:btn&&{text:btn.innerText.trim(),opacity:getComputedStyle(btn).opacity,h:Math.round(btn.getBoundingClientRect().height)},cursor:getComputedStyle(c).cursor,onclick:!!c.onclick}})}});
 // team photos
 R.team=await p.evaluate(()=>[...document.querySelectorAll('#team img')].map(i=>{const r=i.getBoundingClientRect();return {src:i.getAttribute('src').split('/').pop(),w:Math.round(r.width),h:Math.round(r.height),nat:i.naturalWidth+'x'+i.naturalHeight}}));
 R.teamText=await p.evaluate(()=>{const t=document.getElementById('team');return t&&t.innerText.replace(/\s+/g,' ').slice(0,1200)});
 R.reviews=await p.evaluate(()=>{const t=document.getElementById('reviews');const imgs=[...t.querySelectorAll('img')];return {imgs:imgs.length,text:t.innerText.replace(/\s+/g,' ').slice(0,600),imgSrc:imgs.slice(0,12).map(i=>i.getAttribute('src').split('/').pop())}});
 // tap case card
 await p.evaluate(async()=>{const c=document.querySelector('.portfolio-case');c.scrollIntoView({block:'center'});await new Promise(r=>setTimeout(r,800))});
 await p.screenshot({path:OUT+'axy-sec-casecard-m.png'});
 const cardBox=await p.evaluate(()=>{const c=document.querySelector('.portfolio-case');const r=c.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height*0.4}});
 await p.touchscreen.tap(cardBox.x,cardBox.y); await sleep(1000);
 R.caseModal=await p.evaluate(()=>{const m=document.getElementById('case-modal-backdrop');const st=getComputedStyle(m);return {display:st.display,opacity:st.opacity,cls:m.className,visible:st.display!=='none'&&st.opacity!=='0'&&!m.classList.contains('hidden'),text:document.getElementById('case-modal-content')?.innerText.replace(/\s+/g,' ').slice(0,500),bodyOverflow:getComputedStyle(document.body).overflow}});
 await p.screenshot({path:OUT+'axy-case-modal-m.png'});
 // escape test
 await p.keyboard.press('Escape'); await sleep(500);
 R.caseModalAfterEsc=await p.evaluate(()=>{const m=document.getElementById('case-modal-backdrop');const st=getComputedStyle(m);return {display:st.display,opacity:st.opacity,cls:m.className}});
 // close via X
 const closed=await p.evaluate(()=>{const x=document.querySelector('#case-modal-backdrop button, #case-modal-backdrop [data-lucide=x], #case-modal-backdrop .close');if(x){x.click();return true}return false}); await sleep(600);
 R.caseModalClosed=closed;
 // open form modal via hero CTA
 await p.evaluate(()=>scrollTo(0,0)); await sleep(500);
 const cta=await p.evaluate(()=>{const a=[...document.querySelectorAll('#hero a,#hero button')][0];const r=a.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,t:a.innerText}});
 await p.touchscreen.tap(cta.x,cta.y); await sleep(1000);
 R.formModal=await p.evaluate(()=>{const m=document.getElementById('form-modal-backdrop');const st=getComputedStyle(m);const c=document.getElementById('form-modal-content');const fields=[...c.querySelectorAll('input,select')].map(i=>{const r=i.getBoundingClientRect();return {name:i.name,type:i.type,req:i.required,y:Math.round(r.y),h:Math.round(r.height),fs:getComputedStyle(i).fontSize,checked:i.checked,placeholder:i.placeholder}});return {visible:st.display!=='none'&&!m.classList.contains('hidden'),title:c.querySelector('h2,h3')?.innerText,text:c.innerText.replace(/\s+/g,' ').slice(0,700),fields,submit:c.querySelector('button[type=submit]')?.innerText,source:document.getElementById('form-source')?.value,modalH:Math.round(c.getBoundingClientRect().height),scrollable:c.scrollHeight>c.clientHeight}});
 await p.screenshot({path:OUT+'axy-form-modal-m.png'});
 await p.keyboard.press('Escape'); await sleep(400);
 R.formModalAfterEsc=await p.evaluate(()=>{const m=document.getElementById('form-modal-backdrop');return {cls:m.className,display:getComputedStyle(m).display}});
 // mobile menu
 await p.evaluate(()=>{const m=document.getElementById('form-modal-backdrop');const x=m.querySelector('button');x&&x.click()}); await sleep(400);
 const burger=await p.evaluate(()=>{const b=document.querySelector('header button, nav button, [id*=menu-btn], [id*=menu-toggle]');if(!b)return null;const r=b.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,w:Math.round(r.width),h:Math.round(r.height),label:b.getAttribute('aria-label')}});
 R.burger=burger; if(burger){await p.touchscreen.tap(burger.x,burger.y);await sleep(700);R.mobileMenu=await p.evaluate(()=>{const m=document.getElementById('mobile-menu');return {cls:m.className,display:getComputedStyle(m).display,text:m.innerText.replace(/\s+/g,' ').slice(0,300),links:[...m.querySelectorAll('a')].map(a=>{const r=a.getBoundingClientRect();return {t:a.innerText.trim(),h:Math.round(r.height)}})}});await p.screenshot({path:OUT+'axy-b11-menu-m.png'});}
 // network summary
 R.network={total:reqs.length,byType:{},media:reqs.filter(r=>/\.(mp4|webm)/.test(r.url)||r.type==='media').map(r=>({u:r.url.split('/').pop(),s:r.status,len:r.len})),hiddenHero:reqs.filter(r=>/image\.png|banner\.mp4/.test(r.url)).map(r=>({u:r.url.split('/').pop(),s:r.status,len:r.len})),thirdParty:[...new Set(reqs.map(r=>{try{return new URL(r.url).host}catch(e){return ''}}))],fails:reqs.filter(r=>r.status>=400).map(r=>({u:r.url.slice(0,90),s:r.status}))};
 reqs.forEach(r=>{R.network.byType[r.type]=(R.network.byType[r.type]||0)+1});
 R.consoleErrs=consoleErrs.slice(0,10);
 // legal links resolved + status (following base href)
 R.legal=await p.evaluate(()=>[...document.querySelectorAll('a[href*="policy"]')].map(a=>({text:a.innerText.trim(),href:a.getAttribute('href'),resolved:a.href,where:a.closest('footer')?'footer':a.closest('form')?'form':'other'})));
 for(const l of R.legal){try{const r=await fetch(l.resolved);l.status=r.status;const t=await r.text();l.lang=(t.match(/<html[^>]*lang="([^"]+)"/)||[])[1];l.title=(t.match(/<title>([^<]*)/)||[])[1];}catch(e){l.status='ERR'}}
 fs.writeFileSync('probe.json',JSON.stringify(R,null,1));
 console.log(JSON.stringify(R,null,1).slice(0,30000));
 await b.close();
})().catch(e=>{console.error(e);process.exit(1)});

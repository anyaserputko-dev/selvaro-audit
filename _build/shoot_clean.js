// shoot_clean.js — mobile "before" screens with cookie banner accepted. Writes img/now-*-m.jpg + _build/shoot_clean.json
const puppeteer=require('/Users/annserputko/Desktop/штаб/_Технічне/chrome-mcp-server/node_modules/puppeteer-core');
const fs=require('fs'),path=require('path');
const CHROME='/Users/annserputko/.cache/puppeteer/chrome/mac_arm-127.0.6533.88/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const ROOT=path.join(__dirname,'..'),IMG=path.join(ROOT,'img');const BASE='https://selvaro.de';
setTimeout(()=>{console.error('GLOBAL TIMEOUT');flush();process.exit(2)},170000);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));const R={date:new Date().toISOString(),shots:[],m:{}};
const flush=()=>fs.writeFileSync(path.join(__dirname,'shoot_clean.json'),JSON.stringify(R,null,1));
const log=(...a)=>console.error(...a);
(async()=>{
 const b=await puppeteer.launch({executablePath:CHROME,headless:'new',args:['--no-sandbox','--hide-scrollbars']});
 const p=await b.newPage();
 await p.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1');
 await p.setViewport({width:390,height:844,deviceScaleFactor:3,isMobile:true,hasTouch:true});
 const go=async(u,ms=2500)=>{try{await p.goto(u,{waitUntil:'domcontentloaded',timeout:30000})}catch(e){log('goto err',u,String(e).slice(0,80))}await sleep(ms)};
 const shot=async(name)=>{const f=`now-${name}-m.jpg`;try{await p.screenshot({path:path.join(IMG,f),type:'jpeg',quality:88});R.shots.push(f);log('shot',f)}catch(e){log('shot err',f,String(e).slice(0,80))}};
 const ev=async(js)=>{try{return await Promise.race([p.evaluate(js),new Promise(r=>setTimeout(()=>r('TIMEOUT'),15000))])}catch(e){return 'ERR '+String(e).slice(0,100)}};
 const scrollTo=async(y)=>{await ev(`scrollTo(0,${y})`);await sleep(700)};
 const stepTo=async(y)=>{for(let s=0;s<y;s+=700){await ev(`scrollTo(0,${s})`);await sleep(120)}await ev(`scrollTo(0,${y})`);await sleep(800)};
 // HOME with banner
 await go(BASE+'/',3500);
 R.m.cookie=await ev(`(()=>{const c=[...document.querySelectorAll('[id*="pandectes"],[class*="pandectes"],[class*="cookie"],[id*="cookie"]')].map(e=>{const r=e.getBoundingClientRect();const cs=getComputedStyle(e);return {id:e.id,cls:String(e.className).slice(0,60),x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height),pos:cs.position,z:cs.zIndex,bg:cs.backgroundColor,vis:cs.visibility,disp:cs.display}}).filter(e=>e.w>0&&e.h>0);return {vw:innerWidth,vh:innerHeight,els:c.slice(0,12)}})()`);
 R.m.clickUnderOverlay=await ev(`(()=>{const el=document.elementFromPoint(195,780);return el?{tag:el.tagName,id:el.id,cls:String(el.className).slice(0,80),text:(el.innerText||'').slice(0,40)}:null})()`);
 await shot('home-cookie');
 // accept
 const ok=await ev(`(()=>{const btns=[...document.querySelectorAll('button,a')].filter(b=>/^\\s*Ok\\s*$/i.test(b.innerText||''));const v=btns.find(b=>b.getBoundingClientRect().width>0);if(v){v.click();return 'clicked '+btns.length}return 'no Ok button'})()`);
 log('accept:',ok);await sleep(1200);
 R.m.cookieAfter=await ev(`(()=>{const c=[...document.querySelectorAll('[id*="pandectes"],[class*="pandectes"]')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0});return c.length})()`);
 await scrollTo(0);await shot('home-hero');
 R.m.home=await ev(`(()=>{const cards=[...document.querySelectorAll('.card-wrapper,.product-card,[class*="product-card"],.grid__item .card')];const first=cards[0];const prices=[...document.querySelectorAll('.price,.price-item,[class*="price"]')].filter(e=>/€/.test(e.innerText||'')&&e.getBoundingClientRect().height>0);const h1=[...document.querySelectorAll('h1')].map(h=>h.innerText.trim().slice(0,80));const secs=[...document.querySelectorAll('.shopify-section')].map(s=>({id:s.id.replace('shopify-section-',''),top:Math.round(s.getBoundingClientRect().top+scrollY),h:Math.round(s.getBoundingClientRect().height),txt:(s.innerText||'').trim().slice(0,50).replace(/\\n/g,' ')}));return {docH:document.documentElement.scrollHeight,cards:cards.length,firstCardY:first?Math.round(first.getBoundingClientRect().top+scrollY):null,firstPriceY:prices[0]?Math.round(prices[0].getBoundingClientRect().top+scrollY):null,firstPriceTxt:prices[0]?prices[0].innerText.trim().slice(0,30):null,h1,sections:secs,ann:(document.querySelector('[class*="announcement"]')||{}).innerText||null}})()`);
 const fy=(R.m.home&&R.m.home.firstCardY)||7800;
 await stepTo(1500);await shot('home-midpage');
 await stepTo(Math.max(0,fy-120));await shot('home-cards');
 await stepTo(999999);await sleep(600);await shot('home-footer');
 R.m.footer=await ev(`(()=>{const f=document.querySelector('footer,.footer,[class*="footer"]');if(!f)return null;const links=[...f.querySelectorAll('a')].map(a=>a.innerText.trim()).filter(Boolean);const pay=[...f.querySelectorAll('svg,img')].map(e=>e.getAttribute('aria-label')||e.getAttribute('alt')||e.getAttribute('class')||'').filter(Boolean).slice(0,20);return {links:links.slice(0,40),icons:pay,newsletter:!!f.querySelector('input[type=email]'),social:[...f.querySelectorAll('a[href*="instagram"],a[href*="facebook"],a[href*="tiktok"],a[href*="pinterest"],a[href*="youtube"]')].map(a=>a.href)}})()`);
 await scrollTo(0);const menu=await ev(`(()=>{const b=document.querySelector('header summary,[class*="menu-drawer"] summary,button[aria-label*="enu" i]');if(b){b.click();return true}return false})()`);await sleep(900);if(menu)await shot('home-menu');
 // COLLECTION
 await go(BASE+'/collections/all',2500);await scrollTo(0);await shot('collection-top');
 R.m.collection=await ev(`(()=>{const cards=[...document.querySelectorAll('.card-wrapper,.product-card,[class*="product-card"]')];return {cards:cards.length,soldBadges:cards.map(c=>(c.innerText||'').match(/Ausverkauft|Sold out|Warteliste/i)?1:0).reduce((a,b)=>a+b,0),firstTexts:cards.slice(0,6).map(c=>(c.innerText||'').replace(/\\s+/g,' ').slice(0,90))}})()`);
 await stepTo(1400);await shot('collection-grid');
 // PDP
 await go(BASE+'/products/lernturm-klappbar',3000);await scrollTo(0);await shot('product-top');
 R.m.pdp=await ev(`(()=>{const q=s=>document.querySelector(s);const atc=q('form[action*="/cart/add"] button[type="submit"],[name="add"]');const r=atc?atc.getBoundingClientRect():null;const rev=[...document.querySelectorAll('[class*="ruk"],[class*="review"]')].map(e=>({cls:String(e.className).slice(0,40),txt:(e.innerText||'').trim().slice(0,60),h:Math.round(e.getBoundingClientRect().height)})).filter(e=>e.txt||e.h).slice(0,8);const wish=[...document.querySelectorAll('[class*="wishlist"]')].map(e=>({cls:String(e.className).slice(0,40),disp:getComputedStyle(e).display,w:Math.round(e.getBoundingClientRect().width)}));const ship=[...document.querySelectorAll('*')].filter(e=>e.children.length===0&&/Werktage|Versandkostenfrei/.test(e.innerText||'')).map(e=>({txt:e.innerText.trim().slice(0,80),y:Math.round(e.getBoundingClientRect().top+scrollY)})).slice(0,6);const opts=[...document.querySelectorAll('variant-radios label,variant-selects select,.product-form__input label,fieldset legend')].map(e=>e.innerText.trim().slice(0,30)).slice(0,10);return {atcY:r?Math.round(r.top+scrollY):null,atcH:r?Math.round(r.height):null,atcTxt:atc?atc.innerText.trim():null,docH:document.documentElement.scrollHeight,reviews:rev,wish,ship,opts,klarna:!!q('shopify-payment-terms,[class*="klarna"]'),acc:[...document.querySelectorAll('details summary,.accordion__title')].map(e=>e.innerText.trim().slice(0,40)).slice(0,10)}})()`);
 const ay=(R.m.pdp&&R.m.pdp.atcY)||1200;await stepTo(Math.max(0,ay-500));await shot('product-buybox');
 await stepTo(ay+900);await shot('product-scrolled');
 R.m.stickyAtc=await ev(`(()=>{const btns=[...document.querySelectorAll('button,a')].filter(b=>/Warenkorb|kaufen/i.test(b.innerText||''));return btns.map(b=>{const r=b.getBoundingClientRect();return {t:b.innerText.trim().slice(0,30),top:Math.round(r.top),bottom:Math.round(r.bottom),pos:getComputedStyle(b.closest('div,section,form')||b).position}}).filter(x=>x.bottom>0&&x.top<844)})()`);
 const ry=await ev(`(()=>{const e=[...document.querySelectorAll('*')].find(e=>e.children.length===0&&/Bewertung/i.test(e.innerText||''));return e?Math.round(e.getBoundingClientRect().top+scrollY):null})()`);R.m.reviewsY=ry;
 if(typeof ry==='number'){await stepTo(Math.max(0,ry-300));await shot('product-reviews')}
 await stepTo(999999);await shot('product-bottom');
 // SOLD OUT
 await go(BASE+'/products/montessori-wendehocker',3000);await scrollTo(0);
 R.m.soldout=await ev(`(()=>{const q=s=>document.querySelector(s);const atc=q('form[action*="/cart/add"] button[type="submit"],[name="add"]');const bis=[...document.querySelectorAll('*')].filter(e=>e.children.length===0&&/Warteliste|Benachrichtig|ausverkauft/i.test(e.innerText||'')).map(e=>({txt:e.innerText.trim().slice(0,80),y:Math.round(e.getBoundingClientRect().top+scrollY),h:Math.round(e.getBoundingClientRect().height)})).slice(0,8);const forms=[...document.querySelectorAll('form,.klaviyo-form,[class*="bis"],[class*="back-in-stock"]')].map(f=>({cls:String(f.className).slice(0,50),id:f.id,h:Math.round(f.getBoundingClientRect().height),y:Math.round(f.getBoundingClientRect().top+scrollY)})).filter(f=>f.h>0).slice(0,8);return {atcTxt:atc?atc.innerText.trim():null,atcDisabled:atc?atc.disabled:null,atcY:atc?Math.round(atc.getBoundingClientRect().top+scrollY):null,bis,forms,title:(q('h1')||{}).innerText}})()`);
 const sy=(R.m.soldout&&R.m.soldout.atcY)||1200;await stepTo(Math.max(0,sy-450));await shot('product-soldout');
 // CART via add.js
 await go(BASE+'/',2500);
 const added=await ev(`fetch('/cart/add.js',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({items:[{id:65622087270749,quantity:1}]})}).then(r=>r.status)`);log('added',added);
 await go(BASE+'/',2500);
 const dr=await ev(`(()=>{const a=document.querySelector('#cart-icon-bubble,a[href="/cart"],a[href*="/cart"]');if(a){a.click();return true}return false})()`);await sleep(1800);
 R.m.drawer=await ev(`(()=>{const d=document.querySelector('cart-drawer,.drawer');if(!d)return null;const r=d.getBoundingClientRect();const t=(d.innerText||'').replace(/\\s+/g,' ').slice(0,600);return {visible:r.width>0&&getComputedStyle(d).visibility!=='hidden',cls:String(d.className).slice(0,40),text:t,btns:[...d.querySelectorAll('button,a')].map(b=>b.innerText.trim()).filter(Boolean).slice(0,12),express:!!d.querySelector('.shopify-payment-button,[class*="dynamic-checkout"],[class*="additional-checkout"]'),progress:!!d.querySelector('[class*="progress"],[class*="shipping-bar"],[class*="free-shipping"]')}})()`);
 if(dr)await shot('cart-drawer');
 await go(BASE+'/cart',3500);
 R.m.cart=await ev(`(()=>{const t=(document.body.innerText||'').replace(/\\s+/g,' ');const i=t.indexOf('Dein Warenkorb');const ex=[...document.querySelectorAll('.shopify-payment-button button,[class*="additional-checkout"] *[role=button],[class*="dynamic-checkout"] button,[data-testid*="Checkout"],[class*="wallet-button"]')].map(b=>b.getAttribute('aria-label')||b.innerText||b.title||b.className).slice(0,8);const imgs=[...document.querySelectorAll('[class*="additional-checkout"] img,[class*="additional-checkout"] svg,[class*="dynamic-checkout"] img,[class*="dynamic-checkout"] svg')].map(e=>e.getAttribute('alt')||e.getAttribute('aria-label')||'svg').slice(0,8);return {text:t.slice(i,i+700),express:ex,exprImgs:imgs,promo:!!document.querySelector('input[name=discount]'),progress:!!document.querySelector('[class*="progress"],[class*="shipping-bar"],[class*="free-shipping"]'),upsell:!!document.querySelector('product-recommendations,[class*="upsell"],[class*="recommend"]'),docH:document.documentElement.scrollHeight}})()`);
 await scrollTo(0);await shot('cart-page');await stepTo(700);await shot('cart-bottom');
 flush();await b.close();log('DONE');process.exit(0);
})().catch(e=>{log('FATAL',String(e).slice(0,200));flush();process.exit(1)});

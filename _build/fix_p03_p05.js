const puppeteer=require('/Users/annserputko/Desktop/штаб/_Технічне/chrome-mcp-server/node_modules/puppeteer-core');
const path=require('path');const IMG=path.join(__dirname,'..','img');
const CHROME='/Users/annserputko/.cache/puppeteer/chrome/mac_arm-127.0.6533.88/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
setTimeout(()=>{console.error('TIMEOUT');process.exit(2)},120000);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await puppeteer.launch({executablePath:CHROME,headless:'new',args:['--no-sandbox','--hide-scrollbars']});
 const p=await b.newPage();
 await p.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1');
 await p.setViewport({width:390,height:844,deviceScaleFactor:3,isMobile:true,hasTouch:true});
 const go=async(u)=>{await p.goto(u,{waitUntil:'domcontentloaded',timeout:30000});await sleep(3000);
   await p.evaluate(()=>{const v=[...document.querySelectorAll('button,a')].find(b=>/^\s*Ok\s*$/i.test(b.innerText||'')&&b.getBoundingClientRect().width>0);if(v)v.click();});await sleep(1000);};
 const shot=n=>p.screenshot({path:path.join(IMG,n),type:'jpeg',quality:88});
 const stepTo=async(y)=>{for(let s=0;s<y;s+=600){await p.evaluate(s=>scrollTo(0,s),s);await sleep(120)}await p.evaluate(y=>scrollTo(0,y),y);await sleep(900)};
 // p05 announcement
 await go('https://selvaro.de/');await p.evaluate(()=>scrollTo(0,0));await sleep(600);await shot('now-home-hero-m.jpg');
 await p.evaluate(()=>{const bar=document.createElement('div');bar.id='md-ann';bar.textContent='Versandkostenfrei ab 200 € · 30 Tage Rückgabe';bar.style.cssText='background:#121212;color:#fff;font:500 12.5px/36px "DM Sans",sans-serif;text-align:center;height:36px;white-space:nowrap;letter-spacing:.01em;position:relative;z-index:10';document.body.insertBefore(bar,document.body.firstChild);const h=document.querySelector('.shopify-section-header,#shopify-section-header,header');});
 await sleep(500);await p.evaluate(()=>scrollTo(0,0));await sleep(400);await shot('fix-announcement-m.jpg');console.error('p05 done');
 // p03 badges
 await go('https://selvaro.de/collections/all');await stepTo(1400);await shot('now-collection-grid-m.jpg');
 const n=await p.evaluate(()=>{const H=['sortier-legespiel-holz','klopfbank-kinder-holz','montessori-buecherregal-kinder','steckspiel-holz','stapelturm-baby','sortierbox-holz','montessori-wendehocker'];let c=0;for(const h of H){const a=document.querySelector(`a[href*="/products/${h}"]`);if(!a)continue;const card=a.closest('.card-wrapper,.card,li,.grid__item')||a;const media=card.querySelector('.card__media,.card__inner,.media,img')||card;const host=(media.tagName==='IMG'?media.parentElement:media);host.style.position='relative';if(host.querySelector('.md-badge'))continue;const s=document.createElement('span');s.className='md-badge';s.textContent='Warteliste';s.style.cssText='position:absolute;top:10px;left:10px;z-index:5;background:#121212;color:#fff;font:600 11px/1 "DM Sans",sans-serif;letter-spacing:.08em;text-transform:uppercase;padding:7px 10px;border-radius:999px';host.appendChild(s);c++;}return c;});
 console.error('badges',n);await sleep(500);await shot('fix-collection-badges-m.jpg');
 await b.close();process.exit(0);
})().catch(e=>{console.error('ERR',String(e).slice(0,200));process.exit(1)});

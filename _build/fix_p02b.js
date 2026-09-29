const puppeteer=require('/Users/annserputko/Desktop/штаб/_Технічне/chrome-mcp-server/node_modules/puppeteer-core');
const path=require('path');const IMG=path.join(__dirname,'..','img');
const CHROME='/Users/annserputko/.cache/puppeteer/chrome/mac_arm-127.0.6533.88/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
setTimeout(()=>{console.error('TIMEOUT');process.exit(2)},150000);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await puppeteer.launch({executablePath:CHROME,headless:'new',args:['--no-sandbox','--hide-scrollbars']});
 const p=await b.newPage();
 await p.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1');
 await p.setViewport({width:390,height:844,deviceScaleFactor:3,isMobile:true,hasTouch:true});
 await p.goto('https://selvaro.de/products/lernturm-klappbar',{waitUntil:'domcontentloaded',timeout:30000});await sleep(3000);
 await p.evaluate(()=>{const v=[...document.querySelectorAll('button,a')].find(b=>/^\s*Ok\s*$/i.test(b.innerText||'')&&b.getBoundingClientRect().width>0);if(v)v.click();});await sleep(1000);
 for(let s=0;s<9000;s+=600){await p.evaluate(s=>scrollTo(0,s),s);await sleep(150)}
 const info=await p.evaluate(()=>{const im=[...document.images].find(i=>/Lernturmklappbaraufbau/.test(i.currentSrc||i.src||i.getAttribute('srcset')||''));if(!im)return null;const r=im.getBoundingClientRect();return {top:Math.round(r.top+scrollY),w:Math.round(r.width),h:Math.round(r.height),disp:getComputedStyle(im).display,complete:im.complete,nat:im.naturalWidth+'x'+im.naturalHeight}});
 console.error('gif',JSON.stringify(info)); if(!info){await b.close();process.exit(1)}
 await p.evaluate(y=>scrollTo(0,y),info.top-330);await sleep(1500);
 // wait for gif to load
 for(let i=0;i<20;i++){const c=await p.evaluate(()=>{const im=[...document.images].find(i=>/Lernturmklappbaraufbau/.test(i.currentSrc||i.src));return im&&im.complete&&im.naturalWidth>0});if(c)break;await sleep(2000)}
 await sleep(800);
 await p.screenshot({path:path.join(IMG,'now-product-gif-m.jpg'),type:'jpeg',quality:88});
 await p.evaluate(()=>{const im=[...document.images].find(i=>/Lernturmklappbaraufbau/.test(i.currentSrc||i.src));const r=im.getBoundingClientRect();const c=document.createElement('canvas');c.width=im.naturalWidth||768;c.height=im.naturalHeight||432;try{c.getContext('2d').drawImage(im,0,0,c.width,c.height);im.src=c.toDataURL('image/jpeg',.9);im.removeAttribute('srcset');im.removeAttribute('data-srcset');}catch(e){}
  const host=im.parentElement;host.style.position='relative';
  const ov=document.createElement('div');ov.style.cssText='position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;pointer-events:none';
  ov.innerHTML='<div style="width:64px;height:64px;border-radius:50%;background:#fff;box-shadow:0 4px 14px rgba(0,0,0,.25);display:flex;align-items:center;justify-content:center"><svg width="24" height="26" viewBox="0 0 24 26"><path d="M3 2 L22 13 L3 24 Z" fill="#121212"/></svg></div><div style="background:rgba(18,18,18,.72);color:#fff;font:500 13px/1 \'DM Sans\',sans-serif;padding:8px 12px;border-radius:999px">Aufbau ansehen · 10 Sek.</div>';
  host.appendChild(ov);});
 await sleep(700);
 await p.screenshot({path:path.join(IMG,'fix-product-video-m.jpg'),type:'jpeg',quality:88});
 await b.close();console.error('DONE');process.exit(0);
})().catch(e=>{console.error('ERR',String(e).slice(0,200));process.exit(1)});

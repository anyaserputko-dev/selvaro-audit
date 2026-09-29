const puppeteer=require('/Users/annserputko/Desktop/штаб/_Технічне/chrome-mcp-server/node_modules/puppeteer-core');
const CHROME='/Users/annserputko/.cache/puppeteer/chrome/mac_arm-127.0.6533.88/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const fs=require('fs'); const sleep=ms=>new Promise(r=>setTimeout(r,ms)); const R={};
setTimeout(()=>{fs.writeFileSync('_build/qa_live3.json',JSON.stringify(R,null,1));console.log('TIMEOUT');process.exit(2)},140000);
const overlap=()=>{const ic=document.querySelector('.cc-revoke, .pd-floating-icon');if(!ic)return {icon:null};const r=ic.getBoundingClientRect();
 const hit=[];for(const e of document.querySelectorAll('a,button,summary,input[type=submit]')){const q=e.getBoundingClientRect();if(q.width<8||q.height<8)continue;if(q.bottom<0||q.top>innerHeight)continue;
  const ox=Math.min(r.right,q.right)-Math.max(r.left,q.left), oy=Math.min(r.bottom,q.bottom)-Math.max(r.top,q.top);
  if(ox>0&&oy>0)hit.push({t:(e.innerText||e.value||'').trim().replace(/\s+/g,' ').slice(0,46),overlapPx:Math.round(ox)+'x'+Math.round(oy),rect:[Math.round(q.x),Math.round(q.y),Math.round(q.width),Math.round(q.height)]})}
 return {icon:[Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)],overlaps:hit}};
(async()=>{
const b=await puppeteer.launch({executablePath:CHROME,headless:'new',args:['--no-sandbox','--hide-scrollbars','--disable-dev-shm-usage']});
const p=await b.newPage();
await p.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1');
await p.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true});
await p.goto('https://selvaro.de/',{waitUntil:'domcontentloaded',timeout:45000}); await sleep(3500);
R.accepted=await p.evaluate(()=>{const btn=[...document.querySelectorAll('button,a')].find(e=>/^(ok|akzeptieren|alle akzeptieren|zustimmen)$/i.test(e.innerText.trim()));if(btn){btn.click();return true}return false});
await sleep(2500);
R.home_top=await p.evaluate(overlap);
R.home_hero_cta=await p.evaluate(()=>{const c=[...document.querySelectorAll('a,button')].find(e=>/kindermöbel entdecken/i.test(e.innerText));if(!c)return null;const r=c.getBoundingClientRect();return {txt:c.innerText.trim(),rect:[Math.round(r.x),Math.round(r.y+scrollY),Math.round(r.width),Math.round(r.height)],inViewport:r.top<innerHeight&&r.bottom>0}});

// cart drawer
await p.goto('https://selvaro.de/cart',{waitUntil:'domcontentloaded',timeout:45000}); await sleep(3000);
R.cart=await p.evaluate(overlap);
fs.writeFileSync('_build/qa_live3.json',JSON.stringify(R,null,1)); console.log(JSON.stringify(R,null,1).slice(0,3500)); await b.close(); process.exit(0);
})().catch(e=>{fs.writeFileSync('_build/qa_live3.json',JSON.stringify({...R,fatal:String(e)},null,1));console.error('ERR',String(e).slice(0,200));process.exit(1)});

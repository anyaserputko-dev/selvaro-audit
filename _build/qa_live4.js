const puppeteer=require('/Users/annserputko/Desktop/штаб/_Технічне/chrome-mcp-server/node_modules/puppeteer-core');
const CHROME='/Users/annserputko/.cache/puppeteer/chrome/mac_arm-127.0.6533.88/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const fs=require('fs'); const sleep=ms=>new Promise(r=>setTimeout(r,ms)); const R={};
setTimeout(()=>{fs.writeFileSync('_build/qa_live4.json',JSON.stringify(R,null,1));console.log('TIMEOUT');process.exit(2)},130000);
(async()=>{
const b=await puppeteer.launch({executablePath:CHROME,headless:'new',args:['--no-sandbox','--hide-scrollbars','--disable-dev-shm-usage']});
const p=await b.newPage();
await p.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1');
await p.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true});
await p.goto('https://selvaro.de/',{waitUntil:'domcontentloaded',timeout:45000}); await sleep(3500);
await p.evaluate(()=>{const b=[...document.querySelectorAll('button,a')].find(e=>/^(ok|akzeptieren|zustimmen)$/i.test(e.innerText.trim()));if(b)b.click()}); await sleep(2000);
// add item then open drawer
const vid=await p.evaluate(async()=>{const r=await fetch('/products/lernturm-klappbar.js');const j=await r.json();return (j.variants.find(v=>v.available)||j.variants[0]).id});
await p.goto('https://selvaro.de/cart/add?id='+vid+'&quantity=1',{waitUntil:'domcontentloaded',timeout:45000}); await sleep(1500);
await p.goto('https://selvaro.de/',{waitUntil:'domcontentloaded',timeout:45000}); await sleep(3000);
R.drawerOpened=await p.evaluate(()=>{const a=document.querySelector('a[href*="/cart"],[class*="cart-icon"],#cart-icon-bubble');if(a){a.click();return true}return false});
await sleep(2500);
R.drawer=await p.evaluate(()=>{const ic=document.querySelector('.cc-revoke, .pd-floating-icon');const r=ic?ic.getBoundingClientRect():null;const drawer=document.querySelector('cart-drawer,[class*="cart-drawer"],[class*="drawer"]');
 const out={icon:r?[Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)]:null,drawerVisible:drawer?drawer.getBoundingClientRect().width>0:false,overlaps:[]};
 if(!r)return out;
 for(const e of document.querySelectorAll('a,button,summary')){const q=e.getBoundingClientRect();if(q.width<8||q.height<8||q.bottom<0||q.top>innerHeight)continue;
  const ox=Math.min(r.right,q.right)-Math.max(r.left,q.left),oy=Math.min(r.bottom,q.bottom)-Math.max(r.top,q.top);
  if(ox>0&&oy>0)out.overlaps.push({tag:e.tagName,cls:String(e.className||'').slice(0,40),t:(e.innerText||'').trim().replace(/\s+/g,' ').slice(0,50),ov:Math.round(ox)+'x'+Math.round(oy)})}
 return out});
// identify the 35x35 element on /cart
await p.goto('https://selvaro.de/cart',{waitUntil:'domcontentloaded',timeout:45000}); await sleep(3000);
R.cartPage=await p.evaluate(()=>{const ic=document.querySelector('.cc-revoke,.pd-floating-icon');if(!ic)return null;const r=ic.getBoundingClientRect();const res=[];
 for(const e of document.querySelectorAll('a,button,summary,svg,img')){const q=e.getBoundingClientRect();if(q.width<8||q.height<8||q.bottom<0||q.top>innerHeight)continue;
  const ox=Math.min(r.right,q.right)-Math.max(r.left,q.left),oy=Math.min(r.bottom,q.bottom)-Math.max(r.top,q.top);
  if(ox>0&&oy>0)res.push({tag:e.tagName,cls:String(e.className&&e.className.baseVal!==undefined?e.className.baseVal:e.className||'').slice(0,45),t:(e.innerText||e.getAttribute('aria-label')||'').trim().slice(0,40),ov:Math.round(ox)+'x'+Math.round(oy)})}
 return {icon:[Math.round(r.x),Math.round(r.y)],res}});
fs.writeFileSync('_build/qa_live4.json',JSON.stringify(R,null,1)); console.log(JSON.stringify(R,null,1).slice(0,3000)); await b.close(); process.exit(0);
})().catch(e=>{fs.writeFileSync('_build/qa_live4.json',JSON.stringify({...R,fatal:String(e)},null,1));console.error('ERR',String(e).slice(0,160));process.exit(1)});

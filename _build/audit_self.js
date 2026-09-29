const puppeteer=require('/Users/annserputko/Desktop/штаб/_Технічне/chrome-mcp-server/node_modules/puppeteer-core');
const CHROME='/Users/annserputko/.cache/puppeteer/chrome/mac_arm-127.0.6533.88/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const URL=process.argv[2]||'https://anyaserputko-dev.github.io/selvaro-audit/';
(async()=>{const b=await puppeteer.launch({executablePath:CHROME,headless:'new',args:['--no-sandbox','--hide-scrollbars']});
const p=await b.newPage(); await p.setViewport({width:1360,height:1000});
await p.goto(URL,{waitUntil:'domcontentloaded',timeout:60000}); await new Promise(r=>setTimeout(r,2500));
const r=await p.evaluate(()=>{
 const ids=[...document.querySelectorAll('[id]')].map(e=>e.id);
 const links=[...document.querySelectorAll('a[href^="#"]')].map(a=>({txt:(a.querySelector('b')?a.querySelector('b').innerText:a.innerText).replace(/\s+/g,' ').trim().slice(0,60),href:a.getAttribute('href'),ok:ids.includes(a.getAttribute('href').slice(1))}));
 const slides=[...document.querySelectorAll('section.slide')].map((s,i)=>({i,id:s.id,head:(s.querySelector('h1,h2')||{innerText:''}).innerText.replace(/\s+/g,' ').trim().slice(0,80),
   num:(s.querySelector('.num')||{innerText:''}).innerText.trim(), sev:(s.querySelector('.sev')||{innerText:''}).innerText.trim(),
   price:(s.querySelector('.ptag b')||{innerText:''}).innerText.trim(), hrs:(s.querySelector('.ptag em')||{innerText:''}).innerText.trim()}));
 return {ids,links,slides};
});
console.log('=== SLIDES ==='); r.slides.forEach(s=>console.log(`${s.i} [${s.id||'-'}] ${s.num} ${s.sev} | ${s.head} | ${s.price} ${s.hrs}`));
console.log('=== BROKEN LINKS ==='); r.links.filter(l=>!l.ok).forEach(l=>console.log(l.href,'<-',l.txt));
console.log('=== ALL ANCHORS ==='); r.links.forEach(l=>console.log(l.href,'|',l.txt));
await b.close()})().catch(e=>{console.error(e);process.exit(1)});

// open the published deck as a client: desktop + phone, click every TOC link, screenshot key slides
const puppeteer=require('/Users/annserputko/Desktop/штаб/_Технічне/chrome-mcp-server/node_modules/puppeteer-core');
const CHROME='/Users/annserputko/.cache/puppeteer/chrome/mac_arm-127.0.6533.88/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const URL=process.argv[2]||'https://anyaserputko-dev.github.io/selvaro-audit/'; const fs=require('fs'); fs.mkdirSync(__dirname+'/preview',{recursive:true});setTimeout(()=>{console.log('CV TIMEOUT');process.exit(2)},100000);
(async()=>{const b=await puppeteer.launch({executablePath:CHROME,headless:'new',args:['--no-sandbox','--hide-scrollbars']});
 const p=await b.newPage(); await p.setViewport({width:1360,height:900});
 const bad=[]; p.on('response',r=>{if(r.status()>=400)bad.push(r.url()+' '+r.status())});
 await p.goto(URL,{waitUntil:'domcontentloaded',timeout:60000}); await new Promise(r=>setTimeout(r,2000));
 const broken=await p.evaluate(()=>[...document.images].filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.src));
 console.log('broken imgs',broken,'bad responses',bad);
 const toc=await p.evaluate(()=>[...document.querySelectorAll('.toc a')].map(a=>({t:a.innerText,h:a.getAttribute('href')})));
 for(const l of toc){await p.evaluate(h=>{location.hash=h},l.h);await new Promise(r=>setTimeout(r,1800));const ok=await p.evaluate(h=>{const e=document.querySelector(h);const r=e.getBoundingClientRect();return Math.abs(r.top)<200},l.h);console.log('toc',l.t,l.h,ok?'OK':'NOT AT TOP');}
 for(const id of ['summary','p01','p02b','p04','p10','price','questions']){await p.evaluate(h=>{document.getElementById(h).scrollIntoView()},id);await new Promise(r=>setTimeout(r,600));await p.screenshot({path:`${__dirname}/preview/d-${id}.png`});}
 await p.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true}); await p.reload({waitUntil:'load'}); await new Promise(r=>setTimeout(r,1500));
 const hscroll=await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth); console.log('mobile horizontal scroll:',hscroll);
 for(const id of ['p01','p08','price']){await p.evaluate(h=>{document.getElementById(h).scrollIntoView()},id);await new Promise(r=>setTimeout(r,600));await p.screenshot({path:`${__dirname}/preview/m-${id}.png`});}
 await b.close();})().catch(e=>{console.error(e);process.exit(1)});

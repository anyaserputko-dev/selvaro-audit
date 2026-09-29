const puppeteer=require('/Users/annserputko/Desktop/штаб/_Технічне/chrome-mcp-server/node_modules/puppeteer-core');
const CHROME='/Users/annserputko/.cache/puppeteer/chrome/mac_arm-127.0.6533.88/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const fs=require('fs'); const sleep=ms=>new Promise(r=>setTimeout(r,ms)); const R={};
setTimeout(()=>{fs.writeFileSync('_build/qa_live2.json',JSON.stringify(R,null,1));console.log('TIMEOUT');process.exit(2)},150000);
(async()=>{
const b=await puppeteer.launch({executablePath:CHROME,headless:'new',args:['--no-sandbox','--hide-scrollbars','--disable-dev-shm-usage']});
const p=await b.newPage();
await p.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1');
await p.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true});
await p.goto('https://selvaro.de/products/lernturm-klappbar',{waitUntil:'domcontentloaded',timeout:45000}); await sleep(4000);
// accept cookie banner the way a user does
R.accept=await p.evaluate(()=>{const btn=[...document.querySelectorAll('button,a')].find(e=>/^(ok|akzeptieren|alle akzeptieren|zustimmen|einverstanden)$/i.test(e.innerText.trim()));if(btn){btn.click();return btn.innerText.trim()}return null});
await sleep(2500);
R.afterAccept_floating=await p.evaluate(()=>{const all=[...document.querySelectorAll('button,div,a,img,svg')].filter(e=>{const r=e.getBoundingClientRect(),cs=getComputedStyle(e);return (cs.position==='fixed')&&r.width>14&&r.width<110&&r.height>14&&r.height<110&&r.bottom>0&&r.top<innerHeight&&cs.visibility!=='hidden'&&+cs.opacity>0.2});
 return all.map(e=>{const r=e.getBoundingClientRect();const cx=Math.min(389,Math.max(1,r.x+r.width/2)),cy=Math.min(843,Math.max(1,r.y+r.height/2));const stack=document.elementsFromPoint(cx,cy).slice(0,4).map(x=>(x.tagName+'.'+String(x.className||'').slice(0,26)));return {cls:String(e.className||'').slice(0,60),id:e.id||null,aria:e.getAttribute('aria-label')||null,x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height),stack}})});
// what does it overlap when scrolled to buy area / bottom
R.overlapCheck=await p.evaluate(async()=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));const out=[];for(const y of [0,1200,3000,document.documentElement.scrollHeight-900]){scrollTo(0,y);await sl(700);const fixed=[...document.querySelectorAll('*')].filter(e=>{const cs=getComputedStyle(e),r=e.getBoundingClientRect();return cs.position==='fixed'&&r.width>14&&r.width<110&&r.height>14&&r.height<110&&r.top<innerHeight&&r.bottom>0});const items=fixed.map(e=>{const r=e.getBoundingClientRect();const cx=Math.min(389,Math.max(1,r.x+r.width/2)),cy=Math.min(843,Math.max(1,r.y+r.height/2));const below=document.elementsFromPoint(cx,cy).filter(x=>!e.contains(x)&&x!==e).slice(0,2).map(x=>({tag:x.tagName,cls:String(x.className||'').slice(0,34),txt:(x.innerText||'').trim().slice(0,40)}));return {cls:String(e.className||'').slice(0,50),pos:[Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)],below}});out.push({scrollY:Math.round(scrollY),fixedSmall:items})}return out});
// precise ATC behaviour
R.atc=await p.evaluate(async()=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));const real=[...document.querySelectorAll('button,input[type=submit]')].filter(e=>/in den warenkorb|warenkorb hinzu|kaufen/i.test((e.innerText||e.value||'')));const main=real[0];if(!main)return {err:'no ATC found',candidates:[...document.querySelectorAll('button')].slice(0,12).map(e=>e.innerText.trim().slice(0,30))};
 const mr=main.getBoundingClientRect();const mainTop=Math.round(mr.top+scrollY);const label=main.innerText.trim();const res={label,mainTopPx:mainTop,docH:document.documentElement.scrollHeight,viewport:innerHeight,states:[]};
 for(const y of [0,Math.round(mainTop+innerHeight),3000,6000,document.documentElement.scrollHeight-900]){scrollTo(0,y);await sl(700);const r=main.getBoundingClientRect();const pinnedAny=[...document.querySelectorAll('*')].some(e=>{const cs=getComputedStyle(e),rr=e.getBoundingClientRect();return (cs.position==='fixed'||cs.position==='sticky')&&rr.height>28&&rr.top<innerHeight&&rr.bottom>0&&/warenkorb|kaufen/i.test(e.innerText||'')});res.states.push({scrollY:Math.round(scrollY),mainVisible:r.bottom>0&&r.top<innerHeight,pinnedBuyVisible:pinnedAny})}
 scrollTo(0,0);return res});
fs.writeFileSync('_build/qa_live2.json',JSON.stringify(R,null,1)); console.log(JSON.stringify(R,null,1).slice(0,5000)); await b.close(); process.exit(0);
})().catch(e=>{fs.writeFileSync('_build/qa_live2.json',JSON.stringify({...R,fatal:String(e)},null,1));console.error('ERR',e);process.exit(1)});

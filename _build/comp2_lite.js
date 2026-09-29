#!/usr/bin/env node
// comp2_lite.js — легкий одно-Chrome прохід для шард-2 (машина перевантажена, 53 завислих Chrome for Testing)
// node comp2_lite.js <url> <outdir> <slug>
const puppeteer = require('/Users/annserputko/Desktop/штаб/_Технічне/chrome-mcp-server/node_modules/puppeteer-core');
const fs = require('fs'); const path = require('path');
const CHROME = '/Users/annserputko/.cache/puppeteer/chrome/mac_arm-127.0.6533.88/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const [,, URL0, OUT, SLUG] = process.argv;
if (!URL0 || !OUT || !SLUG) { console.error('usage: comp2_lite.js <url> <outdir> <slug>'); process.exit(1); }
const IMG = path.join(OUT, 'img'); fs.mkdirSync(IMG, { recursive: true }); fs.mkdirSync(OUT, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));
setTimeout(() => { console.error('HARD TIMEOUT 90s — exiting'); process.exit(2); }, 90000);
const R = { url: URL0, slug: SLUG, home: {}, product: {}, collection: {}, errors: [] };
const flush = () => fs.writeFileSync(path.join(OUT, 'result.json'), JSON.stringify(R, null, 1));

const UA_M = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';

const CHECK = `(()=>{
const q=s=>document.querySelector(s);
const atc=q('[name="add"],.add-to-cart,[class*="add-to-cart"],form[action*="/cart/add"] button[type="submit"]');
const stickyAtc=!!q('[class*="sticky"][class*="atc"],[class*="sticky-add"],[class*="sticky-buy"],.sticky-cart,[class*="sticky-cart"]');
const reviewApp=q('.yotpo')?'Yotpo':q('.stamped-main-widget,.stamped-badge')?'Stamped':q('.jdgm-widget,.jdgm-prev-badge')?'Judge.me':q('.loox-reviews,.loox-rating')?'Loox':q('.okendo-reviews,[data-oke-widget]')?'Okendo':(q('[class*="review"],#reviews')?'unknown-widget':'none');
const stars=q('.yotpo-bottomline,.stamped-badge,.jdgm-prev-badge,.loox-rating,[class*="rating"],[class*="stars"],.spr-badge');
const trustedShops=/trusted ?shops|trustedshops/i.test(document.documentElement.outerHTML);
const klarna=/klarna/i.test(document.documentElement.outerHTML);
const paypal=/paypal/i.test(document.documentElement.outerHTML);
const bnpl=!!q('[class*="klarna"],[class*="afterpay"],[class*="affirm"],shopify-payment-terms,[class*="sezzle"]')||klarna;
const shippingBar=!!q('[class*="shipping-bar"],[class*="free-shipping"],[class*="progress-bar"],[class*="threshold"]');
const shippingText=[...document.querySelectorAll('*')].map(e=>e.childNodes.length===1&&e.childNodes[0].nodeType===3?e.innerText:null).filter(Boolean).find(t=>/versand|lieferzeit|werktag|kostenlos.*ab|shipping/i.test(t))||null;
const backInStock=!!q('[class*="back-in-stock"],[class*="notify"],.klaviyo-bis,[class*="bis-"]');
const bundle=!!q('[class*="bundle"],[class*="frequently"],[class*="also-like"],[class*="cross-sell"],product-recommendations,[class*="recommendation"]');
const ageGuide=/monat|jahr|alter|ab \\d+ (monaten|jahren)/i.test(document.body.innerText);
const popup=[...document.querySelectorAll('[class*="popup"],[class*="modal"],[role=dialog],.klaviyo-form,[class*="privy"],[class*="needle"]')].some(e=>{const r=e.getBoundingClientRect();return r.width>innerWidth*.7&&r.height>innerHeight*.5});
const search=!!q('[action*="/search"],input[type="search"],predictive-search,[data-predictive-search]');
const chat=!!q('[class*="tidio"],[class*="zendesk"],[class*="intercom"],[class*="crisp"],[class*="tawk"],[class*="gorgias"],shopify-chat,[class*="chat-widget"],[class*="chat-bubble"]');
const drawer=!!q('cart-drawer,.cart-drawer,[class*="cart-drawer"],[class*="mini-cart"]');
const swatches=!!q('[class*="swatch"],[class*="color-option"]');
const price=q('.price__regular .price-item,.price .money,[class*="product__price"] .money,.price');
const filters=document.querySelectorAll('[class*="filter"],[class*="facet"],.collection-filters,[data-filter]').length>0;
return {atc:atc?atc.innerText.trim().slice(0,40):null,stickyAtc,reviewApp,starsTxt:stars?stars.innerText.trim().slice(0,60):null,trustedShops,paypal,klarna,bnpl,shippingBar,shippingText:shippingText?shippingText.trim().slice(0,140):null,backInStock,bundle,ageGuide,popup,search,chat,drawer,swatches,priceTxt:price?price.innerText.trim().slice(0,30):null,filters,title:document.title.slice(0,80)};
})()`;

async function shot(p, name) { try { await p.screenshot({ path: path.join(IMG, `${SLUG}-${name}.jpg`), type: 'jpeg', quality: 82 }); return `img/${SLUG}-${name}.jpg`; } catch (e) { R.errors.push('shot ' + name + ': ' + String(e).slice(0,100)); return null; } }
async function go(p, url) { try { await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 }); await sleep(2200); } catch (e) { R.errors.push('goto ' + url + ': ' + String(e).slice(0,100)); } }

(async () => {
  let browser;
  try {
    console.error('launching chrome...');
    browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox', '--hide-scrollbars', '--disable-dev-shm-usage', '--disable-background-timer-throttling', '--disable-renderer-backgrounding'] });
    console.error('chrome launched');
    const p = await browser.newPage();
    await p.setUserAgent(UA_M); await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    // HOME
    await go(p, URL0.replace(/\/+$/, '') + '/');
    R.home.shot = await shot(p, 'home');
    R.home.check = await p.evaluate(CHECK).catch(e => ({ error: String(e).slice(0,150) }));
    // scroll to see popup/newsletter/UGC
    await p.evaluate(() => scrollTo(0, 1200)).catch(()=>{}); await sleep(800);
    R.home.shotMid = await shot(p, 'home-mid');
    // find a product link
    const prodHref = await p.evaluate(() => { const a = document.querySelector('a[href*="/products/"]'); return a ? a.href : null; }).catch(() => null);
    R.productUrl = prodHref;
    if (prodHref) {
      await go(p, prodHref);
      R.product.shot = await shot(p, 'pdp');
      R.product.check = await p.evaluate(CHECK).catch(e => ({ error: String(e).slice(0,150) }));
      await p.evaluate(() => scrollTo(0, 1400)).catch(()=>{}); await sleep(700);
      R.product.shotScrolled = await shot(p, 'pdp-scrolled');
    }
    // collection page
    const base = new URL(URL0).origin;
    await go(p, base + '/collections/all');
    R.collection.shot = await shot(p, 'collection');
    R.collection.check = await p.evaluate(CHECK).catch(e => ({ error: String(e).slice(0,150) }));
    flush();
    console.log('DONE', SLUG, JSON.stringify({ errors: R.errors.length }));
  } catch (e) {
    R.errors.push('FATAL ' + String(e).slice(0,200)); flush(); console.error('FATAL', e);
  } finally {
    try { await Promise.race([browser && browser.close(), sleep(3000)]); } catch (e) {}
    flush();
    process.exit(0);
  }
})();

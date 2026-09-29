# Шаблон дека CRO-аудиту (стиль Rinfit) — копіювати цілком у нову папку Аудит_<Клієнт>/

Взято з робочого прогону Аудит_AXY_2026-09-28 (28.09.2026). НЕ писати ці скрипти з нуля — копіювати й міняти лише дані.

- `_build/probe_all.js` ⭐ — ОДИН детермінований прогін вимірів: `node _build/probe_all.js <url> <папка> [--pdp url] [--collection url] [--no-cart] [--label slug] [--child-ms 300000]`.
  Батько робить discovery (products.json/sitemap/collections, robots, canonical, Shopify?) і запускає 2 дочірні процеси (мобільний 390×844 DPR3 / десктоп 1440), кожен зі СВОЇМ Chrome і kill-таймером;
  home → колекція → товар → кошик з доданим товаром; 15 блоків JS + sticky-header/ATC; скріни `img/now-<page>-<what>-<m|d>.jpg`; perf, мережа, пікселі, консоль → `_build/probe.json` (+ `probe-m.json`, `probe-d.json`, `discovery.json`).
  Дитина, що не встигла, вбивається, її часткові дані зливаються. При load > 3× ядер проходи йдуть послідовно і в `errors` стоїть позначка «machine overloaded».
  Працює і для конкурентів / лідген-сайтів (`--no-cart`).
- `_build/build.py`     — генератор index.html зі списку слайдів (заголовок, Today/We propose/Why it pays, 2 скріни, ціна, конкурент)
- `_build/base.css`     — CSS дека (телефон 390×844 → `.phone{aspect-ratio:9/20.1}`)
- `_build/probe.js`, `probe2.js`, `probe_d.js` — виміри живого сайту (мобільний 390×844 DPR3 / десктоп 1440), пишуть JSON
- `_build/reshoot.js`   — скріни «до» і «після» (після = правка DOM перед скріном)
- `_build/consistency.py` — гейт: нумерація/бейджі/ціни/суми, кожна цифра дека є у verify.json, кирилиця
- `_build/audit_self.js`, `client_view.js` — гейт на живій сторінці: TOC-лінки, биті картинки, превʼю слайдів
- `img/silk.png`, `logo-md.png`, `results.png` — шовк, лого MileDevs, реальний графік +19%

Правило швидкості: кожен виклик браузера — `waitUntil:'domcontentloaded'` + пауза, НІКОЛИ `networkidle0`; глобальний `setTimeout(()=>process.exit(2), 90000)` у кожному скрипті.

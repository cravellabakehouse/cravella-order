/* Cravella AI helper (test). Loaded only when the page URL has ?ai=1 */
(function(){
  if (window.CV_AI) return; window.CV_AI = 1;
  var EP = 'https://cravella-ai-test.connect-679.workers.dev';
  function rs(n){ return '₹' + Math.round(n).toLocaleString('en-IN'); }
  function kl(k){ return k < 1 ? (k*1000) + ' g' : (k % 1 ? k.toFixed(1) : k) + ' kg'; }
  function off(id){ try { return typeof isOff === 'function' && isOff(id); } catch(_) { return false; } }
  function facts(){
    var L = [], M = window.MENU || (typeof MENU !== 'undefined' ? MENU : null);
    if (!M) return '';
    L.push('BAKERY: Cravella Bake House, 100% eggless home bakery, Yelahanka, Bengaluru. Pre-orders only. No palm oil, no preservatives. FSSAI 21225177003525.');
    L.push('CONTACT: WhatsApp 81477 33224 (chat and order help). Call 98459-04310.');
    L.push('HOW TO ORDER: add items on this website, pick a date and pickup or delivery, then check out. Pickup/delivery time slots: 10 AM to 8 PM.');
    L.push('NOTICE: cakes need 2 days (48 hours) notice. Cupcakes, muffins, brownies, blondies and cookies need 1 day (24 hours) notice.');
    L.push('DELIVERY: within Bengaluru only. Delivery charges are extra and confirmed on WhatsApp. Pickup is from our kitchen in Yelahanka.');
    try { var T = (typeof TIERS === 'function' ? TIERS() : (M.discount && M.discount.tiers) || []); if (T.length) L.push('DISCOUNTS: ' + T.map(function(t){ return t[1] + '% off orders above ' + rs(t[0]-1); }).join('; ') + '.'); } catch(_){}
    L.push('CAKE SIZES AND PRICES (price for 0.5 kg / 1 kg / 1.5 kg / 2 kg; bigger than 2 kg is possible, priced on request):');
    M.cakes.filter(function(c){ return !c.custom; }).forEach(function(c){
      var ws = c.weights || M.weights, cr = c.creams.map(function(x){ return (x.label ? x.label + ': ' : '') + ws.map(function(w,i){ return kl(w) + ' ' + rs(x.prices[i]); }).join(', '); });
      L.push('- ' + c.name + ' (' + c.group + ', ' + c.desc + ')' + (off(c.id) ? ' SOLD OUT' : '') + ' — ' + cr.join(' | '));
    });
    var cu = M.cakes.filter(function(c){ return c.custom; })[0];
    if (cu) L.push('CUSTOM / THEME CAKES: from ' + rs(cu.creams[0].prices[0]) + ' per kg (1 kg ' + rs(cu.creams[0].prices[0]) + ', 1.5 kg ' + rs(cu.creams[0].prices[1]) + ', 2 kg ' + rs(cu.creams[0].prices[2]) + '). Customer uploads a reference photo and budget at checkout; we confirm the design and final price on WhatsApp. 50% advance to book, balance on delivery/pickup. 2 days notice.');
    [['Cupcakes', M.cupcakes], ['Muffins', M.muffins], ['Brownies', M.brownies], ['Blondies', M.blondies]].forEach(function(g){
      if (!g[1] || !g[1].length) return;
      L.push(g[0].toUpperCase() + ' (sold in boxes): ' + g[1].map(function(d){ return d.name + (off(d.id) ? ' SOLD OUT' : '') + ' — box of ' + d.size + ' ' + rs(d.box); }).join('; '));
    });
    if (M.cookies && M.cookies.length) L.push('COOKIES (by weight, price per 250 g): ' + M.cookies.map(function(d){ return d.name + (off(d.id) ? ' SOLD OUT' : '') + ' ' + rs(d.rate); }).join('; '));
    try { if (typeof POLICY !== 'undefined') POLICY.slice(1).forEach(function(p){ L.push(p[0].toUpperCase() + ': ' + p[2].join(' ')); }); } catch(_){}
    try { if (typeof CFG !== 'undefined' && CFG.closed && CFG.closed.length) L.push('CLOSED ON: ' + CFG.closed.join(', ') + '.'); } catch(_){}
    try { if (document.body.classList.contains('brk')) L.push('IMPORTANT: the bakery is on a break right now and is not taking orders.'); } catch(_){}
    return L.join('\n');
  }
  var css = '#cvai-b{position:fixed;right:16px;bottom:88px;z-index:9998;display:flex;align-items:center;gap:8px;min-height:48px;padding:0 18px;border:0;border-radius:24px;background:#28114d;color:#fffbbe;font:700 15px/1 "Hanken Grotesk",system-ui,sans-serif;box-shadow:0 8px 24px rgba(40,17,77,.35);cursor:pointer}'
   + '#cvai{position:fixed;right:16px;bottom:88px;z-index:9999;width:min(380px,calc(100vw - 32px));height:min(560px,calc(100vh - 120px));display:none;flex-direction:column;background:#fff;border-radius:20px;box-shadow:0 16px 48px rgba(0,0,0,.25);overflow:hidden;font:15px/1.45 "Hanken Grotesk",system-ui,sans-serif;color:#3b2416}'
   + '#cvai.on{display:flex}#cvai .hd{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;background:#28114d;color:#fffbbe}#cvai .hd b{font-size:16px}#cvai .hd small{display:block;font-size:12px;opacity:.8;font-weight:500}'
   + '#cvai .x{all:unset;cursor:pointer;font-size:22px;line-height:1;padding:4px 8px}#cvai .ms{flex:1;overflow:auto;padding:14px;display:flex;flex-direction:column;gap:8px;background:#fffdf6}'
   + '#cvai .m{max-width:85%;padding:9px 12px;border-radius:14px;white-space:pre-wrap;word-wrap:break-word}#cvai .m.u{align-self:flex-end;background:#28114d;color:#fff;border-bottom-right-radius:4px}#cvai .m.a{align-self:flex-start;background:#fff;border:1px solid #eadfc9;border-bottom-left-radius:4px}'
   + '#cvai .sg{display:flex;flex-wrap:wrap;gap:6px}#cvai .sg button{all:unset;cursor:pointer;font-size:13px;padding:7px 11px;border-radius:16px;border:1px solid #d9c9ee;color:#28114d;background:#fff}'
   + '#cvai form{display:flex;gap:8px;padding:10px;border-top:1px solid #eadfc9;background:#fff}#cvai input{flex:1;min-width:0;border:1px solid #eadfc9;border-radius:22px;padding:11px 14px;font:inherit;outline:none}#cvai input:focus{border-color:#28114d}'
   + '#cvai form button{border:0;border-radius:22px;padding:0 16px;background:#12803c;color:#fff;font:700 14px/1 inherit;cursor:pointer}#cvai .ft{font-size:11.5px;color:#7d6a58;padding:0 14px 10px;background:#fff}#cvai .ft a{color:#12803c;font-weight:700}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  var b = document.createElement('button'); b.id = 'cvai-b'; b.type = 'button'; b.innerHTML = '✨ Ask Cravella';
  var p = document.createElement('div'); p.id = 'cvai'; p.setAttribute('role', 'dialog'); p.setAttribute('aria-label', 'Ask Cravella');
  p.innerHTML = '<div class="hd"><div><b>Ask Cravella</b><small>Menu, prices, delivery and orders</small></div><button class="x" aria-label="Close">×</button></div><div class="ms"></div><form><input maxlength="300" placeholder="Type your question…" aria-label="Your question"><button>Send</button></form><div class="ft">AI helper, answers may not be perfect. For anything important, <a href="https://wa.me/918147733224" target="_blank" rel="noopener">chat on WhatsApp</a>.</div>';
  document.body.appendChild(b); document.body.appendChild(p);
  var ms = p.querySelector('.ms'), inp = p.querySelector('input'), H = [], busy = false;
  function add(r, t){ var d = document.createElement('div'); d.className = 'm ' + r; d.textContent = t; ms.appendChild(d); ms.scrollTop = ms.scrollHeight; return d; }
  function hello(){ add('a', "Hi! I'm the Cravella helper. Ask me about our eggless cakes, prices, sizes, delivery or how to order.");
    var s = document.createElement('div'); s.className = 'sg';
    ['Price of a 1 kg truffle cake?', 'Do you deliver?', 'How much notice do you need?', 'Custom theme cakes?'].forEach(function(q){ var x = document.createElement('button'); x.type = 'button'; x.textContent = q; x.onclick = function(){ s.remove(); ask(q); }; s.appendChild(x); });
    ms.appendChild(s); }
  async function ask(q){ if (busy) return; busy = true; add('u', q); var w = add('a', '…');
    try { var r = await fetch(EP, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({q: q, h: H.slice(-6), ctx: facts()})}); var j = await r.json(); w.textContent = j.a || 'Sorry, something went wrong. Please chat with us on WhatsApp: 81477 33224.'; H.push({r: 'u', t: q}, {r: 'a', t: w.textContent}); }
    catch (_) { w.textContent = 'Sorry, I could not connect. Please chat with us on WhatsApp: 81477 33224.'; }
    busy = false; ms.scrollTop = ms.scrollHeight; }
  b.onclick = function(){ p.classList.add('on'); b.style.display = 'none'; if (!ms.childNodes.length) hello(); setTimeout(function(){ inp.focus(); }, 50); };
  p.querySelector('.x').onclick = function(){ p.classList.remove('on'); b.style.display = ''; };
  p.querySelector('form').onsubmit = function(e){ e.preventDefault(); var q = inp.value.trim(); if (!q) return; inp.value = ''; ask(q); };
  window.CV_AI_FACTS = facts;
})();

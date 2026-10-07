/**
 * Cravella Bake House – PUBLIC order-request endpoint.
 * Deploy as: Web app · Execute as: Me · Who has access: Anyone
 * (This is a SEPARATE Apps Script project from your private quote app.)
 */
const SHEET_ID     = '';   // leave EMPTY: the script creates a Google Sheet called "Cravella Orders" for you.
                           // (Optional: paste an existing Sheet's ID here to use that instead.)
const NOTIFY_EMAIL = 'connect@cravellabakehouse.in,connect@cravellabakehouse.com';
// Your UPI ID for advance payments, used in the Confirm message (leave empty to skip)
const UPI_ID = '';
const PHOTO_FOLDER = 'Cravella order photos';
const TAB          = 'Requests';
const MAX_PER_HOUR_PER_PHONE = 5;
const MAX_PER_HOUR_TOTAL     = 80;
const LEAD_CAKE = 2, LEAD_OTHER = 1;
const TIMES = ['10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM','7:00 PM','8:00 PM'];
const HEAD = ['Request ID','Received','Status','Name','Phone','Date','Time','Pickup / Delivery','Delivery address','Items','Estimated total (₹)','Needs confirming','Notes','Photos','Order JSON','Month','Email','Subtotal (₹)','Discount (₹)','Discount note'];

const MENU = {"weights":[0.5,1,1.5,2],"cakes":[{"id":"truffle","name":"Truffle Cake","group":"Chocolate cakes","desc":"Rich dark chocolate ganache","creams":[{"id":"","label":"","prices":[700,1250,1750,2300]}]},{"id":"orange","name":"Orange Chocolate Cake","group":"Chocolate cakes","desc":"Chocolate with a zesty orange note","creams":[{"id":"","label":"","prices":[750,1300,1850,2400]}]},{"id":"blackforest","name":"Black Forest","group":"Chocolate cakes","desc":"Chocolate, cream and cherries","creams":[{"id":"","label":"","prices":[750,1300,1850,2400]}]},{"id":"whiteforest","name":"White Forest","group":"Chocolate cakes","desc":"White chocolate and cream","creams":[{"id":"","label":"","prices":[800,1400,2000,2600]}]},{"id":"strawberry","name":"Strawberry Cake","group":"Berry cakes","desc":"Fresh fruit flavour","creams":[{"id":"w","label":"Whipped cream","prices":[650,1200,1750,2200]},{"id":"b","label":"Butter cream","prices":[750,1350,2000,2500]}]},{"id":"blueberry","name":"Blueberry Cake","group":"Berry cakes","desc":"Fresh fruit flavour","creams":[{"id":"w","label":"Whipped cream","prices":[650,1200,1750,2200]},{"id":"b","label":"Butter cream","prices":[750,1350,2000,2500]}]},{"id":"raspberry","name":"Raspberry Cake","group":"Berry cakes","desc":"Fresh fruit flavour","creams":[{"id":"w","label":"Whipped cream","prices":[650,1200,1750,2200]},{"id":"b","label":"Butter cream","prices":[750,1350,2000,2500]}]},{"id":"mango","name":"Mango Cake","group":"Fruit cakes","desc":"Light, fruity and fresh","creams":[{"id":"w","label":"Whipped cream","prices":[600,1150,1600,2000]},{"id":"b","label":"Butter cream","prices":[700,1300,1900,2500]}]},{"id":"pineapple","name":"Pineapple Cake","group":"Fruit cakes","desc":"Light, fruity and fresh","creams":[{"id":"w","label":"Whipped cream","prices":[600,1150,1600,2000]},{"id":"b","label":"Butter cream","prices":[700,1300,1900,2500]}]}],"cupcakes":[{"id":"cup0","name":"Chocolate","rate":85,"box":500,"size":6},{"id":"cup1","name":"Strawberry","rate":75,"box":450,"size":6},{"id":"cup2","name":"Blueberry","rate":80,"box":480,"size":6},{"id":"cup3","name":"Raspberry","rate":80,"box":480,"size":6},{"id":"cup4","name":"Mango","rate":80,"box":480,"size":6}],"muffins":[{"id":"muf0","name":"Banana Chocochip","rate":80,"box":480,"size":6},{"id":"muf1","name":"Mocha Almond","rate":80,"box":480,"size":6},{"id":"muf2","name":"Chocolate Cranberry","rate":95,"box":570,"size":6},{"id":"muf3","name":"Vanilla Chocochip","rate":80,"box":480,"size":6},{"id":"muf4","name":"Carrot","rate":80,"box":480,"size":6},{"id":"muf5","name":"Pista Mawa Cake","rate":100,"box":600,"size":6}],"brownies":[{"id":"brn0","name":"Crinkle Top","rate":90,"box":350,"size":4},{"id":"brn1","name":"Walnut","rate":100,"box":380,"size":4},{"id":"brn2","name":"Red Velvet Cream Cheese","rate":130,"box":500,"size":4},{"id":"brn3","name":"Triple Chocolate","rate":140,"box":530,"size":4},{"id":"brn4","name":"Fudgy Cookie & Cream","rate":130,"box":500,"size":4},{"id":"brn5","name":"Lotus Biscoff","rate":160,"box":600,"size":4},{"id":"brn6","name":"Tiramisu","rate":160,"box":600,"size":4}],"blondies":[{"id":"bld0","name":"Pista & Rose","rate":160,"box":620,"size":4},{"id":"bld1","name":"Coconut","rate":150,"box":580,"size":4}],"cookies":[{"id":"cok0","name":"Coffee Bean","rate":350},{"id":"cok1","name":"Center-filled Chocochip","rate":425},{"id":"cok2","name":"Checker Board","rate":400},{"id":"cok3","name":"Digestive (Atta & Jaggery)","rate":350},{"id":"cok4","name":"Gluten Free Vegan","rate":450},{"id":"cok5","name":"Butter","rate":350}],"discount":{"tiers":[[10001,8],[5001,5]],"coupons":false}};

function doGet(){ return out_({ok:true, service:'cravella-order-requests'}); }

function doPost(e){
  const lock = LockService.getScriptLock();
  try{
    lock.waitLock(20000);
    const r = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (r.action) return out_(accountApi_(r));
    if (r.hp) return out_({ok:true, id:'CB-0000', total:0});          // honeypot: pretend success
    const v = validate_(r);
    if (v.error) return out_({ok:false, error:v.error});
    if (!rateOk_(v.phone)) return out_({ok:false, error:'Too many requests. Please WhatsApp us on 98459-04310.'});

    const email = r.token ? authEmail_(r.token) : '';
    const id = nextId_();
    const photos = savePhotos_(id, r.photos || []);
    const sh = sheet_();
    const row = [id, new Date(), 'New', v.name, v.phone, v.date, v.time, v.mode, v.address,
      v.lines.map(l => l.desc + ' – ₹' + l.amount).join('\n'), v.total,
      v.toConfirm ? 'Yes' : '', v.notes, photos.map(p => p.url).join('\n'),
      JSON.stringify({items:r.items, mode:v.mode, date:v.date, time:v.time, coupon:v.couponUsed || ''}), mk_(v.date), email,
      v.subtotal, v.discount, v.discNote];
    sh.appendRow(row);
    const last = sh.getLastRow();
    sh.getRange(last,5).setNumberFormat('@').setValue(v.phone);
    sh.getRange(last,2).setNumberFormat('dd mmm yyyy hh:mm');
    if (v.couponUsed) bumpCoupon_(v.couponUsed);
    if (email) touchCustomer_(email, {name:v.name, phone:v.phone, address:v.address});
    notify_(id, v, photos);
    return out_({ok:true, id:id, total:v.total, subtotal:v.subtotal, discount:v.discount, discNote:v.discNote, toConfirm:v.toConfirm});
  }catch(err){
    return out_({ok:false, error:'Something went wrong. Please WhatsApp us on 98459-04310.'});
  }finally{
    try{lock.releaseLock();}catch(_){}
  }
}

/* ---------- pricing: the ONLY prices that count ---------- */
function cakePrice_(c, cream, kg){
  const cr = c.creams.filter(x => x.id === cream)[0] || c.creams[0], ws = MENU.weights, ex = ws.indexOf(kg);
  if (ex >= 0) return {amount: cr.prices[ex], exact: true, cr: cr};
  let i = -1; for (let k = 0; k < ws.length; k++) if (ws[k] >= kg){ i = k; break; }
  if (i < 0) i = ws.length - 1;
  return {amount: Math.round(cr.prices[i] / ws[i] * kg), exact: false, cr: cr};
}
function kgLabel_(k){ return k < 1 ? (k*1000)+' g' : (k % 1 ? k.toFixed(1) : k)+' kg'; }
function allPc_(){ return [].concat(MENU.cupcakes, MENU.muffins, MENU.brownies, MENU.blondies); }
function pcKind_(id){ return id.indexOf('cup')===0?'Cupcakes':id.indexOf('muf')===0?'Muffins':id.indexOf('brn')===0?'Brownies':'Blondies'; }

function priceItems_(items){
  const lines = []; let total = 0, toConfirm = false, hasCake = false;
  for (let i = 0; i < items.length; i++){
    const it = items[i] || {}, q = Number(it.q);
    if (it.t === 'cake'){
      const c = MENU.cakes.filter(x => x.id === it.id)[0], kg = Number(it.kg);
      if (!c || !(q >= 1 && q <= 20) || q % 1 || !(kg >= 0.5 && kg <= 15) || (kg*2) % 1) return {error:'Invalid cake in your order.'};
      const p = cakePrice_(c, String(it.cream || ''), kg), amt = p.amount * q;
      hasCake = true; if (!p.exact) toConfirm = true;
      lines.push({desc: c.name + (p.cr.label ? ' ('+p.cr.label+')' : '') + ' · ' + kgLabel_(kg) + (q > 1 ? ' × '+q : '') + (p.exact ? '' : ' [estimate]'), amount: amt});
      total += amt;
    } else if (it.t === 'pc'){
      const d = allPc_().filter(x => x.id === it.id)[0];
      if (!d || !(q >= d.size && q <= d.size * 20) || q % d.size) return {error:'Please order whole boxes (' + d.size + ' pieces per box).'};
      const amt = Math.floor(q / d.size) * d.box + (q % d.size) * d.rate;
      lines.push({desc: d.name + ' ' + pcKind_(d.id) + ' × ' + q + ' (' + (q / d.size) + (q / d.size > 1 ? ' boxes' : ' box') + ')', amount: amt}); total += amt;
    } else if (it.t === 'cookie'){
      const d = MENU.cookies.filter(x => x.id === it.id)[0];
      if (!d || !(q >= 250 && q <= 10000) || q % 250) return {error:'Invalid cookies in your order.'};
      const amt = q / 250 * d.rate;
      lines.push({desc: d.name + ' Cookies · ' + (q >= 1000 ? (q / 1000) + ' kg' : q + ' g'), amount: amt}); total += amt;
    } else return {error:'Invalid item in your order.'};
  }
  return {lines:lines, total:total, toConfirm:toConfirm, hasCake:hasCake};
}

function validate_(r){
  const clean = s => String(s == null ? '' : s).replace(/[\u0000-\u001f\u007f]+/g,' ').replace(/\s+/g,' ').trim();
  const name = clean(r.name).slice(0,80);
  if (name.length < 2) return {error:'Please enter your name.'};
  let phone = String(r.phone || '').replace(/\D/g,'');
  if (phone.length === 12 && phone.indexOf('91') === 0) phone = phone.slice(2);
  if (phone.length === 11 && phone[0] === '0') phone = phone.slice(1);
  if (!/^[6-9]\d{9}$/.test(phone)) return {error:'Please enter a valid 10-digit mobile number.'};
  const mode = r.mode === 'Delivery' ? 'Delivery' : 'Pickup';
  const address = mode === 'Delivery' ? clean(r.address).slice(0,300) : '';
  if (mode === 'Delivery' && address.length < 8) return {error:'Please enter your delivery address.'};
  const notes = String(r.notes || '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g,'').trim().slice(0,500);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(r.date))) return {error:'Please choose a date.'};
  if (TIMES.indexOf(r.time) < 0) return {error:'Please choose a preferred time.'};
  const items = r.items;
  if (!Array.isArray(items) || !items.length || items.length > 40) return {error:'Your order is empty.'};

  const pr = priceItems_(items);
  if (pr.error) return {error:pr.error};
  const lines = pr.lines, toConfirm = pr.toConfirm, hasCake = pr.hasCake;
  // date rule (IST): cakes 2 days, other bakes 1 day
  const today = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd').split('-').map(Number);
  const min = new Date(Date.UTC(today[0], today[1]-1, today[2] + (hasCake ? LEAD_CAKE : LEAD_OTHER)));
  const minS = Utilities.formatDate(min, 'UTC', 'yyyy-MM-dd');
  if (r.date < minS) return {error:'That date is too soon for your items. Please pick a later date.'};
  if (r.date > Utilities.formatDate(new Date(min.getTime() + 365*86400000), 'UTC', 'yyyy-MM-dd')) return {error:'Please choose a nearer date.'};
  if (Array.isArray(r.photos) && r.photos.length > 3) return {error:'Maximum 3 photos.'};
  const subtotal = Math.round(pr.total);
  const dc = discount_(subtotal, r.coupon);
  if (dc.error) return {error:dc.error};
  return {name:name, phone:phone, mode:mode, address:address, notes:notes, date:r.date, time:r.time, lines:lines,
    subtotal:subtotal, discount:dc.amount, discNote:dc.note, couponUsed:dc.couponUsed, total:subtotal - dc.amount, toConfirm:toConfirm};
}


/* ---------- discounts: automatic tiers + coupon codes (the Discounts tab in your Sheet) ---------- */
const DISC_TAB  = 'Discounts';
const DISC_HEAD = ['Code','Type (Percent or Flat)','Value','Minimum order (₹)','Valid from (yyyy-mm-dd)','Expires (yyyy-mm-dd)','Active (Yes or No)','Max uses (blank = unlimited)','Times used','Note'];
function tierOf_(sub){
  const t = (MENU.discount && MENU.discount.tiers) || [];
  for (let i = 0; i < t.length; i++) if (sub >= t[i][0]) return {pct: t[i][1], from: t[i][0]};
  return null;
}
function discSheet_(){
  const ss = book_(); let sh = ss.getSheetByName(DISC_TAB);
  if (!sh){
    sh = ss.insertSheet(DISC_TAB);
    sh.getRange(1,1,1,DISC_HEAD.length).setValues([DISC_HEAD]).setFontWeight('bold').setBackground('#fffbbe');
    sh.setFrozenRows(1);
    sh.getRange(2,1,1,DISC_HEAD.length).setValues([['EXAMPLE10','Percent',10,2000,'','2099-12-31','No','',0,'Example only. Change it and set Active to Yes. Percent = % off, Flat = rupees off.']]);
    sh.getRange('A:A').setNumberFormat('@'); sh.getRange('E:F').setNumberFormat('@');
    sh.setColumnWidths(1, 1, 130); sh.setColumnWidths(10, 1, 360);
    sh.getRange('B2:B').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['Percent','Flat'], true).build());
    sh.getRange('G2:G').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['Yes','No'], true).build());
  }
  return sh;
}
function dstr_(v){
  if (v instanceof Date) return Utilities.formatDate(v, 'Asia/Kolkata', 'yyyy-MM-dd');
  return String(v == null ? '' : v).trim().slice(0, 10);
}
function findCoupon_(code){
  code = String(code || '').toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 30);
  if (!code) return {error:'Please enter a coupon code.'};
  const sh = discSheet_(), n = sh.getLastRow();
  if (n < 2) return {error:'That coupon code is not valid.'};
  const v = sh.getRange(2, 1, n - 1, 9).getValues();
  const today = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd');
  for (let i = 0; i < v.length; i++){
    if (String(v[i][0]).trim().toUpperCase() !== code) continue;
    if (String(v[i][6]).trim().toLowerCase() !== 'yes') return {error:'That coupon code is not active.'};
    const from = dstr_(v[i][4]), to = dstr_(v[i][5]);
    if (from && today < from) return {error:'That coupon is not valid yet.'};
    if (to && today > to) return {error:'That coupon has expired.'};
    const max = Number(v[i][7]), used = Number(v[i][8]) || 0;
    if (v[i][7] !== '' && max > 0 && used >= max) return {error:'That coupon has been fully used.'};
    const kind = String(v[i][1]).trim().toLowerCase() === 'flat' ? 'flat' : 'percent', value = Number(v[i][2]);
    if (!(value > 0)) return {error:'That coupon code is not valid.'};
    return {code:code, kind:kind, value:value, min:Number(v[i][3]) || 0, row:i + 2};
  }
  return {error:'That coupon code is not valid.'};
}
// Returns the single best discount (automatic tier or coupon, whichever saves more). They do not stack.
function discount_(sub, couponCode){
  const tier = tierOf_(sub);
  const tAmt = tier ? Math.round(sub * tier.pct / 100) : 0;
  let best = {amount:tAmt, note: tier ? tier.pct + '% off (orders above ₹' + String(tier.from - 1).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ')' : '', couponUsed:''};
  if (couponCode){
    const c = findCoupon_(couponCode);
    if (c.error) return {error:c.error};
    if (sub < c.min) return {error:'This coupon needs an order of at least ₹' + c.min + '.'};
    const cAmt = Math.min(sub, Math.round(c.kind === 'flat' ? c.value : sub * c.value / 100));
    if (cAmt > best.amount) best = {amount:cAmt, note:'Coupon ' + c.code + ' (' + (c.kind === 'flat' ? '₹' + c.value : c.value + '%') + ' off)', couponUsed:c.code};
    else best.note = best.note + ' · coupon ' + c.code + ' not used (automatic discount is better)';
  }
  return best;
}
function bumpCoupon_(code){
  try{
    const c = findCoupon_(code); if (c.error) return;
    const sh = discSheet_(); sh.getRange(c.row, 9).setValue((Number(sh.getRange(c.row, 9).getValue()) || 0) + 1);
  }catch(_){}
}
// Public check used by the order page's "Apply" button. Prices the cart on the server, never trusts the browser.
function couponCheck_(r){
  if (!bump_('cpn', 60, 600)) return {ok:false, error:'Too many tries. Please wait a few minutes.'};
  const items = r.items;
  if (!Array.isArray(items) || !items.length || items.length > 40) return {ok:false, error:'Your order is empty.'};
  const pr = priceItems_(items); if (pr.error) return {ok:false, error:pr.error};
  const sub = Math.round(pr.total), d = discount_(sub, r.code);
  if (d.error) return {ok:false, error:d.error};
  const c = findCoupon_(r.code);
  return {ok:true, subtotal:sub, discount:d.amount, note:d.note, used:!!d.couponUsed,
    coupon:{code:c.code, kind:c.kind, value:c.value, min:c.min}};
}

/* ---------- storage ---------- */
function book_(){
  if (SHEET_ID) return SpreadsheetApp.openById(SHEET_ID);
  const p = PropertiesService.getScriptProperties();
  const id = p.getProperty('sheetId');
  if (id) return SpreadsheetApp.openById(id);
  const ss = SpreadsheetApp.create('Cravella Orders');
  p.setProperty('sheetId', ss.getId());
  return ss;
}
function sheet_(){
  const ss = book_();
  let sh = ss.getSheetByName(TAB);
  if (!sh){
    sh = ss.insertSheet(TAB);
    const d = ss.getSheetByName('Sheet1'); if (d && ss.getSheets().length > 1) ss.deleteSheet(d);
    sh.getRange(1,1,1,HEAD.length).setValues([HEAD]).setFontWeight('bold').setBackground('#fffbbe');
    sh.setFrozenRows(1);
    sh.getRange('E:E').setNumberFormat('@');
    sh.getRange('F:F').setNumberFormat('@');
    sh.getRange('G:G').setNumberFormat('@');
    sh.setColumnWidths(10, 1, 320);
    sh.getRange('C2:C').setDataValidation(SpreadsheetApp.newDataValidation()
      .requireValueInList(['New','Confirmed','Advance received','Delivered','Cancelled'], true).build());
  }
  if (!sh.getRange(1,18).getValue()) sh.getRange(1,18,1,3).setValues([['Subtotal (₹)','Discount (₹)','Discount note']]).setFontWeight('bold').setBackground('#fffbbe');
  return sh;
}
function nextId_(){
  const p = PropertiesService.getScriptProperties();
  const n = Number(p.getProperty('seq') || '0') + 1;
  p.setProperty('seq', String(n));
  return 'CB-' + ('0000' + n).slice(-4);
}
function savePhotos_(id, photos){
  const res = [];
  if (!photos || !photos.length) return res;
  const it = DriveApp.getFoldersByName(PHOTO_FOLDER);
  const folder = it.hasNext() ? it.next() : DriveApp.createFolder(PHOTO_FOLDER);
  for (let i = 0; i < Math.min(3, photos.length); i++){
    const m = /^data:image\/jpeg;base64,([A-Za-z0-9+\/=]+)$/.exec(String(photos[i]));
    if (!m || m[1].length > 3500000) continue;
    const f = folder.createFile(Utilities.newBlob(Utilities.base64Decode(m[1]), 'image/jpeg', id + '_' + (i+1) + '.jpg'));
    res.push({url: f.getUrl(), blob: f.getBlob()});
  }
  return res;
}
function rateOk_(phone){
  const c = CacheService.getScriptCache();
  const k1 = 'p_' + phone, k2 = 'all';
  const a = Number(c.get(k1) || 0), b = Number(c.get(k2) || 0);
  if (a >= MAX_PER_HOUR_PER_PHONE || b >= MAX_PER_HOUR_TOTAL) return false;
  c.put(k1, String(a+1), 3600); c.put(k2, String(b+1), 3600);
  return true;
}

/* ---------- email to the bakery ---------- */
function notify_(id, v, photos){
  const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const rows = v.lines.map(l => '<tr><td style="padding:3px 12px 3px 0">'+esc(l.desc)+'</td><td align="right"><b>₹'+l.amount+'</b></td></tr>').join('');
  const wa = txt => 'https://wa.me/91' + v.phone + '?text=' + encodeURIComponent(txt);
  const dp = String(v.date).split('-'), MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const when = (v.mode === 'Delivery' ? 'delivery' : 'pickup') + ' on ' + (dp.length === 3 ? Number(dp[2]) + ' ' + MON[Number(dp[1]) - 1] : v.date) + ', ' + v.time;
  const first = String(v.name).split(' ')[0];
  const items = v.lines.map(l => '• ' + l.desc + ' – ₹' + l.amount).join('\n');
  const pay = UPI_ID ? 'To book it, please pay the advance by UPI to ' + UPI_ID + ' and send us the screenshot.' : 'To book it, please pay the advance by UPI. We will share the details here.';
  const msgConfirm = 'Hi ' + first + ', thank you for ordering from Cravella Bake House! Your order ' + id + ' is confirmed:\n\n' + items + (v.discount ? '\n\nSubtotal: ₹' + v.subtotal + '\nDiscount (' + v.discNote + '): −₹' + v.discount : '') + '\n\nTotal: ₹' + v.total + '\n' + when.charAt(0).toUpperCase() + when.slice(1) + '\n\n' + pay;
  const msgPaid = 'Hi ' + first + ', we have received your advance. Your order ' + id + ' is booked for ' + when + '. Thank you!';
  const msgReady = 'Hi ' + first + ', your Cravella order ' + id + ' is ready' + (v.mode === 'Delivery' ? ' and out for delivery.' : ' for pickup.');
  const msgAsk = 'Hi ' + first + ', thank you for your order ' + id + ' at Cravella Bake House. Before we confirm, we need to check a detail with you:';
  const btn = (label, txt, bg) => '<a href="' + wa(txt) + '" style="display:inline-block;margin:0 6px 8px 0;padding:10px 14px;border-radius:8px;background:' + bg + ';color:#ffffff;text-decoration:none;font-weight:bold">' + label + '</a>';
  const buttons = '<p style="margin:14px 0 4px;color:#7d6a58">Tap to open WhatsApp with the message ready, then press send:</p>'
    + btn('Confirm order', msgConfirm, '#1f7a4d') + btn('Advance received', msgPaid, '#2563a8') + btn('Order ready', msgReady, '#b4532a') + btn('Ask a question', msgAsk, '#6b5a4c');
  const html = '<div style="font-family:Arial,sans-serif;font-size:14px;color:#3b2416">'
    + '<h2 style="margin:0 0 6px">New order request '+id+'</h2>'
    + '<p style="margin:0 0 10px"><b>'+esc(v.name)+'</b> · <a href="https://wa.me/91'+v.phone+'">'+v.phone+' (WhatsApp)</a></p>'
    + '<p style="margin:0 0 10px">'+esc(v.mode)+': <b>'+esc(v.date)+', '+esc(v.time)+'</b>'+(v.address?'<br>Address: '+esc(v.address):'')+'</p>'
    + '<table style="border-collapse:collapse">'+rows+(v.discount ? '<tr><td style="padding-top:6px;color:#1f7a4d">Subtotal ₹'+v.subtotal+' · Discount: '+esc(v.discNote)+'</td><td align="right" style="padding-top:6px;color:#1f7a4d"><b>−₹'+v.discount+'</b></td></tr>' : '')+'<tr><td style="padding-top:8px"><b>Estimated total</b></td><td align="right" style="padding-top:8px"><b>₹'+v.total+'</b></td></tr></table>'
    + (v.toConfirm ? '<p style="color:#b4532a"><b>Some cake weights are estimates – please confirm the price.</b></p>' : '')
    + (v.notes ? '<p><b>Notes:</b> '+esc(v.notes)+'</p>' : '')
    + (photos.length ? '<p><b>Reference photos:</b> '+photos.length+' attached</p>' : '')
    + buttons
    + '<p><a href="' + book_().getUrl() + '">Open the orders Sheet</a></p><p style="color:#7d6a58">Delivery fee (if any) is not included. Reply to the customer on WhatsApp to confirm.</p></div>';
  MailApp.sendEmail({to: NOTIFY_EMAIL, subject: 'New order request '+id+' – '+v.name+' – ₹'+v.total,
    htmlBody: html, body: 'New order request '+id+' from '+v.name+' ('+v.phone+'). See the Requests sheet.',
    attachments: photos.map(p => p.blob), name: 'Cravella orders'});
}

function out_(o){ return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

/** Run once from the editor to grant permissions (Sheets, Drive, Mail). */
function authorize(){
  sheet_(); DriveApp.getRootFolder(); MailApp.getRemainingDailyQuota();
  Logger.log('Your orders Sheet: ' + book_().getUrl());
}

/* ---------- customer accounts: sign in with an email code, saved details, order history ---------- */
const CUST_HEAD = ['Email','Name','Phone','Address','Created','Last sign-in'];
const SESS_HEAD = ['Token hash','Email','Expires'];
const SESSION_DAYS = 60;

function hex_(b){ return b.map(function(x){ return ('0' + (x & 0xff).toString(16)).slice(-2); }).join(''); }
function h_(s){ return hex_(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(s))); }
function tab_(name, head){
  const ss = book_(); let sh = ss.getSheetByName(name);
  if (!sh){
    sh = ss.insertSheet(name);
    sh.getRange(1,1,1,head.length).setValues([head]).setFontWeight('bold');
    sh.setFrozenRows(1);
    if (name === 'Sessions') sh.hideSheet();
    if (name === 'Customers') sh.getRange('C:C').setNumberFormat('@');
  }
  return sh;
}
function emailOk_(e){
  e = String(e || '').trim().toLowerCase();
  return (e.length <= 254 && /^[^\s@,;<>]{1,64}@[^\s@,;<>]{1,190}\.[^\s@,;<>]{2,}$/.test(e)) ? e : '';
}
function findRow_(sh, col, val){
  const n = sh.getLastRow(); if (n < 2) return 0;
  const v = sh.getRange(2, col, n - 1, 1).getValues();
  for (let i = 0; i < v.length; i++) if (String(v[i][0]).toLowerCase() === val) return i + 2;
  return 0;
}
function bump_(key, limit, ttl){
  const c = CacheService.getScriptCache(), n = Number(c.get(key) || 0);
  if (n >= limit) return false;
  c.put(key, String(n + 1), ttl); return true;
}
function authEmail_(token){
  token = String(token || '');
  if (token.length < 32 || token.length > 128) return '';
  const sh = tab_('Sessions', SESS_HEAD), row = findRow_(sh, 1, h_(token));
  if (!row) return '';
  const v = sh.getRange(row, 1, 1, 3).getValues()[0];
  if (Number(v[2]) < Date.now()){ sh.deleteRow(row); return ''; }
  return String(v[1]).toLowerCase();
}
function profileOf_(email){
  const sh = tab_('Customers', CUST_HEAD), row = findRow_(sh, 1, email);
  if (!row) return {email: email, name: '', phone: '', address: ''};
  const v = sh.getRange(row, 1, 1, 4).getValues()[0];
  return {email: email, name: String(v[1] || ''), phone: String(v[2] || ''), address: String(v[3] || '')};
}
function touchCustomer_(email, d){
  const sh = tab_('Customers', CUST_HEAD); let row = findRow_(sh, 1, email);
  if (!row){
    sh.appendRow([email, d.name || '', '', d.address || '', new Date(), new Date()]);
    row = sh.getLastRow(); sh.getRange(row, 3).setNumberFormat('@').setValue(d.phone || '');
    return;
  }
  if (d.name) sh.getRange(row, 2).setValue(d.name);
  if (d.phone) sh.getRange(row, 3).setNumberFormat('@').setValue(d.phone);
  if (d.address) sh.getRange(row, 4).setValue(d.address);
}
function ordersOf_(email){
  const sh = sheet_(), n = sh.getLastRow(), out = [];
  if (n < 2) return out;
  const v = sh.getRange(2, 1, n - 1, 17).getValues();
  for (let i = v.length - 1; i >= 0 && out.length < 40; i--){
    if (String(v[i][16]).toLowerCase() !== email) continue;
    let j = {}; try { j = JSON.parse(v[i][14]) || {}; } catch (_) {}
    const rec = v[i][1];
    out.push({
      id: String(v[i][0]),
      placed: (rec instanceof Date) ? Utilities.formatDate(rec, 'Asia/Kolkata', 'dd MMM yyyy') : String(rec),
      status: String(v[i][2] || 'New'),
      mode: j.mode || String(v[i][7]), date: j.date || '', time: j.time || '',
      lines: String(v[i][9] || '').split('\n'),
      total: Number(v[i][10]) || 0,
      items: Array.isArray(j.items) ? j.items : []
    });
  }
  return out;
}

function accountApi_(r){
  const a = String(r.action);
  if (a === 'otp_request'){
    const email = emailOk_(r.email);
    if (!email) return {ok:false, error:'Please enter a valid email address.'};
    if (!bump_('otpr:' + h_(email), 3, 3600) || !bump_('otpg', 60, 3600))
      return {ok:false, error:'Too many codes requested. Please try again in an hour, or WhatsApp us.'};
    const code = ('000000' + Math.floor(Math.random() * 1000000)).slice(-6);
    CacheService.getScriptCache().put('otp:' + h_(email), JSON.stringify({c: h_(code + '|' + email), t: 0}), 600);
    MailApp.sendEmail({
      to: email, name: 'Cravella Bake House',
      subject: 'Your Cravella sign-in code: ' + code,
      htmlBody: '<div style="font-family:Arial,sans-serif;max-width:420px;color:#3b2416"><p>Your Cravella Bake House sign-in code is</p>'
        + '<p style="font-size:32px;letter-spacing:6px;font-weight:bold;margin:8px 0">' + code + '</p>'
        + '<p>It works for 10 minutes. If you did not ask for this, you can ignore this email.</p></div>',
      body: 'Your Cravella Bake House sign-in code is ' + code + '. It works for 10 minutes.'
    });
    return {ok:true};
  }
  if (a === 'otp_verify'){
    const email = emailOk_(r.email), code = String(r.code || '').replace(/\D/g, '');
    if (!email || code.length !== 6) return {ok:false, error:'Please enter the 6-digit code.'};
    const cache = CacheService.getScriptCache(), key = 'otp:' + h_(email), raw = cache.get(key);
    if (!raw) return {ok:false, error:'That code has expired. Please request a new one.'};
    const o = JSON.parse(raw);
    if (o.c !== h_(code + '|' + email)){
      o.t++; if (o.t >= 5) cache.remove(key); else cache.put(key, JSON.stringify(o), 600);
      return {ok:false, error: o.t >= 5 ? 'Too many wrong tries. Please request a new code.' : 'That code is not right. Please try again.'};
    }
    cache.remove(key);
    const token = (Utilities.getUuid() + Utilities.getUuid()).replace(/-/g, '');
    tab_('Sessions', SESS_HEAD).appendRow([h_(token), email, Date.now() + SESSION_DAYS * 86400000]);
    const cs = tab_('Customers', CUST_HEAD), row = findRow_(cs, 1, email);
    if (row) cs.getRange(row, 6).setValue(new Date()); else touchCustomer_(email, {});
    return {ok:true, token:token, profile:profileOf_(email)};
  }
  if (a === 'coupon_check') return couponCheck_(r);
  const email = authEmail_(r.token);
  if (!email) return {ok:false, error:'auth'};
  if (a === 'me') return {ok:true, profile:profileOf_(email), orders:ordersOf_(email)};
  if (a === 'save_profile'){
    const clean = function(s){ return String(s == null ? '' : s).replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim(); };
    const name = clean(r.name).slice(0, 80), address = clean(r.address).slice(0, 300);
    let phone = String(r.phone || '').replace(/\D/g, '');
    if (phone.length === 12 && phone.indexOf('91') === 0) phone = phone.slice(2);
    if (phone.length === 11 && phone[0] === '0') phone = phone.slice(1);
    if (name.length < 2) return {ok:false, error:'Please enter your name.'};
    if (phone && !/^[6-9]\d{9}$/.test(phone)) return {ok:false, error:'Please enter a valid 10-digit mobile number.'};
    const sh = tab_('Customers', CUST_HEAD); let row = findRow_(sh, 1, email);
    if (!row){ touchCustomer_(email, {}); row = findRow_(sh, 1, email); }
    sh.getRange(row, 2).setValue(name); sh.getRange(row, 3).setNumberFormat('@').setValue(phone); sh.getRange(row, 4).setValue(address);
    return {ok:true, profile:profileOf_(email)};
  }
  if (a === 'logout'){
    const sh = tab_('Sessions', SESS_HEAD), row = findRow_(sh, 1, h_(String(r.token)));
    if (row) sh.deleteRow(row);
    return {ok:true};
  }
  return {ok:false, error:'Unknown request.'};
}

function mk_(d){
  const dt = (d instanceof Date) ? d : new Date(String(d));
  return Utilities.formatDate(dt, 'Asia/Kolkata', 'yyyy-MM MMM');
}
// Run once after updating: adds Month + Email columns, fills Month for old rows, builds the "Sales by month" tab.
function upgrade(){
  const ss = book_(), sh = sheet_();
  sh.getRange('P1:Q1').setValues([['Month','Email']]).setFontWeight('bold').setBackground('#fffbbe');
  sh.getRange('P:Q').setNumberFormat('@');
  sh.getRange('R1:T1').setValues([['Subtotal (₹)','Discount (₹)','Discount note']]).setFontWeight('bold').setBackground('#fffbbe');
  discSheet_();
  const n = sh.getLastRow();
  for (let r = 2; r <= n; r++){
    const c = sh.getRange(r, 16), d = sh.getRange(r, 6).getValue();
    if (!c.getValue() && d) c.setValue(mk_(d));
  }
  tab_('Customers', CUST_HEAD); tab_('Sessions', SESS_HEAD);
  let s = ss.getSheetByName('Sales by month') || ss.insertSheet('Sales by month');
  s.clear();
  s.getRange('A1').setFormula('=QUERY(Requests!A2:Q,"select P, count(A), sum(K) where C <> \'Cancelled\' and P <> \'\' group by P order by P label P \'Month\', count(A) \'Orders\', sum(K) \'Estimated sales (₹)\'",0)');
  s.getRange('E1').setValue('All months').setFontWeight('bold');
  s.getRange('E2').setValue('Orders'); s.getRange('F2').setFormula('=SUM(B2:B)');
  s.getRange('E3').setValue('Estimated sales (₹)'); s.getRange('F3').setFormula('=SUM(C2:C)');
  s.getRange('A1:C1').setFontWeight('bold').setBackground('#fffbbe');
  s.getRange('C:C').setNumberFormat('#,##0'); s.getRange('F3').setNumberFormat('#,##0');
  s.setColumnWidths(1, 1, 120); s.setColumnWidths(3, 1, 150); s.setColumnWidths(5, 1, 150);
}

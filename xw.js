/* The Crumb Crossword: a small weekly baking crossword. Loaded only when someone taps the card. */
(function(){
  // Each puzzle: across words for rows 1, 3, 5 and down words for columns 1, 3, 5 (blocks sit where an odd row meets an odd column).
  var PUZ=[
    {a:['TRAYS','ASIDE','TREAT'],d:['TOAST','ARISE','SWEET'],
     ac:['Baking ___ slide into the oven','Set the cake ___ to cool','A sweet ___ with your chai'],
     dc:['Bread, golden-brown','Yeast dough will ___','Opposite of savoury']},
    {a:['TARTS','SWIRL','EVERY'],d:['TASTE','RAISE','SALTY'],
     ac:['Fruit-filled pastry cases','Marble cake pattern, or to stir gently','___ morning we bake fresh'],
     dc:['Sample a bite to check the batter','What baking powder does to a batter','Like a pretzel, not sweet']},
    {a:['BASIC','TORTE','HAPPY'],d:['BATCH','SYRUP','CHEWY'],
     ac:['Plain, like a simple sponge recipe','Rich layered chocolate cake','How a birthday cake makes you feel'],
     dc:['One tray of cookies','Sugar ___ for soaking a sponge','Soft and bendy, like a good brownie']},
    {a:['FLOUR','OCEAN','TASTE'],d:['FROST','OVENS','RANGE'],
     ac:['Powder for baking bread','Sea salt comes from the ___','Try a bite to check the flavour'],
     dc:['Spread buttercream over a cake','Where bakers bake, more than one','Cooker with an oven and a hob']},
    {a:['RIGHT','LEAVE','SEEDS'],d:['ROLLS','GLAZE','TIERS'],
     ac:['Just ___: perfectly baked','___ the dough to rest','Poppy and sesame ___ on a bun'],
     dc:['Soft bread ___ for dinner','Shiny sugar coating on a doughnut','Layers of a wedding cake']},
    {a:['CACAO','ABOVE','TIERS'],d:['COAST','CLOSE','OVENS'],
     ac:['The bean that becomes chocolate','Put the rack ___ the middle','Stacked cake layers'],
     dc:['Seashore','Shut the oven door','A baker’s hot boxes']},
    {a:['FILLS','CACAO','SALTY'],d:['FOCUS','LOCAL','STORY'],
     ac:['Jam ___ a doughnut','Raw bean behind chocolate','Like a pretzel'],
     dc:['Pay close attention when piping','From the neighbourhood shop','Every cake has one to tell']}
  ];
  var START=Date.UTC(2026,9,30),DAY=864e5,KEY='cb_xw';
  var AN=[1,4,5],DN=[1,2,3];
  function info(){var d=new Date(),t=Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()),w=Math.max(0,Math.floor((t-START)/(7*DAY)));
    var f=new Date(START+w*7*DAY);return {n:w+1,i:w%PUZ.length,date:f.toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',timeZone:'UTC'})}}
  function load(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(_){return {}}}
  function save(o){try{localStorage.setItem(KEY,JSON.stringify(o))}catch(_){}}
  function sol(p){var g=[],r,c;for(r=0;r<5;r++)for(c=0;c<5;c++)g.push(r%2===0?p.a[r/2][c]:c%2===0?p.d[c/2][r]:'#');return g}
  var css='#xw{background:#fffdf6;color:#111;font-family:Georgia,"Times New Roman",serif;border:2px solid #111;margin:6px 0 14px;-webkit-tap-highlight-color:transparent}#xw .xbk{display:block;width:100%;text-align:left;background:#fffdf6;border:0;border-bottom:1px solid #111;padding:10px 14px;font:700 13px Helvetica,Arial,sans-serif;letter-spacing:.08em;color:#111}'+
  '#xw *{box-sizing:border-box}#xw .xh{display:flex;align-items:center;gap:8px;padding:6px 12px;border-bottom:3px double #111}#xw .xh:before{content:"";width:56px}'+
  '#xw .xm{flex:1;text-align:center}#xw .xm small{display:block;font:11px Helvetica,Arial,sans-serif;letter-spacing:.16em}#xw .xm b{display:block;font:900 20px Georgia,serif}#xw .xt{width:56px;text-align:right;font:700 15px Helvetica,Arial,sans-serif;font-variant-numeric:tabular-nums}'+
  '#xw .xs{padding:12px 14px 8px}#xw .xg{display:grid;grid-template-columns:repeat(5,var(--cs));grid-template-rows:repeat(5,var(--cs));width:max-content;margin:4px auto 10px;border:2.5px solid #111;--cs:min(56px,calc((100vw - 64px)/5))}'+
  '#xw .xc{border:1px solid #111;background:#fff;position:relative;display:grid;place-items:center;font:700 calc(var(--cs)*.5) Georgia,serif;cursor:pointer;user-select:none}#xw .xc.k{background:#111;cursor:default}#xw .xc.w{background:#e6e6e6}#xw .xc.s{background:#111;color:#fff}'+
  '#xw .xc.x{background-image:repeating-linear-gradient(45deg,transparent 0 5px,rgba(0,0,0,.28) 5px 6px)}#xw .xc.s.x{background-image:none}#xw .xc small{position:absolute;top:2px;left:4px;font:700 11px Helvetica,Arial,sans-serif;line-height:1}'+
  '#xw .xtl{display:flex;gap:8px;justify-content:center;margin:0 0 8px}#xw .xtl button{border:1.5px solid #111;background:#fff;font:700 11px Helvetica,Arial,sans-serif;letter-spacing:.08em;padding:8px 11px;border-radius:2px;color:#111}'+
  '#xw .xq{background:#111;color:#fff;font:15px/1.3 Georgia,serif;padding:9px 12px;margin:0 0 8px;min-height:40px}#xw .xq b{margin-right:6px}'+
  '#xw .xl{display:flex;gap:18px;font:14px/1.35 Georgia,serif;padding-bottom:10px}#xw .xl>div{flex:1}#xw .xl h4{font:700 11px Helvetica,Arial,sans-serif;letter-spacing:.14em;border-bottom:1.5px solid #111;margin:0 0 5px;padding-bottom:3px}#xw .xl p{margin:0 0 5px;padding:2px 3px;cursor:pointer}#xw .xl p.a{background:#e6e6e6}#xw .xl b{margin-right:5px}'+
  '#xw .xk{position:sticky;bottom:var(--xnav,64px);z-index:6;background:#d8d4cb;padding:8px 4px 8px;border-top:1px solid #111}@media (hover:hover) and (pointer:fine){#xw .xk{display:none}#xw .xhint{display:block!important}}#xw .xhint{display:none;text-align:center;font:italic 13px Georgia,serif;color:#555;padding:0 0 10px}#xw .xk div{display:flex;gap:4px;justify-content:center;margin-bottom:6px}#xw .xk button{flex:1;max-width:36px;height:40px;background:#fff;border:0;border-radius:5px;font:600 17px Helvetica,Arial,sans-serif;box-shadow:0 1px 0 #999;color:#111}#xw .xk button.w{max-width:52px}'+
  '#xw .xv{text-align:center;padding:26px 8px}#xw .xv h2{font:900 36px Georgia,serif;margin:0 0 6px}#xw .xv p{font:italic 16px Georgia,serif;color:#444;margin:0}#xw .xst{display:flex;margin:22px 0;border:2px solid #111}#xw .xst div{flex:1;padding:10px 0;border-right:1px solid #111}#xw .xst div:last-child{border:0}#xw .xst b{display:block;font:900 26px Georgia,serif}#xw .xst span{font:10.5px Helvetica,Arial,sans-serif;letter-spacing:.1em}'+
  '#xw .xbt{display:block;width:100%;max-width:340px;margin:10px auto 0;padding:13px;background:#111;color:#fff;border:0;border-radius:2px;font:700 14px Helvetica,Arial,sans-serif;letter-spacing:.08em;text-decoration:none;text-align:center}#xw .xbt.o{background:#fff;color:#111;border:1.5px solid #111}'+
  '@media (prefers-reduced-motion:no-preference){#xw{animation:xwin .22s ease-out}@keyframes xwin{from{opacity:0;transform:translateY(10px)}}}';
  var ST=null;
  function pad(n){return n<10?'0'+n:''+n}
  function fmt(s){return Math.floor(s/60)+':'+pad(s%60)}
  function open(){
    if(document.getElementById('xw'))return;
    if(!document.getElementById('xwcss')){var s=document.createElement('style');s.id='xwcss';s.textContent=css;document.head.appendChild(s)}
    var inf=info(),P=PUZ[inf.i],S=sol(P),all=load(),sv=all['n'+inf.n]||{};
    ST={inf:inf,P:P,S:S,L:(sv.L&&sv.L.length===25)?sv.L.split(''):S.map(function(x){return x==='#'?'#':' '}),t:sv.t||0,done:!!sv.done,hints:sv.h||0,r:0,c:0,dir:'a',bad:{},last:Date.now()};
    var el=document.createElement('div');el.id='xw';el.setAttribute('aria-label','The Crumb Crossword');var host=document.getElementById('panel')||document.body;host.innerHTML='';host.appendChild(el);
    try{var nv=document.getElementById('bn');if(nv)el.style.setProperty('--xnav',Math.round(nv.getBoundingClientRect().height)+'px')}catch(_){}
    render();window.scrollTo(0,0);
    ST.tick=setInterval(function(){if(!document.getElementById('xw')){gone();return}if(!ST.done&&!document.hidden){ST.t++;var t=document.getElementById('xwT');if(t)t.textContent=fmt(ST.t);if(ST.t%5===0)persist()}},1000);
    document.addEventListener('keydown',onKey,true);
  }
  function gone(){if(!ST)return;persist();clearInterval(ST.tick);document.removeEventListener('keydown',onKey,true);ST=null}
  function close(){if(!ST)return;gone();try{renderPanel();var c=document.querySelector('.xwc');if(c)c.scrollIntoView({block:'center'});else scrollTo(0,0)}catch(_){}}
  function order(){gone();try{S.tab='cakes';renderTabs();renderPanel();scrollTo(0,0)}catch(_){}}
  function persist(){if(!ST)return;var all=load();all['n'+ST.inf.n]={L:ST.L.join(''),t:ST.t,done:ST.done,h:ST.hints};save(all)}
  function isK(r,c){return r%2===1&&c%2===1}
  function wordCells(){var a=[],i;if(ST.dir==='a')for(i=0;i<5;i++)a.push([ST.r,i]);else for(i=0;i<5;i++)a.push([i,ST.c]);return a}
  function canDir(r,c,d){return d==='a'?r%2===0:c%2===0}
  function clueNo(){return ST.dir==='a'?AN[ST.r/2]:DN[ST.c/2]}
  function clueTx(){return ST.dir==='a'?ST.P.ac[ST.r/2]:ST.P.dc[ST.c/2]}
  function esc(t){return String(t).replace(/[&<>]/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[m]})}
  function render(){
    var el=document.getElementById('xw');if(!el||!ST)return;
    var h='<button class="xbk" id="xwX">‹ BACK TO MAIN PAGE</button><div class="xh"><div class="xm"><small>CRAVELLA BAKE HOUSE PRESENTS</small><b>The Crumb Crossword</b><small>NO. '+ST.inf.n+' · '+esc(ST.inf.date.toUpperCase())+'</small></div><div class="xt" id="xwT">'+fmt(ST.t)+'</div></div>';
    if(ST.done){
      h+='<div class="xs"><div class="xv"><h2>Sweet work!</h2><p>You finished No. '+ST.inf.n+' in '+fmt(ST.t)+'</p><div class="xst"><div><b>'+fmt(ST.t)+'</b><span>TIME</span></div><div><b>'+ST.hints+'</b><span>HINTS</span></div></div>'+
        '<a class="xbt" id="xwSh" href="#">SHARE ON WHATSAPP</a><button class="xbt o" id="xwOd">ORDER A CAKE →</button><p style="margin-top:18px;font-size:13px">Next puzzle: Friday</p></div></div>';
      el.innerHTML=h;wire();return}
    var wc=wordCells(),inW={};wc.forEach(function(x){inW[x[0]*5+x[1]]=1});
    var g='<div class="xg" id="xwG">',nums={0:1,2:2,4:3,10:4,20:5},r,c,i;
    for(r=0;r<5;r++)for(c=0;c<5;c++){i=r*5+c;
      if(isK(r,c)){g+='<div class="xc k"></div>';continue}
      var cls='xc'+(r===ST.r&&c===ST.c?' s':inW[i]?' w':'')+(ST.bad[i]?' x':'');
      g+='<div class="xc'+cls.slice(2)+'" data-i="'+i+'">'+(nums[i]?'<small>'+nums[i]+'</small>':'')+(ST.L[i]===' '?'':ST.L[i])+'</div>'}
    g+='</div>';
    var kb='QWERTYUIOP ASDFGHJKL ZXCVBNM'.split(' ').map(function(row,k){return '<div>'+row.split('').map(function(ch){return '<button data-k="'+ch+'">'+ch+'</button>'}).join('')+(k===2?'<button class="w" data-k="⌫" aria-label="Delete">⌫</button>':'')+'</div>'}).join('');
    var cl=function(arr,nm,dir){return arr.map(function(t,k){var act=ST.dir===dir&&((dir==='a'&&ST.r===k*2)||(dir==='d'&&ST.c===k*2));return '<p class="'+(act?'a':'')+'" data-cl="'+dir+k+'"><b>'+nm[k]+'</b>'+esc(t)+'</p>'}).join('')};
    h+='<div class="xs">'+g+'<div class="xtl"><button id="xwCk">CHECK</button><button id="xwRv">REVEAL LETTER</button><button id="xwCl">CLEAR</button></div>'+
      '<div class="xq"><b>'+clueNo()+' '+(ST.dir==='a'?'ACROSS':'DOWN')+'</b>'+esc(clueTx())+'</div>'+
      '<div class="xl"><div><h4>ACROSS</h4>'+cl(ST.P.ac,AN,'a')+'</div><div><h4>DOWN</h4>'+cl(ST.P.dc,DN,'d')+'</div></div><div class="xhint">Type your answers with your keyboard</div></div><div class="xk">'+kb+'</div>';
    el.innerHTML=h;wire();
  }
  function wire(){
    var el=document.getElementById('xw');
    el.querySelector('#xwX').onclick=close;
    var sh=el.querySelector('#xwSh');if(sh){var m='I solved The Crumb Crossword No. '+ST.inf.n+' in '+fmt(ST.t)+'! Try this week’s baking puzzle — Cravella Bake House, https://order.cravellabakehouse.com';sh.href='https://wa.me/?text='+encodeURIComponent(m);sh.target='_blank';sh.rel='noopener'}
    var od=el.querySelector('#xwOd');if(od)od.onclick=order;
    var g=el.querySelector('#xwG');
    if(g)g.onclick=function(e){var c=e.target.closest('[data-i]');if(!c)return;var i=+c.dataset.i,r=Math.floor(i/5),cc=i%5;
      if(r===ST.r&&cc===ST.c){var nd=ST.dir==='a'?'d':'a';if(canDir(r,cc,nd))ST.dir=nd}else{ST.r=r;ST.c=cc;if(!canDir(r,cc,ST.dir))ST.dir=ST.dir==='a'?'d':'a'}render()};
    el.querySelectorAll('[data-cl]').forEach(function(p){p.onclick=function(){var d=p.dataset.cl[0],k=+p.dataset.cl.slice(1);ST.dir=d;if(d==='a'){ST.r=k*2;ST.c=0}else{ST.c=k*2;ST.r=0}render()}});
    el.querySelectorAll('[data-k]').forEach(function(b){b.onclick=function(){key(b.dataset.k)}});
    var q;if(q=el.querySelector('#xwCk'))q.onclick=check;if(q=el.querySelector('#xwRv'))q.onclick=reveal;if(q=el.querySelector('#xwCl'))q.onclick=function(){ST.L=ST.S.map(function(x){return x==='#'?'#':' '});ST.bad={};render()};
  }
  function step(dir){ // move one cell along the current word, staying inside it
    if(ST.dir==='a'){var c=ST.c+dir;if(c>=0&&c<5)ST.c=c}else{var r=ST.r+dir;if(r>=0&&r<5)ST.r=r}}
  function key(k){
    if(!ST||ST.done)return;var i=ST.r*5+ST.c;
    if(k==='⌫'){if(ST.L[i]!==' '){ST.L[i]=' ';delete ST.bad[i]}else{step(-1);var j=ST.r*5+ST.c;ST.L[j]=' ';delete ST.bad[j]}render();persist();return}
    if(!/^[A-Z]$/.test(k))return;
    ST.L[i]=k;delete ST.bad[i];step(1);render();persist();win();
  }
  function win(){var ok=true,i;for(i=0;i<25;i++)if(ST.S[i]!=='#'&&ST.L[i]!==ST.S[i]){ok=false;break}
    if(ok&&!ST.done){ST.done=true;ST.bad={};persist();render()}}
  function check(){ST.bad={};var i;for(i=0;i<25;i++)if(ST.S[i]!=='#'&&ST.L[i]!==' '&&ST.L[i]!==ST.S[i])ST.bad[i]=1;render()}
  function reveal(){var i=ST.r*5+ST.c;if(ST.L[i]!==ST.S[i]){ST.L[i]=ST.S[i];ST.hints++;delete ST.bad[i]}render();persist();win()}
  function onKey(e){if(!ST||e.metaKey||e.ctrlKey||e.altKey)return;var k=e.key;
    if(k==='Escape'){close();return}
    if(k==='Backspace'){e.preventDefault();key('⌫');return}
    if(/^[a-zA-Z]$/.test(k)){e.preventDefault();key(k.toUpperCase());return}
    var mv={ArrowRight:[0,1],ArrowLeft:[0,-1],ArrowDown:[1,0],ArrowUp:[-1,0]}[k];
    if(mv){e.preventDefault();var r=ST.r+mv[0],c=ST.c+mv[1];if(r>=0&&r<5&&c>=0&&c<5&&!isK(r,c)){ST.r=r;ST.c=c;if(!canDir(r,c,ST.dir))ST.dir=ST.dir==='a'?'d':'a';render()}}
    if(k==='Tab'){e.preventDefault();var nd=ST.dir==='a'?'d':'a';if(canDir(ST.r,ST.c,nd))ST.dir=nd;render()}}
  window.XW={open:open,info:info,state:function(){var inf=info(),s=load()['n'+inf.n]||{};return {n:inf.n,done:!!s.done,t:s.t||0}}};
})();

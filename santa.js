/* Cravella Santa: a small cake-loving Santa that walks in the two side margins of the Christmas Plum Cakes banner.
   Self-contained. Loaded from index.html. Remove the <script src="santa.js"> line to take him off the site.
   OWNER SWITCH: set SANTA_ON to false, or change SANTA_END, then deploy. */
(function(){
'use strict';
var SANTA_ON=true;                                   /* owner switch: true = Santa shows, false = off */
var SANTA_END='2026-12-26T00:00:00+05:30';           /* Santa switches himself off after this moment */
var KEY='cb_santa';                                  /* remembers "Hide Santa" on this device */

if(!SANTA_ON||Date.now()>=new Date(SANTA_END).getTime())return;
try{if(window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches)return}catch(_){}
if(/[?&]sp=1/.test(location.search))return;          /* admin preview frame */

function hidden(){try{return localStorage.getItem(KEY)==='off'}catch(_){return false}}
function setHidden(v){try{v?localStorage.setItem(KEY,'off'):localStorage.removeItem(KEY)}catch(_){}}

/* ---------- styles ---------- */
var css=document.createElement('style');
css.textContent='.hxm .xm-in{z-index:2}.hxm{overflow:hidden}'+
'.santa-stage{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:1}'+
'.santa{position:absolute;left:0;top:0;width:110px;height:150px;transform-origin:0 0;pointer-events:none;will-change:transform,opacity}'+
'.santa svg{display:block;overflow:visible}'+
'.santa-bub{position:absolute;left:0;top:0;pointer-events:none;background:#fff;color:#7a1420;font:800 11px/1.15 "Hanken Grotesk",sans-serif;padding:4px 8px;border-radius:10px;border:1.5px solid #d62839;white-space:nowrap;opacity:0;transition:opacity .25s;box-shadow:0 2px 6px rgba(0,0,0,.3)}'+
'.santa-hide{position:absolute;right:8px;bottom:8px;z-index:3;appearance:none;-webkit-appearance:none;border:1px solid rgba(255,255,255,.55);background:rgba(0,0,0,.45);color:#fff;font:700 10.5px "Hanken Grotesk",sans-serif;padding:5px 9px;border-radius:999px;cursor:pointer;-webkit-tap-highlight-color:transparent;pointer-events:auto}'+
'.santa-hide:active{transform:scale(.96)}';
document.head.appendChild(css);

/* ---------- the figure (110 x 150) ---------- */
var SVG='<svg viewBox="0 0 110 150" width="110" height="150" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'+
'<g id="sBody">'+
 '<g id="sLL" transform="translate(44 118)"><rect x="-7" y="0" width="14" height="17" rx="5" fill="#a81f2d"/><path d="M-9 15 Q-9 25 -1 25 L11 25 Q13 19 6 15Z" fill="#222"/></g>'+
 '<g id="sLR" transform="translate(66 118)"><rect x="-7" y="0" width="14" height="17" rx="5" fill="#a81f2d"/><path d="M9 15 Q9 25 1 25 L-11 25 Q-13 19 -6 15Z" fill="#222"/></g>'+
 '<ellipse cx="55" cy="92" rx="35" ry="34" fill="#d62839"/>'+
 '<ellipse cx="55" cy="123" rx="29" ry="5.5" fill="#fff"/>'+
 '<rect x="21" y="96" width="68" height="8" rx="3" fill="#1d1d1d"/><rect x="49" y="94" width="12" height="12" rx="2" fill="#f2c14e"/><rect x="52" y="97" width="6" height="6" rx="1" fill="#1d1d1d"/>'+
 '<path d="M55 60 L55 94" stroke="#fff" stroke-width="3" opacity=".9"/>'+
 /* held props that sit in front of the tummy */
 '<g id="sCake" transform="translate(55 90)" style="display:none"><ellipse cx="0" cy="3" rx="21" ry="3.5" fill="#cfd3d8"/><rect x="-16" y="-13" width="32" height="14" rx="3" fill="#c98a5a"/>'+
   '<g id="sFrost"><rect x="-16" y="-17" width="32" height="7" rx="3.5" fill="#fff4f0"/><path d="M-16 -10 q4 5 8 0 q4 5 8 0 q4 5 8 0 q4 5 8 0" fill="#fff4f0"/></g>'+
   '<circle id="sCherry" cx="0" cy="-19" r="3" fill="#d4122a"/>'+
   '<g id="sCandles"><rect x="-9" y="-28" width="2.6" height="11" fill="#4aa3df"/><rect x="-1.3" y="-30" width="2.6" height="13" fill="#f2c14e"/><rect x="6.4" y="-28" width="2.6" height="11" fill="#e8569a"/>'+
     '<g id="sFlames"><ellipse cx="-7.7" cy="-31" rx="2" ry="3.2" fill="#ffb21e"/><ellipse cx="0" cy="-33.5" rx="2" ry="3.2" fill="#ffb21e"/><ellipse cx="7.7" cy="-31" rx="2" ry="3.2" fill="#ffb21e"/></g></g>'+
   '<g id="sSlice" style="display:none"><path d="M0 -13 L16 -13 L16 1 L0 1 Z" fill="#c98a5a"/><rect x="0" y="-17" width="16" height="6" rx="2" fill="#fff4f0"/></g></g>'+
 '<g id="sBox" transform="translate(55 92)" style="display:none"><rect x="-18" y="-10" width="36" height="13" rx="2" fill="#f3e2c7" stroke="#c9a36a" stroke-width="1.2"/>'+
   '<g id="sBoxCup"><path d="M-5 -10 L-4 -17 L4 -17 L5 -10Z" fill="#f58fb0"/><path d="M-6 -17 C-7 -24 7 -24 6 -17Z" fill="#fff4f0"/><circle cx="0" cy="-24" r="2.4" fill="#d4122a"/></g>'+
   '<g id="sLid" transform="translate(-19 -10)"><rect x="0" y="-6" width="38" height="6" rx="2" fill="#e9d1a8" stroke="#c9a36a" stroke-width="1.2"/></g></g>'+
 /* head */
 '<circle cx="55" cy="38" r="16" fill="#f6c9a0"/>'+
 '<path d="M39 40 C35 62 44 80 55 82 C66 80 75 62 71 40 C66 48 60 47 55 47 C50 47 44 48 39 40Z" fill="#fff" stroke="#e2e2e2" stroke-width="1"/>'+
 '<ellipse cx="48" cy="46" rx="8" ry="4" fill="#fff" transform="rotate(12 48 46)"/><ellipse cx="62" cy="46" rx="8" ry="4" fill="#fff" transform="rotate(-12 62 46)"/>'+
 '<circle cx="55" cy="41" r="3.6" fill="#e8806c"/><circle cx="48" cy="35" r="1.9" fill="#222"/><circle cx="62" cy="35" r="1.9" fill="#222"/>'+
 '<path d="M44 31 q4 -3 8 0 M58 31 q4 -3 8 0" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round"/>'+
 '<circle cx="44" cy="41" r="3" fill="#f08a8a" opacity=".5"/><circle cx="66" cy="41" r="3" fill="#f08a8a" opacity=".5"/>'+
 '<ellipse id="sMouth" cx="55" cy="54" rx="5" ry="1.4" fill="#7a1420"/>'+
 '<path d="M37 31 C38 8 60 -4 78 16 L76 31 Z" fill="#d62839"/><rect x="34" y="27" width="44" height="9" rx="4.5" fill="#fff"/><circle cx="80" cy="16" r="6.5" fill="#fff"/>'+
'</g>'+
/* arms (hanging down, pivot at the shoulder) */
'<g id="sAL" transform="translate(30 70)"><rect x="-6" y="-2" width="12" height="26" rx="6" fill="#d62839"/><rect x="-6.5" y="21" width="13" height="6" rx="3" fill="#fff"/><circle cx="0" cy="31" r="5" fill="#f6c9a0"/>'+
  '<g id="sBowl" transform="translate(0 31)" style="display:none"><path d="M-12 -9 Q0 12 12 -9Z" fill="#f4ece0" stroke="#bdb3a3" stroke-width="1"/><ellipse id="sBowlTop" cx="0" cy="-9" rx="12" ry="3" fill="#e7c9a0"/><g id="sFruit" style="display:none"><circle cx="-5" cy="-10" r="2" fill="#5a1f2a"/><circle cx="1" cy="-11" r="2" fill="#7a3a1a"/><circle cx="6" cy="-10" r="2" fill="#5a1f2a"/></g></g></g>'+
'<g id="sAR" transform="translate(80 70)"><rect x="-6" y="-2" width="12" height="26" rx="6" fill="#d62839"/><rect x="-6.5" y="21" width="13" height="6" rx="3" fill="#fff"/><circle cx="0" cy="31" r="5" fill="#f6c9a0"/>'+
  '<g id="sItems" transform="translate(0 31)">'+
   '<g id="sCup" style="display:none"><path d="M-6 -2 L-5 -12 L5 -12 L6 -2Z" fill="#f58fb0"/><path d="M-7 -12 C-8 -20 8 -20 7 -12Z" fill="#fff4f0"/><circle cx="0" cy="-21" r="2.6" fill="#d4122a"/></g>'+
   '<g id="sWhisk" style="display:none"><line x1="0" y1="0" x2="0" y2="-12" stroke="#777" stroke-width="2"/><ellipse cx="0" cy="-18" rx="4" ry="7" fill="none" stroke="#999" stroke-width="1.4"/></g>'+
   '<g id="sSpat" style="display:none"><rect x="-1.5" y="-14" width="3" height="14" fill="#8a5a2b"/><path d="M-5 -14 L5 -14 L4 -27 L-4 -27Z" fill="#c9ced4"/></g>'+
   '<g id="sKnife" style="display:none"><rect x="-2" y="-9" width="4" height="9" rx="1" fill="#2a2a2a"/><path d="M-1.5 -9 L-1.5 -31 L3.5 -27 L3.5 -9Z" fill="#d7dbe0"/></g>'+
   '<g id="sJug" style="display:none"><rect x="-6" y="-15" width="12" height="15" rx="3" fill="#f4ece0" stroke="#bdb3a3"/><rect x="-6" y="-9" width="12" height="5" fill="#b5651d"/><path d="M-6 -15 L-9 -17 L-6 -12Z" fill="#f4ece0" stroke="#bdb3a3"/></g>'+
  '</g></g>'+
'<g id="sJug3" style="display:none"><g id="sJa"><path d="M-4 0 L-3 -8 L3 -8 L4 0Z" fill="#f58fb0"/><path d="M-5 -8 C-6 -14 6 -14 5 -8Z" fill="#fff4f0"/><circle cx="0" cy="-15" r="2" fill="#d4122a"/></g>'+
  '<g id="sJb"><path d="M-4 0 L-3 -8 L3 -8 L4 0Z" fill="#7a4a2a"/><path d="M-5 -8 C-6 -14 6 -14 5 -8Z" fill="#5a3320"/><circle cx="0" cy="-15" r="2" fill="#d4122a"/></g>'+
  '<g id="sJc"><path d="M-4 0 L-3 -8 L3 -8 L4 0Z" fill="#9ad0f5"/><path d="M-5 -8 C-6 -14 6 -14 5 -8Z" fill="#fff4f0"/><circle cx="0" cy="-15" r="2" fill="#d4122a"/></g></g>'+
'<g id="sFx"></g></svg>';

/* ---------- helpers ---------- */
function $(r,id){return r.querySelector('#'+id)}
function sh(el,v){if(el)el.style.display=v?'':'none'}
function ease(x){return x<0?0:x>1?1:x*x*(3-2*x)}
function lerp(a,b,t){return a+(b-a)*t}
function rnd(a,b){return a+Math.random()*(b-a)}

/* ---------- actions: cake only. u = progress 0..1, t = seconds ---------- */
var ACT=[
 {n:'eat',d:4200,say:['Cake time!','100% eggless!'],on:['sCup'],f:function(P,u,t,S){
   var up=ease(u/.2)*(1-ease((u-.8)/.2));P.aR=lerp(18,237,up)+(u>.25&&u<.75?Math.sin(t*9)*5:0);
   var bite=u>.25&&u<.75&&Math.sin(t*9)>.4;P.mouth=bite?1:(u>.2&&u<.8?.45:0);
   if(bite&&Math.random()<.2)S.fx(55,60,'#c98a5a');
   if(u>.8){P.aL=lerp(18,-62,ease((u-.8)/.1))+Math.sin(t*12)*8}}},
 {n:'bake',d:4600,say:['Cake batter!','Fresh from the oven!'],on:['sBowl','sWhisk'],f:function(P,u,t,S){
   P.aL=-34;P.aR=-52+Math.sin(t*13)*14;P.mouth=u>.7?.5:0;S.bowl('#e7c9a0',0);
   if(Math.random()<.08)S.fx(52,86,'#fff',1)}},
 {n:'soak',d:4600,say:['Soaking the fruits...','Slow-soaked for a week!'],on:['sBowl','sJug'],f:function(P,u,t,S){
   P.aL=-34;var pour=ease(u/.25)*(1-ease((u-.85)/.15));P.aR=lerp(18,-12,pour)+40*pour;S.bowl('#7a3a1a',1);
   P.jugTilt=-70*pour;if(pour>.6&&Math.random()<.3)S.fx(52,84,'#c9792b',1)}},
 {n:'frost',d:4400,say:['Frosting time!','Cherry on top!'],on:['sCake','sSpat'],f:function(P,u,t,S){
   P.aL=-36;P.aR=-30+Math.sin(t*7)*22;S.cake({frost:ease(u/.6),cherry:u>.82,candles:0,slice:0});if(u<.8&&Math.random()<.06)S.fx(55,76,'#fff',1)}},
 {n:'cut',d:4400,say:['Cutting the cake...','Fresh slice!'],on:['sCake','sKnife'],f:function(P,u,t,S){
   P.aL=-36;var cut=ease((u-.1)/.4)*(1-ease((u-.5)/.15));P.aR=lerp(40,-8,cut);
   S.cake({frost:1,cherry:true,candles:0,slice:u>.6?ease((u-.6)/.25):0});if(u>.6&&u<.85)P.mouth=.4}},
 {n:'candles',d:4800,say:['Make a wish!','Happy birthday!'],on:['sCake'],f:function(P,u,t,S){
   P.aL=-36;P.aR=-36;var out=u>.72;S.cake({frost:1,cherry:false,candles:out?0:1,slice:0});
   P.tilt=out?0:(u>.55?lerp(0,-5,(u-.55)/.17):0);P.mouth=u>.6&&u<.76?.7:(u>.82?.5:0);if(u>.72&&u<.8)S.fx(55,52,'#fff',1)}},
 {n:'carry',d:5200,say:['Fresh plum cake!','Eggless and tasty!'],on:['sCake'],walk:true,f:function(P,u,t,S){
   P.aL=-52;P.aR=-52;P.dy=Math.sin(t*9)*1.4;S.cake({frost:1,cherry:true,candles:0,slice:0});S.walkSwing(P,t)}},
 {n:'juggle',d:4800,say:['Juggling cupcakes!','Ta-da!'],on:['sJug3'],f:function(P,u,t,S){
   var end=u>.88;P.aL=end?170:120+Math.sin(t*8)*28;P.aR=end?170:120-Math.sin(t*8)*28;P.mouth=u>.2?.3:0;S.juggle(t,end?0:1)}},
 {n:'box',d:4600,say:['Box of 6!','Fresh and eggless!'],on:['sBox'],f:function(P,u,t,S){
   P.aL=-36;P.aR=-36;var o=ease((u-.18)/.2);S.box(o,ease((u-.4)/.25)*(1-ease((u-.8)/.15)));P.mouth=o>.5?.4:0}}
];

/* ---------- one Santa per banner ---------- */
function make(banner){
  var st=document.createElement('div');st.className='santa-stage';
  var sa=document.createElement('div');sa.className='santa';sa.innerHTML='<div class="sflip" style="transform-origin:55px 75px">'+SVG+'</div>';
  var bub=document.createElement('div');bub.className='santa-bub';
  st.appendChild(sa);st.appendChild(bub);banner.insertBefore(st,banner.firstChild);
  var chip=document.createElement('button');chip.type='button';chip.className='santa-hide';banner.appendChild(chip);
  var R=sa,flip=sa.firstChild,$s=function(i){return $(sa,i)};
  var el={LL:$s('sLL'),LR:$s('sLR'),AL:$s('sAL'),AR:$s('sAR'),mouth:$s('sMouth'),body:$s('sBody'),
    cup:$s('sCup'),whisk:$s('sWhisk'),spat:$s('sSpat'),knife:$s('sKnife'),jug:$s('sJug'),bowl:$s('sBowl'),bowlTop:$s('sBowlTop'),fruit:$s('sFruit'),
    cake:$s('sCake'),frost:$s('sFrost'),cherry:$s('sCherry'),candles:$s('sCandles'),flames:$s('sFlames'),slice:$s('sSlice'),
    box:$s('sBox'),lid:$s('sLid'),boxCup:$s('sBoxCup'),j3:$s('sJug3'),ja:$s('sJa'),jb:$s('sJb'),jc:$s('sJc'),fx:$s('sFx'),items:$s('sItems')};
  var ALLP=['cup','whisk','spat','knife','jug','bowl','cake','box','j3'];
  var I={W:0,H:0,sc:.5,lanes:null,on:false};
  var M={x:0,y:0,tx:0,ty:0,lane:'L',dir:-1,op:0,mode:'idle',until:0,acts:0,act:null,t0:0,walkT:0,sayAt:0,sayTxt:'',sayUntil:0,swap:0,vis:true};
  var last=0,lastAct=0,hid=hidden(),raf=0,dead=false,P={},parts=[];
  function chipSet(){chip.textContent=hid?'Show Santa':'Hide Santa';chip.setAttribute('aria-label',chip.textContent)}
  chip.addEventListener('click',function(e){e.stopPropagation();hid=!hid;setHidden(hid);chipSet();sa.style.opacity=0;bub.style.opacity=0;M.op=0;M.mode='boot';layout()});
  chipSet();

  /* work out the free side margins from where the text really is */
  function layout(){
    var bw=banner.clientWidth,bh=banner.clientHeight,br=banner.getBoundingClientRect(),nx=bw,xx=0,any=false;
    var q=banner.querySelectorAll('.xk,h2,.xs,.xv small,.xv b,.xv span,.xp,.xe');I.tr=[];
    for(var i=0;i<q.length;i++){var r=document.createRange();r.selectNodeContents(q[i]);var b=r.getBoundingClientRect();if(!b.width)continue;any=true;nx=Math.min(nx,b.left-br.left);xx=Math.max(xx,b.right-br.left);var cr=r.getClientRects();for(var j=0;j<cr.length;j++)I.tr.push({l:cr[j].left-br.left-4,r:cr[j].right-br.left+4,t:cr[j].top-br.top-3,b:cr[j].bottom-br.top+3})}
    if(!any||!bw||!bh){I.on=false;return}
    var fl=nx-6,fr=bw-xx-6,free=Math.min(fl,fr),sc=Math.min(.5,free/(78+8));
    I.W=bw;I.H=bh;I.sc=sc;I.on=sc>=.3&&!hid;
    var fw=78*sc;
    I.lanes={L:[3+fw/2,Math.max(3+fw/2,nx-6-fw/2)],R:[Math.min(bw-3-fw/2,xx+6+fw/2),bw-3-fw/2]};
    if(!I.on){sa.style.opacity=0;bub.style.opacity=0}
  }
  var ro=window.ResizeObserver?new ResizeObserver(function(){layout()}):null;if(ro)ro.observe(banner);
  window.addEventListener('resize',layout);setTimeout(layout,60);setTimeout(layout,600);if(document.fonts&&document.fonts.ready)document.fonts.ready.then(layout);

  /* never in the customer's way: any touch, mouse, scroll or key makes him fade and slow down */
  function poke(){lastAct=performance.now()}
  ['pointermove','pointerdown','touchstart','touchmove','wheel','keydown','scroll'].forEach(function(n){window.addEventListener(n,poke,{passive:true,capture:true})});
  var inView=true;if(window.IntersectionObserver){new IntersectionObserver(function(a){inView=a[0].isIntersecting}).observe(banner)}

  var S={
    fx:function(x,y,c,up){if(parts.length>14)return;var g=document.createElementNS('http://www.w3.org/2000/svg','circle');g.setAttribute('r',1.6+Math.random()*1.2);g.setAttribute('fill',c);el.fx.appendChild(g);parts.push({g:g,x:x+rnd(-5,5),y:y,vx:rnd(-14,14),vy:up?rnd(-22,-6):rnd(-18,-4),life:0})},
    bowl:function(c,fr){el.bowlTop.setAttribute('fill',c);sh(el.fruit,fr)},
    cake:function(o){sh(el.frost,o.frost>0);el.frost.style.opacity=o.frost;sh(el.cherry,o.cherry);sh(el.candles,o.candles);sh(el.slice,o.slice>0);
       if(o.slice>0)el.slice.setAttribute('transform','translate('+(o.slice*22)+' 0)');if(o.candles)el.flames.setAttribute('transform','translate(0 '+(Math.sin(performance.now()/90)*.5)+') scale(1 '+(1+Math.sin(performance.now()/70)*.12)+')')},
    box:function(o,pop){el.lid.setAttribute('transform','translate(-19 -10) rotate('+(-o*110)+')');sh(el.boxCup,o>.3);el.boxCup.setAttribute('transform','translate(0 '+(-pop*8)+')')},
    juggle:function(t,on){sh(el.j3,on);var c=[el.ja,el.jb,el.jc];for(var i=0;i<3;i++){var a=t*5+i*2.094;c[i].setAttribute('transform','translate('+(55+Math.cos(a)*26)+' '+(10-Math.abs(Math.sin(a))*22)+')')}},
    walkSwing:function(P,t){P.legs=Math.sin(t*9)*24}
  };

  function say(txt,ms){if(hid||!I.on)return;M.sayTxt=txt;M.sayAt=performance.now();M.sayUntil=M.sayAt+ms;bub.textContent=txt}
  function outward(){return M.lane==='L'?-1:1}
  function pickTarget(){var L=I.lanes[M.lane],yMax=I.H-150*I.sc-8;M.tx=rnd(L[0],L[1]);M.ty=rnd(26,Math.max(26,yMax))}
  function placeAtLane(l){M.lane=l;var L=I.lanes[l];M.x=(L[0]+L[1])/2;M.y=rnd(26,Math.max(26,I.H-150*I.sc-8));M.dir=outward();pickTarget()}
  function startAct(now){var a=ACT[Math.floor(Math.random()*ACT.length)];if(a===M.prevAct)a=ACT[(ACT.indexOf(a)+1)%ACT.length];M.prevAct=a;M.act=a;M.mode='act';M.t0=now;M.until=now+a.d;M.said2=false;M.dir=outward();
     for(var i=0;i<ALLP.length;i++)sh(el[ALLP[i]],a.on.indexOf({cup:'sCup',whisk:'sWhisk',spat:'sSpat',knife:'sKnife',jug:'sJug',bowl:'sBowl',cake:'sCake',box:'sBox',j3:'sJug3'}[ALLP[i]])>=0);
     say(a.say[0],1900);if(a.walk){M.walkFrom=[M.x,M.y];var L=I.lanes[M.lane];M.walkTo=[rnd(L[0],L[1]),rnd(26,Math.max(26,I.H-150*I.sc-8))]}}
  function endAct(now){M.act=null;M.acts++;for(var i=0;i<ALLP.length;i++)sh(el[ALLP[i]],false);
    if(M.acts>=2){M.acts=0;M.mode='fadeout'}else{M.mode='idle';M.until=now+rnd(900,1800);pickTarget()}}

  function pose(P){
    el.AL.setAttribute('transform','translate(30 70) rotate('+P.aL+')');
    el.AR.setAttribute('transform','translate(80 70) rotate('+(-P.aR)+')');
    el.LL.setAttribute('transform','translate(44 118) rotate('+(P.legs)+')');
    el.LR.setAttribute('transform','translate(66 118) rotate('+(-P.legs)+')');
    el.mouth.setAttribute('ry',1.4+3.6*P.mouth);
    /* keep hand-held things upright */
    el.items.setAttribute('transform','translate(0 31) rotate('+P.aR+') rotate('+(P.jugTilt||0)+')');
    el.bowl.setAttribute('transform','translate(0 31) rotate('+(-P.aL)+')');
    el.body.setAttribute('transform','translate(0 '+P.dy+') rotate('+P.tilt+' 55 118)');
  }

  function frame(now){
    if(dead)return;raf=requestAnimationFrame(frame);
    if(!banner.isConnected||!st.isConnected){dead=true;cancelAnimationFrame(raf);if(ro)ro.disconnect();window.removeEventListener('resize',layout);return}
    var dt=Math.min(.05,(now-(last||now))/1000);last=now;
    if(document.hidden||!inView||!I.on||hid||!I.lanes){sa.style.opacity=0;bub.style.opacity=0;return}
    var busy=now-lastAct<2500;
    if(M.mode==='boot'||M.mode==='new'){placeAtLane(Math.random()<.5?'L':'R');M.mode='fadein'}
    P={aL:14,aR:14,legs:0,mouth:0,dy:0,tilt:0,jugTilt:0};
    var sway=Math.sin(now/700)*3;P.aL+=sway;P.aR-=sway;P.dy=Math.sin(now/600)*.8;
    var goalOp=1;
    if(M.mode==='idle'){
      var dx=M.tx-M.x,dy=M.ty-M.y,d=Math.hypot(dx,dy);
      if(d>2){var sp=(busy?10:26)*dt,k=Math.min(1,sp/d);M.x+=dx*k;M.y+=dy*k;if(Math.abs(dx)>1)M.dir=dx>0?1:-1;M.walkT+=dt;P.legs=Math.sin(M.walkT*9)*22}
      else if(now>M.until){if(!busy){M.dir=outward();startAct(now)}}
    }else if(M.mode==='act'){
      var a=M.act,u=Math.min(1,(now-M.t0)/a.d),t=(now-M.t0)/1000;
      if(!M.said2&&u>.5){M.said2=true;say(a.say[1],1700)}
      if(a.walk){var w=ease(u);M.x=lerp(M.walkFrom[0],M.walkTo[0],w);M.y=lerp(M.walkFrom[1],M.walkTo[1],w);var mv=M.walkTo[0]-M.walkFrom[0];if(Math.abs(mv)>3)M.dir=mv>0?1:-1}
      a.f(P,u,t,S);if(now>=M.until)endAct(now)
    }else if(M.mode==='fadeout'){goalOp=0;if(M.op<.03){placeAtLane(M.lane==='L'?'R':'L');M.mode='fadein'}}
    else if(M.mode==='fadein'){goalOp=1;if(M.op>.97){M.mode='idle';M.until=now+rnd(800,1500)}}
    if(busy)goalOp=Math.min(goalOp,.12);
    M.op+=(goalOp-M.op)*Math.min(1,dt*(goalOp<M.op?7:2.2));
    pose(P);
    /* particles */
    for(var i=parts.length-1;i>=0;i--){var p=parts[i];p.life+=dt;p.vy+=40*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.g.setAttribute('cx',p.x);p.g.setAttribute('cy',p.y);p.g.setAttribute('opacity',Math.max(0,1-p.life/.9));if(p.life>.9){el.fx.removeChild(p.g);parts.splice(i,1)}}
    var sc=I.sc;flip.style.transform='scaleX('+(M.dir===1?1:-1)+')';
    sa.style.transform='translate('+(M.x-55*sc)+'px,'+M.y+'px) scale('+sc+')';sa.style.opacity=M.op;
    /* speech bubble, above his head, kept inside the banner */
    var showB=now<M.sayUntil&&!busy&&M.op>.5;bub.style.opacity=showB?1:0;
    if(showB){var bw=bub.offsetWidth,bh=bub.offsetHeight,bx=Math.max(2,Math.min(I.W-bw-2,M.x-bw/2)),by=Math.max(2,M.y-bh+2);
      for(var j=0;j<(I.tr||[]).length;j++){var q2=I.tr[j];if(bx<q2.r&&bx+bw>q2.l&&by<q2.b&&by+bh>q2.t){showB=false;break}}
      bub.style.opacity=showB?1:0;bub.style.transform='translate('+bx+'px,'+by+'px)'}
  }
  M.mode='boot';raf=requestAnimationFrame(frame);
  /* "Ho ho ho!" when he first appears */
  setTimeout(function(){if(!dead&&!hid&&I.on)say('Ho ho ho!',1800)},900);
}

/* ---------- find the banner whenever the home page is drawn ---------- */
function scan(){var b=document.querySelector('.hxm.hxb');if(b&&!b.__santa){b.__santa=1;make(b)}}
var t=0,mo=new MutationObserver(function(){clearTimeout(t);t=setTimeout(scan,120)});
function start(){var p=document.getElementById('panel')||document.body;mo.observe(p,{childList:true,subtree:true});scan()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();

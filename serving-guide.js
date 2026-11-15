(function(){
'use strict';
var RANGE={small:[6,7],regular:[4,6],generous:[3,4]};
var DRAW={small:7,regular:6,generous:4};
var STY=[['small','Small'],['regular','Regular'],['generous','Generous']];
var MAXDRAW=28,CUT='#fff4dc';
var st={c:null,kg:1,sty:'regular'},ov=null;

function css(){
  if(document.getElementById('sg-css'))return;
  var s=document.createElement('style');s.id='sg-css';
  s.textContent='.sgt{font:700 18px/1.2 "Bricolage Grotesque",system-ui,sans-serif;color:var(--ink);padding-right:36px}'+
  '.sgs{font-size:12.5px;color:var(--mut);margin:2px 0 10px}'+
  '.sgl{font-size:12px;font-weight:700;color:var(--mut);margin:10px 0 5px}'+
  '.sgrow{display:flex;flex-wrap:wrap;gap:6px}'+
  '.sgp{padding:6px 12px;border:1px solid var(--line);border-radius:999px;background:var(--bg);color:var(--ink);font:600 12.5px/1 inherit;cursor:pointer}'+
  '.sgp.on{background:var(--acc);border-color:var(--acc);color:var(--acc-ink)}'+
  '.sgsum{margin:12px 0 4px;padding:10px 12px;border-radius:12px;background:var(--bg);border:1px solid var(--line);font-size:13px;color:var(--ink)}'+
  '.sgsum b{font-size:18px;color:var(--ok)}.sgsum small{display:block;color:var(--mut);font-size:11.5px;margin-top:2px}'+
  '.sgg{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:8px}'+
  '.sgg figure{margin:0;text-align:center;font-size:12.5px;color:var(--ink)}.sgg svg{width:100%;max-width:170px;height:auto;display:block;margin:0 auto 4px}'+
  '.sgg figcaption b{display:block;font-size:15px;color:var(--ok)}'+
  '.sgn{margin:10px 0 0;font-size:11.5px;line-height:1.45;color:var(--mut)}';
  document.head.appendChild(s);
}
function pt(r,a){return [100+r*Math.cos(a),100+r*Math.sin(a)]}
function ln(p,q){return '<line x1="'+p[0].toFixed(1)+'" y1="'+p[1].toFixed(1)+'" x2="'+q[0].toFixed(1)+'" y2="'+q[1].toFixed(1)+'" stroke="'+CUT+'" stroke-width="2" stroke-linecap="round"/>'}
function roundSvg(n){
  var s='<circle cx="100" cy="100" r="94" style="fill:var(--card);stroke:var(--line)"/><circle cx="100" cy="100" r="80" fill="#5a2e1e"/>',R=80,i;
  if(n<=12){for(i=0;i<n;i++)s+=ln([100,100],pt(R,-Math.PI/2+2*Math.PI*i/n))}
  else{var m=Math.round(n/3),o=n-m,ri=R*Math.sqrt(m/n);
    s+='<circle cx="100" cy="100" r="'+ri.toFixed(1)+'" fill="none" stroke="'+CUT+'" stroke-width="2"/>';
    for(i=0;i<o;i++){var a=-Math.PI/2+2*Math.PI*i/o;s+=ln(pt(ri,a),pt(R,a))}
    for(i=0;i<m;i++)s+=ln([100,100],pt(ri,-Math.PI/2+2*Math.PI*i/m))}
  return s+'<circle cx="100" cy="100" r="80" fill="none" stroke="#3a1b10" stroke-width="2"/>';
}
function squareSvg(n){
  var r=Math.max(1,Math.floor(Math.sqrt(n))),c=Math.ceil(n/r),k,
  s='<rect x="8" y="8" width="184" height="184" rx="10" style="fill:var(--card);stroke:var(--line)"/><rect x="24" y="24" width="152" height="152" rx="4" fill="#5a2e1e" stroke="#3a1b10" stroke-width="2"/>';
  for(k=1;k<c;k++){var x=24+152*k/c;s+=ln([x,24],[x,176])}
  for(k=1;k<r;k++){var y=24+152*k/r;s+=ln([24,y],[176,y])}
  return {svg:s,count:r*c};
}
function weights(c){
  var w=(c.weights||MENU.weights).slice();
  if(w.indexOf(st.kg)<0){w.push(st.kg);w.sort(function(a,b){return a-b})}
  return w;
}
function pills(list,cur,attr){
  return list.map(function(x){return '<button type="button" class="sgp'+(x[0]===cur?' on':'')+'" '+attr+'="'+x[0]+'">'+x[1]+'</button>'}).join('');
}
function render(){
  var c=st.c,f=Math.round(st.kg*2),r=RANGE[st.sty],n=DRAW[st.sty]*f;
  var diag='';
  if(n<=MAXDRAW){
    var q=squareSvg(n);
    diag='<div class="sgg"><figure><svg viewBox="0 0 200 200" role="img" aria-label="Round cake cut into '+n+' slices">'+roundSvg(n)+'</svg><figcaption>Round<b>'+n+' slices</b></figcaption></figure>'+
         '<figure><svg viewBox="0 0 200 200" role="img" aria-label="Square cake cut into '+q.count+' pieces">'+q.svg+'</svg><figcaption>Square<b>'+q.count+' pieces</b></figcaption></figure></div>';
  }
  var note=n<=MAXDRAW?'Cuts shown are a guide. Square pieces are rounded to a neat grid.':'For a cake this big, message us on WhatsApp and we\'ll suggest how to cut it.';
  if(c.custom)note+=' Fondant-decorated cakes are usually cut into smaller slices, so plan a few extra.';
  ov.querySelector('.dwbt').innerHTML=
    '<div class="sgt">Cake Serving Guide</div><div class="sgs">'+esc(c.name)+'</div>'+
    '<div class="sgl">Cake size</div><div class="sgrow">'+pills(weights(c).map(function(w){return [w,kgLabel(w)]}),st.kg,'data-sgk')+'</div>'+
    '<div class="sgl">Slice size</div><div class="sgrow">'+pills(STY,st.sty,'data-sgs')+'</div>'+
    '<div class="sgsum">Serves about <b>'+(r[0]*f)+'–'+(r[1]*f)+' people</b><small>'+st.sty+' slices · '+kgLabel(st.kg)+'</small></div>'+
    diag+'<p class="sgn">'+note+'</p>';
}
function close(){if(ov){ov.classList.remove('on');ov.remove();ov=null;document.removeEventListener('keydown',onKey)}}
function onKey(e){if(e.key==='Escape')close()}
function open(c){
  css();close();
  var s=selOf(c.id),WS=c.weights||MENU.weights;
  st.c=c;st.sty='regular';
  st.kg=s.wi==='o'?s.kg:(s.wi!==null&&WS[s.wi]!=null?WS[s.wi]:(WS.indexOf(1)>=0?1:WS[0]));
  ov=document.createElement('div');ov.className='dwlb on';
  ov.innerHTML='<div class="dwbox" role="dialog" aria-modal="true" aria-label="Cake Serving Guide"><button type="button" class="dwx" data-sgx aria-label="Close">×</button><div class="dwbt"></div></div>';
  document.body.appendChild(ov);
  ov.addEventListener('click',function(e){
    if(e.target===ov||e.target.closest('[data-sgx]')){close();return}
    var k=e.target.closest('[data-sgk]'),y=e.target.closest('[data-sgs]');
    if(k){st.kg=+k.getAttribute('data-sgk');render()}
    else if(y){st.sty=y.getAttribute('data-sgs');render()}
  });
  document.addEventListener('keydown',onKey);
  render();
  var x=ov.querySelector('[data-sgx]');if(x)x.focus();
}
document.addEventListener('click',function(e){
  var b=e.target.closest&&e.target.closest('[data-sg]');if(!b)return;
  var card=b.closest('[data-cake]');if(!card)return;
  e.stopPropagation();e.preventDefault();
  var c=findCake(card.getAttribute('data-cake'));if(c)open(c);
},true);
})();

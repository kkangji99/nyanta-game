// 캐릭터·아이템 그림 (캔버스 벡터 드로잉과 스프라이트 캐시)
/* ---------- sprites ---------- */
function ell(g,x,y,rx,ry){ g.beginPath(); g.ellipse(x,y,rx,ry,0,0,TAU); g.fill(); }
function circ(g,x,y,r){ g.beginPath(); g.arc(x,y,r,0,TAU); g.fill(); }

// 벡터 스프라이트를 오프스크린 캔버스에 한 번만 그려두고 drawImage로 재사용
const SPR = new Map();
function sprite(key,w,h,ox,oy,k,fn){
  let s=SPR.get(key);
  if(!s){
    const c=document.createElement('canvas'); c.width=Math.ceil(w*k); c.height=Math.ceil(h*k);
    const g=c.getContext('2d'); g.scale(k,k); g.translate(ox,oy); fn(g);
    s={c,w,h,ox,oy}; SPR.set(key,s);
  }
  return s;
}
function blit(s,x,y,sc){ ctx.drawImage(s.c,x-s.ox*sc,y-s.oy*sc,s.w*sc,s.h*sc); }
function blitRot(s,x,y,sc,rot){ ctx.save(); ctx.translate(x,y); ctx.rotate(rot); blit(s,0,0,sc); ctx.restore(); }

function drawCat(g,x,y,f,t,moving){
  g.save(); g.translate(x,y);
  g.fillStyle='rgba(40,60,90,.2)'; ell(g,0,16,15,5);
  g.scale(f,1);
  const b = moving ? Math.sin(t*16)*2.2 : 0;
  // tail
  g.strokeStyle='#d9803a'; g.lineWidth=5; g.lineCap='round';
  g.beginPath(); g.moveTo(-10,6); g.quadraticCurveTo(-23,3+Math.sin(t*5)*4,-18,-9+Math.sin(t*5)*3); g.stroke();
  // legs
  g.fillStyle='#d9803a'; ell(g,-6,13+b,4,3.2); ell(g,6,13-b,4,3.2);
  // body
  g.fillStyle='#f0a050'; ell(g,0,4,13,10);
  g.fillStyle='#fff6ea'; ell(g,4,7,6,5);
  // head
  g.fillStyle='#f0a050'; circ(g,4,-8,11);
  g.beginPath(); g.moveTo(-5,-13); g.lineTo(-4,-24); g.lineTo(3,-17); g.fill();
  g.beginPath(); g.moveTo(8,-17); g.lineTo(14,-23); g.lineTo(14,-11); g.fill();
  g.fillStyle='#f7c4b8'; g.beginPath(); g.moveTo(10,-16); g.lineTo(13,-20); g.lineTo(13,-13); g.fill();
  // stripes
  g.strokeStyle='#c96f2c'; g.lineWidth=1.8;
  g.beginPath(); g.moveTo(1,-18); g.lineTo(2,-14); g.moveTo(5,-19); g.lineTo(5,-15); g.stroke();
  g.beginPath(); g.moveTo(-8,0); g.lineTo(-4,1); g.moveTo(-9,5); g.lineTo(-5,5); g.stroke();
  // face
  g.fillStyle='#fff6ea'; ell(g,9,-4,5,3.6);
  g.fillStyle='#1d2433'; ell(g,3,-9,1.6,2.3); ell(g,10,-9,1.6,2.3);
  g.fillStyle='#fff'; circ(g,3.5,-9.8,.6); circ(g,10.5,-9.8,.6);
  g.fillStyle='#e0707c'; circ(g,8,-5.5,1.4);
  g.strokeStyle='rgba(29,36,51,.55)'; g.lineWidth=.8;
  g.beginPath(); g.moveTo(12,-5); g.lineTo(18,-6.5); g.moveTo(12,-4); g.lineTo(18,-3.5); g.stroke();
  // santa hat
  g.fillStyle='#d23a44';
  g.beginPath(); g.moveTo(-6,-15); g.quadraticCurveTo(2,-30,-12,-30); g.quadraticCurveTo(-4,-24,-6,-15); g.fill();
  g.beginPath(); g.moveTo(-6,-15); g.quadraticCurveTo(0,-31,12,-17); g.closePath(); g.fill();
  g.fillStyle='#fff'; g.beginPath(); g.roundRect(-7,-18,20,5,2.5); g.fill();
  circ(g,-12,-29,3.2);
  // scarf
  g.fillStyle='#2d6a4f'; g.beginPath(); g.roundRect(-3,-1,14,4,2); g.fill(); g.fillRect(-2,1,4,7);
  g.restore();
}

function drawSnowman(g,x,y,r,f,flash,wob,kind){
  g.save(); g.translate(x,y);
  g.fillStyle='rgba(40,60,90,.18)'; ell(g,0,r*1.02,r*.85,r*.25);
  g.rotate(Math.sin(wob)*.07);
  if(kind!=='snow'){
    g.strokeStyle='#6b4a2e'; g.lineWidth=Math.max(2,r*.08); g.lineCap='round';
    g.beginPath(); g.moveTo(-r*.6,r*.05); g.lineTo(-r*1.05,-r*.35+Math.sin(wob*2)*r*.1); g.moveTo(r*.6,r*.05); g.lineTo(r*1.05,-r*.35-Math.sin(wob*2)*r*.1); g.stroke();
  }
  g.fillStyle = flash>0 ? '#ffd3d3' : '#fbfdff'; g.strokeStyle='#9db4c9'; g.lineWidth=1.5;
  g.beginPath(); g.arc(0,r*.3,r*.72,0,TAU); g.fill(); g.stroke();
  g.beginPath(); g.arc(0,-r*.5,r*.5,0,TAU); g.fill(); g.stroke();
  g.fillStyle='#1d2433'; circ(g,0,r*.2,r*.07); circ(g,0,r*.45,r*.07);
  g.fillStyle = kind==='big' ? '#2d6a4f' : kind==='boss' ? '#3a6fc4' : '#d23a44';
  g.beginPath(); g.roundRect(-r*.45,-r*.14,r*.9,r*.17,r*.06); g.fill();
  g.fillRect(-f*r*.3-r*.08,-r*.05,r*.16,r*.3);
  const fo=f*r*.1;
  g.fillStyle='#1d2433'; circ(g,fo-r*.15,-r*.58,r*.07); circ(g,fo+r*.15,-r*.58,r*.07);
  g.strokeStyle='#1d2433'; g.lineWidth=Math.max(1.4,r*.06);
  g.beginPath(); g.moveTo(fo-r*.28,-r*.8); g.lineTo(fo-r*.07,-r*.68); g.moveTo(fo+r*.28,-r*.8); g.lineTo(fo+r*.07,-r*.68); g.stroke();
  g.fillStyle='#ee7b30';
  g.beginPath(); g.moveTo(fo,-r*.53); g.lineTo(fo+f*r*.42,-r*.46); g.lineTo(fo,-r*.41); g.fill();
  if(kind==='boss'){
    g.fillStyle='#bfe3ff'; g.strokeStyle='#6aa6d8'; g.lineWidth=2;
    g.beginPath(); g.moveTo(-r*.4,-r*.9); g.lineTo(-r*.42,-r*1.35); g.lineTo(-r*.2,-r*1.1); g.lineTo(0,-r*1.45); g.lineTo(r*.2,-r*1.1); g.lineTo(r*.42,-r*1.35); g.lineTo(r*.4,-r*.9); g.closePath(); g.fill(); g.stroke();
  } else if(kind==='big'){
    g.fillStyle='#1d2433'; g.fillRect(-r*.36,-r*.98,r*.72,r*.1); g.fillRect(-r*.25,-r*1.35,r*.5,r*.4);
  }
  g.restore();
}

function drawMouse(g,x,y,r,f,flash,wob){
  g.save(); g.translate(x,y);
  g.fillStyle='rgba(40,60,90,.18)'; ell(g,0,r*.9,r*1.1,r*.3);
  g.scale(f,1);
  const hop=Math.abs(Math.sin(wob*2))*2;
  g.translate(0,-hop);
  g.strokeStyle='#c98b95'; g.lineWidth=1.6;
  g.beginPath(); g.moveTo(-r*1.1,r*.2); g.quadraticCurveTo(-r*2,-r*.3,-r*1.8,r*.6); g.stroke();
  g.fillStyle = flash>0 ? '#f0c0c0' : '#8c95a6'; ell(g,-r*.1,r*.1,r*1.15,r*.8);
  ell(g,r*.75,-r*.1,r*.6,r*.52);
  circ(g,r*.45,-r*.65,r*.36);
  g.fillStyle='#e7a2ae'; circ(g,r*.45,-r*.65,r*.2);
  g.fillStyle='#1d2433'; circ(g,r*.9,-r*.2,r*.12);
  g.fillStyle='#e0707c'; circ(g,r*1.33,-r*.05,r*.13);
  // stolen santa hat
  g.fillStyle='#d23a44'; g.beginPath(); g.moveTo(r*.35,-r*.6); g.lineTo(r*1.1,-r*.6); g.lineTo(r*.3,-r*1.35); g.fill();
  g.fillStyle='#fff'; circ(g,r*.28,-r*1.35,r*.18); g.fillRect(r*.3,-r*.7,r*.85,r*.18);
  g.restore();
}

function drawFish(g,x,y,s,rot,gold){
  g.save(); g.translate(x,y); g.rotate(rot); g.scale(s,s);
  g.fillStyle = gold ? '#d9a93a' : '#4f7596';
  g.beginPath(); g.moveTo(-12,0); g.quadraticCurveTo(0,-8,13,0); g.quadraticCurveTo(0,8,-12,0); g.fill();
  g.beginPath(); g.moveTo(-10,0); g.lineTo(-17,-6); g.lineTo(-15,0); g.lineTo(-17,6); g.closePath(); g.fill();
  g.fillStyle = gold ? '#fbe7a6' : '#dbe7ef';
  g.beginPath(); g.moveTo(-10,1); g.quadraticCurveTo(0,7.5,12,1); g.quadraticCurveTo(0,3,-10,1); g.fill();
  g.strokeStyle = gold ? '#8a6414' : '#20364b'; g.lineWidth=1.1;
  g.beginPath(); g.moveTo(-7,-3); g.lineTo(-5,-1); g.lineTo(-3,-4); g.lineTo(-1,-1); g.lineTo(1,-4.5); g.lineTo(3,-1.5); g.lineTo(5,-4); g.stroke();
  g.fillStyle='#fff'; circ(g,8,-1,1.9); g.fillStyle='#111'; circ(g,8.3,-1,1);
  g.restore();
}

function drawChuru(g,x,y,s,rot){
  g.save(); g.translate(x,y); g.rotate(rot); g.scale(s,s);
  g.fillStyle='#f39a3d'; g.beginPath(); g.roundRect(-5,-14,10,28,3); g.fill();
  g.fillStyle='#fff'; g.fillRect(-5,-14,10,4);
  g.strokeStyle='#c96f2c'; g.lineWidth=1; g.beginPath(); g.moveTo(-5,-8); g.lineTo(5,-8); g.stroke();
  g.fillStyle='#fff6ea'; g.beginPath(); g.roundRect(-3.5,-4,7,11,2); g.fill();
  g.fillStyle='#d23a44'; circ(g,0,1.5,2);
  g.restore();
}

function drawGift(g,x,y,s){
  g.save(); g.translate(x,y); g.scale(s,s);
  g.fillStyle='rgba(40,60,90,.2)'; ell(g,0,10,12,3.5);
  g.fillStyle='#c9303c'; g.fillRect(-10,-6,20,15);
  g.fillStyle='#e0404c'; g.fillRect(-12,-11,24,6);
  g.fillStyle='#f2c14e'; g.fillRect(-2,-11,4,20); g.fillRect(-10,0,20,3);
  g.strokeStyle='#f2c14e'; g.lineWidth=2.4;
  g.beginPath(); g.ellipse(-4.5,-14,4.5,3,-.4,0,TAU); g.stroke();
  g.beginPath(); g.ellipse(4.5,-14,4.5,3,.4,0,TAU); g.stroke();
  g.restore();
}

function drawSnowball(g,x,y,r){
  g.fillStyle='#ffffff'; circ(g,x,y,r);
  g.strokeStyle='#a9c2d8'; g.lineWidth=1.4; g.beginPath(); g.arc(x,y,r,0,TAU); g.stroke();
  g.fillStyle='#dde9f3'; circ(g,x+r*.3,y+r*.3,r*.35);
}

function drawBell(g,x,y,s){
  g.save(); g.translate(x,y); g.scale(s,s);
  g.fillStyle='#b8862a'; circ(g,0,8,3);
  g.fillStyle='#f2c14e';
  g.beginPath(); g.moveTo(-9,7); g.quadraticCurveTo(-8,-9,0,-9); g.quadraticCurveTo(8,-9,9,7); g.closePath(); g.fill();
  g.fillStyle='#d9a93a'; g.fillRect(-10,5,20,3);
  g.fillStyle='#fff3c4'; ell(g,-3.5,-3,1.8,3.5);
  g.fillStyle='#2d6a4f'; ell(g,-3,-10,3.5,1.8); ell(g,3,-10,3.5,1.8);
  g.fillStyle='#d23a44'; circ(g,0,-10,1.8);
  g.restore();
}

function drawCane(g,x,y,rot,s){
  g.save(); g.translate(x,y); g.rotate(rot); g.scale(s,s);
  g.lineCap='round'; g.lineWidth=5;
  const path=()=>{ g.beginPath(); g.moveTo(0,12); g.lineTo(0,-4); g.arc(-5,-4,5,0,Math.PI,true); };
  g.strokeStyle='#ffffff'; path(); g.stroke();
  g.strokeStyle='#d23a44'; g.setLineDash([3.5,3.5]); path(); g.stroke(); g.setLineDash([]);
  g.restore();
}

function drawTree(g,x,y,s,lights,t){
  g.save(); g.translate(x,y); g.scale(s,s);
  g.fillStyle='rgba(40,60,90,.18)'; ell(g,0,4,22,6);
  g.fillStyle='#6b4a2e'; g.fillRect(-4,-6,8,10);
  const tiers=[[0,-6,24,20],[0,-20,19,18],[0,-33,14,16]];
  for(const [cx,by,hw,h] of tiers){
    g.fillStyle='#23533e'; g.beginPath(); g.moveTo(cx-hw,by); g.lineTo(cx,by-h-6); g.lineTo(cx+hw,by); g.closePath(); g.fill();
    g.fillStyle='#2d6a4f'; g.beginPath(); g.moveTo(cx,by-h-6); g.lineTo(cx+hw,by); g.lineTo(cx+2,by); g.closePath(); g.fill();
    g.fillStyle='#f4f8fb'; g.beginPath(); g.moveTo(cx-hw*.55,by-h*.55); g.lineTo(cx,by-h-6); g.lineTo(cx+hw*.55,by-h*.55); g.quadraticCurveTo(cx,by-h*.35,cx-hw*.55,by-h*.55); g.fill();
  }
  if(lights) drawTreeLights(g,0,0,1,t);
  g.restore();
}
const LIGHT_COLS=['#f2c14e','#d23a44','#8fd0ff','#f2c14e'];
const LIGHT_PTS=[[-14,-10],[10,-12],[-8,-25],[9,-27],[-3,-38],[5,-8]];
function drawTreeLights(g,x,y,s,t){
  g.save(); g.translate(x,y); g.scale(s,s);
  LIGHT_PTS.forEach((p,i)=>{ const on=(Math.sin(t*3+i*1.7)+1)/2;
    g.fillStyle=LIGHT_COLS[i%4]; g.globalAlpha=.55+on*.45; circ(g,p[0],p[1],2.2); });
  g.globalAlpha=1;
  g.fillStyle='#f2c14e'; g.beginPath();
  for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5, rr=i%2?2.4:5.5; g.lineTo(Math.cos(a)*rr,-58+Math.sin(a)*rr);} g.fill();
  g.restore();
}

function drawPaw(g,x,y,s){ g.save(); g.translate(x,y); g.scale(s,s); g.fillStyle='#f0a050';
  ell(g,0,4,7,6); circ(g,-7,-4,3); circ(g,-2.5,-8,3); circ(g,2.5,-8,3); circ(g,7,-4,3);
  g.fillStyle='#f7c4b8'; ell(g,0,4.5,4,3.4); g.restore(); }
function drawFlame(g,x,y,s){ g.save(); g.translate(x,y); g.scale(s,s);
  g.fillStyle='#6b4a2e'; g.fillRect(-11,9,22,4);
  g.fillStyle='#ef6a3a'; g.beginPath(); g.moveTo(0,-14); g.quadraticCurveTo(12,0,8,9); g.lineTo(-8,9); g.quadraticCurveTo(-12,0,0,-14); g.fill();
  g.fillStyle='#f2c14e'; g.beginPath(); g.moveTo(0,-4); g.quadraticCurveTo(6,4,4,9); g.lineTo(-4,9); g.quadraticCurveTo(-6,4,0,-4); g.fill(); g.restore(); }
function drawScarf(g,x,y,s){ g.save(); g.translate(x,y); g.scale(s,s); g.rotate(-.5);
  g.fillStyle='#d23a44'; g.beginPath(); g.roundRect(-14,-5,28,10,4); g.fill(); g.fillRect(4,0,8,16);
  g.fillStyle='#fff'; g.fillRect(-6,-5,3,10); g.fillRect(2,-5,3,10); g.fillRect(4,8,8,3); g.restore(); }
function drawShard(g,x,y,r,rot){ g.save(); g.translate(x,y); g.rotate(rot);
  g.fillStyle='#bfe3ff'; g.strokeStyle='#5d95c8'; g.lineWidth=1.4;
  g.beginPath(); g.moveTo(r*1.6,0); g.lineTo(0,-r*.7); g.lineTo(-r*1.2,0); g.lineTo(0,r*.7); g.closePath(); g.fill(); g.stroke(); g.restore(); }

const ICONS = {
  fish:g=>drawFish(g,24,24,1.25,-.3),
  churu:g=>drawChuru(g,24,24,1.2,.4),
  gift:g=>drawGift(g,24,27,1.25),
  dmg:g=>drawSnowball(g,24,24,13),
  rate:g=>{drawSnowball(g,12,30,5);drawSnowball(g,22,24,7);drawSnowball(g,33,17,9);},
  multi:g=>{drawSnowball(g,15,28,8);drawSnowball(g,33,28,8);drawSnowball(g,24,15,8);},
  pierce:g=>{drawShard(g,26,24,11,-.6);drawSnowball(g,16,30,7);},
  bell:g=>drawBell(g,24,26,1.5),
  cane:g=>drawCane(g,27,25,.5,1.6),
  scarf:g=>drawScarf(g,24,22,1.2),
  boots:g=>drawPaw(g,24,26,1.5),
  magnet:g=>{drawFish(g,20,18,.9,.2);drawFish(g,28,32,.9,-.2,true);},
  stove:g=>drawFlame(g,24,24,1.3),
};
function paintIcon(c,name){ const g=c.getContext('2d'); g.setTransform(c.width/48,0,0,c.height/48,0,0); g.clearRect(0,0,48,48); ICONS[name](g); }
document.querySelectorAll('canvas[data-icon]').forEach(c=>paintIcon(c,c.dataset.icon));

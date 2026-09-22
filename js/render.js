// 화면 그리기: 눈밭·울타리·나무·캐릭터·HUD
/* ---------- rendering ---------- */
function hash(x,y){ let n=Math.imul(x,374761393)+Math.imul(y,668265263)|0; n=Math.imul(n^(n>>>13),1274126177); return ((n^(n>>>16))>>>0)/4294967296; }
const CELL=170;
// 울타리 안에 서 있는 나무 하나(장애물). 칸 좌표를 주면 위치와 크기를, 없으면 null
function treeAt(ix,iy){
  const h=hash(ix,iy); if(h>=.12) return null;
  const h2=hash(ix+99,iy-7), h3=hash(ix-31,iy+53);
  const x=ix*CELL+h2*CELL, y=iy*CELL+h3*CELL;
  if(Math.abs(x)>AW-60||Math.abs(y)>AH-70) return null;
  return {x,y,sc:.9+h2*.6};
}
function drawGround(rt){
  const x0=Math.floor((camX-W/2)/CELL)-1, x1=Math.floor((camX+W/2)/CELL)+1;
  const y0=Math.floor((camY-H/2)/CELL)-1, y1=Math.floor((camY+H/2)/CELL)+2;
  // 같은 색끼리 한 경로로 모아서 fill 호출 수를 줄임
  const drift=new Path2D(), driftTop=new Path2D(), prints=new Path2D(), sparkle=new Path2D();
  for(let iy=y0;iy<=y1;iy++) for(let ix=x0;ix<=x1;ix++){
    const h=hash(ix,iy), h2=hash(ix+99,iy-7), h3=hash(ix-31,iy+53);
    const x=ix*CELL+h2*CELL, y=iy*CELL+h3*CELL;
    if(h>=.16 && h<.3){ const w=.7+h2*.6;
      drift.moveTo(x+38*w,y); drift.ellipse(x,y,38*w,11,0,0,TAU);
      driftTop.moveTo(x-4+30*w,y-3); driftTop.ellipse(x-4,y-3,30*w,8,0,0,TAU); }
    else if(h>=.3 && h<.55){ for(let k=0;k<4;k++){ const px=x+k*14, py=y+(k%2)*8; prints.moveTo(px+2.2,py); prints.arc(px,py,2.2,0,TAU); } }
    const sx=ix*CELL+h3*CELL, sy=iy*CELL+h*CELL; sparkle.moveTo(sx+1.4,sy); sparkle.arc(sx,sy,1.4,0,TAU);
  }
  ctx.fillStyle='#d3dfeb'; ctx.fill(drift);
  ctx.fillStyle='#f4f8fb'; ctx.fill(driftTop);
  ctx.fillStyle='#cfdbe7'; ctx.fill(prints);
  ctx.fillStyle='rgba(255,255,255,.9)'; ctx.fill(sparkle);
  // 울타리 밖은 깊은 숲 그늘
  ctx.fillStyle='rgba(60,85,120,.28)'; ctx.beginPath();
  ctx.rect(camX-W,camY-H,W*2,H*2); ctx.rect(-AW,-AH,AW*2,AH*2); ctx.fill('evenodd');
}
function drawFence(){
  const post=(x,y)=>{ ctx.fillStyle='#7a5536'; ctx.fillRect(x-3,y-18,6,22); ctx.fillStyle='#f4f8fb'; ctx.fillRect(x-4,y-21,8,4); };
  ctx.strokeStyle='#8c6440'; ctx.lineWidth=3; ctx.beginPath();
  for(const oy of [-12,-5]){ ctx.moveTo(-AW,-AH+oy); ctx.lineTo(AW,-AH+oy); ctx.moveTo(-AW,AH+oy); ctx.lineTo(AW,AH+oy); }
  ctx.moveTo(-AW,-AH); ctx.lineTo(-AW,AH); ctx.moveTo(AW,-AH); ctx.lineTo(AW,AH);
  ctx.stroke();
  // 화면에 보이는 기둥만 그림
  const vx0=camX-W/2-10, vx1=camX+W/2+10, vy0=camY-H/2-10, vy1=camY+H/2+30;
  const topV=-AH>vy0&&-AH<vy1, botV=AH>vy0&&AH<vy1, lefV=-AW>vx0&&-AW<vx1, rigV=AW>vx0&&AW<vx1;
  for(let x=-AW;x<=AW;x+=48){ if(x<vx0||x>vx1) continue; if(topV) post(x,-AH); if(botV) post(x,AH); }
  for(let y=-AH+48;y<AH;y+=48){ if(y<vy0||y>vy1) continue; if(lefV) post(-AW,y); if(rigV) post(AW,y); }
}
function drawTrees(rt,before){
  const x0=Math.floor((camX-W/2)/CELL)-1, x1=Math.floor((camX+W/2)/CELL)+1;
  const y0=Math.floor((camY-H/2)/CELL)-1, y1=Math.floor((camY+H/2)/CELL)+2;
  for(let iy=y0;iy<=y1;iy++) for(let ix=x0;ix<=x1;ix++){
    const h=hash(ix,iy), h2=hash(ix+99,iy-7), h3=hash(ix-31,iy+53);
    const x=ix*CELL+h2*CELL, y=iy*CELL+h3*CELL;
    const inside=Math.abs(x)<AW+30&&Math.abs(y)<AH+70;
    const t=inside?treeAt(ix,iy):(h<.7?{sc:.9+h2*.6}:null);
    if(!t) continue;
    if((y<P.y)!==before) continue;
    const sc=t.sc;
    blit(sprite('tree',52,68,26,58,3,g=>drawTree(g,0,0,1,false,0)),x,y,sc);
    if(h<.05) drawTreeLights(ctx,x,y,sc,rt);
  }
}

const flakes=Array.from({length:110},()=>({x:Math.random(),y:Math.random(),r:.8+Math.random()*2.4,s:20+Math.random()*50,ph:Math.random()*6}));
let lastRT=0;
const partGroups=new Map();   // 입자를 색·투명도별로 묶는 그릇 (매 프레임 재사용)
function render(rt){
  const rdt=Math.min(.05,rt-lastRT); lastRT=rt;
  ctx.setTransform(DPR,0,0,DPR,0,0);
  let sx=0, sy=0;
  if(shake>0){ if(!RM){ sx=(Math.random()-.5)*shake; sy=(Math.random()-.5)*shake; } shake=Math.max(0,shake-rdt*40); }
  if(flags.wrath && state==='play' && !RM){ sx+=(Math.random()-.5)*3.2; sy+=(Math.random()-.5)*3.2; }   // 분노 중 땅이 계속 떨림
  ctx.fillStyle='#e4ecf4'; ctx.fillRect(0,0,W,H);
  const mg=70;
  camX = W/2-mg>=AW ? 0 : clamp(P.x,-AW-mg+W/2,AW+mg-W/2);
  camY = H/2-mg>=AH ? 0 : clamp(P.y,-AH-mg+H/2,AH+mg-H/2);
  // 반올림하지 않음: 카메라만 정수로 맞추면 소수 좌표의 냥타가 1px씩 떨려 보임
  const hq=hug>=0?hugPose(hug).q:0;   // 집사가 화면을 꼭 안으면 게임 화면이 가로로 살짝 눌림
  ctx.save(); ctx.translate(W/2,H/2); if(hq>0) ctx.scale(1-.035*hq,1+.012*hq); ctx.translate(-camX+sx,-camY+sy);
  drawGround(rt);
  drawFence();
  drawTrees(rt,true);
  for(const b of bolts) if(b.t>=0 && b.t<BOLT_WARN) drawBoltWarn(b,rt);   // 바닥의 경고 원
  const fishN=sprite('fish',32,18,17,9,3,g=>drawFish(g,0,0,1,0,false)), fishG=sprite('fishG',32,18,17,9,3,g=>drawFish(g,0,0,1,0,true));
  const gx0=camX-W/2-20, gx1=camX+W/2+20, gy0=camY-H/2-20, gy1=camY+H/2+20;
  for(const g of gems){ if(g.x<gx0||g.x>gx1||g.y<gy0||g.y>gy1) continue;
    const gold=g.v>=5; blitRot(gold?fishG:fishN,g.x,g.y+Math.sin(rt*3+g.ph)*2,gold?1.15:.8,Math.sin(rt*2+g.ph)*.3); }
  for(const it of items){ if(it.kind==='churu') drawChuru(ctx,it.x,it.y+Math.sin(rt*3+it.ph)*2,.9,.4); else drawGift(ctx,it.x,it.y+Math.sin(rt*4)*1.5,1.1); }
  // y-sorted actors
  const actors=E.slice(); actors.push(P); actors.sort((a,b)=>a.y-b.y);
  for(const a of actors){
    if(a===P){
      if(P.inv>0 && fever<=0 && Math.floor(rt*20)%2 && state==='play') continue;
      if(fever>0){   // 집사 찬스 오라
        const pulse=1+Math.sin(rt*10)*.08, a=Math.min(1,fever)*.55;
        ctx.fillStyle=`rgba(242,193,78,${a*.35})`; circ(ctx,P.x,P.y-4,34*pulse);
        ctx.strokeStyle=`rgba(242,193,78,${a})`; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(P.x,P.y-4,30*pulse,0,TAU); ctx.stroke();
      }
      drawCat(ctx,P.x,P.y,P.face,rt,P.moving);
    } else {
      if(a.x<gx0-60||a.x>gx1+60||a.y<gy0-60||a.y>gy1+80) continue;
      const r=a.r, fl=a.flash>0?1:0;
      if(a.type==='mouse'){
        blit(sprite(`m${r}${a.face}${fl}`,4.2*r,3*r,2.1*r,1.7*r,2,g=>drawMouse(g,0,0,r,a.face,fl,0)),a.x,a.y-Math.abs(Math.sin(a.wob*2))*2,1);
      } else {
        blitRot(sprite(`s${a.type}${r}${a.face}${fl}`,2.3*r+4,2.85*r+4,1.15*r+2,1.52*r+2,2,g=>drawSnowman(g,0,0,r,a.face,fl,0,a.type)),a.x,a.y,1,Math.sin(a.wob)*.07);
      }
    }
    if(a.type==='boss'){ ctx.fillStyle='rgba(15,24,48,.8)'; ctx.fillRect(a.x-40,a.y-a.r*1.75,80,7); ctx.fillStyle='#8fd0ff'; ctx.fillRect(a.x-39,a.y-a.r*1.75+1,78*Math.max(0,a.hp/a.max),5); }
  }
  drawTrees(rt,false);
  for(let i=0;i<S.bells;i++){ const a=T*3.2+i*TAU/S.bells; drawBell(ctx,P.x+Math.cos(a)*74,P.y+Math.sin(a)*74,1); }
  for(const c of canes) drawCane(ctx,c.x,c.y,c.rot,1.2);
  const ball = fever>0
    ? sprite('ballG',20,20,10,10,2,g=>{ g.fillStyle='rgba(242,193,78,.55)'; circ(g,0,0,9); drawSnowball(g,0,0,6); })
    : sprite('ball',16,16,8,8,2,g=>drawSnowball(g,0,0,6));
  for(const s of shots) blit(ball,s.x,s.y,1);
  for(const f of foes) drawShard(ctx,f.x,f.y,f.r,Math.atan2(f.vy,f.vx));
  for(const b of bolts) if(b.t>=BOLT_WARN) drawBoltStrike(b);          // 하늘에서 내리꽂히는 눈벼락
  // 입자: 화면 밖은 그리지 않고, 색·투명도 단계별로 한 경로에 모아 fill 호출을 줄임
  partGroups.clear();
  for(const p of parts){
    p.x+=p.vx*rdt; p.y+=p.vy*rdt; p.vx*=.93; p.vy*=.93; p.life-=rdt;
    if(p.life<=0 || p.x<gx0||p.x>gx1||p.y<gy0||p.y>gy1) continue;
    const a=Math.max(.25,Math.min(1,p.life*2)), key=p.col+'|'+(Math.round(a*4)/4);
    let path=partGroups.get(key); if(!path){ path=new Path2D(); partGroups.set(key,path); }
    path.moveTo(p.x+p.r,p.y); path.arc(p.x,p.y,p.r,0,TAU);
  }
  for(const [key,path] of partGroups){ const i=key.lastIndexOf('|'); ctx.globalAlpha=+key.slice(i+1); ctx.fillStyle=key.slice(0,i); ctx.fill(path); }
  ctx.globalAlpha=1; sweep(parts,p=>p.life>0);
  ctx.font='14px Jua, "Malgun Gothic", sans-serif'; ctx.textAlign='center';
  for(const t of texts){ t.y-=28*rdt; t.life-=rdt;
    if(t.life<=0 || t.x<gx0||t.x>gx1||t.y<gy0||t.y>gy1) continue;   // 화면 밖 피해 숫자는 건너뜀
    ctx.globalAlpha=Math.max(0,Math.min(1,t.life*2)); ctx.fillStyle=t.col; ctx.fillText(t.txt,t.x,t.y); }
  ctx.globalAlpha=1; sweep(texts,t=>t.life>0);
  ctx.restore();

  // night sky that warms toward Christmas morning
  // 그라디언트는 화면 크기나 새벽 단계(1초 단위)가 바뀔 때만 새로 만듦
  const dawnStep=Math.min(GAME_LEN,Math.floor(T)), key=W+'x'+H+':'+dawnStep;
  if(key!==vgKey){
    const dawn=dawnStep/GAME_LEN;
    vgGrad=ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*.28,W/2,H/2,Math.hypot(W,H)*.6);
    vgGrad.addColorStop(0,'rgba(15,24,48,0)');
    vgGrad.addColorStop(1,`rgba(${15+dawn*120|0},${24+dawn*60|0},${48+dawn*30|0},${.62-dawn*.3})`);
    vgKey=key;
  }
  ctx.fillStyle=vgGrad; ctx.fillRect(0,0,W,H);
  if(flags.wrath){ ctx.fillStyle='rgba(18,28,70,.2)'; ctx.fillRect(0,0,W,H); }   // 분노 중 먹구름 낀 하늘
  if(flash>0){ ctx.fillStyle=`rgba(225,238,255,${Math.min(.45,flash*1.4)})`; ctx.fillRect(0,0,W,H); flash=Math.max(0,flash-rdt*1.6); }
  if(fever>0){   // 집사 찬스 중 화면 가장자리를 따뜻한 금빛으로
    const a=Math.min(1,fever)*(.28+Math.sin(rt*6)*.06);
    ctx.strokeStyle=`rgba(242,193,78,${a+hq*.25})`; ctx.lineWidth=18+hq*14; ctx.strokeRect(0,0,W,H);
  }
  // [보류] 집사가 화면을 액자처럼 끌어안는 팔 (gameplay.js의 hug=0 주석과 함께 해제)
  // if(hug>=0){ drawHugHand(0); drawHugHand(1); }

  // snowfall (한 경로로 모아 한 번에 fill)
  ctx.fillStyle='rgba(255,255,255,.9)'; ctx.beginPath();
  const storm=flags.wrath?1:0;   // 분노 중에는 눈보라가 빠르고 비스듬히
  for(const f of flakes){ if(!RM){ f.y+=f.s*(1+storm*1.8)*rdt/H; f.x+=(Math.sin(rt+f.ph)*8+storm*f.s*.9)*rdt/W; }
    if(f.y>1.02){ f.y=-.02; f.x=Math.random(); } if(f.x<0) f.x+=1; if(f.x>1) f.x-=1;
    const x=f.x*W, y=f.y*H; ctx.moveTo(x+f.r,y); ctx.arc(x,y,f.r,0,TAU); }
  ctx.fill();

  if(joy && state==='play'){ const dx=joy.x-joy.ox, dy=joy.y-joy.oy, l=Math.hypot(dx,dy), m=Math.min(l,JOY_R)/(l||1);
    ctx.fillStyle='rgba(15,24,48,.18)'; circ(ctx,joy.ox,joy.oy,JOY_R);
    ctx.fillStyle='rgba(15,24,48,.45)'; circ(ctx,joy.ox+dx*m,joy.oy+dy*m,20); }

  // HUD
  if(!hudEl.hud.hidden){
    setHud('hpFill','w',(P.hp/P.max*100).toFixed(1)+'%'); setHud('hpTxt','t',Math.ceil(P.hp));
    setHud('xpFill','w',Math.min(100,P.xp/P.next*100).toFixed(1)+'%');
    setHud('clock','t',fmt(GAME_LEN-T).padStart(5,'0')); setHud('lv','t',P.level); setHud('kills','t',kills);
    setHud('wrath','c',!!flags.wrath && state==='play');
    setHud('fever','h',fever<=0||state==='over'||state==='win'); setHud('feverSec','t',Math.ceil(fever));
    setHud('feverFill','w',(fever/FEVER_LEN*100).toFixed(1)+'%');
  }
}
// 안아주기 타임라인: 들어오기(0~0.45s) → 꼭꼭 두 번(~1.05s) → 빠져나가기(~HUG_LEN)
// d: 냥타 중심에서 각 손바닥까지 거리, q: 꽉 안는 정도(0~1)
// p: 팔이 곡선을 따라 뻗어 나온 정도(0~1), q: 꽉 안는 정도(0~1)
const HUG_IN=.5, HUG_HOLD=1.1;
function hugPose(t){
  if(t<HUG_IN){ const k=t/HUG_IN; return {p:1-Math.pow(1-k,3),q:0}; }
  if(t<HUG_HOLD) return {p:1,q:Math.abs(Math.sin((t-HUG_IN)/(HUG_HOLD-HUG_IN)*Math.PI*2))};
  const k=(t-HUG_HOLD)/(HUG_LEN-HUG_HOLD); return {p:1-k*k,q:0};
}
// 3차 베지어 구간들을 점으로 샘플링 (팔을 곡선 길이만큼 부분적으로 그리기 위해)
function bezierPath(segs,steps){
  const pts=[[segs[0][0],segs[0][1]]];
  for(const [x0,y0,x1,y1,x2,y2,x3,y3] of segs) for(let i=1;i<=steps;i++){ const t=i/steps, u=1-t;
    pts.push([u*u*u*x0+3*u*u*t*x1+3*u*t*t*x2+t*t*t*x3, u*u*u*y0+3*u*u*t*y1+3*u*t*t*y2+t*t*t*y3]); }
  return pts;
}
// 화면 좌표에 그림. side 0 = 왼팔, 1 = 오른팔(왼팔을 좌우 반전).
// 화면 위 가운데(집사 어깨)에서 나와 윗변을 따라 모서리를 돌아 옆변으로 타고 내려오는 액자 같은 팔
function drawHugHand(side){
  const {p,q}=hugPose(hug); if(p<=0) return;
  const s=clamp(Math.min(W,H)/340,1.3,2.3), aw=26*s;
  const m=aw*.5+2-q*7*s;                 // 팔 중심선이 테두리에서 떨어진 거리 (꼭 안을 때 안쪽으로 조임)
  const cx=W*.2, ey=H*.66;
  const pts=bezierPath([
    [W/2-12*s,-aw, W/2-40*s,m, W*.34,m, cx,m],                       // 어깨에서 윗변으로
    [cx,m, cx-(cx-m)*.62,m, m,m+(H*.24-m)*.38, m,H*.24],             // 둥근 모서리
    [m,H*.24, m,H*.42, m-2*s,ey-H*.08, m+14*s,ey],                   // 옆변을 타고 내려오며 끝이 안쪽으로
  ],22);
  // 누적 길이로 p만큼만 그림
  const len=[0]; for(let i=1;i<pts.length;i++) len.push(len[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));
  const want=len[len.length-1]*p; let n=1; while(n<pts.length-1 && len[n]<want) n++;
  const vis=pts.slice(0,n+1);
  const trace=()=>{ ctx.beginPath(); ctx.moveTo(vis[0][0],vis[0][1]); for(let i=1;i<vis.length;i++) ctx.lineTo(vis[i][0],vis[i][1]); };
  ctx.save();
  if(side){ ctx.translate(W,0); ctx.scale(-1,1); }
  ctx.lineCap='round'; ctx.lineJoin='round';
  ctx.shadowColor='rgba(20,30,60,.25)'; ctx.shadowBlur=10*s; ctx.shadowOffsetY=3*s;
  ctx.strokeStyle='#9c2833'; ctx.lineWidth=aw+3*s; trace(); ctx.stroke();       // 소매 테두리(그림자 포함)
  ctx.shadowColor='transparent';
  ctx.strokeStyle='#c23a45'; ctx.lineWidth=aw; trace(); ctx.stroke();           // 소매
  ctx.strokeStyle='rgba(255,255,255,.16)'; ctx.lineWidth=aw*.35; ctx.save(); ctx.translate(2*s,-2*s); trace(); ctx.stroke(); ctx.restore();   // 둥근 느낌의 하이라이트
  ctx.strokeStyle='#f4f8fb'; ctx.lineWidth=5*s; ctx.setLineDash([.1,14*s]); trace(); ctx.stroke(); ctx.setLineDash([]);   // 니트 무늬
  // 팔 끝의 손: 진행 방향으로 향하고, 소매 끝 시보리는 손 함수가 그림
  const a=vis[vis.length-1], b=vis[Math.max(0,vis.length-3)], ang=Math.atan2(a[1]-b[1],a[0]-b[0]);
  drawButlerHand(ctx,a[0]+Math.cos(ang)*12*s,a[1]+Math.sin(ang)*12*s,ang,-1,14*s,s*.95);
  ctx.restore();
}
// HUD 요소는 한 번만 찾아두고, 값이 바뀐 경우에만 DOM에 씀
const hudEl={}, hudVal={};
['hud','hpFill','hpTxt','xpFill','clock','lv','kills','fever','feverSec','feverFill'].forEach(id=>hudEl[id]=$(id));
function setHud(id,kind,v){
  if(hudVal[id]===v) return; hudVal[id]=v;
  if(kind==='w') hudEl[id].style.width=v; else if(kind==='h') hudEl[id].hidden=v; else if(kind==='c') hudEl.hud.classList.toggle(id,v); else hudEl[id].textContent=v;
}

// 눈벼락 경고 원: 바깥 고리가 BOLT_WARN초 동안 좁혀지고, 떨어지기 직전엔 빨갛게 깜빡임
function drawBoltWarn(b,rt){
  const k=b.t/BOLT_WARN, late=k>.7;
  ctx.fillStyle=late&&Math.floor(rt*14)%2 ? 'rgba(225,70,80,.28)' : `rgba(90,140,230,${.1+k*.18})`;
  ctx.beginPath(); ctx.ellipse(b.x,b.y,BOLT_R,BOLT_R*.55,0,0,TAU); ctx.fill();
  ctx.strokeStyle=late?'rgba(225,70,80,.85)':'rgba(70,120,220,.7)'; ctx.lineWidth=2.5;
  ctx.beginPath(); ctx.ellipse(b.x,b.y,BOLT_R,BOLT_R*.55,0,0,TAU); ctx.stroke();
  const rr=BOLT_R*(1.7-.7*k);
  ctx.strokeStyle=`rgba(255,255,255,${.4+k*.5})`; ctx.lineWidth=2;
  ctx.beginPath(); ctx.ellipse(b.x,b.y,rr,rr*.55,0,0,TAU); ctx.stroke();
}
// 눈벼락: 화면 위에서 착지점까지 지그재그 번개 + 착지 충격파. 매 프레임 모양이 살짝 바뀌어 번쩍이는 느낌
function drawBoltStrike(b){
  const u=(b.t-BOLT_WARN)/.5, a=1-u; if(a<=0) return;
  const top=camY-H/2-40, segs=9;
  const pts=[[b.x+(Math.random()-.5)*40,top]];
  for(let i=1;i<segs;i++){ const y=top+(b.y-top)*i/segs; pts.push([b.x+(Math.random()-.5)*46*(1-i/segs),y]); }
  pts.push([b.x,b.y]);
  const trace=()=>{ ctx.beginPath(); ctx.moveTo(pts[0][0],pts[0][1]); for(const p of pts) ctx.lineTo(p[0],p[1]); };
  ctx.save(); ctx.lineCap='round'; ctx.lineJoin='round';
  ctx.globalAlpha=a; ctx.shadowColor='#8fd0ff'; ctx.shadowBlur=24;
  ctx.strokeStyle='#8fd0ff'; ctx.lineWidth=14*a+4; trace(); ctx.stroke();
  ctx.shadowBlur=0; ctx.strokeStyle='#ffffff'; ctx.lineWidth=5*a+2; trace(); ctx.stroke();
  // 착지 충격파
  const ring=BOLT_R*(.6+u*1.2);
  ctx.globalAlpha=a*.9; ctx.strokeStyle='#ffffff'; ctx.lineWidth=5*a+1;
  ctx.beginPath(); ctx.ellipse(b.x,b.y,ring,ring*.55,0,0,TAU); ctx.stroke();
  ctx.fillStyle='rgba(220,240,255,.8)'; ctx.globalAlpha=a*.7;
  ctx.beginPath(); ctx.ellipse(b.x,b.y,BOLT_R*.7*(1-u*.5),BOLT_R*.38*(1-u*.5),0,0,TAU); ctx.fill();
  ctx.restore();
}

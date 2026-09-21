// 화면 그리기: 눈밭·울타리·나무·캐릭터·HUD
/* ---------- rendering ---------- */
function hash(x,y){ let n=Math.imul(x,374761393)+Math.imul(y,668265263)|0; n=Math.imul(n^(n>>>13),1274126177); return ((n^(n>>>16))>>>0)/4294967296; }
const CELL=170;
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
    if(inside ? (h>=.12||Math.abs(x)>AW-60||Math.abs(y)>AH-70) : h>=.7) continue;
    if((y<P.y)!==before) continue;
    const sc=.9+h2*.6;
    blit(sprite('tree',52,68,26,58,3,g=>drawTree(g,0,0,1,false,0)),x,y,sc);
    if(h<.05) drawTreeLights(ctx,x,y,sc,rt);
  }
}

const flakes=Array.from({length:110},()=>({x:Math.random(),y:Math.random(),r:.8+Math.random()*2.4,s:20+Math.random()*50,ph:Math.random()*6}));
let lastRT=0;
function render(rt){
  const rdt=Math.min(.05,rt-lastRT); lastRT=rt;
  ctx.setTransform(DPR,0,0,DPR,0,0);
  let sx=0, sy=0;
  if(shake>0){ if(!RM){ sx=(Math.random()-.5)*shake; sy=(Math.random()-.5)*shake; } shake=Math.max(0,shake-rdt*40); }
  ctx.fillStyle='#e4ecf4'; ctx.fillRect(0,0,W,H);
  const mg=70;
  camX = W/2-mg>=AW ? 0 : clamp(P.x,-AW-mg+W/2,AW+mg-W/2);
  camY = H/2-mg>=AH ? 0 : clamp(P.y,-AH-mg+H/2,AH+mg-H/2);
  // 반올림하지 않음: 카메라만 정수로 맞추면 소수 좌표의 냥타가 1px씩 떨려 보임
  ctx.save(); ctx.translate(W/2-camX+sx,H/2-camY+sy);
  drawGround(rt);
  drawFence();
  drawTrees(rt,true);
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
  for(const p of parts){ p.x+=p.vx*rdt; p.y+=p.vy*rdt; p.vx*=.93; p.vy*=.93; p.life-=rdt; ctx.globalAlpha=Math.max(0,Math.min(1,p.life*2)); ctx.fillStyle=p.col; circ(ctx,p.x,p.y,p.r); }
  ctx.globalAlpha=1; sweep(parts,p=>p.life>0);
  ctx.font='14px Jua, "Malgun Gothic", sans-serif'; ctx.textAlign='center';
  for(const t of texts){ t.y-=28*rdt; t.life-=rdt; ctx.globalAlpha=Math.max(0,Math.min(1,t.life*2)); ctx.fillStyle=t.col; ctx.fillText(t.txt,t.x,t.y); }
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
  if(fever>0){   // 집사 찬스 중 화면 가장자리를 따뜻한 금빛으로
    const a=Math.min(1,fever)*(.28+Math.sin(rt*6)*.06);
    ctx.strokeStyle=`rgba(242,193,78,${a})`; ctx.lineWidth=18; ctx.strokeRect(0,0,W,H);
  }

  // snowfall (한 경로로 모아 한 번에 fill)
  ctx.fillStyle='rgba(255,255,255,.9)'; ctx.beginPath();
  for(const f of flakes){ if(!RM){ f.y+=f.s*rdt/H; f.x+=Math.sin(rt+f.ph)*8*rdt/W; }
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
    setHud('fever','h',fever<=0||state==='over'||state==='win'); setHud('feverSec','t',Math.ceil(fever));
    setHud('feverFill','w',(fever/FEVER_LEN*100).toFixed(1)+'%');
  }
}
// HUD 요소는 한 번만 찾아두고, 값이 바뀐 경우에만 DOM에 씀
const hudEl={}, hudVal={};
['hud','hpFill','hpTxt','xpFill','clock','lv','kills','fever','feverSec','feverFill'].forEach(id=>hudEl[id]=$(id));
function setHud(id,kind,v){
  if(hudVal[id]===v) return; hudVal[id]=v;
  if(kind==='w') hudEl[id].style.width=v; else if(kind==='h') hudEl[id].hidden=v; else hudEl[id].textContent=v;
}

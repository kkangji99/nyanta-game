// 게임 진행: 적 생성, 공격, 충돌, 아이템 획득
/* ---------- gameplay ---------- */
function spawnEnemy(type,ang,dist){
  const d=TYPES[type];
  let x=0, y=0;
  if(ang!==undefined){ x=clamp(P.x+Math.cos(ang)*dist,-AW+d.r,AW-d.r); y=clamp(P.y+Math.sin(ang)*dist,-AH+d.r,AH-d.r); }
  else {
    for(let k=0;k<8;k++){ // 울타리 가장자리에서, 냥타와 떨어진 곳에 등장
      const side=Math.floor(Math.random()*4), u=Math.random()*2-1;
      if(side<2){ x=u*(AW-d.r); y=side===0?-AH+d.r:AH-d.r; }
      else { x=side===2?-AW+d.r:AW-d.r; y=u*(AH-d.r); }
      if(Math.hypot(x-P.x,y-P.y)>380) break;
    }
  }
  const m = type==='boss' ? 1+T/200 : 1+T/70;
  E.push({type,x,y,hp:d.hp*m,max:d.hp*m,sp:d.sp*(.9+Math.random()*.2),r:d.r,dmg:d.dmg,xp:d.xp,kx:0,ky:0,flash:0,bcd:0,face:1,shotT:2.5,wob:Math.random()*6});
}
function pickType(){
  const r=Math.random();
  if(T>80 && r<.12+Math.min(.13,T/2000)) return 'big';
  if(T>25 && r<.45) return 'mouse';
  return 'snow';
}
function nearest(max){ let b=null, bd=max*max; for(const e of E){ const d=(e.x-P.x)**2+(e.y-P.y)**2; if(d<bd){bd=d;b=e;} } return b; }
function burst(x,y,n,cols,sp){ if(parts.length>500) return; for(let i=0;i<n;i++){ const a=Math.random()*TAU, v=(.3+Math.random())*sp; parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:.5+Math.random()*.4,r:1.5+Math.random()*2.5,col:cols[i%cols.length]}); } }
function popText(x,y,txt,col){ if(texts.length>80) texts.shift(); texts.push({x,y,txt,col,life:.7}); }
function damage(e,d,vx,vy){
  if(e.dead) return;
  e.hp-=d; e.flash=.1;
  if(e.type!=='boss'){ const l=Math.hypot(vx,vy)||1; const k=e.type==='big'?70:170; e.kx+=vx/l*k; e.ky+=vy/l*k; }
  popText(e.x,e.y-e.r,Math.round(d),'#1d2433');
  if(e.hp<=0){
    e.dead=true; kills++;
    burst(e.x,e.y,e.type==='boss'?40:8,['#ffffff','#cfe2f1','#9db4c9'],e.type==='boss'?260:140);
    gems.push({x:e.x,y:e.y,v:e.xp,ph:Math.random()*6});
    if(gems.length>320){ const g=gems.shift(); gems[0].v+=g.v; }
    if(Math.random()<.012) items.push({kind:'churu',x:e.x+8,y:e.y,ph:Math.random()*6});
    if((e.type==='big'&&Math.random()<.07)) items.push({kind:'gift',x:e.x-8,y:e.y,ph:0});
    if(e.type==='boss'){ items.push({kind:'gift',x:e.x-20,y:e.y,ph:0},{kind:'gift',x:e.x+20,y:e.y,ph:0},{kind:'churu',x:e.x,y:e.y+24,ph:0}); banner('눈보라 대왕을 물리쳤다!'); }
  }
}
function hurt(d){
  if(fever>0) return;   // 집사 찬스 중에는 무적
  P.hp-=d; P.inv=.6; shake=9; popText(P.x,P.y-30,'-'+d,'#d23a44');
  burst(P.x,P.y,6,['#f0a050','#ffffff'],120);
  if(P.hp<=0){ P.hp=0; end(false); }
}

function update(dt){
  T+=dt;
  if(T>=GAME_LEN){ end(true); return; }
  // move
  let mx=0,my=0;
  if(keys.left) mx--; if(keys.right) mx++;
  if(keys.up) my--; if(keys.down) my++;
  if(joy){ const dx=joy.x-joy.ox, dy=joy.y-joy.oy, l=Math.hypot(dx,dy); if(l>6){ const m=Math.min(1,l/JOY_R); mx=dx/l*m; my=dy/l*m; } }
  const ml=Math.hypot(mx,my); if(ml>1){ mx/=ml; my/=ml; }
  // 목표 속도로 부드럽게 가속·감속 (프레임레이트와 무관한 지수 보간)
  const sp=S.speed*(fever>0?1.3:1), acc=1-Math.exp(-dt*(ml>.05?40:28));
  const tx=mx*sp, ty=my*sp;
  // 반대 방향으로 꺾으면 그 축의 기존 속도를 바로 버려서 방향 전환이 즉각적임
  if(tx*P.vx<0) P.vx=0; if(ty*P.vy<0) P.vy=0;
  P.vx+=(tx-P.vx)*acc; P.vy+=(ty-P.vy)*acc;
  const nx=clamp(P.x+P.vx*dt,-AW+P.r,AW-P.r), ny=clamp(P.y+P.vy*dt,-AH+P.r,AH-P.r);
  if(nx!==P.x+P.vx*dt) P.vx=0; if(ny!==P.y+P.vy*dt) P.vy=0;   // 울타리에 닿으면 그 방향 속도 제거
  P.x=nx; P.y=ny; P.moving=Math.hypot(P.vx,P.vy)>20;
  if(Math.abs(mx)>.1) P.face=mx>0?1:-1;
  if(P.inv>0) P.inv-=dt;
  if(S.regen) P.hp=Math.min(P.max,P.hp+S.regen*dt);

  // 집사 찬스: FEVER_EVERY초마다 FEVER_LEN초 동안 무적·연사·이동속도 증가
  if(fever>0) fever=Math.max(0,fever-dt);
  if(Math.floor(T/FEVER_EVERY)>feverN && T<GAME_LEN-3){
    feverN++; fever=FEVER_LEN; fireT=0;
    P.hp=Math.min(P.max,P.hp+20); popText(P.x,P.y-34,'+20','#2d6a4f');
    burst(P.x,P.y,30,['#f2c14e','#fff3c4','#ffffff'],260);
    banner(`집사 찬스! ${FEVER_LEN}초간 무적 · 연사`);
  }

  // spawns & events
  spawnT-=dt;
  if(spawnT<=0){ const n=1+Math.floor(T/75); for(let i=0;i<n&&E.length<MAX_E;i++) spawnEnemy(pickType()); spawnT=Math.max(.14,.95-T*.0028); }
  for(const bt of [150,270]) if(T>=bt && !flags['b'+bt]){ flags['b'+bt]=1; spawnEnemy('boss'); banner('눈보라 대왕 등장!'); }
  for(const st of [100,200,240]) if(T>=st && !flags['s'+st]){ flags['s'+st]=1; const n=Math.max(0,Math.min(24,MAX_E+20-E.length)); for(let i=0;i<n;i++) spawnEnemy('mouse',i/n*TAU,360); banner('선물 도둑 쥐떼가 포위했다!'); }

  // weapons
  fireT-=dt;
  if(fireT<=0){
    const tg=nearest(540);
    if(tg){ const a=Math.atan2(tg.y-P.y,tg.x-P.x);
      for(let i=0;i<S.count;i++){ const o=(i-(S.count-1)/2)*.16; shots.push({x:P.x,y:P.y-6,vx:Math.cos(a+o)*430,vy:Math.sin(a+o)*430,life:1.3,pierce:S.pierce,hit:new Set()}); }
      fireT=S.cd*(fever>0?.33:1);
    } else fireT=.1;
  }
  if(S.canes){ caneT-=dt; if(caneT<=0){ caneT=2.2; const a0=Math.random()*TAU;
    for(let i=0;i<S.canes;i++){ const a=a0+i*TAU/S.canes; canes.push({x:P.x,y:P.y,vx:Math.cos(a)*430,vy:Math.sin(a)*430,life:0,rot:0,back:false,hit:new Set()}); } } }

  for(const s of shots){ s.x+=s.vx*dt; s.y+=s.vy*dt; s.life-=dt; }
  for(const c of canes){
    c.life+=dt; c.rot+=dt*15;
    if(c.life>.42){
      if(!c.back){ c.back=true; c.hit.clear(); }
      const dx=P.x-c.x, dy=P.y-c.y, l=Math.hypot(dx,dy)||1;
      c.vx+=dx/l*1500*dt; c.vy+=dy/l*1500*dt;
      const sp=Math.hypot(c.vx,c.vy); if(sp>540){ c.vx*=540/sp; c.vy*=540/sp; }
      if(l<22||c.life>3) c.dead=true;
    }
    c.x+=c.vx*dt; c.y+=c.vy*dt;
  }

  // enemies
  const damp=Math.max(0,1-9*dt);
  for(const e of E){
    const dx=P.x-e.x, dy=P.y-e.y, l=Math.hypot(dx,dy)||1;
    e.x+=(dx/l*e.sp+e.kx)*dt; e.y+=(dy/l*e.sp+e.ky)*dt; e.kx*=damp; e.ky*=damp;
    e.face=dx>0?1:-1; e.wob+=dt*(e.type==='mouse'?9:4);
    if(e.flash>0) e.flash-=dt; if(e.bcd>0) e.bcd-=dt;
    e.x=clamp(e.x,-AW+e.r,AW-e.r); e.y=clamp(e.y,-AH+e.r,AH-e.r);
    if(l<e.r+P.r-4 && P.inv<=0 && state==='play') hurt(e.dmg);
    if(e.type==='boss'){ e.shotT-=dt; if(e.shotT<=0){ e.shotT=2.3; const a0=Math.random()*TAU;
      for(let k=0;k<12;k++){ const a=a0+k*TAU/12; foes.push({x:e.x,y:e.y,vx:Math.cos(a)*165,vy:Math.sin(a)*165,life:4,r:7}); } } }
  }
  if(state!=='play') return;
  // separation
  for(let i=0;i<E.length;i++){ const a=E[i];
    for(let j=i+1;j<E.length;j++){ const b=E[j], dx=b.x-a.x, dy=b.y-a.y, rr=a.r+b.r;
      if(dx>rr||dx<-rr||dy>rr||dy<-rr) continue;
      const d=Math.hypot(dx,dy)||.01; if(d<rr){ const p=(rr-d)/2/d, wa=a.type==='boss'?.1:1, wb=b.type==='boss'?.1:1; a.x-=dx*p*wa; a.y-=dy*p*wa; b.x+=dx*p*wb; b.y+=dy*p*wb; } } }

  // hits
  for(const s of shots){ if(s.life<=0) continue;
    for(const e of E){ if(e.dead||s.hit.has(e)) continue;
      const dx=e.x-s.x, dy=e.y-s.y; if(dx*dx+dy*dy<(e.r+6)**2){ damage(e,S.dmg*(fever>0?1.5:1),s.vx,s.vy); s.hit.add(e); burst(s.x,s.y,3,['#ffffff','#cfe2f1'],80); if(s.pierce--<=0){ s.life=0; break; } } } }
  const caneDmg=14+S.dmg*.7;
  for(const c of canes){ for(const e of E){ if(e.dead||c.hit.has(e)) continue;
    const dx=e.x-c.x, dy=e.y-c.y; if(dx*dx+dy*dy<(e.r+12)**2){ damage(e,caneDmg,c.vx,c.vy); c.hit.add(e); } } }
  if(S.bells){ const bd=5+S.dmg*.45+S.bells*1.5;
    for(let i=0;i<S.bells;i++){ const a=T*3.2+i*TAU/S.bells, bx=P.x+Math.cos(a)*74, by=P.y+Math.sin(a)*74;
      for(const e of E){ if(e.dead||e.bcd>0) continue; const dx=e.x-bx, dy=e.y-by;
        if(dx*dx+dy*dy<(e.r+12)**2){ damage(e,bd,dx,dy); e.bcd=.35; } } } }
  for(const f of foes){ f.x+=f.vx*dt; f.y+=f.vy*dt; f.life-=dt;
    if(P.inv<=0 && (f.x-P.x)**2+(f.y-P.y)**2<(f.r+P.r)**2){ f.life=0; hurt(10); if(state!=='play') return; } }

  // pickups
  for(const g of gems){ const dx=P.x-g.x, dy=P.y-g.y, l=Math.hypot(dx,dy)||1;
    if(l<S.magnet||g.pull||(fever>0&&l<600)){ g.pull=true; const v=260+Math.max(0,420-l); g.x+=dx/l*v*dt; g.y+=dy/l*v*dt; }
    if(l<P.r+8){ g.dead=true; P.xp+=g.v; fishGot+=g.v; } }
  for(const it of items){ const dx=P.x-it.x, dy=P.y-it.y, l=Math.hypot(dx,dy)||1;
    if(l<60){ it.x+=dx/l*220*dt; it.y+=dy/l*220*dt; }
    if(l<P.r+12){ it.dead=true;
      if(it.kind==='churu'){ const h=Math.min(30,P.max-P.hp); P.hp+=h; popText(P.x,P.y-34,'+'+Math.round(h),'#2d6a4f'); burst(P.x,P.y,8,['#f39a3d','#fff6ea'],110); }
      else { pendingGift++; burst(it.x,it.y,14,['#d23a44','#f2c14e','#ffffff'],170); } } }

  sweep(shots,s=>s.life>0); sweep(canes,c=>!c.dead); sweep(E,e=>!e.dead);
  sweep(gems,g=>!g.dead); sweep(items,i=>!i.dead); sweep(foes,f=>f.life>0);

  while(P.xp>=P.next){ P.xp-=P.next; P.level++; P.next=Math.floor(6+P.level*3.2+P.level*P.level*.25); pending++; }
  if(pending>0||pendingGift>0){ burst(P.x,P.y,16,['#f2c14e','#ffffff'],180); openChoice(); }
}

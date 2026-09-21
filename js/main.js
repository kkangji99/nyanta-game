// 게임 루프
let last=performance.now();
function frame(now){
  const dt=Math.min(.05,(now-last)/1000); last=now;
  if(state==='play') update(dt);
  else if(state==='title'){ const nx=Math.sin(now/5000)*260; P.face=nx>=P.x?1:-1; P.x=nx; P.moving=true; }
  // 레벨업·일시정지·결과 화면에서는 게임 화면이 멈춰 있으므로 다시 그리지 않음
  if(state==='play'||state==='title'||redraw){ render(now/1000); redraw=false; }
  else lastRT=now/1000;
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// 키보드·터치 입력
/* ---------- input ---------- */
// 한글 입력 상태에서도 동작하도록 e.key 대신 물리 키 위치(e.code)로 방향을 읽음
const KEY_DIR={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down'};
const keys={left:false,right:false,up:false,down:false};
addEventListener('keydown',e=>{
  const dir=KEY_DIR[e.code];
  if(dir){ keys[dir]=true; if(state==='play') e.preventDefault(); }
  if(e.code==='Space' && state==='play') e.preventDefault();
  const pauseKey=e.code==='KeyP'||e.code==='Escape';
  if(state==='play' && pauseKey) pause();
  else if(state==='pause' && pauseKey) resume();
  else if(state==='choose' && /^(Digit|Numpad)[123]$/.test(e.code)){ const b=$('cards').children[+e.code.slice(-1)-1]; if(b) b.click(); }
});
addEventListener('keyup',e=>{ const dir=KEY_DIR[e.code]; if(dir) keys[dir]=false; });
addEventListener('blur',()=>{ for(const k in keys) keys[k]=false; if(state==='play') pause(); });

// 터치/마우스 드래그 조이스틱: 손가락이 반경 밖으로 나가면 중심이 따라와서 방향 전환이 끊기지 않음
const JOY_R=50;
let joy=null;
function joyPos(e){ const r=cv.getBoundingClientRect(); return [e.clientX-r.left,e.clientY-r.top]; }
cv.addEventListener('pointerdown',e=>{ if(state!=='play') return; const [x,y]=joyPos(e);
  joy={id:e.pointerId,ox:x,oy:y,x,y}; cv.setPointerCapture(e.pointerId); });
cv.addEventListener('pointermove',e=>{ if(!joy||e.pointerId!==joy.id) return;
  const [x,y]=joyPos(e); joy.x=x; joy.y=y;
  const dx=x-joy.ox, dy=y-joy.oy, l=Math.hypot(dx,dy);
  if(l>JOY_R){ joy.ox=x-dx/l*JOY_R; joy.oy=y-dy/l*JOY_R; } });
const endJoy=e=>{ if(joy&&e.pointerId===joy.id) joy=null; };
cv.addEventListener('pointerup',endJoy); cv.addEventListener('pointercancel',endJoy);

// 키보드·터치 입력
/* ---------- input ---------- */
const keys={};
addEventListener('keydown',e=>{
  const k=e.key.toLowerCase(); keys[k]=true;
  if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k) && state==='play') e.preventDefault();
  if(state==='play' && (k==='p'||k==='escape')) pause();
  else if(state==='pause' && (k==='p'||k==='escape')) resume();
  else if(state==='choose' && ['1','2','3'].includes(k)){ const b=$('cards').children[+k-1]; if(b) b.click(); }
});
addEventListener('keyup',e=>{ keys[e.key.toLowerCase()]=false; });
addEventListener('blur',()=>{ for(const k in keys) keys[k]=false; if(state==='play') pause(); });
let joy=null;
cv.addEventListener('pointerdown',e=>{ if(state!=='play') return; const r=cv.getBoundingClientRect();
  joy={id:e.pointerId,ox:e.clientX-r.left,oy:e.clientY-r.top,x:e.clientX-r.left,y:e.clientY-r.top}; cv.setPointerCapture(e.pointerId); });
cv.addEventListener('pointermove',e=>{ if(joy&&e.pointerId===joy.id){ const r=cv.getBoundingClientRect(); joy.x=e.clientX-r.left; joy.y=e.clientY-r.top; } });
const endJoy=e=>{ if(joy&&e.pointerId===joy.id) joy=null; };
cv.addEventListener('pointerup',endJoy); cv.addEventListener('pointercancel',endJoy);

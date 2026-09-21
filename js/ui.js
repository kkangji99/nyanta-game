// 화면 전환(타이틀·일시정지·레벨업·결과)과 최고 기록
let best={time:0,kills:0};
try{ const b=JSON.parse(localStorage.getItem('nyanta-best')||'null'); if(b) best=b; }catch(e){}
function fmt(s){ s=Math.max(0,Math.floor(s)); return Math.floor(s/60)+':'+String(s%60).padStart(2,'0'); }
function showBest(){ const t = best.time ? `최고 기록 · ${best.time>=GAME_LEN?'배달 성공':fmt(best.time)+' 버팀'} · ${best.kills}마리 처치` : '';
  $('bestTxt').textContent=t; $('bestTxt2').textContent=t; }
showBest();


/* ---------- flow ---------- */
let redraw=true;
function show(id){ ['ovTitle','ovChoose','ovPause','ovEnd'].forEach(o=>$(o).hidden=o!==id); redraw=true; }
addEventListener('resize',()=>{ redraw=true; });
function start(){ reset(); state='play'; show(null); $('hud').hidden=false; banner('눈사람 군단이 몰려온다!'); }
function pause(){ state='pause'; joy=null; show('ovPause'); $('resumeBtn').focus(); }
function resume(){ state='play'; show(null); }
$('startBtn').onclick=start; $('againBtn').onclick=start; $('resumeBtn').onclick=resume;
$('pauseBtn').onclick=()=>{ if(state==='play') pause(); };

let bannerTO=0;
function banner(t){ const b=$('banner'); b.textContent=t; b.classList.add('show'); clearTimeout(bannerTO); bannerTO=setTimeout(()=>b.classList.remove('show'),2400); }

function openChoice(){
  state='choose'; joy=null;
  const gift=pendingGift>0;
  $('chooseEye').textContent = gift ? '선물 상자 개봉' : `레벨 업 · Lv ${P.level-pending+1}`;
  $('chooseTitle').textContent = gift ? '상자 안에서 뭐가 나왔을까?' : '무엇을 챙길까?';
  const pool=UPG.filter(u=>(S.lv[u.id]||0)<u.max);
  for(let i=pool.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [pool[i],pool[j]]=[pool[j],pool[i]]; }
  const opts=pool.slice(0,3); if(!opts.length) opts.push(HEAL);
  const wrap=$('cards'); wrap.innerHTML='';
  opts.forEach((u,i)=>{
    const lv=S.lv[u.id]||0;
    const b=document.createElement('button'); b.type='button'; b.className='card'; b.id='card'+i;
    const c=document.createElement('canvas'); c.width=88; c.height=88; paintIcon(c,u.icon||u.id);
    b.append(c);
    b.insertAdjacentHTML('beforeend',`<span class="nm">${u.name}</span><span class="lvl">${u.id==='heal'?'':lv?`Lv ${lv} → ${lv+1}`:'새로 획득'}<br><kbd>${i+1}</kbd></span><span class="ds">${u.desc}</span>`);
    b.onclick=()=>pick(u);
    wrap.append(b);
  });
  show('ovChoose');
  setTimeout(()=>{ const f=$('card0'); if(f) f.focus({preventScroll:true}); },0);
}
function pick(u){
  u.apply(); S.lv[u.id]=(S.lv[u.id]||0)+1;
  if(pendingGift>0) pendingGift--; else pending--;
  if(pending>0||pendingGift>0) openChoice(); else { state='play'; show(null); }
}
function end(win){
  state = win?'win':'over'; joy=null;
  const surv=Math.min(T,GAME_LEN);
  if(surv>best.time || (surv===best.time && kills>best.kills)){ best={time:Math.floor(surv),kills}; try{ localStorage.setItem('nyanta-best',JSON.stringify(best)); }catch(e){} }
  showBest();
  $('endEye').textContent = win?'배달 성공':'배달 실패';
  $('endTitle').textContent = win?'메리 크리스마스! 아침이 밝았다':'냥타가 지쳐 쓰러졌어요';
  $('endLead').textContent = win ? '눈보라가 그치고 해가 떴다. 눈사람 군단은 녹아내리고, 선물은 무사히 도착했다.' : `크리스마스 아침까지 ${fmt(GAME_LEN-T)} 남았었다. 고등어 한 입 먹고 다시 출발하자.`;
  $('rTime').textContent=fmt(surv); $('rKills').textContent=kills; $('rFish').textContent=fishGot; $('rLv').textContent=P.level;
  show('ovEnd'); $('againBtn').focus({preventScroll:true});
}

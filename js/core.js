// 캔버스 준비와 공용 유틸리티
const $ = id => document.getElementById(id);
const cv = $('cv'), ctx = cv.getContext('2d');
let W = 0, H = 0, DPR = 1, vgKey = '', vgGrad = null;
function resize(){
  const r = cv.getBoundingClientRect();
  W = r.width; H = r.height;
  // 큰 화면에서 캔버스 픽셀 수가 과도하게 커지지 않도록 제한
  DPR = Math.min(2, window.devicePixelRatio || 1, Math.sqrt(3.5e6 / Math.max(1, W * H)));
  vgKey = '';
  cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
}
addEventListener('resize', resize); resize();
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const TAU = Math.PI * 2;
const clamp=(v,a,b)=>v<a?a:v>b?b:v;

// 모바일 진동. 일시정지 화면에서 켜고 끌 수 있음
// - 안드로이드 등: navigator.vibrate 로 진동 패턴 재생
// - iOS 사파리(vibrate 미지원): iOS 18+의 스위치 체크박스가 토글될 때 나는 짧은 햅틱을 이용해 '톡' 횟수로 흉내
const IS_TOUCH = matchMedia('(pointer: coarse)').matches;
const HAS_VIBRATE = 'vibrate' in navigator;
const IOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform==='MacIntel' && navigator.maxTouchPoints>1);
const CAN_VIBRATE = IS_TOUCH && (HAS_VIBRATE || IOS);
let iosTick = null;
if(IS_TOUCH && !HAS_VIBRATE && IOS){
  const inp=document.createElement('input'); inp.type='checkbox'; inp.setAttribute('switch',''); inp.id='hapticSwitch';
  const lab=document.createElement('label'); lab.htmlFor='hapticSwitch';
  const box=document.createElement('div'); box.setAttribute('aria-hidden','true');
  box.style.cssText='position:fixed;left:-9999px;top:0;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none';
  box.append(inp,lab); document.body.append(box);
  iosTick=()=>lab.click();
}
let vibeOn = true, lastVibe = 0;
try{ vibeOn = localStorage.getItem('nyanta-vibe') !== 'off'; }catch(e){}
const VIBE = {
  hurt:   30,                          // 맞았을 때 (짧게)
  level:  [20,40,20],                  // 레벨 업
  gift:   [30,30,60],                  // 선물 상자 획득
  fever:  [60,40,60,40,140],           // 집사 찬스 시작
  boss:   [140,70,140],                // 눈보라 대왕 등장
  swarm:  [50,30,50,30,50],            // 쥐떼 포위
  lose:   [250],                       // 쓰러짐
  win:    [80,60,80,60,220],           // 배달 성공
  wrath:  [220,80,220],                // 눈사람의 분노 시작
  bolt:   [90,40,150],                 // 눈벼락 낙뢰
};
function haptic(kind){
  if(!CAN_VIBRATE || !vibeOn) return;
  const now = performance.now();
  if(kind==='hurt' && now-lastVibe<180) return;   // 연속으로 맞을 때 진동이 끊이지 않도록
  lastVibe = now;
  const pat = VIBE[kind];
  if(HAS_VIBRATE){ try{ navigator.vibrate(pat); }catch(e){} return; }
  if(iosTick){   // 진동 구간마다 '톡' 한 번 (긴 구간은 두 번)
    const seq = Array.isArray(pat) ? pat : [pat];
    let t = 0;
    seq.forEach((ms,i)=>{ if(i%2===0){ setTimeout(iosTick,t); if(ms>=120) setTimeout(iosTick,t+ms/2); } t+=ms; });
  }
}
let camX=0, camY=0;

// 배열을 새로 만들지 않고 제자리에서 걸러냄
function sweep(a,keep){ let j=0; for(let i=0;i<a.length;i++){ const o=a[i]; if(keep(o)) a[j++]=o; } a.length=j; }

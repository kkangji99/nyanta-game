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
let camX=0, camY=0;

// 배열을 새로 만들지 않고 제자리에서 걸러냄
function sweep(a,keep){ let j=0; for(let i=0;i<a.length;i++){ const o=a[i]; if(keep(o)) a[j++]=o; } a.length=j; }

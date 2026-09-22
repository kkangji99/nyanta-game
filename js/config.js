// 조정값 · 적 종류 · 레벨업 강화 목록
const GAME_LEN = 60;         // 버텨야 하는 시간(초). 정식 300, 테스트용 60
// 난이도·보스·쥐떼·집사 찬스 시간표는 5분(300초) 기준으로 짜여 있어서 GAME_LEN에 맞춰 압축
const PACE = 300 / GAME_LEN;
const AW = 820, AH = 820;   // 울타리 안쪽 반폭/반높이
const MAX_E = 80;           // 동시에 나오는 적 최대 수
const HURT_INV = 1.0;        // 피격 후 무적 시간(초). 적이 몰려오는 장르 특성상 0.5~1초가 일반적
const FEVER_EVERY = 120;     // 집사 찬스 주기(초)
const FEVER_LEN = 10;        // 집사 찬스 지속 시간(초)
// 온라인 랭킹 (Supabase). publishable 키는 브라우저 공개용 키라 코드에 넣어도 됨
const SUPABASE_URL = 'https://nhllcpfadwckrqkryjyy.supabase.co';
const SUPABASE_KEY = 'sb_publishable_VrWL907agR9n7snNydLz4Q_oRzVyky-';
// 눈사람의 분노: 5분 기준 WRATH_AT초(=마지막 30초)부터 눈벼락이 떨어짐 (PACE로 압축)
const WRATH_AT = 270;
const BOLT_WARN = 1.0;       // 경고 원이 보이는 시간(초) — 이 사이에 피해야 함
const BOLT_R = 58;           // 눈벼락 피해 반경
const BOLT_DMG = 24;         // 냥타가 받는 피해
const BOLT_ENEMY_DMG = 60;   // 적이 받는 피해
// 주소 뒤에 ?wrath 를 붙이면 3초에 분노 단계 시작 (확인용)
const WRATH_TEST = /[?&]wrath\b/.test(location.search);
const HUG_LEN = 1.6;       // 집사 손이 안아주는 애니메이션 길이(초)
// 주소 뒤에 ?fever 를 붙이면 첫 집사 찬스가 3초에 발동 (애니메이션 확인용)
const FEVER_TEST = /[?&]fever\b/.test(location.search);

/* ---------- upgrades ---------- */
const UPG = [
  {id:'dmg',   name:'꽁꽁 눈덩이',     desc:'눈덩이 피해 +35%',             max:6, apply:()=>S.dmg*=1.35},
  {id:'rate',  name:'연속 투척',       desc:'던지는 간격 -15%',             max:6, apply:()=>S.cd*=.85},
  {id:'multi', name:'눈덩이 한 줌',    desc:'한 번에 던지는 눈덩이 +1',      max:4, apply:()=>S.count++},
  {id:'pierce',name:'얼음 심지',       desc:'눈덩이가 적을 1마리 더 관통',   max:3, apply:()=>S.pierce++},
  {id:'bell',  name:'징글벨 오라',     desc:'주위를 도는 방울 +1개',         max:6, apply:()=>S.bells++},
  {id:'cane',  name:'캔디케인 부메랑', desc:'던졌다 돌아오는 지팡이 +1',     max:4, apply:()=>S.canes++},
  {id:'scarf', name:'털목도리',        desc:'최대 체력 +25, 즉시 25 회복',   max:5, apply:()=>{P.max+=25;P.hp=Math.min(P.max,P.hp+25);}},
  {id:'boots', name:'눈썰매 발바닥',   desc:'이동 속도 +10%',                max:4, apply:()=>S.speed*=1.1},
  {id:'magnet',name:'고등어 냄새',     desc:'고등어 끌어당기는 범위 +45%',   max:4, apply:()=>S.magnet*=1.45},
  {id:'stove', name:'벽난로 온기',     desc:'초당 체력 +0.6 회복',           max:4, apply:()=>S.regen+=.6},
];
const HEAL = {id:'heal', icon:'churu', name:'츄르 한 봉지', desc:'체력 40 회복', max:99, apply:()=>P.hp=Math.min(P.max,P.hp+40)};

const TYPES = {
  snow: {hp:14,  sp:58,  r:14, dmg:8,  xp:1},
  mouse:{hp:9,   sp:110, r:10, dmg:5,  xp:1},
  big:  {hp:70,  sp:42,  r:22, dmg:14, xp:4},
  boss: {hp:1600,sp:48,  r:42, dmg:22, xp:40},
};

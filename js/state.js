// 게임 상태 초기화
/* ---------- state ---------- */
let state='title', P, S, E, shots, canes, gems, items, foes, parts, texts, T, kills, fishGot, spawnT, fireT, caneT, pending, pendingGift, shake, flags;
let fever, feverN;   // 집사 찬스 남은 시간(초), 지금까지 발동한 횟수
function reset(){
  P={x:0,y:0,vx:0,vy:0,r:15,hp:100,max:100,face:1,inv:0,moving:false,level:1,xp:0,next:6};
  S={dmg:10,cd:.75,count:1,pierce:0,bells:0,canes:0,speed:165,magnet:70,regen:0,lv:{}};
  E=[];shots=[];canes=[];gems=[];items=[];foes=[];parts=[];texts=[];
  T=0;kills=0;fishGot=0;spawnT=.3;fireT=.3;caneT=.5;pending=0;pendingGift=0;shake=0;flags={};
  fever=0;feverN=0;
}
reset();

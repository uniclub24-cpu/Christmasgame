/* ===== 허브 게임 모듈: 선물 드롭 (catch) ===== */
HUBREG((function(){
function drawIntro(){
 GIFTX.intro(ctx,W,H,t);
 txt('떨어지는 선물 받기',640,250,128,'#ffd166','#c1121f',22);
 const fy=Math.sin(t*2.4)*12,gl=0.5+0.5*Math.sin(t*4);
 ctx.save();ctx.translate(640,440+fy);ctx.shadowColor='rgba(255,214,102,'+(0.5+gl*0.5)+')';ctx.shadowBlur=20+gl*25;
 txt('START',0,0,120,'#fff','#e63946',16);ctx.restore();
 txt('화면을 터치해 주세요',640,560+fy*0.6,38,'#fff','#1d3557',8);
}
/* 보상 화면: 바구니 든 페리 → 바구니가 확대되며 별만 남음 → 별이 돌다가 선물 상자로 */
function starPath(r){ctx.beginPath();for(let i=0;i<10;i++){const q=i%2?r*0.43:r,a=-Math.PI/2+i*Math.PI/5;ctx.lineTo(q*Math.cos(a),q*Math.sin(a));}ctx.closePath();}
function bigStar(r){starPath(r);ctx.fillStyle='#ffd23f';ctx.fill();ctx.lineWidth=r*0.095;ctx.lineJoin='round';ctx.strokeStyle='#3a2a20';ctx.stroke();starPath(r*0.5);ctx.fillStyle='#fff4b0';ctx.fill();}
function giftBox(lid){
 ctx.lineJoin='round';ctx.lineWidth=7;ctx.strokeStyle='#3a2a20';
 ctx.fillStyle='rgba(0,0,0,.22)';ctx.beginPath();ctx.ellipse(0,128,150,20,0,0,7);ctx.fill();
 ctx.fillStyle='#e63946';rr(-120,-30,240,156,14);ctx.fill();ctx.stroke();
 ctx.fillStyle='#c1121f';ctx.fillRect(-116,-26,232,22);
 ctx.fillStyle='#ffd166';ctx.fillRect(-24,-30,48,156);ctx.strokeRect(-24,-30,48,156);
 ctx.save();ctx.translate(0,-lid);ctx.rotate(lid*0.0016);
 ctx.fillStyle='#ff5a66';rr(-136,-78,272,56,14);ctx.fill();ctx.stroke();
 ctx.fillStyle='#ffd166';ctx.fillRect(-24,-78,48,56);ctx.strokeRect(-24,-78,48,56);
 for(const s of[-1,1]){ctx.beginPath();ctx.moveTo(0,-78);ctx.bezierCurveTo(s*30,-150,s*104,-140,s*84,-96);ctx.bezierCurveTo(s*70,-78,s*30,-76,0,-78);ctx.closePath();ctx.fillStyle='#ffd166';ctx.fill();ctx.stroke();}
 ctx.beginPath();ctx.arc(0,-82,15,0,7);ctx.fillStyle='#f4a93a';ctx.fill();ctx.stroke();
 ctx.restore();
}
function drawEnding(){
 const sn=typeof SLED!=='undefined'&&SLED.snap();if(sn)ctx.drawImage(sn,0,0,W,H);else drawWorld(false);
 const e=state==='ending'?stT:99;
 ctx.fillStyle='rgba(8,16,48,'+(0.74*Math.min(1,e/0.7))+')';ctx.fillRect(0,0,W,H);
 const cx=640,cy=440,ease=x=>x<0?0:x>1?1:x*x*(3-2*x);
 const z=ease((e-1.0)/0.9);                 // 0 = 페리 전체, 1 = 바구니만 크게
 const m=ease((e-3.0)/1.2);                 // 0 = 별, 1 = 선물 바구니
 // 빛줄기
 ctx.save();ctx.translate(cx,cy);ctx.rotate(t*0.35);ctx.fillStyle='rgba(255,214,102,'+(0.06+0.12*z+0.14*m)+')';
 for(let i=0;i<14;i++){ctx.rotate(Math.PI/7);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(560,-46);ctx.lineTo(560,46);ctx.closePath();ctx.fill();}ctx.restore();
 const gl=ctx.createRadialGradient(cx,cy,10,cx,cy,340);gl.addColorStop(0,'rgba(255,246,190,'+(0.3+0.45*z-0.25*m)+')');gl.addColorStop(1,'rgba(255,220,90,0)');ctx.fillStyle=gl;ctx.fillRect(cx-340,cy-340,680,680);
 // 1) 바구니를 든 페리 — 바구니 쪽으로 확대되며 사라짐
 const hA=Math.min(1,e/0.4)*(1-ease((z-0.45)/0.55));
 if(hA>0.01&&typeof GIFTX!=='undefined'){GIFTX.hero(ctx,cx,cy+60*(1-z),1.5+z*2.6,hA,2.3,z*34);}
 // 2) 바구니 속 큰 별 — 반짝이다가 커지고, 점점 빨리 돌다가 사라짐
 const sA=ease((z-0.45)/0.55);
 if(m<1&&sA>0){const tw=0.5+0.5*Math.sin(t*8),r=(46+z*70)*(1+0.9*m),e2=Math.max(0,e-1.9),sp=e<1.9?Math.sin(t*3)*0.12:e2*1.6+e2*e2*3.1;
  ctx.save();ctx.translate(cx,cy+(1-z)*4+Math.sin(t*3)*5*z*(1-m));ctx.globalAlpha=sA*(1-m);
  const g1=ctx.createRadialGradient(0,0,r*0.3,0,0,r*2.2);g1.addColorStop(0,'rgba(255,244,170,'+(0.5+0.35*tw)+')');g1.addColorStop(1,'rgba(255,220,90,0)');ctx.fillStyle=g1;ctx.fillRect(-r*2.2,-r*2.2,r*4.4,r*4.4);
  ctx.rotate(sp);bigStar(r);
  ctx.strokeStyle='#fff';ctx.lineCap='round';ctx.lineWidth=r*0.07;ctx.globalAlpha*=tw;for(const[a,b]of[[-1.15,-0.9],[1.2,-0.6],[0.95,1.1],[-1.05,0.95]]){ctx.beginPath();ctx.moveTo(a*r-r*0.18,b*r);ctx.lineTo(a*r+r*0.18,b*r);ctx.moveTo(a*r,b*r-r*0.18);ctx.lineTo(a*r,b*r+r*0.18);ctx.stroke();}
  ctx.restore();ctx.globalAlpha=1;}
 // 3) 선물 바구니 — 별 자리에서 돌면서 나타나 자리를 잡음
 if(m>0){const settle=ease((e-4.2)/0.5),bob=settle*Math.sin(t*2.6)*7,pop=state==='ending'?1+Math.sin(Math.min(1,Math.max(0,(e-4.1)/0.4))*Math.PI)*0.12:1;
  const lid=state==='ending'?0:Math.min(170,stT*520)+(stT>0.33?Math.sin(t*3)*6:0);
  ctx.save();ctx.translate(cx,cy+bob);ctx.rotate((1-m)*-2.6+(state==='ending'&&e>4.8?Math.sin(t*9)*0.03:0));ctx.scale((0.35+0.65*m)*pop,(0.35+0.65*m)*pop);ctx.globalAlpha=m;
  if(lid>0){const g2=ctx.createRadialGradient(0,-40,4,0,-40,190);g2.addColorStop(0,'rgba(255,255,220,.95)');g2.addColorStop(1,'rgba(255,240,150,0)');ctx.fillStyle=g2;ctx.fillRect(-200,-240,400,400);}
  giftBox(lid);ctx.restore();ctx.globalAlpha=1;}
 if(state==='ending'&&e<2.6){ctx.globalAlpha=Math.min(1,e*2)*(e>2.1?Math.max(0,(2.6-e)/0.5):1);txt('별을 다 모았어요!',640,120,76,'#ffd166','#c1121f',14);ctx.globalAlpha=1;}
}
return {id:'catch',name:'선물 드롭',engine:GIFTX,endBtn:5.0,
 rule:()=>'<b>20초</b> 안에<br>별 <b>8개</b>를 모으면<br><b>성공!</b>',
 host:{diff:()=>+(store.get('diff')||2),resp:()=>+(store.get('resp')||9)},
 opts:[{key:'diff',label:'난이도',small:'쉬움: 눈덩이 적게 · 보통 · 어려움: 눈덩이와 선물이 1:1',vals:[1,2,3],def:2,fmt:v=>['','쉬움','보통','어려움'][v]},{key:'resp',label:'움직임 반응 (1~10)',small:'10 = 즉각 반응 · 낮을수록 늦게 따라오고 멈출 때 더 미끄러져요',vals:[1,2,3,4,5,6,7,8,9,10],def:9,fmt:v=>v}],
 failMsg:r=>r==='spill'?'눈이 너무 무거워서<br>바구니를 쏟았어요!':'시간이 다 됐어요.<br>별 8개를 모아 보세요!',
 steps:"<div class=\"step\"><span class=\"no\">1</span>\n    <svg viewBox=\"0 0 170 130\"><path d=\"M30 70h110M48 52L30 70l18 18M122 52l18 18-18 18\" fill=\"none\" stroke=\"#2b4a8c\" stroke-width=\"8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M52 96h66l-10 26H62z\" fill=\"#b8733a\" stroke=\"#3a2a20\" stroke-width=\"4\" stroke-linejoin=\"round\"/></svg>\n    <p>화면을 <b>좌우로 밀면</b><br>페리가 바구니를 들고<br>따라가요</p></div>\n   <div class=\"step\"><span class=\"no\">2</span>\n    <svg viewBox=\"0 0 170 130\"><path d=\"M52 22l9 19 21 3-15 14 4 21-19-10-19 10 4-21-15-14 21-3z\" fill=\"#ffd23f\" stroke=\"#3a2a20\" stroke-width=\"4\" stroke-linejoin=\"round\"/><circle cx=\"122\" cy=\"52\" r=\"22\" fill=\"#f7faff\" stroke=\"#7c9ad0\" stroke-width=\"4\"/><path d=\"M108 38l28 28M136 38l-28 28\" stroke=\"#e63946\" stroke-width=\"7\" stroke-linecap=\"round\"/><path d=\"M52 88v24m-10-12l10 12l10-12\" stroke=\"#2a9d8f\" stroke-width=\"6\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>\n    <p><b>반짝이는 별</b>은 받고<br><b>눈덩이</b>는 피해요<br>눈 4번이면 와르르!</p></div>\n   <div class=\"step\"><span class=\"no\">3</span>\n    <svg viewBox=\"0 0 170 130\"><circle cx=\"85\" cy=\"58\" r=\"44\" fill=\"#fff3c4\"/><text x=\"85\" y=\"76\" text-anchor=\"middle\" font-family=\"Black Han Sans,Jua,sans-serif\" font-size=\"56\" fill=\"#e63946\">8</text><text x=\"85\" y=\"124\" text-anchor=\"middle\" font-family=\"Black Han Sans,Jua,sans-serif\" font-size=\"20\" fill=\"#2b4a8c\">20초</text></svg>\n    <p id=\"gRule\"></p></div>",
 intro:drawIntro,ending:drawEnding};
})());

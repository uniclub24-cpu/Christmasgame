/* ===== 허브 게임 모듈: 트리 점프 (tree) ===== */
HUBREG((function(){
function drawIntro(){
 TREEX.intro(ctx,W,H,t);
 ctx.fillStyle='rgba(14,27,66,.18)';ctx.fillRect(0,0,W,H);
 txt('페리 크리스마스',760,96,124,'#ffd166','#c1121f',20);
 const fy=Math.sin(t*2.4)*12,gl=0.5+0.5*Math.sin(t*4);
 ctx.save();ctx.translate(760,262+fy);ctx.shadowColor='rgba(255,214,102,'+(0.5+gl*0.5)+')';ctx.shadowBlur=20+gl*25;
 txt('START',0,0,136,'#fff','#e63946',18);ctx.restore();
 txt('화면을 터치해 주세요',760,362+fy*0.6,40,'#fff','#1d3557',8);
}
/* 보상 화면: 잡은 별이 돌다가 커지면서 선물 상자로 바뀜 (캐릭터 없음) */
function starPath(r){ctx.beginPath();for(let i=0;i<10;i++){const q=i%2?r*0.43:r,a=-Math.PI/2+i*Math.PI/5;ctx.lineTo(q*Math.cos(a),q*Math.sin(a));}ctx.closePath();}
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
 ctx.fillStyle='rgba(8,16,48,'+(0.72*Math.min(1,e/0.8))+')';ctx.fillRect(0,0,W,H);
 const cx=640,cy=430,ease=x=>x<0?0:x>1?1:x*x*(3-2*x);
 const m=ease((e-1.7)/1.3);                 // 0 = 별, 1 = 선물 상자
 // 빛줄기
 ctx.save();ctx.translate(cx,cy);ctx.rotate(t*0.35);ctx.fillStyle='rgba(255,214,102,'+(0.10+0.2*m)+')';
 for(let i=0;i<14;i++){ctx.rotate(Math.PI/7);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(560,-46);ctx.lineTo(560,46);ctx.closePath();ctx.fill();}ctx.restore();
 const gl=ctx.createRadialGradient(cx,cy,10,cx,cy,330);gl.addColorStop(0,'rgba(255,246,190,'+(0.75-0.3*m)+')');gl.addColorStop(1,'rgba(255,220,90,0)');ctx.fillStyle=gl;ctx.fillRect(cx-330,cy-330,660,660);
 // 별: 점점 빨리 돌면서 커지고 사라짐
 if(m<1){const sp=e<1.7?e*2.2+e*e*2.4:1.7*2.2+1.7*1.7*2.4+(e-1.7)*10.4,sc=(0.55+0.45*ease(e/0.6))*(1+0.25*Math.min(1,e/1.7))*(1+1.9*m);
  ctx.save();ctx.translate(cx,cy+Math.sin(t*3)*8*(1-m));ctx.rotate(sp);ctx.scale(sc,sc);ctx.globalAlpha=1-m;
  starPath(96);ctx.fillStyle='#ffd23f';ctx.fill();ctx.lineWidth=9;ctx.lineJoin='round';ctx.strokeStyle='#3a2a20';ctx.stroke();
  starPath(48);ctx.fillStyle='#fff4b0';ctx.fill();ctx.restore();ctx.globalAlpha=1;}
 // 선물 상자: 별 안에서 돌면서 나타나 자리를 잡음
 if(m>0){const settle=ease((e-3)/0.5),bob=settle*Math.sin(t*2.6)*7,pop=state==='ending'?1+Math.sin(Math.min(1,Math.max(0,(e-2.9)/0.4))*Math.PI)*0.12:1;
  const lid=state==='ending'?0:Math.min(170,stT*520)+(stT>0.33?Math.sin(t*3)*6:0);
  ctx.save();ctx.translate(cx,cy+bob);ctx.rotate((1-m)*-2.6+(state==='ending'&&e>3.6?Math.sin(t*9)*0.03:0));ctx.scale((0.35+0.65*m)*pop,(0.35+0.65*m)*pop);ctx.globalAlpha=m;
  if(lid>0){const g2=ctx.createRadialGradient(0,-40,4,0,-40,190);g2.addColorStop(0,'rgba(255,255,220,.95)');g2.addColorStop(1,'rgba(255,240,150,0)');ctx.fillStyle=g2;ctx.fillRect(-200,-240,400,400);}
  giftBox(lid);ctx.restore();ctx.globalAlpha=1;}
 if(state==='ending'&&e<3.4){ctx.globalAlpha=Math.min(1,e*2)*(e>2.9?Math.max(0,(3.4-e)/0.5):1);txt('별을 잡았어요!',640,150,76,'#ffd166','#c1121f',14);ctx.globalAlpha=1;}
}
return {id:'tree',name:'트리 점프',engine:TREEX,endBtn:3.6,
 rule:()=>'<b>50m</b> 위에 떠 있는<br>빛나는 별을 잡으면<br><b>선물!</b>',
 host:{lives:()=>+(store.get('lives')||1)},
 opts:[{key:'lives',label:'LIFE (기회)',small:'2~3번이면 떨어져도 날개를 파닥이며 다시 올라와요 · 1번이면 한 번에 끝',vals:[1,2,3],def:1,fmt:v=>v+'번'}],
 failMsg:r=>'나무에서 떨어졌어요.<br>다시 도전해 보세요!',
 steps:"<div class=\"step\"><span class=\"no\">1</span>\n    <svg viewBox=\"0 0 170 130\"><ellipse cx=\"85\" cy=\"74\" rx=\"34\" ry=\"24\" fill=\"#e8862a\" stroke=\"#3a2a20\" stroke-width=\"4\"/><circle cx=\"85\" cy=\"42\" r=\"15\" fill=\"#fff\" stroke=\"#3a2a20\" stroke-width=\"4\"/><path d=\"M97 42h20l-18 10z\" fill=\"#ffc72c\" stroke=\"#3a2a20\" stroke-width=\"3\"/><path d=\"M78 26q4-10 14 0\" fill=\"#e63946\" stroke=\"#3a2a20\" stroke-width=\"3\"/><path d=\"M85 100v24m-11-12l11 12l11-12\" stroke=\"#2b4a8c\" stroke-width=\"6\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>\n    <p><b>당겼다 놓으면</b> 점프!<br>많이 당길수록 높이<br><b>점선</b>이 날아갈 길</p></div>\n   <div class=\"step\"><span class=\"no\">2</span>\n    <svg viewBox=\"0 0 170 130\"><rect x=\"0\" y=\"92\" width=\"62\" height=\"12\" rx=\"5\" fill=\"#7a4a24\"/><rect x=\"0\" y=\"84\" width=\"62\" height=\"10\" rx=\"5\" fill=\"#dbe9fb\"/><rect x=\"108\" y=\"42\" width=\"62\" height=\"12\" rx=\"5\" fill=\"#7a4a24\"/><rect x=\"108\" y=\"34\" width=\"62\" height=\"10\" rx=\"5\" fill=\"#dbe9fb\"/><rect x=\"58\" y=\"66\" width=\"48\" height=\"10\" rx=\"5\" fill=\"#7a4a24\"/><path d=\"M34 78 Q70 6 132 30\" fill=\"none\" stroke=\"#e63946\" stroke-width=\"5\" stroke-dasharray=\"3 10\" stroke-linecap=\"round\"/><circle cx=\"34\" cy=\"76\" r=\"9\" fill=\"#e8862a\" stroke=\"#3a2a20\" stroke-width=\"3\"/></svg>\n    <p><b>비스듬히</b> 당기면 옆 가지,<br><b>곧게</b> 당기면 제자리 점프<br>가지를 밟고 올라가요</p></div>\n   <div class=\"step\"><span class=\"no\">3</span>\n    <svg viewBox=\"0 0 170 130\"><circle cx=\"85\" cy=\"62\" r=\"46\" fill=\"#fff3c4\"/><path d=\"M85 18l13 28 31 4-23 21 6 30-27-15-27 15 6-30-23-21 31-4z\" fill=\"#ffd23f\" stroke=\"#3a2a20\" stroke-width=\"4\" stroke-linejoin=\"round\"/><text x=\"85\" y=\"124\" text-anchor=\"middle\" font-family=\"Black Han Sans,Jua,sans-serif\" font-size=\"22\" fill=\"#e63946\">50m</text></svg>\n    <p id=\"gRule\"></p></div>",
 intro:drawIntro,ending:drawEnding};
})());

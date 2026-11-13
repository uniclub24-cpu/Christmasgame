#!/usr/bin/env python3
"""허브 앱 조립: shell.html + manifest.json + landing 이미지 + games/<id>/{engine.js,module.js[,style.css]}
   → app/src/hub/assets/game/index.html (파일 1개)

   게임 추가 방법
     1) games/<새id>/engine.js  (게임 엔진)  ·  games/<새id>/module.js  (HUBREG({...}) 한 덩어리)
     2) 랜딩 이미지(landing.webp)를 새 타일이 들어간 그림으로 교체
     3) manifest.json 의 games 에 {"id": "<새id>", "tile": [x, y, w, h]}  (랜딩 이미지 픽셀 기준 타일 위치) 한 줄 추가
     4) python3 hub/build.py   (GitHub 에 올리면 Actions 가 자동으로 실행)
"""
import base64, json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, '..', 'app', 'src', 'hub', 'assets', 'game', 'index.html')
rd = lambda *p: open(os.path.join(HERE, *p), encoding='utf-8').read()
man = json.loads(rd('manifest.json'))
shell = rd('shell.html')
ext = os.path.splitext(man['landing'])[1].lstrip('.').replace('jpg', 'jpeg')
land = 'data:image/%s;base64,%s' % (ext, base64.b64encode(open(os.path.join(HERE, man['landing']), 'rb').read()).decode())
engines, modules, css = [], [], []
for g in man['games']:
    if g.get('builtin'): continue
    d = os.path.join(HERE, 'games', g['id'])
    engines.append('<script>' + open(os.path.join(d, 'engine.js'), encoding='utf-8').read() + '</script>')
    modules.append(open(os.path.join(d, 'module.js'), encoding='utf-8').read())
    if os.path.exists(os.path.join(d, 'style.css')): css.append(open(os.path.join(d, 'style.css'), encoding='utf-8').read())
for a, b in [('<!--__ENGINES__-->', '\n'.join(engines)), ('/*__GAME_MODULES__*/', '\n'.join(modules)),
             ('/*__MANIFEST__*/', json.dumps({k: man[k] for k in ('w', 'h', 'coupon', 'games')}, ensure_ascii=False)),
             ('__LANDING__', land), ('/*__GAME_CSS__*/', '\n'.join(css))]:
    assert shell.count(a) == 1, a
    shell = shell.replace(a, b)
os.makedirs(os.path.dirname(os.path.abspath(OUT)), exist_ok=True)
open(OUT, 'w', encoding='utf-8').write(shell)
print('built', os.path.abspath(OUT), len(shell), 'bytes ·', len(man['games']), 'games')

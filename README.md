# 페리카나 크리스마스 게임 (태블릿오더용)

같은 소스에서 앱 3개를 빌드합니다. **매장에 설치할 앱은 맨 위 「페리카나 미니게임」(묶음 앱)입니다.**

| 앱 | 패키지 | 게임 파일 |
|---|---|---|
| **페리카나 미니게임 (4개 게임 묶음 · 랜딩에서 고르기)** | `com.peli.hub` | `app/src/hub/assets/game/index.html` ← `hub/build.py`가 만듦 |
| 페리 크리스마스 (트리 점프) | `com.peli.tree` | `app/src/tree/assets/game/index.html` |
| 떨어지는 선물 받기 (바구니) | `com.peli.catch` | `app/src/catch/assets/game/index.html` |

## APK 받는 법
1. 이 저장소의 **Actions** 탭 → 맨 위 **Build APK** 실행 결과를 엽니다.
2. 아래 **Artifacts**의 `Peli-xmas-games-apk`를 내려받으면 세 앱의 APK가 (`app-hub-debug.apk`가 묶음 앱) 들어 있습니다.

`main` 브랜치에 올리면 자동으로 다시 빌드됩니다.

## 구조
- 대기화면·설정·관제 통신·보상 흐름은 기존 산타/썰매 앱(`pelicanadifferentcorrect`, `santa-v2`)의 셸을 그대로 씁니다.
- 서버로 보내는 값: 페리 크리스마스는 게임 `tree`·태블릿 `T`+번호, 떨어지는 선물 받기는 게임 `catch`·태블릿 `C`+번호.

## 묶음 앱 (hub) — 미니게임 천국
게임하기 → 랜딩(게임 4개 타일 · 쿠폰 확인) → 게임 → 끝나면 다시 「게임하기 / 주문하기」 화면.

- 주문하기를 누르면 앱이 뒤로 가고 화면 오른쪽 위에 작은 **Game** 아이콘이 남습니다(끌어서 옮길 수 있음). 누르면 다시 열립니다.
- 보상을 받은 테이블은 관제에서 RESET 하기 전까지 **게임만** 할 수 있습니다(보상 없음). 받은 쿠폰은 랜딩의 **쿠폰 확인**에서 다시 볼 수 있습니다.
- 서버로 보내는 값: 태블릿 `번호`(접두어 없음) · `meta.app = hub` · 성공 기록의 게임은 `tree` / `run` / `catch` / `xmas`.

### 게임을 추가하려면
```
hub/
  build.py          조립 스크립트 (Actions가 빌드 전에 자동 실행)
  shell.html        공통 틀: 대기화면·설정·관제 통신·보상·랜딩·쿠폰 확인 (+ 페리 산타 게임)
  landing.webp      랜딩 그림
  manifest.json     랜딩에서 각 게임 타일의 위치
  games/<id>/engine.js   게임 엔진
  games/<id>/module.js   HUBREG({...}) — 이름·설명 3단계·성공 규칙·설정 줄·인트로/보상 연출
```
1. `hub/games/<새id>/`에 `engine.js`, `module.js`를 넣습니다.
2. `hub/landing.webp`를 새 타일이 들어간 그림으로 바꿉니다.
3. `hub/manifest.json`의 `games`에 `{"id": "<새id>", "tile": [x, y, 너비, 높이]}` 한 줄을 추가합니다(랜딩 그림의 픽셀 기준).
4. `main`에 올리면 Actions가 `hub/build.py`를 돌려 APK를 다시 만듭니다. 관제의 「게임 파일 올리기 → 미니게임 천국」에 `app/src/hub/assets/game/index.html`을 올리면 APK 재설치 없이도 바뀝니다.

# 페리카나 크리스마스 게임 (태블릿오더용)

같은 소스에서 앱 2개를 빌드합니다.

| 앱 | 패키지 | 게임 파일 |
|---|---|---|
| 페리 크리스마스 (트리 점프) | `com.peli.tree` | `app/src/tree/assets/game/index.html` |
| 떨어지는 선물 받기 (바구니) | `com.peli.catch` | `app/src/catch/assets/game/index.html` |

## APK 받는 법
1. 이 저장소의 **Actions** 탭 → 맨 위 **Build APK** 실행 결과를 엽니다.
2. 아래 **Artifacts**의 `Peli-xmas-games-apk`를 내려받으면 두 앱의 APK가 들어 있습니다.

`main` 브랜치에 올리면 자동으로 다시 빌드됩니다.

## 구조
- 대기화면·설정·관제 통신·보상 흐름은 기존 산타/썰매 앱(`pelicanadifferentcorrect`, `santa-v2`)의 셸을 그대로 씁니다.
- 서버로 보내는 값: 페리 크리스마스는 게임 `tree`·태블릿 `T`+번호, 떨어지는 선물 받기는 게임 `catch`·태블릿 `C`+번호.

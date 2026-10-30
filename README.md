# AI 계단 오르기

미디어페스티벌(2026-11-05 ~ 11-07) 시민 체험용 웹 게임입니다. 기획서: `../plan/ai-game-plan.md`

## 화면 세 개
| 주소 | 어디서 | 하는 일 |
|---|---|---|
| `index.html` | 태블릿 2대, 시민 폰(QR) | 캐릭터 고르기 → 계단 10칸 "해봤어요 / 안 해봤어요(이유)" → 높이와 나를 막는 벽 확인, 결과는 TV로 자동 전송 |
| `map.html` | 스탠딩 TV (노트북 HDMI) | 오늘 시민들의 AI 계단(각자 오른 칸에 캐릭터), 도착 연출, 가장 많이 막은 벽 순위. 자정에 새로 시작 |
| `card.html` | 시민 폰 | 결과 화면 QR로 열리는 결과 카드. 길게 눌러 저장 |

## 바꾸기 쉬운 것
- 계단 10칸 질문, 안 해본 이유, 다섯 가지 벽과 벽 넘기 팁, 높이별 이름, 캐릭터 이름: `js/data.js`
- 캐릭터 그림: `assets/characters/{캐릭터id}_{색id}.png` (50장 들어 있음, 바꾸려면 같은 이름으로 덮어쓰기)
  - 캐릭터 id: camera, tv, mic, radio, phone, slate, headphone, news, wifi, ai
  - 색 id: yellow, coral, mint, sky, lavender (배경 투명)
- 깜짝 퀴즈 사진·목소리: `assets/surprise/` 에 넣고 `js/data.js` 의 `SURPRISE` 에 적기. 비어 있으면 깜짝 카드는 건너뜀
- 소리: 태블릿은 짧은 효과음만, TV는 무음 (배경음악 없음)
- 효과음: 파일 없이 `js/sound.js` 에서 코드로 만듦

## 연습 모드와 실제 모드
- `firebase-config.js` 가 비어 있으면 연습 모드: 같은 브라우저의 탭끼리만 결과가 보입니다.
- Firebase 설정을 넣으면 모든 기기가 결과를 공유합니다. Realtime Database 규칙은 `database.rules.json` 내용을 붙여넣습니다.

## 행사장 운영 체크리스트
1. TV 노트북: 크롬으로 `map.html` 열기 → F11 전체화면 (TV는 소리 없음)
2. 태블릿: `index.html` 열기 → 홈 화면에 추가 → 화면 고정(안드로이드 "앱 고정", 아이패드 "사용법 유도")
3. 손대지 않고 20초(결과 화면은 40초)가 지나면 "아직 하고 있나요?" 안내와 10초 카운트다운 뒤 처음 화면으로 돌아갑니다.
4. 인터넷이 끊기면 결과가 TV에 안 갈 수 있으니 핫스팟을 예비로 준비
5. TV 계단은 그날 기록만 보여 줘요. 기록은 지워지지 않아 행사 뒤 보고서 자료로 쓸 수 있어요

## 직접 실행해 보기
```
cd game && python3 -m http.server 8000
```
브라우저에서 `http://localhost:8000/` (게임), `http://localhost:8000/map.html` (TV) 를 각각 탭으로 열기.

## 사용한 오픈소스
- 글꼴: 주아(BM JUA), 고운돋움 — SIL Open Font License 1.1
- QR 코드: qrcode-generator (MIT)
- Firebase JS SDK (Apache-2.0)

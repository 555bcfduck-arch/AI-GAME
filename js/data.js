// 게임 내용 데이터: 계단 10칸, 다섯 가지 벽, 높이별 이름, 캐릭터, 색깔
// 문구를 바꾸고 싶으면 이 파일만 고치면 됩니다. 기획: ../plan/questions-v3.md

// 다섯 가지 벽. code 는 저장할 때 쓰는 한 글자(1~5), 바꾸지 마세요.
export const WALLS = {
  worry: { code: "1", emoji: "🔒", name: "걱정의 벽", color: "#FF9C8A", heart: "내 정보가 새어 나갈까 봐 걱정돼요",
    tip: "이름, 주소, 주민번호만 빼고 물어보세요. 그것만으로도 대부분 해결돼요." },
  doubt: { code: "2", emoji: "❓", name: "의심의 벽", color: "#9AD6FF", heart: "AI 답이 틀릴까 봐 못 믿겠어요",
    tip: "의심은 좋은 습관이에요. 질문 끝에 \"출처도 알려 줘\"를 붙이면 확인이 쉬워져요." },
  how:   { code: "3", emoji: "🧩", name: "방법의 벽", color: "#C9B5F7", heart: "어떻게 시켜야 할지 모르겠어요",
    tip: "친구에게 말하듯 그냥 말로 물어보세요. \"쉽게 설명해 줘\"면 충분해요." },
  heart: { code: "4", emoji: "💗", name: "마음의 벽", color: "#FFB3C7", heart: "이건 사람이, 내가 직접 해야 할 것 같아요",
    tip: "마음은 그대로 두고, 초안만 AI에게. 마지막 문장은 꼭 내가 써요." },
  habit: { code: "5", emoji: "🛋️", name: "습관의 벽", color: "#7EDDB5", heart: "굳이? 하던 대로가 편해요",
    tip: "딱 하나만 바꿔 보세요. 오늘 긴 글 하나를 \"세 줄로 요약해 줘\"로." },
};
export const WALL_BY_CODE = Object.fromEntries(Object.entries(WALLS).map(([k, w]) => [w.code, k]));

// 계단 10칸. q 는 질문(**굵게** 가능), ex 는 예시, reasons 는 [벽, 안 해본 이유] 세 개
export const STEPS = [
  { icon: "💬", short: "말로\n묻기", q: "궁금한 걸 검색창 대신\n**AI에게 말로 물어본** 적 있나요?", ex: "예: \"감기에 좋은 음식 알려 줘\"",
    reasons: [["how", "어디서 어떻게 하는지 몰라요"], ["habit", "검색이 더 편해요"], ["doubt", "검색이 더 정확할 것 같아요"]] },
  { icon: "📄", short: "요약\n맡기기", q: "긴 안내문이나 기사를\n**\"세 줄로 요약해 줘\"** 한 적 있나요?", ex: "예: 아파트 공지문, 보험 약관, 긴 뉴스",
    reasons: [["doubt", "중요한 내용을 빼먹을까 봐요"], ["habit", "그냥 직접 읽어요"], ["how", "그런 게 되는지 몰랐어요"]] },
  { icon: "📷", short: "사진으로\n묻기", q: "**사진을 찍어 AI에게 보여주고**\n물어본 적 있나요?", ex: "예: 모르는 꽃, 외국어 메뉴판, 고장 난 가전",
    reasons: [["how", "사진으로도 되는지 몰랐어요"], ["worry", "사진 올리기가 꺼려져요"], ["habit", "필요한 적이 없었어요"]] },
  { icon: "✍️", short: "초안\n맡기기", q: "축하 글, 안내문, 사과 메시지\n**초안을 AI에게** 부탁한 적 있나요?", ex: "예: \"엄마 칠순 축하 문자 써 줘\"",
    reasons: [["heart", "내 마음은 내가 써야죠"], ["doubt", "어색한 말투가 나올 것 같아요"], ["how", "뭐라고 시켜야 할지 몰라요"]] },
  { icon: "🔁", short: "다시\n시키기", q: "AI 답이 마음에 안 들어서\n**\"더 쉽게, 더 짧게\"**\n다시 시켜 본 적 있나요?", ex: "예: \"초등학생도 알게 다시 설명해 줘\"",
    reasons: [["how", "다시 시킬 수 있는지 몰랐어요"], ["habit", "첫 답으로 충분했어요"], ["doubt", "몇 번 해도 비슷할 것 같아요"]] },
  { icon: "🔎", short: "출처\n확인", q: "AI가 알려 준 정보를\n**출처까지 찾아 확인해 본** 적 있나요?", ex: "예: \"그 내용 어디에 나와 있어?\"",
    reasons: [["habit", "귀찮아서 그냥 믿었어요"], ["how", "확인하는 방법을 몰라요"], ["doubt", "애초에 AI 답을 안 믿어요"]] },
  { icon: "💭", short: "속마음\n나누기", q: "고민이나 속마음을\n**AI에게 털어놓은** 적 있나요?", ex: "예: \"요즘 일이 너무 많아서 지쳐\"",
    reasons: [["heart", "고민은 사람에게 말해야죠"], ["worry", "기록이 남을까 봐요"], ["doubt", "기계가 뭘 알겠어요"]] },
  { icon: "🎨", short: "그림·노래\n만들기", q: "AI로 **그림, 노래, 영상을**\n만들어 본 적 있나요?", ex: "예: 우리 강아지 동화책 그림, 생일 축하 노래",
    reasons: [["how", "어떤 앱을 써야 할지 몰라요"], ["heart", "창작은 사람이 해야죠"], ["habit", "만들 일이 없어요"]] },
  { icon: "📑", short: "중요 서류\n물어보기", q: "건강검진 결과지나 계약서처럼\n**중요한 서류를 AI에게\n설명해 달라고** 한 적 있나요?", ex: "예: \"이 수치가 무슨 뜻이야?\"",
    reasons: [["worry", "개인정보라서 못 올려요"], ["doubt", "틀리면 큰일이잖아요"], ["heart", "전문가에게 물어야죠"]] },
  { icon: "🤖", short: "나만의\nAI 비서", q: "가계부, 일정, 반복 업무처럼\n**늘 하는 일을 AI에게\n정해진 방식으로 맡기고** 있나요?", ex: "예: 매주 장보기 목록, 회의록 정리",
    reasons: [["how", "그렇게까지 하는 법을 몰라요"], ["worry", "내 생활을 다 맡기긴 불안해요"], ["habit", "손에 익은 방식이 편해요"]] },
];

// 깜짝 퀴즈는 이 칸을 마친 뒤에 나와요 (0부터 셈: 3 = 4칸 뒤, 7 = 8칸 뒤)
// 행사장이 시끄럽고 태블릿에 헤드폰이 없어서 목소리 퀴즈 대신 사진 퀴즈 두 번 (목소리로 바꾸려면 "audio")
export const SURPRISE_AFTER = { 3: "image", 7: "image" };

// 높이(해본 칸 수)별 이름
export const LEVELS = [
  { min: 0, emoji: "🌱", name: "AI 새싹", desc: "이제 막 AI와 인사한 단계예요." },
  { min: 3, emoji: "🚶", name: "AI 산책러", desc: "필요할 때 가끔 AI를 불러 쓰는 단계예요." },
  { min: 5, emoji: "🧭", name: "AI 탐험가", desc: "이것저것 시켜 보며 길을 넓히는 단계예요." },
  { min: 7, emoji: "🎬", name: "AI 크리에이터", desc: "AI와 함께 무언가를 만들어 내는 단계예요." },
  { min: 9, emoji: "🚀", name: "AI 마스터", desc: "생활 속에 AI를 내 방식대로 들인 단계예요." },
];
export const levelOf = h => [...LEVELS].reverse().find(l => h >= l.min);
export const NO_WALL_TIP = "벽이 없는 당신, 이제 주변 사람의 벽을 넘겨 주세요!";

// 계단 기록 문자열(예 "oo2o3oo1oo")에서 가장 많이 나온 벽. 같으면 나중에 고른 벽
export function mainWall(steps) {
  const n = {}; let best = null;
  [...steps].forEach(ch => { if (ch === "o") return; n[ch] = (n[ch] || 0) + 1; if (!best || n[ch] >= n[best]) best = ch; });
  return best ? { key: WALL_BY_CODE[best], count: n[best] } : null;
}

export const CHARACTERS = [
  { id: "camera", name: "찰칵이", obj: "카메라" },
  { id: "tv", name: "테레비", obj: "TV" },
  { id: "mic", name: "울림이", obj: "마이크" },
  { id: "radio", name: "주파니", obj: "라디오" },
  { id: "phone", name: "톡톡이", obj: "스마트폰" },
  { id: "slate", name: "액션이", obj: "슬레이트" },
  { id: "headphone", name: "들림이", obj: "헤드폰" },
  { id: "news", name: "소식이", obj: "신문" },
  { id: "wifi", name: "와파니", obj: "와이파이" },
  { id: "ai", name: "에이아이", obj: "AI" },
];

export const COLORS = [
  { id: "yellow", name: "노랑", hex: "#FFD43B" },
  { id: "coral", name: "코랄", hex: "#F06A4F" },
  { id: "mint", name: "민트", hex: "#4CC795" },
  { id: "sky", name: "하늘", hex: "#4AA3E8" },
  { id: "lavender", name: "라벤더", hex: "#9468E0" },
];

// 깜짝 퀴즈 자료. 사진과 목소리가 준비되면 assets/surprise/ 에 넣고 여기에 적어 주세요. 비어 있으면 건너뜀.
// ai: "a" 또는 "b" 중 AI가 만든 쪽. 화면에서는 좌우가 무작위로 섞입니다.
export const SURPRISE = {
  image: [
    // { a: "assets/surprise/sky_real.jpg", b: "assets/surprise/sky_ai.jpg", ai: "b" },
  ],
  audio: [
    // { a: "assets/surprise/voice1_real.mp3", b: "assets/surprise/voice1_ai.mp3", ai: "b", line: "오늘 날씨가 참 좋네요" },
  ],
};
export const AI_SPOT_TIPS = [
  "AI 사진은 손가락, 글자, 너무 매끈한 배경에서 티가 나요.",
  "AI 목소리는 숨소리가 없고 억양이 너무 고를 때가 많아요.",
];

// 무인 운영: 손대지 않고 IDLE_ASK 초가 지나면 "아직 하고 있나요?" 안내, 그 뒤 IDLE_COUNT 초 세고 처음으로
export const IDLE_ASK = 20;
export const IDLE_ASK_RESULT = 40; // 결과 화면은 QR 찍을 시간을 더 줘요
export const IDLE_COUNT = 10;

// ---- 다음 계단: 부천시민미디어센터 소개 (구성안: ../plan/center-recommend.md) ----
// 표기: 단위사업명 〈세부 프로그램명〉. 일정이 바뀌면 여기만 고치면 됩니다.
export const CENTER = { name: "부천시민미디어센터", url: "https://www.bcmc.or.kr", tel: "032-320-6408",
  place: "복사골문화센터 6층", how: "홈페이지 → 미디어교육 → 교육신청 (선착순)" };

// 시민 눈높이 분류 (단계 아님, 추천 카드 머리말)
export const KINDS = {
  friend: "📱 미디어와 친해지기",
  make:   "🎬 미디어로 만들고 표현하기",
  share:  "🤝 미디어로 창작하고 소통하기",
  space:  "🏠 미디어센터 공간 누리기",
};
// 공간 (시민 말로)
export const SPACES = {
  studio: { name: "모두의 작업실", say: "노트북 하나 들고 와서 카페처럼 편하게 머물며 작업해요." },
  lounge: { name: "미디어 사랑방", say: "좋아하는 것이 같은 사람들과 모여 이야기 나눠요." },
  video:  { name: "비디오 감상실", say: "추억의 명작 8,400여 편을 골라 보는 나만의 극장이에요." },
};
// 세부 프로그램 (추천 박스와 아래 목록에서 같이 써요)
export const PROGRAMS = {
  vlog:     { icon: "📱", tag: "폰으로 내 하루 기록", name: "스마트폰 하나로 시작하는 나의 첫 일상 기록, 브이로그", short: "스마트폰 브이로그",
              say: "스마트폰 하나로 내 하루를 영상에 담아 봐요.", when: "11.19~11.20 · 2회 · 1만원" },
  ad29:     { icon: "📺", tag: "AI로 짧은 광고 완성", name: "AI로 29초 광고 만들기", short: "AI로 29초 광고 만들기",
              say: "AI로 그림과 영상을 만들어 짧은 광고를 완성해요.", when: "11.18~12.4 수·금 · 6회 · 3만원" },
  shorts:   { icon: "🎬", tag: "AI로 1분 드라마", name: "생성형 AI로 유튜브 쇼츠 드라마 만들기", short: "AI 쇼츠 드라마 만들기",
              say: "AI로 장면을 만들어 1분짜리 드라마를 완성해요.", when: "11.24~12.9 화·수 · 6회 · 3만원" },
  claude:   { icon: "🤖", tag: "나만의 AI 프로젝트", name: "클로드 마스터클래스", short: "클로드 마스터클래스",
              say: "AI 도구로 나만의 프로젝트를 처음부터 끝까지 만들어요.", when: "11.9~11.30 매주 월 · 4회 · 2만원" },
  wed:      { icon: "🎞️", tag: "수요일마다 영화 한 편", name: "수요시네마", short: "수요시네마", say: "수요일마다 센터에서 좋은 영화 한 편을 함께 봐요." },
  bsg:      { icon: "📼", tag: "1·2인실 DVD 감상", name: "복사골비디오", short: "복사골비디오", say: "1·2인실에서 명작 DVD 8,400여 편을 골라 편하게 봐요." },
  campaign: { icon: "📢", tag: "내 일상을 캠페인으로", name: "나의 하루에서 시작하는 시민캠페인 기획", short: "시민캠페인 기획",
              say: "내 일상의 불편을 모두를 위한 캠페인으로 바꿔 봐요.", when: "12.1~12.3 · 3회 · 무료" },
  jjam:     { icon: "🎨", tag: "동네 이야기를 짧은 영화로", name: "우리동네 잠깐영화 창작소", short: "우리동네 잠깐영화",
              say: "손그림, 스마트폰, AI로 동네 이야기를 짧은 영화로 만들어요.", when: "2027.1.5~1.19 화·목 · 5회 · 무료" },
};
const SPACE_LOOK = { studio: ["💻", "카페처럼 편하게 작업"], lounge: ["☕", "취향 맞는 사람들과 수다"], video: ["🍿", "명작 8,400여 편 골라 보기"] };
for (const [k, sp] of Object.entries(SPACES)) PROGRAMS[k] = { name: sp.name, short: sp.name, say: sp.say, icon: SPACE_LOOK[k][0], tag: SPACE_LOOK[k][1] };

// 아래쪽 "센터에서는 이런 걸 해요" 목록. items 가 있으면 세부 이름, 없으면 desc 한 줄
export const CATALOG = [
  { kind: "friend", groups: [
    { biz: "시민미디어교육", items: ["vlog", "ad29", "shorts", "claude"] },
    { biz: "상영사업", items: ["wed", "bsg"] },
  ] },
  { kind: "make", groups: [
    { biz: "시민크리에이터 과정", desc: "숏폼 · 캠페인 · 잠깐영화" },
    { biz: "미디어동아리", desc: "5명이 모이면 공간·장비 지원" },
  ] },
  { kind: "share", groups: [
    { biz: "시민미디어활동지원", desc: "시민 콘텐츠 제작비 지원" },
    { biz: "부천 필름메이커스", desc: "부천 소재 영상 제작 지원" },
    { biz: "장비지원", desc: "전문 장비 지원" },
  ] },
  { kind: "space", groups: [
    { biz: "", items: ["studio", "lounge", "video"] },
  ] },
];

// 미디어동아리는 미디어 사랑방과 같이 추천
const CLUB_SAY = "5명이 모이면 공간·장비 지원";
// 높이별 추천 박스 2개 (LEVELS 순서와 같음). biz 는 CATALOG 의 biz 와 같게, 공간은 biz ""
export const CENTER_REC = [
  [ { kind: "friend", biz: "시민미디어교육", items: ["vlog", "ad29"] },
    { kind: "friend", biz: "상영사업", items: ["wed", "bsg"] } ],
  [ { kind: "friend", biz: "시민미디어교육", items: ["ad29", "shorts"] },
    { kind: "friend", biz: "상영사업", items: ["wed", "bsg"] } ],
  [ { kind: "friend", biz: "시민미디어교육", items: ["shorts", "claude"] },
    { kind: "make", biz: "미디어동아리", say: CLUB_SAY, items: ["lounge"] } ],
  [ { kind: "make", biz: "시민크리에이터 과정", items: ["campaign", "jjam"] },
    { kind: "make", biz: "미디어동아리", say: CLUB_SAY, items: ["lounge"] } ],
  [ { kind: "share", biz: "시민미디어활동지원", say: "내가 만든 콘텐츠에 제작비 지원" },
    { kind: "space", biz: "", items: ["studio"] } ],
];
export const recOf = h => CENTER_REC[LEVELS.indexOf(levelOf(h))];
// 화면에 그리기 좋게 풀어 둔 것
const BIZ_ICON = { "미디어동아리": "👥", "시민미디어활동지원": "🎙️" };
export const recBoxes = h => recOf(h).map(b => ({ kind: b.kind, title: b.biz || "미디어센터 공간", say: b.say || "",
  icon: BIZ_ICON[b.biz] || "", items: (b.items || []).map(k => PROGRAMS[k]) }));
export const catalogOf = h => {
  const rec = recOf(h);
  return CATALOG.map(c => ({ kind: c.kind, groups: c.groups.map(g => {
    const box = rec.find(b => b.kind === c.kind && b.biz === g.biz) || (c.kind === "space" ? rec.find(b => b.kind === "space") : null)
      || rec.find(b => b.biz && b.biz === g.biz);
    return { biz: g.biz, desc: g.desc || "", on: !!box && !g.items,
      items: (g.items || []).map(k => ({ label: PROGRAMS[k].short,
        on: rec.some(b => b.items?.includes(k) && (b.biz === g.biz || c.kind === "space")) })) };
  }) }));
};

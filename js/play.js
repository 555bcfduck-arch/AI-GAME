import { recBoxes, catalogOf, KINDS, STEPS, WALLS, WALL_BY_CODE, SURPRISE, SURPRISE_AFTER, AI_SPOT_TIPS, levelOf, mainWall, NO_WALL_TIP,
  CHARACTERS, COLORS, IDLE_ASK, IDLE_ASK_RESULT, IDLE_COUNT } from "./data.js";
import { charEl, charSrc, charName } from "./chars.js";
import { drawStairs, standAt } from "./stairs.js";
import { sfx, unlock } from "./sound.js";
import * as store from "./store.js";

const $ = id => document.getElementById(id);
const wait = ms => new Promise(r => setTimeout(r, ms));
const md = t => t.replace(/\*\*(.+?)\*\*/gs, "<mark>$1</mark>").replace(/\n/g, "<br>");

store.init().catch(() => {});
$("mode").textContent = store.online ? "" : "연습 모드 (이 기기에서만 저장)";
document.addEventListener("contextmenu", e => e.preventDefault());

let screen = "s-start";
function show(id) {
  screen = id;
  document.querySelectorAll(".screen").forEach(s => s.classList.toggle("on", s.id === id));
  poke();
}

// ---- 무인 운영: 손대지 않으면 안내 → 10초 세고 처음으로 ----
let lastTouch = Date.now(), asking = false;
function poke() { lastTouch = Date.now(); if (asking) { asking = false; $("idle").classList.remove("on"); } }
document.addEventListener("pointerdown", poke, true);
setInterval(() => {
  if (screen === "s-start") return;
  const ask = (screen === "s-result" || screen === "s-center" ? IDLE_ASK_RESULT : IDLE_ASK) * 1000;
  const idle = Date.now() - lastTouch;
  if (idle < ask) return;
  const left = IDLE_COUNT - Math.floor((idle - ask) / 1000);
  if (left <= 0) { asking = false; $("idle").classList.remove("on"); goHome(); return; }
  if (!asking) { asking = true; $("idle").classList.add("on"); sfx.ding(); }
  $("idle-num").textContent = left;
}, 250);
$("btn-stay").onclick = () => { sfx.tap(); poke(); };

// ---- 시작 화면: 무지개 계단에 미디어 친구들 ----
function drawHero() {
  const el = $("hero");
  el.querySelectorAll(".char").forEach(c => c.remove());
  const G = drawStairs(el, [], "hero", { topRoom: 70, base: 0.05 });
  CHARACTERS.forEach((c, i) => {
    const img = charEl(c.id, COLORS[i % COLORS.length].id);
    img.style.animation = `bob 1.4s ${(i % 4) * .3}s ease-in-out infinite`;
    el.appendChild(img);
    const place = () => standAt(img, G, i, { height: Math.min(64, G.cw * 0.95) });
    img.complete ? place() : (img.onload = place);
  });
}
// 사람이 없을 때도 시작 화면 계단에 불이 하나씩 켜져요
let wave = 0;
setInterval(() => {
  if (screen !== "s-start") return;
  const c = $("hero").querySelector(`g.col[data-i="${wave % 10}"]`);
  if (c) { c.classList.remove("flash"); void c.getBoundingClientRect(); c.classList.add("flash"); }
  wave = (wave + 1) % 14;
}, 260);
function goHome() { show("s-start"); drawHero(); }
drawHero();

$("btn-start").onclick = () => { unlock(); sfx.tap(); pick.char = null; renderPick(); show("s-pick"); };

// ---- 캐릭터 고르기 ----
const pick = { char: null, color: COLORS[0].id };
function renderPick() {
  const g = $("pick-grid"); g.innerHTML = "";
  CHARACTERS.forEach(c => {
    const b = document.createElement("button");
    b.className = pick.char === c.id ? "sel" : "";
    b.appendChild(charEl(c.id, pick.color));
    b.insertAdjacentHTML("beforeend", `<span>${c.name}</span>`);
    b.onclick = () => { pick.char === c.id || sfx.pick(); pick.char = c.id; renderPick(); };
    g.appendChild(b);
  });
  const cs = $("colors"); cs.innerHTML = "<span>색깔</span>";
  COLORS.forEach(c => {
    const b = document.createElement("button");
    b.style.background = c.hex; b.title = c.name; b.className = pick.color === c.id ? "sel" : "";
    b.onclick = () => { sfx.tap(); pick.color = c.id; renderPick(); };
    cs.appendChild(b);
  });
  $("btn-go").disabled = !pick.char;
}
$("btn-go").onclick = () => { if (pick.char) { sfx.pop(); startPlay(); } };

// ---- 계단 오르기 ----
let steps, cur, quizR, quizT, hero, G, busy = false, usedPairs = [];

function stageState() { return steps.map((v, i) => v || (i === cur ? "now" : "")); }
function charHeight() { return Math.max(46, Math.min(112, G.cw * 1.5)); }
function renderStage(hop = false, at = cur) {
  const el = $("stage");
  const cw = (el.clientWidth - 8) / 10.55, ch = Math.max(46, Math.min(112, cw * 1.5));
  G = drawStairs(el, stageState(), "play", { topRoom: ch + 20 });
  if (hero) standAt(hero, G, at, { height: charHeight(), hop });
}
addEventListener("resize", () => {
  if (screen === "s-play") renderStage();
  if (screen === "s-start") drawHero();
  if (screen === "s-result") drawMini();
});

function renderPips() {
  $("pips").innerHTML = steps.map((v, i) => `<i class="${v === "ok" ? "ok" : v ? "no" : i === cur ? "now" : ""}"></i>`).join("");
}

async function startPlay() {
  steps = Array(STEPS.length).fill(""); usedPairs = []; cur = 0; quizR = 0; quizT = 0; busy = false;
  show("s-play");
  hero?.remove();
  hero = charEl(pick.char, pick.color);
  $("stage").appendChild(hero);
  await new Promise(r => hero.complete ? r() : (hero.onload = r));
  delete hero.dataset.left;
  renderStage(false, -1); renderPips(); setGlow();
  renderQuestion();
  await wait(350); sfx.hop(); renderStage(true);
}

function bubble(text, ms = 1300) {
  const b = $("bubble"), r = hero.getBoundingClientRect(), s = $("stage").getBoundingClientRect();
  b.textContent = text;
  b.style.left = (r.left - s.left + r.width / 2) + "px";
  b.style.top = (r.top - s.top - 8) + "px";
  b.classList.add("show");
  clearTimeout(bubble.t); bubble.t = setTimeout(() => b.classList.remove("show"), ms);
}
// 불 켜기: 칸이 번쩍 밝아지고 빛줄기가 퍼져요
function lightUp(el, g, i) {
  el.querySelectorAll(`[data-i="${i}"]`).forEach(n => n.classList.add("flash"));
  const p = g.pos[i], r = document.createElement("div");
  r.className = "rays"; r.style.left = p.x + "px"; r.style.top = p.y + "px";
  el.appendChild(r); setTimeout(() => r.remove(), 950);
}
function setGlow() { $("stage").style.setProperty("--lit", steps.filter(v => v === "ok").length); }
function sparkle(i) {
  const p = G.pos[i];
  ["✨", "⭐", "✨"].forEach((e, k) => {
    const s = document.createElement("div");
    s.className = "burst"; s.textContent = e;
    s.style.left = p.x + "px"; s.style.top = (p.y - 10) + "px"; s.style.setProperty("--dx", `${(k - 1) * 46}px`);
    $("stage").appendChild(s); setTimeout(() => s.remove(), 900);
  });
}

async function swapCard(html, how = "flip") {
  const c = $("card");
  if (c.innerHTML) { c.classList.add(how === "flip" ? "flip-out" : "slide-out"); sfx.flip(); await wait(how === "flip" ? 260 : 200); }
  c.className = "card"; c.innerHTML = html; void c.offsetWidth; c.classList.add("flip-in");
  return c;
}

async function renderQuestion(how = "slide") {
  const st = STEPS[cur];
  const c = await swapCard(`<span class="eyebrow">${cur + 1}번째 계단</span>
    <div class="qq">${md(st.q)}</div><p class="ex">${st.ex}</p>
    <button class="ans yes" id="a-yes">✅ 해봤어요 <small>불이 켜져요</small></button>
    <button class="ans" id="a-no">🧱 아직 안 해봤어요</button>`, how);
  c.querySelector("#a-yes").onclick = e => yes(e.currentTarget);
  c.querySelector("#a-no").onclick = () => { if (!busy) { sfx.tap(); renderReasons(); } };
}

async function renderReasons() {
  const st = STEPS[cur];
  const c = await swapCard(`<span class="eyebrow" style="background:var(--brick)">🧱 왜 안 해봤나요?</span>
    <div class="qq" style="font-size:clamp(23px,2.6vw,30px)">가장 가까운 이유를<br>하나 골라 주세요</div><div id="rs" style="margin-top:14px"></div>
    <button class="back" id="back">← 다시 고를래요</button>`);
  st.reasons.forEach(([w, text]) => {
    const W = WALLS[w], b = document.createElement("button");
    b.className = "reason";
    b.innerHTML = `<span>${W.emoji}</span><span>${text}</span><span class="w" style="background:${W.color}">${W.name}</span>`;
    b.onclick = () => no(w, b);
    c.querySelector("#rs").appendChild(b);
  });
  c.querySelector("#back").onclick = () => { sfx.tap(); renderQuestion("flip"); };
}

async function yes(btn) {
  if (busy) return; busy = true;
  btn.classList.add("picked");
  steps[cur] = "ok"; store.recordAnswer(cur, "o").catch(() => {});
  const share = store.doneShare(cur);
  renderStage(); renderPips(); lightUp($("stage"), G, cur); sparkle(cur); setGlow(); sfx.ding();
  bubble(share === null ? "반짝! 불이 켜졌어요" : `오늘 시민 ${share}%도 해봤어요`);
  await wait(1000); next();
}

async function no(w, btn) {
  if (busy) return; busy = true;
  btn.classList.add("picked");
  const W = WALLS[w];
  steps[cur] = W.code; store.recordAnswer(cur, W.code).catch(() => {});
  renderStage(); renderPips(); sfx.thud();
  $("stage").classList.remove("shake"); void $("stage").offsetWidth; $("stage").classList.add("shake");
  bubble(`쿵! ${W.emoji} ${W.name}`);
  await wait(1000); next();
}

async function next() {
  const kind = SURPRISE_AFTER[cur];
  if (kind && SURPRISE[kind].length && !next.done?.[cur]) {
    next.done = { ...(next.done || {}), [cur]: true };
    busy = false; return renderSurprise(kind);
  }
  next.done = null;
  cur++;
  if (cur >= STEPS.length) { busy = false; return finish(); }
  renderPips(); renderStage(true); sfx.hop();
  await renderQuestion();
  busy = false;
}

// ---- 깜짝 퀴즈 ----
async function renderSurprise(kind) {
  // 한 판에서 같은 사진 짝이 두 번 나오지 않게
  const fresh = SURPRISE[kind].filter(x => !usedPairs.includes(x)), list = fresh.length ? fresh : SURPRISE[kind];
  const pair = list[Math.floor(Math.random() * list.length)], flip = Math.random() < .5;
  usedPairs.push(pair);
  const L = flip ? "b" : "a", R = flip ? "a" : "b", isAudio = kind === "audio";
  const c = await swapCard(`<span class="eyebrow" style="background:var(--lav)">🎁 쉬어 가는 깜짝 퀴즈</span>
    <div class="qq">${isAudio ? "두 목소리 중<br><mark>AI 목소리</mark>는 어느 쪽?" : "두 사진 중<br><mark>AI가 만든 사진</mark>은 어느 쪽?"}</div>
    ${isAudio && pair.line ? `<p class="ex">"${pair.line}"</p>` : `<p class="ex"></p>`}<div class="pair"></div>`);
  const box = c.querySelector(".pair"), audios = [];
  [[L, "왼쪽"], [R, "오른쪽"]].forEach(([k, lab]) => {
    const b = document.createElement("button"); b.dataset.k = k;
    if (isAudio) {
      const au = new Audio(pair[k]); audios.push(au); let heard = false;
      b.innerHTML = `<div class="play"><div style="font-size:50px">🔊</div><div>${lab} 듣기</div><div style="font-size:15px;font-family:'Gowun Dodum'">한 번 더 누르면 선택</div></div>`;
      b.onclick = () => {
        audios.forEach(a => a.pause());
        if (!heard) { au.currentTime = 0; au.play().catch(() => {}); heard = true; return; }
        guess(k);
      };
    } else {
      b.innerHTML = `<img src="${pair[k]}" alt=""><span class="lab">${lab}</span>`;
      b.onclick = () => guess(k);
    }
    box.appendChild(b);
  });
  async function guess(k) {
    if (busy) return; busy = true; quizT++;
    const ok = k === pair.ai;
    if (ok) { quizR++; sfx.right(); } else sfx.wrong();
    box.querySelectorAll("button").forEach(el => el.classList.add(el.dataset.k === pair.ai ? "ok" : "no"));
    bubble(ok ? "정답! AI를 알아봤어요 👀" : "앗, 반대쪽이 AI였어요!", 1600);
    await wait(1700); next();
  }
}

// ---- 결과 ----
let sentKey = null, miniHero = null, best = -1;
async function finish() {
  $("drum-char").src = charSrc(pick.char, pick.color);
  show("s-drum"); sfx.drum();
  await wait(1500);
  const s = steps.map(v => v === "ok" ? "o" : v).join("");
  const h = [...s].filter(c => c === "o").length, L = levelOf(h), mw = mainWall(s);
  best = s.lastIndexOf("o");
  $("r-with").textContent = `${charName(pick.char)}와 함께 오른 나는`;
  $("r-lvl").textContent = `${L.emoji} ${L.name}`;
  $("r-desc").textContent = L.desc;
  $("r-height").innerHTML = `10계단 중 <b>${h}계단</b>에 불을 켰어요 ✨`;
  if (mw) {
    const W = WALLS[mw.key];
    $("r-wall").innerHTML = `<div class="label">나를 막는 벽</div><div class="chip" style="background:${W.color}">${W.emoji} ${W.name} <small>×${mw.count}</small></div>`;
    $("r-tip").innerHTML = `💡 <b>벽 넘기 한 가지</b><br>${W.tip}`;
  } else {
    $("r-wall").innerHTML = `<div class="chip" style="background:var(--y)">🏆 막힌 벽이 하나도 없어요</div>`;
    $("r-tip").innerHTML = `💡 ${NO_WALL_TIP}`;
  }
  renderCenter(h, L);
  $("r-quiz").textContent = quizT ? `깜짝 퀴즈 ${quizT}개 중 ${quizR}개 정답! ${AI_SPOT_TIPS[quizR % AI_SPOT_TIPS.length]}` : "";
  show("s-result"); sfx.fanfare();
  drawMini(true);

  // TV로 보내기 (한 판에 한 번만)
  const quiz = quizT ? `${quizR}/${quizT}` : "";
  const key = `${Date.now()}`;
  if (sentKey !== key) {
    sentKey = key;
    $("sent").textContent = "📺 TV 계단에 내 캐릭터가 올라갔어요!";
    store.addResult({ h, steps: s, wall: mw ? mw.key : "none", char: pick.char, color: pick.color, quiz })
      .catch(() => { $("sent").textContent = "인터넷이 끊겨 TV에 못 갔어요. 결과 카드는 저장할 수 있어요"; });
  }
  const url = new URL("card.html", location.href);
  url.hash = new URLSearchParams({ c: pick.char, k: pick.color, s, q: quiz }).toString();
  if (window.PREVIEW) $("qr").innerHTML = `<div class="qr-ph" style="display:flex;align-items:center;justify-content:center;border:2px dashed #1F1F1F;border-radius:10px;font-size:14px;text-align:center">미리보기<br>QR 자리</div>`;
  else { const qr = qrcode(0, "M"); qr.addData(url.toString()); qr.make(); $("qr").innerHTML = qr.createSvgTag({ cellSize: 4, margin: 2, scalable: true }); }
}

async function drawMini(animate = false) {
  const el = $("mini");
  const cw = (el.clientWidth - 8) / 10.55, ch = Math.max(44, Math.min(100, cw * 1.6));
  // upto 칸까지만 불이 켜진 계단 (결과 화면에서 하나씩 켜 보여 줘요)
  const draw = upto => drawStairs(el, steps.map((v, i) => v === "ok" && i > upto ? "" : v), "mini", { topRoom: ch + 10, base: 0.06 });
  let g = draw(animate ? -1 : 99);
  if (!miniHero || miniHero.dataset.c !== pick.char + pick.color) {
    miniHero?.remove(); miniHero = charEl(pick.char, pick.color); miniHero.dataset.c = pick.char + pick.color; el.appendChild(miniHero);
    await new Promise(r => miniHero.complete ? r() : (miniHero.onload = r));
  }
  if (animate) {
    delete miniHero.dataset.left; standAt(miniHero, g, -1, { height: ch });
    for (let i = 0; i <= best; i++) {
      if (steps[i] !== "ok") continue;
      await wait(300); g = draw(i); lightUp(el, g, i); standAt(miniHero, g, i, { height: ch, hop: true }); sfx.hop();
    }
  } else standAt(miniHero, g, best, { height: ch });
}

$("btn-again").onclick = () => { sfx.tap(); goHome(); };

// ---- 다음 계단: 부천시민미디어센터 추천 (결과 화면의 버튼으로 들어감) ----
function renderCenter(h, L) {
  $("c-char").src = charSrc(pick.char, pick.color);
  $("c-sub").textContent = `${L.emoji} ${L.name}, ${charName(pick.char)}와 함께 오른`;
  const row = (icon, name, tag) => `<div class="c-item"><span class="ic">${icon}</span><div><b>${name}</b>${tag ? `<small>${tag}</small>` : ""}</div></div>`;
  $("c-cards").innerHTML = recBoxes(h).map(b => `<div class="c-card ${b.kind}"><div class="c-kind">${KINDS[b.kind]}</div>
    <h3>${b.title}</h3>${b.say ? row(b.icon, b.say, "") : ""}
    ${b.items.map(it => row(it.icon, it.short, it.tag)).join("")}</div>`).join("");
  $("c-cols").innerHTML = catalogOf(h).map(c => `<div class="c-col ${c.kind}"><h4>${KINDS[c.kind]}</h4>${c.groups.map(g => `<div class="c-grp">
    ${g.biz && g.items.length ? `<div class="gb">${g.biz}</div>` : ""}<div class="pills">${g.items.length
      ? g.items.map(i => `<span class="pill${i.on ? " on" : ""}">${i.on ? "★ " : ""}${i.label}</span>`).join("")
      : `<span class="pill${g.on ? " on" : ""}">${g.on ? "★ " : ""}${g.biz}</span>`}</div></div>`).join("")}</div>`).join("");
}
$("btn-center").onclick = () => { sfx.pop(); show("s-center"); };
$("btn-back").onclick = () => { sfx.tap(); show("s-result"); drawMini(); };
$("btn-again2").onclick = () => { sfx.tap(); goHome(); };

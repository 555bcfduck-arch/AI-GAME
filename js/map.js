// TV 화면: 오늘 시민들이 오른 높이에 캐릭터가 서 있는 큰 계단 + 가장 많이 막은 벽 순위
import { WALLS, WALL_BY_CODE, levelOf } from "./data.js";
import { charEl, charName, charSrc } from "./chars.js";
import { drawStairs, standAt } from "./stairs.js";
import * as store from "./store.js";

const $ = id => document.getElementById(id);
const wait = ms => new Promise(r => setTimeout(r, ms));
const PER_STEP = 3; // 한 칸에 보여 줄 캐릭터 수 (최근 순)
$("mode").textContent = store.online ? "" : "연습 모드 (이 기기에서만 저장)";

// 폰 참여용 QR
const qr = qrcode(0, "M"); qr.addData(new URL("index.html", location.href).toString()); qr.make();
$("qr").innerHTML = qr.createSvgTag({ cellSize: 4, margin: 1, scalable: true });

// TV는 소리 없이 화면만 보여 줘요 (행사장 소음, 오리 결정 10/22)

// 오늘 기록만 (자정이 지나면 새로 고침)
const today = new Date(); today.setHours(0, 0, 0, 0);
setInterval(() => { if (new Date().getDate() !== today.getDate()) location.reload(); }, 60000);
const rows = [];

// ---- 오른쪽 숫자들 ----
function renderSide() {
  const n = rows.length;
  $("total").textContent = n;
  if (n) {
    const avg = rows.reduce((a, r) => a + r.h, 0) / n, top = rows.filter(r => r.h === 10).length;
    $("avg").textContent = `평균 ${avg.toFixed(1)}칸 · 🚀 끝까지 오른 사람 ${top}명`;
  }
  const cnt = Object.fromEntries(Object.keys(WALLS).map(k => [k, 0]));
  rows.forEach(r => [...(r.steps || "")].forEach(c => { const k = WALL_BY_CODE[c]; if (k) cnt[k]++; }));
  const sum = Object.values(cnt).reduce((a, b) => a + b, 0);
  const list = Object.entries(cnt).sort((a, b) => b[1] - a[1]);
  $("walls").innerHTML = list.map(([k, c], i) => {
    const W = WALLS[k], p = sum ? Math.round(100 * c / sum) : 0;
    return `<div class="wrow${i ? "" : " first"}"><span>${i + 1}위 ${W.emoji} ${W.name}</span><span>${p}%</span></div>
      <div class="bar"><i style="width:${p}%;background:${W.color}"></i></div>`;
  }).join("");
}

// ---- 계단과 캐릭터 ----
let G;
function slotOf(r) { return Math.max(0, Math.min(10, r.h)) - 1; }
function charH() { return Math.max(36, Math.min(G.cw * 0.64, 96)); }
function offsets(slot, k, K) {
  if (slot < 0) return k * G.cw * 0.5;
  return (k - (K - 1) / 2) * G.cw * 0.36;
}
function renderStairs() {
  const el = $("stage");
  el.querySelectorAll(".char,.more").forEach(c => c.remove());
  const cw = (el.clientWidth - 8) / 10.55;
  G = drawStairs(el, [], "tv", { topRoom: Math.min(cw * 0.78, 110) + 20, base: 0.12 });
  for (let s = -1; s < 10; s++) {
    const here = rows.filter(r => slotOf(r) === s), show = here.slice(-PER_STEP);
    show.forEach((r, k) => {
      const img = charEl(r.char, r.color);
      img.style.zIndex = 2 + k;
      el.appendChild(img);
      const place = () => standAt(img, G, s, { height: charH(), offset: offsets(s, k, show.length) });
      img.complete ? place() : (img.onload = place);
      r._img = img;
    });
    if (here.length && s >= 0) {
      const m = document.createElement("div"); m.className = "more";
      m.textContent = `${here.length}명`;
      m.style.left = (G.cols[s].x0 + G.cw / 2) + "px"; m.style.top = (G.cols[s].yt + 4) + "px";
      el.appendChild(m);
    }
  }
}
addEventListener("resize", () => renderStairs());

// ---- 새 캐릭터 도착 연출 ----
const queue = []; let busy = false;
async function arrive(r) {
  busy = true;
  const L = levelOf(r.h);
  $("arrive-char").src = charSrc(r.char, r.color);
  $("arrive-txt").innerHTML = `방금 도착! ${charName(r.char)}<small>${L.emoji} ${L.name} · ${r.h}칸</small>`;
  $("arrive").classList.add("show");
  await wait(2300);
  $("arrive").classList.remove("show");
  await wait(300);
  // 바닥에서부터 한 칸씩 폴짝
  const el = $("stage"), img = charEl(r.char, r.color);
  img.style.zIndex = 9; el.appendChild(img);
  await new Promise(res => img.complete ? res() : (img.onload = res));
  standAt(img, G, -1, { height: charH() });
  for (let s = 0; s <= slotOf(r); s++) { await wait(240); standAt(img, G, s, { height: charH(), hop: true }); }
  await wait(600);
  img.remove(); rows.push(r); renderStairs(); renderSide();
  const p = slotOf(r) < 0 ? G.floor : G.pos[slotOf(r)], b = $("bubble");
  b.textContent = `✨ ${charName(r.char)} · ${r.h}칸`;
  b.style.left = (r._img ? parseFloat(r._img.style.left) + parseFloat(r._img.style.width) / 2 : p.x) + "px";
  b.style.top = (p.y - charH() - 6) + "px";
  b.classList.add("show"); setTimeout(() => b.classList.remove("show"), 2600);
  await wait(900);
  busy = false;
  if (queue.length) arrive(queue.shift());
}

renderStairs(); renderSide();
let settle = null;
const seen = new Set();
store.onResult((r, old) => {
  const key = `${r && r.t}|${r && r.char}|${r && r.steps}`;
  if (seen.has(key)) return; seen.add(key);
  if (!r || !r.char || typeof r.h !== "number" || (r.t && r.t < today.getTime())) return;
  if (old) { rows.push(r); clearTimeout(settle); settle = setTimeout(() => { renderStairs(); renderSide(); }, 80); return; }
  if (busy) { if (queue.length >= 4) { rows.push(r); renderStairs(); renderSide(); } else queue.push(r); }
  else arrive(r);
});

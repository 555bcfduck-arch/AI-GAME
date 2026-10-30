// 입체 계단 그리기 (SVG). 태블릿 게임, 결과 화면, TV, 결과 카드가 같이 씁니다.
// state[i]: "" 아직 / "now" 지금 칸 / "ok" 해봤어요 / 벽 코드 "1"~"5" 안 해봤어요
import { STEPS, WALLS, WALL_BY_CODE } from "./data.js";

const INK = "#1F1F1F";
export const PASTEL = ["#FFE88A", "#FFD9A8", "#FFC9C0", "#F9C6E0", "#E3D3FF", "#CFE0FF", "#C6EEFF", "#C9F2E2", "#DDF5C2", "#FFF0A0"];

export function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const m = v => Math.max(0, Math.min(255, Math.round(f < 0 ? v * (1 + f) : v + (255 - v) * f)));
  return `rgb(${m(r)},${m(g)},${m(b)})`;
}

// 계단 모양 계산. W×H 상자 안에 10칸, topRoom 은 맨 윗칸 위로 남길 공간(캐릭터 자리)
export function geometry(W, H, { topRoom = 120, base = 0.08 } = {}) {
  const n = STEPS.length;
  const cw = (W - 8) / (n + 0.55), dx = cw * 0.55, dy = cw * 0.36, ground = H - 4;
  const b = Math.max(cw * 0.5, H * base);
  const step = Math.max(4, (H - b - dy - topRoom) / n);
  const cols = [], pos = [];
  for (let i = 0; i < n; i++) {
    const x0 = dx + i * cw, h = b + step * (i + 1), yt = ground - h;
    cols.push({ x0, x1: x0 + cw, h, yt });
    pos.push({ x: x0 + cw / 2 - dx / 2, y: yt - dy / 2 });
  }
  // 0칸(아직 한 칸도 못 오름): 1칸 앞 바닥
  const floor = { x: Math.max(cw * 0.35, dx * 0.4), y: ground - dy * 0.15 };
  return { n, cw, dx, dy, ground, cols, pos, floor, W, H };
}

let uid = 0;
// mode: "play" | "tv" | "mini" | "hero"
export function stairsSVG(G, state = [], mode = "play") {
  const { cw, dx, dy, ground, cols, W } = G, id = "b" + (uid++);
  const bw = Math.max(10, cw * 0.3), bh = bw * 0.62, sw = mode === "mini" ? 2 : Math.max(2.4, Math.min(3.4, cw / 30));
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${G.H}" viewBox="0 0 ${W} ${G.H}" style="overflow:visible">
  <defs><pattern id="${id}" width="${bw}" height="${bh}" patternUnits="userSpaceOnUse">
    <rect width="${bw}" height="${bh}" fill="#F7C3AE"/>
    <path d="M0 ${bh - .6}H${bw}M${bw / 2} 0V${bh / 2}M0 ${bh / 2}H${bw}M0 ${bh / 2}V${bh}M${bw} ${bh / 2}V${bh}" stroke="${INK}" stroke-width="${sw * .7}" fill="none"/>
  </pattern>
  <linearGradient id="${id}l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF6C2"/><stop offset=".55" stop-color="#FFE066"/><stop offset="1" stop-color="#FFD43B"/></linearGradient>
  <radialGradient id="${id}h"><stop offset="0" stop-color="#FFF3A0" stop-opacity=".95"/><stop offset=".5" stop-color="#FFE066" stop-opacity=".45"/><stop offset="1" stop-color="#FFE066" stop-opacity="0"/></radialGradient></defs>
  <polygon points="${dx - 4},${ground} ${W + 4},${ground} ${W - dx + 6},${ground - dy} ${-4},${ground - dy}" fill="#EBDDB8"/>`;
  const st = `stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round"`;
  const parts = cols.map(({ x0, x1, h, yt }, i) => {
    const v = state[i] || "", wall = WALLS[WALL_BY_CODE[v]];
    let front = mode === "tv" || mode === "hero" ? PASTEL[i] : "#ECE8F0"; // 아직 불 꺼진 칸은 살짝 어둡게
    const lit = v === "ok" && mode !== "tv";
    if (v === "ok") front = "#FFD43B";
    if (v === "now") front = "#9AD6FF";
    const top = wall ? "#E8957A" : lit ? "#FFF8D6" : shade(front, 0.45), side = wall ? "#C9705A" : shade(front, -0.18);
    const mid = x0 + cw / 2;
    let g = `<g class="col${v === "now" ? " now" : ""}${lit ? " lit" : ""}" data-i="${i}">`;
    g += `<polygon points="${x0},${yt} ${x0 - dx},${yt - dy} ${x0 - dx},${ground - dy} ${x0},${ground}" fill="${side}" ${st}/>`;
    g += `<rect x="${x0}" y="${yt}" width="${cw}" height="${h}" fill="${wall ? `url(#${id})` : lit ? `url(#${id}l)` : front}" ${st}/>`;
    g += `<polygon points="${x0},${yt} ${x1},${yt} ${x1 - dx},${yt - dy} ${x0 - dx},${yt - dy}" fill="${top}" ${st}/>`;
    if (wall && mode !== "tv") {
      const r = Math.min(cw * 0.34, 22);
      g += `<circle cx="${mid}" cy="${yt + r + 6}" r="${r}" fill="#fff" ${st}/><text x="${mid}" y="${yt + r + 6}" dy=".36em" text-anchor="middle" font-size="${r * 1.05}">${wall.emoji}</text>`;
    } else if (mode === "tv") {
      const fs = Math.min(cw * 0.17, 22);
      g += `<text x="${mid}" y="${yt + fs * 2}" text-anchor="middle" font-size="${fs * 1.3}">${STEPS[i].icon}</text>`;
      STEPS[i].short.split("\n").forEach((t, k) => g += `<text x="${mid}" y="${yt + fs * 3.6 + k * fs * 1.2}" text-anchor="middle" font-family="Jua, sans-serif" font-size="${fs}" fill="${INK}">${t}</text>`);
    } else if (mode === "play" && h > cw * 0.9) {
      const fs = Math.min(cw * 0.36, 24);
      g += `<text x="${mid}" y="${yt + fs * 1.5}" text-anchor="middle" font-size="${fs}">${STEPS[i].icon}</text>`;
    }
    if (mode !== "hero" && (mode !== "mini" || cw > 26)) {
      const bw2 = Math.min(cw * 0.56, 32), bh2 = bw2 * 0.78, fs = bh2 * 0.66;
      g += `<rect x="${mid - bw2 / 2}" y="${ground - bh2 - 8}" width="${bw2}" height="${bh2}" rx="${bh2 / 3}" fill="#fff" stroke="${INK}" stroke-width="${sw * .7}"/>`;
      g += `<text x="${mid}" y="${ground - 8 - bh2 / 2}" dy=".35em" text-anchor="middle" font-family="Jua, sans-serif" font-size="${fs}" fill="${INK}">${i + 1}</text>`;
    }
    return g + "</g>";
  });
  // 앞(왼쪽 아래) 칸이 뒤 칸의 옆면을 가리도록 뒤에서부터 그림
  s += parts.reverse().join("");
  // 불 켠 칸 위로 번지는 빛
  cols.forEach(({ x0, yt }, i) => {
    if (state[i] !== "ok" || mode === "tv") return;
    s += `<ellipse class="halo" data-i="${i}" cx="${x0 + cw / 2 - dx / 2}" cy="${yt - dy / 2}" rx="${cw * 0.95}" ry="${cw * 0.7}" fill="url(#${id}h)" pointer-events="none"/>`;
  });
  // 맨 윗칸 깃발
  const c = cols[cols.length - 1], fx = c.x1 - dx * 0.75, fy = c.yt - dy * 0.75, fh = Math.max(24, cw * 0.7);
  s += `<path d="M${fx} ${fy}V${fy - fh}" ${st} fill="none"/><path d="M${fx} ${fy - fh}l${fh * .55} ${fh * .18}l${-fh * .55} ${fh * .18}z" fill="#FF8A7A" ${st}/>`;
  return s + "</svg>";
}

// el 안에 계단을 그리고 계산 값을 돌려줌. 캐릭터 같은 다른 자식은 그대로 둠
export function drawStairs(el, state, mode, opts) {
  const G = geometry(el.clientWidth, el.clientHeight, opts);
  let holder = el.querySelector(":scope > .stairs-svg");
  if (!holder) { holder = document.createElement("div"); holder.className = "stairs-svg"; el.prepend(holder); }
  holder.innerHTML = stairsSVG(G, state, mode);
  return G;
}

// 캐릭터를 칸 위에 세우기. at = -1 이면 바닥, hop 이면 폴짝 뛰어서 이동
export function standAt(img, G, at, { height, offset = 0, hop = false } = {}) {
  const p = at < 0 ? G.floor : G.pos[at];
  const ratio = img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : 1.1;
  const w = height * ratio;
  const left = p.x - w / 2 + offset, top = p.y - height + height * 0.08;
  const prev = img.dataset.left ? [+img.dataset.left, +img.dataset.top] : null;
  Object.assign(img.style, { position: "absolute", left: left + "px", top: top + "px", height: height + "px", width: w + "px" });
  img.dataset.left = left; img.dataset.top = top;
  if (hop && prev && img.animate) {
    const ddx = prev[0] - left, ddy = prev[1] - top, lift = Math.max(40, height * 0.6);
    img.animate([
      { transform: `translate(${ddx}px,${ddy}px)` },
      { transform: `translate(${ddx / 2}px,${Math.min(ddy, 0) / 2 - lift}px) scale(1.05,.95)`, offset: .45 },
      { transform: "translate(0,0) scale(1.08,.9)", offset: .85 },
      { transform: "none" },
    ], { duration: 520, easing: "ease-out" });
  }
}

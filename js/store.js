// 결과 저장소. firebase-config.js 에 설정이 있으면 Firebase(모든 기기 공유),
// 없으면 이 브라우저 안에서만 동작하는 연습 모드입니다.

const cfg = window.FIREBASE_CONFIG;
export const online = !!(cfg && cfg.apiKey && cfg.databaseURL);

let fb = null, db = null;
let stats = {};
const statListeners = [];

async function ensure() {
  if (!online || db) return;
  fb = await import("./firebase-bundle.js");
  db = fb.getDatabase(fb.initializeApp(cfg));
  fb.onValue(fb.ref(db, "stats"), snap => {
    stats = snap.val() || {};
    statListeners.forEach(f => f(stats));
  });
}

// ---- 연습 모드 (같은 브라우저의 다른 탭끼리만 공유) ----
const LKEY = "aistairs.results", SKEY = "aistairs.stats";
const chan = ("BroadcastChannel" in window) ? new BroadcastChannel("aistairs") : null;
function lget(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } }
function lset(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
if (!online) stats = lget(SKEY, {});

export async function init() { await ensure(); }

export async function addResult(r) {
  const row = { ...r, t: Date.now() };
  if (online) { await ensure(); await fb.push(fb.ref(db, "results"), { ...row, t: fb.serverTimestamp() }); return; }
  const all = lget(LKEY, []); all.push(row); lset(LKEY, all.slice(-500));
  chan && chan.postMessage({ kind: "result", row });
}

export async function onResult(cb, last = 1500) {
  if (online) {
    await ensure();
    // 화면을 열기 전에 쌓인 기록은 조용히 배치(old=true), 그 뒤 들어오는 것만 도착 연출
    const start = Date.now() - 5000;
    fb.onChildAdded(fb.query(fb.ref(db, "results"), fb.limitToLast(last)), s => { const v = s.val(); cb(v, (v && v.t) < start); });
    return;
  }
  lget(LKEY, []).slice(-last).forEach(r => cb(r, true));
  chan && chan.addEventListener("message", e => e.data.kind === "result" && cb(e.data.row, false));
  if (!chan) window.addEventListener("storage", e => {
    if (e.key === LKEY) { const all = lget(LKEY, []); all.length && cb(all[all.length - 1], false); }
  });
}

// 칸별 답 통계: "오늘 시민 63%도 해봤어요". key 는 "o"(해봤어요) 또는 벽 코드 "1"~"5"
export async function recordAnswer(step, key) {
  const q = `q${step}`, k = `s${key}`;
  if (online) {
    await ensure();
    fb.runTransaction(fb.ref(db, `stats/${q}/${k}`), v => (v || 0) + 1).catch(() => {});
    return;
  }
  stats[q] = stats[q] || {}; stats[q][k] = (stats[q][k] || 0) + 1; lset(SKEY, stats);
}

// 이 칸을 "해봤어요" 한 사람 비율(%). 자료가 너무 적으면 null
export function doneShare(step) {
  const row = stats[`q${step}`] || {};
  const total = Object.values(row).reduce((a, b) => a + b, 0);
  if (total < 5) return null;
  return Math.round(100 * (row.so || 0) / total);
}

export function onStats(f) { statListeners.push(f); }

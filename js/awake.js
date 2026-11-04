// 화면 꺼짐 막기: 이 페이지가 열려 있는 동안 태블릿·노트북 화면이 자동으로 꺼지지 않게 해요.
// (지원 안 하는 브라우저에서는 그냥 아무 일도 안 해요)
let lock = null;
async function keep() {
  if (!("wakeLock" in navigator) || document.visibilityState !== "visible" || lock) return;
  try {
    lock = await navigator.wakeLock.request("screen");
    lock.addEventListener("release", () => { lock = null; });
  } catch { lock = null; }
}
keep();
document.addEventListener("visibilitychange", keep);
["pointerdown", "keydown"].forEach(t => document.addEventListener(t, keep, { passive: true }));
setInterval(keep, 60000);

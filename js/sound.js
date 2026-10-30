// 효과음: 파일 없이 코드로 직접 만드는 짧은 소리 (저작권 걱정 없음)
let ac = null;
export let muted = false;
export function setMuted(m) { muted = m; }

function ctx() {
  if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch { return null; } }
  if (ac.state === "suspended") ac.resume();
  return ac;
}
export function unlock() { ctx(); }

function tone(freq, start, dur, { type = "sine", vol = 0.18, to = null } = {}) {
  const a = ctx(); if (!a || muted) return;
  const t = a.currentTime + start;
  const o = a.createOscillator(), g = a.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.destination); o.start(t); o.stop(t + dur + 0.02);
}
function noise(start, dur, vol = 0.12, hp = 1200) {
  const a = ctx(); if (!a || muted) return;
  const t = a.currentTime + start;
  const buf = a.createBuffer(1, Math.floor(a.sampleRate * dur), a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
  s.buffer = buf; f.type = "highpass"; f.frequency.value = hp; g.gain.value = vol;
  s.connect(f).connect(g).connect(a.destination); s.start(t);
}

export const sfx = {
  tap()    { tone(660, 0, 0.08, { type: "triangle", vol: 0.12 }); },
  swoosh() { noise(0, 0.22, 0.10, 1800); },
  pick()   { tone(880, 0, 0.12, { type: "triangle" }); tone(1320, 0.07, 0.16, { type: "triangle", vol: 0.12 }); },
  drum()   { for (let i = 0; i < 8; i++) noise(i * 0.07, 0.05, 0.09 + i * 0.01, 300); },
  right()  { [784, 988, 1175].forEach((f, i) => tone(f, i * 0.08, 0.18, { type: "triangle" })); },
  wrong()  { tone(330, 0, 0.18, { type: "square", vol: 0.07 }); tone(262, 0.15, 0.25, { type: "square", vol: 0.07 }); },
  fanfare(){ [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.25, { type: "triangle", vol: 0.16 })); tone(1047, 0.48, 0.5, { type: "triangle", vol: 0.14 }); },
  pop()    { tone(300, 0, 0.18, { type: "sine", vol: 0.25, to: 1200 }); tone(1500, 0.12, 0.12, { type: "triangle", vol: 0.10 }); },
};

// 계단 오르기 소리
sfx.hop = () => { tone(520, 0, 0.12, { type: "triangle", vol: 0.16, to: 1040 }); tone(1320, 0.1, 0.14, { type: "triangle", vol: 0.1 }); };
sfx.thud = () => { tone(140, 0, 0.22, { type: "sine", vol: 0.35, to: 60 }); noise(0, 0.12, 0.12, 200); };
sfx.flip = () => { noise(0, 0.12, 0.08, 2500); };
sfx.ding = () => { tone(1568, 0, 0.3, { type: "sine", vol: 0.12 }); tone(2093, 0.06, 0.4, { type: "sine", vol: 0.08 }); };

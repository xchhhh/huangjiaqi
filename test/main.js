const canvas = document.getElementById('fx');
const ctx = canvas.getContext('2d');
let W = 0;
let H = 0;
let dpr = 1;
let cx = 0;
let cy = 0;
let minDim = 0;

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function roundRectPath(context, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + w, y, x + w, y + h, radius);
  context.arcTo(x + w, y + h, x, y + h, radius);
  context.arcTo(x, y + h, x, y, radius);
  context.arcTo(x, y, x + w, y, radius);
  context.closePath();
}

function createSigilSprite(glyph, hue, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(width);
  canvas.height = Math.ceil(height);
  const c = canvas.getContext('2d');

  const isWarm = hue < 100;
  const baseColor = isWarm ? 'rgba(241,184,184,.7)' : 'rgba(180,225,255,.7)';

  const paper = c.createLinearGradient(0, 0, 0, canvas.height);
  paper.addColorStop(0, 'rgba(255,255,255,.98)');
  paper.addColorStop(0.45, baseColor);
  paper.addColorStop(1, isWarm ? 'rgba(241,184,184,.9)' : 'rgba(180,225,255,.9)');

  c.fillStyle = paper;
  c.shadowColor = isWarm ? 'rgba(241,184,184,.3)' : 'rgba(180,225,255,.3)';
  c.shadowBlur = 8;
  roundRectPath(c, 0.5, 0.5, canvas.width - 1, canvas.height - 1, 12);
  c.fill();
  c.shadowBlur = 0;

  c.strokeStyle = 'rgba(255,255,255,.34)';
  c.lineWidth = 1;
  c.stroke();

  c.strokeStyle = 'rgba(230,57,70,.7)';
  c.lineWidth = 1.5;
  c.beginPath();
  c.moveTo(canvas.width * 0.3, canvas.height * 0.3);
  c.lineTo(canvas.width * 0.7, canvas.height * 0.3);
  c.stroke();
  c.beginPath();
  c.arc(canvas.width * 0.5, canvas.height * 0.68, Math.max(4, canvas.width * 0.07), 0, Math.PI * 2);
  c.stroke();

  c.fillStyle = 'rgba(51,51,51,.92)';
  c.font = `700 ${Math.floor(canvas.height * 0.28)}px "PingFang SC","Microsoft YaHei",sans-serif`;
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText(glyph, canvas.width * 0.5, canvas.height * 0.46);

  return canvas;
}

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  W = window.innerWidth;
  H = window.innerHeight;
  minDim = Math.min(W, H);
  cx = W * 0.5;
  cy = H * 0.5;
  canvas.width = Math.floor(W * dpr);
  canvas.height = Math.floor(H * dpr);
  canvas.style.width = W + 'px';
  canvas.style.height = H + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  for (const star of stars) {
    star.x = rand(0, W);
    star.y = rand(0, H);
  }
  for (const flake of flakes) {
    flake.x = rand(0, W);
    flake.y = rand(0, H);
  }
  for (const sigil of sigils) {
    sigil.radius = rand(minDim * 0.11, minDim * 0.33);
    const rx = sigil.radius;
    const ry = sigil.radius * 0.68;
    sigil.x = cx + Math.cos(sigil.angle) * rx;
    sigil.y = cy + Math.sin(sigil.angle) * ry;
    sigil.px = sigil.x;
    sigil.py = sigil.y;
  }
  if (!mouse.active) {
    mouse.x = cx;
    mouse.y = cy;
  }
}

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const lowPower = prefersReducedMotion || (navigator.hardwareConcurrency || 8) <= 6 || Math.min(window.innerWidth, window.innerHeight) < 900;
const starCount = lowPower ? 40 : 56;
const flakeCount = lowPower ? 30 : 44;
const sigilCount = lowPower ? 10 : 14;
const stickerCount = 6;

const mouse = {
  x: cx,
  y: cy,
  active: false,
  lastMove: 0
};

window.addEventListener('pointermove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  mouse.active = true;
  mouse.lastMove = performance.now();
});

window.addEventListener('blur', () => {
  mouse.active = false;
});

const stars = Array.from({ length: starCount }, () => ({
  x: rand(0, W),
  y: rand(0, H),
  r: rand(0.45, 1.8),
  phase: rand(0, Math.PI * 2),
  driftX: rand(-0.14, 0.14),
  driftY: rand(-0.12, 0.12),
  hue: pick([0, 8, 14, 206, 216, 228]),
  alpha: rand(0.16, 0.45)
}));

const flakes = Array.from({ length: flakeCount }, () => ({
  x: rand(0, W),
  y: rand(-H * 0.3, H * 1.1),
  r: rand(0.5, 1.7),
  speed: rand(0.12, 0.5),
  sway: rand(0.25, 1),
  phase: rand(0, Math.PI * 2),
  alpha: rand(0.12, 0.42)
}));

const sigilGlyphs = ['时', '回', '环', '印', '符', '念', '光', '稳', '静', '护', '心', '愿'];
const sigils = Array.from({ length: sigilCount }, () => ({
  radius: rand(minDim * 0.11, minDim * 0.33),
  angle: rand(0, Math.PI * 2),
  speed: rand(0.003, 0.011),
  wobble: rand(0.15, 0.7),
  phase: rand(0, Math.PI * 2),
  width: rand(24, 40),
  height: rand(54, 84),
  glyph: pick(sigilGlyphs),
  hue: pick([0, 8, 16, 206, 218, 230]),
  x: cx,
  y: cy,
  px: cx,
  py: cy
}));
for (const sigil of sigils) {
  sigil.sprite = createSigilSprite(sigil.glyph, sigil.hue, sigil.width, sigil.height);
}

window.addEventListener('resize', resize);
resize();

const ripples = [];
const sparks = [];

let clockPhase = 0;
let lastTime = 0;

function createRipple(x, y, hue, scale) {
  ripples.push({
    x,
    y,
    r: 0,
    max: rand(130, 240) * scale,
    alpha: rand(0.72, 0.96),
    hue,
    speed: rand(5, 8.8) * scale,
    line: rand(1.4, 3.2),
    phase: rand(0, Math.PI * 2)
  });
  if (ripples.length > 14) {
    ripples.shift();
  }
}

function burst(x, y, hue, count, power) {
  for (let i = 0; i < count; i++) {
    const ang = Math.random() * Math.PI * 2;
    const speed = power * (0.38 + Math.random());
    sparks.push({
      x,
      y,
      vx: Math.cos(ang) * speed,
      vy: Math.sin(ang) * speed,
      life: rand(800, 1500),
      maxLife: rand(800, 1500),
      r: rand(0.9, 2.1),
      hue: hue + rand(-12, 12),
      gravity: rand(0.003, 0.017)
    });
  }
  if (sparks.length > (lowPower ? 120 : 180)) {
    sparks.splice(0, sparks.length - (lowPower ? 120 : 180));
  }
}

const stickerLayer = document.getElementById('stickerLayer');
const tipModal = document.getElementById('tipModal');
const tipTitle = document.getElementById('tipTitle');
const tipBody = document.getElementById('tipBody');
const tipChips = document.getElementById('tipChips');
const closeTip = document.getElementById('closeTip');

const noteData = [
  {
    icon: '☁ 先喝水',
    subtitle: '别让紧张把节奏推快',
    title: '先把节奏调稳',
    body: '先喝一口水，先深呼吸一次。\n考试最需要的不是冲刺感，是稳定感。',
    chips: ['补水', '深呼吸', '稳住']
  },
  {
    icon: '✿ 慢一点',
    subtitle: '题目不用和你赛跑',
    title: '看清题干再下笔',
    body: '看清题干，比快一点更重要。\n把会的先拿稳，剩下的再慢慢啃。',
    chips: ['审题', '稳分', '节奏']
  },
  {
    icon: '♡ 别熬夜',
    subtitle: '今晚比题海更重要',
    title: '睡一个完整的觉',
    body: '今晚最值钱的不是多刷一套，而是睡一个完整的觉。\n第二天清醒，比硬撑更有用。',
    chips: ['睡眠', '恢复', '明天见']
  },
  {
    icon: '☀ 深呼吸',
    subtitle: '紧张会退潮',
    title: '四拍吸气六拍呼气',
    body: '吸气四拍，停一拍，呼气六拍。\n做两轮，脑子会安静很多。',
    chips: ['呼吸', '放松', '心安']
  },
  {
    icon: '✦ 先会的',
    subtitle: '稳稳拿分',
    title: '先把信心拿回来',
    body: '先做你最熟的题。\n让信心先回来，后面的题会更容易。',
    chips: ['先易后难', '效率', '信心']
  },
  {
    icon: '✧ 别比',
    subtitle: '你和昨天比就够了',
    title: '只和自己赛跑',
    body: '今天的你只要比昨天更稳一点，就已经在进步。\n不用和任何人抢速度。',
    chips: ['专注自己', '不比较', '成长']
  },
  {
    icon: '❀ 放下笔',
    subtitle: '也放下焦虑',
    title: '做完就往前走',
    body: '做完一题就往前走，不回头折磨自己。\n把精力留给下一步。',
    chips: ['向前看', '不纠结', '专注']
  },
  {
    icon: '◌ 带齐证件',
    subtitle: '把小事先安顿好',
    title: '把清单先收好',
    body: '准考证、身份证、文具、手表，提前放进袋子。\n琐碎处理好了，心也会更稳。',
    chips: ['清单', '收纳', '安心']
  },
  {
    icon: '☕ 中午歇会',
    subtitle: '别把自己耗空',
    title: '闭眼十分钟也很值',
    body: '中午哪怕闭眼十分钟，也比一直硬撑更划算。\n短休息会让下午更亮。',
    chips: ['午休', '回血', '清醒']
  },
  {
    icon: '✎ 错题翻篇',
    subtitle: '今天只做现在',
    title: '让昨天停在昨天',
    body: '错题不是审判书，它只是来提醒你哪里该更稳。\n现在这一题，重新开始就好。',
    chips: ['翻篇', '重来', '继续']
  },
  {
    icon: '⌂ 想家时',
    subtitle: '再继续往前',
    title: '带着支持去考试',
    body: '如果你有一点慌，就想想那些支持你的人。\n他们希望你平安、从容、得偿所愿。',
    chips: ['支持', '安心', '前进']
  },
  {
    icon: '✺ 高考加油',
    subtitle: '你会发光的',
    title: '稳稳把自己交给考场',
    body: '你已经走到这里了，说明你真的很强。\n接下来，稳稳把自己交给考场。',
    chips: ['加油', '稳住', '发光']
  }
];
const stickerSkins = [
  'linear-gradient(180deg, rgba(45,49,89,.88), rgba(35,38,72,.85))',
  'linear-gradient(180deg, rgba(42,46,86,.88), rgba(32,36,70,.85))',
  'linear-gradient(180deg, rgba(48,44,92,.88), rgba(38,34,75,.85))',
  'linear-gradient(180deg, rgba(40,44,84,.88), rgba(30,34,68,.85))',
  'linear-gradient(180deg, rgba(50,46,94,.88), rgba(40,36,77,.85))',
  'linear-gradient(180deg, rgba(44,48,88,.88), rgba(34,38,72,.85))'
];

const stickers = [];
const usedNoteIndices = new Set();

function pickUnusedNote() {
  const available = [];
  for (let i = 0; i < noteData.length; i++) {
    if (!usedNoteIndices.has(i)) available.push(i);
  }
  const idx = available.length > 0 ? pick(available) : Math.floor(Math.random() * noteData.length);
  usedNoteIndices.add(idx);
  return idx;
}

function buildSticker(sticker, note, skinIndex) {
  sticker.note = note;
  sticker.el.style.background = stickerSkins[skinIndex % stickerSkins.length];
  const iconColor = skinIndex % 2 === 0 ? '#A8DADC' : '#F8C4C4';
  sticker.el.innerHTML = `
    <div class="sticker__tag" style="color:${iconColor}">${note.icon}</div>
    <div class="sticker__sub">${note.subtitle}</div>
  `;
  sticker.el.setAttribute('aria-label', `${note.title}，点击查看生活暖心提示`);
  sticker.el.title = '点击查看生活暖心提示';
}

function respawnSticker(sticker, index, total) {
  if (sticker.noteIndex !== undefined) usedNoteIndices.delete(sticker.noteIndex);
  const noteIndex = pickUnusedNote();
  sticker.noteIndex = noteIndex;
  const note = noteData[noteIndex];
  const skinIndex = Math.floor(Math.random() * stickerSkins.length);
  sticker.size = rand(96, 120);
  const colW = W / total;
  sticker.x = colW * index + rand(0, colW - sticker.size);
  sticker.y = rand(-H * 0.5, H);
  sticker.speed = rand(0.25, 0.6);
  sticker.drift = rand(0.4, 1.2);
  sticker.rot = rand(-25, 25);
  sticker.spin = rand(-0.02, 0.02);
  sticker.scale = rand(0.96, 1.12);
  sticker.phase = rand(0, Math.PI * 2);
  sticker.skinIndex = skinIndex;
  buildSticker(sticker, note, skinIndex);
  sticker.el.style.width = `${sticker.size}px`;
  sticker.el.style.minHeight = `${sticker.size}px`;
  sticker.el.style.setProperty('--x', sticker.x.toFixed(2) + 'px');
  sticker.el.style.setProperty('--y', sticker.y.toFixed(2) + 'px');
  sticker.el.style.setProperty('--r', sticker.rot.toFixed(2) + 'deg');
  sticker.el.style.setProperty('--scale', sticker.scale.toFixed(3));
}

function makeSticker(index) {
  const el = document.createElement('button');
  el.type = 'button';
  el.className = 'sticker';
  const sticker = {
    el,
    x: 0,
    y: 0,
    rot: 0,
    speed: 0,
    drift: 0,
    spin: 0,
    scale: 1,
    phase: 0,
    size: 110,
    note: null,
    skinIndex: 0
  };
  respawnSticker(sticker, index, stickerCount);
  el.addEventListener('click', (e) => {
    e.stopPropagation();
    const cx = sticker.x + sticker.size * 0.5;
    const cy = sticker.y + sticker.size * 0.5;
    const hue = sticker.skinIndex % 2 === 0 ? 14 : 212;
    openTip(sticker.note, cx, cy);
    createRipple(cx, cy, hue, 1.05);
    burst(cx, cy, hue, 24, 2.7);
  });
  stickerLayer.appendChild(el);
  return sticker;
}

for (let i = 0; i < stickerCount; i++) {
  stickers.push(makeSticker(i));
}

function openTip(note, x, y) {
  tipTitle.textContent = note.title;
  tipBody.textContent = note.body;
  tipChips.innerHTML = '';
  for (const chip of note.chips) {
    const span = document.createElement('span');
    span.className = 'chip';
    span.textContent = chip;
    tipChips.appendChild(span);
  }
  tipModal.classList.add('show');
  tipModal.setAttribute('aria-hidden', 'false');
  mouse.x = x;
  mouse.y = y;
  mouse.active = true;
}

function closeTipPanel() {
  tipModal.classList.remove('show');
  tipModal.setAttribute('aria-hidden', 'true');
}

closeTip.addEventListener('click', (e) => {
  e.stopPropagation();
  closeTipPanel();
});

tipModal.addEventListener('pointerdown', (e) => {
  if (e.target === tipModal) {
    closeTipPanel();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeTipPanel();
  }
});

function drawMouseGlow(flow) {
  const radius = 140 + 90 * Math.abs(flow);
  const glow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, radius);
  const warm = mouse.x < W * 0.5;
  glow.addColorStop(0, `rgba(255,255,255,${mouse.active ? 0.12 : 0.07})`);
  glow.addColorStop(0.32, warm ? 'rgba(241,184,184,0.18)' : 'rgba(180,225,255,0.18)');
  glow.addColorStop(0.58, warm ? 'rgba(241,184,184,0.08)' : 'rgba(180,225,255,0.08)');
  glow.addColorStop(1, 'rgba(5,8,22,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);
}

function drawClock(flow, pulse, step) {
  const base = minDim * 0.14;
  const outer = minDim * 0.32;
  clockPhase += 0.0018 * step * flow;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.globalCompositeOperation = 'lighter';

  const halo = ctx.createRadialGradient(0, 0, base * 0.2, 0, 0, outer);
  halo.addColorStop(0, `rgba(241,184,184,${0.08 + pulse * 0.05})`);
  halo.addColorStop(0.55, 'rgba(180,225,255,0.06)');
  halo.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(0, 0, outer, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = `rgba(255,255,255,${0.16 + pulse * 0.08})`;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(0, 0, outer * 0.92, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = `rgba(255,255,255,0.08)`;
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 10]);
  ctx.beginPath();
  ctx.arc(0, 0, outer * 0.82, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  for (let i = 0; i < 60; i++) {
    const a = i * (Math.PI / 30) + clockPhase * 0.28;
    const inner = outer * (i % 5 === 0 ? 0.58 : 0.68);
    const len = i % 5 === 0 ? 12 : 7;
    const x1 = Math.cos(a) * inner;
    const y1 = Math.sin(a) * inner;
    const x2 = Math.cos(a) * (inner + len);
    const y2 = Math.sin(a) * (inner + len);
    ctx.strokeStyle = i % 5 === 0
      ? `rgba(241,184,184,${0.35 + pulse * 0.15})`
      : `rgba(180,225,255,${0.2 + pulse * 0.1})`;
    ctx.lineWidth = i % 5 === 0 ? 1.6 : 1;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  const hand1 = clockPhase * 1.25;
  const hand2 = -clockPhase * 0.88 + Math.PI / 2;

  ctx.lineCap = 'round';
  ctx.strokeStyle = `rgba(230,57,70,${0.6 + pulse * 0.25})`;
  ctx.lineWidth = 3.4;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(Math.cos(hand1) * (outer * 0.55), Math.sin(hand1) * (outer * 0.55));
  ctx.stroke();

  ctx.strokeStyle = `rgba(180,225,255,${0.5 + pulse * 0.2})`;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(Math.cos(hand2) * (outer * 0.42), Math.sin(hand2) * (outer * 0.42));
  ctx.stroke();

  ctx.fillStyle = `rgba(230,57,70,0.9)`;
  ctx.beginPath();
  ctx.arc(0, 0, 5.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = `rgba(255,255,255,${0.14 + pulse * 0.1})`;
  ctx.lineWidth = 1;
  roundRectPath(ctx, -38, outer * 0.58, 76, 24, 12);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.font = '700 12px "PingFang SC","Microsoft YaHei",sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('回环中', 0, outer * 0.69);

  ctx.restore();
}

function drawSigils(flow, pulse, step) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  for (const sigil of sigils) {
    sigil.px = sigil.x;
    sigil.py = sigil.y;
    sigil.angle += sigil.speed * step * flow;

    const radius = sigil.radius + Math.sin(sigil.phase + clockPhase * 1.5) * sigil.wobble * 14;
    const rx = radius;
    const ry = radius * 0.68;
    sigil.x = cx + Math.cos(sigil.angle) * rx;
    sigil.y = cy + Math.sin(sigil.angle) * ry;

    const isWarm = sigil.hue < 100;
    ctx.strokeStyle = isWarm
      ? `rgba(241,184,184, ${0.3 + pulse * 0.2})`
      : `rgba(180,225,255, ${0.3 + pulse * 0.2})`;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(sigil.px, sigil.py);
    ctx.lineTo(sigil.x, sigil.y);
    ctx.stroke();

    const rot = Math.atan2(sigil.y - cy, sigil.x - cx) + Math.PI / 2;
    ctx.save();
    ctx.translate(sigil.x, sigil.y);
    ctx.rotate(rot);

    ctx.drawImage(sigil.sprite, -sigil.width / 2, -sigil.height / 2, sigil.width, sigil.height);

    ctx.restore();
  }

  ctx.restore();
}

function drawStars(flow, pulse, step, now) {
  ctx.save();
  for (const star of stars) {
    star.phase += 0.012 * step;
    star.x += star.driftX * step * flow * 0.45;
    star.y += star.driftY * step * flow * 0.45;
    if (star.x < -20) star.x = W + 20;
    if (star.x > W + 20) star.x = -20;
    if (star.y < -20) star.y = H + 20;
    if (star.y > H + 20) star.y = -20;

    const alpha = star.alpha + Math.sin(now * 0.0014 + star.phase) * 0.2;
    ctx.fillStyle = `hsla(${star.hue}, 100%, 85%, ${clamp(alpha, 0.08, 0.6)})`;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawFlakes(flow, step, now) {
  ctx.save();
  ctx.fillStyle = 'rgba(255,248,235,.88)';
  for (const flake of flakes) {
    flake.y += flake.speed * step * flow * 0.9;
    flake.x += Math.sin(now * 0.00045 + flake.phase) * flake.sway * step * flow * 0.45;
    if (flake.y > H + 14) {
      flake.y = -14;
      flake.x = rand(0, W);
    }
    if (flake.y < -14) {
      flake.y = H + 14;
      flake.x = rand(0, W);
    }
    const alpha = clamp(flake.alpha + Math.sin(now * 0.0015 + flake.phase) * 0.16, 0.1, 0.5);
    ctx.fillStyle = `rgba(255,248,235,${alpha})`;
    ctx.beginPath();
    ctx.arc(flake.x, flake.y, flake.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawRipples(step, now) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = ripples.length - 1; i >= 0; i--) {
    const ripple = ripples[i];
    ripple.r += ripple.speed * step;
    ripple.alpha *= 0.985;
    const pct = ripple.r / ripple.max;
    const alpha = clamp((1 - pct) * ripple.alpha, 0, 1);
    const isWarm = ripple.hue < 100;

    ctx.lineWidth = ripple.line;
    ctx.setLineDash([8, 12]);
    ctx.lineDashOffset = -now * 0.02 + ripple.phase;
    ctx.strokeStyle = isWarm
      ? `rgba(241,184,184, ${alpha})`
      : `rgba(180,225,255, ${alpha})`;
    ctx.beginPath();
    ctx.arc(ripple.x, ripple.y, ripple.r, 0, Math.PI * 2);
    ctx.stroke();

    ctx.setLineDash([]);
    ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.18})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(ripple.x, ripple.y, ripple.r * 0.72, 0, Math.PI * 2);
    ctx.stroke();

    if (ripple.r > ripple.max || alpha <= 0.02) {
      ripples.splice(i, 1);
    }
  }
  ctx.restore();
}

function drawSparks(flow, step, now) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = sparks.length - 1; i >= 0; i--) {
    const spark = sparks[i];
    spark.life -= step * 16.67;
    spark.vy += spark.gravity * step;
    spark.vx *= 0.986;
    spark.vy *= 0.986;
    spark.x += spark.vx * step * flow;
    spark.y += spark.vy * step * flow;
    const alpha = clamp(spark.life / spark.maxLife, 0, 1);
    const isWarm = spark.hue < 100;
    ctx.fillStyle = isWarm
      ? `rgba(241,184,184, ${alpha})`
      : `rgba(180,225,255, ${alpha})`;
    ctx.beginPath();
    ctx.arc(spark.x, spark.y, spark.r, 0, Math.PI * 2);
    ctx.fill();
    if (spark.life <= 0) {
      sparks.splice(i, 1);
    }
  }
  ctx.restore();
}

function animate(now) {
  const delta = lastTime ? Math.min(40, now - lastTime) : 16.67;
  lastTime = now;
  const step = delta / 16.67;
  const flow = Math.sin(now * 0.00023);
  const pulse = 0.55 + 0.45 * Math.abs(flow);
  const mouseAlive = now - mouse.lastMove < 220;
  mouse.active = mouseAlive;

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(3, 4, 10, 0.15)';
  ctx.fillRect(0, 0, W, H);

  if (mouseAlive) {
    drawMouseGlow(flow);
  }
  drawFlakes(flow, step, now);
  drawStars(flow, pulse, step, now);
  drawClock(flow, pulse, step);
  drawSigils(flow, pulse, step);
  drawRipples(step, now);
  drawSparks(flow, step, now);

  for (let i = 0; i < stickers.length; i++) {
    const sticker = stickers[i];
    sticker.y += sticker.speed * step;
    sticker.x += Math.sin(now * 0.0008 + sticker.phase) * sticker.drift * step * 0.5;
    sticker.rot += sticker.spin * step;
    const envRect = envelopeWrap ? envelopeWrap.getBoundingClientRect() : null;
    const envTop = envRect ? envRect.top - 40 : H - 220;
    const envLeft = envRect ? envRect.left - 20 : W * 0.3;
    const envRight = envRect ? envRect.right + 20 : W * 0.7;
    if (sticker.y > H + 140 || (sticker.y > envTop && sticker.x > envLeft && sticker.x < envRight)) {
      sticker.y = -140;
      const colW = W / stickers.length;
      sticker.x = colW * i + rand(0, colW - sticker.size);
    }
    sticker.el.style.setProperty('--x', `${sticker.x.toFixed(1)}px`);
    sticker.el.style.setProperty('--y', `${sticker.y.toFixed(1)}px`);
    sticker.el.style.setProperty('--r', `${sticker.rot.toFixed(1)}deg`);
    sticker.el.style.setProperty('--scale', sticker.scale.toFixed(2));
  }

  requestAnimationFrame(animate);
}

function backgroundBurst(x, y, warm) {
  const hue = warm ? 14 : 212;
  createRipple(x, y, hue, warm ? 1.08 : 1);
  burst(x, y, hue, warm ? 14 : 18, warm ? 2.6 : 2.2);
}

document.addEventListener('pointerdown', (e) => {
  if (tipModal.classList.contains('show')) {
    return;
  }
  if (e.target.closest('.sticker') || e.target.closest('.panel') || e.target.closest('.close-btn')) {
    return;
  }
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  mouse.active = true;
  mouse.lastMove = performance.now();
  backgroundBurst(e.clientX, e.clientY, e.clientX < W * 0.5);
});

// --- 信封交互 ---
const envelopeWrap = document.getElementById('envelopeWrap');
const envelope = document.getElementById('envelope');
const envelopeLetter = document.getElementById('envelopeLetter');
const envelopeMask = document.getElementById('envelopeLetterMask');
const letterContent = document.getElementById('letterContent');
const letterScrollHint = document.getElementById('letterScrollHint');

// 滚动提示：滚到底部自动隐藏
if (letterContent && letterScrollHint) {
  letterContent.addEventListener('scroll', () => {
    const atBottom = letterContent.scrollTop + letterContent.clientHeight >= letterContent.scrollHeight - 10;
    letterScrollHint.classList.toggle('hidden', atBottom);
  });
}

if (envelopeWrap) {
  envelopeWrap.addEventListener('click', (e) => {
    e.stopPropagation();
    envelope.classList.toggle('open');
  });
  // 点击信纸区域不关闭（允许滚动阅读）
  if (envelopeLetter) {
    envelopeLetter.addEventListener('click', (e) => e.stopPropagation());
  }
  // 点击遮罩层关闭信纸
  if (envelopeMask) {
    envelopeMask.addEventListener('click', (e) => {
      e.stopPropagation();
      envelope.classList.remove('open');
    });
  }
  // 点击页面其他地方关闭信封（排除信封自身区域）
  document.addEventListener('click', (e) => {
    if (!envelope || !envelope.classList.contains('open')) return;
    if (e.target.closest('.envelope-wrap') || e.target.closest('.envelope-letter')) return;
    envelope.classList.remove('open');
  });
}

backgroundBurst(cx, cy, true);
for (let i = 0; i < 3; i++) {
  createRipple(cx + rand(-40, 40), cy + rand(-40, 40), 270, 0.92 + i * 0.1);
}
animate(performance.now());

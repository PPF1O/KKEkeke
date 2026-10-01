/* ===============================
   CONFIG
   # ข้อความทั้งหมดของเว็บ แก้ที่นี่ที่เดียวพอ
================================ */
const CONFIG = {
  title: "ถึงพี่ชมพูครับ 💕",

  messages: [
    "เว็บนี้น่ารักๆอันนี้ อาจไม่ได้สมบูรณ์แบบ",
    "แต่ตั้งใจทำทุกบรรทัดเลยนะครับ 🙂",
    "ขอบคุณมากครับ ที่ให้รอยยิ้มเเละเสียงหัวเราะ",
    "อยู่กับผมนานๆ ไปเรื่อยๆนะครับ"
  ],

  // คำถามหน้าสุดท้าย
  question: "สัญญาไหมครับ? 🥺🤙",
  yesReply: "เย้! สัญญาแล้วนะครับ ห้ามผิดสัญญาน้า 💕",
  // ข้อความบนปุ่ม "ไม่" ที่จะเปลี่ยนไปทุกครั้งที่พยายามกด
  noTexts: ["ไม่เอา", "แน่ใจหรอ? 🥺", "คิดอีกทีน้า", "กดไม่โดนหรอก 😝", "ยอมแพ้เถอะ 💕"],

  // Easter Egg: กดหัวข้อกี่ครั้งถึงจะเจอ
  easterEggClicks: 5,
  secret: "🐣 เจอความลับแล้ว! จริงๆ แล้วทำเว็บนี้ไปยิ้มไปตลอดเลยครับ 🤭",

  typeSpeed: 35
};

/* ===============================
   ELEMENT SELECT
================================ */
const $ = (id) => document.getElementById(id);

const envelope = $("envelope");
const overlay = $("overlay");
const popupTitle = $("popupTitle");
const popupText = $("popupText");
const dots = $("dots");
const nextBtn = $("nextBtn");
const closeBtn = $("closeBtn");
const question = $("question");
const yesBtn = $("yesBtn");
const noBtn = $("noBtn");
const seniorImg = $("seniorImg");
const title = $("title");
const toast = $("toast");
const soundBtn = $("soundBtn");
const heartsLayer = $("hearts");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let currentIndex = 0;
let locked = false; // ระหว่างถามคำถาม ห้ามหนี!

/* ===============================
   SOUND
   # เสียงสังเคราะห์เล็กๆ ไม่ต้องใช้ไฟล์เสียง (ปิดไว้ตั้งแต่แรก)
================================ */
const Sound = {
  ctx: null,
  on: false,

  toggle() {
    this.on = !this.on;
    if (this.on && !this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) this.ctx = new AC();
    }
    soundBtn.textContent = this.on ? "🔊" : "🔇";
    soundBtn.setAttribute("aria-label", this.on ? "ปิดเสียง" : "เปิดเสียง");
    if (this.on) this.chime();
  },

  play(freq, duration = 0.08, volume = 0.05, delay = 0) {
    if (!this.on || !this.ctx) return;
    const t = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + duration);
  },

  tick() { this.play(700 + Math.random() * 300, 0.04, 0.025); },
  pop() { this.play(520, 0.12, 0.06); },
  boop() { this.play(220, 0.15, 0.05); },
  chime() { [523, 659, 784, 1047].forEach((f, i) => this.play(f, 0.3, 0.05, i * 0.1)); }
};

soundBtn.addEventListener("click", () => Sound.toggle());

/* ===============================
   FUNCTION: TYPE WRITER
   # พิมพ์ข้อความทีละตัว
   # - ตัดตัวอักษรแบบ grapheme เพื่อให้สระ/วรรณยุกต์ไทยและ emoji ไม่แตก
   # - เรียกซ้ำได้ จะยกเลิกของเก่าก่อนเสมอ (กันข้อความปนกัน)
   # - finishTyping() ใช้ข้ามไปแสดงข้อความเต็ม
================================ */
const splitGraphemes = (text) =>
  window.Intl && Intl.Segmenter
    ? Array.from(new Intl.Segmenter("th", { granularity: "grapheme" }).segment(text), (s) => s.segment)
    : Array.from(text);

const typing = new Map(); // element -> { timer, finish }

function cancelTyping(element) {
  const job = typing.get(element);
  if (job) clearInterval(job.timer);
  typing.delete(element);
  element.classList.remove("typing");
}

function finishTyping(element) {
  const job = typing.get(element);
  if (job) job.finish();
}

const isTyping = (element) => typing.has(element);

function typeWriter(element, text, speed = CONFIG.typeSpeed) {
  cancelTyping(element);

  return new Promise((resolve) => {
    const chars = splitGraphemes(text);
    let index = 0;

    element.textContent = "";
    element.classList.add("typing");

    const finish = () => {
      cancelTyping(element);
      element.textContent = text;
      resolve();
    };

    const timer = setInterval(() => {
      element.textContent += chars[index];
      index++;
      if (index % 2 === 0) Sound.tick();
      if (index >= chars.length) finish();
    }, speed);

    typing.set(element, { timer, finish });
  });
}

/* ===============================
   PROGRESS DOTS
================================ */
function renderDots() {
  dots.innerHTML = "";
  CONFIG.messages.forEach(() => dots.appendChild(document.createElement("span")));
}

function updateDots(index) {
  [...dots.children].forEach((dot, i) => dot.classList.toggle("active", i === index));
}

/* ===============================
   PAGES
================================ */
function showPage(index) {
  currentIndex = index;

  if (index < CONFIG.messages.length) {
    updateDots(index);
    typeWriter(popupText, CONFIG.messages[index]);
    return;
  }

  // หน้าสุดท้าย: คำถาม
  updateDots(-1);
  nextBtn.hidden = true;
  setLocked(true);
  typeWriter(popupText, CONFIG.question).then(() => {
    question.hidden = false;
  });
}

function resetPopup() {
  currentIndex = 0;
  nextBtn.hidden = false;
  question.hidden = true;
  setLocked(false);
  noBtn.textContent = CONFIG.noTexts[0];
  noBtn.style.transform = "";
  yesBtn.style.transform = "";
  noCount = 0;  popupTitle.textContent = "";
  popupText.textContent = "";
  seniorImg.classList.remove("bounce");
}

/* ===============================
   OPEN POPUP (เปิดซองจดหมาย)
================================ */
let opening = false;

envelope.addEventListener("click", () => {
  if (opening) return;
  opening = true;

  envelope.classList.add("open");
  Sound.pop();

  setTimeout(openPopup, reduceMotion ? 0 : 1000);
});

async function openPopup() {
  resetPopup();
  overlay.classList.add("show");
  nextBtn.focus({ preventScroll: true });

  await typeWriter(popupTitle, CONFIG.title, 60);
  showPage(0);
}

/* ===============================
   NEXT MESSAGE
   # กดตอนกำลังพิมพ์ = แสดงข้อความเต็มก่อน, กดอีกที = หน้าถัดไป
================================ */
nextBtn.addEventListener("click", () => {
  Sound.pop();

  if (isTyping(popupTitle) || isTyping(popupText)) {
    finishTyping(popupTitle);
    finishTyping(popupText);
    return;
  }

  showPage(currentIndex + 1);
});

// แตะที่ข้อความเพื่อข้ามการพิมพ์
popupText.addEventListener("click", () => finishTyping(popupText));

/* ===============================
   YES / NO
================================ */
let noCount = 0;

function dodge(e) {
  if (e) e.preventDefault();
  noCount++;

  noBtn.textContent = CONFIG.noTexts[Math.min(noCount, CONFIG.noTexts.length - 1)];

  // สุ่มตำแหน่งใหม่ แต่ไม่ให้หลุดออกนอกการ์ด
  // (offsetLeft/Top คือตำแหน่งเดิมในการ์ด ไม่ขึ้นกับ transform)
  const card = noBtn.offsetParent;
  const left = noBtn.offsetLeft;
  const top = noBtn.offsetTop;
  const pad = 10;
  const rand = (min, max) => min + Math.random() * Math.max(0, max - min);

  const x = rand(pad - left, card.clientWidth - pad - noBtn.offsetWidth - left);
  const y = rand(Math.max(pad - top, -90), Math.min(card.clientHeight - pad - noBtn.offsetHeight - top, 90));
  noBtn.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;

  // ปุ่ม "ได้สิ" ใหญ่ขึ้นเรื่อยๆ
  yesBtn.style.transform = `scale(${Math.min(1 + noCount * 0.12, 1.8)})`;

  Sound.boop();
}

// บนคอม: เมาส์เข้าใกล้ก็หนีแล้ว / บนมือถือ: แตะแล้วหนี
noBtn.addEventListener("pointerenter", (e) => {
  if (e.pointerType === "mouse") dodge();
});
noBtn.addEventListener("click", dodge);

yesBtn.addEventListener("click", () => {
  question.hidden = true;
  setLocked(false);
  seniorImg.classList.add("bounce");
  typeWriter(popupText, CONFIG.yesReply);
  Sound.chime();
  celebrate();
});

/* ===============================
   CONFETTI 🎉
   # ใช้ canvas-confetti ถ้าโหลดได้, ถ้าไม่ได้ใช้หัวใจของเราเอง
================================ */
function celebrate() {
  if (typeof window.confetti !== "function" || reduceMotion) {
    heartRain(20);
    return;
  }

  const colors = ["#ff4d6d", "#ff8fa3", "#ffb3c1", "#ffffff", "#ffd6e0"];
  const shapes = confetti.shapeFromText
    ? [confetti.shapeFromText({ text: "💖", scalar: 2 }), "circle"]
    : undefined;

  confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 }, colors, shapes, scalar: 1.2 });

  // ยิงจากสองข้าง
  const end = Date.now() + 1200;
  (function frame() {
    confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors, shapes });
    confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors, shapes });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

/* ===============================
   CLOSE POPUP
================================ */
// ล็อก = ซ่อนปุ่มปิด และกด ESC / แตะนอกการ์ดก็ปิดไม่ได้ ต้องตอบ "ได้สิ" เท่านั้น 😝
function setLocked(value) {
  locked = value;
  closeBtn.hidden = value;
}

function closePopup() {
  if (!overlay.classList.contains("show") || locked) return;

  overlay.classList.remove("show");
  cancelTyping(popupTitle);
  cancelTyping(popupText);

  envelope.classList.remove("open");
  opening = false;
  envelope.focus({ preventScroll: true });
}

closeBtn.addEventListener("click", closePopup);

overlay.addEventListener("click", (e) => {
  if (e.target === overlay) closePopup();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closePopup();
});

/* ===============================
   FLOATING HEARTS 💗
================================ */
const HEART_EMOJIS = ["💗", "💕", "💖", "🌸", "✨", "🤍"];
const MAX_HEARTS = 18;

function spawnHeart(fast = false) {
  if (heartsLayer.childElementCount >= MAX_HEARTS && !fast) return;

  const heart = document.createElement("span");
  heart.className = "float-heart";
  heart.textContent = HEART_EMOJIS[Math.floor(Math.random() * HEART_EMOJIS.length)];
  heart.style.left = `${Math.random() * 100}%`;
  heart.style.fontSize = `${14 + Math.random() * 18}px`;
  heart.style.setProperty("--dur", `${(fast ? 4 : 8) + Math.random() * 5}s`);
  heart.style.setProperty("--drift", `${(Math.random() * 2 - 1) * 60}px`);
  heart.style.setProperty("--alpha", (0.4 + Math.random() * 0.5).toFixed(2));

  heart.addEventListener("animationend", () => heart.remove());
  heartsLayer.appendChild(heart);
}

function heartRain(count = 25) {
  for (let i = 0; i < count; i++) {
    setTimeout(() => spawnHeart(true), i * 80);
  }
}

if (!reduceMotion) {
  setInterval(spawnHeart, 900);
}

/* ===============================
   CLICK SPARKLES ✨
   # แตะตรงไหนก็มีประกายเด้งออกมา
================================ */
const SPARKLES = ["✨", "💖", "⭐", "💕"];

document.addEventListener("pointerdown", (e) => {
  if (reduceMotion) return;

  for (let i = 0; i < 6; i++) {
    const s = document.createElement("span");
    const angle = (Math.PI * 2 * i) / 6 + Math.random() * 0.5;
    const dist = 30 + Math.random() * 30;

    s.className = "sparkle";
    s.textContent = SPARKLES[Math.floor(Math.random() * SPARKLES.length)];
    s.style.left = `${e.clientX}px`;
    s.style.top = `${e.clientY}px`;
    s.style.setProperty("--dx", `${Math.cos(angle) * dist}px`);
    s.style.setProperty("--dy", `${Math.sin(angle) * dist}px`);

    s.addEventListener("animationend", () => s.remove());
    document.body.appendChild(s);
  }
});

/* ===============================
   EASTER EGG 🐣
   # กดหัวข้อติดกันครบจำนวนครั้ง
================================ */
let titleClicks = 0;
let titleTimer = null;
let toastTimer = null;

title.addEventListener("click", () => {
  titleClicks++;
  clearTimeout(titleTimer);
  titleTimer = setTimeout(() => (titleClicks = 0), 1500);

  title.classList.remove("wiggle");
  void title.offsetWidth; // restart animation
  title.classList.add("wiggle");
  Sound.play(400 + titleClicks * 120, 0.1, 0.05);

  if (titleClicks >= CONFIG.easterEggClicks) {
    titleClicks = 0;
    showToast(CONFIG.secret);
    heartRain(30);
    Sound.chime();
  }
});

function showToast(text) {
  toast.textContent = text;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 4500);
}

/* ===============================
   INIT
================================ */
renderDots();

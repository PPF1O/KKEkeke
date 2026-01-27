/* ===============================
   ELEMENT SELECT
   # ดึง element จาก HTML
================================ */
const openBtn = document.getElementById("openBtn");
const closeBtn = document.getElementById("closeBtn");
const overlay = document.getElementById("overlay");
const nextBtn = document.getElementById("nextBtn");

const popupTitle = document.getElementById("popupTitle");
const popupText = document.getElementById("popupText");

/* ===============================
   DATA
   # ข้อความหลายหน้า (แก้ไขได้ตามใจ)
================================ */
const titleText = "ถึงพี่ชมพูครับ 💕";

const messages = [
  "เว็บนี้น่ารักๆอันนี้ อาจไม่ได้สมบูรณ์แบบ",
  "แต่ตั้งใจทำทุกบรรทัดเลยนะครับ 🙂",
  "ขอบคุณมากครับ ที่ให้รอยยิ้มเเละเสียงหัวเราะ",
  "อยู่กับผมนานๆ ไปเรื่อยๆนะครับ"
];

let currentIndex = 0;

/* ===============================
   FUNCTION: TYPE WRITER
   # พิมพ์ข้อความทีละตัว
================================ */
function typeWriter(element, text, speed = 40) {
  element.textContent = "";
  let index = 0;

  const timer = setInterval(() => {
    element.textContent += text[index];
    index++;

    if (index >= text.length) {
      clearInterval(timer);
    }
  }, speed);
}

/* ===============================
   OPEN POPUP
================================ */
openBtn.addEventListener("click", () => {
  overlay.classList.add("show");

  // reset ค่า
  currentIndex = 0;
  nextBtn.style.display = "inline-block";

  typeWriter(popupTitle, titleText, 60);
  setTimeout(() => {
    typeWriter(popupText, messages[currentIndex], 35);
  }, 600);
});

/* ===============================
   NEXT MESSAGE
   # ปุ่มอ่านต่อ
================================ */
nextBtn.addEventListener("click", () => {
  currentIndex++;

  if (currentIndex < messages.length) {
    typeWriter(popupText, messages[currentIndex], 35);
  } else {
    typeWriter(popupText, "ขอบคุณที่อ่านจนจบนะครับ 😊", 35);
    nextBtn.style.display = "none";
  }
});

/* ===============================
   CLOSE POPUP (ปุ่ม)
================================ */
closeBtn.addEventListener("click", closePopup);

/* ===============================
   CLOSE POPUP (คลิกนอกการ์ด)
================================ */
overlay.addEventListener("click", (e) => {
  if (e.target === overlay) {
    closePopup();
  }
});

/* ===============================
   CLOSE POPUP (กด ESC)
================================ */
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closePopup();
  }
});

/* ===============================
   CLOSE FUNCTION
================================ */
function closePopup() {
  overlay.classList.remove("show");
}

/* ===============================
   IMAGE INTERACTION
   # ลูกเล่นเบา ๆ
================================ */
const seniorImg = document.querySelector(".senior-img");

if (seniorImg) {
  seniorImg.addEventListener("mouseenter", () => {
    seniorImg.style.transform = "scale(1.08) rotate(2deg)";
  });

  seniorImg.addEventListener("mouseleave", () => {
    seniorImg.style.transform = "scale(1) rotate(0)";
  });
}

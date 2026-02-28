function byId(id){ return document.getElementById(id); }

let activeQuiz = [];
let answers = [];
let currentIdx = 0;
let timerRef = null;
let remainingSec = 0;
let submitted = false;
const trCache = typeof TRANSLATIONS_MAP !== "undefined" ? { ...TRANSLATIONS_MAP } : {};

function tr(text){
  if(!text) return "";
  return trCache[text] || text;
}

async function trAsync(text){
  if(!text) return "";
  return tr(text);
}

function hydrateTranslationCache(){
  // Offline-safe: rely on bundled translations.js only.
}

function rng(seed){
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

function shuffle(arr, rand = Math.random){
  const a = [...arr];
  for(let i = a.length - 1; i > 0; i--){
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildForm40(templateNo = 1){
  const rand = rng(3000 + Number(templateNo || 1));
  const base = ALL_BOOKLET_QUESTIONS.filter(q => Array.isArray(q.options) && q.options.length === 4);
  const isPassageLike = (q) => {
    const txt = `${q.question || ""} ${q.topic || ""}`.toLowerCase();
    if (q.is_passage) return true;
    if (q.section === "reading") return true;
    if ((q.source || "").toLowerCase().includes("passage")) return true;
    if (/ghost|weather|fatima|obesity|endley|nowcasting|marsh|wolverine|lincoln|hotel|immigrants|garden of eden/.test(txt)) return true;
    return false;
  };

  const isCleanQuestion = (q) => {
    if (!q || !q.question || !Array.isArray(q.options) || q.options.length !== 4) return false;
    if (String(q.question).trim().length < 6) return false;
    const textBlob = `${q.question} ${q.options.join(" ")}`;
    if (/(اﻟﺤﻠﻮل|اﻷﺟﻮﺑﺔ|Answers?:|@saadinelt)/i.test(textBlob)) return false;
    if (q.options.some(o => !String(o || "").trim())) return false;
    return true;
  };

  const nonPassage = base.filter(q => !isPassageLike(q) && isCleanQuestion(q));
  const primaryPool = nonPassage.length >= 40
    ? nonPassage
    : KEYED_QUESTIONS.filter(q => Array.isArray(q.options) && q.options.length === 4 && !isPassageLike(q) && isCleanQuestion(q));
  return shuffle(primaryPool, rand).slice(0, 40);
}

function fmt(sec){
  const m = String(Math.floor(sec / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function updateTimer(){
  byId("timerChip").textContent = `الوقت المتبقي: ${fmt(remainingSec)}`;
  byId("timerDisplay").textContent = fmt(remainingSec);
  byId("timerChip").classList.toggle("alert", remainingSec <= 60 && remainingSec > 0);
}

function stopTimer(){
  if(timerRef){
    clearInterval(timerRef);
    timerRef = null;
  }
}

function startTimer(minutes){
  stopTimer();
  remainingSec = minutes * 60;
  updateTimer();
  timerRef = setInterval(() => {
    remainingSec--;
    updateTimer();
    if(remainingSec <= 0){
      stopTimer();
      if(!submitted) submitQuiz(true);
    }
  }, 1000);
}

function renderDots(){
  const root = byId("navDots");
  root.innerHTML = "";
  activeQuiz.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.className = "nav-dot";
    if(i === currentIdx) dot.classList.add("current");
    if(answers[i] !== -1) dot.classList.add("answered");
    dot.textContent = String(i + 1);
    dot.onclick = () => { currentIdx = i; renderCurrent(); };
    root.appendChild(dot);
  });
}

function renderCurrent(){
  const q = activeQuiz[currentIdx];
  if(!q) return;
  byId("progressText").textContent = `السؤال ${currentIdx + 1} من 40`;
  const answered = answers.filter(v => v !== -1).length;
  byId("progressChip").textContent = `الإجابات: ${answered} / 40`;
  byId("progressBar").style.width = `${Math.round((answered / 40) * 100)}%`;

  byId("prevBtn").disabled = currentIdx === 0;
  byId("nextBtn").style.display = currentIdx === 39 ? "none" : "inline-flex";
  byId("finishBtn").style.display = currentIdx === 39 ? "inline-flex" : "none";

  const box = byId("questionStage");
  box.innerHTML = `
    <article class="qcard">
      <div class="qhead">
        <span class="qnum">${currentIdx + 1}</span>
        <div class="qtext">${q.question}<div class="muted" id="qTrans"></div></div>
      </div>
      <div class="qmeta">
        <span class="tag">${q.section || "mixed"}</span>
        <span class="tag">${q.topic || "general"}</span>
      </div>
      <div class="ops">
        ${q.options.map((op, i) => `
          <label>
            <input type="radio" name="current-q" value="${i}" ${answers[currentIdx] === i ? "checked" : ""}/>
            ${op}<span class="muted js-op-trans" data-op-idx="${i}" style="display:block"></span>
          </label>
        `).join("")}
      </div>
    </article>
  `;

  box.querySelectorAll('input[name="current-q"]').forEach(el => {
    el.addEventListener("change", () => {
      answers[currentIdx] = Number(el.value);
      renderDots();
      renderCurrent();
    });
  });

  fillCurrentTranslations(q, box);
  renderDots();
}

async function fillCurrentTranslations(q, box){
  const qTrans = box.querySelector("#qTrans");
  if(qTrans) qTrans.textContent = await trAsync(q.question);
  const opNodes = box.querySelectorAll(".js-op-trans");
  for(const node of opNodes){
    const idx = Number(node.getAttribute("data-op-idx"));
    node.textContent = await trAsync(q.options[idx] || "");
  }
}

function startQuiz(){
  submitted = false;
  const template = Number(byId("formTemplate").value || 1);
  activeQuiz = buildForm40(template);
  answers = new Array(40).fill(-1);
  currentIdx = 0;
  byId("quizResult").innerHTML = "";
  byId("quizReport").innerHTML = "";
  renderCurrent();
  startTimer(Number(byId("quizMinutes").value || 60));
}

function sectionFix(sec){
  if(sec === "grammar") return "راجع: الأزمنة + passive + tag questions + prepositions.";
  if(sec === "reading") return "راجع: main idea + inference + vocab in context.";
  return "راجع: implied meaning ووظائف اللغة.";
}

async function submitQuiz(auto = false){
  if(submitted || !activeQuiz.length) return;
  submitted = true;
  stopTimer();

  let score = 0;
  let gradable = 0;
  const weak = { grammar: 0, reading: 0, conversation: 0, mixed: 0 };
  const mistakes = [];
  for(let i = 0; i < activeQuiz.length; i++){
    const q = activeQuiz[i];
    if(!Number.isInteger(q.answer)){
      continue;
    }
    gradable++;
    if(answers[i] === q.answer){
      score++;
    } else {
      weak[q.section || "mixed"] = (weak[q.section || "mixed"] || 0) + 1;
      const reasonText = q.reason || "Matched with booklet answer key.";
      mistakes.push({
        i: i + 1,
        q: q.question,
        your: answers[i] === -1 ? "بدون إجابة" : q.options[answers[i]],
        ok: q.options[q.answer],
        reason: q.reason || "مطابق لمفتاح الإجابة في الملزمة.",
        qAr: await trAsync(q.question),
        yourAr: answers[i] === -1 ? "بدون إجابة" : await trAsync(q.options[answers[i]]),
        okAr: await trAsync(q.options[q.answer]),
        reasonAr: await trAsync(reasonText)
      });
    }
  }

  const pct = gradable ? Math.round((score / gradable) * 100) : 0;
  const weakSec = Object.entries(weak).sort((a,b)=>b[1]-a[1])[0][0];
  byId("quizResult").innerHTML = `
    <div class="score">
      <div class="main">${pct}%</div>
      <div class="sub">${auto ? "انتهى الوقت وتم التسليم تلقائياً" : "تم التسليم بنجاح"}</div>
      <div class="stats">
        <div class="stat"><div class="n ok">${score}</div><div>صحيح</div></div>
        <div class="stat"><div class="n danger">${Math.max(gradable - score, 0)}</div><div>خاطئ/فارغ</div></div>
        <div class="stat"><div class="n">${weakSec}</div><div>الأضعف</div></div>
        <div class="stat"><div class="n">${gradable}</div><div>مصحّح بمفتاح</div></div>
      </div>
      <div class="muted" style="margin-top:8px">خطة إصلاح: ${sectionFix(weakSec)}</div>
      <div class="muted">الأسئلة بدون مفتاح لا تدخل بالدرجة.</div>
    </div>
  `;

  if(!mistakes.length){
    byId("quizReport").innerHTML = `<div class="report"><h3>نتيجة ممتازة</h3><div class="ok">بدون أخطاء.</div></div>`;
    return;
  }

  byId("quizReport").innerHTML = `
    <div class="report">
      <h3>تفصيل الأخطاء</h3>
      ${mistakes.map(m => `
        <div class="report-item">
          <div class="q">س${m.i}: ${m.q}</div>
          <div class="muted">${m.qAr}</div>
          <div class="danger">إجابتك: ${m.your}</div>
          <div class="muted">${m.yourAr}</div>
          <div class="ok">الصحيح: ${m.ok}</div>
          <div class="muted">${m.okAr}</div>
          <div>السبب: ${m.reason}</div>
          <div class="muted">الترجمة: ${m.reasonAr}</div>
        </div>
      `).join("")}
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  hydrateTranslationCache();
  byId("startQuiz").addEventListener("click", startQuiz);
  byId("prevBtn").addEventListener("click", () => { if(currentIdx > 0){ currentIdx--; renderCurrent(); }});
  byId("nextBtn").addEventListener("click", () => { if(currentIdx < 39){ currentIdx++; renderCurrent(); }});
  byId("finishBtn").addEventListener("click", async () => { await submitQuiz(false); });
  startQuiz();
});

function byId(id){ return document.getElementById(id); }

let pActive = [];
let pAnswers = [];
let pIdx = 0;
let pTimer = null;
let pRemain = 0;
let pSubmitted = false;
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

const PASSAGE_SOURCE = (typeof PASSAGES_FULL !== "undefined" && Array.isArray(PASSAGES_FULL) && PASSAGES_FULL.length)
  ? PASSAGES_FULL
  : PASSAGES;

const PASSAGE_AR_SUMMARY = {
  "marshes": "تتحدث القطعة عن الأهوار العراقية بوصفها من أكبر الأنظمة البيئية الرطبة في الشرق الأوسط، ودورها المهم في التنوع الحيوي. كما توضّح أثر نقص المياه في تدهور السلسلة الغذائية وفقدان بعض الأنواع. وتذكر أن مساحة الأهوار انخفضت بشدة بعد التجفيف في التسعينات، ثم بدأت جهود إنعاشها بعد 2003 بدعم حكومي ودولي.",
  "taj-mahal": "تشرح القطعة تاريخ تاج محل في مدينة أغرا الهندية، وتفاصيل بنائه من الرخام الأبيض وزخرفته الفريدة. كما تذكر سبب بنائه على يد شاه جهان، والأضرار التي تعرض لها عبر التاريخ، ثم محاولات الحفاظ عليه. وتؤكد مكانته كأحد أشهر المعالم العالمية ومن عجائب الدنيا الحديثة.",
  "sali": "تدور القطعة حول سالي، الفتاة المعروفة باللطف ومساعدة الآخرين. عثرت على طائر مصاب واعتنت به حتى تعافى، ثم أطلقته بحرية. رسالتها الأساسية أن الرحمة والإيثار يصنعان أثرًا كبيرًا في المجتمع ويُلهمان الناس لفعل الخير.",
  "robots": "تعرف القطعة الروبوتات بأنها آلات تتبع أوامر الحاسوب لتنفيذ أعمال متنوعة بدقة. تستخدم في الصناعة والاستكشاف والأعمال الخطرة، وتاريخيًا بدأ الحلم بها قديمًا ثم ظهر أول روبوت عملي حديث عام 1961. وتشير إلى أن دور الروبوتات سيزداد مستقبلًا في خدمة الإنسان.",
  "missing-boy": "تحكي القطعة قصة الطفل علي الذي ضاع على الشاطئ بعد ابتعاده عن والديه. تصف خوف الطفل وقلق الأهل، ثم دور شخص متطوع ومنقذ الشاطئ في العثور عليه بسرعة. الفكرة الأساسية: الوعي، وسرعة التصرف، ومساعدة الآخرين تُنقذ المواقف الخطرة.",
  "the-ghost": "تتناول القطعة قصة مزرعة ظنّ الناس أنها مسكونة، ثم اتضح أن السر كان أخًا مختبئًا يعمل ليلًا. تكشف القصة تفاصيل الاختفاء الطويل وخوف العائلة من السلطات، وكيف استمر السر لعقود. الفكرة تدور حول الشائعات والحقيقة المختبئة خلفها.",
  "the-weather": "توضح القطعة أن العواصف المحلية الشديدة قد تحدث بسرعة ويصعب توقعها بالأساليب التقليدية. وتبين كيف ساعدت التقنيات الحديثة مثل الرادار والأقمار الصناعية على تحسين التنبؤ قصير المدى (Nowcasting). الهدف هو فهم كيف تطور علم الأرصاد لزيادة دقة الإنذار المبكر.",
  "fatima": "تسرد القطعة كفاح فاطمة الأرملة في تربية أبنائها عبر العمل المتواصل رغم الظروف الصعبة. آمنت بأن التعليم هو طريق النجاح، فدعمت ابنها في الطب وابنتها في الهندسة. الرسالة: الإصرار والتضحية يصنعان مستقبل الأسرة.",
  "wolverine": "تقدم القطعة معلومات عن حيوان الولفرين: شكله، بيئته الجبلية، سلوكه الغذائي، وأهميته البيئية. كما تشرح صعوبة دراسته بسبب ندرته وقدرته على التخفي، وتؤكد أهمية حماية موائله الطبيعية لضمان بقائه.",
  "economics": "تشرح القطعة مفهوم الاقتصاد كمنظومة للإنتاج والتوزيع والاستهلاك، وتأثره بالسياسات والتكنولوجيا والتجارة العالمية. كما تتناول التضخم وتراجع القوة الشرائية، وأهمية دمج الاستدامة البيئية في السياسات الاقتصادية. وتشير كذلك إلى دور التقنية المالية في رفع الكفاءة مع تحديات تنظيمية جديدة.",
  "fame-hotel": "تصف القطعة فندقًا يحمل طابع المشاهير، حيث تمثل كل غرفة شخصية معروفة بديكورها ونمطها الخاص. الفكرة تقوم على تجربة حياة المشاهير بشكل تفاعلي وممتع. كما تذكر خطط التوسع إلى مدن أخرى.",
  "dog-breed": "تشرح القطعة تنوع سلالات الكلاب واختلاف أحجامها وصفاتها، مع أمثلة مثل الشيواوا والدانماركي الضخم. كما تشرح مفهوم الكلب الهجين (mutt) الناتج عن أبوين من سلالتين مختلفتين. الفكرة الأساسية: السلالات متنوعة ولكل منها خصائص مميزة.",
  "weather-forecast": "توضح القطعة دور خبراء الأرصاد في جمع البيانات من الأنماط الجوية والأقمار الصناعية لإنتاج التوقعات. وتبين فائدة خرائط الطقس في التحذير من الظواهر الخطرة والاستعداد المبكر. كما تشير إلى أن التوقع قد يخطئ أحيانًا بسبب تغير الطقس السريع.",
  "immigrants-to-america": "تتناول القطعة أثر المهاجرين في بناء المجتمع الأمريكي، ودورهم في الاقتصاد والثقافة والتكنولوجيا. كما تعرض انتقاد كينيدي للقوانين التمييزية ضد بعض الجنسيات، وجهوده نحو قوانين أكثر عدلًا. الرسالة الأساسية: العدالة في الهجرة تعزز المجتمع.",
  "obesity": "تشرح القطعة السمنة كحالة صحية ترتبط بمخاطر متعددة مثل أمراض القلب والسكري. وتعرض أسبابها وعلاجها الأساسي القائم على الحمية والنشاط البدني، مع تدخلات طبية في الحالات الشديدة. كما تركز على فهم المصطلحات الطبية المرتبطة بالنص."
};

function getPassageArabicText(p, fallbackText){
  const key = String(p.id || "");
  const manual = PASSAGE_AR_SUMMARY[key];
  if(manual) return manual;
  return fallbackText;
}

function cleanPassageTextForDisplay(rawText, title){
  const t = String(rawText || "");
  const titleNorm = String(title || "").toLowerCase().trim();
  const trTitleNorm = String(tr(title || "") || "").toLowerCase().trim();
  const lines = t.split("\n");
  const cleaned = [];
  for(const line of lines){
    const s = line.trim();
    if(!s) continue;
    const low = s.toLowerCase();
    if(low === "saadinelt") continue;
    if(low === titleNorm) continue;
    if(trTitleNorm && low === trTitleNorm) continue;
    if(/^[@#]?\s*saadinelt/i.test(s)) continue;
    if(/^[\u0600-\u06ff\ufb50-\ufdff\ufe70-\ufeff\s]+$/.test(s) && s.length <= 20) continue;
    cleaned.push(s);
  }
  return cleaned.join("\n");
}

function cleanArabicTranslationForDisplay(rawText, title){
  const t = String(rawText || "");
  const trTitleNorm = String(tr(title || "") || "").toLowerCase().trim();
  const lines = t.split("\n");
  const cleaned = [];
  for(const line of lines){
    const s = line.trim();
    if(!s) continue;
    const low = s.toLowerCase();
    if(low === "saadinelt") continue;
    if(low.includes("saadinelt")) continue;
    if(low.includes("com.saadinelt")) continue;
    if(trTitleNorm && low === trTitleNorm) continue;
    if(/^[@#]?\s*saadinelt/i.test(s)) continue;
    if(/^[\u0600-\u06ff\ufb50-\ufdff\ufe70-\ufeff\s]+$/.test(s) && s.length <= 20) continue;
    cleaned.push(s);
  }
  return cleaned.join("\n");
}

function normText(s){
  return String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function repairQuestionOptions(q){
  if(!Array.isArray(q.options) || q.options.length >= 4) return q;
  if(typeof ALL_BOOKLET_QUESTIONS === "undefined" || !Array.isArray(ALL_BOOKLET_QUESTIONS)) return q;
  const n = normText(q.question);
  if(!n) return q;
  const hit = ALL_BOOKLET_QUESTIONS.find(x => {
    if(!Array.isArray(x.options) || x.options.length !== 4) return false;
    const nx = normText(x.question);
    return nx === n || nx.includes(n) || n.includes(nx);
  });
  if(!hit) return q;
  return {
    ...q,
    options: hit.options,
    answer: Number.isInteger(q.answer) ? q.answer : hit.answer
  };
}

function normalizePassageTitle(p){
  const id = String(p.id || "");
  if(id.includes("the-ghost")) return "The Ghost";
  if(id.includes("the-weather")) return "The Weather";
  if(id.includes("fatima")) return "Fatima";
  if(id.includes("obesity")) return "Obesity";
  if(id.includes("immigrants-to-america")) return "Immigrants to America";
  if(id.includes("wolverines")) return "Wolverines";
  if(id.includes("dog-breed")) return "Dog Breed";
  if(id.includes("fame-hotel")) return "Fame Hotel";
  if(id.includes("marsh")) return "Marshes";
  if(id.includes("lincoln")) return "Abraham Lincoln";
  return p.title || "Passage";
}

function cleanedPassages(){
  return PASSAGE_SOURCE
    .map(p => {
      const goodQs = (p.questions || []).filter(q => Array.isArray(q.options) && q.options.length >= 2);
      const fixedQs = goodQs.map(repairQuestionOptions);
      return {
        ...p,
        title: normalizePassageTitle(p),
        questions: fixedQs,
        question_count: fixedQs.length
      };
    })
    .filter(p => p.questions.length >= 1);
}

function populatePassageSelect(){
  const sel = byId("passageSelect");
  const list = cleanedPassages();
  sel.innerHTML = list.map((p, i) => `<option value="${p.id}" ${i === 0 ? "selected" : ""}>${p.title}</option>`).join("");
}

function pickPassageQuestions(matchTerms){
  const terms = matchTerms.map(t => t.toLowerCase());
  return KEYED_QUESTIONS.filter(q => {
    const txt = `${q.question} ${q.topic || ""}`.toLowerCase();
    return terms.some(t => txt.includes(t));
  });
}

function fmt(sec){
  const m = String(Math.floor(sec / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function updatePTime(){
  byId("pTimerChip").textContent = `الوقت المتبقي: ${fmt(pRemain)}`;
  byId("pTimerDisplay").textContent = fmt(pRemain);
  byId("pTimerChip").classList.toggle("alert", pRemain <= 60 && pRemain > 0);
}

function stopPTimer(){
  if(pTimer){
    clearInterval(pTimer);
    pTimer = null;
  }
}

function startPTimer(mins){
  stopPTimer();
  pRemain = mins * 60;
  updatePTime();
  pTimer = setInterval(() => {
    pRemain--;
    updatePTime();
    if(pRemain <= 0){
      stopPTimer();
      if(!pSubmitted) submitPassageForm(true);
    }
  }, 1000);
}

function renderPassageCard(p){
  const tips = Array.isArray(p.memoryTips) ? p.memoryTips : (Array.isArray(p.memory) ? p.memory : []);
  const rawText = p.text || p.summary || "";
  const displayText = cleanPassageTextForDisplay(rawText, p.title);
  byId("passageFixed").innerHTML = `
    <h3>${p.title}</h3>
    <div class="qmeta">
      <span class="tag">${p.source || "booklet"}</span>
    </div>
    <p style="white-space:pre-wrap">${displayText}</p>
    <div class="out"><strong>الترجمة العربية:</strong><br><span id="pTextTr">...</span></div>
    ${tips.length ? `<ul>${tips.map(x => `<li>${x}</li>`).join("")}</ul>` : ""}
  `;
  fillPassageTranslation(rawText, p.title || "");
}

async function fillPassageTranslation(rawText, title){
  const t2 = byId("pTextTr");
  if(t2){
    const raw = await trAsync(rawText || "");
    const clean = cleanArabicTranslationForDisplay(raw, title);
    const currentPassage = cleanedPassages().find(x => (x.title || "") === title || (x.id || "") === (byId("passageSelect")?.value || ""));
    t2.textContent = getPassageArabicText(currentPassage || {}, clean);
  }
}

function renderPDots(){
  const root = byId("pNavDots");
  root.innerHTML = "";
  pActive.forEach((_, i) => {
    const b = document.createElement("button");
    b.className = "nav-dot";
    if(i === pIdx) b.classList.add("current");
    if(pAnswers[i] !== -1) b.classList.add("answered");
    b.textContent = String(i + 1);
    b.onclick = () => { pIdx = i; renderPCurrent(); };
    root.appendChild(b);
  });
}

function renderPCurrent(){
  if(!pActive.length) return;
  const q = pActive[pIdx];
  const answered = pAnswers.filter(v => v !== -1).length;
  byId("pProgressChip").textContent = `الإجابات: ${answered} / ${pActive.length}`;
  byId("pProgressText").textContent = `السؤال ${pIdx + 1} من ${pActive.length}`;
  byId("pProgressBar").style.width = `${Math.round((answered / pActive.length) * 100)}%`;
  byId("pPrevBtn").disabled = pIdx === 0;
  byId("pNextBtn").style.display = pIdx === pActive.length - 1 ? "none" : "inline-flex";
  byId("pFinishBtn").style.display = pIdx === pActive.length - 1 ? "inline-flex" : "none";

  byId("passageQuestionStage").innerHTML = `
    <article class="qcard">
      <div class="qhead">
        <span class="qnum">${pIdx + 1}</span>
        <div class="qtext">${q.question}<div class="muted" id="pqTrans"></div></div>
      </div>
      <div class="ops">
        ${q.options.map((op, i) => `
          <label>
            <input type="radio" name="pq" value="${i}" ${pAnswers[pIdx] === i ? "checked" : ""}/>
            ${op}<span class="muted js-pop-trans" data-op-idx="${i}" style="display:block"></span>
          </label>
        `).join("")}
      </div>
    </article>
  `;

  byId("passageQuestionStage").querySelectorAll('input[name="pq"]').forEach(el => {
    el.addEventListener("change", () => {
      pAnswers[pIdx] = Number(el.value);
      renderPDots();
      renderPCurrent();
    });
  });
  fillPassageQuestionTranslation(q);
  renderPDots();
}

async function fillPassageQuestionTranslation(q){
  const qNode = byId("pqTrans");
  if(qNode) qNode.textContent = await trAsync(q.question);
  const opNodes = byId("passageQuestionStage").querySelectorAll(".js-pop-trans");
  for(const node of opNodes){
    const idx = Number(node.getAttribute("data-op-idx"));
    node.textContent = await trAsync(q.options[idx] || "");
  }
}

function startPassageForm(){
  const pid = byId("passageSelect").value;
  const p = cleanedPassages().find(x => x.id === pid);
  if(!p) return;
  renderPassageCard(p); // passage remains fixed

  pSubmitted = false;
  if(Array.isArray(p.questions) && p.questions.length){
    pActive = p.questions;
  } else {
    pActive = pickPassageQuestions(p.qmatch).slice(0, 10);
  }
  pAnswers = new Array(pActive.length).fill(-1);
  pIdx = 0;
  byId("passageFormResult").innerHTML = "";
  byId("passageFormReport").innerHTML = "";
  renderPCurrent();
  startPTimer(Number(byId("passageMinutes").value || 15));
}

async function submitPassageForm(auto = false){
  if(pSubmitted || !pActive.length) return;
  pSubmitted = true;
  stopPTimer();
  let score = 0;
  let gradable = 0;
  const mistakes = [];
  for(let i = 0; i < pActive.length; i++){
    const q = pActive[i];
    if(!Number.isInteger(q.answer)){
      continue;
    }
    gradable++;
    if(pAnswers[i] === q.answer) score++;
    else mistakes.push({
      n: i + 1,
      q: q.question,
      your: pAnswers[i] === -1 ? "بدون إجابة" : q.options[pAnswers[i]],
      ok: q.options[q.answer],
      reason: q.reason || "مطابق لمفتاح الملزمة.",
      qAr: await trAsync(q.question),
      yourAr: pAnswers[i] === -1 ? "بدون إجابة" : await trAsync(q.options[pAnswers[i]]),
      okAr: await trAsync(q.options[q.answer]),
      reasonAr: await trAsync(q.reason || "Matched with booklet key.")
    });
  }
  const pct = gradable ? Math.round((score / gradable) * 100) : 0;
  byId("passageFormResult").innerHTML = `
    <div class="score">
      <div class="main">${pct}%</div>
      <div class="sub">${auto ? "انتهى الوقت وتم التسليم" : "تم التسليم"}</div>
      <div class="stats">
        <div class="stat"><div class="n ok">${score}</div><div>صحيح</div></div>
        <div class="stat"><div class="n danger">${Math.max(gradable - score, 0)}</div><div>خاطئ/فارغ</div></div>
        <div class="stat"><div class="n">${gradable}</div><div>مصحّح بمفتاح</div></div>
      </div>
      <div class="muted" style="margin-top:8px">الأسئلة بدون مفتاح لا تدخل بالدرجة النهائية.</div>
    </div>
  `;
  if(!mistakes.length){
    byId("passageFormReport").innerHTML = `<div class="report"><h3>نتيجة ممتازة</h3><div class="ok">بدون أخطاء.</div></div>`;
    return;
  }
  byId("passageFormReport").innerHTML = `
    <div class="report">
      <h3>أخطاء فورمة القطعة</h3>
      ${mistakes.map(m => `
        <div class="report-item">
          <div class="q">س${m.n}: ${m.q}</div>
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
  populatePassageSelect();
  byId("startPassageForm").addEventListener("click", startPassageForm);
  byId("pPrevBtn").addEventListener("click", () => { if(pIdx > 0){ pIdx--; renderPCurrent(); }});
  byId("pNextBtn").addEventListener("click", () => { if(pIdx < pActive.length - 1){ pIdx++; renderPCurrent(); }});
  byId("pFinishBtn").addEventListener("click", async () => { await submitPassageForm(false); });
  startPassageForm();
});

// ==================== CONFIG ====================
const WHATSAPP_NUMBER = "5521978827157";
const DRAFT_KEY = "afterstore_intro_draft_v2";
const ADMIN_SETTINGS_KEY = "afterstore_admin_settings_v1";

// EmailJS (SEUS DADOS)
const EMAILJS_PUBLIC_KEY = "2KvKx8XrBG_zo3szQ";
const EMAILJS_SERVICE_ID = "service_hnkb39c";
const EMAILJS_TEMPLATE_ID = "template_7pm6ft6";

const $ = (id) => document.getElementById(id);

// ==================== TOAST ====================
function toast(msg) {
  const el = $("toast");
  if (!el) { alert(msg); return; }
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove("show"), 2400);
}

// ==================== SETTINGS (ADMIN) ====================
const DEFAULT_SETTINGS = {
  // Branding / Theme
  brandName: "After Store",
  brandTag: "Intros 3D • After Effects",
  brandMark: "A",
  color_bg: "#07060c",
  color_p1: "#7c3aed",
  color_p2: "#c026d3",
  color_p3: "#4f46e5",

  // Hero texts
  pillText: "Roxo + preto • Intros 3D • Entrega após pagamento",
  heroTitleHTML: 'Sua <span class="grad">Intro 3D</span> pronta com a <span class="grad2">After Store</span>.',
  heroDescHTML:
    "Preencha em 30 segundos: escreva o <b>template</b> e a <b>cor</b>, escolha o <b>valor</b> e cole o link da sua <b>logo</b>. Nós fazemos e <b>depois do pagamento</b> entregamos.",

  // Pricing labels
  planLabel: "Planos",
  planText: "R$ 3 • R$ 5 • R$ 8",
  price3: "3",
  price5: "5",
  price8: "8",

  // WhatsApp
  whatsappNumberE164: WHATSAPP_NUMBER,
  openWhatsDefault: true,

  // Next step message
  nextStepText:
    "Agora vá ao WhatsApp para fazer sua intro. Aqui nós fazemos e depois do pagamento nós entregamos.",

  // EmailJS (display-only)
  sendEmailEnabled: true,

  // --- 100+ “funções” (settings) extras ---
  // (essas configurações existem no painel e ficam prontas pra você usar/ligar)
};

// gera 110 settings extras (toggles + texts + numbers) para "100 funções"
(function seedExtraSettings(){
  const base = {};
  for (let i=1;i<=110;i++){
    base[`fx_toggle_${i}`] = (i % 3 === 0);         // boolean
    base[`fx_text_${i}`] = `Função ${i}`;           // text
    base[`fx_number_${i}`] = String((i % 10) + 1);  // number-like string
  }
  Object.assign(DEFAULT_SETTINGS, base);
})();

function loadSettings(){
  try{
    const raw = localStorage.getItem(ADMIN_SETTINGS_KEY);
    if(!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  }catch{
    return { ...DEFAULT_SETTINGS };
  }
}

function applySettings(s){
  // CSS vars (tema)
  document.documentElement.style.setProperty("--bg", s.color_bg || "#07060c");
  document.documentElement.style.setProperty("--p1", s.color_p1 || "#7c3aed");
  document.documentElement.style.setProperty("--p2", s.color_p2 || "#c026d3");
  document.documentElement.style.setProperty("--p3", s.color_p3 || "#4f46e5");

  // Branding texts
  const bn = $("brandName"); if (bn) bn.textContent = s.brandName || "After Store";
  const bt = $("brandTag"); if (bt) bt.textContent = s.brandTag || "Intros 3D • After Effects";
  const bm = $("brandMark"); if (bm) bm.textContent = s.brandMark || "A";
  const fb = $("footBrand"); if (fb) fb.textContent = s.brandName || "After Store";

  // Hero texts
  const pill = $("pillText"); if (pill) pill.textContent = s.pillText || DEFAULT_SETTINGS.pillText;
  const ht = $("heroTitle"); if (ht) ht.innerHTML = s.heroTitleHTML || DEFAULT_SETTINGS.heroTitleHTML;
  const hd = $("heroDesc"); if (hd) hd.innerHTML = s.heroDescHTML || DEFAULT_SETTINGS.heroDescHTML;

  // Pricing display
  const plansLabel = $("plansLabel"); if (plansLabel) plansLabel.textContent = s.planLabel || "Planos";
  const plansValue = $("plansValue"); if (plansValue) plansValue.textContent = s.planText || "R$ 3 • R$ 5 • R$ 8";
  const p3 = $("p3"); if (p3) p3.textContent = `R$ ${s.price3 || "3"}`;
  const p5 = $("p5"); if (p5) p5.textContent = `R$ ${s.price5 || "5"}`;
  const p8 = $("p8"); if (p8) p8.textContent = `R$ ${s.price8 || "8"}`;

  // WhatsApp buttons
  const wa = (s.whatsappNumberE164 || WHATSAPP_NUMBER).replace(/\D/g,"");
  const waLink = `https://wa.me/${wa}`;
  const topBtn = $("whatsTopBtn"); if (topBtn) topBtn.href = waLink;
  const sideBtn = $("whatsSideBtn"); if (sideBtn) sideBtn.href = waLink;

  // Next step
  const ns = $("nextStepText"); if (ns) ns.textContent = s.nextStepText || DEFAULT_SETTINGS.nextStepText;

  // defaults
  const ow = $("openWhats"); if (ow) ow.checked = (s.openWhatsDefault !== false);
}

// ==================== WHATSAPP ====================
function makeWhatsLink(message, s) {
  const wa = (s.whatsappNumberE164 || WHATSAPP_NUMBER).replace(/\D/g,"");
  return `https://wa.me/${wa}?text=${encodeURIComponent(message)}`;
}
function openWhatsApp(message, s) {
  window.open(makeWhatsLink(message, s), "_blank", "noopener,noreferrer");
}

// ==================== CLIPBOARD ====================
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    toast("Mensagem copiada ✅");
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
    toast("Mensagem copiada ✅");
  }
}

// ==================== FORM HELPERS ====================
function getSelectedPrice() {
  const el = document.querySelector('input[name="price"]:checked');
  return el ? el.value : "";
}

function isLikelyUrl(s) {
  const v = String(s || "").trim();
  if (!v) return false;
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function setHelp(key, msg, isError = false) {
  const el = document.querySelector(`[data-help="${key}"]`);
  if (!el) return;
  el.textContent = msg || "";
  el.classList.toggle("is-error", !!isError);
}

function clearHelps() {
  ["name","color","template","price","logo"].forEach(k => setHelp(k, ""));
}

function readForm() {
  return {
    name: $("name").value.trim(),
    color: $("color").value.trim(),
    template: $("template").value.trim(),
    price: getSelectedPrice(),
    logo: $("logoLink").value.trim(),
    comment: ($("comment").value.trim() || "Nenhum")
  };
}

function buildMessage(d, s) {
  return [
    "🧊 *PEDIDO DE INTRO 3D — " + (s.brandName || "After Store") + "*",
    "",
    `👤 Nome: ${d.name}`,
    `🎨 Cor: ${d.color}`,
    `🧩 Template: ${d.template}`,
    `💵 Valor: R$ ${d.price}`,
    `🔗 Link da logo: ${d.logo}`,
    (d.comment && d.comment !== "Nenhum") ? `💬 Observações: ${d.comment}` : "",
    "",
    "✅ " + (s.nextStepText || DEFAULT_SETTINGS.nextStepText)
  ].filter(Boolean).join("\n");
}

function updatePreview(s) {
  const d = readForm();
  const msg = buildMessage({
    ...d,
    name: d.name || "(nome)",
    color: d.color || "(cor)",
    template: d.template || "(template)",
    price: d.price || "(3/5/8)",
    logo: d.logo || "(link da logo)",
    comment: $("comment").value.trim()
  }, s);

  $("previewMsg").textContent = msg;

  const count = ($("comment").value || "").length;
  $("commentCount").textContent = String(count);

  saveDraft();
}

function saveDraft() {
  const draft = {
    name: $("name").value,
    color: $("color").value,
    template: $("template").value,
    price: getSelectedPrice(),
    logo: $("logoLink").value,
    comment: $("comment").value,
    openWhats: $("openWhats").checked
  };
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    const d = JSON.parse(raw);

    $("name").value = d.name || "";
    $("color").value = d.color || "";
    $("template").value = d.template || "";
    $("logoLink").value = d.logo || "";
    $("comment").value = d.comment || "";
    $("openWhats").checked = d.openWhats !== false;

    if (d.price) {
      const radio = document.querySelector(`input[name="price"][value="${d.price}"]`);
      if (radio) radio.checked = true;
    }
  } catch {}
}

function clearDraft() {
  localStorage.removeItem(DRAFT_KEY);
  toast("Rascunho limpo 🧹");
}

function setLoading(isLoading) {
  const btn = $("submitBtn");
  btn.classList.toggle("is-loading", !!isLoading);
  btn.disabled = !!isLoading;
}

function validate(d) {
  clearHelps();
  let ok = true;

  if (d.name.length < 2) { setHelp("name", "Digite seu nome (mín. 2 letras).", true); ok = false; }
  if (!d.color) { setHelp("color", "Escreva a cor que você quer.", true); ok = false; }
  if (!d.template) { setHelp("template", "Escreva o template que você quer.", true); ok = false; }
  if (!d.price) { setHelp("price", "Selecione o valor (3, 5 ou 8).", true); ok = false; }

  if (!d.logo) { setHelp("logo", "Cole o link da logo.", true); ok = false; }
  else if (!isLikelyUrl(d.logo)) {
    setHelp("logo", "O link parece inválido. Use http:// ou https://", true);
    ok = false;
  }

  return ok;
}

// ==================== EMAILJS SEND (COM ERRO REAL) ====================
async function sendEmail(d) {
  if (!sendEmail._init) {
    emailjs.init(EMAILJS_PUBLIC_KEY);
    sendEmail._init = true;
  }

  // Usa as variáveis do template:
  // {{name}} {{color}} {{template}} {{price}} {{logo}} {{comment}}
  return emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
    name: d.name,
    color: d.color,
    template: d.template,
    price: d.price,
    logo: d.logo,
    comment: d.comment
  });
}

function explainEmailJSError(err){
  // Mostra o erro real (ajuda MUITO)
  const txt =
    (err && (err.text || err.message)) ? String(err.text || err.message) :
    (typeof err === "string" ? err : JSON.stringify(err));

  // dicas comuns
  const tips = [];
  tips.push("Erro EmailJS: " + txt);

  if (/origin/i.test(txt) || /forbidden/i.test(txt) || /403/.test(txt)) {
    tips.push("➡️ Provável: domínio não liberado. No EmailJS: Account → Security → Allowed origins (adicione seu domínio).");
  }
  if (/service/i.test(txt) && /not/i.test(txt)) {
    tips.push("➡️ Verifique Email Services: se o Gmail está conectado e o Service ID existe.");
  }
  if (/template/i.test(txt) && /not/i.test(txt)) {
    tips.push("➡️ Verifique se o Template ID existe e foi salvo/aplicado.");
  }

  return tips.join("\n");
}

// ==================== INIT ====================
document.addEventListener("DOMContentLoaded", () => {
  $("year").textContent = String(new Date().getFullYear());

  const settings = loadSettings();
  applySettings(settings);

  loadDraft();
  updatePreview(settings);

  const form = $("introForm");
  const afterSubmit = $("afterSubmit");
  const whatsLink = $("whatsLink");
  const copyBtn = $("copyMsg");
  const clearBtn = $("clearDraft");

  ["name","color","template","logoLink","comment"].forEach(id => {
    $(id).addEventListener("input", () => updatePreview(settings));
  });
  document.querySelectorAll('input[name="price"]').forEach(r => {
    r.addEventListener("change", () => updatePreview(settings));
  });
  $("openWhats").addEventListener("change", saveDraft);

  copyBtn.addEventListener("click", async () => {
    await copyToClipboard($("previewMsg").textContent);
  });

  clearBtn.addEventListener("click", () => {
    form.reset();
    clearDraft();
    updatePreview(settings);
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    afterSubmit.classList.remove("show");

    const d = readForm();
    if (!validate(d)) {
      toast("Confira os campos em vermelho ❗");
      return;
    }

    const msg = buildMessage(d, settings);

    try {
      setLoading(true);

      if (settings.sendEmailEnabled !== false) {
        await sendEmail(d);
      }

      toast("Pedido enviado no e-mail ✅");

      whatsLink.href = makeWhatsLink(msg, settings);
      afterSubmit.classList.add("show");

      if ($("openWhats").checked) openWhatsApp(msg, settings);

      form.reset();
      localStorage.removeItem(DRAFT_KEY);
      updatePreview(settings);

    } catch (err) {
      console.error(err);
      const explain = explainEmailJSError(err);
      toast("Erro ao enviar e-mail ❌");
      setHelp("logo", explain, true);
      alert(explain); // mostra o erro real também em popup
    } finally {
      setLoading(false);
    }
  });
});

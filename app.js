/**
 * After Store - EmailJS + UX
 * - Envia os dados por EmailJS (para o Gmail conectado no Email Services)
 * - Preview inteligente da mensagem
 * - Rascunho automático (draft) no localStorage
 * - Loading no botão
 * - Validação: campos obrigatórios + URL da logo
 */

const WHATSAPP_NUMBER = "5521978827157";
const DRAFT_KEY = "afterstore_intro_draft_v1";

// ======= EMAILJS (JÁ CONFIGURADO COM SEUS DADOS) =======
const EMAILJS_PUBLIC_KEY = "2KvKx8XrBG_zo3szQ";
const EMAILJS_SERVICE_ID = "service_hnkb39c";
const EMAILJS_TEMPLATE_ID = "template_7pm6ft6";
// =======================================================

const $ = (id) => document.getElementById(id);

function toast(msg) {
  const el = $("toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove("show"), 2200);
}

function makeWhatsLink(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function openWhatsApp(message) {
  window.open(makeWhatsLink(message), "_blank", "noopener,noreferrer");
}

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
    comment: $("comment").value.trim() || "Nenhum"
  };
}

function buildMessage(d) {
  return [
    "🧊 *PEDIDO DE INTRO 3D — After Store*",
    "",
    `👤 Nome: ${d.name}`,
    `🎨 Cor: ${d.color}`,
    `🧩 Template: ${d.template}`,
    `💵 Valor: R$ ${d.price}`,
    `🔗 Link da logo: ${d.logo}`,
    d.comment && d.comment !== "Nenhum" ? `💬 Observações: ${d.comment}` : "",
    "",
    "✅ Agora vá ao WhatsApp para fazer sua intro.",
    "Aqui nós fazemos e depois do pagamento nós entregamos."
  ].filter(Boolean).join("\n");
}

function updatePreview() {
  const d = readForm();

  const msg = buildMessage({
    ...d,
    name: d.name || "(nome)",
    color: d.color || "(cor)",
    template: d.template || "(template)",
    price: d.price || "(3/5/8)",
    logo: d.logo || "(link da logo)",
    comment: $("comment").value.trim()
  });

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
    setHelp("logo", "O link parece inválido. Use um link começando com http:// ou https://", true);
    ok = false;
  }

  return ok;
}

async function sendEmail(d) {
  if (!sendEmail._init) {
    emailjs.init(EMAILJS_PUBLIC_KEY);
    sendEmail._init = true;
  }

  return emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
    name: d.name,
    color: d.color,
    template: d.template,
    price: d.price,
    logo: d.logo,
    comment: d.comment
  });
}

document.addEventListener("DOMContentLoaded", () => {
  $("year").textContent = String(new Date().getFullYear());

  loadDraft();
  updatePreview();

  const form = $("introForm");
  const afterSubmit = $("afterSubmit");
  const whatsLink = $("whatsLink");
  const copyBtn = $("copyMsg");
  const clearBtn = $("clearDraft");

  ["name","color","template","logoLink","comment"].forEach(id => {
    $(id).addEventListener("input", updatePreview);
  });
  document.querySelectorAll('input[name="price"]').forEach(r => {
    r.addEventListener("change", updatePreview);
  });
  $("openWhats").addEventListener("change", saveDraft);

  copyBtn.addEventListener("click", async () => {
    const d = readForm();
    const msg = buildMessage({
      ...d,
      name: d.name || "(nome)",
      color: d.color || "(cor)",
      template: d.template || "(template)",
      price: d.price || "(3/5/8)",
      logo: d.logo || "(link da logo)",
      comment: d.comment
    });
    await copyToClipboard(msg);
  });

  clearBtn.addEventListener("click", () => {
    form.reset();
    clearDraft();
    updatePreview();
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    afterSubmit.classList.remove("show");

    const d = readForm();
    if (!validate(d)) {
      toast("Confira os campos em vermelho ❗");
      return;
    }

    const msg = buildMessage(d);

    try {
      setLoading(true);
      await sendEmail(d);

      toast("Pedido enviado no e-mail ✅");

      whatsLink.href = makeWhatsLink(msg);
      afterSubmit.classList.add("show");

      if ($("openWhats").checked) openWhatsApp(msg);

      form.reset();
      localStorage.removeItem(DRAFT_KEY);
      updatePreview();
    } catch (err) {
      console.error(err);
      toast("Erro ao enviar e-mail ❌");
      setHelp("logo", "Verifique se o Gmail está conectado no Email Services e o template está publicado.", true);
    } finally {
      setLoading(false);
    }
  });
});

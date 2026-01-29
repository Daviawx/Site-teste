// Número do WhatsApp que vai receber os pedidos:
const WHATSAPP_NUMBER = "5521978827157"; // 21 97882-7157

// Storage para salvar pedidos localmente:
const LS_KEY = "orders_v2";

// Helpers
function safeParse(json, fallback) {
  try { return JSON.parse(json); } catch { return fallback; }
}

function getOrders() {
  return safeParse(localStorage.getItem(LS_KEY), []);
}

function saveOrders(list) {
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}

function buildMessage(d) {
  const lines = [];
  lines.push("🛒 *NOVO PEDIDO — Sua Loja*");
  lines.push(`🕒 Data/Hora: ${d.date}`);
  lines.push("");
  lines.push(`👤 Nome: ${d.name}`);
  lines.push(`📱 WhatsApp do cliente: ${d.phone}`);
  lines.push("");
  lines.push(`📦 Produto: ${d.product}`);
  lines.push(`🔢 Quantidade: ${d.qty}`);
  if (d.variant) lines.push(`🎨 Cor/Tam/Modelo: ${d.variant}`);
  if (d.budget) lines.push(`💰 Orçamento máx.: R$ ${d.budget}`);
  if (d.payment) lines.push(`💳 Pagamento: ${d.payment}`);
  if (d.when) lines.push(`⏰ Quando: ${d.when}`);
  lines.push("");
  lines.push(`❓ Motivo da visita: ${d.reason}${(d.reason === "Outro" && d.other) ? " — " + d.other : ""}`);
  if (d.address) lines.push(`📍 Endereço/Bairro: ${d.address}`);
  if (d.comment) lines.push(`💬 Comentário: ${d.comment}`);
  lines.push(`✅ Consentimento promoções: ${d.consent ? "Sim" : "Não"}`);
  lines.push("");
  lines.push("Por favor, pode me confirmar disponibilidade e valor?");
  return lines.join("\n");
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
    alert("Mensagem copiada ✅");
  } catch {
    // fallback
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
    alert("Mensagem copiada ✅");
  }
}

// Init
document.getElementById("year").textContent = String(new Date().getFullYear());

const form = document.getElementById("orderForm");

// Campos
const reason = document.getElementById("reason");
const otherWrap = document.getElementById("otherWrap");
const other = document.getElementById("other");

function syncOther() {
  const show = reason.value === "Outro";
  otherWrap.style.display = show ? "flex" : "none";
  other.required = show;
  if (!show) other.value = "";
}
syncOther();
reason.addEventListener("change", syncOther);

// Pós-envio UI
const afterSubmit = document.getElementById("afterSubmit");
const whatsLink = document.getElementById("whatsLink");
const previewMsg = document.getElementById("previewMsg");
const copyMsgBtn = document.getElementById("copyMsg");

let lastMessage = "";

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const data = {
    date: new Date().toLocaleString("pt-BR"),
    name: document.getElementById("name").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    product: document.getElementById("product").value.trim(),
    qty: Number(document.getElementById("qty").value || 1),
    variant: document.getElementById("variant").value.trim(),
    budget: document.getElementById("budget").value.trim(),
    payment: document.getElementById("payment").value,
    when: document.getElementById("when").value,
    reason: document.getElementById("reason").value,
    other: document.getElementById("other").value.trim(),
    address: document.getElementById("address").value.trim(),
    comment: document.getElementById("comment").value.trim(),
    consent: document.getElementById("consent").checked
  };

  // validações extras
  if (data.name.length < 2) return alert("Digite seu nome (mínimo 2 letras).");
  if (!data.phone) return alert("Informe seu WhatsApp.");
  if (!data.product) return alert("Informe o produto que deseja comprar.");
  if (!data.qty || data.qty < 1) return alert("Quantidade inválida.");
  if (!data.reason) return alert("Selecione o motivo da visita.");
  if (data.reason === "Outro" && !data.other) return alert("Explique o motivo (campo 'Outro').");

  // salva no navegador
  const orders = getOrders();
  orders.unshift(data);
  saveOrders(orders);

  // monta mensagem e mostra painel
  lastMessage = buildMessage(data);
  previewMsg.textContent = lastMessage;
  whatsLink.href = makeWhatsLink(lastMessage);
  afterSubmit.classList.add("show");

  // abre WhatsApp com a mensagem pronta (pessoa confirma o envio)
  openWhatsApp(lastMessage);

  // limpa form (mas mantém painel pós-envio)
  form.reset();
  document.getElementById("qty").value = "1";
  syncOther();
});

copyMsgBtn.addEventListener("click", () => {
  if (!lastMessage) return alert("Nenhuma mensagem para copiar.");
  copyToClipboard(lastMessage);
});

// Export CSV
document.getElementById("exportCSV").addEventListener("click", () => {
  const orders = getOrders();
  if (!orders.length) return alert("Nenhum pedido salvo.");

  const header = [
    "Data","Nome","WhatsApp","Produto","Quantidade","Detalhes","Orçamento",
    "Pagamento","Quando","Motivo","OutroMotivo","Endereço","Comentário","Consentimento"
  ].join(",");

  const esc = (v) => `"${String(v ?? "").replaceAll('"', '""')}"`;

  const rows = orders.map(o => ([
    o.date, o.name, o.phone, o.product, o.qty, o.variant, o.budget,
    o.payment, o.when, o.reason, o.other, o.address, o.comment, o.consent ? "sim" : "nao"
  ].map(esc).join(",")));

  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `pedidos_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 500);
});

// Clear
document.getElementById("clearData").addEventListener("click", () => {
  localStorage.removeItem(LS_KEY);
  alert("Pedidos apagados.");
});

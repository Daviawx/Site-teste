const WHATSAPP_NUMBER = "5521978827157";

const $ = (id) => document.getElementById(id);

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
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
    alert("Mensagem copiada ✅");
  }
}

function getSelectedPrice() {
  const el = document.querySelector('input[name="price"]:checked');
  return el ? el.value : "";
}

function buildMessage(data) {
  return [
    "🧊 *PEDIDO DE INTRO 3D — After Store*",
    "",
    `👤 Nome: ${data.name}`,
    `🎨 Cor: ${data.color}`,
    `🧩 Template: ${data.template}`,
    `💵 Valor: R$ ${data.price}`,
    `🔗 Link da logo: ${data.logoLink}`,
    data.comment ? `💬 Observações: ${data.comment}` : "",
    "",
    "✅ Agora vá ao WhatsApp para fazer sua intro.",
    "Aqui nós fazemos e depois do pagamento nós entregamos.",
  ].filter(Boolean).join("\n");
}

document.addEventListener("DOMContentLoaded", () => {
  $("year").textContent = String(new Date().getFullYear());

  const form = $("introForm");
  const afterSubmit = $("afterSubmit");
  const whatsLink = $("whatsLink");
  const previewMsg = $("previewMsg");
  const copyBtn = $("copyMsg");

  let lastMessage = "";

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const data = {
      name: $("name").value.trim(),
      color: $("color").value,
      template: $("template").value,
      price: getSelectedPrice(),
      logoLink: $("logoLink").value.trim(),
      comment: $("comment").value.trim(),
    };

    if (data.name.length < 2) return alert("Digite seu nome.");
    if (!data.color) return alert("Selecione a cor.");
    if (!data.template) return alert("Selecione o template.");
    if (!data.price) return alert("Selecione o valor (3, 5 ou 8).");
    if (!data.logoLink) return alert("Cole o link da logo.");

    lastMessage = buildMessage(data);

    previewMsg.textContent = lastMessage;
    whatsLink.href = makeWhatsLink(lastMessage);
    afterSubmit.classList.add("show");

    // Abre WhatsApp com a mensagem pronta
    openWhatsApp(lastMessage);

    // limpa form
    form.reset();
  });

  copyBtn.addEventListener("click", () => {
    if (!lastMessage) return alert("Nada para copiar.");
    copyToClipboard(lastMessage);
  });
});

// ===============================
// CONFIG EMAILJS (OBRIGATÓRIO)
// ===============================
emailjs.init("2KvKx8XrBG_zo3szQ"); // 🔴 COLE SUA PUBLIC KEY

const SERVICE_ID = "service_hnkb39c";
const TEMPLATE_ID = "template_7pm6ft6";

// ===============================
const WHATSAPP_NUMBER = "5521978827157";
const form = document.getElementById("introForm");

function getSelectedPrice() {
  const el = document.querySelector('input[name="price"]:checked');
  return el ? el.value : "";
}

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const data = {
    name: name.value,
    color: color.value,
    template: template.value,
    price: getSelectedPrice(),
    logo: logoLink.value,
    comment: comment.value || "Nenhum"
  };

  if (!data.price) {
    alert("Selecione o valor.");
    return;
  }

  // ===============================
  // ENVIO EMAIL
  // ===============================
  emailjs.send(SERVICE_ID, TEMPLATE_ID, data)
    .then(() => {
      alert("Pedido enviado com sucesso! ✅");

      // ===============================
      // ABRE WHATSAPP
      // ===============================
      const msg =
`PEDIDO INTRO 3D - AFTER STORE

Nome: ${data.name}
Cor: ${data.color}
Template: ${data.template}
Valor: R$ ${data.price}
Logo: ${data.logo}

Após o pagamento entregamos a intro.`;

      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
      window.open(url, "_blank");

      form.reset();
    })
    .catch(err => {
      console.error(err);
      alert("Erro ao enviar e-mail ❌");
    });
});

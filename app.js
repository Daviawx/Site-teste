document.getElementById("introForm").addEventListener("submit", function () {
  const name = document.querySelector('[name="name"]').value;
  const color = document.querySelector('[name="color"]').value;
  const template = document.querySelector('[name="template"]').value;
  const price = document.querySelector('[name="price"]:checked')?.value || "";
  const logo = document.querySelector('[name="logo"]').value;
  const comment = document.querySelector('[name="comment"]').value || "Nenhum";

  const message =
`PEDIDO AFTER STORE

Nome: ${name}
Cor: ${color}
Template: ${template}
Valor: R$ ${price}
Logo: ${logo}
Observações: ${comment}

Após o pagamento entregamos a intro.`;

  const openWhats = document.getElementById("openWhats").checked;

  if (openWhats) {
    window.open(
      "https://wa.me/5521978827157?text=" + encodeURIComponent(message),
      "_blank"
    );
  }
});

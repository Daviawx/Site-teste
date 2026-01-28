/* =========================
   CONFIGURE AQUI 👇
========================= */
const STORE = {
  name: "Sua Loja",
  whatsappNumber: "5511999999999", // <-- troque: formato 55DDDNUMERO (sem +, sem espaços)
  pix: {
    key: "SUA-CHAVE-PIX-AQUI",
    name: "Seu Nome/Empresa",
    bank: "Seu Banco"
  },
  currency: "BRL",
  coupons: {
    // cupom: percentual
    "BEMVINDO10": 10,
    "OFF20": 20
  }
};

// Produtos (troque pelos seus)
const PRODUCTS = [
  {
    id: "p1",
    name: "Fone Bluetooth X",
    description: "Som limpo + bateria longa. Ideal para dia a dia.",
    price: 199.90,
    category: "Eletrônicos",
    tags: ["Promo", "Mais vendido"],
    icon: "🎧",
    featured: true
  },
  {
    id: "p2",
    name: "Smartwatch Fit Pro",
    description: "Monitoramento de saúde e treino com estilo.",
    price: 289.90,
    category: "Eletrônicos",
    tags: ["Novo"],
    icon: "⌚",
    featured: true
  },
  {
    id: "p3",
    name: "Camisa Premium",
    description: "Conforto e caimento perfeito, tecido macio.",
    price: 89.90,
    category: "Moda",
    tags: ["Top"],
    icon: "👕",
    featured: true
  },
  {
    id: "p4",
    name: "Perfume Intense 100ml",
    description: "Fixação marcante e fragrância sofisticada.",
    price: 159.90,
    category: "Beleza",
    tags: ["Presente"],
    icon: "🧴",
    featured: false
  },
  {
    id: "p5",
    name: "Kit Skincare",
    description: "Rotina completa para hidratação e limpeza.",
    price: 129.90,
    category: "Beleza",
    tags: ["Kit"],
    icon: "✨",
    featured: false
  },
  {
    id: "p6",
    name: "Mochila Urbana",
    description: "Resistente e espaçosa. Cabe notebook até 15”.",
    price: 149.90,
    category: "Acessórios",
    tags: ["Resistente"],
    icon: "🎒",
    featured: false
  }
];

/* =========================
   HELPERS
========================= */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const money = (value) => {
  const v = Number(value || 0);
  return v.toLocaleString("pt-BR", { style: "currency", currency: STORE.currency });
};

function toast(msg){
  const el = $("#toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(()=> el.classList.remove("show"), 2400);
}

function safeParse(json, fallback){
  try{ return JSON.parse(json); } catch { return fallback; }
}

/* =========================
   STATE (localStorage)
========================= */
const LS_KEY = "sualoja_cart_v1";
const LS_THEME = "sualoja_theme_v1";
const LS_COUPON = "sualoja_coupon_v1";
const LS_SHIPPING = "sualoja_shipping_v1";

let cart = safeParse(localStorage.getItem(LS_KEY), []);
let appliedCoupon = safeParse(localStorage.getItem(LS_COUPON), null); // {code, percent}
let shippingFee = Number(localStorage.getItem(LS_SHIPPING) || 0);

function saveCart(){
  localStorage.setItem(LS_KEY, JSON.stringify(cart));
}
function saveCoupon(){
  localStorage.setItem(LS_COUPON, JSON.stringify(appliedCoupon));
}
function saveShipping(){
  localStorage.setItem(LS_SHIPPING, String(shippingFee));
}

/* =========================
   RENDER PRODUCTS
========================= */
function buildCategories(){
  const cats = Array.from(new Set(PRODUCTS.map(p => p.category))).sort((a,b)=>a.localeCompare(b));
  const select = $("#category");
  select.innerHTML = `<option value="all">Todas</option>` + cats.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");
}

function escapeHtml(str){
  return String(str)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function getFilteredProducts(){
  const q = ($("#search").value || "").trim().toLowerCase();
  const cat = $("#category").value;
  const sort = $("#sort").value;

  let list = PRODUCTS.filter(p => {
    const okCat = (cat === "all" || p.category === cat);
    const text = `${p.name} ${p.description} ${(p.tags||[]).join(" ")} ${p.category}`.toLowerCase();
    const okQ = (!q || text.includes(q));
    return okCat && okQ;
  });

  switch(sort){
    case "priceAsc": list.sort((a,b)=>a.price-b.price); break;
    case "priceDesc": list.sort((a,b)=>b.price-a.price); break;
    case "nameAsc": list.sort((a,b)=>a.name.localeCompare(b.name)); break;
    case "featured":
    default:
      list.sort((a,b)=> Number(b.featured)-Number(a.featured) || a.name.localeCompare(b.name));
  }

  return list;
}

function renderProducts(){
  const grid = $("#productGrid");
  const list = getFilteredProducts();

  if(list.length === 0){
    grid.innerHTML = `<div class="card" style="padding:16px">Nenhum produto encontrado.</div>`;
    return;
  }

  grid.innerHTML = list.map(p => `
    <article class="product card">
      <div class="product__img" aria-hidden="true">${escapeHtml(p.icon || "🛒")}</div>
      <div class="product__title">
        <span>${escapeHtml(p.name)}</span>
        <span class="product__price">${money(p.price)}</span>
      </div>
      <p class="muted tiny">${escapeHtml(p.description || "")}</p>

      <div class="product__meta">
        <span class="chip">${escapeHtml(p.category)}</span>
        ${(p.tags || []).slice(0,2).map(t => `<span class="chip">${escapeHtml(t)}</span>`).join("")}
      </div>

      <div class="product__actions">
        <button class="btn btn--ghost" type="button" data-buy-now="${escapeHtml(p.id)}">Comprar</button>
        <button class="btn btn--primary" type="button" data-add="${escapeHtml(p.id)}">Adicionar</button>
      </div>
    </article>
  `).join("");
}

/* =========================
   CART LOGIC
========================= */
function findProduct(id){
  return PRODUCTS.find(p => p.id === id);
}
function getCartCount(){
  return cart.reduce((sum, it)=> sum + it.qty, 0);
}
function setCartCount(){
  $("#cartCount").textContent = String(getCartCount());
  $("#cartSub").textContent = `${getCartCount()} itens`;
}

function addToCart(id, qty=1){
  const p = findProduct(id);
  if(!p){ toast("Produto não encontrado."); return; }

  const existing = cart.find(it => it.id === id);
  if(existing) existing.qty += qty;
  else cart.push({ id, qty: qty });

  saveCart();
  setCartCount();
  renderCart();
  toast("Adicionado ao carrinho ✅");
}

function updateQty(id, qty){
  const it = cart.find(x=>x.id===id);
  if(!it) return;
  it.qty = Math.max(1, Math.min(99, Number(qty) || 1));
  saveCart();
  setCartCount();
  renderCart();
}

function removeFromCart(id){
  cart = cart.filter(x=>x.id!==id);
  saveCart();
  setCartCount();
  renderCart();
}

function clearCart(){
  cart = [];
  saveCart();
  appliedCoupon = null;
  saveCoupon();
  $("#coupon").value = "";
  toast("Carrinho limpo.");
  setCartCount();
  renderCart();
}

function calcSubtotal(){
  return cart.reduce((sum, it)=>{
    const p = findProduct(it.id);
    return sum + (p ? p.price * it.qty : 0);
  }, 0);
}

function calcDiscount(subtotal){
  if(!appliedCoupon) return 0;
  const percent = appliedCoupon.percent || 0;
  return subtotal * (percent/100);
}

function calcTotal(){
  const subtotal = calcSubtotal();
  const disc = calcDiscount(subtotal);
  const ship = Number(shippingFee || 0);
  return Math.max(0, subtotal - disc + ship);
}

function renderCart(){
  const wrap = $("#cartItems");

  if(cart.length === 0){
    wrap.innerHTML = `<div class="card" style="padding:14px">Seu carrinho está vazio.</div>`;
  } else {
    wrap.innerHTML = cart.map(it => {
      const p = findProduct(it.id);
      if(!p) return "";
      return `
      <div class="cartItem">
        <div class="cartItem__img" aria-hidden="true">${escapeHtml(p.icon || "🛒")}</div>
        <div>
          <div class="cartItem__title">${escapeHtml(p.name)}</div>
          <div class="muted tiny">${money(p.price)} • <span class="remove" data-remove="${escapeHtml(p.id)}">remover</span></div>
        </div>
        <div class="qty" aria-label="Quantidade">
          <button type="button" data-dec="${escapeHtml(p.id)}" aria-label="Diminuir">−</button>
          <input type="number" min="1" max="99" value="${it.qty}" data-qty="${escapeHtml(p.id)}" />
          <button type="button" data-inc="${escapeHtml(p.id)}" aria-label="Aumentar">+</button>
        </div>
      </div>
      `;
    }).join("");
  }

  // Totais
  const subtotal = calcSubtotal();
  const disc = calcDiscount(subtotal);
  $("#subtotal").textContent = money(subtotal);
  $("#discount").textContent = `- ${money(disc)}`;
  $("#shippingText").textContent = money(shippingFee);
  $("#total").textContent = money(calcTotal());
}

/* =========================
   DRAWER & MODAL
========================= */
function openDrawer(){
  const d = $("#cartDrawer");
  d.classList.add("open");
  d.setAttribute("aria-hidden", "false");
}
function closeDrawer(){
  const d = $("#cartDrawer");
  d.classList.remove("open");
  d.setAttribute("aria-hidden", "true");
}
function openPix(){
  const m = $("#pixModal");
  m.classList.add("open");
  m.setAttribute("aria-hidden", "false");
}
function closePix(){
  const m = $("#pixModal");
  m.classList.remove("open");
  m.setAttribute("aria-hidden", "true");
}

/* =========================
   CHECKOUT (WhatsApp)
========================= */
function buildOrderMessage(){
  const subtotal = calcSubtotal();
  const disc = calcDiscount(subtotal);
  const ship = Number(shippingFee || 0);
  const total = calcTotal();

  const lines = [];
  lines.push(`Olá! Quero finalizar um pedido na ${STORE.name}.`);
  lines.push("");
  lines.push("🧾 *Itens:*");

  cart.forEach((it, idx)=>{
    const p = findProduct(it.id);
    if(!p) return;
    const lineTotal = p.price * it.qty;
    lines.push(`${idx+1}. ${p.name} — ${it.qty}x — ${money(lineTotal)}`);
  });

  lines.push("");
  lines.push(`Subtotal: ${money(subtotal)}`);
  if(appliedCoupon) lines.push(`Desconto (${appliedCoupon.code} -${appliedCoupon.percent}%): -${money(disc)}`);
  if(ship > 0) lines.push(`Entrega: ${money(ship)}`);
  lines.push(`*Total: ${money(total)}*`);
  lines.push("");
  lines.push("📍 Endereço/Retirada:");
  lines.push("- ");
  lines.push("");
  lines.push("💳 Pagamento:");
  lines.push("- Pix / Cartão (se disponível)");
  lines.push("");
  lines.push("Pode me confirmar disponibilidade e prazo? Obrigado!");
  return lines.join("\n");
}

function openWhatsApp(message){
  const phone = STORE.whatsappNumber.replace(/\D/g,"");
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

/* =========================
   COUPON & SHIPPING
========================= */
function applyCoupon(){
  const code = ($("#coupon").value || "").trim().toUpperCase();
  if(!code){
    appliedCoupon = null;
    saveCoupon();
    renderCart();
    toast("Cupom removido.");
    return;
  }
  const percent = STORE.coupons[code];
  if(!percent){
    toast("Cupom inválido ❗");
    return;
  }
  appliedCoupon = { code, percent };
  saveCoupon();
  renderCart();
  toast(`Cupom ${code} aplicado (-${percent}%) ✅`);
}

function setShippingFromInput(){
  const v = Number($("#shipping").value || 0);
  shippingFee = Math.max(0, Math.min(9999, v));
  $("#shipping").value = String(shippingFee);
  saveShipping();
  renderCart();
}

/* =========================
   THEME
========================= */
function setTheme(mode){
  document.documentElement.setAttribute("data-theme", mode);
  localStorage.setItem(LS_THEME, mode);
  $("#btnTheme").innerHTML = (mode === "light" ? "🌞" : "🌙") + ' <span class="hide-sm">Tema</span>';
}
function initTheme(){
  const saved = localStorage.getItem(LS_THEME);
  if(saved === "light" || saved === "dark") setTheme(saved);
  else setTheme("dark");
}

/* =========================
   INIT
========================= */
function initPix(){
  $("#pixKey").textContent = STORE.pix.key;
  $("#pixName").textContent = STORE.pix.name;
  $("#pixBank").textContent = STORE.pix.bank;
}

function bindEvents(){
  // filtros
  $("#search").addEventListener("input", renderProducts);
  $("#category").addEventListener("change", renderProducts);
  $("#sort").addEventListener("change", renderProducts);

  // quick add do hero (p1)
  document.addEventListener("click", (e)=>{
    const t = e.target;
    if(!(t instanceof HTMLElement)) return;

    const quick = t.closest("[data-quick-add]");
    if(quick){
      addToCart(quick.getAttribute("data-quick-add"), 1);
      openDrawer();
      return;
    }

    const add = t.closest("[data-add]");
    if(add){
      addToCart(add.getAttribute("data-add"), 1);
      return;
    }

    const buy = t.closest("[data-buy-now]");
    if(buy){
      addToCart(buy.getAttribute("data-buy-now"), 1);
      openDrawer();
      return;
    }

    const rm = t.closest("[data-remove]");
    if(rm){
      removeFromCart(rm.getAttribute("data-remove"));
      return;
    }

    const inc = t.closest("[data-inc]");
    if(inc){
      const id = inc.getAttribute("data-inc");
      const it = cart.find(x=>x.id===id);
      if(it) updateQty(id, it.qty + 1);
      return;
    }

    const dec = t.closest("[data-dec]");
    if(dec){
      const id = dec.getAttribute("data-dec");
      const it = cart.find(x=>x.id===id);
      if(it) updateQty(id, it.qty - 1);
      return;
    }

    if(t.matches("[data-close-drawer]") || t.closest("[data-close-drawer]")){
      closeDrawer(); return;
    }
    if(t.matches("[data-close-pix]") || t.closest("[data-close-pix]")){
      closePix(); return;
    }
  });

  // quantidade manual
  document.addEventListener("input", (e)=>{
    const t = e.target;
    if(!(t instanceof HTMLElement)) return;
    if(t.matches("input[data-qty]")){
      const id = t.getAttribute("data-qty");
      updateQty(id, t.value);
    }
  });

  // abrir carrinho
  $("#btnCart").addEventListener("click", ()=>{ openDrawer(); });

  // checkout
  $("#btnCheckout").addEventListener("click", ()=>{
    if(cart.length === 0){ toast("Adicione produtos ao carrinho."); return; }
    openWhatsApp(buildOrderMessage());
  });

  $("#btnOpenCheckout").addEventListener("click", ()=>{
    openDrawer();
  });

  // cupons
  $("#btnApplyCoupon").addEventListener("click", applyCoupon);
  $("#coupon").addEventListener("keydown", (e)=>{
    if(e.key === "Enter") applyCoupon();
  });

  // frete
  $("#shipping").value = String(shippingFee);
  $("#shipping").addEventListener("change", setShippingFromInput);

  // pix
  $("#btnPix").addEventListener("click", ()=> openPix());
  $("#btnCopyPix").addEventListener("click", async ()=>{
    try{
      await navigator.clipboard.writeText(STORE.pix.key);
      toast("Chave Pix copiada ✅");
    }catch{
      // fallback
      const r = document.createRange();
      r.selectNodeContents($("#pixKey"));
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(r);
      toast("Selecione e copie a chave.");
    }
  });
  $("#btnSendProof").addEventListener("click", ()=>{
    const msg = `Olá! Segue meu comprovante do Pix. Pedido na ${STORE.name}.`;
    openWhatsApp(msg);
  });

  // limpar carrinho
  $("#btnClearCart").addEventListener("click", clearCart);

  // tema
  $("#btnTheme").addEventListener("click", ()=>{
    const current = document.documentElement.getAttribute("data-theme") || "dark";
    setTheme(current === "dark" ? "light" : "dark");
  });

  // demo fill
  $("#btnDemoFill").addEventListener("click", ()=>{
    addToCart("p1", 1);
    addToCart("p3", 2);
    addToCart("p6", 1);
    openDrawer();
  });

  // fechar com ESC
  document.addEventListener("keydown", (e)=>{
    if(e.key === "Escape"){
      closePix();
      closeDrawer();
    }
  });
}

function hydrateFromStorage(){
  // cupom
  if(appliedCoupon?.code){
    $("#coupon").value = appliedCoupon.code;
  }
}

function init(){
  // ano
  $("#year").textContent = String(new Date().getFullYear());

  initTheme();
  initPix();

  buildCategories();
  renderProducts();

  setCartCount();
  renderCart();
  hydrateFromStorage();

  bindEvents();
}

init();

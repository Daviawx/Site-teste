const ADMIN_USER = "davi";
const ADMIN_PASS = "123456";

const ADMIN_AUTH_KEY = "afterstore_admin_auth_v1";
const ADMIN_SETTINGS_KEY = "afterstore_admin_settings_v1";

const $ = (id) => document.getElementById(id);

function toast(msg){
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(()=>t.classList.remove("show"), 2200);
}

const DEFAULT_SETTINGS = {
  brandName: "After Store",
  brandTag: "Intros 3D • After Effects",
  brandMark: "A",
  color_bg: "#07060c",
  color_p1: "#7c3aed",
  color_p2: "#c026d3",
  color_p3: "#4f46e5",

  pillText: "Roxo + preto • Intros 3D • Entrega após pagamento",
  heroTitleHTML: 'Sua <span class="grad">Intro 3D</span> pronta com a <span class="grad2">After Store</span>.',
  heroDescHTML:
    "Preencha em 30 segundos: escreva o template e a cor, escolha o valor e cole o link da sua logo. Nós fazemos e depois do pagamento entregamos.",

  planLabel: "Planos",
  planText: "R$ 3 • R$ 5 • R$ 8",
  price3: "3",
  price5: "5",
  price8: "8",

  whatsappNumberE164: "5521978827157",
  openWhatsDefault: true,

  nextStepText:
    "Agora vá ao WhatsApp para fazer sua intro. Aqui nós fazemos e depois do pagamento nós entregamos.",

  sendEmailEnabled: true,
};

// cria 110 “funções/configurações”
(function seed(){
  for (let i=1;i<=110;i++){
    DEFAULT_SETTINGS[`fx_toggle_${i}`] = (i % 3 === 0);
    DEFAULT_SETTINGS[`fx_text_${i}`] = `Função ${i}`;
    DEFAULT_SETTINGS[`fx_number_${i}`] = String((i % 10) + 1);
  }
})();

function loadSettings(){
  try{
    const raw = localStorage.getItem(ADMIN_SETTINGS_KEY);
    if(!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  }catch{
    return { ...DEFAULT_SETTINGS };
  }
}

function saveSettings(obj){
  localStorage.setItem(ADMIN_SETTINGS_KEY, JSON.stringify(obj));
}

function isAuthed(){
  return localStorage.getItem(ADMIN_AUTH_KEY) === "1";
}

function setAuthed(v){
  localStorage.setItem(ADMIN_AUTH_KEY, v ? "1" : "0");
}

function makeField({key, label, type, value}){
  const wrap = document.createElement("label");
  wrap.innerHTML = `${label}<span class="muted tiny" style="font-weight:800; margin-top:-2px;">${key}</span>`;
  let el;

  if (type === "boolean"){
    el = document.createElement("select");
    el.innerHTML = `<option value="true">true</option><option value="false">false</option>`;
    el.value = String(!!value);
  } else if (type === "color"){
    el = document.createElement("input");
    el.type = "text";
    el.placeholder = "#7c3aed";
    el.value = value || "";
  } else if (type === "html"){
    el = document.createElement("textarea");
    el.rows = 3;
    el.value = value || "";
  } else {
    el = document.createElement("input");
    el.type = "text";
    el.value = (value ?? "");
  }

  el.dataset.key = key;
  el.dataset.type = type;
  wrap.appendChild(el);
  return wrap;
}

function renderTab(containerId, fields, settings){
  const box = $(containerId);
  box.innerHTML = "";
  fields.forEach(f=>{
    box.appendChild(makeField({
      key: f.key,
      label: f.label,
      type: f.type,
      value: settings[f.key]
    }));
  });
}

function collectFromUI(){
  const settings = loadSettings();
  const inputs = document.querySelectorAll("#panelBox [data-key]");
  inputs.forEach(el=>{
    const k = el.dataset.key;
    const t = el.dataset.type;
    if (t === "boolean") settings[k] = (el.value === "true");
    else settings[k] = el.value;
  });
  return settings;
}

function initTabs(){
  const tabs = document.querySelectorAll(".tab");
  tabs.forEach(btn=>{
    btn.addEventListener("click", ()=>{
      tabs.forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");
      const tab = btn.dataset.tab;

      document.querySelectorAll(".tabPane").forEach(p=>p.classList.add("hidden"));
      $(`tab_${tab}`).classList.remove("hidden");
    });
  });
}

function bootPanel(){
  const settings = loadSettings();

  // basic
  renderTab("tab_basic", [
    {key:"brandName", label:"Nome da Marca", type:"text"},
    {key:"brandTag", label:"Slogan", type:"text"},
    {key:"brandMark", label:"Letra/Ícone (1 char)", type:"text"},
    {key:"whatsappNumberE164", label:"WhatsApp (E164)", type:"text"},
    {key:"openWhatsDefault", label:"Abrir WhatsApp por padrão", type:"boolean"},
    {key:"sendEmailEnabled", label:"Enviar e-mail (EmailJS)", type:"boolean"},
  ], settings);

  // texts
  renderTab("tab_texts", [
    {key:"pillText", label:"Texto da pílula", type:"text"},
    {key:"heroTitleHTML", label:"Título (HTML)", type:"html"},
    {key:"heroDescHTML", label:"Descrição (HTML)", type:"html"},
    {key:"nextStepText", label:"Texto do Próximo Passo", type:"html"},
  ], settings);

  // theme
  renderTab("tab_theme", [
    {key:"color_bg", label:"Cor fundo (bg)", type:"color"},
    {key:"color_p1", label:"Cor primária", type:"color"},
    {key:"color_p2", label:"Cor acento", type:"color"},
    {key:"color_p3", label:"Cor secundária", type:"color"},
  ], settings);

  // prices
  renderTab("tab_prices", [
    {key:"planLabel", label:"Label planos", type:"text"},
    {key:"planText", label:"Texto do bloco de planos", type:"text"},
    {key:"price3", label:"Preço 3", type:"text"},
    {key:"price5", label:"Preço 5", type:"text"},
    {key:"price8", label:"Preço 8", type:"text"},
  ], settings);

  // whatsapp
  renderTab("tab_whatsapp", [
    {key:"whatsappNumberE164", label:"Número WhatsApp (E164)", type:"text"},
    {key:"openWhatsDefault", label:"Abrir WhatsApp ao enviar", type:"boolean"},
  ], settings);

  // advanced (110x3 = muitos itens)
  const advFields = [];
  for (let i=1;i<=110;i++){
    advFields.push({key:`fx_toggle_${i}`, label:`Função ${i} (toggle)`, type:"boolean"});
    advFields.push({key:`fx_text_${i}`, label:`Função ${i} (texto)`, type:"text"});
    advFields.push({key:`fx_number_${i}`, label:`Função ${i} (número)`, type:"text"});
  }
  renderTab("tab_advanced", advFields, settings);

  initTabs();
}

document.addEventListener("DOMContentLoaded", ()=>{
  const loginBox = $("loginBox");
  const panelBox = $("panelBox");

  function showPanel(){
    loginBox.classList.add("hidden");
    panelBox.classList.remove("hidden");
    bootPanel();
  }

  function showLogin(){
    loginBox.classList.remove("hidden");
    panelBox.classList.add("hidden");
  }

  if (isAuthed()) showPanel(); else showLogin();

  $("loginBtn").addEventListener("click", ()=>{
    const u = $("user").value.trim();
    const p = $("pass").value.trim();
    if (u === ADMIN_USER && p === ADMIN_PASS){
      setAuthed(true);
      toast("Logado ✅");
      showPanel();
    }else{
      toast("Usuário ou senha inválidos ❌");
    }
  });

  $("logoutBtn").addEventListener("click", ()=>{
    setAuthed(false);
    toast("Saiu.");
    showLogin();
  });

  $("saveBtn").addEventListener("click", ()=>{
    const data = collectFromUI();
    saveSettings(data);
    toast("Salvo ✅");
  });

  $("resetBtn").addEventListener("click", ()=>{
    saveSettings({ ...DEFAULT_SETTINGS });
    toast("Reset padrão ✅");
    bootPanel();
  });
});
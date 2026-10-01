const categories = [
  ["pc", "🖥️", "PC Gamer"],
  ["pecas", "🧩", "Peças de PC"],
  ["gpu", "🎮", "Placas de vídeo"],
  ["monitor", "📺", "Monitores"],
  ["celular", "📱", "Celulares"],
  ["periferico", "⌨️", "Periféricos"],
  ["audio", "🎧", "Áudio"],
  ["eletronicos", "⚡", "Eletrônicos"]
];

/*
  =====================================================
  CONFIGURAÇÃO DO WHATSAPP
  =====================================================

  Quando você tiver o link do grupo, coloque aqui.

  Exemplo:
  const WHATSAPP_GROUP = "https://chat.whatsapp.com/SEU-LINK";

  Por enquanto deixamos vazio para não abrir um link quebrado.
*/

const WHATSAPP_GROUP = "";


/*
  =====================================================
  PRODUTOS
  =====================================================

  O campo "url" será o link da oferta.

  Por enquanto está "#".
  Depois vamos colocar os seus links reais da
  Shopee, Mercado Livre e Amazon.
*/

const products = [

  {
    name: "Placa de vídeo RTX 4060 8GB",
    cat: "gpu",
    catName: "Placas de vídeo",
    store: "Shopee",
    price: "R$ 1.799",
    old: "R$ 2.199",
    icon: "🎮",
    badge: "OFERTA",
    url: "#"
  },

  {
    name: "Monitor Gamer 24\" 144Hz",
    cat: "monitor",
    catName: "Monitores",
    store: "Mercado Livre",
    price: "R$ 699",
    old: "R$ 899",
    icon: "🖥️",
    badge: "TOP",
    url: "#"
  },

  {
    name: "SSD NVMe 1TB",
    cat: "pecas",
    catName: "Peças de PC",
    store: "Amazon",
    price: "R$ 389",
    old: "R$ 479",
    icon: "💾",
    badge: "OFERTA",
    url: "#"
  },

  {
    name: "Teclado mecânico RGB",
    cat: "periferico",
    catName: "Periféricos",
    store: "Shopee",
    price: "R$ 129",
    old: "R$ 189",
    icon: "⌨️",
    badge: "ACHADO",
    url: "#"
  },

  {
    name: "Mouse Gamer sem fio",
    cat: "periferico",
    catName: "Periféricos",
    store: "Mercado Livre",
    price: "R$ 159",
    old: "R$ 229",
    icon: "🖱️",
    badge: "TOP",
    url: "#"
  },

  {
    name: "Memória RAM 16GB DDR4",
    cat: "pecas",
    catName: "Peças de PC",
    store: "Amazon",
    price: "R$ 249",
    old: "R$ 329",
    icon: "🧠",
    badge: "OFERTA",
    url: "#"
  },

  {
    name: "Celular 256GB",
    cat: "celular",
    catName: "Celulares",
    store: "Shopee",
    price: "R$ 999",
    old: "R$ 1.199",
    icon: "📱",
    badge: "OFERTA",
    url: "#"
  },

  {
    name: "Headset Gamer 7.1",
    cat: "audio",
    catName: "Áudio",
    store: "Amazon",
    price: "R$ 219",
    old: "R$ 299",
    icon: "🎧",
    badge: "TOP",
    url: "#"
  },

  {
    name: "PC Gamer Ryzen 5",
    cat: "pc",
    catName: "PC Gamer",
    store: "Mercado Livre",
    price: "R$ 2.999",
    old: "R$ 3.499",
    icon: "🖥️",
    badge: "OFERTA",
    url: "#"
  },

  {
    name: "Fonte 650W 80 Plus",
    cat: "pecas",
    catName: "Peças de PC",
    store: "Shopee",
    price: "R$ 279",
    old: "R$ 349",
    icon: "🔌",
    badge: "ACHADO",
    url: "#"
  }

];


const $ = selector => document.querySelector(selector);

let category = "todos";
let store = "Todas";


/*
  =====================================================
  CATEGORIAS
  =====================================================
*/

function renderCategories() {

  $("#categories").innerHTML = categories
    .map(([key, icon, name]) => `
      <button class="category" data-cat="${key}">
        <span class="icon">${icon}</span>
        <strong>${name}</strong>
        <small>Ver ofertas →</small>
      </button>
    `)
    .join("");

}


/*
  =====================================================
  PRODUTOS
  =====================================================
*/

function renderProducts() {

  const q = $("#search").value.trim().toLowerCase();

  const list = products.filter(product => {

    const text = `
      ${product.name}
      ${product.catName}
      ${product.store}
    `.toLowerCase();

    const categoryMatch =
      category === "todos" ||
      product.cat === category;

    const storeMatch =
      store === "Todas" ||
      product.store === store;

    const searchMatch =
      !q ||
      text.includes(q);

    return categoryMatch &&
           storeMatch &&
           searchMatch;

  });


  $("#count").textContent =
    `${list.length} oferta${list.length === 1 ? "" : "s"}`;


  $("#products").innerHTML = list
    .map(product => `

      <article class="product">

        <div class="photo">

          <span class="badge">
            ${product.badge}
          </span>

          <span class="store">
            ${product.store}
          </span>

          <span>
            ${product.icon}
          </span>

        </div>


        <div class="info">

          <span class="cat">
            ${product.catName}
          </span>

          <h3>
            ${product.name}
          </h3>

          <div class="old">
            ${product.old}
          </div>

          <div class="price">
            ${product.price}
          </div>

          <a
            class="buy"
            href="${product.url}"
            target="_blank"
            rel="noopener noreferrer"
          >
            VER OFERTA →
          </a>

        </div>

      </article>

    `)
    .join("");


  $("#empty").hidden = list.length > 0;

}


/*
  =====================================================
  CLIQUE NAS CATEGORIAS
  =====================================================
*/

$("#categories").addEventListener("click", event => {

  const button = event.target.closest("[data-cat]");

  if (!button) return;

  category = button.dataset.cat;

  document
    .querySelectorAll(".category")
    .forEach(item => {
      item.classList.toggle(
        "active",
        item === button
      );
    });

  renderProducts();

  document
    .querySelector(".offers")
    .scrollIntoView({
      behavior: "smooth"
    });

});


/*
  =====================================================
  FILTROS DAS LOJAS
  =====================================================
*/

$("#filters").addEventListener("click", event => {

  const button = event.target.closest("[data-store]");

  if (!button) return;

  store = button.dataset.store;

  document
    .querySelectorAll(".filter")
    .forEach(item => {
      item.classList.toggle(
        "active",
        item === button
      );
    });

  renderProducts();

});


/*
  =====================================================
  BUSCA
  =====================================================
*/

$("#search").addEventListener(
  "input",
  renderProducts
);


$("#clearSearch").addEventListener(
  "click",
  () => {

    $("#search").value = "";

    renderProducts();

    $("#search").focus();

  }
);


/*
  =====================================================
  VER TODAS AS CATEGORIAS
  =====================================================
*/

$("#allCategories").addEventListener(
  "click",
  () => {

    category = "todos";

    document
      .querySelectorAll(".category")
      .forEach(item => {
        item.classList.remove("active");
      });

    renderProducts();

    document
      .querySelector(".section")
      .scrollIntoView({
        behavior: "smooth"
      });

  }
);


/*
  =====================================================
  MODAL DO WHATSAPP
  =====================================================
*/

const modal = $("#modal");


function openModal() {

  modal.hidden = false;

}


function closeModal() {

  modal.hidden = true;

}


$("#openWhatsApp").addEventListener(
  "click",
  openModal
);


$("#closeModal").addEventListener(
  "click",
  closeModal
);


$("#continueBtn").addEventListener(
  "click",
  closeModal
);


modal.addEventListener(
  "click",
  event => {

    if (event.target === modal) {
      closeModal();
    }

  }
);


/*
  =====================================================
  LINK DO WHATSAPP
  =====================================================
*/

const whatsappLink = $("#whatsappLink");


if (WHATSAPP_GROUP) {

  whatsappLink.href = WHATSAPP_GROUP;

} else {

  whatsappLink.href = "#";

  whatsappLink.addEventListener(
    "click",
    event => {
      event.preventDefault();
      alert(
        "O link do grupo do WhatsApp ainda não foi configurado."
      );
    }
  );

}


/*
  =====================================================
  INICIALIZAÇÃO
  =====================================================
*/

renderCategories();

renderProducts();

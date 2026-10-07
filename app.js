const categories = [
  ["pc", "🖥️", "PC Gamer"],
  ["hardware", "🧩", "Hardware"],
  ["monitor", "📺", "Monitores"],
  ["periferico", "⌨️", "Periféricos e Áudio"],
  ["celular", "📱", "Celulares e Eletrônicos"]
];


/* CONFIGURAÇÃO DO WHATSAPP */

const WHATSAPP_GROUP = 
  "https://chat.whatsapp.com/KrCnqmvJbnLBexgdrF03j9";


/* GOOGLE SHEETS (planilha publicada em CSV) */

const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQzzZ4WRBTBBG5Ao1hCdAzKACD6o51WpM4NjOJPciID9Z0fpFwU10Ynj5mVizSOoQ/pub?output=csv";


/* PRODUTOS */

let products = [];


/* ELEMENTOS */

const $ = selector => document.querySelector(selector);

let category = "todos";
let store = "Todas";


/* FUNÇÕES AUXILIARES */

function normalize(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}


function categoryInfo(categoryName) {

  const name = normalize(categoryName);

  const found = categories.find(
    ([key, icon, label]) =>
      normalize(label) === name
  );

  if (found) {
    return {
      cat: found[0],
      icon: found[1],
      catName: found[2]
    };
  }

  return {
    cat: "celular",
    icon: "⚡",
    catName: categoryName || "Celulares e Eletrônicos"
  };
}


function formatPrice(value) {

  if (value === null || value === undefined || value === "") {
    return "";
  }

  const text = String(value).trim();

  if (text.includes("R$")) {
    return text;
  }

  const number = Number(
    text
      .replace(/\./g, "")
      .replace(",", ".")
      .replace(/[^\d.-]/g, "")
  );

  if (Number.isNaN(number)) {
    return text;
  }

  return number.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}


/* LEITOR DE CSV */

function parseCSV(text) {

  const rows = [];
  let row = [];
  let cell = "";
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {

    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && insideQuotes && next === '"') {
      cell += '"';
      i++;
      continue;
    }

    if (char === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (char === "," && !insideQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }

    if (
      (char === "\n" || char === "\r") &&
      !insideQuotes
    ) {

      if (char === "\r" && next === "\n") {
        i++;
      }

      row.push(cell);
      rows.push(row);

      row = [];
      cell = "";

      continue;
    }

    cell += char;
  }

  if (cell !== "" || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return rows;
}


/* CARREGAR PRODUTOS DA PLANILHA */

async function loadProducts() {

  try {

    const response = await fetch(
      SHEET_CSV_URL + "&cache=" + Date.now()
    );

    if (!response.ok) {
      throw new Error("Não foi possível acessar a planilha.");
    }

    const csv = await response.text();

    const rows = parseCSV(csv);

    if (!rows.length) {
      throw new Error("A planilha está vazia.");
    }

    const headers = rows[0].map(header =>
      normalize(header)
    );

    const getValue = (row, columnName) => {

      const index = headers.indexOf(
        normalize(columnName)
      );

      if (index === -1) {
        return "";
      }

      return row[index] || "";
    };


    products = rows
      .slice(1)
      .map(row => {

        const name = getValue(row, "Produto");
        const categoryName = getValue(row, "Categoria");
        const storeName = getValue(row, "Loja");
        const price = getValue(row, "Preço Atual");
        const oldPrice = getValue(row, "Preço Anterior");
        const badge = getValue(row, "Badge");
        const url = getValue(row, "Link da Oferta");
        const image = getValue(row, "Imagem");
        const active = getValue(row, "Ativo");

        const info = categoryInfo(categoryName);

        return {

          name: name,

          cat: info.cat,

          catName: info.catName,

          store: storeName,

          price: formatPrice(price),

          old: formatPrice(oldPrice),

          icon: info.icon,
          image: image,

          badge: badge || "OFERTA",

          url: url || "#",

          active:
            normalize(active) !== "nao" &&
            normalize(active) !== "não" &&
            normalize(active) !== "false"

        };

      })
      .filter(product =>
        product.name &&
        product.active
      );


    renderProducts();

  } catch (error) {

    console.error(
      "Erro ao carregar produtos:",
      error
    );

    $("#products").innerHTML = `
      <div class="empty-message">
        Não foi possível carregar as ofertas agora.
      </div>
    `;

    $("#empty").hidden = true;

  }

}


/* CATEGORIAS */

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


/* PRODUTOS */

function renderProducts() {

  const words = normalize($("#search").value)
    .split(/\s+/)
    .filter(Boolean);

  const list = products.filter(product => {

    const text = normalize(
      `${product.name} ${product.catName} ${product.store}`
    );


    const categoryMatch =
      category === "todos" ||
      product.cat === category;


    const storeMatch =
      store === "Todas" ||
      product.store === store;


    const searchMatch =
      words.every(word => text.includes(word));


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

          <img
            src="${product.image || ''}"
            alt="${product.name}"
            loading="lazy"
            referrerpolicy="no-referrer"
            onerror="this.style.display='none'; this.insertAdjacentHTML('afterend','<span style=&quot;font-size:48px&quot;>${product.icon}</span>')"
          >

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


/* CLIQUE NAS CATEGORIAS */

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


/* FILTROS DAS LOJAS */

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


/* BUSCA */

function goToOffers() {

  document
    .querySelector(".offers")
    .scrollIntoView({
      behavior: "smooth"
    });

}


/* Teclado do celular mostra o botão "Buscar" */
$("#search").setAttribute("enterkeyhint", "search");


/* Filtra enquanto digita (em todas as categorias) */
$("#search").addEventListener(
  "input",
  () => {

    if ($("#search").value.trim() !== "") {

      category = "todos";

      document
        .querySelectorAll(".category")
        .forEach(item => {
          item.classList.remove("active");
        });

    }

    renderProducts();

  }
);


/* Ao apertar Enter / Buscar: fecha o teclado e vai até as ofertas */
$("#search").addEventListener(
  "keydown",
  event => {

    if (event.key !== "Enter") return;

    event.preventDefault();

    $("#search").blur();

    goToOffers();

  }
);


$("#clearSearch").addEventListener(
  "click",
  () => {

    $("#search").value = "";

    renderProducts();

    $("#search").focus();

  }
);


/* VER TODAS AS CATEGORIAS */

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


/* MODAL DO WHATSAPP */

const modal = $("#modal");


/*
  Aparece sozinha na primeira visita (depois de alguns segundos)
  e só volta a aparecer depois de alguns dias.
*/

const POPUP_DELAY_SECONDS = 1,5;   // quanto tempo depois de entrar no site
const POPUP_REPEAT_DAYS = 7;     // de quantos em quantos dias pode voltar a aparecer
const POPUP_KEY = "mydaztech_whatsapp_popup";


function popupAlreadySeen() {

  try {

    const last = Number(localStorage.getItem(POPUP_KEY));

    if (!last) return false;

    const days = (Date.now() - last) / (1000 * 60 * 60 * 24);

    return days < POPUP_REPEAT_DAYS;

  } catch (error) {

    return false;

  }

}


function markPopupSeen() {

  try {
    localStorage.setItem(POPUP_KEY, String(Date.now()));
  } catch (error) {
    /* navegador bloqueou o armazenamento: sem problema */
  }

}


function showPopupAutomatically() {

  /* Para testar: abra o site com ?popup no final do endereço */
  const forced = new URLSearchParams(location.search).has("popup");

  if (!forced && popupAlreadySeen()) return;

  setTimeout(() => {

    const typing = document.activeElement === $("#search");

    if (modal.hidden && !typing) {
      openModal();
    }

  }, POPUP_DELAY_SECONDS * 1000);

}


function openModal() {

  modal.hidden = false;

  document.body.style.overflow = "hidden";

}


function closeModal() {

  modal.hidden = true;

  document.body.style.overflow = "";

  markPopupSeen();

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


/* Tecla ESC também fecha */
document.addEventListener(
  "keydown",
  event => {

    if (event.key === "Escape" && !modal.hidden) {
      closeModal();
    }

  }
);


/* LINK DO WHATSAPP */

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


/* INICIALIZAÇÃO */

renderCategories();

loadProducts();

showPopupAutomatically();

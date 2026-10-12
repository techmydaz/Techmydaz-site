/* ÍCONES DAS CATEGORIAS (linhas finas, herdam a cor dourada do CSS) */

const svg = content =>
  `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${content}</svg>`;

const ICONS = {

  pc: svg(`
    <rect x="6" y="2.5" width="12" height="19" rx="2"/>
    <circle cx="12" cy="10" r="3"/>
    <path d="M9.5 17h5"/>
  `),

  hardware: svg(`
    <rect x="7" y="7" width="10" height="10" rx="1.5"/>
    <rect x="10" y="10" width="4" height="4"/>
    <path d="M9.5 3.5v3.5M14.5 3.5v3.5M9.5 17v3.5M14.5 17v3.5M3.5 9.5H7M3.5 14.5H7M17 9.5h3.5M17 14.5h3.5"/>
  `),

  monitor: svg(`
    <rect x="3" y="4" width="18" height="12" rx="2"/>
    <path d="M9 20h6M12 16v4"/>
  `),

  periferico: svg(`
    <path d="M4 14v-2a8 8 0 0 1 16 0v2"/>
    <rect x="3" y="14" width="4" height="6" rx="1.5"/>
    <rect x="17" y="14" width="4" height="6" rx="1.5"/>
  `),

  celular: svg(`
    <rect x="7" y="2.5" width="10" height="19" rx="2.5"/>
    <path d="M11 18.5h2"/>
  `),

  games: svg(`
    <path d="M7 7.5h10a4.5 4.5 0 0 1 4.4 3.6l.8 4a2.6 2.6 0 0 1-4.4 2.3L15.8 15H8.2l-2 1.9a2.6 2.6 0 0 1-4.4-2.3l.8-4A4.5 4.5 0 0 1 7 7.5z"/>
    <path d="M8.5 10v3.5M6.8 11.75h3.4"/>
    <circle cx="15.3" cy="11" r=".7"/>
    <circle cx="17.3" cy="12.8" r=".7"/>
  `),

  setup: svg(`
    <rect x="7" y="2.5" width="10" height="9.5" rx="2.2"/>
    <rect x="5" y="13" width="14" height="3" rx="1.5"/>
    <path d="M12 16v3.5M8 21h8"/>
  `)

};


const categories = [
  ["pc", ICONS.pc, "Computadores"],
  ["hardware", ICONS.hardware, "Hardware"],
  ["monitor", ICONS.monitor, "Monitores"],
  ["periferico", ICONS.periferico, "Periféricos e Áudio"],
  ["games", ICONS.games, "Games"],
  ["celular", ICONS.celular, "Celulares e Eletrônicos"],
  ["setup", ICONS.setup, "Setup e Gadgets"]
];


/*
  NOMES ANTIGOS / ALTERNATIVOS
  Se na planilha estiver escrito um destes nomes, o produto vai
  para a categoria indicada (assim você não precisa mudar tudo).
*/

const categoryAliases = {
  "pc gamer": "computadores",
  "pcs e notebooks": "computadores",
  "computador": "computadores",
  "notebooks": "computadores",
  "game": "games",
  "videogames": "games",
  "video games": "games",
  "jogos": "games",
  "consoles": "games",
  "games e consoles": "games",
  "setup": "setup e gadgets",
  "setup e casa": "setup e gadgets",
  "gadgets": "setup e gadgets",
  "cadeiras": "setup e gadgets",
  "decoracao": "setup e gadgets"
};


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


/* Protege o texto que vem da planilha antes de colocar na página */
function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}


/* Só aceita links que começam com http:// ou https:// */
function safeUrl(value) {
  const url = String(value || "").trim();
  return /^https?:\/\//i.test(url) ? url : "#";
}


/* Identifica a loja para pintar com a cor dela */
function storeKey(storeName) {

  const name = normalize(storeName);

  if (name.includes("shopee")) return "shopee";
  if (name.includes("mercado")) return "mercadolivre";
  if (name.includes("amazon")) return "amazon";

  return "outra";
}


function categoryInfo(categoryName) {

  let name = normalize(categoryName);

  if (categoryAliases[name]) {
    name = categoryAliases[name];
  }

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
    icon: ICONS.celular,
    catName: categoryName || "Celulares e Eletrônicos"
  };
}


/* Converte "R$ 1.393,70", "1393,70" ou "1393.70" em número */
function parsePrice(value) {

  const text = String(value || "").trim();

  if (!text) return null;

  let t = text.replace(/[^\d.,-]/g, "");

  if (!t) return null;

  if (t.includes(",")) {
    t = t.replace(/\./g, "").replace(",", ".");
  } else if (/^\d{1,3}(\.\d{3})+$/.test(t)) {
    t = t.replace(/\./g, "");
  }

  const number = Number(t);

  return Number.isFinite(number) && number > 0 ? number : null;
}


function formatMoney(number) {

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


/*
  CARREGAR PRODUTOS DA PLANILHA

  Formato novo: uma linha por produto, com um par de colunas por loja:
  "<Loja> Preço" e "<Loja> Link"  (ex.: Shopee Preço / Shopee Link).
  Qualquer loja nova funciona: basta criar as duas colunas.

  Formato antigo (Loja / Preço Atual / Link da Oferta) continua funcionando.
*/

async function loadProducts() {

  try {

    const response = await fetch(
      SHEET_CSV_URL + "&cache=" + Date.now()
    );

    if (!response.ok) {
      throw new Error("Não foi possível acessar a planilha.");
    }

    const csv = (await response.text()).replace(/^\uFEFF/, "");

    const rows = parseCSV(csv);

    if (!rows.length) {
      throw new Error("A planilha está vazia.");
    }

    const rawHeaders = rows[0].map(header => String(header).trim());

    const headers = rawHeaders.map(header => normalize(header));

    const getValue = (row, columnName) => {

      const index = headers.indexOf(
        normalize(columnName)
      );

      if (index === -1) {
        return "";
      }

      return String(row[index] || "").trim();
    };


    /* Descobre as lojas pelas colunas "<Loja> Preço" + "<Loja> Link" */

    const storeColumns = [];

    headers.forEach((header, index) => {

      if (!header.endsWith(" preco")) return;

      const label = rawHeaders[index]
        .replace(/\s*pre[cç]o\s*$/i, "")
        .trim();

      const linkIndex = headers.indexOf(normalize(label) + " link");

      if (!label || linkIndex === -1) return;

      storeColumns.push({
        label: label,
        priceIndex: index,
        linkIndex: linkIndex
      });

    });


    products = rows
      .slice(1)
      .map(row => {

        const name = getValue(row, "Produto");
        const info = categoryInfo(getValue(row, "Categoria"));
        const active = getValue(row, "Ativo");

        const offers = [];

        const loosePrices = [];   /* preços sem link (coluna de outra loja) */
        const missingPrice = [];  /* lojas com link e sem preço */

        storeColumns.forEach(column => {

          const url = String(row[column.linkIndex] || "").trim();

          const priceValue = parsePrice(row[column.priceIndex]);

          if (priceValue !== null && !url) loosePrices.push(priceValue);

          if (url && priceValue === null) missingPrice.push(normalize(column.label));

          if (!url) return;

          offers.push({
            store: column.label,
            key: normalize(column.label),
            color: storeKey(column.label),
            price: parsePrice(row[column.priceIndex]),
            url: safeUrl(url)
          });

        });


        /* formato antigo: uma loja por linha */

        const oldStore = getValue(row, "Loja");
        const oldUrl = getValue(row, "Link da Oferta");

        if (
          oldStore &&
          oldUrl &&
          !offers.some(offer => offer.key === normalize(oldStore))
        ) {

          offers.push({
            store: oldStore,
            key: normalize(oldStore),
            color: storeKey(oldStore),
            price: parsePrice(getValue(row, "Preço Atual")),
            url: safeUrl(oldUrl)
          });

        }


        /*
          Preço digitado na coluna errada: se a linha tem um único preço
          sem link e a coluna "Loja" aponta para uma loja que tem link mas
          ficou sem preço, o preço é passado para essa loja.
        */

        if (loosePrices.length === 1 && missingPrice.length > 0) {

          const rowStore = normalize(getValue(row, "Loja"));

          const target = rowStore
            ? missingPrice.find(key => key === rowStore)
            : (missingPrice.length === 1 ? missingPrice[0] : undefined);

          const offer = offers.find(item => item.key === target);

          if (offer && offer.price === null) {
            offer.price = loosePrices[0];
          }

        }


        /* mais barata primeiro; sem preço vai para o fim */

        offers.sort((a, b) => {

          const priceA = a.price === null ? Infinity : a.price;
          const priceB = b.price === null ? Infinity : b.price;

          if (priceA === priceB) return 0;

          return priceA < priceB ? -1 : 1;

        });


        return {

          name: name,

          cat: info.cat,

          catName: info.catName,

          badge: getValue(row, "Badge") || "OFERTA",

          image: getValue(row, "Imagem"),

          oldPrice: parsePrice(getValue(row, "Preço Anterior")),

          updated:
            getValue(row, "Atualizado em") ||
            getValue(row, "Última Atualização"),

          offers: offers,

          active:
            normalize(active) !== "nao" &&
            normalize(active) !== "não" &&
            normalize(active) !== "false"

        };

      })
      .filter(product =>
        product.name &&
        product.active &&
        product.offers.length > 0
      )
      .reverse()   /* os últimos da planilha (mais novos) aparecem primeiro */
      .map((product, index) => ({ ...product, id: index }));


    renderFilters();

    renderProducts();

    renderHighlights();

    renderTrust();

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
      </button>
    `)
    .join("");

}


/* FILTROS DE LOJA (criados a partir das lojas que existem na planilha) */

function renderFilters() {

  const names = [];

  products.forEach(product => {
    product.offers.forEach(offer => {
      if (!names.some(name => normalize(name) === offer.key)) {
        names.push(offer.store);
      }
    });
  });

  const order = ["shopee", "mercado livre", "amazon"];

  names.sort((a, b) => {

    const posA = order.indexOf(normalize(a));
    const posB = order.indexOf(normalize(b));

    return (posA === -1 ? 99 : posA) - (posB === -1 ? 99 : posB) ||
           a.localeCompare(b);

  });

  $("#filters").innerHTML =
    `<button class="filter active" data-store="Todas">Todas</button>` +
    names
      .map(name => `
        <button class="filter store-${storeKey(name)}" data-store="${escapeHtml(name)}">
          ${escapeHtml(name)}
        </button>
      `)
      .join("");

  store = "Todas";

}


/* PRODUTOS (cards) */

function storeTag(product) {

  if (product.offers.length === 1) {

    const offer = product.offers[0];

    return `
      <span class="store store-${offer.color}">
        ${escapeHtml(offer.store)}
      </span>
    `;

  }

  const dots = product.offers
    .map(offer => `<i class="dot store-${offer.color}"></i>`)
    .join("");

  return `
    <span class="store store-multi">
      ${dots}<em>${product.offers.length} lojas</em>
    </span>
  `;

}


function renderProducts() {

  const words = normalize($("#search").value)
    .split(/\s+/)
    .filter(Boolean);

  const list = products.filter(product => {

    const text = normalize(
      `${product.name} ${product.catName} ` +
      product.offers.map(offer => offer.store).join(" ")
    );


    const categoryMatch =
      category === "todos" ||
      product.cat === category;


    const storeMatch =
      store === "Todas" ||
      product.offers.some(offer => offer.key === normalize(store));


    const searchMatch =
      words.every(word => text.includes(word));


    return categoryMatch &&
           storeMatch &&
           searchMatch;

  });


  $("#count").textContent =
    `${list.length} produto${list.length === 1 ? "" : "s"}`;


  $("#products").innerHTML = list
    .map(product => {

      const best = product.offers.find(offer => offer.price !== null);

      const showOld =
        best && product.oldPrice && product.oldPrice > best.price;

      const multiple = product.offers.length > 1;

      return `

      <article class="product" data-id="${product.id}" tabindex="0" role="button" aria-label="Ver preços de ${escapeHtml(product.name)}">

        <div class="photo${product.image ? "" : " no-image"}">

          <span class="badge">
            ${escapeHtml(product.badge)}
          </span>

          ${storeTag(product)}

          ${product.image ? `
          <img
            src="${escapeHtml(product.image)}"
            alt="${escapeHtml(product.name)}"
            loading="lazy"
            referrerpolicy="no-referrer"
            onerror="this.parentNode.classList.add('no-image')"
          >` : ""}

        </div>


        <div class="info">

          <span class="cat">
            ${escapeHtml(product.catName)}
          </span>

          <h3>
            ${escapeHtml(product.name)}
          </h3>

          <div class="old">
            ${showOld ? formatMoney(product.oldPrice) : ""}
          </div>

          <div class="from">
            ${best && multiple ? "a partir de" : ""}
          </div>

          <div class="price">
            ${best ? formatMoney(best.price) : "Ver preço"}
          </div>

          <span class="buy">
            ${multiple ? "COMPARAR →" : "VER DETALHES →"}
          </span>

        </div>

      </article>

      `;

    })
    .join("");


  $("#empty").hidden = list.length > 0;

}


/* FAIXA DE CONFIANÇA (quantos produtos, lojas e data) */

function parseBRDate(text) {

  const match = String(text || "").match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);

  if (!match) return null;

  const year = match[3].length === 2 ? 2000 + Number(match[3]) : Number(match[3]);

  const date = new Date(year, Number(match[2]) - 1, Number(match[1]));

  return Number.isNaN(date.getTime()) ? null : date;

}


function renderTrust() {

  const stores = new Set();

  let latest = null;

  products.forEach(product => {

    product.offers.forEach(offer => stores.add(offer.key));

    const date = parseBRDate(product.updated);

    if (date && (!latest || date > latest)) latest = date;

  });

  const parts = [
    `${products.length} produto${products.length === 1 ? "" : "s"}`,
    `${stores.size} loja${stores.size === 1 ? "" : "s"}`
  ];

  if (latest) {
    parts.push("preços conferidos em " + latest.toLocaleDateString("pt-BR"));
  } else {
    parts.push("você compra direto na loja");
  }

  $("#trustMeta").textContent = parts.join(" · ");

}


/*
  DESTAQUES (fileira com rolagem lateral)
  Mostra os produtos com Badge "TOP", do mais novo para o mais antigo
  (o que está mais embaixo na planilha aparece primeiro).
  Limite: os 10 mais recentes.
*/

const HIGHLIGHT_BADGE = "top";   // badge que coloca o produto nos destaques
const HIGHLIGHT_LIMIT = 10;      // quantos produtos aparecem na fileira

function renderHighlights() {

  const list = products
    .filter(product => normalize(product.badge) === HIGHLIGHT_BADGE)
    .slice(0, HIGHLIGHT_LIMIT);

  if (!list.length) {
    $("#highlights").hidden = true;
    return;
  }

  $("#hlRow").innerHTML = list
    .map(product => {

      const best = product.offers.find(offer => offer.price !== null);

      const hasDiscount =
        best && product.oldPrice && product.oldPrice > best.price;

      const percent = hasDiscount
        ? Math.round((1 - best.price / product.oldPrice) * 100)
        : 0;

      return `

      <button class="hl-card" data-id="${product.id}">

        <span class="hl-off">${hasDiscount ? "-" + percent + "%" : "TOP"}</span>

        <span class="hl-photo${product.image ? "" : " no-image"}">
          ${product.image ? `
          <img
            src="${escapeHtml(product.image)}"
            alt=""
            loading="lazy"
            referrerpolicy="no-referrer"
            onerror="this.parentNode.classList.add('no-image')"
          >` : ""}
        </span>

        <span class="hl-name">${escapeHtml(product.name)}</span>

        <span class="hl-price">${best ? formatMoney(best.price) : "Ver preço"}</span>

        <span class="hl-old">${hasDiscount ? formatMoney(product.oldPrice) : ""}</span>

      </button>

      `;

    })
    .join("");

  $("#highlights").hidden = false;

}


/* PÁGINA DO PRODUTO (preços em cada loja) */

const productModal = document.createElement("div");

productModal.className = "pm-bg";
productModal.id = "productModal";
productModal.hidden = true;

productModal.innerHTML = `
  <div class="pm" role="dialog" aria-modal="true">
    <button class="pm-close" id="pmClose" aria-label="Fechar">×</button>
    <div id="pmBody"></div>
  </div>
`;

document.body.appendChild(productModal);


function openProduct(id) {

  const product = products.find(item => item.id === id);

  if (!product) return;

  const priced = product.offers.filter(offer => offer.price !== null);

  const best = priced[0];

  const worst = priced[priced.length - 1];

  const compare = priced.length > 1;


  let oldLine = "";

  if (best && product.oldPrice && product.oldPrice > best.price) {

    const percent = Math.round(
      (1 - best.price / product.oldPrice) * 100
    );

    oldLine = `
      <div class="pm-old">
        De <s>${formatMoney(product.oldPrice)}</s>
        <span class="pm-off">-${percent}%</span>
      </div>
    `;

  }


  let summary = "";

  if (compare && worst.price > best.price) {

    summary = `
      <div class="pm-summary">
        Economia de até <b>${formatMoney(worst.price - best.price)}</b>
        entre as lojas
      </div>
    `;

  }


  const offerRows = product.offers
    .map(offer => {

      const isBest = compare && offer === best;

      let note = "";

      if (compare && offer.price !== null) {

        note = isBest
          ? `<span class="o-tag">MENOR PREÇO</span>`
          : `<span class="o-diff">+ ${formatMoney(offer.price - best.price)} que o menor</span>`;

      }

      return `
        <a class="offer${isBest ? " best" : ""}"
           href="${escapeHtml(offer.url)}"
           target="_blank"
           rel="noopener noreferrer sponsored">

          <span class="o-store">
            <i class="dot store-${offer.color}"></i>
            ${escapeHtml(offer.store)}
          </span>

          <span class="o-price">
            ${offer.price !== null ? formatMoney(offer.price) : "Ver preço"}
          </span>

          ${note}

          <span class="o-go">Ir para a loja →</span>

        </a>
      `;

    })
    .join("");


  $("#pmBody").innerHTML = `

    <div class="pm-photo${product.image ? "" : " no-image"}">
      ${product.image ? `
      <img
        src="${escapeHtml(product.image)}"
        alt="${escapeHtml(product.name)}"
        referrerpolicy="no-referrer"
        onerror="this.parentNode.classList.add('no-image')"
      >` : ""}
    </div>

    <div class="pm-body">

      <span class="pm-cat">${escapeHtml(product.catName)}</span>

      <h2>${escapeHtml(product.name)}</h2>

      ${oldLine}

      ${summary}

      <p class="pm-title">
        ${product.offers.length > 1 ? "PREÇOS NAS LOJAS" : "DISPONÍVEL EM"}
      </p>

      <div class="offers-list">
        ${offerRows}
      </div>

    </div>

    <p class="pm-foot">
      ${product.updated ? `Preços conferidos em ${escapeHtml(product.updated)}. ` : ""}
      Preços e condições podem mudar nas lojas.
    </p>

  `;

  productModal.hidden = false;

  document.body.style.overflow = "hidden";

  productModal.querySelector(".pm").scrollTop = 0;

}


function closeProduct() {

  productModal.hidden = true;

  document.body.style.overflow = "";

}


$("#products").addEventListener("click", event => {

  const card = event.target.closest(".product");

  if (!card) return;

  openProduct(Number(card.dataset.id));

});


$("#products").addEventListener("keydown", event => {

  if (event.key !== "Enter" && event.key !== " ") return;

  const card = event.target.closest(".product");

  if (!card) return;

  event.preventDefault();

  openProduct(Number(card.dataset.id));

});


$("#hlRow").addEventListener("click", event => {

  const card = event.target.closest(".hl-card");

  if (!card) return;

  openProduct(Number(card.dataset.id));

});


$("#pmClose").addEventListener("click", closeProduct);


productModal.addEventListener("click", event => {

  if (event.target === productModal) {
    closeProduct();
  }

});



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
      .querySelector("#categoriesSection")
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

const POPUP_DELAY_SECONDS = 1.5;   // quanto tempo depois de entrar no site
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

    if (modal.hidden && productModal.hidden && !typing) {
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

    if (event.key === "Escape") {

      if (!modal.hidden) closeModal();

      if (!productModal.hidden) closeProduct();

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

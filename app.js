const categories=[
  ["pc","🖥️","PC Gamer"],["pecas","🧩","Peças de PC"],["gpu","🎮","Placas de vídeo"],
  ["monitor","📺","Monitores"],["celular","📱","Celulares"],["periferico","⌨️","Periféricos"],
  ["audio","🎧","Áudio"],["eletronicos","⚡","Eletrônicos"]
];

const products=[
 {name:"Placa de vídeo RTX 4060 8GB",cat:"gpu",catName:"Placas de vídeo",store:"Shopee",price:"R$ 1.799",old:"R$ 2.199",icon:"🎮",badge:"OFERTA"},
 {name:"Monitor Gamer 24\" 144Hz",cat:"monitor",catName:"Monitores",store:"Mercado Livre",price:"R$ 699",old:"R$ 899",icon:"🖥️",badge:"TOP"},
 {name:"SSD NVMe 1TB",cat:"pecas",catName:"Peças de PC",store:"Amazon",price:"R$ 389",old:"R$ 479",icon:"💾",badge:"OFERTA"},
 {name:"Teclado mecânico RGB",cat:"periferico",catName:"Periféricos",store:"Shopee",price:"R$ 129",old:"R$ 189",icon:"⌨️",badge:"ACHADO"},
 {name:"Mouse Gamer sem fio",cat:"periferico",catName:"Periféricos",store:"Mercado Livre",price:"R$ 159",old:"R$ 229",icon:"🖱️",badge:"TOP"},
 {name:"Memória RAM 16GB DDR4",cat:"pecas",catName:"Peças de PC",store:"Amazon",price:"R$ 249",old:"R$ 329",icon:"🧠",badge:"OFERTA"},
 {name:"Celular 256GB",cat:"celular",catName:"Celulares",store:"Shopee",price:"R$ 999",old:"R$ 1.199",icon:"📱",badge:"OFERTA"},
 {name:"Headset Gamer 7.1",cat:"audio",catName:"Áudio",store:"Amazon",price:"R$ 219",old:"R$ 299",icon:"🎧",badge:"TOP"},
 {name:"PC Gamer Ryzen 5",cat:"pc",catName:"PC Gamer",store:"Mercado Livre",price:"R$ 2.999",old:"R$ 3.499",icon:"🖥️",badge:"OFERTA"},
 {name:"Fonte 650W 80 Plus",cat:"pecas",catName:"Peças de PC",store:"Shopee",price:"R$ 279",old:"R$ 349",icon:"🔌",badge:"ACHADO"}
];

const $=s=>document.querySelector(s);
let category="todos",store="Todas";

function renderCategories(){
  $("#categories").innerHTML=categories.map(([key,icon,name])=>
    `<button class="category" data-cat="${key}"><span class="icon">${icon}</span><strong>${name}</strong><small>Ver ofertas →</small></button>`
  ).join("");
}

function renderProducts(){
  const q=$("#search").value.trim().toLowerCase();
  const list=products.filter(p=>{
    const text=`${p.name} ${p.catName} ${p.store}`.toLowerCase();
    return (category==="todos"||p.cat===category)&&(store==="Todas"||p.store===store)&&(!q||text.includes(q));
  });
  $("#count").textContent=`${list.length} oferta${list.length===1?"":"s"}`;
  $("#products").innerHTML=list.map(p=>`
    <article class="product">
      <div class="photo"><span class="badge">${p.badge}</span><span class="store">${p.store}</span><span>${p.icon}</span></div>
      <div class="info"><span class="cat">${p.catName}</span><h3>${p.name}</h3><div class="old">${p.old}</div><div class="price">${p.price}</div>
      <a class="buy" href="#" target="_blank" rel="noopener">VER OFERTA →</a></div>
    </article>`).join("");
  $("#empty").hidden=list.length>0;
}

$("#categories").addEventListener("click",e=>{
  const b=e.target.closest("[data-cat]");if(!b)return;
  category=b.dataset.cat;
  document.querySelectorAll(".category").forEach(x=>x.classList.toggle("active",x===b));
  renderProducts();document.querySelector(".offers").scrollIntoView({behavior:"smooth"});
});

$("#filters").addEventListener("click",e=>{
  const b=e.target.closest("[data-store]");if(!b)return;
  store=b.dataset.store;
  document.querySelectorAll(".filter").forEach(x=>x.classList.toggle("active",x===b));
  renderProducts();
});

$("#search").addEventListener("input",renderProducts);
$("#clearSearch").addEventListener("click",()=>{$("#search").value="";renderProducts();$("#search").focus()});
$("#allCategories").addEventListener("click",()=>{category="todos";document.querySelectorAll(".category").forEach(x=>x.classList.remove("active"));renderProducts();document.querySelector(".section").scrollIntoView({behavior:"smooth"})});

const modal=$("#modal");
function openModal(){modal.hidden=false}
function closeModal(){modal.hidden=true}
$("#openWhatsApp").addEventListener("click",openModal);
$("#closeModal").addEventListener("click",closeModal);
$("#continueBtn").addEventListener("click",closeModal);
modal.addEventListener("click",e=>{if(e.target===modal)closeModal()});

renderCategories();
renderProducts();

// Quando tivermos o link real do grupo, troque "#" abaixo pelo link do WhatsApp.
$("#whatsappLink").href="#";

// Сайт розроблено студентом Каріна Корнієнко (Писаренко), група ФЕМП-5-3з
// ----------------------
// Дані турів
// ----------------------
const TOURS = [
  {id:1, title:"Сонячна Анталія", country:"Туреччина", nights:7, pricePerNight:45, img:"images/tour_1.jpg", desc:"Море, пляж і all-inclusive."},
  {id:2, title:"Романтичний Париж", country:"Франція", nights:5, pricePerNight:75, img:"images/tour_2.jpg", desc:"Ейфелева вежа та круасани."},
  {id:3, title:"Прага класична", country:"Чехія", nights:4, pricePerNight:40, img:"images/tour_3.jpg", desc:"Мости, кав'ярні та замки."},
  {id:4, title:"Барселона & Гауді", country:"Іспанія", nights:6, pricePerNight:60, img:"images/tour_4.jpg", desc:"Архітектура, море, тапас."},
  {id:5, title:"Карпати трекінг", country:"Україна", nights:3, pricePerNight:25, img:"images/tour_5.jpg", desc:"Гори, полонини, гуцульська кухня."},
  {id:6, title:"Будапешт релакс", country:"Угорщина", nights:3, pricePerNight:35, img:"images/tour_6.jpg", desc:"Термальні купальні та Дунай."}
];

// ----------------------
// Рендер карток турів
// ----------------------
function renderTours(targetId, items=TOURS){
  const el = document.getElementById(targetId);
  if(!el) return;

  el.innerHTML = items.map(t => `
    <article class="card">
      <img src="${t.img}" alt="${t.title}">
      <div class="card-body">
        <div class="card-title">
          <h3 class="tour-title">${t.title}</h3>
        </div>
        <div class="price-row">
          <span class="price">${t.pricePerNight}$</span>
          <small>/ніч/особа</small>
        </div>
        <p class="muted">${t.country} • ${t.nights} ноч.</p>
        <p>${t.desc}</p>
        <button class="btn btn-primary" onclick="openBooking(${t.id})">Забронювати</button>
      </div>
    </article>
  `).join("");
}

// ----------------------
// SPA: завантаження фрагментів
// ----------------------
async function loadPage(page){
  try {
    const res = await fetch("fragments/" + page + ".html");
    const html = await res.text();
    document.getElementById("content").innerHTML = html;

    // Ініціалізація після вставки
    if(page === "home"){
      const shuffled = [...TOURS].sort(() => 0.5 - Math.random()).slice(0,3);
      renderTours("home-tours", shuffled);
    }
    if(page === "tours"){
      renderTours("tours-list");
      setupFilters();
    }
    if(page === "contacts"){
      setupContacts();
    }
  } catch(err){
    console.error("Помилка завантаження сторінки:", err);
    document.getElementById("content").innerHTML = "<p>Не вдалося завантажити сторінку.</p>";
  }
}

// ----------------------
// Фільтри для сторінки "Тури"
// ----------------------
function setupFilters(){
  const input = document.getElementById("searchInput");
  const select = document.getElementById("sortSelect");

  function apply(){
    let list = TOURS.filter(t => {
      const q = (input.value||"").toLowerCase();
      return t.title.toLowerCase().includes(q) || t.country.toLowerCase().includes(q);
    });
    if(select.value==="priceAsc") list.sort((a,b)=>a.pricePerNight-b.pricePerNight);
    if(select.value==="priceDesc") list.sort((a,b)=>b.pricePerNight-a.pricePerNight);
    renderTours("tours-list", list);
  }

  input.addEventListener("input", apply);
  select.addEventListener("change", apply);
}

// ----------------------
// Модалка "Забронювати"
// ----------------------
function openBooking(tourId){
  const tour = TOURS.find(t=>t.id===tourId);
  if(!tour) return;

  const modal = document.getElementById("booking-modal");
  modal.setAttribute("aria-hidden","false");
  const today = new Date().toISOString().split("T")[0];
  const defaultNights = tour.nights;

  modal.innerHTML = `
    <div class="dialog" role="dialog" aria-modal="true">
      <h3>Бронювання: ${tour.title}</h3>
      <p class="muted">${tour.country}</p>
      <div class="form-row">
        <label>Дата заїзду
          <input type="date" id="bDate" min="${today}" value="${today}">
        </label>
        <label>Кількість ночей
          <input type="number" id="bNights" min="1" max="30" value="${defaultNights}">
        </label>
      </div>
      <div class="form-row">
        <label>Дорослі
          <input type="number" id="bAdults" min="1" max="10" value="2">
        </label>
        <label>Діти (до 12 років)
          <input type="number" id="bChildren" min="0" max="10" value="0">
        </label>
      </div>
      <div id="calc" class="total"></div>
      <div class="dialog-actions">
        <button class="btn btn-outline" id="closeBtn">Закрити</button>
        <button class="btn btn-primary" id="confirmBtn">Підтвердити</button>
        <button class="btn btn-danger" id="clearBtn">Скинути</button>
      </div>
    </div>
  `;

  const els = {
    nights: modal.querySelector("#bNights"),
    adults: modal.querySelector("#bAdults"),
    children: modal.querySelector("#bChildren"),
    calc: modal.querySelector("#calc"),
    close: modal.querySelector("#closeBtn"),
    confirm: modal.querySelector("#confirmBtn"),
    clear: modal.querySelector("#clearBtn"),
  };

  function recalc(){
    const n = Math.max(1, parseInt(els.nights.value||1,10));
    const a = Math.max(1, parseInt(els.adults.value||1,10));
    const c = Math.max(0, parseInt(els.children.value||0,10));
    const total = (a * tour.pricePerNight + c * tour.pricePerNight * 0.5) * n;
    els.calc.textContent = `Загальна вартість: ${total.toFixed(2)}$`;
    return {n,a,c,total};
  }

  recalc();

  [els.nights,els.adults,els.children].forEach(e=>e.addEventListener("input", recalc));

  els.close.addEventListener("click", ()=> {
    modal.setAttribute("aria-hidden","true");
    modal.innerHTML="";
  });

  els.clear.addEventListener("click", ()=> {
    els.nights.value = defaultNights;
    els.adults.value = 2;
    els.children.value = 0;
    recalc();
  });

  els.confirm.addEventListener("click", ()=>{
    const {n,a,c,total} = recalc();
    const booking = {
      tourId: tour.id, title: tour.title,
      date: modal.querySelector("#bDate").value,
      nights: n, adults: a, children: c, total, ts: Date.now()
    };
    const all = JSON.parse(localStorage.getItem("bookings")||"[]");
    all.push(booking);
    localStorage.setItem("bookings", JSON.stringify(all));
    alert("Бронювання збережено (демо). Сума: " + total.toFixed(2) + "$");
    modal.setAttribute("aria-hidden","true");
    modal.innerHTML="";
  });
}

// ----------------------
// Форма "Контакти"
// ----------------------
function setupContacts(){
  const btn = document.getElementById("cSend");
  if(!btn) return;
  btn.addEventListener("click", ()=>{
    const name = document.getElementById("cName").value.trim();
    const email = document.getElementById("cEmail").value.trim();
    const msg = document.getElementById("cMsg").value.trim();
    const status = document.getElementById("cStatus");

    if(!name || !email || !msg){
      status.textContent = "Будь ласка, заповніть усі поля.";
      return;
    }
    status.textContent = "Повідомлення надіслано (демо). Дякуємо!";
    localStorage.setItem("lastMessage", JSON.stringify({name,email,msg,ts:Date.now()}));
  });
}

// ----------------------
// Делегування подій для SPA
// ----------------------
document.addEventListener("click", e => {
  const link = e.target.closest("[data-page]");
  if(link){
    e.preventDefault();
    const page = link.getAttribute("data-page");
    loadPage(page);
  }
});

// стартова сторінка
document.addEventListener("DOMContentLoaded", () => {
  loadPage("home");
});


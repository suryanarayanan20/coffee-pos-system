// Data (with food images represented by small SVG thumbs created in DOM)
const MENU = [
  { id:1, name:"Espresso", price:3.00, tag:"coffee" },
  { id:2, name:"Americano", price:4.50, tag:"coffee" },
  { id:3, name:"Latte", price:5.00, tag:"coffee" },
  { id:4, name:"Cappuccino", price:5.00, tag:"coffee" },
  { id:5, name:"Mocha", price:5.50, tag:"coffee" },
  { id:6, name:"Brownie", price:2.50, tag:"snack" },
  { id:7, name:"Iced Coffee", price:4.75, tag:"coffee" }
];

const TAX_RATE = 0.12; // 12%
const CURRENCY = '$';
const cart = [];

// Helpers
const $ = s => document.querySelector(s);
const fmt = v => Number(v).toFixed(2);

// Create an SVG thumbnail element (DOM) for menu item
function createThumb(letter, colors = ['#ff9a6b','#ff6b6b']){
  const wrapper = document.createElement('div');
  wrapper.className = 'coffee-thumb';
  wrapper.innerHTML = `
    <svg width="44" height="44" viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
      <defs>
        <linearGradient id="g${letter}" x1="0" x2="1">
          <stop offset="0" stop-color="${colors[0]}"/>
          <stop offset="1" stop-color="${colors[1]}"/>
        </linearGradient>
      </defs>
      <rect width="44" height="44" rx="8" fill="url(#g${letter})"/>
      <text x="50%" y="58%" fill="#081826" font-size="18" font-weight="700" text-anchor="middle" font-family="Arial" >${letter}</text>
    </svg>
  `;
  return wrapper;
}

// Render menu items
function renderMenu(){
  const container = $('#menu-items');
  container.innerHTML = '';
  MENU.forEach(item => {
    const el = document.createElement('div');
    el.className = 'menu-item';
    const letter = item.name.charAt(0).toUpperCase();
    const thumb = createThumb(letter);
    const info = document.createElement('div');
    info.className = 'menu-info';
    info.appendChild(thumb);
    const txt = document.createElement('div');
    txt.innerHTML = `<div class="menu-title">${item.name}</div><div class="menu-sub">${CURRENCY}${fmt(item.price)}</div>`;
    info.appendChild(txt);
    const actions = document.createElement('div');
    actions.innerHTML = `<button class="btn primary add" data-id="${item.id}">Add</button>`;
    el.appendChild(info);
    el.appendChild(actions);
    container.appendChild(el);
  });
  $('#items-count').textContent = `${MENU.length} items`;
}

// Cart behavior
function addToCart(id){
  const it = cart.find(x=>x.id===id);
  if(it) it.qty++;
  else {
    const m = MENU.find(x=>x.id===id);
    cart.push({ ...m, qty: 1 });
  }
  renderCart();
}

function removeOne(id){
  const it = cart.find(x=>x.id===id);
  if(!it) return;
  it.qty--;
  if(it.qty<=0) cart.splice(cart.indexOf(it),1);
  renderCart();
}

function clearCart(){
  cart.length = 0;
  renderCart();
}

function renderCart(){
  const list = $('#cart-list');
  list.innerHTML = '';
  if(cart.length===0){
    list.innerHTML = `<div class="center" style="padding:18px;color:var(--muted)">Cart empty</div>`;
    updateTotals();
    return;
  }
  cart.forEach(i=>{
    const row = document.createElement('div');
    row.className = 'cart-row';
    row.innerHTML = `
      <div>
        <div style="font-weight:700">${i.name}</div>
        <div style="font-size:13px;color:var(--muted)">${CURRENCY}${fmt(i.price)} each</div>
      </div>
      <div class="qty">
        <button class="dec" data-id="${i.id}">−</button>
        <div style="min-width:34px;text-align:center">${i.qty}</div>
        <button class="add-more" data-id="${i.id}">+</button>
      </div>
    `;
    list.appendChild(row);
  });
  updateTotals();
}

// Totals & invoice
function updateTotals(){
  const subtotal = cart.reduce((s,i)=>s + i.price * i.qty, 0);
  const tax = +(subtotal * TAX_RATE).toFixed(2);
  const total = +(subtotal + tax).toFixed(2);
  $('#subtotal').textContent = fmt(subtotal);
  $('#tax').textContent = fmt(tax);
  $('#total').textContent = fmt(total);
  document.querySelectorAll('#currency,#currency2,#currency3').forEach(n=>n.textContent = CURRENCY);
}

function buildInvoiceHtml(order){
  const items = order ? order.items : cart;
  const subtotal = items.reduce((s,i)=>s + i.price * i.qty, 0);
  const tax = +(subtotal * TAX_RATE).toFixed(2);
  const total = +(subtotal + tax).toFixed(2);
  const rows = items.map(i=>`<tr><td style="padding:6px 8px">${i.name}</td><td style="text-align:center">${i.qty}</td><td style="text-align:right">${CURRENCY}${fmt(i.price)}</td><td style="text-align:right">${CURRENCY}${(i.price*i.qty).toFixed(2)}</td></tr>`).join('');
  const time = order ? new Date(order.id).toLocaleString() : new Date().toLocaleString();
  const invoiceNo = order ? order.id : Date.now();
  // Professional Tamil Nadu address + Tamil thank you line
  return `
    <div class="invoice-header">
      <div class="invoice-business">
        <div style="font-size:18px">Surya Coffee Shop</div>
        <div class="invoice-address">Near Central Market, Chennai, தமிழ்நாடு, India</div>
        <div class="invoice-address">Phone: +91 6282787553</div>
      </div>
      <div class="invoice-meta">
        <div>Invoice #: <strong>${invoiceNo}</strong></div>
        <div>Date: ${time}</div>
        <div>Payment: <strong>Cash</strong></div>
      </div>
    </div>

    <table class="invoice-table" role="table">
      <thead><tr><th align="left">Item</th><th>Qty</th><th style="text-align:right">Price</th><th style="text-align:right">Total</th></tr></thead>
      <tbody>${rows}</tbody>
      <tfoot>
        <tr><td colspan="3" style="text-align:right;padding-top:8px">Subtotal</td><td style="text-align:right">${CURRENCY}${fmt(subtotal)}</td></tr>
        <tr><td colspan="3" style="text-align:right">GST (12%)</td><td style="text-align:right">${CURRENCY}${fmt(tax)}</td></tr>
        <tr><td colspan="3" style="text-align:right;font-weight:800">Total</td><td style="text-align:right;font-weight:800">${CURRENCY}${fmt(total)}</td></tr>
      </tfoot>
    </table>

    <div class="invoice-footer">
      <p style="margin-top:12px;color:var(--muted)">Signature: ______________________</p>
      <p style="margin-top:10px;font-weight:700">நன்றி! உங்கள் ஆர்டர் பெறப்பட்டது. (Thank you! Your order has been received.)</p>
      <p style="margin-top:6px;font-size:12px;color:var(--muted)">Surya Coffee Shop • Chennai, Tamil Nadu • www.example.com</p>
    </div>
  `;
}

// Save order to history
function saveOrderToHistory(){
  const history = JSON.parse(localStorage.getItem('orders')||'[]');
  const snapshot = { id: Date.now(), items: JSON.parse(JSON.stringify(cart)), total: +(cart.reduce((s,i)=>s + i.price * i.qty,0) * (1+TAX_RATE)).toFixed(2) };
  history.unshift(snapshot);
  localStorage.setItem('orders', JSON.stringify(history));
  renderHistory();
}

// Render history list
function renderHistory(){
  const box = $('#history-list');
  box.innerHTML = '';
  const history = JSON.parse(localStorage.getItem('orders')||'[]');
  if(history.length===0){
    box.innerHTML = `<div style="color:var(--muted);padding:10px">No previous orders</div>`;
    return;
  }
  history.forEach(h=>{
    const div = document.createElement('div');
    div.className = 'history-item';
    const dt = new Date(h.id).toLocaleString();
    div.innerHTML = `<div><div style="font-weight:700">${CURRENCY}${fmt(h.total)}</div><small>${dt}</small></div>
      <div style="display:flex;gap:8px">
        <button class="btn ghost view-order" data-id="${h.id}">View</button>
        <button class="btn ghost delete-order" data-id="${h.id}">Delete</button>
      </div>`;
    box.appendChild(div);
  });
}

// Delete single order from history
function deleteOrder(id){
  let history = JSON.parse(localStorage.getItem('orders')||'[]');
  history = history.filter(h=>String(h.id)!==String(id));
  localStorage.setItem('orders', JSON.stringify(history));
  renderHistory();
}

// Clear all history
function clearHistory(){
  localStorage.removeItem('orders');
  renderHistory();
}

// Delegated listeners
document.addEventListener('click', (e)=>{
  if(e.target.classList.contains('add')) {
    addToCart(+e.target.dataset.id);
  } else if(e.target.classList.contains('add-more')) {
    addToCart(+e.target.dataset.id);
  } else if(e.target.classList.contains('dec')) {
    removeOne(+e.target.dataset.id);
  } else if(e.target.id === 'checkout') {
    if(cart.length===0){ alert('Cart is empty'); return; }
    $('#invoice-content').innerHTML = buildInvoiceHtml();
    $('#invoice-modal').classList.remove('hidden');
    $('#invoice-modal').setAttribute('aria-hidden','false');
    saveOrderToHistory();
    clearCart(); // clear cart after checkout
  } else if(e.target.id === 'close-invoice') {
    $('#invoice-modal').classList.add('hidden');
    $('#invoice-modal').setAttribute('aria-hidden','true');
  } else if(e.target.id === 'print-invoice') {
    window.print();
  } else if(e.target.id === 'clear') {
    clearCart();
  } else if(e.target.id === 'refresh-history') {
    renderHistory();
  } else if(e.target.id === 'clear-history') {
    if(confirm('Clear all order history?')) clearHistory();
  } else if(e.target.classList.contains('view-order')) {
    const id = e.target.dataset.id;
    const history = JSON.parse(localStorage.getItem('orders')||'[]');
    const ord = history.find(h=>String(h.id)===String(id));
    if(ord){
      $('#invoice-content').innerHTML = buildInvoiceHtml(ord);
      $('#invoice-modal').classList.remove('hidden');
      $('#invoice-modal').setAttribute('aria-hidden','false');
    }
  } else if(e.target.classList.contains('delete-order')) {
    const id = e.target.dataset.id;
    if(confirm('Delete this order?')) deleteOrder(id);
  }
});

// Init
document.addEventListener('DOMContentLoaded', ()=>{
  renderMenu();
  renderCart();
  renderHistory();
});

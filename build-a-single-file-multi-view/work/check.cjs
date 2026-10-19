
(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const money = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  const photo = (id, width = 650) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;
  const clothes = [
    {id:'s1',name:'After Hours Hoodie',category:'layers',price:78,description:'Heavyweight fleece / Washed charcoal',image:'photo-1556821840-3a63f95609a7',sizes:['S','M','L','XL'],stock:12,badge:'THE EVERYDAY UNIFORM'},
    {id:'s2',name:'Offline Tee',category:'tops',price:38,description:'Boxy cotton / Chalk white',image:'photo-1521572163474-6864f9cf17ab',sizes:['S','M','L','XL'],stock:18,badge:'CORE COLLECTION'},
    {id:'s3',name:'Wide Awake Denim',category:'bottoms',price:92,description:'Relaxed straight leg / Vintage blue',image:'photo-1542272604-787c3835535d',sizes:['26','28','30','32','34'],stock:7,badge:'RELAXED FIT'},
    {id:'s4',name:'Night Shift Jacket',category:'layers',price:128,description:'Denim layer / After-dark black',image:'photo-1543076447-215ad9ba6923',sizes:['S','M','L','XL'],stock:5,badge:'SMALL RUN'},
    {id:'s5',name:'Everywhere Cap',category:'accessories',price:28,description:'Unstructured cotton / Dust beige',image:'photo-1588850561407-ed78c282e89b',sizes:['One size'],stock:15,badge:'FINISH THE FIT'},
    {id:'s6',name:'No Plans Crew',category:'tops',price:64,description:'Easy fleece / Soft stone',image:'photo-1576566588028-4147f3842f27',sizes:['S','M','L','XL'],stock:9,badge:'OFF-DUTY ESSENTIAL'}
  ];
  const concepts = [
    {id:'v1',name:'Arctic Mint',family:'ice',nicotine:0,price:18,stock:8,color:'green',edition:'FORM 01'},
    {id:'v2',name:'Peach Frequency',family:'fruit',nicotine:10,price:22,stock:4,color:'peach',edition:'FORM 02'},
    {id:'v3',name:'Berry Static',family:'fruit',nicotine:20,price:22,stock:12,color:'',edition:'FORM 03'},
    {id:'v4',name:'Pure Original',family:'classic',nicotine:0,price:16,stock:6,color:'',edition:'FORM 04'},
    {id:'v5',name:'Glacier Echo',family:'ice',nicotine:20,price:24,stock:0,color:'green',edition:'FORM 05'},
    {id:'v6',name:'Amber Note',family:'classic',nicotine:10,price:20,stock:3,color:'peach',edition:'FORM 06'}
  ];
  const services = [
    {id:'cut',name:'Cut & finish',price:65,duration:60,description:'A consultation, a fresh shape, and a finish that feels like you.'},
    {id:'color',name:'Signature color',price:130,duration:120,description:'Thoughtful, dimensional color with a soft, natural finish.'},
    {id:'treatment',name:'The care ritual',price:45,duration:45,description:'A restorative conditioning treatment and a quiet moment.'},
    {id:'style',name:'Blowout & styling',price:40,duration:45,description:'A little lift, a little polish. Ready for whatever comes next.'}
  ];
  const specialists = {maya:'Maya',nina:'Nina',leo:'Leo'};
  const catalogs = {street:clothes,vapor:concepts};
  const storageKey = 'murk1ins-showcase-carts-v1';
  let carts = {street:[],vapor:[]};
  let activeStore = 'street';
  let cartStage = 'bag';
  let currentRoute = 'portfolio';
  let portfolioScroll = 0;
  let toastTimer;
  const dialog = $('#cart-dialog');
  const cartBody = $('#cart-body');
  const cartSummary = $('#cart-summary');
  const demoBookings = [];
  const selectedSizes = new Map();
  function readCarts() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      if (!saved || typeof saved !== 'object') return;
      for (const store of Object.keys(catalogs)) {
        if (!Array.isArray(saved[store])) continue;
        const seen = new Set();
        for (const item of saved[store]) {
          if (!item || typeof item !== 'object') continue;
          const product = catalogs[store].find(p => p.id === item.id);
          if (!product || product.stock < 1 || !Number.isInteger(item.qty) || item.qty < 1) continue;
          const size = store === 'street' ? item.size : '';
          if (store === 'street' && !product.sizes.includes(size)) continue;
          const key = `${product.id}|${size}`;
          if (seen.has(key)) continue;
          const used = carts[store].filter(x => x.id === product.id).reduce((n,x) => n + x.qty, 0);
          const qty = Math.min(item.qty,9,product.stock-used);
          if (qty > 0) carts[store].push({id:product.id,size,qty});
          seen.add(key);
        }
      }
    } catch (_) { /* Storage may be disabled; the demo still works in memory. */ }
  }
  function saveCarts() {
    try { localStorage.setItem(storageKey,JSON.stringify(carts)); } catch (_) {}
    updateCounts();
  }
  function updateCounts() {
    $$('[data-count]').forEach(el => {
      const count = carts[el.dataset.count].reduce((sum,item) => sum + item.qty,0);
      el.textContent = `(${count})`;
    });
  }
  function toast(message) {
    clearTimeout(toastTimer);
    $('#toast').textContent = message;
    $('#toast').classList.add('show');
    toastTimer = setTimeout(() => $('#toast').classList.remove('show'),3200);
  }
  function scrollToSection(id) {
    const target = document.getElementById(id);
    if (target) target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
  }
  function route(initial = false) {
    const requested = location.hash.slice(1);
    const next = ['street','vapor','salon'].includes(requested) ? requested : 'portfolio';
    if (!initial && next === currentRoute) return;
    if (currentRoute === 'portfolio' && next !== 'portfolio') portfolioScroll = window.scrollY;
    if (dialog.open) dialog.close();
    $('#toast').classList.remove('show');
    $$('.page').forEach(page => page.hidden = page.id !== next);
    $('#demo-return').hidden = next === 'portfolio';
    const names = {portfolio:'Murk1ins — Ideas into interfaces',street:'OFFGRID® — Streetwear concept',vapor:'VOLT — Catalog interaction concept',salon:'Maison Éclat — Salon concept'};
    document.title = names[next];
    $('#demo-name').textContent = {street:'OFFGRID® / DEMO',vapor:'VOLT / DEMO',salon:'MAISON ÉCLAT / DEMO'}[next] || '';
    document.querySelector('meta[name="theme-color"]').content = {portfolio:'#f5f3ec',street:'#d8ef50',vapor:'#16171a',salon:'#f7f2ec'}[next];
    currentRoute = next;
    requestAnimationFrame(() => {
      if (!initial) $(`#${next} h1`).focus({preventScroll:true});
      window.scrollTo({top:next === 'portfolio' ? portfolioScroll : 0,behavior:'instant'});
    });
  }
  function renderClothes(category = 'all') {
    const products = clothes.filter(p => category === 'all' || p.category === category);
    $('#street-count').textContent = `${products.length} ${products.length === 1 ? 'piece' : 'pieces'}`;
    $('#street-products').innerHTML = products.map(p => `<article class="product"><div class="product-photo"><img loading="lazy" src="${photo(p.image)}" alt="${p.name}"><span class="product-badge">${p.badge}</span></div><div class="product-info"><h3>${p.name}</h3><span>${money(p.price)}</span></div><p class="product-description">${p.description}</p><form class="product-controls" data-clothing="${p.id}"><label class="sr-only" for="size-${p.id}">Size for ${p.name}</label><select id="size-${p.id}" name="size" required data-size="${p.id}"><option value="">Choose size</option>${p.sizes.map(size => `<option${selectedSizes.get(p.id) === size ? ' selected' : ''}>${size}</option>`).join('')}</select><button type="submit" aria-label="Add ${p.name} to bag">Add to bag +</button></form></article>`).join('');
  }
  function renderConcepts() {
    const flavor = $('#flavor-filter').value;
    const nicotine = $('#nicotine-filter').value;
    const products = concepts.filter(p => (flavor === 'all' || p.family === flavor) && (nicotine === 'all' || String(p.nicotine) === nicotine));
    $('#vapor-count').textContent = `${products.length} / ${concepts.length} concepts`;
    $('#vapor-products').innerHTML = products.length ? products.map(p => `<article class="product vapor-product"><div class="product-photo"><span class="product-badge">${p.edition} / CONCEPT</span><div class="device ${p.color}" aria-hidden="true"><b>VOLT</b><small>${p.edition}</small></div></div><div class="product-info"><h3>${p.name}</h3><span>${money(p.price)}</span></div><p class="product-description">${p.family === 'ice' ? 'Ice & mint' : p.family === 'fruit' ? 'Fruit edition' : 'Classic edition'} · ${p.nicotine} mg sample label</p><div class="vapor-meta"><span>ILLUSTRATIVE PRODUCT</span><span class="stock${p.stock ? '' : ' out'}">${p.stock ? `● ${p.stock} demo units` : '○ Out of stock'}</span></div><div class="product-controls"><button type="button" data-add-concept="${p.id}" ${p.stock ? '' : 'disabled'} aria-label="Add ${p.name} to demo bag">${p.stock ? 'Add to demo bag +' : 'Unavailable'}</button></div></article>`).join('') : '<p class="empty-results">No concepts match both filters. Try another combination or reset the filters.</p>';
  }
  function addItem(store,id,size = '') {
    const product = catalogs[store].find(p => p.id === id);
    if (!product || !product.stock || (store === 'street' && !product.sizes.includes(size))) return;
    const bag = carts[store];
    const line = bag.find(item => item.id === id && item.size === size);
    const totalUnits = bag.filter(item => item.id === id).reduce((sum,item) => sum + item.qty,0);
    if (totalUnits >= product.stock || (line && line.qty >= 9)) {
      toast('You’ve reached the available demo quantity.');
      return;
    }
    if (line) line.qty += 1;
    else bag.push({id,size,qty:1});
    saveCarts();
    toast(`${product.name}${size ? ` · ${size}` : ''} added to ${store === 'vapor' ? 'demo ' : ''}bag.`);
  }
  function getLines() {
    return carts[activeStore].map(item => ({...item,product:catalogs[activeStore].find(p => p.id === item.id)}));
  }
  function cartTotal() { return getLines().reduce((total,item) => total + item.product.price * item.qty,0); }
  function renderCart(focusAction,focusIndex) {
    const lines = getLines();
    $('#cart-title').textContent = cartStage === 'checkout' ? 'Review your demo' : 'Your bag';
    $('#cart-subtitle').textContent = `${activeStore === 'street' ? 'OFFGRID®' : 'VOLT'} · NO REAL ORDERS`;
    if (!lines.length) {
      cartBody.innerHTML = '<div class="cart-empty"><span class="empty-icon" aria-hidden="true">↗</span><h3>A little room for something.</h3><p>Your bag is empty. Explore the collection and add a favorite.</p><button class="button" data-close-cart>Explore the collection</button></div>';
      cartSummary.hidden = true;
      if (focusAction) $('.cart-close').focus();
      return;
    }
    cartSummary.hidden = false;
    if (cartStage === 'checkout') {
      cartBody.innerHTML = '<button class="checkout-back" data-edit-bag>← Edit bag</button><div class="checkout-note"><strong>This is a simulated checkout.</strong><br>No payment, shipping details, or real order will be created. Complete this step to preview the confirmation screen.</div>' + lines.map(item => `<div class="checkout-item"><span>${item.product.name}${item.size ? ` / ${item.size}` : ''}<br>Quantity: ${item.qty}</span><strong>${money(item.product.price*item.qty)}</strong></div>`).join('');
    } else {
      cartBody.innerHTML = lines.map((item,index) => `<article class="cart-line"><div class="cart-thumb">${activeStore === 'street' ? `<img src="${photo(item.product.image,160)}" alt="${item.product.name}">` : '<span aria-hidden="true">ϟ</span>'}</div><div><h3>${item.product.name}</h3><p>${item.size ? `Size: ${item.size}` : `${item.product.nicotine} mg · Fictional concept`}</p><div class="quantity"><button data-quantity="minus" data-index="${index}" aria-label="Decrease quantity of ${item.product.name}">−</button><span aria-label="Quantity ${item.qty}">${item.qty}</span><button data-quantity="plus" data-index="${index}" aria-label="Increase quantity of ${item.product.name}">+</button><button class="remove" data-quantity="remove" data-index="${index}" aria-label="Remove ${item.product.name} from bag">Remove</button></div></div><span class="cart-line-price">${money(item.product.price*item.qty)}</span></article>`).join('');
    }
    cartSummary.innerHTML = `<div class="cart-total"><span>Demo total</span><span>${money(cartTotal())}</span></div><p>Illustrative USD prices. No real taxes, shipping, or payment. Nothing will be purchased.</p><button class="button" ${cartStage === 'checkout' ? 'data-complete-order' : 'data-checkout'}>${cartStage === 'checkout' ? 'Complete demo checkout' : 'Try demo checkout'} <span class="arrow">↗</span></button>`;
    if (focusAction) {
      const target = $(`[data-quantity="${focusAction}"][data-index="${Math.min(focusIndex,lines.length-1)}"]`,cartBody);
      (target || $('.cart-close')).focus();
    }
  }
  function openCart(store) {
    if (!catalogs[store]) return;
    activeStore = store;
    cartStage = 'bag';
    renderCart();
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    $('.cart-close').focus();
  }
  function changeQuantity(action,index) {
    const line = carts[activeStore][index];
    if (!line) return;
    if (action === 'remove' || (action === 'minus' && line.qty === 1)) carts[activeStore].splice(index,1);
    else if (action === 'minus') line.qty -= 1;
    else if (action === 'plus') {
      const product = catalogs[activeStore].find(p => p.id === line.id);
      const used = carts[activeStore].filter(p => p.id === line.id).reduce((n,p) => n + p.qty,0);
      if (line.qty >= 9 || used >= product.stock) {
        $('#cart-subtitle').textContent = 'AVAILABLE DEMO QUANTITY REACHED';
        return;
      }
      line.qty += 1;
    }
    saveCarts();
    renderCart(action,index);
  }
  function finishOrder() {
    if (cartStage !== 'checkout' || !carts[activeStore].length) return;
    const total = money(cartTotal());
    const count = carts[activeStore].reduce((sum,item) => sum+item.qty,0);
    carts[activeStore] = [];
    saveCarts();
    cartStage = 'done';
    $('#cart-title').textContent = 'Demo complete';
    cartBody.innerHTML = `<div class="cart-empty"><span class="success-mark" aria-hidden="true">✓</span><h3>That’s the whole flow.</h3><p>${count} demo ${count === 1 ? 'item' : 'items'} · ${total}<br>Your simulated checkout is complete. No order was placed and no payment was taken.</p><button class="button" data-close-cart>Keep exploring ↗</button></div>`;
    cartSummary.hidden = true;
    $('[data-close-cart]',cartBody).focus();
  }
  function dateString(date) {
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  }
  function localDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const [year,month,day] = value.split('-').map(Number);
    const date = new Date(year,month-1,day);
    return dateString(date) === value ? date : null;
  }
  function updateDateBounds() {
    const today = new Date();
    const last = new Date(today.getFullYear(),today.getMonth(),today.getDate()+60);
    $('#book-date').min = dateString(today);
    $('#book-date').max = dateString(last);
  }
  function availableTimes(service,specialist,day) {
    const date = localDate(day);
    if (!date || !service || !specialists[specialist] || date.getDay() === 0) return [];
    if (day < $('#book-date').min || day > $('#book-date').max) return [];
    const seed = date.getDate() + ['maya','nina','leo'].indexOf(specialist);
    const busyStart = (10 + seed%4)*60;
    const busyEnd = busyStart+60;
    return [540,600,660,720,780,840,900,960,1020].map(start => {
      const end = start + service.duration;
      const appointment = new Date(date.getFullYear(),date.getMonth(),date.getDate(),Math.floor(start/60),start%60);
      const overlapsDemo = demoBookings.some(b => b.specialist === specialist && b.day === day && start < b.end && end > b.start);
      const unavailable = end > 1080 || appointment <= new Date() || (start < busyEnd && end > busyStart) || overlapsDemo;
      return {start,label:`${String(Math.floor(start/60)).padStart(2,'0')}:${String(start%60).padStart(2,'0')}`,unavailable};
    });
  }
  function renderTimes(clearStatus = true) {
    updateDateBounds();
    $('#book-submit').disabled = true;
    if (clearStatus) $('#booking-status').textContent = '';
    const service = services.find(s => s.id === $('#book-service').value);
    const specialist = $('#book-specialist').value;
    const day = $('#book-date').value;
    const date = localDate(day);
    const slots = availableTimes(service,specialist,day);
    $('#time-slots').innerHTML = slots.map(slot => `<label class="time-option"><input type="radio" name="time" value="${slot.start}" ${slot.unavailable ? 'disabled' : ''} required><span>${slot.label}</span></label>`).join('');
    let message = '';
    if (!service || !specialist) message = 'Select a ritual and specialist to see their demo availability.';
    else if (!date || day < $('#book-date').min || day > $('#book-date').max) message = 'Choose a valid date within the next 60 days.';
    else if (date.getDay() === 0) message = 'The atelier rests on Sundays. Try another day.';
    else if (!slots.some(s => !s.unavailable)) message = 'No moments left on this date. Please choose another day.';
    else message = `${service.duration} minutes · ${money(service.price)} · Crossed-out times are unavailable.`;
    $('#time-message').textContent = message;
  }
  function initBooking() {
    $('#service-list').innerHTML = services.map(service => `<article class="service-row"><div><h3>${service.name}</h3><p>${service.description}</p><p style="margin-top:8px">${service.duration} minutes</p></div><div><span>${money(service.price)}</span><button data-service="${service.id}">Book ↗</button></div></article>`).join('');
    $('#book-service').insertAdjacentHTML('beforeend',services.map(s => `<option value="${s.id}">${s.name} · ${money(s.price)}</option>`).join(''));
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate()+1);
    if (tomorrow.getDay() === 0) tomorrow.setDate(tomorrow.getDate()+1);
    $('#book-date').value = dateString(tomorrow);
    renderTimes();
  }
  document.addEventListener('click',event => {
    const button = event.target.closest('button,a');
    if (!button) return;
    if (button.classList.contains('skip')) {
      event.preventDefault();
      const heading = $(`#${currentRoute} h1`);
      heading.focus({preventScroll:true});
      heading.scrollIntoView({block:'center',behavior:'instant'});
      return;
    }
    if (button.hasAttribute('data-scroll')) scrollToSection(button.dataset.scroll);
    if (button.hasAttribute('data-top')) window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
    if (button.hasAttribute('data-category')) {
      $$('[data-category]').forEach(el => el.setAttribute('aria-pressed',String(el === button)));
      renderClothes(button.dataset.category);
    }
    if (button.hasAttribute('data-cart')) openCart(button.dataset.cart);
    if (button.hasAttribute('data-close-cart')) dialog.close();
    if (button.hasAttribute('data-add-concept')) addItem('vapor',button.dataset.addConcept);
    if (button.hasAttribute('data-quantity')) changeQuantity(button.dataset.quantity,Number(button.dataset.index));
    if (button.hasAttribute('data-checkout')) {cartStage = 'checkout';renderCart();$('[data-edit-bag]').focus();}
    if (button.hasAttribute('data-edit-bag')) {cartStage = 'bag';renderCart();$('.cart-close').focus();}
    if (button.hasAttribute('data-complete-order')) finishOrder();
    if (button.hasAttribute('data-service')) {$('#book-service').value = button.dataset.service;renderTimes();scrollToSection('booking');}
    if (button.hasAttribute('data-specialist')) {$('#book-specialist').value = button.dataset.specialist;renderTimes();scrollToSection('booking');}
  });
  document.addEventListener('change',event => {
    const target = event.target;
    if (target.matches('[data-size]')) selectedSizes.set(target.dataset.size,target.value);
    if (target.matches('#flavor-filter,#nicotine-filter')) renderConcepts();
    if (target.matches('#book-service,#book-specialist,#book-date')) renderTimes();
    if (target.matches('input[name="time"]')) {$('#book-submit').disabled = false;$('#booking-status').textContent = '';}
  });
  document.addEventListener('submit',event => {
    const form = event.target;
    if (!form.matches('[data-clothing]')) return;
    event.preventDefault();
    if (form.reportValidity()) addItem('street',form.dataset.clothing,$('select',form).value);
  });
  $('#reset-vapor').addEventListener('click',() => {
    $('#flavor-filter').value = 'all';
    $('#nicotine-filter').value = 'all';
    renderConcepts();
  });
  $('#booking-form').addEventListener('submit',event => {
    event.preventDefault();
    updateDateBounds();
    const service = services.find(s => s.id === $('#book-service').value);
    const specialist = $('#book-specialist').value;
    const day = $('#book-date').value;
    const chosen = $('input[name="time"]:checked');
    const slot = availableTimes(service,specialist,day).find(s => chosen && s.start === Number(chosen.value) && !s.unavailable);
    if (!slot) {
      renderTimes();
      $('#booking-status').textContent = 'That moment is no longer available. Please select another time.';
      return;
    }
    demoBookings.push({specialist,day,start:slot.start,end:slot.start+service.duration});
    const prettyDate = localDate(day).toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'});
    renderTimes(false);
    $('#booking-status').textContent = `Your demo moment is saved: ${service.name} with ${specialists[specialist]}, ${prettyDate} at ${slot.label}. ${service.duration} minutes · ${money(service.price)}. This is a simulation; no real appointment has been made. The slot is held for this browser session.`;
  });
  dialog.addEventListener('close',() => {document.body.style.overflow = '';});
  dialog.addEventListener('click',event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  document.addEventListener('error',event => {
    if (!(event.target instanceof HTMLImageElement) || event.target.dataset.fallback) return;
    const img = event.target;
    img.dataset.fallback = 'true';
    img.classList.add('image-fallback');
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800"><rect width="600" height="800" fill="#d9dccd"/><circle cx="300" cy="340" r="140" fill="none" stroke="#a0a78b"/><path d="M160 580L300 200L440 580Z" fill="none" stroke="#a0a78b"/><text x="300" y="690" text-anchor="middle" font-family="Arial" font-size="16" letter-spacing="5" fill="#626a52">IMAGE UNAVAILABLE</text></svg>');
  },true);
  window.addEventListener('hashchange',() => route());
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  $$('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
  readCarts();
  updateCounts();
  renderClothes();
  renderConcepts();
  initBooking();
  route(true);
})();


/* =============================================
   SAVOR RESTAURANT - Main JavaScript
   ============================================= */

// ─── Cart State ─────────────────────────────────────────────
const cart = {
  items: JSON.parse(localStorage.getItem('savor-cart') || '[]'),

  save() {
    localStorage.setItem('savor-cart', JSON.stringify(this.items));
    this.updateUI();
  },

  add(item) {
    const existing = this.items.find(i => i.id === item.id);
    if (existing) {
      existing.qty += 1;
    } else {
      this.items.push({ ...item, qty: 1 });
    }
    this.save();
    showToast(`${item.name} added to order 🎉`);
  },

  remove(id) {
    this.items = this.items.filter(i => i.id !== id);
    this.save();
  },

  updateQty(id, delta) {
    const item = this.items.find(i => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) this.remove(id);
    else this.save();
  },

  get count() {
    return this.items.reduce((sum, i) => sum + i.qty, 0);
  },

  get subtotal() {
    return this.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  },

  get tax() {
    return this.subtotal * 0.0875;
  },

  get delivery() {
    if (this.subtotal === 0) return 0;
    return window.deliveryMode === 'pickup' ? 0 : 4.99;
  },

  get total() {
    return this.subtotal + this.tax + this.delivery;
  },

  updateUI() {
    // Update cart badge
    const count = this.count;
    document.querySelectorAll('.cart-count').forEach(el => {
      el.textContent = count;
      el.classList.toggle('hidden', count === 0);
    });

    // Render cart panel if on order page
    renderCartPanel();
  }
};

// ─── Toast Notification ─────────────────────────────────────
function showToast(msg, icon = '✓') {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    toast.innerHTML = `<span class="toast-icon"></span><span class="toast-msg"></span>`;
    document.body.appendChild(toast);
  }
  toast.querySelector('.toast-icon').textContent = icon;
  toast.querySelector('.toast-msg').textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 3000);
}

// ─── Navbar ──────────────────────────────────────────────────
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  // Scroll state
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  // Mobile toggle
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.navbar-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('open');
      const isOpen = nav.classList.contains('open');
      toggle.setAttribute('aria-expanded', isOpen);
    });

    // Close on link click (mobile)
    nav.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => nav.classList.remove('open'));
    });
  }

  // Set active link
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('active');
    }
  });
}

// ─── Cart Panel Renderer ─────────────────────────────────────
function renderCartPanel() {
  const cartItemsEl = document.getElementById('cartItems');
  if (!cartItemsEl) return;

  if (cart.items.length === 0) {
    cartItemsEl.innerHTML = `
      <div class="cart-empty">
        <span class="cart-empty-icon">🛒</span>
        <p>Your cart is empty</p>
        <p>Add items from the menu above</p>
      </div>`;
  } else {
    cartItemsEl.innerHTML = cart.items.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <img class="cart-item-img" src="${item.img}" alt="${item.name}" loading="lazy">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</div>
        </div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="cart.updateQty('${item.id}', -1)" aria-label="Decrease quantity">−</button>
          <span class="qty-value">${item.qty}</span>
          <button class="qty-btn" onclick="cart.updateQty('${item.id}', 1)" aria-label="Increase quantity">+</button>
        </div>
      </div>`).join('');
  }

  // Update summary
  const deliveryFee = window.deliveryMode === 'pickup' ? 'Free' : `$${cart.delivery.toFixed(2)}`;

  const subtotalEl = document.getElementById('cartSubtotal');
  const taxEl = document.getElementById('cartTax');
  const deliveryEl = document.getElementById('cartDelivery');
  const totalEl = document.getElementById('cartTotal');

  if (subtotalEl) subtotalEl.textContent = `$${cart.subtotal.toFixed(2)}`;
  if (taxEl) taxEl.textContent = `$${cart.tax.toFixed(2)}`;
  if (deliveryEl) deliveryEl.textContent = cart.subtotal === 0 ? '—' : deliveryFee;
  if (totalEl) totalEl.textContent = `$${cart.total.toFixed(2)}`;
}

// ─── Menu Page ───────────────────────────────────────────────
function initMenuPage() {
  // Filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      const sections = document.querySelectorAll('.menu-section');

      if (filter === 'all') {
        sections.forEach(s => s.classList.remove('hidden'));
        document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('hidden'));
      } else {
        sections.forEach(section => {
          const items = section.querySelectorAll('.menu-item');
          let hasVisible = false;
          items.forEach(item => {
            const show = item.dataset.category === filter;
            item.classList.toggle('hidden', !show);
            if (show) hasVisible = true;
          });
          section.classList.toggle('hidden', !hasVisible);
        });
      }
    });
  });

  // Add-to-order buttons
  document.querySelectorAll('.add-to-order-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = {
        id: btn.dataset.id,
        name: btn.dataset.name,
        price: parseFloat(btn.dataset.price),
        img: btn.dataset.img,
      };
      cart.add(item);

      btn.classList.add('added');
      const originalText = btn.innerHTML;
      btn.innerHTML = '✓ Added';
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.classList.remove('added');
      }, 1500);
    });
  });
}

// ─── Order Page ──────────────────────────────────────────────
window.deliveryMode = 'delivery';
let currentStep = 1;

function initOrderPage() {
  renderCartPanel();

  // Clear field error state on input
  document.querySelectorAll('#step2 [required]').forEach(field => {
    field.addEventListener('input', () => { field.style.borderColor = ''; });
  });

  // Delivery options
  document.querySelectorAll('.delivery-option').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.delivery-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      window.deliveryMode = opt.dataset.mode;
      renderCartPanel();
    });
  });

  // Payment options
  document.querySelectorAll('.payment-option').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.payment-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      const radio = opt.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
    });
  });

  // Show card fields based on payment selection
  document.querySelectorAll('.payment-option').forEach(opt => {
    opt.addEventListener('click', () => {
      const cardFields = document.getElementById('cardFields');
      if (cardFields) {
        cardFields.classList.toggle('hidden', opt.dataset.method !== 'card');
      }
    });
  });
}

function goToStep(step) {
  if (step === 2 && cart.items.length === 0) {
    showToast('Please add items to your order first', '⚠️');
    return;
  }

  if (step === 3) {
    // Validate delivery info - reset styles first
    const allFields = document.querySelectorAll('#step2 [required]');
    allFields.forEach(field => { field.style.borderColor = ''; });

    const required = document.querySelectorAll('#step2 [required]');
    for (const field of required) {
      if (!field.value.trim()) {
        field.focus();
        field.style.borderColor = '#ef4444';
        showToast('Please fill in all required fields', '⚠️');
        return;
      }
    }
  }

  currentStep = step;

  document.querySelectorAll('.checkout-panel').forEach((panel, i) => {
    panel.classList.toggle('active', i + 1 === step);
  });

  document.querySelectorAll('.step').forEach((s, i) => {
    s.classList.remove('active', 'completed');
    if (i + 1 === step) s.classList.add('active');
    if (i + 1 < step) s.classList.add('completed');
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function placeOrder() {
  const selectedPayment = document.querySelector('.payment-option.selected');
  if (!selectedPayment) {
    showToast('Please select a payment method', '⚠️');
    return;
  }

  if (cart.items.length === 0) {
    showToast('Your cart is empty!', '⚠️');
    return;
  }

  // Validate card fields if card payment
  if (selectedPayment.dataset.method === 'card') {
    const cardNum = document.getElementById('cardNumber');
    const cardExp = document.getElementById('cardExpiry');
    const cardCvv = document.getElementById('cardCvv');
    if (cardNum && !cardNum.value.trim()) {
      showToast('Please enter card details', '⚠️');
      return;
    }
  }

  // Simulate order placement
  const orderNum = 'SV-' + Math.floor(10000 + Math.random() * 90000);
  const confirmEl = document.getElementById('orderConfirmation');
  const numEl = document.getElementById('orderNumber');

  if (numEl) numEl.textContent = orderNum;

  // Hide panels, show confirmation
  document.querySelectorAll('.checkout-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.step').forEach(s => {
    s.classList.remove('active');
    s.classList.add('completed');
  });

  if (confirmEl) confirmEl.classList.add('active');

  // Clear cart
  cart.items = [];
  cart.save();

  // Animate tracking steps
  setTimeout(() => startOrderTracking(), 1000);

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function startOrderTracking() {
  const steps = document.querySelectorAll('.tracking-step');
  if (!steps.length) return;

  steps.forEach(s => s.className = 'tracking-step pending');
  if (steps[0]) steps[0].className = 'tracking-step done';
  if (steps[1]) {
    setTimeout(() => { steps[1].className = 'tracking-step active'; }, 1500);
  }
}

// ─── Contact Form ─────────────────────────────────────────────
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '⏳ Sending...';
    btn.disabled = true;

    setTimeout(() => {
      form.style.display = 'none';
      document.getElementById('formSuccess').style.display = 'block';
      btn.innerHTML = originalText;
      btn.disabled = false;
    }, 1500);
  });
}

// ─── Scroll Animations ────────────────────────────────────────
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.feature-card, .dish-card, .review-card, .menu-item, .contact-info-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });
}

// ─── Card Number Formatting ───────────────────────────────────
function initCardFormatting() {
  const cardNum = document.getElementById('cardNumber');
  if (cardNum) {
    cardNum.addEventListener('input', e => {
      let v = e.target.value.replace(/\D/g, '').substring(0, 16);
      e.target.value = v.replace(/(.{4})/g, '$1 ').trim();
    });
  }

  const cardExpiry = document.getElementById('cardExpiry');
  if (cardExpiry) {
    cardExpiry.addEventListener('input', e => {
      let v = e.target.value.replace(/\D/g, '').substring(0, 4);
      if (v.length >= 2) v = v.substring(0, 2) + '/' + v.substring(2);
      e.target.value = v;
    });
  }

  const cardCvv = document.getElementById('cardCvv');
  if (cardCvv) {
    cardCvv.addEventListener('input', e => {
      e.target.value = e.target.value.replace(/\D/g, '').substring(0, 4);
    });
  }
}

// ─── Boot ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  cart.updateUI();
  initScrollAnimations();

  // Page-specific inits
  if (document.body.dataset.page === 'menu') initMenuPage();
  if (document.body.dataset.page === 'order') { initOrderPage(); initCardFormatting(); }
  if (document.body.dataset.page === 'contact') initContactForm();
});

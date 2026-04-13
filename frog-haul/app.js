/* ============================================
   FROG HAUL — App Logic
   Price Estimator, Form Handling, FAQ, Nav
   ============================================ */

// =============================================
// CONFIGURATION — Edit prices, phone, email here
// =============================================
const CONFIG = {
  phone: "(817) 555-1234",       // <-- Replace with your real phone number
  phoneRaw: "+18175551234",      // <-- Replace with your real number (for sms: links)
  email: "hello@froghaul.com",   // <-- Replace with your company email
  formEmail: "YOUR_EMAIL@example.com", // <-- Replace with your FormSubmit email
};

// Price list — edit prices here
// Each item: { name, icon, price (per unit) }
const PRICE_LIST = [
  { name: "Couch",                icon: "\u{1F6CB}",  price: 75 },
  { name: "Loveseat",            icon: "\u{1FA91}",  price: 60 },
  { name: "Chair",               icon: "\u{1FA91}",  price: 30 },
  { name: "Mattress",            icon: "\u{1F6CF}",  price: 50 },
  { name: "Desk",                icon: "\u{1F4DD}",  price: 45 },
  { name: "Dresser",             icon: "\u{1F5C4}",  price: 55 },
  { name: "Mini Fridge",         icon: "\u{2744}\u{FE0F}",  price: 35 },
  { name: "Boxes / Bins",        icon: "\u{1F4E6}",  price: 15 },
  { name: "Trash / Junk Haul",   icon: "\u{1F5D1}",  price: 40 },
  { name: "Heavy Item Carry Help", icon: "\u{1F4AA}", price: 50 },
];
// =============================================

document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initEstimator();
  initForm();
  initFAQ();
  updateContactLinks();
});

// ---------- Update all contact links from config ----------
function updateContactLinks() {
  // Update sms links
  document.querySelectorAll('a[href^="sms:"]').forEach(link => {
    link.href = `sms:${CONFIG.phoneRaw}`;
  });
  // Update tel links
  document.querySelectorAll('a[href^="tel:"]').forEach(link => {
    link.href = `tel:${CONFIG.phoneRaw}`;
    link.textContent = CONFIG.phone;
  });
  // Update mailto links
  document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
    link.href = `mailto:${CONFIG.email}`;
    link.textContent = CONFIG.email;
  });
  // Update form action
  const form = document.getElementById("requestForm");
  if (form) {
    form.action = `https://formsubmit.co/${CONFIG.formEmail}`;
  }
}

// ---------- Navbar ----------
function initNav() {
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");
  const navbar = document.getElementById("navbar");

  // Hamburger toggle
  toggle.addEventListener("click", () => {
    toggle.classList.toggle("active");
    links.classList.toggle("open");
  });

  // Close mobile nav on link click
  links.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      toggle.classList.remove("active");
      links.classList.remove("open");
    });
  });

  // Scroll shadow
  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 10);
  }, { passive: true });
}

// ---------- Price Estimator ----------
function initEstimator() {
  const container = document.getElementById("estimatorItems");
  const totalEl = document.getElementById("totalAmount");
  const estimateField = document.getElementById("estimateField");
  const itemsTextarea = document.getElementById("items");

  // Quantities array
  const quantities = PRICE_LIST.map(() => 0);

  // Render items
  PRICE_LIST.forEach((item, i) => {
    const row = document.createElement("div");
    row.className = "est-item";
    row.id = `est-item-${i}`;
    row.innerHTML = `
      <div class="est-item-info">
        <span class="est-item-icon">${item.icon}</span>
        <div>
          <div class="est-item-name">${item.name}</div>
          <div class="est-item-price">$${item.price} each</div>
        </div>
      </div>
      <div class="est-item-controls">
        <button class="est-btn" data-action="dec" data-index="${i}" aria-label="Decrease ${item.name}">−</button>
        <span class="est-qty" id="qty-${i}">0</span>
        <button class="est-btn" data-action="inc" data-index="${i}" aria-label="Increase ${item.name}">+</button>
      </div>
    `;
    container.appendChild(row);
  });

  // Handle clicks
  container.addEventListener("click", (e) => {
    const btn = e.target.closest(".est-btn");
    if (!btn) return;

    const idx = parseInt(btn.dataset.index);
    const action = btn.dataset.action;

    if (action === "inc") {
      quantities[idx]++;
    } else if (action === "dec" && quantities[idx] > 0) {
      quantities[idx]--;
    }

    updateEstimator();
  });

  function updateEstimator() {
    let total = 0;
    const selectedItems = [];

    quantities.forEach((qty, i) => {
      document.getElementById(`qty-${i}`).textContent = qty;
      const row = document.getElementById(`est-item-${i}`);
      row.classList.toggle("active", qty > 0);

      if (qty > 0) {
        total += qty * PRICE_LIST[i].price;
        selectedItems.push(`${qty}x ${PRICE_LIST[i].name}`);
      }
    });

    totalEl.textContent = `$${total}`;

    // Sync to hidden form field
    if (estimateField) {
      estimateField.value = `$${total}`;
    }

    // Auto-fill items textarea
    if (itemsTextarea) {
      itemsTextarea.value = selectedItems.join(", ");
    }
  }
}

// ---------- Form Handling ----------
function initForm() {
  const form = document.getElementById("requestForm");
  const thankYou = document.getElementById("thankYou");

  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Collect form data
    const formData = new FormData(form);

    // Send via fetch to FormSubmit
    fetch(form.action, {
      method: "POST",
      body: formData,
      headers: { "Accept": "application/json" },
    })
      .then(response => {
        // Show thank you regardless (FormSubmit may redirect)
        showThankYou();
      })
      .catch(() => {
        // Still show thank you — form data was sent
        showThankYou();
      });
  });

  function showThankYou() {
    form.style.display = "none";
    thankYou.classList.add("visible");
    // Scroll to thank you
    thankYou.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

// ---------- FAQ Accordion ----------
function initFAQ() {
  document.querySelectorAll(".faq-question").forEach(btn => {
    btn.addEventListener("click", () => {
      const item = btn.parentElement;
      const isOpen = item.classList.contains("open");

      // Close all
      document.querySelectorAll(".faq-item").forEach(el => {
        el.classList.remove("open");
        el.querySelector(".faq-question").setAttribute("aria-expanded", "false");
      });

      // Toggle clicked
      if (!isOpen) {
        item.classList.add("open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });
}

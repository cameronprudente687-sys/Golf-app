/* ============================================
   FROG HAUL — App Logic v2
   Price Estimator, Form, FAQ, Nav, Animations
   ============================================ */

// =============================================
// CONFIGURATION — Edit prices, phone, email here
// =============================================
const CONFIG = {
  phone: "(781) 330-1702",            // <-- Your business phone number
  phoneRaw: "+17813301702",          // <-- Raw format for sms: and tel: links
  email: "frogshaul@gmail.com",       // <-- Your company email
  formEmail: "frogshaul@gmail.com",  // <-- FormSubmit receiving email
};

// Item list — edit names, icons, and order here
// popular: true  => shows a "Popular" badge on that item
const ITEM_LIST = [
  { name: "Couch",                icon: "\u{1F6CB}",  popular: true },
  { name: "Mattress",            icon: "\u{1F6CF}",  popular: true },
  { name: "Chair",               icon: "\u{1FA91}" },
  { name: "Desk",                icon: "\u{1F4DD}",  popular: true },
  { name: "Dresser",             icon: "\u{1F5C4}" },
  { name: "Mini Fridge",         icon: "\u{2744}\u{FE0F}" },
  { name: "Boxes / Bins",        icon: "\u{1F4E6}",  popular: true },
  { name: "Trash / Junk Haul",   icon: "\u{1F5D1}" },
  { name: "Heavy Item Carry Help", icon: "\u{1F4AA}" },
];
// =============================================

document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initEstimator();
  initForm();
  initFAQ();
  initScrollAnimations();
  initMobileBottomBar();
  updateContactLinks();
});

// ---------- Update contact links from config ----------
function updateContactLinks() {
  document.querySelectorAll('a[href^="sms:"]').forEach(link => {
    link.href = `sms:${CONFIG.phoneRaw}`;
  });
  document.querySelectorAll('a[href^="tel:"]').forEach(link => {
    link.href = `tel:${CONFIG.phoneRaw}`;
    link.textContent = CONFIG.phone;
  });
  document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
    link.href = `mailto:${CONFIG.email}`;
    link.textContent = CONFIG.email;
  });
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

  // Scroll effect — shadow + shrink
  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 20);
  }, { passive: true });

  // Close mobile nav when clicking outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".navbar")) {
      toggle.classList.remove("active");
      links.classList.remove("open");
    }
  });
}

// ---------- Item Selector ----------
function initEstimator() {
  const container = document.getElementById("estimatorItems");
  const itemCountEl = document.getElementById("totalItemsCount");
  const itemsTextarea = document.getElementById("items");

  const quantities = ITEM_LIST.map(() => 0);

  // Render items
  ITEM_LIST.forEach((item, i) => {
    const row = document.createElement("div");
    row.className = "est-item";
    row.id = `est-item-${i}`;

    const popularBadge = item.popular
      ? `<span class="est-item-popular">Popular</span>`
      : "";

    row.innerHTML = `
      <div class="est-item-info">
        <span class="est-item-icon">${item.icon}</span>
        <div class="est-item-details">
          <div class="est-item-name-row">
            <span class="est-item-name">${item.name}</span>
            ${popularBadge}
          </div>
        </div>
      </div>
      <div class="est-item-controls">
        <button class="est-btn" data-action="dec" data-index="${i}" aria-label="Decrease ${item.name}">&minus;</button>
        <span class="est-qty" id="qty-${i}">0</span>
        <button class="est-btn" data-action="inc" data-index="${i}" aria-label="Increase ${item.name}">+</button>
      </div>
    `;
    container.appendChild(row);
  });

  // Handle clicks (delegated)
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

    updateItems();
  });

  function updateItems() {
    let totalItems = 0;
    const selectedItems = [];

    quantities.forEach((qty, i) => {
      document.getElementById(`qty-${i}`).textContent = qty;
      const row = document.getElementById(`est-item-${i}`);
      row.classList.toggle("active", qty > 0);

      if (qty > 0) {
        totalItems += qty;
        selectedItems.push(`${qty}x ${ITEM_LIST[i].name}`);
      }
    });

    // Update item count display
    if (itemCountEl) {
      const text = totalItems === 0
        ? "0 items"
        : `${totalItems} item${totalItems > 1 ? "s" : ""}`;
      itemCountEl.textContent = text;
      itemCountEl.classList.add("bump");
      setTimeout(() => itemCountEl.classList.remove("bump"), 200);
    }

    // Auto-fill items textarea on the form
    if (itemsTextarea) {
      itemsTextarea.value = selectedItems.join(", ");
    }
  }
}

// ---------- Form Handling ----------
function initForm() {
  const form = document.getElementById("requestForm");
  const thankYou = document.getElementById("thankYou");
  const submitBtn = form ? form.querySelector(".form-submit-btn") : null;

  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Disable button + show loading
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 0.8s linear infinite"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
        Submitting...
      `;
    }

    const formData = new FormData(form);

    fetch(form.action, {
      method: "POST",
      body: formData,
      headers: { "Accept": "application/json" },
    })
      .then(() => showThankYou())
      .catch(() => showThankYou());
  });

  function showThankYou() {
    form.style.display = "none";
    thankYou.classList.add("visible");
    thankYou.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

// Spin animation for loading
const spinStyle = document.createElement("style");
spinStyle.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
document.head.appendChild(spinStyle);

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

// ---------- Scroll Animations ----------
function initScrollAnimations() {
  const elements = document.querySelectorAll(".animate-on-scroll");
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Stagger animation for siblings
          const delay = entry.target.dataset.delay || 0;
          setTimeout(() => {
            entry.target.classList.add("visible");
          }, delay);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );

  // Add stagger delays to groups of siblings
  const groups = {};
  elements.forEach(el => {
    const parentId = el.parentElement.className;
    if (!groups[parentId]) groups[parentId] = [];
    groups[parentId].push(el);
  });

  Object.values(groups).forEach(group => {
    group.forEach((el, i) => {
      el.dataset.delay = i * 80;
    });
  });

  elements.forEach(el => observer.observe(el));
}

// ---------- Mobile Bottom Bar ----------
function initMobileBottomBar() {
  const bar = document.getElementById("mobileBottomBar");
  if (!bar) return;

  const hero = document.getElementById("hero");
  const footer = document.querySelector(".footer");

  window.addEventListener("scroll", () => {
    const heroBottom = hero ? hero.getBoundingClientRect().bottom : 0;
    const footerTop = footer ? footer.getBoundingClientRect().top : Infinity;
    const windowH = window.innerHeight;

    const pastHero = heroBottom < 0;
    const nearFooter = footerTop < windowH + 80;

    bar.classList.toggle("visible", pastHero && !nearFooter);
  }, { passive: true });
}

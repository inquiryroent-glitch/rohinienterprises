(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const state = {
    lang: "en",
  };

  const CART_KEY = "re_cart_v1";

  const PRODUCT_IMAGES = {
    "df-hard": "https://i.pinimg.com/736x/ba/31/7a/ba317a42d0b683469ed641809c5fbfd6.jpg",
    "df-glass": "https://i.pinimg.com/736x/7e/bb/8a/7ebb8a18fd56aebf1ad5f12a32b981a4.jpg",
    "vc-single": "https://i.pinimg.com/736x/9d/12/2a/9d122a583ebd56548c6feda0c6ca914b.jpg",
    "vc-double": "https://i.pinimg.com/736x/fe/fc/cf/fefccf67f692563206fb301f81870d0a.jpg",
    "cr-custom": "https://i.pinimg.com/736x/81/35/b7/8135b7dc08ecf2bc81fb6bec9ee7a382.jpg",
    "ac": "https://i.pinimg.com/1200x/a8/7d/4e/a87d4eb423c8665c6fc97d174427d56d.jpg",
    "wc": "https://i.pinimg.com/1200x/67/cc/8d/67cc8dbc11ce22522d84604789dbf54b.jpg",
  };

  function moneyINR(value) {
    const n = Number(value || 0);
    return n.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
  }

  function getCart() {
    try {
      const raw = localStorage.getItem(CART_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveCart(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items || []));
  }

  function cartCount() {
    return getCart().reduce((sum, it) => sum + Number(it.qty || 0), 0);
  }

  function setCartBadge() {
    const count = cartCount();
    $$("[data-cart-count]").forEach((el) => {
      el.textContent = String(count);
      el.style.display = count > 0 ? "inline-flex" : "none";
    });
  }

  function addToCart(payload) {
    const id = String(payload.id || "");
    const fallbackImage = PRODUCT_IMAGES[id] || "";
    const item = {
      id,
      name: String(payload.name || ""),
      price: Number(payload.price || 0),
      image: String(payload.image || fallbackImage || ""),
      qty: Number(payload.qty || 1),
    };
    if (!item.id) return;

    const cart = getCart();
    const existing = cart.find((x) => x.id === item.id);
    if (existing) existing.qty = Number(existing.qty || 0) + item.qty;
    else cart.push(item);

    saveCart(cart);
    setCartBadge();
  }

  function updateQty(id, qty) {
    const cart = getCart();
    const it = cart.find((x) => x.id === id);
    if (!it) return;
    it.qty = Math.max(1, Number(qty || 1));
    saveCart(cart);
    setCartBadge();
  }

  function removeItem(id) {
    const cart = getCart().filter((x) => x.id !== id);
    saveCart(cart);
    setCartBadge();
  }

  function clearCart() {
    saveCart([]);
    setCartBadge();
  }

  function setActiveNav() {
    const path = (location.pathname || "").toLowerCase();
    $$(".nav a, .mobile-panel nav a").forEach((a) => {
      a.classList.remove("active");
      const href = (a.getAttribute("href") || "").toLowerCase();
      if (!href) return;
      if (href === "index.html" && (path.endsWith("/") || path.endsWith("index.html") || path === "")) {
        a.classList.add("active");
      } else if (path.endsWith(href)) {
        a.classList.add("active");
      }
    });
  }

  function initMobileMenu() {
    const btn = $("#hamburger");
    const panel = $("#mobilePanel");
    if (!btn || !panel) return;

    btn.addEventListener("click", () => {
      panel.classList.toggle("open");
    });

    document.addEventListener("click", (e) => {
      if (!panel.classList.contains("open")) return;
      const t = e.target;
      if (t === btn || btn.contains(t) || panel.contains(t)) return;
      panel.classList.remove("open");
    });

    $$("#mobilePanel a").forEach((a) => {
      a.addEventListener("click", () => panel.classList.remove("open"));
    });
  }

  function initReveal() {
    const els = $$(".reveal");
    if (!els.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((ent) => {
          if (ent.isIntersecting) {
            ent.target.classList.add("in-view");
            io.unobserve(ent.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    els.forEach((el) => io.observe(el));
  }

  function initScrollTop() {
    const btn = $("#scrollTop");
    if (!btn) return;

    window.addEventListener("scroll", () => {
      if (window.scrollY > 450) btn.classList.add("show");
      else btn.classList.remove("show");
    });

    btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  function initSlider() {
    const slider = $("#heroSlider");
    if (!slider) return;

    const slides = $$(".slide", slider);
    const dots = $$(".dot", slider);
    if (!slides.length) return;

    let idx = 0;

    function set(i) {
      idx = (i + slides.length) % slides.length;
      slides.forEach((s) => s.classList.remove("active"));
      dots.forEach((d) => d.classList.remove("active"));
      slides[idx].classList.add("active");
      if (dots[idx]) dots[idx].classList.add("active");
    }

    dots.forEach((d, i) => d.addEventListener("click", () => set(i)));

    const prev = $("#slidePrev", slider);
    const next = $("#slideNext", slider);
    if (prev) prev.addEventListener("click", () => set(idx - 1));
    if (next) next.addEventListener("click", () => set(idx + 1));

    set(0);
    setInterval(() => set(idx + 1), 4500);
  }

  function initHeroBannerSlider() {
    const slider = $("#heroBannerSlider");
    if (!slider) return;

    const slides = $$(".hero-slide", slider);
    if (slides.length <= 1) return;

    const prevBtn = $("#heroBannerPrev");
    const nextBtn = $("#heroBannerNext");

    let currentIndex = 0;
    let slideInterval;

    function showSlide(index) {
      // Ensure index is within bounds
      if (index < 0) index = slides.length - 1;
      if (index >= slides.length) index = 0;
      
      currentIndex = index;
      
      slides.forEach((slide, i) => {
        if (i === index) {
          slide.classList.add("active");
        } else {
          slide.classList.remove("active");
        }
      });
    }

    function nextSlide() {
      showSlide(currentIndex + 1);
    }

    function prevSlide() {
      showSlide(currentIndex - 1);
    }

    function startAutoSlide() {
      stopAutoSlide(); // Clear any existing interval
      slideInterval = setInterval(nextSlide, 5000); // Change slide every 5 seconds
    }

    function stopAutoSlide() {
      if (slideInterval) {
        clearInterval(slideInterval);
        slideInterval = null;
      }
    }

    // Navigation button handlers
    if (nextBtn) {
      nextBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        nextSlide();
        stopAutoSlide();
        setTimeout(startAutoSlide, 5000); // Restart after delay
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        prevSlide();
        stopAutoSlide();
        setTimeout(startAutoSlide, 5000); // Restart after delay
      });
    }

    // Initialize first slide
    showSlide(0);

    // Start auto-sliding
    startAutoSlide();

    // Pause on hover
    slider.addEventListener("mouseenter", stopAutoSlide);
    slider.addEventListener("mouseleave", startAutoSlide);

    // Pause on touch (mobile)
    slider.addEventListener("touchstart", stopAutoSlide);
    slider.addEventListener("touchend", () => {
      setTimeout(startAutoSlide, 3000);
    });
  }

  function initAddToCartButtons() {
    const buttons = $$("[data-add-to-cart]");
    if (!buttons.length) return;

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const name = btn.getAttribute("data-name");
        const price = btn.getAttribute("data-price");
        const image = btn.getAttribute("data-image");
        addToCart({ id, name, price, image, qty: 1 });
        alert("Added to cart!");
      });
    });
  }

  function renderCartPage() {
    const root = $("#cartRoot");
    if (!root) return;

    const cart = getCart();
    if (!cart.length) {
      root.innerHTML =
        "<div class=\"card\" style=\"padding:18px;border-radius:24px;\"><h3 style=\"margin:0 0 10px 0\">" +
        "Your cart is empty" +
        "</h3><p class=\"small-note\" style=\"margin:0 0 14px 0\">" +
        "Go to Shop and add products." +
        "</p><a class=\"btn btn-accent\" href=\"products.html\">" +
        "Open Shop" +
        "</a></div>";
      return;
    }

    const rows = cart
      .map((it) => {
        const line = Number(it.price || 0) * Number(it.qty || 0);
        const img = String(it.image || PRODUCT_IMAGES[String(it.id || "")] || "");
        return (
          "<div class=\"cart-row\">" +
          "<div class=\"cart-media\"><img loading=\"lazy\" src=\"" +
          img +
          "\" alt=\"" +
          it.name +
          "\" /></div>" +
          "<div class=\"cart-info\"><div class=\"cart-name\">" +
          it.name +
          "</div><div class=\"cart-price\">" +
          moneyINR(it.price) +
          "</div></div>" +
          "<div class=\"cart-qty\"><input type=\"number\" min=\"1\" value=\"" +
          it.qty +
          "\" data-qty-id=\"" +
          it.id +
          "\" /></div>" +
          "<div class=\"cart-line\">" +
          moneyINR(line) +
          "</div>" +
          "<div class=\"cart-remove\"><button class=\"btn btn-outline\" type=\"button\" data-remove-id=\"" +
          it.id +
          "\">" +
          "Remove" +
          "</button></div>" +
          "</div>"
        );
      })
      .join("");

    const subtotal = cart.reduce((sum, it) => sum + Number(it.price || 0) * Number(it.qty || 0), 0);

    root.innerHTML =
      "<div class=\"cart\">" +
      rows +
      "</div>" +
      "<div class=\"cart-summary\">" +
      "<div class=\"card\" style=\"padding:18px;border-radius:24px;\">" +
      "<div style=\"display:flex;align-items:center;justify-content:space-between;gap:10px;\">" +
      "<strong>" +
      "Subtotal" +
      "</strong><strong>" +
      moneyINR(subtotal) +
      "</strong></div>" +
      "<p class=\"small-note\" style=\"margin:10px 0 14px 0\">" +
      "Proceed to checkout to place your enquiry order." +
      "</p>" +
      "<div style=\"display:flex;gap:10px;flex-wrap:wrap;\">" +
      "<a class=\"btn btn-accent\" href=\"checkout.html\">" +
      "Checkout" +
      "</a>" +
      "<button class=\"btn btn-outline\" type=\"button\" id=\"clearCart\">" +
      "Clear Cart" +
      "</button>" +
      "</div></div></div>";

    $$("[data-qty-id]").forEach((inp) => {
      inp.addEventListener("change", () => {
        const id = inp.getAttribute("data-qty-id");
        updateQty(id, inp.value);
        renderCartPage();
      });
    });

    $$("[data-remove-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-remove-id");
        removeItem(id);
        renderCartPage();
      });
    });

    const clearBtn = $("#clearCart");
    if (clearBtn)
      clearBtn.addEventListener("click", () => {
        clearCart();
        renderCartPage();
      });
  }

  function renderCheckoutPage() {
    const root = $("#checkoutRoot");
    if (!root) return;
    const cart = getCart();

    const list = cart
      .map((it) =>
        "<div class=\"checkout-row\"><div>" +
        it.name +
        " <span class=\"small-note\">× " +
        it.qty +
        "</span></div><strong>" +
        moneyINR(Number(it.price || 0) * Number(it.qty || 0)) +
        "</strong></div>"
      )
      .join("");

    const subtotal = cart.reduce((sum, it) => sum + Number(it.price || 0) * Number(it.qty || 0), 0);

    root.innerHTML =
      "<div class=\"card\" style=\"padding:18px;border-radius:24px;\">" +
      "<h3 style=\"margin:0 0 12px 0\">" +
      "Order Summary" +
      "</h3>" +
      (cart.length ? list : "<p class=\"small-note\" style=\"margin:0\">Cart is empty.</p>") +
      "<div style=\"height:1px;background:rgba(15,23,42,.08);margin:12px 0\"></div>" +
      "<div class=\"checkout-row\"><div><strong>" +
      "Total" +
      "</strong></div><strong>" +
      moneyINR(subtotal) +
      "</strong></div>" +
      "</div>";

    const form = $("#checkoutForm");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!getCart().length) {
        alert("Please add products from Shop first.");
        return;
      }
      alert("Order/Enquiry submitted! We'll contact you shortly.");
      clearCart();
      form.reset();
      renderCheckoutPage();
    });
  }

  function initContactForm() {
    const form = $("#contactForm");
    if (!form) return;

    // Set Web3Forms access key from config if available
    if (window.WEB3FORMS_CONFIG && window.WEB3FORMS_CONFIG.accessKey) {
      const accessKeyInput = form.querySelector('#web3formsAccessKey');
      if (accessKeyInput) {
        accessKeyInput.value = window.WEB3FORMS_CONFIG.accessKey;
      }
    }

    function showError(id, on) {
      const el = $(id);
      if (!el) return;
      el.style.display = on ? "block" : "none";
    }

    function showSuccess(message) {
      alert(message);
    }

    function showLoading(show) {
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        if (show) {
          submitBtn.disabled = true;
          submitBtn.textContent = "Sending...";
          submitBtn.style.opacity = "0.6";
        } else {
          submitBtn.disabled = false;
          submitBtn.textContent = "Send Enquiry";
          submitBtn.style.opacity = "1";
        }
      }
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = $("#name");
      const phone = $("#phone");
      const email = $("#email");
      const req = form.querySelector('[name="message"]') || $("#requirement");

      const vName = (name && name.value || "").trim();
      const vPhone = (phone && phone.value || "").trim();
      const vEmail = (email && email.value || "").trim();
      const vReq = (req && req.value || "").trim();

      const okName = vName.length >= 2;
      const okPhone = /^\+?[0-9\s\-]{10,15}$/.test(vPhone);
      const okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(vEmail);
      const okReq = vReq.length >= 8;

      showError("#errName", !okName);
      showError("#errPhone", !okPhone);
      showError("#errEmail", !okEmail);
      showError("#errReq", !okReq);

      if (!(okName && okPhone && okEmail && okReq)) return;

      // Get access key
      const accessKey = form.querySelector('#web3formsAccessKey')?.value || 
                       window.WEB3FORMS_CONFIG?.accessKey || 
                       '3ec562cb-915d-4fcd-a37e-cfec23aac3dc';

      if (!accessKey || accessKey === 'YOUR_ACCESS_KEY') {
        alert("Email service not configured. Please contact us directly.");
        return;
      }

      try {
        showLoading(true);

        // Prepare form data for Web3Forms
        const formData = new FormData(form);
        formData.set('access_key', accessKey);
        formData.set('name', vName);
        formData.set('email', vEmail);
        formData.set('phone', vPhone);
        formData.set('message', vReq);
        formData.set('subject', window.WEB3FORMS_CONFIG?.subject || 'New Contact Form Inquiry - Rohini Enterprises');

        console.log("Submitting to Web3Forms with data:", {
          name: vName,
          email: vEmail,
          phone: vPhone,
          message: vReq
        });

        // Submit to Web3Forms API
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body: formData
        });

        const result = await response.json();

        if (result.success) {
          console.log("Email sent successfully:", result);
          showSuccess("Enquiry sent successfully! We'll contact you shortly.");
          form.reset();
        } else {
          console.error("Web3Forms Error:", result);
          throw new Error(result.message || "Failed to send email");
        }
      } catch (error) {
        console.error("Form submission error:", error);
        alert("Failed to send enquiry. Please try again or contact us directly at inquiry.roent@gmail.com");
      } finally {
        showLoading(false);
      }
    });
  }

  function initFlipCards() {
    const flipCards = $$("[data-flip-card]");
    if (flipCards.length === 0) return;

    // Check if device is mobile/tablet
    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    flipCards.forEach((card) => {
      if (isMobile) {
        // Mobile: Flip on tap/click
        card.addEventListener("click", () => {
          card.classList.toggle("flipped");
        });
      }
      // Desktop: Flip on hover is handled by CSS
    });
  }

  function initServiceSpotlight() {
    const selectors = $$(".service-selector");
    const spotlightCard = $("#spotlightCard");
    const spotlightIcon = $("#spotlightIcon");
    const spotlightTitle = $("#spotlightTitle");
    const spotlightDescription = $("#spotlightDescription");

    if (selectors.length === 0 || !spotlightCard) return;

    function updateSpotlight(selector) {
      const icon = selector.getAttribute("data-icon");
      const title = selector.getAttribute("data-title");
      const description = selector.getAttribute("data-description");

      // Update content
      if (spotlightIcon) {
        spotlightIcon.innerHTML = `<i class="fa ${icon}"></i>`;
      }
      if (spotlightTitle) {
        spotlightTitle.textContent = title;
      }
      if (spotlightDescription) {
        spotlightDescription.textContent = description;
      }

      // Add fade animation
      spotlightCard.classList.add("fade-in");
      setTimeout(() => {
        spotlightCard.classList.remove("fade-in");
      }, 400);

      // Update active state
      selectors.forEach((s) => s.classList.remove("active"));
      selector.classList.add("active");
    }

    // Desktop: Update on hover
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    
    if (!isMobile) {
      selectors.forEach((selector) => {
        selector.addEventListener("mouseenter", () => {
          updateSpotlight(selector);
        });
      });
    }

    // Mobile/Tablet: Update on click
    selectors.forEach((selector) => {
      selector.addEventListener("click", () => {
        updateSpotlight(selector);
      });
    });
  }

  function initServiceIconFallbacks() {
    const serviceFlowCards = $$(".service-flow-card");
    const serviceCards = $$(".service-card");
    const allCards = [...serviceFlowCards, ...serviceCards];
    
    if (allCards.length === 0) return;

    function checkIconVisibility(iconElement) {
      if (!iconElement) return false;

      // Check if element has dimensions
      const hasDimensions = iconElement.offsetWidth > 0 && iconElement.offsetHeight > 0;
      
      // Check computed styles
      const computed = window.getComputedStyle(iconElement);
      const isVisible = computed.display !== "none" && 
                       computed.visibility !== "hidden" &&
                       computed.opacity !== "0";

      // Check if Font Awesome is loaded by checking for ::before pseudo-element content
      const beforeContent = computed.getPropertyValue("content");
      const hasBeforeContent = beforeContent && beforeContent !== "none" && beforeContent !== '""';

      // Check if icon has any visible content
      const hasText = iconElement.textContent.trim() !== "";

      return hasDimensions && isVisible && (hasBeforeContent || hasText);
    }

    function ensureIconDisplay(card) {
      const iconContainer = card.querySelector(".service-icon");
      if (!iconContainer) return;

      const faIcon = iconContainer.querySelector("i.fa");
      const fallback = iconContainer.querySelector(".icon-fallback");

      if (!faIcon || !fallback) {
        // If no fallback exists, create one as a safety measure
        if (faIcon && !fallback) {
          const defaultFallback = document.createElement("span");
          defaultFallback.className = "icon-fallback";
          defaultFallback.textContent = "⚙️";
          iconContainer.appendChild(defaultFallback);
          // Re-check with the new fallback
          setTimeout(() => ensureIconDisplay(card), 50);
          return;
        }
        return;
      }

      // Check if Font Awesome icon is visible
      const iconVisible = checkIconVisibility(faIcon);

      if (!iconVisible) {
        // Hide FA icon and show fallback
        faIcon.classList.add("hide");
        fallback.classList.add("show");
      } else {
        // Show FA icon and hide fallback
        faIcon.classList.remove("hide");
        fallback.classList.remove("show");
      }
    }

    // Check all cards
    allCards.forEach(ensureIconDisplay);

    // Re-check after delays to catch late-loading Font Awesome
    setTimeout(() => allCards.forEach(ensureIconDisplay), 100);
    setTimeout(() => allCards.forEach(ensureIconDisplay), 500);
    setTimeout(() => allCards.forEach(ensureIconDisplay), 1000);
    setTimeout(() => allCards.forEach(ensureIconDisplay), 2000);

    // Check on window load
    window.addEventListener("load", () => {
      allCards.forEach(ensureIconDisplay);
    });

    // Also check when Font Awesome might finish loading
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        setTimeout(() => allCards.forEach(ensureIconDisplay), 100);
      });
    }
  }

  function initAboutSectionHeights() {
    const grid = $(".about-grid");
    if (!grid) return;

    const text = $(".about-text", grid);
    const image = $(".about-img", grid);
    if (!text || !image) return;

    const sync = () => {
      if (window.matchMedia("(max-width: 768px)").matches) {
        image.style.height = "";
        return;
      }

      image.style.height = "";
      const targetHeight = text.offsetHeight;
      if (targetHeight > 0) {
        image.style.height = `${targetHeight}px`;
      }
    };

    sync();
    window.addEventListener("load", sync);
    window.addEventListener("resize", sync);

    if (window.ResizeObserver) {
      const ro = new ResizeObserver(() => sync());
      ro.observe(text);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    setActiveNav();
    initMobileMenu();
    initReveal();
    initScrollTop();
    initSlider();
    initHeroBannerSlider();
    initContactForm();
    initAddToCartButtons();
    setCartBadge();
    renderCartPage();
    renderCheckoutPage();
    initFlipCards();
    initServiceSpotlight();
    initServiceIconFallbacks();
    initAboutSectionHeights();
  });
})();

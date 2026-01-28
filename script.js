(() => {
  const qs = (sel, el = document) => el.querySelector(sel);
  const qsa = (sel, el = document) => Array.from(el.querySelectorAll(sel));

  // Year
  qs("#year").textContent = String(new Date().getFullYear());

  // Mobile menu
  const header = qs(".header");
  const nav = qs("#nav");
  const menuBtn = qs("#menuBtn");

  const closeMenu = () => {
    header.classList.remove("is-open");
    menuBtn.setAttribute("aria-expanded", "false");
  };

  menuBtn.addEventListener("click", () => {
    const open = header.classList.toggle("is-open");
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
  });

  // Close menu when clicking a link (mobile)
  qsa('a[href^="#"]', nav).forEach(a => {
    a.addEventListener("click", closeMenu);
  });

  // Close on outside click / ESC
  document.addEventListener("click", (e) => {
    if (!header.classList.contains("is-open")) return;
    const clickedInside = header.contains(e.target);
    if (!clickedInside) closeMenu();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  // Scroll progress bar
  const progress = qs("#progress");
  const onScroll = () => {
    const doc = document.documentElement;
    const scrollTop = doc.scrollTop || document.body.scrollTop;
    const height = doc.scrollHeight - doc.clientHeight;
    const pct = height > 0 ? (scrollTop / height) * 100 : 0;
    progress.style.width = `${pct.toFixed(2)}%`;
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Reveal on view
  const revealEls = qsa(".reveal");
  const io = new IntersectionObserver((entries) => {
    entries.forEach(ent => {
      if (ent.isIntersecting) {
        ent.target.classList.add("is-visible");
        io.unobserve(ent.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => io.observe(el));

  // Portfolio modal
  const modal = qs("#modal");
  const modalTitle = qs("#modalTitle");
  const modalDesc = qs("#modalDesc");

  const openModal = ({ title, desc }) => {
    modalTitle.textContent = title;
    modalDesc.textContent = desc;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    // prevent background scroll
    document.body.style.overflow = "hidden";
    // focus close button for accessibility
    const closeBtn = qs("[data-close]", modal);
    closeBtn?.focus();
  };

  const closeModal = () => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  qsa(".work").forEach(btn => {
    btn.addEventListener("click", () => {
      openModal({
        title: btn.dataset.modal || "Projeto",
        desc: btn.dataset.desc || ""
      });
    });
  });

  qsa("[data-close]", modal).forEach(el => {
    el.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
  });

  // Testimonials slider
  const track = qs("#sliderTrack");
  const prevBtn = qs("#prevBtn");
  const nextBtn = qs("#nextBtn");
  const dotsWrap = qs("#dots");
  const slides = qsa(".testimonial", track);

  let index = 0;

  const renderDots = () => {
    dotsWrap.innerHTML = "";
    slides.forEach((_, i) => {
      const b = document.createElement("button");
      b.className = "dotbtn";
      b.type = "button";
      b.setAttribute("aria-label", `Ir para depoimento ${i + 1}`);
      b.setAttribute("aria-current", i === index ? "true" : "false");
      b.addEventListener("click", () => {
        index = i;
        updateSlider();
      });
      dotsWrap.appendChild(b);
    });
  };

  const updateSlider = () => {
    const offset = -index * 100;
    track.style.transform = `translateX(${offset}%)`;
    qsa(".dotbtn", dotsWrap).forEach((d, i) => {
      d.setAttribute("aria-current", i === index ? "true" : "false");
    });
  };

  prevBtn.addEventListener("click", () => {
    index = (index - 1 + slides.length) % slides.length;
    updateSlider();
  });

  nextBtn.addEventListener("click", () => {
    index = (index + 1) % slides.length;
    updateSlider();
  });

  renderDots();
  updateSlider();

  // Basic contact form validation (client-side)
  const form = qs("#contactForm");
  const note = qs("#formNote");

  const setError = (name, msg) => {
    const el = qs(`[data-error-for="${name}"]`);
    if (el) el.textContent = msg || "";
  };

  const validateEmail = (email) => {
    // pragmatic email regex
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(String(email).trim());
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    note.textContent = "";
    const fd = new FormData(form);
    const name = String(fd.get("name") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const message = String(fd.get("message") || "").trim();

    let ok = true;
    setError("name", "");
    setError("email", "");
    setError("message", "");

    if (name.length < 2) { setError("name", "Digite seu nome (mín. 2 caracteres)."); ok = false; }
    if (!validateEmail(email)) { setError("email", "Digite um e-mail válido."); ok = false; }
    if (message.length < 10) { setError("message", "Escreva uma mensagem com pelo menos 10 caracteres."); ok = false; }

    if (!ok) {
      note.textContent = "⚠️ Corrija os campos destacados e tente novamente.";
      return;
    }

    // Demo behavior: simulate sending
    note.textContent = "✅ Mensagem pronta! (Aqui você conectaria com backend/WhatsApp/E-mail.)";
    form.reset();
  });
})();
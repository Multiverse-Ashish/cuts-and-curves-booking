/* ── App Logic & Micro-Animations ─────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

  // Mobile menu
  const ham = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobile-nav');
  if (ham && mobileNav) {
    ham.addEventListener('click', () => {
      mobileNav.classList.toggle('open');
      ham.querySelector('i').classList.toggle('fa-bars');
      ham.querySelector('i').classList.toggle('fa-times');
    });
    mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      mobileNav.classList.remove('open');
    }));
  }

  // Sticky header shadow & shrink on scroll
  const header = document.getElementById('site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        header.style.boxShadow = 'var(--shadow-md)';
        header.style.background = 'rgba(255,255,255,0.88)';
      } else {
        header.style.boxShadow = '';
        header.style.background = 'rgba(255,255,255,0.75)';
      }
    });
  }

  // Lightbox
  const lightbox = document.getElementById('lightbox');
  if (lightbox) {
    const lbImg = document.getElementById('lb-img');
    const lbClose = lightbox.querySelector('.lb-close');
    document.querySelectorAll('.lb-trigger').forEach(t => {
      t.addEventListener('click', e => {
        e.preventDefault();
        lbImg.src = t.getAttribute('href') || t.closest('.gal-item').querySelector('img').src;
        lightbox.classList.add('open');
      });
    });
    const closeLb = () => { lightbox.classList.remove('open'); lbImg.src = ''; };
    lbClose.addEventListener('click', closeLb);
    lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLb(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLb(); });
  }

  // FAQ accordion
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  // ── BOOKING FORM ────────────────────────────────────────────────────────────
  const form = document.getElementById('booking-form');
  if (form) {
    const selSvc   = document.getElementById('sel-service');
    const selStyl  = document.getElementById('sel-stylist');
    const inpDate  = document.getElementById('inp-date');
    const selTime  = document.getElementById('sel-time');
    const inpName  = document.getElementById('inp-name');
    const inpPhone = document.getElementById('inp-phone');
    const invBase  = document.getElementById('inv-base');
    const invGst   = document.getElementById('inv-gst');
    const invTotal = document.getElementById('inv-total');

    // Min date = today
    inpDate.min = new Date().toISOString().split('T')[0];

    // Pre-select from query string
    const qs = new URLSearchParams(window.location.search);
    if (qs.get('service')) {
      [...selSvc.options].forEach(o => { if (o.value === qs.get('service')) o.selected = true; });
    }
    if (qs.get('stylist')) {
      [...selStyl.options].forEach(o => { if (o.value === qs.get('stylist')) o.selected = true; });
    }

    const updateInvoice = () => {
      const opt = selSvc.options[selSvc.selectedIndex];
      const base = opt && opt.dataset.price ? parseInt(opt.dataset.price) : 0;
      const gst  = Math.round(base * 0.18);
      invBase.textContent  = '₹' + base;
      invGst.textContent   = '₹' + gst;
      invTotal.textContent = '₹' + (base + gst);
    };
    selSvc.addEventListener('change', updateInvoice);
    updateInvoice();

    form.addEventListener('submit', e => {
      e.preventDefault();
      const opt    = selSvc.options[selSvc.selectedIndex];
      const base   = parseInt(opt.dataset.price) || 0;
      const gst    = Math.round(base * 0.18);
      const total  = base + gst;
      const salon  = document.getElementById('salon-name').value;
      const waNum  = document.getElementById('wa-number').value;

      // Detect if booking a course or a regular service
      const isCourse = opt.closest('optgroup') && opt.closest('optgroup').label.includes('Academy');

      let msg = '';
      if (isCourse) {
        msg = `Hello ${salon}! 🎓
        
I am interested in enrolling in your professional training course:
🎓 *Course:* ${selSvc.value}
💰 *Tuition Fee:* ₹${total} (₹${base} + 18% GST)
📅 *Preferred Start Batch:* ${inpDate.value}
⏰ *Time Slot:* ${selTime.value}

My Trainee Details:
• *Name:* ${inpName.value}
• *Phone:* ${inpPhone.value}

Please share the syllabus brochure and confirm my registration. Thank you! 🙏`;
      } else {
        msg = `Hello ${salon}! 👋

I would like to book an appointment:
📋 *Service:* ${selSvc.value}
💰 *Total:* ₹${total} (₹${base} + 18% GST)
📅 *Date:* ${inpDate.value}
⏰ *Time:* ${selTime.value}
👤 *Specialist:* ${selStyl.value}

My Details:
• *Name:* ${inpName.value}
• *Phone:* ${inpPhone.value}

Please confirm my slot. Thank you! 🙏`;
      }

      window.open(`https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`, '_blank');
    });
  }

  // ── Intersection Observer for staggered fade-up-scale scroll animations ──
  const animatedEls = document.querySelectorAll('.svc-card, .gal-item, .review-card, .pricing-card, .team-card, .course-card');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-active');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -50px 0px' });
    animatedEls.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px) scale(0.97)';
      el.style.transition = 'opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1), transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)';
      observer.observe(el);
    });
  } else {
    animatedEls.forEach(el => el.classList.add('reveal-active'));
  }

});

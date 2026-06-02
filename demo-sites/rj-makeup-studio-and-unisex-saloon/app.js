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
    if (lbClose) lbClose.addEventListener('click', closeLb);
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

  // ── DETAIL MODAL LOGIC ─────────────────────────────────────────────────────
  const detailModal = document.getElementById('detail-modal');
  const modalClose = document.getElementById('modal-close-btn');
  const modalTitle = document.getElementById('modal-title');
  const modalDesc = document.getElementById('modal-desc');
  const modalDuration = document.getElementById('modal-duration');
  const modalPrice = document.getElementById('modal-price');
  const modalBasePrice = document.getElementById('modal-base-price');
  const modalGstAmount = document.getElementById('modal-gst-amount');
  const modalHero = document.getElementById('modal-hero');
  const modalBadge = document.getElementById('modal-badge');
  const modalWaBtn = document.getElementById('modal-wa-btn');
  const modalCustomBookBtn = document.getElementById('modal-custom-book-btn');

  // Helper images for modal banner
  const categoryHeroImages = {
    'barber': 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=600',
    'spa': 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=600',
    'beauty': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=600',
    'unisex': 'https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=600'
  };

  const openDetailModal = (btn) => {
    if (!detailModal) return;
    const title = btn.getAttribute('data-title');
    const price = parseInt(btn.getAttribute('data-price')) || 0;
    const duration = btn.getAttribute('data-duration');
    const desc = btn.getAttribute('data-desc');
    const category = btn.getAttribute('data-category');
    const isCourse = btn.getAttribute('data-is-course') === 'true';

    if (modalTitle) modalTitle.textContent = title;
    if (modalDesc) modalDesc.textContent = desc;
    if (modalDuration) modalDuration.innerHTML = `<i class="far fa-clock"></i> ${duration}`;
    
    const gst = Math.round(price * 0.18);
    const total = price + gst;

    if (modalPrice) modalPrice.textContent = '₹' + total;
    if (modalBasePrice) modalBasePrice.textContent = '₹' + price;
    if (modalGstAmount) modalGstAmount.textContent = '₹' + gst;

    if (modalBadge) modalBadge.textContent = isCourse ? 'Academy Course' : 'Premium Service';
        const image = btn.getAttribute('data-image');
    if (modalHero) {
      if (image) {
        modalHero.style.backgroundImage = `url('${image}')`;
      } else {
        modalHero.style.backgroundImage = `url('${categoryHeroImages[category] || categoryHeroImages['unisex']}')`;
      }
    }

    // Construct WhatsApp message
    let msg = '';
    const waNum = window.SALON_WA || '919598777222';
    const salon = window.SALON_NAME || 'Premium Salon';

    if (isCourse) {
      msg = `Hello ${salon}! 🎓\n\nI want to enroll in the training course:\n🎓 *Course:* ${title}\n💰 *Tuition Fee:* ₹${total} (₹${price} + 18% GST)\n\nPlease share the syllabus and next batch start date. Thank you!`;
    } else {
      msg = `Hello ${salon}! 👋\n\nI want to book the service:\n📋 *Service:* ${title}\n💰 *Total:* ₹${total} (₹${price} + 18% GST)\n\nPlease confirm slot availability. Thank you!`;
    }

    if (modalWaBtn) modalWaBtn.href = `https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`;

    // Custom booking click scrolls to homepage form and pre-selects
    if (modalCustomBookBtn) {
      modalCustomBookBtn.onclick = () => {
        closeDetailModal();
        const bookingSection = document.getElementById('homepage-booking');
        if (bookingSection) {
          bookingSection.scrollIntoView({ behavior: 'smooth' });
          
          // Select appropriate tab
          if (isCourse) {
            switchToTab('course');
          } else {
            switchToTab('appointment');
          }

          // Set value in select
          setTimeout(() => {
            const selectEl = document.getElementById('hp-sel-service');
            if (selectEl) {
              selectEl.value = title;
              selectEl.dispatchEvent(new Event('change'));
            }
          }, 300);
        }
      };
    }

    detailModal.classList.add('open');
  };

  const closeDetailModal = () => {
    if (detailModal) detailModal.classList.remove('open');
  };

  // Add click listeners to all triggers
  document.querySelectorAll('.modal-trigger').forEach(btn => {
    btn.addEventListener('click', () => openDetailModal(btn));
  });

  if (modalClose) {
    modalClose.addEventListener('click', closeDetailModal);
  }
  if (detailModal) {
    detailModal.addEventListener('click', e => { if (e.target === detailModal) closeDetailModal(); });
  }

  // ── HOMEPAGE BOOKING FORM LOGIC ────────────────────────────────────────────
  const hpForm = document.getElementById('homepage-booking-form');
  const tabAppointmentBtn = document.getElementById('tab-appointment-btn');
  const tabCourseBtn = document.getElementById('tab-course-btn');
  const hpSelService = document.getElementById('hp-sel-service');
  const hpSelStylist = document.getElementById('hp-sel-stylist');
  const hpInpDate = document.getElementById('hp-inp-date');
  const hpSelTime = document.getElementById('hp-sel-time');
  const hpInpName = document.getElementById('hp-inp-name');
  const hpInpPhone = document.getElementById('hp-inp-phone');
  const hpTxtRequests = document.getElementById('hp-txt-requests');
  const hpInvBase = document.getElementById('hp-inv-base');
  const hpInvGst = document.getElementById('hp-inv-gst');
  const hpInvTotal = document.getElementById('hp-inv-total');
  const dropdownLabel = document.getElementById('dropdown-label');

  let activeTab = 'appointment'; // 'appointment' or 'course'

  if (hpInpDate) {
    hpInpDate.min = new Date().toISOString().split('T')[0];
  }

  const populateServices = () => {
    if (!hpSelService) return;
    hpSelService.innerHTML = '<option value="" disabled selected>Choose a service...</option>';
    const list = window.SALON_SERVICES || [];
    list.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.n;
      opt.textContent = `${s.n} — ₹${s.p}`;
      opt.setAttribute('data-price', s.p);
      hpSelService.appendChild(opt);
    });
  };

  const populateCourses = () => {
    if (!hpSelService) return;
    hpSelService.innerHTML = '<option value="" disabled selected>Choose a course...</option>';
    const list = window.SALON_COURSES || [];
    list.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.n;
      opt.textContent = `${c.n} — ₹${c.p} (${c.d} Wks)`;
      opt.setAttribute('data-price', c.p);
      hpSelService.appendChild(opt);
    });
  };

  const populateStylists = () => {
    if (hpSelStylist) {
      hpSelStylist.innerHTML = '';
      if (activeTab === 'appointment') {
        const optionDefault = document.createElement('option');
        optionDefault.value = 'Any Available Specialist';
        optionDefault.textContent = 'Any Available Specialist';
        hpSelStylist.appendChild(optionDefault);
        const list = window.SALON_STYLISTS || [];
        list.forEach(sty => {
          const opt = document.createElement('option');
          opt.value = sty.n;
          opt.textContent = sty.n;
          hpSelStylist.appendChild(opt);
        });
      } else {
        const opt = document.createElement('option');
        opt.value = 'Academy Master Trainer';
        opt.textContent = 'Academy Master Trainer';
        hpSelStylist.appendChild(opt);
      }
    }
  };

  const updateHpInvoice = () => {
    if (!hpSelService || !hpInvBase || !hpInvGst || !hpInvTotal) return;
    const opt = hpSelService.options[hpSelService.selectedIndex];
    const base = opt && opt.getAttribute('data-price') ? parseInt(opt.getAttribute('data-price')) : 0;
    const gst  = Math.round(base * 0.18);
    hpInvBase.textContent  = '₹' + base;
    hpInvGst.textContent   = '₹' + gst;
    hpInvTotal.textContent = '₹' + (base + gst);
  };

  const switchToTab = (tab) => {
    activeTab = tab;
    if (tab === 'appointment') {
      if (tabAppointmentBtn) tabAppointmentBtn.classList.add('active');
      if (tabCourseBtn) tabCourseBtn.classList.remove('active');
      if (dropdownLabel) dropdownLabel.textContent = 'Select Service';
      populateServices();
      populateStylists();
    } else {
      if (tabCourseBtn) tabCourseBtn.classList.add('active');
      if (tabAppointmentBtn) tabAppointmentBtn.classList.remove('active');
      if (dropdownLabel) dropdownLabel.textContent = 'Select Academy Course';
      populateCourses();
      populateStylists();
    }
    updateHpInvoice();
  };

  // expose tab switch to global scope for quick clicks
  window.switchToTab = switchToTab;

  if (tabAppointmentBtn && tabCourseBtn) {
    tabAppointmentBtn.addEventListener('click', () => switchToTab('appointment'));
    tabCourseBtn.addEventListener('click', () => switchToTab('course'));
    
    // Initial setup
    switchToTab('appointment');
  }

  if (hpSelService) {
    hpSelService.addEventListener('change', updateHpInvoice);
  }

  if (hpForm) {
    hpForm.addEventListener('submit', e => {
      e.preventDefault();
      const opt    = hpSelService.options[hpSelService.selectedIndex];
      const base   = parseInt(opt.getAttribute('data-price')) || 0;
      const gst    = Math.round(base * 0.18);
      const total  = base + gst;
      const salon  = window.SALON_NAME || 'Premium Salon';
      const waNum  = window.SALON_WA || '919598777222';

      let msg = '';
      if (activeTab === 'course') {
        msg = `Hello ${salon}! 🎓\n\nI want to enroll in the training course:\n🎓 *Course:* ${hpSelService.value}\n💰 *Tuition Fee:* ₹${total} (₹${base} + 18% GST)\n📅 *Preferred Start Batch:* ${hpInpDate.value}\n⏰ *Time Slot:* ${hpSelTime.value}\n👤 *Trainer:* ${hpSelStylist.value}\n\nMy Trainee Details:\n• *Name:* ${hpInpName.value}\n• *Phone:* ${hpInpPhone.value}\n• *Special Request:* ${hpTxtRequests.value || 'None'}\n\nPlease confirm enrollment. Thank you!`;
      } else {
        msg = `Hello ${salon}! 👋\n\nI would like to book an appointment:\n📋 *Service:* ${hpSelService.value}\n💰 *Total:* ₹${total} (₹${base} + 18% GST)\n📅 *Date:* ${hpInpDate.value}\n⏰ *Time:* ${hpSelTime.value}\n👤 *Specialist:* ${hpSelStylist.value}\n\nMy Details:\n• *Name:* ${hpInpName.value}\n• *Phone:* ${hpInpPhone.value}\n• *Special Request:* ${hpTxtRequests.value || 'None'}\n\nPlease confirm my slot. Thank you!`;
      }

      window.open(`https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`, '_blank');
    });
  }

  // ── STANDALONE BOOKING FORM (booking.html) ─────────────────────────────────
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

    if (inpDate) {
      inpDate.min = new Date().toISOString().split('T')[0];
    }

    const qs = new URLSearchParams(window.location.search);
    if (qs.get('service') && selSvc) {
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

  // Academy Tabs switcher
  const tabBtns = document.querySelectorAll('.academy-tab-btn');
  const tabPanels = document.querySelectorAll('.academy-tab-panel');
  if (tabBtns.length > 0) {
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tabIdx = btn.getAttribute('data-tab');
        
        tabBtns.forEach(b => b.classList.remove('active'));
        tabPanels.forEach(p => p.classList.remove('active'));
        
        btn.classList.add('active');
        const activePanel = document.getElementById(`academy-panel-${tabIdx}`);
        if (activePanel) {
          activePanel.classList.add('active');
        }
      });
    });
  }

  // ── Intersection Observer for staggered fade-up-scale scroll animations ──

  const animatedEls = document.querySelectorAll('.svc-card, .gal-item, .review-card, .pricing-card, .team-card, .academy-tab-panel, .category-card, .why-choose-card, .career-card');
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


  // ── BACKGROUND PARTICLES ANIMATION ─────────────────────────────────────────
  const canvas = document.getElementById('bg-animation-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const firstTrigger = document.querySelector('.modal-trigger');
    const category = firstTrigger ? firstTrigger.getAttribute('data-category') : 'unisex';

    // Particle emoji palettes
    const palettes = {
      'barber': ['✨', '⭐', '💈', '✂️'],
      'spa':    ['🍃', '🌸', '💮', '✨', '🪷'],
      'beauty': ['💖', '✨', '💄', '🌹'],
      'unisex': ['✨', '⭐', '💎', '🫧']
    };

    const icons = palettes[category] || palettes['unisex'];
    const particles = [];
    const maxParticles = 25;

    class Particle {
      constructor() {
        this.reset(true);
      }

      reset(init = false) {
        this.x = Math.random() * width;
        this.y = init ? Math.random() * height : -50;
        this.size = 14 + Math.random() * 16;
        this.speedY = 0.5 + Math.random() * 1.5;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.char = icons[Math.floor(Math.random() * icons.length)];
        this.opacity = 0.08 + Math.random() * 0.12;
        this.rotation = Math.random() * 360;
        this.spin = (Math.random() - 0.5) * 0.02;
      }

      update() {
        this.y += this.speedY;
        this.x += this.speedX;
        this.rotation += this.spin;
        if (this.y > height + 50 || this.x < -50 || this.x > width + 50) {
          this.reset(false);
        }
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.font = `${this.size}px Arial`;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.fillText(this.char, -this.size / 2, this.size / 2);
        ctx.restore();
      }
    }

    for (let i = 0; i < maxParticles; i++) {
      particles.push(new Particle());
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      requestAnimationFrame(animate);
    }
    animate();
  }

});

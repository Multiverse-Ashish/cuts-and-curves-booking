/* ============================================
   Cuts & Curves - Core Public Controller
   Dynamic loading, carousels, calendar & booking
   ============================================ */

// 1. CONFIGURATION
const CONFIG = {
  whatsappNumber: '919044041213', // Fallback business WhatsApp
  jsonbin: {
    apiKey: '',
    binId: '',
    baseUrl: 'https://api.jsonbin.io/v3',
  },
};

// Default Fallback Datasets (In case database is not linked)
const DEFAULT_SERVICES = [
  {
    id: 'svc-1',
    name: 'Signature Haircut & Styling',
    description: 'Personalized consultation, luxury hair wash, precision cut, and blow-dry style.',
    price: '₹799',
    image: '',
  },
  {
    id: 'svc-2',
    name: 'Luxury Hair Spa & Therapy',
    description: 'Deep conditioning scalp treatment with organic essential oils and relaxing massage.',
    price: '₹1499',
    image: '',
  },
  {
    id: 'svc-3',
    name: 'Advanced Skin Treatment',
    description: 'Hydrating and rejuvenating custom facial tailored to your skin type.',
    price: '₹1999',
    image: '',
  },
  {
    id: 'svc-4',
    name: 'Premium Beard Grooming',
    description: 'Hot towel shave, precision beard trim, styling balm, and organic beard oil.',
    price: '₹499',
    image: '',
  },
];

const DEFAULT_GALLERY = [
  { url: 'luxury_salon_interior.png', label: 'Salon Interior' },
  { url: 'stylist_hair_cut.png', label: 'Hair Cut & Styling' },
  { url: 'hair_spa_treatment.png', label: 'Relaxing Hair Spa' },
];

const DEFAULT_REVIEWS = [
  {
    id: 'rev-1',
    name: 'Aarav Mehta',
    role: 'Signature Styling Guest',
    rating: 5,
    text: 'Cuts & Curves has raised the bar for luxury hair grooming in Lucknow. Vikram\'s haircuts are absolute works of art. The ambient dark gold theme made my styling experience feel incredibly premium.',
    date: 'May 28, 2026'
  },
  {
    id: 'rev-2',
    name: 'Shreya Sen',
    role: 'Skin Therapy Guest',
    rating: 5,
    text: 'I had an advanced skin hydration treatment from Priya and it was revitalizing. Her knowledge and the premium organic ingredients used left my skin glowing for days. Truly worth every bit.',
    date: 'May 25, 2026'
  },
  {
    id: 'rev-3',
    name: 'Kabir Malhotra',
    role: 'Regular Spa Guest',
    rating: 5,
    text: 'The spa massage and deep conditioning therapy is my absolute go-to. Rajesh is highly experienced and maintains perfect hygiene standards. Highly recommend scheduling through WhatsApp!',
    date: 'May 20, 2026'
  }
];

function loadConfig() {
  try {
    const saved = localStorage.getItem('salon_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.jsonbin) Object.assign(CONFIG.jsonbin, parsed.jsonbin);
      if (parsed.whatsappNumber) CONFIG.whatsappNumber = parsed.whatsappNumber;
    }
  } catch (e) {
    console.warn('Failed to load credentials:', e);
  }
}

// 2. Database Fetch API (JSONBin)
const JsonBinAPI = {
  async getAll() {
    const { apiKey, binId, baseUrl } = CONFIG.jsonbin;
    if (!apiKey || !binId) {
      throw new Error('API config empty.');
    }

    const response = await fetch(`${baseUrl}/b/${binId}/latest`, {
      method: 'GET',
      headers: {
        'X-Master-Key': apiKey,
        'X-Bin-Private': 'true',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Fetch failed (${response.status})`);
    }

    const result = await response.json();
    return result.record || result.data || {};
  },

  async logBooking(bookingRecord) {
    const { apiKey, binId, baseUrl } = CONFIG.jsonbin;
    if (!apiKey || !binId) return;

    try {
      const data = await this.getAll();
      if (!data.bookings) data.bookings = [];
      data.bookings.push({
        id: 'book-' + Date.now(),
        ...bookingRecord,
        status: 'pending',
        timestamp: new Date().toISOString()
      });
      
      await fetch(`${baseUrl}/b/${binId}`, {
        method: 'PUT',
        headers: {
          'X-Master-Key': apiKey,
          'Content-Type': 'application/json',
          'X-Bin-Private': 'true',
        },
        body: JSON.stringify(data),
      });
    } catch (e) {
      console.warn('Failed to log booking record to JSONBin:', e);
    }
  }
};

// 3. Falling Sparkles Canvas Animation
const SparklesBackground = {
  canvas: null,
  ctx: null,
  particles: [],
  maxParticles: 35,

  init() {
    this.canvas = document.getElementById('sparklesCanvas');
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Create particles
    for (let i = 0; i < this.maxParticles; i++) {
      this.particles.push(this.createParticle(true));
    }

    this.animate();
  },

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  },

  createParticle(randomY = false) {
    return {
      x: Math.random() * this.canvas.width,
      y: randomY ? Math.random() * this.canvas.height : -10,
      size: 1 + Math.random() * 2.5,
      speedY: 0.4 + Math.random() * 0.8,
      speedX: -0.2 + Math.random() * 0.4,
      opacity: 0.15 + Math.random() * 0.35,
      fadeSpeed: 0.002 + Math.random() * 0.005,
    };
  },

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles.forEach((p, idx) => {
      p.y += p.speedY;
      p.x += p.speedX;

      // Draw particle as a glowing gold circle
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(197, 168, 128, ${p.opacity})`;
      this.ctx.fill();

      // Reset when particle goes off screen
      if (p.y > this.canvas.height || p.x < 0 || p.x > this.canvas.width) {
        this.particles[idx] = this.createParticle(false);
      }
    });

    requestAnimationFrame(() => this.animate());
  }
};

// 4. Scroll Reveal Intersection Observers
const ScrollReveal = {
  init() {
    const revealElements = document.querySelectorAll('.reveal');
    if (!revealElements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    revealElements.forEach(el => observer.observe(el));
  }
};

// 5. Dynamic Content Loading
const PageContent = {
  allDetailedServices: [],
  allDetailedGallery: [],

  async init() {
    loadConfig();
    
    // Load Homepage services and gallery
    if (document.getElementById('homepageServicesGrid')) {
      await this.loadHomepageServices();
    }
    if (document.getElementById('homepageGalleryGrid')) {
      await this.loadHomepageGallery();
    }

    // Load Booking services
    if (document.getElementById('bookingServicesList')) {
      await this.loadBookingServices();
    }

    // Load Detailed Services subpage
    if (document.getElementById('detailedServicesGrid')) {
      await this.loadDetailedServices();
    }

    // Load Detailed Gallery subpage
    if (document.getElementById('detailedGalleryGrid')) {
      await this.loadDetailedGallery();
    }

    // Load Detailed Reviews subpage
    if (document.getElementById('detailedReviewsGrid')) {
      await this.loadDetailedReviews();
    }
  },

  async loadHomepageServices() {
    const grid = document.getElementById('homepageServicesGrid');
    try {
      let services = DEFAULT_SERVICES;
      if (CONFIG.jsonbin.apiKey && CONFIG.jsonbin.binId) {
        const data = await JsonBinAPI.getAll();
        if (data.services && data.services.length) services = data.services;
      }

      grid.innerHTML = services.slice(0, 4).map((svc, idx) => `
        <div class="service-card reveal" style="transition-delay: ${idx * 0.1}s;">
          <div class="service-card-header">
            <span class="service-card-icon">
              <i class="${this.getServiceIcon(svc.name)}"></i>
            </span>
            <div class="service-card-title">
              <h3>${svc.name}</h3>
            </div>
          </div>
          <p class="service-card-body">${svc.description}</p>
          <div class="service-card-footer">
            <span class="service-card-price">${svc.price}</span>
            <a href="booking.html?service=${encodeURIComponent(svc.name)}" class="service-card-btn">Book Experience <i class="fa-solid fa-arrow-right"></i></a>
          </div>
        </div>
      `).join('');
      
      ScrollReveal.init();

    } catch (e) {
      grid.innerHTML = `<div style="text-align:center; grid-column:1/-1; color:var(--text-gray);">Could not load services dynamically. Please review connection config.</div>`;
    }
  },

  async loadHomepageGallery() {
    const grid = document.getElementById('homepageGalleryGrid');
    try {
      let gallery = DEFAULT_GALLERY;
      if (CONFIG.jsonbin.apiKey && CONFIG.jsonbin.binId) {
        const data = await JsonBinAPI.getAll();
        if (data.gallery && data.gallery.length) gallery = data.gallery;
      }

      grid.innerHTML = gallery.slice(0, 6).map((img, idx) => `
        <div class="gallery-item reveal" style="transition-delay: ${idx * 0.08}s;" onclick="Lightbox.open('${img.url}')">
          <img src="${img.url}" alt="${img.label || 'Salon Gallery'}" loading="lazy">
          <div class="gallery-item-overlay">
            <span>${img.label || 'Expand View'}</span>
          </div>
        </div>
      `).join('');

      ScrollReveal.init();

    } catch (e) {
      grid.innerHTML = `<div style="text-align:center; grid-column:1/-1; color:var(--text-gray);">No gallery showcase photos found.</div>`;
    }
  },

  async loadBookingServices() {
    const list = document.getElementById('bookingServicesList');
    try {
      let services = DEFAULT_SERVICES;
      if (CONFIG.jsonbin.apiKey && CONFIG.jsonbin.binId) {
        const data = await JsonBinAPI.getAll();
        if (data.services && data.services.length) services = data.services;
      }

      list.innerHTML = services.map(svc => `
        <div class="service-item" data-name="${svc.name}" data-price="${svc.price}">
          <div class="service-media">
            <i class="${this.getServiceIcon(svc.name)}"></i>
          </div>
          <div class="service-info">
            <h5>${svc.name}</h5>
            <p>${svc.description}</p>
          </div>
          <div class="service-action">
            <span class="price">${svc.price}</span>
            <button class="select-btn" type="button">Select</button>
          </div>
        </div>
      `).join('');

      // Initialize click handler triggers
      BookingEngine.initServiceSelectors();
      BookingEngine.parseQueryParams();

    } catch (e) {
      list.innerHTML = `<div style="text-align:center; color:var(--gold);">Error loading services list. Using static items.</div>`;
      // Use fallback
      this.renderStaticBookingServices();
    }
  },

  renderStaticBookingServices() {
    const list = document.getElementById('bookingServicesList');
    if (!list) return;
    list.innerHTML = DEFAULT_SERVICES.map(svc => `
      <div class="service-item" data-name="${svc.name}" data-price="${svc.price}">
        <div class="service-media">
          <i class="${this.getServiceIcon(svc.name)}"></i>
        </div>
        <div class="service-info">
          <h5>${svc.name}</h5>
          <p>${svc.description}</p>
        </div>
        <div class="service-action">
          <span class="price">${svc.price}</span>
          <button class="select-btn" type="button">Select</button>
        </div>
      </div>
    `).join('');
    BookingEngine.initServiceSelectors();
    BookingEngine.parseQueryParams();
  },

  async loadDetailedServices() {
    const grid = document.getElementById('detailedServicesGrid');
    try {
      let services = DEFAULT_SERVICES;
      if (CONFIG.jsonbin.apiKey && CONFIG.jsonbin.binId) {
        const data = await JsonBinAPI.getAll();
        if (data.services && data.services.length) services = data.services;
      }

      this.allDetailedServices = services;
      this.renderDetailedServices(services);
      this.initServicesFiltering();

    } catch (e) {
      grid.innerHTML = `<div style="text-align:center; color:var(--text-gray); grid-column:1/-1;">Could not load services. Using defaults.</div>`;
      this.allDetailedServices = DEFAULT_SERVICES;
      this.renderDetailedServices(DEFAULT_SERVICES);
      this.initServicesFiltering();
    }
  },

  renderDetailedServices(services) {
    const grid = document.getElementById('detailedServicesGrid');
    if (!grid) return;
    
    if (services.length === 0) {
      document.getElementById('noServicesMsg').classList.remove('hidden');
      grid.innerHTML = '';
      return;
    }
    document.getElementById('noServicesMsg').classList.add('hidden');

    grid.innerHTML = services.map((svc, idx) => `
      <div class="service-row-item reveal" style="transition-delay: ${idx * 0.05}s;">
        <div class="service-row-media">
          <i class="${this.getServiceIcon(svc.name)}"></i>
        </div>
        <div class="service-row-info">
          <h4>${svc.name}</h4>
          <p>${svc.description}</p>
        </div>
        <div class="service-row-action">
          <span class="service-row-price">${svc.price}</span>
          <a href="booking.html?service=${encodeURIComponent(svc.name)}" class="btn btn-sm btn-primary" style="padding: 0.5rem 1rem; font-size: 0.65rem;">Book Now</a>
        </div>
      </div>
    `).join('');
    
    ScrollReveal.init();
  },

  initServicesFiltering() {
    const tabs = document.querySelectorAll('.service-tab-btn');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        const cat = tab.dataset.category;
        let filtered = this.allDetailedServices;
        
        if (cat !== 'all') {
          filtered = this.allDetailedServices.filter(svc => {
            const name = svc.name.toLowerCase();
            const desc = svc.description.toLowerCase();
            if (cat === 'haircut') {
              return name.includes('cut') || name.includes('trim') || name.includes('color') || name.includes('balayage') || name.includes('blow');
            } else if (cat === 'spa') {
              return name.includes('spa') || name.includes('conditioning') || name.includes('shampoo') || name.includes('therapy');
            } else if (cat === 'skin') {
              return name.includes('facial') || name.includes('skin') || name.includes('scrub') || name.includes('peel') || name.includes('glow');
            } else if (cat === 'grooming') {
              return name.includes('beard') || name.includes('shave') || name.includes('styling') || name.includes('grooming');
            }
            return false;
          });
        }
        
        this.renderDetailedServices(filtered);
      });
    });
  },

  async loadDetailedGallery() {
    const grid = document.getElementById('detailedGalleryGrid');
    try {
      let gallery = DEFAULT_GALLERY;
      if (CONFIG.jsonbin.apiKey && CONFIG.jsonbin.binId) {
        const data = await JsonBinAPI.getAll();
        if (data.gallery && data.gallery.length) gallery = data.gallery;
      }

      this.allDetailedGallery = gallery;
      this.renderDetailedGallery(gallery);
      this.initGalleryFiltering();

    } catch (e) {
      grid.innerHTML = `<div style="text-align:center; color:var(--text-gray); grid-column:1/-1;">Could not load gallery showcase.</div>`;
      this.allDetailedGallery = DEFAULT_GALLERY;
      this.renderDetailedGallery(DEFAULT_GALLERY);
      this.initGalleryFiltering();
    }
  },

  renderDetailedGallery(gallery) {
    const grid = document.getElementById('detailedGalleryGrid');
    if (!grid) return;

    if (gallery.length === 0) {
      document.getElementById('noGalleryMsg').classList.remove('hidden');
      grid.innerHTML = '';
      return;
    }
    document.getElementById('noGalleryMsg').classList.add('hidden');

    grid.innerHTML = gallery.map((img, idx) => `
      <div class="gallery-item reveal" style="transition-delay: ${idx * 0.05}s;" onclick="Lightbox.open('${img.url}')">
        <img src="${img.url}" alt="${img.label || 'Salon Gallery'}" loading="lazy">
        <div class="gallery-item-overlay">
          <span>${img.label || 'Expand View'}</span>
        </div>
      </div>
    `).join('');

    ScrollReveal.init();
  },

  initGalleryFiltering() {
    const tabs = document.querySelectorAll('.gallery-tab-btn');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const filter = tab.dataset.filter;
        let filtered = this.allDetailedGallery;

        if (filter !== 'all') {
          filtered = this.allDetailedGallery.filter(img => {
            const lbl = (img.label || '').toLowerCase();
            const url = (img.url || '').toLowerCase();
            if (filter === 'hair') {
              return lbl.includes('hair') || lbl.includes('style') || lbl.includes('cut') || url.includes('stylist') || url.includes('spa');
            } else if (filter === 'skin') {
              return lbl.includes('skin') || lbl.includes('facial') || lbl.includes('spa') || url.includes('treatment');
            } else if (filter === 'interior') {
              return lbl.includes('interior') || lbl.includes('salon') || lbl.includes('floor') || url.includes('interior');
            }
            return false;
          });
        }

        this.renderDetailedGallery(filtered);
      });
    });
  },

  async loadDetailedReviews() {
    const grid = document.getElementById('detailedReviewsGrid');
    try {
      let reviews = DEFAULT_REVIEWS;
      if (CONFIG.jsonbin.apiKey && CONFIG.jsonbin.binId) {
        const data = await JsonBinAPI.getAll();
        if (data.reviews && data.reviews.length) reviews = data.reviews;
      }

      this.renderDetailedReviews(reviews);

    } catch (e) {
      grid.innerHTML = `<div style="text-align:center; color:var(--text-gray); grid-column:1/-1;">Could not load reviews feed.</div>`;
      this.renderDetailedReviews(DEFAULT_REVIEWS);
    }
  },

  renderDetailedReviews(reviews) {
    const grid = document.getElementById('detailedReviewsGrid');
    if (!grid) return;

    if (reviews.length === 0) {
      grid.innerHTML = `<div style="text-align:center; grid-column:1/-1; color:var(--text-gray);">No reviews logged. Be the first to share your experience!</div>`;
      return;
    }

    const sorted = [...reviews].reverse();

    grid.innerHTML = sorted.map((rev, idx) => `
      <div class="review-card-item reveal" style="transition-delay: ${idx * 0.05}s;">
        <div class="review-card-header">
          <div class="review-card-meta">
            <h5>${rev.name}</h5>
            <span>${rev.role}</span>
          </div>
          <div class="review-card-stars">
            ${Array.from({ length: 5 }, (_, i) => `
              <i class="${i < rev.rating ? 'fa-solid' : 'fa-regular'} fa-star"></i>
            `).join('')}
          </div>
        </div>
        <p class="review-card-body">"${rev.text}"</p>
        <span class="review-card-date">${rev.date || 'May 2026'}</span>
      </div>
    `).join('');

    ScrollReveal.init();
  },

  getServiceIcon(name) {
    const n = name.toLowerCase();
    if (n.includes('cut') || n.includes('style') || n.includes('trim') || n.includes('blow') || n.includes('balayage') || n.includes('color')) return 'fa-solid fa-scissors';
    if (n.includes('spa') || n.includes('massage') || n.includes('therapy')) return 'fa-solid fa-spa';
    if (n.includes('skin') || n.includes('facial') || n.includes('glow') || n.includes('hydrate')) return 'fa-solid fa-wand-magic-sparkles';
    if (n.includes('beard') || n.includes('shave') || n.includes('groom')) return 'fa-solid fa-spray-can';
    return 'fa-solid fa-scissors'; // Default
  }
};

// 6. Lightbox Event Handlers
const Lightbox = {
  overlay: null,
  img: null,

  init() {
    this.overlay = document.getElementById('lightbox');
    this.img = document.getElementById('lightboxImg');
    const closeBtn = document.getElementById('lightboxClose');

    if (!this.overlay || !this.img) return;

    const closeHandler = () => {
      this.overlay.classList.remove('active');
      document.body.style.overflow = '';
      this.img.src = '';
    };

    if (closeBtn) closeBtn.addEventListener('click', closeHandler);
    this.overlay.addEventListener('click', closeHandler);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeHandler();
    });
  },

  open(src) {
    if (!this.img || !this.overlay) return;
    this.img.src = src;
    this.overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
};

// 7. Interactive Carousels
const Carousels = {
  init() {
    // 7a. Hero Carousel slider
    this.initHeroCarousel();

    // 7b. Testimonials feedback slider
    this.initTestimonialsSlider();

    // 7c. Mobile Menu toggle
    this.initMobileMenu();
  },

  initHeroCarousel() {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.carousel-dots .dot');
    const prev = document.querySelector('.prev-arrow');
    const next = document.querySelector('.next-arrow');
    
    if (!slides.length) return;

    let index = 0;
    let timer = null;

    function show(idx) {
      slides.forEach(s => s.classList.remove('active'));
      dots.forEach(d => d.classList.remove('active'));

      index = (idx + slides.length) % slides.length;
      slides[index].classList.add('active');
      if (dots[index]) dots[index].classList.add('active');
    }

    function advance() { show(index + 1); }
    function start() { stop(); timer = setInterval(advance, 6000); }
    function stop() { if (timer) clearInterval(timer); }

    if (prev) prev.addEventListener('click', () => { show(index - 1); start(); });
    if (next) next.addEventListener('click', () => { show(index + 1); start(); });
    
    dots.forEach((dot, dIdx) => {
      dot.addEventListener('click', () => { show(dIdx); start(); });
    });

    start();
  },

  initTestimonialsSlider() {
    const track = document.getElementById('testimonialTrack');
    const slides = document.querySelectorAll('.testimonial-slide');
    const dots = document.querySelectorAll('#sliderDots .s-dot');
    const prev = document.querySelector('.prev-slide-arrow');
    const next = document.querySelector('.next-slide-arrow');

    if (!track || !slides.length) return;

    let idx = 0;
    let timer = null;

    function showSlide(targetIdx) {
      idx = (targetIdx + slides.length) % slides.length;
      track.style.transform = `translateX(-${idx * 100}%)`;

      dots.forEach(d => d.classList.remove('active'));
      if (dots[idx]) dots[idx].classList.add('active');
    }

    function advance() { showSlide(idx + 1); }
    function start() { stop(); timer = setInterval(advance, 5000); }
    function stop() { if (timer) clearInterval(timer); }

    if (prev) prev.addEventListener('click', () => { showSlide(idx - 1); start(); });
    if (next) next.addEventListener('click', () => { showSlide(idx + 1); start(); });

    dots.forEach((dot, dotIdx) => {
      dot.addEventListener('click', () => { showSlide(dotIdx); start(); });
    });

    track.addEventListener('mouseenter', stop);
    track.addEventListener('mouseleave', start);

    start();
  },

  initMobileMenu() {
    const toggle = document.getElementById('menuToggle');
    const nav = document.getElementById('navLinks');

    if (toggle && nav) {
      toggle.addEventListener('click', () => {
        nav.classList.toggle('open');
        toggle.classList.toggle('active');
      });

      nav.querySelectorAll('a').forEach(lnk => {
        lnk.addEventListener('click', () => {
          nav.classList.remove('open');
          toggle.classList.remove('active');
        });
      });
    }
  }
};

// 8. Client Booking Flow Engine
const BookingEngine = {
  state: {
    service: null,
    price: 0,
    stylist: 'Vikram',
    date: null,
    time: null,
    fullName: '',
    phone: '',
    email: ''
  },

  init() {
    if (!document.getElementById('bookingForm')) return;

    this.generateCalendar();
    this.setupListeners();
  },

  initServiceSelectors() {
    const items = document.querySelectorAll('.service-item');
    items.forEach(item => {
      item.addEventListener('click', () => {
        items.forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');

        this.state.service = item.dataset.name;
        
        // Sanitize price digits
        const rawPrice = item.dataset.price.replace(/[^0-9]/g, '');
        this.state.price = parseInt(rawPrice) || 0;

        this.updateSummary();
      });
    });
  },

  parseQueryParams() {
    const params = new URLSearchParams(window.location.search);
    const serviceParam = params.get('service');
    const stylistParam = params.get('stylist');

    if (serviceParam) {
      const decodedService = decodeURIComponent(serviceParam).trim();
      const items = document.querySelectorAll('.service-item');
      const item = Array.from(items).find(el => el.dataset.name.toLowerCase() === decodedService.toLowerCase());
      if (item) {
        item.click();
        const stepCard = item.closest('.step-card');
        if (stepCard) {
          stepCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }

    if (stylistParam) {
      const decodedStylist = decodeURIComponent(stylistParam).trim();
      const stylists = document.querySelectorAll('.stylist-item');
      const stylist = Array.from(stylists).find(el => el.dataset.name.toLowerCase() === decodedStylist.toLowerCase());
      if (stylist) {
        stylist.click();
      }
    }
  },

  setupListeners() {
    // Stylists Grid Selection
    const stylists = document.querySelectorAll('.stylist-item');
    stylists.forEach(sty => {
      sty.addEventListener('click', () => {
        stylists.forEach(s => s.classList.remove('selected'));
        sty.classList.add('selected');

        this.state.stylist = sty.dataset.name;
        this.updateSummary();
      });
    });

    // Time Slots selection
    const slots = document.querySelectorAll('.slot-btn');
    slots.forEach(slot => {
      slot.addEventListener('click', () => {
        slots.forEach(s => s.classList.remove('selected'));
        slot.classList.add('selected');

        this.state.time = slot.dataset.time;
        this.updateSummary();
      });
    });

    // Forms Inputs Validation
    const nameEl = document.getElementById('fullName');
    const phoneEl = document.getElementById('phoneNumber');
    const emailEl = document.getElementById('emailAddress');

    const inputHandler = () => {
      this.state.fullName = nameEl.value.trim();
      this.state.phone = phoneEl.value.trim();
      this.state.email = emailEl.value.trim();
      this.validate();
    };

    nameEl.addEventListener('input', inputHandler);
    phoneEl.addEventListener('input', inputHandler);
    emailEl.addEventListener('input', inputHandler);

    // Form submission confirmation click
    const submitBtn = document.getElementById('confirmBookingBtn');
    submitBtn.addEventListener('click', () => {
      if (this.validate()) {
        this.executeBooking();
      }
    });
  },

  generateCalendar() {
    const calendarDays = document.getElementById('calendarDays');
    if (!calendarDays) return;

    const daysInMonth = 31; // May 2026 has 31 days
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    calendarDays.innerHTML = '';

    // Headers
    weekdays.forEach(wd => {
      const headerCell = document.createElement('div');
      headerCell.className = 'cal-day cal-header-day';
      headerCell.textContent = wd;
      calendarDays.appendChild(headerCell);
    });

    // May 1st, 2026 starts on Friday -> 5 padding spaces
    const padding = 5;
    for (let i = 0; i < padding; i++) {
      const empty = document.createElement('div');
      empty.className = 'cal-day disabled';
      calendarDays.appendChild(empty);
    }

    // May 2026 days numbers
    for (let d = 1; d <= daysInMonth; d++) {
      const dayCell = document.createElement('div');
      dayCell.className = 'cal-day';
      dayCell.textContent = d;

      // Disables dates before current date May 30th
      if (d < 30) {
        dayCell.classList.add('disabled');
      } else {
        dayCell.addEventListener('click', () => {
          const selected = calendarDays.querySelector('.cal-day.selected');
          if (selected) selected.classList.remove('selected');

          dayCell.classList.add('selected');
          this.state.date = `May ${d}, 2026`;
          this.updateSummary();
        });
      }

      calendarDays.appendChild(dayCell);
    }
  },

  updateSummary() {
    document.getElementById('summaryService').textContent = this.state.service || 'None Selected';
    document.getElementById('summaryStylist').textContent = this.state.stylist;
    document.getElementById('summaryDate').textContent = this.state.date || 'None Selected';
    document.getElementById('summaryTime').textContent = this.state.time || 'None Selected';

    const price = this.state.price;
    const gst = Math.round(price * 0.18);
    const total = price + gst;

    document.getElementById('summaryPrice').textContent = `₹${price.toLocaleString()}`;
    document.getElementById('summaryGst').textContent = `₹${gst.toLocaleString()}`;
    document.getElementById('summaryTotal').textContent = `₹${total.toLocaleString()}`;

    this.validate();
  },

  validate() {
    const isSelectionsValid = this.state.service && this.state.date && this.state.time;
    const isFormInputsValid = this.state.fullName !== '' && 
                              this.state.phone.length >= 10 && 
                              this.state.email.includes('@');
    
    const isValid = isSelectionsValid && isFormInputsValid;
    const btn = document.getElementById('confirmBookingBtn');
    if (btn) btn.disabled = !isValid;
    return isValid;
  },

  async executeBooking() {
    const btn = document.getElementById('confirmBookingBtn');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Processing...';

    const randomId = 'CC-' + Math.floor(10000 + Math.random() * 90000);
    const gst = Math.round(this.state.price * 0.18);
    const grandTotal = this.state.price + gst;

    const notesVal = document.getElementById('notes').value.trim();

    try {
      // 1. Build WhatsApp Text Body
      const waText = `✨ *CUTS & CURVES SALON - RESERVATION* ✨

👤 *Guest Name:* ${this.state.fullName}
📞 *WhatsApp:* ${this.state.phone}
✂️ *Experience:* ${this.state.service}
💈 *Expert Stylist:* ${this.state.stylist}
📅 *Date & Time:* ${this.state.date} at ${this.state.time}
💳 *Total Price:* ₹${grandTotal.toLocaleString()} (incl. 18% GST)
🆔 *Appointment ID:* ${randomId}
${notesVal ? '💬 *Special Notes:* ' + notesVal : ''}

Please confirm my booking slots. Thank you!`;

      // 2. Open WhatsApp Redirect
      const encodedMsg = encodeURIComponent(waText);
      const whatsappUrl = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodedMsg}`;

      // 3. Log appointment database entry in JSONBin
      const bookingRecord = {
        id: randomId,
        name: this.state.fullName,
        phone: this.state.phone,
        service: this.state.service,
        date: this.state.date,
        time: this.state.time,
        price: `₹${grandTotal.toLocaleString()}`,
        stylist: this.state.stylist,
        notes: notesVal
      };
      
      await JsonBinAPI.logBooking(bookingRecord);

      // Open WhatsApp tab window
      window.open(whatsappUrl, '_blank');

      // 4. Update Receipt modal values and open
      document.getElementById('ticketId').textContent = randomId;
      document.getElementById('ticketService').textContent = this.state.service;
      document.getElementById('ticketStylist').textContent = this.state.stylist;
      document.getElementById('ticketDate').textContent = `${this.state.date} at ${this.state.time}`;
      document.getElementById('ticketTotal').textContent = `₹${grandTotal.toLocaleString()}`;

      document.getElementById('successModal').classList.add('active');

    } catch (e) {
      console.warn(e);
    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  }
};

function closeModal() {
  document.getElementById('successModal').classList.remove('active');
  
  // Reset Form fields
  const form = document.getElementById('bookingForm');
  if (form) form.reset();

  // Reset state
  BookingEngine.state.service = null;
  BookingEngine.state.price = 0;
  BookingEngine.state.date = null;
  BookingEngine.state.time = null;

  // Clear selections styles
  document.querySelectorAll('.service-item').forEach(i => i.classList.remove('selected'));
  document.querySelectorAll('.slot-btn').forEach(i => i.classList.remove('selected'));
  const activeCal = document.querySelector('#calendarDays .cal-day.selected');
  if (activeCal) activeCal.classList.remove('selected');

  BookingEngine.updateSummary();
}

// 8b. Reviews Engine for detailed ratings form
const ReviewsEngine = {
  rating: 5,
  compiledMessage: '',

  init() {
    const form = document.getElementById('submitReviewForm');
    if (!form) return;

    this.setupStarsSelector();
    form.addEventListener('submit', (e) => this.handleSubmit(e));

    const shareBtn = document.getElementById('shareReviewWhatsAppBtn');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        window.open(this.compiledMessage, '_blank');
        this.closeModal();
      });
    }
  },

  setupStarsSelector() {
    const stars = document.querySelectorAll('#ratingStarsSelector .star-select-btn');
    stars.forEach(star => {
      star.addEventListener('click', () => {
        const val = parseInt(star.dataset.value);
        this.rating = val;
        
        stars.forEach(s => {
          const sVal = parseInt(s.dataset.value);
          const icon = s.querySelector('i');
          if (sVal <= val) {
            s.classList.add('active');
            icon.className = 'fa-solid fa-star';
          } else {
            s.classList.remove('active');
            icon.className = 'fa-regular fa-star';
          }
        });
      });
    });

    // Default 5 stars highlight
    stars.forEach(s => {
      s.classList.add('active');
      s.querySelector('i').className = 'fa-solid fa-star';
    });
  },

  async handleSubmit(e) {
    const name = document.getElementById('reviewName').value.trim();
    const role = document.getElementById('reviewRole').value.trim();
    const text = document.getElementById('reviewText').value.trim();

    if (!name || !role || !text) {
      this.toast('Please fill in all details.', 'error');
      return;
    }

    const btn = document.getElementById('submitReviewBtn');
    btn.disabled = true;
    btn.textContent = 'Saving...';

    const newReview = {
      id: 'rev-' + Date.now(),
      name,
      role,
      rating: this.rating,
      text,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    };

    try {
      loadConfig();
      
      const starsStr = '★'.repeat(this.rating) + '☆'.repeat(5 - this.rating);
      const waText = `✨ *CUTS & CURVES SALON - GUEST REVIEW* ✨

👤 *Guest Name:* ${name}
💎 *Experience:* ${role}
⭐ *Rating:* ${starsStr} (${this.rating}/5)
💬 *Review:* "${text}"

Thank you for your valuable feedback! 🤍`;
      
      const encoded = encodeURIComponent(waText);
      this.compiledMessage = `https://wa.me/${CONFIG.whatsappNumber}?text=${encoded}`;

      // Save to JSONBin reviews array if connected
      if (CONFIG.jsonbin.apiKey && CONFIG.jsonbin.binId) {
        const data = await JsonBinAPI.getAll();
        if (!data.reviews) data.reviews = [];
        data.reviews.push(newReview);
        
        await fetch(`${CONFIG.jsonbin.baseUrl}/b/${CONFIG.jsonbin.binId}`, {
          method: 'PUT',
          headers: {
            'X-Master-Key': CONFIG.jsonbin.apiKey,
            'Content-Type': 'application/json',
            'X-Bin-Private': 'true',
          },
          body: JSON.stringify(data),
        });
      }

      this.toast('Review posted successfully!', 'success');

      // Reset form
      document.getElementById('submitReviewForm').reset();
      this.rating = 5;
      document.querySelectorAll('#ratingStarsSelector .star-select-btn').forEach(s => {
        s.classList.add('active');
        s.querySelector('i').className = 'fa-solid fa-star';
      });

      // Show success modal to prompt WhatsApp share
      document.getElementById('reviewSuccessModal').classList.add('active');

      // Refresh list
      if (document.getElementById('detailedReviewsGrid')) {
        PageContent.loadDetailedReviews();
      }

    } catch (err) {
      this.toast('Failed to save review. Redirecting to WhatsApp...', 'info');
      window.open(this.compiledMessage, '_blank');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Submit Feedback';
    }
  },

  closeModal() {
    document.getElementById('reviewSuccessModal').classList.remove('active');
  },

  toast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span style="font-weight:700;">${type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ'}</span>
      <span style="margin-left:0.5rem;">${message}</span>
      <span class="toast-close" style="margin-left:auto; cursor:pointer;" onclick="this.parentElement.remove()">&times;</span>
    `;
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
};

function closeReviewModal() {
  ReviewsEngine.closeModal();
}

// 9. Document Loaded Listeners
document.addEventListener('DOMContentLoaded', () => {
  PageContent.init();
  SparklesBackground.init();
  Lightbox.init();
  Carousels.init();
  BookingEngine.init();
  ReviewsEngine.init();

  // Floating Header Scrolled status toggle
  const header = document.querySelector('.header');
  window.addEventListener('scroll', () => {
    if (header) {
      header.classList.toggle('scrolled', window.scrollY > 40);
    }
  });
});

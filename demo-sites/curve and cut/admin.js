/* ============================================
   Cuts & Curves - Admin Controller Script
   Handles database calls, image hosting, and tabs
   ============================================ */

// 1. Core Config & Local Storage Wrapper
const CONFIG = {
  whatsappNumber: '919044041213',
  jsonbin: {
    apiKey: '',
    binId: '',
    baseUrl: 'https://api.jsonbin.io/v3',
  },
  imgbb: {
    apiKey: '',
    baseUrl: 'https://api.imgbb.com/1/upload',
  },
};

function loadConfig() {
  try {
    const saved = localStorage.getItem('salon_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.jsonbin) Object.assign(CONFIG.jsonbin, parsed.jsonbin);
      if (parsed.imgbb) Object.assign(CONFIG.imgbb, parsed.imgbb);
      if (parsed.whatsappNumber) CONFIG.whatsappNumber = parsed.whatsappNumber;
    }
  } catch (e) {
    console.warn('Failed to load local config settings:', e);
  }
}

const AdminConfig = {
  get() {
    try {
      const saved = localStorage.getItem('salon_config');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  },

  save(data) {
    const current = this.get();
    const merged = { ...current, ...data };
    localStorage.setItem('salon_config', JSON.stringify(merged));
    
    if (data.jsonbin) Object.assign(CONFIG.jsonbin, data.jsonbin);
    if (data.imgbb) Object.assign(CONFIG.imgbb, data.imgbb);
    if (data.whatsappNumber) CONFIG.whatsappNumber = data.whatsappNumber;
  },

  populateForm() {
    const config = this.get();
    const fields = {
      jsonbinApiKey: config.jsonbin?.apiKey || '',
      jsonbinBinId: config.jsonbin?.binId || '',
      imgbbApiKey: config.imgbb?.apiKey || '',
      whatsappNumber: config.whatsappNumber || '',
    };
    Object.entries(fields).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el) el.value = val;
    });
  },
};

// 2. API Integrations
const JsonBinAPI = {
  async getAll() {
    const { apiKey, binId, baseUrl } = CONFIG.jsonbin;
    if (!apiKey || !binId) {
      throw new Error('API Key and Bin ID must be configured in Settings.');
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
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `Failed to fetch data (${response.status})`);
    }

    const result = await response.json();
    return result.record || result.data || {};
  },

  async saveAll(data) {
    const { apiKey, binId, baseUrl } = CONFIG.jsonbin;
    if (!apiKey || !binId) {
      throw new Error('API Key and Bin ID must be configured.');
    }

    const response = await fetch(`${baseUrl}/b/${binId}`, {
      method: 'PUT',
      headers: {
        'X-Master-Key': apiKey,
        'Content-Type': 'application/json',
        'X-Bin-Private': 'true',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `Failed to save database (${response.status})`);
    }

    const result = await response.json();
    return result.record || result.data || data;
  },
};

const ImgBBAPI = {
  async upload(file) {
    const { apiKey, baseUrl } = CONFIG.imgbb;
    if (!apiKey) {
      throw new Error('ImgBB API Key is required to upload images.');
    }

    const formData = new FormData();
    formData.append('key', apiKey);
    formData.append('image', file);

    const response = await fetch(baseUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `ImgBB upload failed (${response.status})`);
    }

    const result = await response.json();
    if (!result.data || !result.data.url) {
      throw new Error('Upload succeeded but no image URL was returned.');
    }

    return {
      url: result.data.url,
      thumb: result.data.thumb?.url || result.data.url,
    };
  },
};

// 3. UI Helpers & Toast Alerts
const UI = {
  toast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const icons = {
      success: '✓',
      error: '✗',
      info: 'ℹ',
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span style="font-weight:700; font-size:1.1rem;">${icons[type] || 'ℹ'}</span>
      <span style="margin-left:0.5rem;">${message}</span>
      <span class="toast-close" style="margin-left:auto; cursor:pointer;">&times;</span>
    `;

    container.appendChild(toast);

    const closeHandler = () => {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 300);
    };

    toast.querySelector('.toast-close').addEventListener('click', closeHandler);
    setTimeout(closeHandler, 4000);
  },
};

// 4. Tab Navigator
const AdminTabs = {
  init() {
    const links = document.querySelectorAll('.sidebar-link[data-tab]');
    const contents = document.querySelectorAll('.tab-content');
    const pageTitle = document.getElementById('pageTitle');
    const titles = {
      settings: 'Credentials Config',
      services: 'Salon Services',
      gallery: 'Design Gallery',
      bookings: 'Bookings List',
      reviews: 'Reviews List',
    };

    links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = link.dataset.tab;

        links.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        contents.forEach(c => c.classList.remove('active'));
        document.getElementById(`tab-${tab}`).classList.add('active');

        if (pageTitle && titles[tab]) {
          pageTitle.textContent = titles[tab];
        }

        const sidebar = document.getElementById('adminSidebar');
        if (sidebar) sidebar.classList.remove('open');
      });
    });
  },
};

// 5. Mobile Toggle Menu
const AdminMobile = {
  init() {
    const btn = document.getElementById('mobileMenuBtn');
    const sidebar = document.getElementById('adminSidebar');

    if (btn && sidebar) {
      btn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
      });

      document.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target) && !btn.contains(e.target)) {
          sidebar.classList.remove('open');
        }
      });
    }
  },
};

// 6. Settings Panel Configuration
const AdminSettings = {
  init() {
    const form = document.getElementById('settingsForm');
    const testBtn = document.getElementById('testConnectionBtn');

    if (form) {
      form.addEventListener('submit', (e) => this.handleSave(e));
    }
    if (testBtn) {
      testBtn.addEventListener('click', () => this.testConnection());
    }

    AdminConfig.populateForm();
  },

  handleSave(e) {
    e.preventDefault();
    const data = {
      jsonbin: {
        apiKey: document.getElementById('jsonbinApiKey').value.trim(),
        binId: document.getElementById('jsonbinBinId').value.trim(),
      },
      imgbb: {
        apiKey: document.getElementById('imgbbApiKey').value.trim(),
      },
      whatsappNumber: document.getElementById('whatsappNumber').value.trim(),
    };

    if (!data.jsonbin.apiKey || !data.jsonbin.binId) {
      UI.toast('Please configure both JSONBin API Key and Bin ID.', 'error');
      return;
    }

    AdminConfig.save(data);
    UI.toast('API Configuration saved successfully!', 'success');
    this.testConnection();
  },

  async testConnection() {
    const statusEl = document.getElementById('connectionStatus');
    const statusDot = statusEl.querySelector('.status-dot');
    const statusText = statusEl.querySelector('.status-text');

    statusDot.className = 'status-dot testing';
    statusText.textContent = 'Testing...';

    try {
      loadConfig();
      if (!CONFIG.jsonbin.apiKey || !CONFIG.jsonbin.binId) {
        throw new Error('Config fields empty.');
      }

      const data = await JsonBinAPI.getAll();
      
      // Setup initial array properties if not present
      let updated = false;
      if (!data.services) { data.services = []; updated = true; }
      if (!data.gallery) { data.gallery = []; updated = true; }
      if (!data.bookings) { data.bookings = []; updated = true; }
      if (!data.reviews) { data.reviews = []; updated = true; }

      if (updated) {
        await JsonBinAPI.saveAll(data);
      }

      statusDot.className = 'status-dot connected';
      statusText.textContent = 'Connected';
      
      UI.toast(`Sync successful! Connected to JSONBin.`, 'success');

      // Reload modules
      AdminServices.loadServices();
      AdminGallery.loadGallery();
      AdminBookings.loadBookings();
      AdminReviews.loadReviews();

    } catch (err) {
      statusDot.className = 'status-dot';
      statusText.textContent = 'Disconnected';
      UI.toast(`Sync failed: ${err.message}`, 'error');
    }
  },
};

// 7. Services CRUD Manager
const AdminServices = {
  serviceImageFile: null,

  init() {
    const form = document.getElementById('addServiceForm');
    if (form) {
      form.addEventListener('submit', (e) => this.handleAdd(e));
    }

    this.setupImageUpload(
      'serviceImageDrop',
      'serviceImage',
      'serviceUploadPlaceholder',
      'serviceUploadPreview',
      'servicePreviewImg',
      'removeServicePreview',
      (file) => { this.serviceImageFile = file; }
    );
  },

  setupImageUpload(dropId, inputId, placeholderId, previewId, imgId, removeId, callback) {
    const drop = document.getElementById(dropId);
    const input = document.getElementById(inputId);
    const placeholder = document.getElementById(placeholderId);
    const preview = document.getElementById(previewId);
    const img = document.getElementById(imgId);
    const removeBtn = document.getElementById(removeId);

    if (!drop || !input) return;

    drop.addEventListener('click', (e) => {
      if (e.target.closest('.remove-preview')) return;
      input.click();
    });

    drop.addEventListener('dragover', (e) => {
      e.preventDefault();
      drop.classList.add('dragover');
    });

    drop.addEventListener('dragleave', () => {
      drop.classList.remove('dragover');
    });

    drop.addEventListener('drop', (e) => {
      e.preventDefault();
      drop.classList.remove('dragover');
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        this.processFile(file, placeholder, preview, img, callback);
      }
    });

    input.addEventListener('change', () => {
      const file = input.files[0];
      if (file) {
        this.processFile(file, placeholder, preview, img, callback);
      }
    });

    if (removeBtn) {
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        placeholder.classList.remove('hidden');
        preview.classList.add('hidden');
        if (img) img.src = '';
        input.value = '';
        callback(null);
      });
    }
  },

  processFile(file, placeholder, preview, img, callback) {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (img) img.src = e.target.result;
      placeholder.classList.add('hidden');
      preview.classList.remove('hidden');
      callback(file);
    };
    reader.readAsDataURL(file);
  },

  async handleAdd(e) {
    e.preventDefault();
    const name = document.getElementById('serviceName').value.trim();
    const price = document.getElementById('servicePrice').value.trim();
    const desc = document.getElementById('serviceDesc').value.trim();

    const addBtn = document.getElementById('addServiceBtn');
    addBtn.disabled = true;
    addBtn.textContent = 'Uploading Assets...';

    try {
      loadConfig();
      let imageUrl = '';
      if (this.serviceImageFile) {
        const res = await ImgBBAPI.upload(this.serviceImageFile);
        imageUrl = res.url;
      }

      const newService = {
        id: 'svc-' + Date.now(),
        name,
        price,
        description: desc,
        image: imageUrl,
      };

      const data = await JsonBinAPI.getAll();
      if (!data.services) data.services = [];
      data.services.push(newService);
      await JsonBinAPI.saveAll(data);

      UI.toast(`Service "${name}" created successfully!`, 'success');

      // Reset
      document.getElementById('addServiceForm').reset();
      document.getElementById('removeServicePreview').click();
      this.loadServices();

    } catch (err) {
      UI.toast(`Failed to add service: ${err.message}`, 'error');
    } finally {
      addBtn.disabled = false;
      addBtn.textContent = 'Add Service';
    }
  },

  async loadServices() {
    const container = document.getElementById('adminServicesList');
    if (!container) return;

    try {
      loadConfig();
      if (!CONFIG.jsonbin.apiKey || !CONFIG.jsonbin.binId) return;

      const data = await JsonBinAPI.getAll();
      const services = data.services || [];

      if (!services.length) {
        container.innerHTML = `
          <div class="empty-state">
            <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
            <p>No custom services created. Add one above to customize your menu!</p>
          </div>
        `;
        return;
      }

      container.innerHTML = services.map(svc => `
        <div class="service-list-item">
          ${svc.image ? `<img src="${svc.image}" alt="${svc.name}">` : `<div class="placeholder-thumb"><svg viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg></div>`}
          <div class="service-list-info">
            <h4>${svc.name}</h4>
            <p>${svc.description ? svc.description.substring(0, 100) + '...' : 'No description provided'}</p>
          </div>
          <span class="service-list-price">${svc.price}</span>
          <button class="btn-delete" onclick="AdminServices.deleteService('${svc.id}')">
            <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
          </button>
        </div>
      `).join('');

    } catch (err) {
      container.innerHTML = `<div class="empty-state"><p>Error reloading services list.</p></div>`;
    }
  },

  async deleteService(id) {
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
      loadConfig();
      const data = await JsonBinAPI.getAll();
      data.services = (data.services || []).filter(s => s.id !== id);
      await JsonBinAPI.saveAll(data);
      UI.toast('Service removed successfully.', 'success');
      this.loadServices();
    } catch (err) {
      UI.toast(`Delete failed: ${err.message}`, 'error');
    }
  },
};

// 8. Gallery Showcase Manager
const AdminGallery = {
  galleryImageFile: null,

  init() {
    const form = document.getElementById('addGalleryForm');
    if (form) {
      form.addEventListener('submit', (e) => this.handleUpload(e));
    }

    AdminServices.setupImageUpload(
      'galleryImageDrop',
      'galleryImage',
      'galleryUploadPlaceholder',
      'galleryUploadPreview',
      'galleryPreviewImg',
      'removeGalleryPreview',
      (file) => { this.galleryImageFile = file; }
    );
  },

  async handleUpload(e) {
    e.preventDefault();
    if (!this.galleryImageFile) {
      UI.toast('Please select an image file to upload.', 'error');
      return;
    }

    const label = document.getElementById('galleryImageLabel').value.trim();
    const uploadBtn = document.getElementById('addGalleryBtn');
    uploadBtn.disabled = true;
    uploadBtn.textContent = 'Uploading to Server...';

    try {
      loadConfig();
      const res = await ImgBBAPI.upload(this.galleryImageFile);

      const data = await JsonBinAPI.getAll();
      if (!data.gallery) data.gallery = [];
      data.gallery.push({
        url: res.url,
        label: label,
      });

      await JsonBinAPI.saveAll(data);
      UI.toast('Image added to gallery grid!', 'success');

      document.getElementById('addGalleryForm').reset();
      document.getElementById('removeGalleryPreview').click();
      this.loadGallery();

    } catch (err) {
      UI.toast(`Upload failed: ${err.message}`, 'error');
    } finally {
      uploadBtn.disabled = false;
      uploadBtn.textContent = 'Upload Image';
    }
  },

  async loadGallery() {
    const grid = document.getElementById('adminGalleryGrid');
    if (!grid) return;

    try {
      loadConfig();
      if (!CONFIG.jsonbin.apiKey || !CONFIG.jsonbin.binId) return;

      const data = await JsonBinAPI.getAll();
      const items = data.gallery || [];

      if (!items.length) {
        grid.innerHTML = `
          <div class="empty-state" style="grid-column: 1 / -1;">
            <svg viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
            <p>Showcase is empty. Upload premium photos to display on the main page!</p>
          </div>
        `;
        return;
      }

      grid.innerHTML = items.map((img, idx) => {
        const src = typeof img === 'string' ? img : img.url;
        const caption = typeof img === 'string' ? '' : (img.label || '');
        return `
          <div class="admin-gallery-item">
            <img src="${src}" alt="${caption || 'Showcase image'}">
            <button class="gallery-delete" onclick="AdminGallery.deleteImage(${idx})">&times;</button>
            ${caption ? `<div class="gallery-label">${caption}</div>` : ''}
          </div>
        `;
      }).join('');

    } catch (err) {
      grid.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1;"><p>Error reloading showcase grid.</p></div>`;
    }
  },

  async deleteImage(idx) {
    if (!confirm('Remove this photo from the gallery showcase?')) return;

    try {
      loadConfig();
      const data = await JsonBinAPI.getAll();
      data.gallery = (data.gallery || []).filter((_, i) => i !== idx);
      await JsonBinAPI.saveAll(data);
      UI.toast('Image removed from showcase.', 'success');
      this.loadGallery();
    } catch (err) {
      UI.toast(`Delete failed: ${err.message}`, 'error');
    }
  },
};

// 9. Bookings Log Dashboard
const AdminBookings = {
  async loadBookings() {
    const tbody = document.getElementById('bookingsTableBody');
    if (!tbody) return;

    try {
      loadConfig();
      if (!CONFIG.jsonbin.apiKey || !CONFIG.jsonbin.binId) return;

      const data = await JsonBinAPI.getAll();
      const bookings = data.bookings || [];

      if (!bookings.length) {
        tbody.innerHTML = `
          <tr><td colspan="7" class="empty-state-table">No appointments logged yet.</td></tr>
        `;
        return;
      }

      // Show newest bookings at the top
      const sorted = [...bookings].reverse();

      tbody.innerHTML = sorted.map(book => `
        <tr data-id="${book.id}">
          <td><strong>${book.name}</strong></td>
          <td>${book.phone}</td>
          <td>${book.service}</td>
          <td>${book.date}</td>
          <td>${book.time}</td>
          <td>
            <span class="status-badge ${book.status || 'pending'}">${book.status || 'pending'}</span>
          </td>
          <td>
            <button class="btn-table-action btn-confirm" onclick="AdminBookings.updateStatus('${book.id}', 'confirmed')" title="Confirm Appointment">&#10003;</button>
            <button class="btn-table-action btn-cancel" onclick="AdminBookings.updateStatus('${book.id}', 'cancelled')" title="Cancel Appointment">&#10007;</button>
            <button class="btn-table-action" onclick="AdminBookings.deleteBooking('${book.id}')" title="Delete Booking Record">&#128465;</button>
          </td>
        </tr>
      `).join('');

    } catch (err) {
      tbody.innerHTML = `
        <tr><td colspan="7" class="empty-state-table">Error reloading appointments log.</td></tr>
      `;
    }
  },

  async updateStatus(id, status) {
    try {
      loadConfig();
      const data = await JsonBinAPI.getAll();
      const item = (data.bookings || []).find(b => b.id === id);
      if (item) {
        item.status = status;
        await JsonBinAPI.saveAll(data);
        UI.toast(`Appointment marked as ${status}!`, 'success');
        this.loadBookings();
      }
    } catch (err) {
      UI.toast(`Update failed: ${err.message}`, 'error');
    }
  },

  async deleteBooking(id) {
    if (!confirm('Are you sure you want to delete this booking record?')) return;

    try {
      loadConfig();
      const data = await JsonBinAPI.getAll();
      data.bookings = (data.bookings || []).filter(b => b.id !== id);
      await JsonBinAPI.saveAll(data);
      UI.toast('Appointment record deleted.', 'success');
      this.loadBookings();
    } catch (err) {
      UI.toast(`Delete failed: ${err.message}`, 'error');
    }
  },
};

// 9b. Reviews Manager for Admin Panel
const AdminReviews = {
  async loadReviews() {
    const tbody = document.getElementById('reviewsTableBody');
    if (!tbody) return;

    try {
      loadConfig();
      if (!CONFIG.jsonbin.apiKey || !CONFIG.jsonbin.binId) return;

      const data = await JsonBinAPI.getAll();
      const reviews = data.reviews || [];

      if (!reviews.length) {
        tbody.innerHTML = `
          <tr><td colspan="6" class="empty-state-table">No guest reviews logged yet.</td></tr>
        `;
        return;
      }

      const sorted = [...reviews].reverse();

      tbody.innerHTML = sorted.map(rev => `
        <tr data-id="${rev.id}">
          <td><strong>${rev.name}</strong></td>
          <td>${rev.role}</td>
          <td>
            <span style="color:var(--gold); font-weight:600;">
              ${'★'.repeat(rev.rating)}${'☆'.repeat(5 - rev.rating)}
            </span>
            (${rev.rating}/5)
          </td>
          <td><p style="font-size:0.75rem; max-width:280px; text-overflow:ellipsis; overflow:hidden; white-space:nowrap; margin:0;" title="${rev.text}">${rev.text}</p></td>
          <td>${rev.date || 'May 2026'}</td>
          <td>
            <button class="btn-table-action btn-cancel" onclick="AdminReviews.deleteReview('${rev.id}')" title="Delete Review Record">&#128465;</button>
          </td>
        </tr>
      `).join('');

    } catch (err) {
      tbody.innerHTML = `
        <tr><td colspan="6" class="empty-state-table">Error reloading guest reviews.</td></tr>
      `;
    }
  },

  async deleteReview(id) {
    if (!confirm('Are you sure you want to permanently delete this guest review?')) return;

    try {
      loadConfig();
      const data = await JsonBinAPI.getAll();
      data.reviews = (data.reviews || []).filter(r => r.id !== id);
      await JsonBinAPI.saveAll(data);
      UI.toast('Review deleted successfully.', 'success');
      this.loadReviews();
    } catch (err) {
      UI.toast(`Delete failed: ${err.message}`, 'error');
    }
  }
};

// 10. Document Initialization
document.addEventListener('DOMContentLoaded', () => {
  loadConfig();
  AdminTabs.init();
  AdminMobile.init();
  AdminSettings.init();
  AdminServices.init();
  AdminGallery.init();

  const config = AdminConfig.get();
  if (config.jsonbin?.apiKey && config.jsonbin?.binId) {
    AdminSettings.testConnection();
  }
});

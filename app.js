// Booking State
const bookingState = {
    service: null,
    price: 0,
    stylist: "Vikram",
    date: null,
    time: null,
    customerName: "",
    customerPhone: "",
    customerEmail: ""
};

// DOM Elements
const serviceItems = document.querySelectorAll('.service-item');
const stylistItems = document.querySelectorAll('.stylist-item');
const slotButtons = document.querySelectorAll('.slot-btn');
const calendarDays = document.getElementById('calendarDays');

const summaryService = document.getElementById('summaryService');
const summaryStylist = document.getElementById('summaryStylist');
const summaryDate = document.getElementById('summaryDate');
const summaryTime = document.getElementById('summaryTime');
const summaryPrice = document.getElementById('summaryPrice');
const summaryGst = document.getElementById('summaryGst');
const summaryTotal = document.getElementById('summaryTotal');
const confirmBookingBtn = document.getElementById('confirmBookingBtn');

const bookingForm = document.getElementById('bookingForm');
const fullNameInput = document.getElementById('fullName');
const phoneInput = document.getElementById('phoneNumber');
const emailInput = document.getElementById('emailAddress');

// Ticket Elements
const successModal = document.getElementById('successModal');
const ticketId = document.getElementById('ticketId');
const ticketService = document.getElementById('ticketService');
const ticketStylist = document.getElementById('ticketStylist');
const ticketDate = document.getElementById('ticketDate');
const ticketTime = document.getElementById('ticketTime');
const ticketTotal = document.getElementById('ticketTotal');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    generateCalendar();
    setupListeners();
    initCarousel();
});

// Setup Listeners
function setupListeners() {
    // Services
    serviceItems.forEach(item => {
        item.addEventListener('click', () => {
            serviceItems.forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');
            
            bookingState.service = item.dataset.name;
            bookingState.price = parseInt(item.dataset.price);
            
            updateSummary();
        });
    });

    // Stylists
    stylistItems.forEach(item => {
        item.addEventListener('click', () => {
            stylistItems.forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');
            
            bookingState.stylist = item.dataset.name;
            updateSummary();
        });
    });

    // Slots
    slotButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            slotButtons.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            
            bookingState.time = btn.dataset.time;
            updateSummary();
        });
    });

    // Inputs
    const checkFormValidity = () => {
        bookingState.customerName = fullNameInput.value.trim();
        bookingState.customerPhone = phoneInput.value.trim();
        bookingState.customerEmail = emailInput.value.trim();
        validateForm();
    };

    fullNameInput.addEventListener('input', checkFormValidity);
    phoneInput.addEventListener('input', checkFormValidity);
    emailInput.addEventListener('input', checkFormValidity);

    // Confirm button
    confirmBookingBtn.addEventListener('click', () => {
        if (validateForm()) {
            showConfirmation();
        }
    });
}

// Generate Calendar Days (Current Month - May 2026)
function generateCalendar() {
    const daysInMonth = 31;
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Clear
    calendarDays.innerHTML = '';
    
    // Add headers
    weekdays.forEach(wd => {
        const hCell = document.createElement('div');
        hCell.className = 'cal-day cal-header-day';
        hCell.textContent = wd;
        calendarDays.appendChild(hCell);
    });

    // Empty spaces for padding (May 1st, 2026 starts on Friday -> 5 padding spaces)
    const padding = 5;
    for (let i = 0; i < padding; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'cal-day disabled';
        calendarDays.appendChild(emptyCell);
    }

    // Days numbers
    for (let d = 1; d <= daysInMonth; d++) {
        const dayCell = document.createElement('div');
        dayCell.className = 'cal-day';
        dayCell.textContent = d;
        
        // Disable past days (Local Time current date May 30th -> Disable < 30)
        if (d < 30) {
            dayCell.classList.add('disabled');
        } else {
            dayCell.addEventListener('click', () => {
                const selected = calendarDays.querySelector('.cal-day.selected');
                if (selected) selected.classList.remove('selected');
                
                dayCell.classList.add('selected');
                bookingState.date = `May ${d}, 2026`;
                updateSummary();
            });
        }
        
        calendarDays.appendChild(dayCell);
    }
}

// Update Summary sidebar
function updateSummary() {
    summaryService.textContent = bookingState.service ? bookingState.service : "None Selected";
    summaryStylist.textContent = bookingState.stylist;
    summaryDate.textContent = bookingState.date ? bookingState.date : "None Selected";
    summaryTime.textContent = bookingState.time ? bookingState.time : "None Selected";
    
    // Math
    const price = bookingState.price;
    const gst = Math.round(price * 0.18);
    const total = price + gst;
    
    summaryPrice.textContent = `₹${price.toLocaleString()}`;
    summaryGst.textContent = `₹${gst.toLocaleString()}`;
    summaryTotal.textContent = `₹${total.toLocaleString()}`;
    
    validateForm();
}

// Validate Form and Selections
function validateForm() {
    const isSelectionsComplete = bookingState.service && bookingState.date && bookingState.time;
    const isContactDetailsValid = bookingState.customerName !== "" && 
                                  bookingState.customerPhone.length >= 10 && 
                                  bookingState.customerEmail.includes('@');
    
    const isValid = isSelectionsComplete && isContactDetailsValid;
    confirmBookingBtn.disabled = !isValid;
    return isValid;
}

// Show Ticket modal
function showConfirmation() {
    const randomTicketId = 'CC-' + Math.floor(10000 + Math.random() * 90000);
    const gst = Math.round(bookingState.price * 0.18);
    const total = bookingState.price + gst;
    
    ticketId.textContent = randomTicketId;
    ticketService.textContent = bookingState.service;
    ticketStylist.textContent = bookingState.stylist;
    ticketDate.textContent = `${bookingState.date} at ${bookingState.time}`;
    ticketTotal.textContent = `₹${total.toLocaleString()}`;
    
    successModal.classList.add('active');
}

// Close Ticket modal and reset
function closeModal() {
    successModal.classList.remove('active');
    
    // Reset Form
    bookingForm.reset();
    bookingState.service = null;
    bookingState.price = 0;
    bookingState.date = null;
    bookingState.time = null;
    
    // Reset classes
    serviceItems.forEach(i => i.classList.remove('selected'));
    slotButtons.forEach(b => b.classList.remove('selected'));
    
    const selectedDay = calendarDays.querySelector('.cal-day.selected');
    if (selectedDay) selectedDay.classList.remove('selected');
    
    updateSummary();
}

// Hero Carousel Logic
let currentSlide = 0;
let carouselTimer = null;

function initCarousel() {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.carousel-dots .dot');
    const prevBtn = document.querySelector('.prev-arrow');
    const nextBtn = document.querySelector('.next-arrow');
    
    if (!slides.length) return;

    function showSlide(index) {
        // Reset active classes
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        // Normalize index
        currentSlide = (index + slides.length) % slides.length;
        
        // Add active classes
        slides[currentSlide].classList.add('active');
        if (dots[currentSlide]) {
            dots[currentSlide].classList.add('active');
        }
    }

    function nextSlide() {
        showSlide(currentSlide + 1);
    }

    // Auto cycle slide every 5 seconds
    function startAutoplay() {
        stopAutoplay();
        carouselTimer = setInterval(nextSlide, 5000);
    }

    function stopAutoplay() {
        if (carouselTimer) clearInterval(carouselTimer);
    }

    // Event listeners
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            showSlide(currentSlide - 1);
            startAutoplay();
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
            startAutoplay();
        });
    }

    dots.forEach((dot, idx) => {
        dot.addEventListener('click', () => {
            showSlide(idx);
            startAutoplay();
        });
    });

    // Start
    startAutoplay();
}

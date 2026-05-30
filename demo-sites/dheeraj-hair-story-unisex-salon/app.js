/* --- Premium App Logic - Transitions & WhatsApp Engine --- */

document.addEventListener("DOMContentLoaded", function () {
    // 1. Mobile Menu Toggle
    const toggleBtn = document.querySelector(".mobile-menu-toggle");
    const navbar = document.querySelector(".navbar");
    if (toggleBtn && navbar) {
        toggleBtn.addEventListener("click", function () {
            navbar.classList.toggle("active");
            const icon = toggleBtn.querySelector("i");
            if (icon.classList.contains("fa-bars")) {
                icon.classList.remove("fa-bars");
                icon.classList.add("fa-times");
            } else {
                icon.classList.remove("fa-times");
                icon.classList.add("fa-bars");
            }
        });
    }

    // 2. Lightbox Image Gallery Modal
    const lightboxModal = document.getElementById("lightbox-modal");
    const lightboxImg = document.getElementById("lightbox-img");
    const closeBtn = document.querySelector(".close-lightbox");
    const triggers = document.querySelectorAll(".lightbox-trigger");

    if (lightboxModal && lightboxImg && triggers) {
        triggers.forEach(function (trigger) {
            trigger.addEventListener("click", function (e) {
                e.preventDefault();
                const src = this.getAttribute("href");
                lightboxImg.src = src;
                lightboxModal.style.display = "block";
            });
        });

        const closeLightbox = function () {
            lightboxModal.style.display = "none";
            lightboxImg.src = "";
        };

        if (closeBtn) closeBtn.addEventListener("click", closeLightbox);
        lightboxModal.addEventListener("click", function (e) {
            if (e.target === lightboxModal) closeLightbox();
        });
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape") closeLightbox();
        });
    }

    // 3. Booking Engine Form Logic (Pre-selection, Invoice Formulas, WhatsApp compiler)
    const bookingForm = document.getElementById("booking-form");
    if (bookingForm) {
        const selectService = document.getElementById("select-service");
        const selectStylist = document.getElementById("select-stylist");
        const bookingDate = document.getElementById("booking-date");
        const bookingTime = document.getElementById("booking-time");
        const customerName = document.getElementById("customer-name");
        const customerPhone = document.getElementById("customer-phone");
        
        // Base elements for Invoice update
        const invoiceBase = document.getElementById("invoice-base");
        const invoiceGst = document.getElementById("invoice-gst");
        const invoiceTotal = document.getElementById("invoice-total");

        // Parse query parameter to auto-select service (e.g. booking.html?service=Signature%20Haircut)
        const urlParams = new URLSearchParams(window.location.search);
        const serviceParam = urlParams.get("service");
        if (serviceParam) {
            const normalizedParam = decodeURIComponent(serviceParam).trim();
            for (let i = 0; i < selectService.options.length; i++) {
                if (selectService.options[i].value === normalizedParam) {
                    selectService.selectedIndex = i;
                    break;
                }
            }
        }

        // Set minimum date for appointment to today
        const today = new Date().toISOString().split("T")[0];
        bookingDate.setAttribute("min", today);

        // Update invoice figures
        const updateInvoice = function () {
            const selectedOption = selectService.options[selectService.selectedIndex];
            if (selectedOption && selectedOption.value !== "") {
                const basePrice = parseInt(selectedOption.getAttribute("data-price")) || 0;
                const gst = Math.round(basePrice * 0.18);
                const total = basePrice + gst;

                invoiceBase.innerText = "₹" + basePrice;
                invoiceGst.innerText = "₹" + gst;
                invoiceTotal.innerText = "₹" + total;
            } else {
                invoiceBase.innerText = "₹0";
                invoiceGst.innerText = "₹0";
                invoiceTotal.innerText = "₹0";
            }
        };

        // Event listener for updating prices on selection change
        selectService.addEventListener("change", updateInvoice);
        updateInvoice(); // run once on startup

        // Handle Booking Submission
        bookingForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const serviceName = selectService.value;
            const stylistName = selectStylist.value;
            const bDate = bookingDate.value;
            const bTime = bookingTime.value;
            const cName = customerName.value.trim();
            const cPhone = customerPhone.value.trim();
            const salonName = document.getElementById("salon-name-val").value;
            const targetPhone = document.getElementById("whatsapp-number-val").value;

            const basePrice = selectService.options[selectService.selectedIndex].getAttribute("data-price");
            const gst = Math.round(parseInt(basePrice) * 0.18);
            const total = parseInt(basePrice) + gst;

            // Formulate the WhatsApp Message
            const whatsappText = `Hello ${salonName}, I would like to book an appointment:
- Service: ${serviceName}
- Price: ₹${total} (₹${basePrice} + 18% GST)
- Slot: ${bDate} at ${bTime}
- Stylist: ${stylistName}

My Contact Details:
- Name: ${cName}
- Phone: ${cPhone}

Please confirm my appointment slot. Thank you!`;

            const encodedText = encodeURIComponent(whatsappText);
            const whatsappUrl = `https://wa.me/${targetPhone}?text=${encodedText}`;

            // Redirect customer directly to WhatsApp link
            window.open(whatsappUrl, "_blank");
        });
    }
});

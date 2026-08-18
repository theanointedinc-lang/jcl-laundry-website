document.addEventListener('DOMContentLoaded', () => {
  
  // 1. STICKY HEADER & MOBILE NAV
  const header = document.querySelector('.header');
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  
  // Sticky Header on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('sticky');
    } else {
      header.classList.remove('sticky');
    }
    
    // Highlight Active Link based on scroll position (Scroll Spy)
    let current = '';
    const sections = document.querySelectorAll('section, header');
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (window.scrollY >= (sectionTop - 120)) {
        current = section.getAttribute('id');
      }
    });
    
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  });
  
  // Toggle Mobile Menu
  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      const isOpen = navMenu.classList.contains('open');
      menuToggle.innerHTML = isOpen 
        ? `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>` 
        : `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>`;
    });
    
    // Close mobile menu when link is clicked
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        menuToggle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>`;
      });
    });
  }
  
  // 2. INTERACTIVE PRICING CALCULATOR
  // Pricing Constants (in NGN - ₦)
  const RATE_PER_PIECE = 450;
  const DELIVERY_CHARGE = 500;
  
  let quantity = 10;
  let isExpress = false;
  
  const rangeSlider = document.getElementById('calc-qty-slider');
  const countDisplay = document.getElementById('calc-count');
  const expressToggle = document.getElementById('express-delivery');
  
  const displaySubtotal = document.getElementById('res-subtotal');
  const displayDelivery = document.getElementById('res-delivery');
  const displayExpress = document.getElementById('res-express');
  const displayTotal = document.getElementById('res-total');
  const bookButton = document.getElementById('calc-book-btn');
  
  // Slider input handler
  if (rangeSlider) {
    rangeSlider.addEventListener('input', (e) => {
      quantity = parseInt(e.target.value);
      countDisplay.textContent = quantity + ' ' + (quantity === 1 ? 'Piece' : 'Pieces');
      calculatePrice();
    });
  }
  
  // Express toggle handler
  if (expressToggle) {
    expressToggle.addEventListener('change', (e) => {
      isExpress = e.target.checked;
      calculatePrice();
    });
  }
  
  // Main Price Calculation Engine
  function calculatePrice() {
    const subtotal = RATE_PER_PIECE * quantity;
    const expressSurcharge = isExpress ? Math.round(subtotal * 0.5) : 0;
    const total = subtotal + DELIVERY_CHARGE + expressSurcharge;
    
    // Format to Nigerian currency
    const formatCurrency = (val) => '₦' + val.toLocaleString('en-US');
    
    // Update displays
    displaySubtotal.textContent = formatCurrency(subtotal);
    displayDelivery.textContent = formatCurrency(DELIVERY_CHARGE);
    displayExpress.textContent = formatCurrency(expressSurcharge);
    displayTotal.textContent = formatCurrency(total);
    
    // Generate Pre-filled WhatsApp booking link
    updateBookingLink(subtotal, expressSurcharge, total);
  }
  
  function updateBookingLink(subtotal, expressSurcharge, total) {
    if (!bookButton) return;
    
    const speed = isExpress ? 'Express (Same-Day)' : 'Standard (24-48 Hours)';
    const itemLabel = quantity === 1 ? 'Piece' : 'Pieces';
    
    const message = `Hello JCL Laundry Service! I would like to book a pickup.\n\n` +
                    `*Order Details*:\n` +
                    `• Service: Garment Care (by count)\n` +
                    `• Volume: ${quantity} ${itemLabel}\n` +
                    `• Service Speed: ${speed}\n` +
                    `• Subtotal: ₦${subtotal.toLocaleString()}\n` +
                    `• Delivery fee: ₦${DELIVERY_CHARGE.toLocaleString()}\n` +
                    `• Express Fee: ₦${expressSurcharge.toLocaleString()}\n` +
                    `• *Estimated Total*: ₦${total.toLocaleString()}\n\n` +
                    `Please let me know when a dispatch rider can arrive for pickup. Thank you!`;
    
    const encodedMessage = encodeURIComponent(message);
    const phoneNumber = '2347039554792'; // JCL Phone Number (07039554792) with Nigerian Code
    bookButton.href = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  }
  
  // Run initial calculator run
  if (displayTotal) {
    // Set initial display count
    if (rangeSlider) {
      quantity = parseInt(rangeSlider.value);
      countDisplay.textContent = quantity + ' ' + (quantity === 1 ? 'Piece' : 'Pieces');
    }
    calculatePrice();
  }
  
  // 3. CONTACT FORM VALIDATION & SUBMISSION SIMULATOR
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');
  
  if (contactForm && formStatus) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('form-name').value.trim();
      const email = document.getElementById('form-email').value.trim();
      const phone = document.getElementById('form-phone').value.trim();
      const subject = document.getElementById('form-subject').value.trim();
      const message = document.getElementById('form-message').value.trim();
      
      // Basic Validation
      if (!name || !email || !phone || !message) {
        showStatus('Please fill in all required fields.', 'error');
        return;
      }
      
      if (!validateEmail(email)) {
        showStatus('Please enter a valid email address.', 'error');
        return;
      }
      
      // Send real email request using our serverless endpoint
      showStatus('Sending your message... Please wait.', 'loading');
      
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Sending...';
      
      fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, phone, subject, message })
      })
      .then(response => {
        if (!response.ok) {
          return response.json().then(err => { throw new Error(err.error || 'Failed to send'); });
        }
        return response.json();
      })
      .then(data => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
        showStatus(`Thank you, ${name}! Your message has been sent successfully. We will contact you shortly.`, 'success');
        contactForm.reset();
      })
      .catch(error => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
        showStatus(`Error: ${error.message || 'Failed to send message.'}`, 'error');
      });
    });
  }
  
  function showStatus(msg, type) {
    formStatus.textContent = msg;
    formStatus.className = 'form-status'; // Reset classes
    
    if (type === 'success') {
      formStatus.classList.add('success');
    } else if (type === 'error') {
      formStatus.classList.add('error');
    } else if (type === 'loading') {
      formStatus.style.display = 'block';
      formStatus.style.backgroundColor = '#EFF6FF';
      formStatus.style.color = '#1D4ED8';
      formStatus.style.border = '1px solid #BFDBFE';
    }
  }
  
  function validateEmail(email) {
    const re = /^(([^<>()[\/\.,;:\s@"]+(\.[^<>()[\/\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }
  
});

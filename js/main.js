// ===== Main JavaScript =====

// Header Scroll Effect
const header = document.getElementById('header');
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
    // На мобильных устройствах всегда оставляем синий фон
    if (window.innerWidth <= 1024) {
        header.classList.add('scrolled');
    } else {
        // На десктопе обычное поведение
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
    
    lastScrollY = window.scrollY;
});

window.addEventListener('resize', () => {
    if (window.innerWidth <= 1024) {
        header.classList.add('scrolled');
    } else {
        // На десктопе возвращаем обычное поведение
        if (window.scrollY <= 50) {
            header.classList.remove('scrolled');
        } else {
            header.classList.add('scrolled');
        }
    }
});

// Mobile Menu Toggle
const menuToggle = document.getElementById('menuToggle');
const mobileNav = document.getElementById('mobileNav');
let menuOpen = false;

menuToggle.addEventListener('click', () => {
    menuOpen = !menuOpen;
    mobileNav.classList.toggle('active');
    
    // Change icon
    const icon = menuToggle.querySelector('i');
    if (menuOpen) {
        icon.setAttribute('data-lucide', 'x');
    } else {
        icon.setAttribute('data-lucide', 'menu');
    }
    
    // Reinitialize icons
    lucide.createIcons();
});

// Close mobile menu when clicking on link
const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
        menuOpen = false;
        mobileNav.classList.remove('active');
        const icon = menuToggle.querySelector('i');
        icon.setAttribute('data-lucide', 'menu');
        lucide.createIcons();
    });
});
// Smooth Scroll Navigation
const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('data-section');
        scrollToSection(targetId);
    });
});

// Scroll to Section Function
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const headerHeight = 80;
        const targetPosition = section.offsetTop - headerHeight;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

// Active Navigation Link
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.pageYOffset;
    
    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            document.querySelectorAll(`[data-section="${sectionId}"]`).forEach(link => {
                link.classList.add('active');
            });
        } else {
            document.querySelectorAll(`[data-section="${sectionId}"]`).forEach(link => {
                link.classList.remove('active');
            });
        }
    });
}

window.addEventListener('scroll', updateActiveNavLink);

// Contact Modal Functions
function openContactModal(title) {
    const modal = document.getElementById('contactModal');
    const modalTitle = document.getElementById('modalTitle');
    modalTitle.textContent = title;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeContactModal() {
    const modal = document.getElementById('contactModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    
    // Reset form
    const form = document.getElementById('modalForm');
    form.reset();
    const formMessage = document.getElementById('modalFormMessage');
    formMessage.className = 'form-message';
}

// Make functions global
window.openContactModal = openContactModal;
window.closeContactModal = closeContactModal;
window.scrollToSection = scrollToSection;

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeContactModal();
    }
});

// Parallax Effect for Hero
window.addEventListener('scroll', () => {
    const heroSlides = document.querySelectorAll('.hero-slide');
    const scrolled = window.pageYOffset;
    
    heroSlides.forEach(slide => {
        const speed = 0.5;
        slide.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// Loading Animation
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    lucide.createIcons();
    
    // Update active nav link on load
    updateActiveNavLink();
    
    console.log('DVE Estate website loaded successfully');
});

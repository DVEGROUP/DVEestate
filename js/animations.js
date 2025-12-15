// ===== Scroll Reveal Animation =====

class ScrollReveal {
    constructor() {
        this.elements = document.querySelectorAll('.scroll-reveal');
        this.windowHeight = window.innerHeight;
        this.init();
    }
    
    init() {
        // Check on load
        this.checkElements();
        
        // Check on scroll with throttle
        let throttleTimer = false;
        const throttleDelay = 100;
        
        window.addEventListener('scroll', () => {
            if (!throttleTimer) {
                throttleTimer = true;
                
                setTimeout(() => {
                    this.checkElements();
                    throttleTimer = false;
                }, throttleDelay);
            }
        });
        
        // Update window height on resize
        window.addEventListener('resize', () => {
            this.windowHeight = window.innerHeight;
            this.checkElements();
        });
    }
    
    checkElements() {
        this.elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementBottom = element.getBoundingClientRect().bottom;
            const revealPoint = this.windowHeight * 0.85; // Reveal when 85% visible
            
            if (elementTop < revealPoint && elementBottom > 0) {
                element.classList.add('revealed');
            }
        });
    }
}

// Initialize Scroll Reveal
document.addEventListener('DOMContentLoaded', () => {
    new ScrollReveal();
});

// ===== Intersection Observer for Advanced Animations =====

class IntersectionAnimator {
    constructor() {
        this.observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };
        
        this.init();
    }
    
    init() {
        // Create observer for service cards
        this.observeElements('.service-card', this.animateServiceCard.bind(this));
        
        // Create observer for team members
        this.observeElements('.team-member', this.animateTeamMember.bind(this));
        
        // Create observer for about section
        this.observeElements('.about-image', this.animateAboutImage.bind(this));
    }
    
    observeElements(selector, callback) {
        const elements = document.querySelectorAll(selector);
        
        if (elements.length === 0) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    callback(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, this.observerOptions);
        
        elements.forEach(element => observer.observe(element));
    }
    
    animateServiceCard(element) {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            element.style.transition = 'all 0.6s cubic-bezier(0.19, 1, 0.22, 1)';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 100);
    }
    
    animateTeamMember(element) {
        element.style.opacity = '0';
        element.style.transform = 'scale(0.9)';
        
        setTimeout(() => {
            element.style.transition = 'all 0.6s cubic-bezier(0.19, 1, 0.22, 1)';
            element.style.opacity = '1';
            element.style.transform = 'scale(1)';
        }, 100);
    }
    
    animateAboutImage(element) {
        const img = element.querySelector('img');
        if (img) {
            img.style.transform = 'scale(1.2)';
            img.style.opacity = '0';
            
            setTimeout(() => {
                img.style.transition = 'all 1s cubic-bezier(0.19, 1, 0.22, 1)';
                img.style.transform = 'scale(1)';
                img.style.opacity = '1';
            }, 200);
        }
    }
}

// Initialize Intersection Animator
document.addEventListener('DOMContentLoaded', () => {
    new IntersectionAnimator();
});

// ===== Parallax Effect for Sections =====

class ParallaxEffect {
    constructor() {
        this.parallaxElements = document.querySelectorAll('[data-parallax]');
        this.init();
    }
    
    init() {
        if (this.parallaxElements.length === 0) return;
        
        window.addEventListener('scroll', () => {
            this.updateParallax();
        });
    }
    
    updateParallax() {
        const scrolled = window.pageYOffset;
        
        this.parallaxElements.forEach(element => {
            const speed = element.dataset.parallax || 0.5;
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    }
}

// Initialize Parallax Effect
document.addEventListener('DOMContentLoaded', () => {
    new ParallaxEffect();
});

// ===== Counter Animation =====

class CounterAnimation {
    constructor() {
        this.counters = document.querySelectorAll('[data-counter]');
        this.init();
    }
    
    init() {
        if (this.counters.length === 0) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        this.counters.forEach(counter => observer.observe(counter));
    }
    
    animateCounter(element) {
        const target = parseInt(element.dataset.counter);
        const duration = 2000; // 2 seconds
        const increment = target / (duration / 16); // 60fps
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            
            if (current >= target) {
                element.textContent = target;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current);
            }
        }, 16);
    }
}

// Initialize Counter Animation
document.addEventListener('DOMContentLoaded', () => {
    new CounterAnimation();
});

// ===== Stagger Animation for Lists =====

function staggerFadeIn(elements, delay = 100) {
    elements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            element.style.transition = 'all 0.6s cubic-bezier(0.19, 1, 0.22, 1)';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * delay);
    });
}

// ===== Image Lazy Loading with Fade Effect =====

class LazyImageLoader {
    constructor() {
        this.images = document.querySelectorAll('img[data-src]');
        this.init();
    }
    
    init() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadImage(entry.target);
                        imageObserver.unobserve(entry.target);
                    }
                });
            });
            
            this.images.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback for older browsers
            this.images.forEach(img => this.loadImage(img));
        }
    }
    
    loadImage(img) {
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.6s ease-in-out';
        
        img.src = img.dataset.src;
        
        img.onload = () => {
            img.style.opacity = '1';
            img.removeAttribute('data-src');
        };
    }
}

// Initialize Lazy Image Loader
document.addEventListener('DOMContentLoaded', () => {
    new LazyImageLoader();
});

// ===== Smooth Scroll Behavior =====

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        
        if (href !== '#' && href !== '') {
            e.preventDefault();
            const target = document.querySelector(href);
            
            if (target) {
                const headerHeight = 80;
                const targetPosition = target.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        }
    });
});

// ===== Add Animation Classes on Scroll =====

function addAnimationOnScroll(selector, animationClass, offset = 100) {
    const elements = document.querySelectorAll(selector);
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add(animationClass);
                observer.unobserve(entry.target);
            }
        });
    }, {
        rootMargin: `${offset}px`
    });
    
    elements.forEach(el => observer.observe(el));
}

// ===== Performance Optimization: Reduce Animations on Low-End Devices =====

function detectPerformance() {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    if (connection && connection.effectiveType) {
        if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
            document.body.classList.add('reduce-animations');
        }
    }
}

document.addEventListener('DOMContentLoaded', detectPerformance);

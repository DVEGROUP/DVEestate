// ===== Testimonials Slider =====

class TestimonialsSlider {
    constructor() {
        this.slider = document.getElementById('testimonialsSlider');
        this.track = document.getElementById('testimonialsTrack');
        this.cards = document.querySelectorAll('.testimonial-card');
        this.dotsContainer = document.getElementById('testimonialsDots');
        this.currentIndex = 0;
        this.autoplayInterval = null;
        this.autoplayDelay = 5000; // 5 seconds
        this.isAutoplayPaused = false;
        
        if (this.cards.length > 0) {
            this.init();
        }
    }
    
    init() {
        this.createDots();
        this.updateSlider();
        this.startAutoplay();
        this.addEventListeners();
        this.addTouchSupport();
    }
    
    createDots() {
        this.dotsContainer.innerHTML = '';
        
        this.cards.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.classList.add('testimonial-dot');
            if (index === 0) dot.classList.add('active');
            dot.setAttribute('aria-label', `Перейти к отзыву ${index + 1}`);
            
            dot.addEventListener('click', () => {
                this.goToSlide(index);
            });
            
            this.dotsContainer.appendChild(dot);
        });
        
        this.dots = this.dotsContainer.querySelectorAll('.testimonial-dot');
    }
    
    updateSlider() {
        // Calculate card width including margin
        const cardStyle = window.getComputedStyle(this.cards[0]);
        const cardWidth = this.cards[0].offsetWidth;
        const cardMargin = parseInt(cardStyle.marginLeft) + parseInt(cardStyle.marginRight);
        const totalCardWidth = cardWidth + cardMargin;
        
        // Calculate offset to center the current card
        const sliderWidth = this.slider.offsetWidth;
        const offset = (sliderWidth - cardWidth) / 2;
        const translateX = -this.currentIndex * totalCardWidth + offset;
        
        this.track.style.transform = `translateX(${translateX}px)`;
        
        // Update dots
        this.dots.forEach((dot, index) => {
            if (index === this.currentIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
        
        // Update card scales for depth effect
        this.updateCardScales();
    }
    
    updateCardScales() {
        this.cards.forEach((card, index) => {
            const distance = Math.abs(index - this.currentIndex);
            
            if (distance === 0) {
                // Current card - full scale
                card.style.transform = 'scale(1)';
                card.style.opacity = '1';
                card.style.filter = 'blur(0)';
            } else if (distance === 1) {
                // Adjacent cards - slightly smaller
                card.style.transform = 'scale(0.9)';
                card.style.opacity = '0.7';
                card.style.filter = 'blur(2px)';
            } else {
                // Far cards - even smaller
                card.style.transform = 'scale(0.8)';
                card.style.opacity = '0.5';
                card.style.filter = 'blur(3px)';
            }
            
            card.style.transition = 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)';
        });
    }
    
    goToSlide(index) {
        if (index < 0) {
            this.currentIndex = this.cards.length - 1;
        } else if (index >= this.cards.length) {
            this.currentIndex = 0;
        } else {
            this.currentIndex = index;
        }
        
        this.updateSlider();
        this.resetAutoplay();
    }
    
    nextSlide() {
        this.goToSlide(this.currentIndex + 1);
    }
    
    previousSlide() {
        this.goToSlide(this.currentIndex - 1);
    }
    
    startAutoplay() {
        if (this.autoplayInterval) return;
        
        this.autoplayInterval = setInterval(() => {
            if (!this.isAutoplayPaused) {
                this.nextSlide();
            }
        }, this.autoplayDelay);
    }
    
    stopAutoplay() {
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
            this.autoplayInterval = null;
        }
    }
    
    resetAutoplay() {
        this.stopAutoplay();
        this.startAutoplay();
    }
    
    addEventListeners() {
        // Pause on hover
        this.slider.addEventListener('mouseenter', () => {
            this.isAutoplayPaused = true;
        });
        
        this.slider.addEventListener('mouseleave', () => {
            this.isAutoplayPaused = false;
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            const testimonialsSection = document.getElementById('отзывы');
            const rect = testimonialsSection.getBoundingClientRect();
            const isInView = rect.top < window.innerHeight && rect.bottom >= 0;
            
            if (isInView) {
                if (e.key === 'ArrowLeft') {
                    this.previousSlide();
                } else if (e.key === 'ArrowRight') {
                    this.nextSlide();
                }
            }
        });
        
        // Update on window resize
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                this.updateSlider();
            }, 250);
        });
    }
    
    addTouchSupport() {
        let touchStartX = 0;
        let touchEndX = 0;
        let isDragging = false;
        let startTransform = 0;
        
        this.slider.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            isDragging = true;
            
            // Get current transform value
            const transform = window.getComputedStyle(this.track).transform;
            if (transform !== 'none') {
                const matrix = transform.match(/matrix.*\((.+)\)/)[1].split(', ');
                startTransform = parseFloat(matrix[4]);
            }
            
            this.isAutoplayPaused = true;
        });
        
        this.slider.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            
            const currentX = e.touches[0].clientX;
            const diff = currentX - touchStartX;
            
            // Apply drag with resistance
            this.track.style.transform = `translateX(${startTransform + diff}px)`;
            this.track.style.transition = 'none';
        });
        
        this.slider.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            
            touchEndX = e.changedTouches[0].clientX;
            isDragging = false;
            
            const swipeThreshold = 50;
            const difference = touchStartX - touchEndX;
            
            if (Math.abs(difference) > swipeThreshold) {
                if (difference > 0) {
                    // Swipe left - next slide
                    this.nextSlide();
                } else {
                    // Swipe right - previous slide
                    this.previousSlide();
                }
            } else {
                // Snap back to current slide
                this.updateSlider();
            }
            
            this.track.style.transition = '';
            this.isAutoplayPaused = false;
        });
    }
}

// Initialize Testimonials Slider
document.addEventListener('DOMContentLoaded', () => {
    new TestimonialsSlider();
});

// ===== Animate Testimonials on Scroll =====

class TestimonialsAnimator {
    constructor() {
        this.section = document.getElementById('отзывы');
        this.hasAnimated = false;
        
        if (this.section) {
            this.init();
        }
    }
    
    init() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.hasAnimated) {
                    this.animateTestimonials();
                    this.hasAnimated = true;
                }
            });
        }, {
            threshold: 0.2
        });
        
        observer.observe(this.section);
    }
    
    animateTestimonials() {
        const cards = document.querySelectorAll('.testimonial-card');
        
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.6s cubic-bezier(0.19, 1, 0.22, 1)';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 150);
        });
    }
}

// Initialize Testimonials Animator
document.addEventListener('DOMContentLoaded', () => {
    new TestimonialsAnimator();
});

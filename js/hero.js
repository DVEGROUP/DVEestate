// ===== Hero Slider =====

class HeroSlider {
    constructor() {
        this.slides = document.querySelectorAll('.hero-slide');
        this.indicators = document.querySelectorAll('.hero-indicator');
        this.prevBtn = document.getElementById('heroPrev');
        this.nextBtn = document.getElementById('heroNext');
        this.currentSlide = 0;
        this.isTransitioning = false;
        this.autoplayInterval = null;
        this.autoplayDelay = 6000; // 6 seconds
        
        this.init();
    }
    
    init() {
        // Set first slide as active
        this.showSlide(0);
        
        // Add event listeners
        this.prevBtn.addEventListener('click', () => this.previousSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());
        
        // Indicator click events
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToSlide(index));
        });
        
        // Start autoplay
        this.startAutoplay();
        
        // Pause autoplay on hover
        const heroSection = document.querySelector('.hero');
        heroSection.addEventListener('mouseenter', () => this.stopAutoplay());
        heroSection.addEventListener('mouseleave', () => this.startAutoplay());
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.previousSlide();
            if (e.key === 'ArrowRight') this.nextSlide();
        });
        
        // Touch swipe support
        this.addTouchSupport();
    }
    
    showSlide(index) {
        if (this.isTransitioning) return;
        
        this.isTransitioning = true;
        
        // Remove active class from all slides
        this.slides.forEach(slide => slide.classList.remove('active'));
        this.indicators.forEach(indicator => indicator.classList.remove('active'));
        
        // Add active class to current slide
        this.slides[index].classList.add('active');
        this.indicators[index].classList.add('active');
        
        this.currentSlide = index;
        
        // Re-initialize Lucide icons for the new slide
        setTimeout(() => {
            lucide.createIcons();
        }, 100);
        
        // Allow transitions after animation
        setTimeout(() => {
            this.isTransitioning = false;
        }, 1000);
        
        // Animate slide content
        this.animateSlideContent(index);
    }
    
    animateSlideContent(index) {
        const slide = this.slides[index];
        const title = slide.querySelector('.hero-title');
        const subtitle = slide.querySelector('.hero-subtitle');
        const buttons = slide.querySelector('.hero-buttons');
        
        // Reset animations
        [title, subtitle, buttons].forEach(el => {
            if (el) {
                el.style.animation = 'none';
                // Trigger reflow
                el.offsetHeight;
            }
        });
        
        // Apply animations with delays
        setTimeout(() => {
            if (title) title.style.animation = 'fadeInUp 0.8s ease-out forwards';
        }, 100);
        
        setTimeout(() => {
            if (subtitle) subtitle.style.animation = 'fadeInUp 0.8s ease-out forwards';
        }, 300);
        
        setTimeout(() => {
            if (buttons) buttons.style.animation = 'fadeInUp 0.8s ease-out forwards';
        }, 500);
    }
    
    nextSlide() {
        const nextIndex = (this.currentSlide + 1) % this.slides.length;
        this.goToSlide(nextIndex);
    }
    
    previousSlide() {
        const prevIndex = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
        this.goToSlide(prevIndex);
    }
    
    goToSlide(index) {
        if (index !== this.currentSlide && !this.isTransitioning) {
            this.showSlide(index);
            this.resetAutoplay();
        }
    }
    
    startAutoplay() {
        this.autoplayInterval = setInterval(() => {
            this.nextSlide();
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
    
    addTouchSupport() {
        const heroSection = document.querySelector('.hero');
        let touchStartX = 0;
        let touchEndX = 0;
        
        heroSection.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        heroSection.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        });
        
        const handleSwipe = () => {
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
            }
        };
        
        this.handleSwipe = handleSwipe;
    }
}

// Initialize Hero Slider
document.addEventListener('DOMContentLoaded', () => {
    new HeroSlider();
});

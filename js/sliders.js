/**
 * DVE Estate - Horizontal Sliders System
 * Управление горизонтальными слайдерами для разделов "Наши услуги" и "Наша команда"
 */

class HorizontalSlider {
    constructor(sectionId, options = {}) {
        this.section = document.getElementById(sectionId);
        if (!this.section) return;

        this.options = {
            itemsPerView: {
                mobile: 1,
                tablet: 2,
                desktop: 3
            },
            gap: 24,
            autoplay: false,
            autoplayDelay: 5000,
            ...options
        };

        this.currentIndex = 0;
        this.isTransitioning = false;
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.autoplayTimer = null;

        this.init();
    }

    init() {
        this.createSliderStructure();
        this.setupEventListeners();
        this.updateSlider();
        
        if (this.options.autoplay) {
            this.startAutoplay();
        }
    }

    createSliderStructure() {
        // Находим контейнер с элементами
        const itemsContainer = this.section.querySelector('.services-grid, .team-grid');
        if (!itemsContainer) return;

        const items = Array.from(itemsContainer.children);
        this.totalItems = items.length;

        // Создаём структуру слайдера
        const sliderWrapper = document.createElement('div');
        sliderWrapper.className = 'slider-wrapper';

        const sliderContainer = document.createElement('div');
        sliderContainer.className = 'slider-container';

        const sliderTrack = document.createElement('div');
        sliderTrack.className = 'slider-track';

        // Переносим элементы в слайдер-трек
        items.forEach(item => {
            const slide = document.createElement('div');
            slide.className = 'slider-slide';
            slide.appendChild(item);
            sliderTrack.appendChild(slide);
        });

        sliderContainer.appendChild(sliderTrack);
        sliderWrapper.appendChild(sliderContainer);

        // Создаём навигацию
        const navigation = this.createNavigation();
        sliderWrapper.appendChild(navigation);

        // Заменяем старый контейнер на новый
        itemsContainer.parentNode.replaceChild(sliderWrapper, itemsContainer);

        // Сохраняем ссылки
        this.sliderWrapper = sliderWrapper;
        this.sliderTrack = sliderTrack;
        this.slides = Array.from(sliderTrack.children);
    }

    createNavigation() {
        const nav = document.createElement('div');
        nav.className = 'slider-navigation';

        // Кнопка назад
        const prevBtn = document.createElement('button');
        prevBtn.className = 'slider-btn slider-btn-prev';
        prevBtn.innerHTML = '<i data-lucide="chevron-left"></i>';
        prevBtn.setAttribute('aria-label', 'Предыдущий слайд');

        // Кнопка вперёд
        const nextBtn = document.createElement('button');
        nextBtn.className = 'slider-btn slider-btn-next';
        nextBtn.innerHTML = '<i data-lucide="chevron-right"></i>';
        nextBtn.setAttribute('aria-label', 'Следующий слайд');

        // Индикаторы
        const indicators = document.createElement('div');
        indicators.className = 'slider-indicators';

        const maxSlides = this.getMaxSlides();
        for (let i = 0; i < maxSlides; i++) {
            const dot = document.createElement('button');
            dot.className = 'slider-indicator';
            if (i === 0) dot.classList.add('active');
            dot.setAttribute('aria-label', `Перейти к слайду ${i + 1}`);
            dot.dataset.index = i;
            indicators.appendChild(dot);
        }

        nav.appendChild(prevBtn);
        nav.appendChild(indicators);
        nav.appendChild(nextBtn);

        return nav;
    }

    getItemsPerView() {
        const width = window.innerWidth;
        if (width < 768) return this.options.itemsPerView.mobile;
        if (width < 1024) return this.options.itemsPerView.tablet;
        return this.options.itemsPerView.desktop;
    }

    getMaxSlides() {
        const itemsPerView = this.getItemsPerView();
        return Math.max(1, Math.ceil(this.totalItems - itemsPerView + 1));
    }

    setupEventListeners() {
        // Кнопки навигации
        const prevBtn = this.sliderWrapper.querySelector('.slider-btn-prev');
        const nextBtn = this.sliderWrapper.querySelector('.slider-btn-next');

        prevBtn.addEventListener('click', () => this.prev());
        nextBtn.addEventListener('click', () => this.next());

        // Индикаторы
        const indicators = this.sliderWrapper.querySelectorAll('.slider-indicator');
        indicators.forEach(indicator => {
            indicator.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.goToSlide(index);
            });
        });

        // Touch события для свайпа
        this.sliderTrack.addEventListener('touchstart', (e) => {
            this.touchStartX = e.touches[0].clientX;
            if (this.options.autoplay) {
                this.stopAutoplay();
            }
        });

        this.sliderTrack.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].clientX;
            this.handleSwipe();
            if (this.options.autoplay) {
                this.startAutoplay();
            }
        });

        // Клавиатура
        this.sliderWrapper.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.prev();
            if (e.key === 'ArrowRight') this.next();
        });

        // Остановка автопрокрутки при наведении
        if (this.options.autoplay) {
            this.sliderWrapper.addEventListener('mouseenter', () => this.stopAutoplay());
            this.sliderWrapper.addEventListener('mouseleave', () => this.startAutoplay());
        }

        // Пересчёт при изменении размера окна
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                this.updateSlider();
                this.updateIndicators();
            }, 200);
        });

        // Инициализация Lucide иконок
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    handleSwipe() {
        const swipeDistance = this.touchStartX - this.touchEndX;
        const threshold = 50;

        if (Math.abs(swipeDistance) > threshold) {
            if (swipeDistance > 0) {
                this.next();
            } else {
                this.prev();
            }
        }
    }

    next() {
        const maxSlides = this.getMaxSlides();
        if (this.currentIndex < maxSlides - 1) {
            this.goToSlide(this.currentIndex + 1);
        }
    }

    prev() {
        if (this.currentIndex > 0) {
            this.goToSlide(this.currentIndex - 1);
        }
    }

    goToSlide(index) {
        if (this.isTransitioning) return;

        const maxSlides = this.getMaxSlides();
        this.currentIndex = Math.max(0, Math.min(index, maxSlides - 1));
        this.updateSlider();
    }

    updateSlider() {
        if (!this.sliderTrack) return;

        this.isTransitioning = true;
        const itemsPerView = this.getItemsPerView();
        const slideWidth = 100 / itemsPerView;
        const offset = -(this.currentIndex * slideWidth);

        this.sliderTrack.style.transform = `translateX(${offset}%)`;

        // Обновляем ширину слайдов
        this.slides.forEach(slide => {
            slide.style.width = `${slideWidth}%`;
        });

        this.updateButtons();
        this.updateIndicators();

        setTimeout(() => {
            this.isTransitioning = false;
        }, 300);
    }

    updateButtons() {
        const prevBtn = this.sliderWrapper.querySelector('.slider-btn-prev');
        const nextBtn = this.sliderWrapper.querySelector('.slider-btn-next');
        const maxSlides = this.getMaxSlides();

        prevBtn.disabled = this.currentIndex === 0;
        nextBtn.disabled = this.currentIndex >= maxSlides - 1;
    }

    updateIndicators() {
        const indicators = this.sliderWrapper.querySelectorAll('.slider-indicator');
        const maxSlides = this.getMaxSlides();
        
        indicators.forEach((indicator, index) => {
            if (index < maxSlides) {
                indicator.style.display = 'block';
                indicator.classList.toggle('active', index === this.currentIndex);
            } else {
                indicator.style.display = 'none';
            }
        });
    }

    startAutoplay() {
        if (!this.options.autoplay) return;
        this.stopAutoplay();
        this.autoplayTimer = setInterval(() => {
            const maxSlides = this.getMaxSlides();
            if (this.currentIndex < maxSlides - 1) {
                this.next();
            } else {
                this.goToSlide(0);
            }
        }, this.options.autoplayDelay);
    }

    stopAutoplay() {
        if (this.autoplayTimer) {
            clearInterval(this.autoplayTimer);
            this.autoplayTimer = null;
        }
    }
}

// Инициализация слайдеров после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    // Слайдер услуг
    new HorizontalSlider('услуги', {
        itemsPerView: {
            mobile: 1,
            tablet: 2,
            desktop: 3
        }
    });

    // Слайдер команды
    new HorizontalSlider('команда', {
        itemsPerView: {
            mobile: 1,
            tablet: 2,
            desktop: 3
        }
    });
});

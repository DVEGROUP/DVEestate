// ===== Contact Form Handler =====

class ContactFormHandler {
    constructor(formId, messageId, btnId) {
        this.form = document.getElementById(formId);
        this.messageDiv = document.getElementById(messageId);
        this.submitBtn = document.getElementById(btnId);
        this.btnText = this.submitBtn.querySelector('span:not(.btn-loader)');
        this.btnLoader = this.submitBtn.querySelector('.btn-loader');
        
        if (this.form) {
            this.init();
        }
    }
    
    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        // Disable submit button
        this.setLoading(true);
        
        // Get form data
        const formData = new FormData(this.form);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone') || 'Не указан',
            message: formData.get('message')
        };
        
        try {
            // Send email using our backend API
            const response = await this.sendEmail(data);
            
            if (response.success) {
                this.showMessage('success', 'Спасибо за ваше сообщение! Мы свяжемся с вами в ближайшее время.');
                this.form.reset();
                
                // Close modal if it's modal form
                if (this.form.id === 'modalForm') {
                    setTimeout(() => {
                        closeContactModal();
                    }, 2000);
                }
            } else {
                throw new Error(response.message || 'Ошибка отправки');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            this.showMessage('error', 'Произошла ошибка при отправке сообщения. Пожалуйста, попробуйте позже или свяжитесь с нами по телефону.');
        } finally {
            this.setLoading(false);
        }
    }
    
    async sendEmail(data) {
        // Option 1: Using Web3Forms (free service, no backend required)
        const web3formsKey = 'bfd7408d-7074-41a2-8530-9b40aefd7064'; // Replace with your key from web3forms.com
        
        try {
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    access_key: web3formsKey,
                    subject: `Новая заявка с сайта DVE от ${data.name}`,
                    from_name: 'DVE Estate Website',
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    message: data.message,
                    to: 'dvegroupp@gmail.com'
                })
            });
            
            return await response.json();
        } catch (error) {
            console.error('Web3Forms error:', error);
            
            // Fallback: Use mailto link as last resort
            return this.fallbackMailto(data);
        }
    }
    
    fallbackMailto(data) {
        // Create mailto link with pre-filled data
        const subject = encodeURIComponent(`Новая заявка от ${data.name}`);
        const body = encodeURIComponent(
            `Имя: ${data.name}\n` +
            `Email: ${data.email}\n` +
            `Телефон: ${data.phone}\n\n` +
            `Сообщение:\n${data.message}`
        );
        
        const mailtoLink = `mailto:dvegroupp@gmail.com?subject=${subject}&body=${body}`;
        window.location.href = mailtoLink;
        
        return { 
            success: true, 
            message: 'Открывается почтовый клиент...' 
        };
    }
    
    setLoading(isLoading) {
        if (isLoading) {
            this.submitBtn.disabled = true;
            this.submitBtn.classList.add('loading');
        } else {
            this.submitBtn.disabled = false;
            this.submitBtn.classList.remove('loading');
        }
    }
    
    showMessage(type, text) {
        this.messageDiv.className = `form-message ${type}`;
        this.messageDiv.textContent = text;
        
        // Auto-hide message after 5 seconds
        setTimeout(() => {
            this.messageDiv.className = 'form-message';
        }, 5000);
    }
}

// Initialize both forms
document.addEventListener('DOMContentLoaded', () => {
    // Main contact form
    new ContactFormHandler('contactForm', 'formMessage', 'submitBtn');
    
    // Modal contact form
    new ContactFormHandler('modalForm', 'modalFormMessage', 'modalSubmitBtn');
});

// ===== Alternative: EmailJS Integration =====
// If you prefer EmailJS (another popular free service), uncomment below:

/*
class EmailJSFormHandler {
    constructor(formId, messageId, btnId) {
        this.form = document.getElementById(formId);
        this.messageDiv = document.getElementById(messageId);
        this.submitBtn = document.getElementById(btnId);
        
        // Initialize EmailJS
        emailjs.init('YOUR_PUBLIC_KEY'); // Get from emailjs.com
        
        if (this.form) {
            this.init();
        }
    }
    
    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        this.setLoading(true);
        
        try {
            await emailjs.sendForm(
                'YOUR_SERVICE_ID',    // Your EmailJS service ID
                'YOUR_TEMPLATE_ID',   // Your EmailJS template ID
                this.form
            );
            
            this.showMessage('success', 'Спасибо за ваше сообщение!');
            this.form.reset();
        } catch (error) {
            this.showMessage('error', 'Ошибка отправки. Попробуйте позже.');
        } finally {
            this.setLoading(false);
        }
    }
    
    setLoading(isLoading) {
        this.submitBtn.disabled = isLoading;
        this.submitBtn.classList.toggle('loading', isLoading);
    }
    
    showMessage(type, text) {
        this.messageDiv.className = `form-message ${type}`;
        this.messageDiv.textContent = text;
        
        setTimeout(() => {
            this.messageDiv.className = 'form-message';
        }, 5000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EmailJSFormHandler('contactForm', 'formMessage', 'submitBtn');
    new EmailJSFormHandler('modalForm', 'modalFormMessage', 'modalSubmitBtn');
});
*/

// ===== Form Validation =====

class FormValidator {
    constructor() {
        this.forms = document.querySelectorAll('form');
        this.init();
    }
    
    init() {
        this.forms.forEach(form => {
            const inputs = form.querySelectorAll('input, textarea');
            
            inputs.forEach(input => {
                // Real-time validation on blur
                input.addEventListener('blur', () => {
                    this.validateInput(input);
                });
                
                // Remove error on input
                input.addEventListener('input', () => {
                    this.removeError(input);
                });
            });
            
            // Validate on submit
            form.addEventListener('submit', (e) => {
                let isValid = true;
                
                inputs.forEach(input => {
                    if (!this.validateInput(input)) {
                        isValid = false;
                    }
                });
                
                if (!isValid) {
                    e.preventDefault();
                }
            });
        });
    }
    
    validateInput(input) {
        const value = input.value.trim();
        const type = input.type;
        const required = input.hasAttribute('required');
        
        // Check if required field is empty
        if (required && !value) {
            this.showError(input, 'Это поле обязательно для заполнения');
            return false;
        }
        
        // Email validation
        if (type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                this.showError(input, 'Введите корректный email адрес');
                return false;
            }
        }
        
        // Phone validation (basic)
        if (type === 'tel' && value) {
            const phoneRegex = /^[\d\s\-\+\(\)]+$/;
            if (!phoneRegex.test(value)) {
                this.showError(input, 'Введите корректный номер телефона');
                return false;
            }
        }
        
        // Name validation (at least 2 characters)
        if (input.name === 'name' && value) {
            if (value.length < 2) {
                this.showError(input, 'Имя должно содержать минимум 2 символа');
                return false;
            }
        }
        
        // Message validation (at least 10 characters)
        if (input.name === 'message' && value) {
            if (value.length < 10) {
                this.showError(input, 'Сообщение должно содержать минимум 10 символов');
                return false;
            }
        }
        
        this.removeError(input);
        return true;
    }
    
    showError(input, message) {
        this.removeError(input);
        
        input.classList.add('error');
        input.style.borderColor = '#dc3545';
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.color = '#dc3545';
        errorDiv.style.fontSize = '0.875rem';
        errorDiv.style.marginTop = '5px';
        errorDiv.textContent = message;
        
        input.parentElement.appendChild(errorDiv);
    }
    
    removeError(input) {
        input.classList.remove('error');
        input.style.borderColor = '';
        
        const errorDiv = input.parentElement.querySelector('.error-message');
        if (errorDiv) {
            errorDiv.remove();
        }
    }
}

// Initialize Form Validator
document.addEventListener('DOMContentLoaded', () => {
    new FormValidator();
});

// ===== Phone Number Formatting =====

function formatPhoneNumber(input) {
    let value = input.value.replace(/\D/g, '');
    
    if (value.startsWith('7')) {
        value = value.substring(1);
    } else if (value.startsWith('8')) {
        value = value.substring(1);
    }
    
    if (value.length > 0) {
        if (value.length <= 3) {
            value = `+7 (${value}`;
        } else if (value.length <= 6) {
            value = `+7 (${value.slice(0, 3)}) ${value.slice(3)}`;
        } else if (value.length <= 8) {
            value = `+7 (${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6)}`;
        } else {
            value = `+7 (${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 8)}-${value.slice(8, 10)}`;
        }
    }
    
    input.value = value;
}

// Apply phone formatting to all phone inputs
document.addEventListener('DOMContentLoaded', () => {
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    
    phoneInputs.forEach(input => {
        input.addEventListener('input', () => formatPhoneNumber(input));
    });
});

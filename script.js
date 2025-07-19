/**
 * Portfolio JavaScript - Optimisé pour SEO et Performance
 * Version: 1.0.0
 * Auteur: Développeur Web Junior
 * Description: Script principal pour le portfolio avec animations et interactions
 */

// DOM Elements - Optimisé pour les performances
const contactForm = document.getElementById('contact-form');
const navbar = document.querySelector('.navbar');
const navLinks = document.querySelectorAll('.nav-link');

// Configuration globale
const CONFIG = {
    scrollOffset: 80,
    animationThreshold: 0.1,
    animationRootMargin: '0px 0px -50px 0px',
    notificationTimeout: 5000,
    throttleDelay: 100
};

// Theme Management - Mode sombre permanent
let currentTheme = 'dark';
document.documentElement.setAttribute('data-theme', currentTheme);

// Suppression du toggle de thème - Mode sombre permanent
function updateThemeIcon() {
    // Fonction vide car plus de toggle
}

// Enhanced Navbar Scroll Effect
function handleNavbarScroll() {
    if (!navbar) return;

    const scrollY = window.scrollY;
    if (scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    // Update active nav link based on scroll position
    updateActiveNavLink();
}

// Update active navigation link
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

// Smooth Scrolling for Navigation Links - Optimisé pour l'accessibilité
function initSmoothScrolling() {
    if (!navLinks.length) return;

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            if (!targetId) return;

            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - CONFIG.scrollOffset;

                // Amélioration de l'accessibilité
                targetSection.setAttribute('tabindex', '-1');
                targetSection.focus();

                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });

                // Retirer le focus après le scroll
                setTimeout(() => {
                    targetSection.removeAttribute('tabindex');
                }, 1000);
            }
        });
    });
}

// Intersection Observer for Animations - Optimisé pour les performances
function initScrollAnimations() {
    if (!('IntersectionObserver' in window)) {
        // Fallback pour les navigateurs plus anciens
        document.querySelectorAll('.project-card, .skill-category-modern, .about-content, .contact-content')
            .forEach(el => el.classList.add('fade-in-up'));
        return;
    }

    const observerOptions = {
        threshold: CONFIG.animationThreshold,
        rootMargin: CONFIG.animationRootMargin
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                // Désinscrire après animation pour économiser les ressources
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.project-card, .skill-category-modern, .about-content, .contact-content');
    if (animateElements.length) {
        animateElements.forEach(el => observer.observe(el));
    }
}

// Form Validation and Submission
function initContactForm() {
    if (!contactForm) return;

    const formGroups = contactForm.querySelectorAll('.form-group');

    // Real-time validation
    formGroups.forEach(group => {
        const input = group.querySelector('input, textarea');
        const label = group.querySelector('label');

        if (input && label) {
            // Check if input has value on load
            if (input.value) {
                label.classList.add('active');
            }

            input.addEventListener('focus', () => {
                label.classList.add('active');
            });

            input.addEventListener('blur', () => {
                if (!input.value) {
                    label.classList.remove('active');
                }
            });

            input.addEventListener('input', () => {
                if (input.value) {
                    label.classList.add('active');
                } else {
                    label.classList.remove('active');
                }
            });
        }
    });

    // Form submission
    contactForm.addEventListener('submit', handleFormSubmit);
}

function handleFormSubmit(e) {
    e.preventDefault();

    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData);

    // Basic validation
    if (!data.name || !data.email || !data.message) {
        showNotification('Veuillez remplir tous les champs obligatoires.', 'error');
        return;
    }

    if (!isValidEmail(data.email)) {
        showNotification('Veuillez entrer une adresse email valide.', 'error');
        return;
    }

    // Show loading state
    const submitButton = contactForm.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Envoi en cours...';
    submitButton.disabled = true;

    // Send form data to Formspree
    fetch(contactForm.action, {
        method: 'POST',
        body: formData,
        headers: {
            'Accept': 'application/json'
        }
    })
        .then(response => {
            if (response.ok) {
                showNotification('Message envoyé avec succès ! Je vous répondrai bientôt.', 'success');
                contactForm.reset();
                contactForm.querySelectorAll('.form-group label').forEach(label => {
                    label.classList.remove('active');
                });
            } else {
                throw new Error('Erreur lors de l\'envoi');
            }
        })
        .catch(error => {
            console.error('Erreur:', error);
            showNotification('Erreur lors de l\'envoi du message. Veuillez réessayer.', 'error');
        })
        .finally(() => {
            // Restore button state
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
        });
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Notification System
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--bg-primary);
        border: 1px solid var(--border-color);
        border-radius: 10px;
        padding: 1rem;
        box-shadow: 0 10px 30px var(--shadow-light);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 1rem;
        min-width: 300px;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    });

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }
    }, CONFIG.notificationTimeout);
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        default: return 'fa-info-circle';
    }
}



// Skill Cards Hover Effect
function initSkillCards() {
    const skillCards = document.querySelectorAll('.skill-card');

    skillCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px) scale(1.05)';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });
}



// Enhanced Parallax Effect for Hero Section
function initParallaxEffect() {
    const heroVisual = document.querySelector('.hero-visual');
    const morphShapes = document.querySelectorAll('.morph-shape');
    const particles = document.querySelectorAll('.particle');

    if (!heroVisual) return;

    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;

        // Parallax for hero visual
        heroVisual.style.transform = `translateY(${rate}px)`;

        // Parallax for morphing shapes
        morphShapes.forEach((shape, index) => {
            const speed = (index + 1) * 0.3;
            shape.style.transform = `translateY(${scrolled * speed}px) rotate(${scrolled * 0.1}deg)`;
        });

        // Parallax for particles
        particles.forEach((particle, index) => {
            const speed = (index + 1) * 0.2;
            particle.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });
}

// Mouse move parallax effect
function initMouseParallax() {
    const hero = document.querySelector('.hero');
    const floatingCards = document.querySelectorAll('.floating-card');

    if (!hero) return;

    hero.addEventListener('mousemove', (e) => {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;

        const x = (clientX - innerWidth / 2) / innerWidth;
        const y = (clientY - innerHeight / 2) / innerHeight;

        floatingCards.forEach((card, index) => {
            const speed = (index + 1) * 0.1;
            card.style.transform = `translate(${x * 20 * speed}px, ${y * 20 * speed}px)`;
        });
    });
}

// Interactive Floating Cards
function initFloatingCards() {
    const floatingCards = document.querySelectorAll('.floating-card');

    floatingCards.forEach((card, index) => {
        // Add click functionality
        card.addEventListener('click', () => {
            // Add ripple effect
            const ripple = document.createElement('div');
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.3);
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;

            const rect = card.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = (rect.width / 2 - size / 2) + 'px';
            ripple.style.top = (rect.height / 2 - size / 2) + 'px';

            card.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 600);

            // Navigate to relevant section based on icon
            const icon = card.querySelector('i');
            if (icon) {
                const iconClass = icon.className;
                if (iconClass.includes('fa-code')) {
                    document.querySelector('#skills').scrollIntoView({ behavior: 'smooth' });
                } else if (iconClass.includes('fa-rocket')) {
                    document.querySelector('#projects').scrollIntoView({ behavior: 'smooth' });
                } else if (iconClass.includes('fa-palette')) {
                    document.querySelector('#about').scrollIntoView({ behavior: 'smooth' });
                }
            }
        });

        // Add mouse move effect
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
        });

        // Reset transform on mouse leave
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}

// Add ripple animation to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);



// Animated Counter for Stats
function initAnimatedCounters() {
    const stats = document.querySelectorAll('.stat[data-value]');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const stat = entry.target;
                const value = stat.getAttribute('data-value');
                const numberElement = stat.querySelector('.stat-number');

                if (value === 'infinity') {
                    numberElement.textContent = '∞';
                } else if (value === '24') {
                    animateCounter(numberElement, 0, 24, 1000, (value) => `${value}/7`);
                } else {
                    animateCounter(numberElement, 0, parseInt(value), 1000, (value) => `${value}%`);
                }

                observer.unobserve(stat);
            }
        });
    }, { threshold: 0.5 });

    stats.forEach(stat => observer.observe(stat));
}

// Skills Animation
function initSkillsAnimation() {
    const skillCategories = document.querySelectorAll('.skill-category-modern');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const category = entry.target;
                const progressFill = category.querySelector('.progress-fill');
                const skillItems = category.querySelectorAll('.skill-item');
                const progressValue = progressFill.getAttribute('data-progress');

                // Animate category progress bar
                progressFill.style.setProperty('--progress-width', `${progressValue}%`);
                category.classList.add('animate');

                // Animate individual skill bars with delay
                skillItems.forEach((item, index) => {
                    setTimeout(() => {
                        const levelFill = item.querySelector('.level-fill');
                        const levelWidth = levelFill.style.width;
                        levelFill.style.setProperty('--level-width', levelWidth);
                        item.classList.add('animate');
                    }, index * 200);
                });

                observer.unobserve(category);
            }
        });
    }, { threshold: 0.3 });

    skillCategories.forEach(category => observer.observe(category));
}

function animateCounter(element, start, end, duration, formatter) {
    const startTime = performance.now();

    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const current = Math.floor(start + (end - start) * progress);
        element.textContent = formatter(current);

        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        }
    }

    requestAnimationFrame(updateCounter);
}



// Performance Optimization: Throttle scroll events
function throttle(func, limit) {
    let inThrottle;
    return function () {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Initialize all functions
function init() {
    // Event listeners
    // Suppression du toggle de thème - Mode sombre permanent
    // if (themeToggle) {
    //     themeToggle.addEventListener('click', toggleTheme);
    // }

    // Only add scroll listener if navbar exists
    if (navbar) {
        window.addEventListener('scroll', throttle(handleNavbarScroll, CONFIG.throttleDelay));
    }

    // Initialize features
    initSmoothScrolling();
    initScrollAnimations();
    initContactForm();
    initSkillCards();
    initParallaxEffect();
    initMouseParallax();
    initFloatingCards();
    initAnimatedCounters();
    initSkillsAnimation();

    // Add fade-in class to elements on load
    document.addEventListener('DOMContentLoaded', () => {
        const elements = document.querySelectorAll('.skill-category-modern, .about-content, .contact-content');
        if (elements.length) {
            elements.forEach((el, index) => {
                setTimeout(() => {
                    el.classList.add('fade-in-up');
                }, index * 100);
            });
        }
    });
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Export functions for potential external use
window.PortfolioApp = {
    // Suppression du toggle de thème - Mode sombre permanent
    // toggleTheme,
    showNotification,
    init
}; 
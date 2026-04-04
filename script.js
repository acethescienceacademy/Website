document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.inquiry-form');
    const navbar = document.querySelector('.navbar');

    // ===== DARK MODE TOGGLE =====
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;

    // Check saved preference or system preference
    function getPreferredTheme() {
        const saved = localStorage.getItem('theme');
        if (saved) return saved;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    function applyTheme(theme) {
        if (theme === 'dark') {
            body.classList.add('dark-mode');
            themeToggle.setAttribute('aria-checked', 'true');
        } else {
            body.classList.remove('dark-mode');
            themeToggle.setAttribute('aria-checked', 'false');
        }
        localStorage.setItem('theme', theme);
    }

    // Apply on load
    applyTheme(getPreferredTheme());

    // Toggle on click
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isDark = body.classList.contains('dark-mode');
            applyTheme(isDark ? 'light' : 'dark');
        });

        // Keyboard support
        themeToggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                themeToggle.click();
            }
        });
    }

    // Listen for OS theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });

    // ===== SCROLL REVEAL =====
    const revealElements = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    revealElements.forEach(el => observer.observe(el));

    // ===== STATS COUNTER ANIMATION =====
    const statNumbers = document.querySelectorAll('.stat-number[data-target]');
    let statsAnimated = false;

    function animateCounter(el) {
        const target = parseInt(el.dataset.target);
        const duration = 2000;
        const start = performance.now();

        function easeOutQuart(t) {
            return 1 - Math.pow(1 - t, 4);
        }

        function update(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeOutQuart(progress);
            const current = Math.round(eased * target);
            el.textContent = current.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !statsAnimated) {
                statsAnimated = true;
                statNumbers.forEach(el => animateCounter(el));
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    const statsBar = document.querySelector('.stats-bar');
    if (statsBar) {
        statsObserver.observe(statsBar);
    }

    // ===== SMOOTH SCROLL FOR ANCHORS =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 60,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ===== FORM SUBMISSION =====
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const btn = document.getElementById('submitBtn');
            const originalText = btn.textContent;

            // Get form values
            const fullName = document.getElementById('fullName').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const course = document.getElementById('course').options[document.getElementById('course').selectedIndex].text;
            const query = document.getElementById('query').value;

            btn.textContent = 'Submitting...';
            btn.disabled = true;

            // The email address where inquiries should be sent
            const targetEmail = "acethescienceacademy@gmail.com";

            fetch(`https://formsubmit.co/ajax/${targetEmail}`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    Name: fullName,
                    Email: email,
                    Phone: phone,
                    Course_Interest: course,
                    Message: query || "No specific query provided.",
                    _subject: `New Inquiry: ${fullName} wants to join ${course}`,
                    _template: "table" // Makes the email look nice
                })
            })
                .then(response => response.json())
                .then(data => {
                    btn.textContent = '✓ Success!';
                    btn.style.background = 'linear-gradient(135deg, #10B981, #059669)';
                    btn.style.transition = 'background 0.4s ease';

                    setTimeout(() => {
                        btn.textContent = originalText;
                        btn.style.background = '';
                        btn.disabled = false;
                        form.reset();
                    }, 3000);
                })
                .catch(error => {
                    btn.textContent = 'Error! Try Again';
                    btn.style.background = 'linear-gradient(135deg, #EF4444, #DC2626)';

                    setTimeout(() => {
                        btn.textContent = originalText;
                        btn.style.background = '';
                        btn.disabled = false;
                    }, 3000);
                });
        });
    }

    // ===== HERO CTA =====
    const heroBtn = document.getElementById('heroCta');
    if (heroBtn) {
        heroBtn.addEventListener('click', () => {
            const formSection = document.querySelector('.form-section');
            if (formSection) {
                window.scrollTo({
                    top: formSection.offsetTop - 60,
                    behavior: 'smooth'
                });

                setTimeout(() => {
                    document.getElementById('fullName').focus();
                }, 800);
            }
        });
    }

    // ===== NAVBAR SCROLL + ACTIVE LINK =====
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');
    let ticking = false;

    function onScroll() {
        const scrollY = window.scrollY;

        // Navbar glassmorphism on scroll
        if (scrollY > 30) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Active nav link highlight
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            if (scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            link.style.color = '';
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });

        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(onScroll);
            ticking = true;
        }
    }, { passive: true });

    // ===== PARALLAX PARTICLES ON MOUSEMOVE =====
    const particles = document.querySelectorAll('.particle');
    if (particles.length > 0 && window.innerWidth > 768) {
        document.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 2;
            const y = (e.clientY / window.innerHeight - 0.5) * 2;

            particles.forEach((p, i) => {
                const speed = (i + 1) * 8;
                p.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
            });
        });
    }

    // ===== MOBILE MENU =====
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinksContainer = document.getElementById('navLinks');

    if (mobileMenuBtn && navLinksContainer) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenuBtn.classList.toggle('active');
            navLinksContainer.classList.toggle('active');
        });

        // Close menu on link click
        navLinksContainer.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuBtn.classList.remove('active');
                navLinksContainer.classList.remove('active');
            });
        });
    }

    // Trigger initial scroll state
    onScroll();
});

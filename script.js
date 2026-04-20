/* =========================================================
   KIROSHIATSU — interactions, animations, microinteractions
   ========================================================= */

(() => {
    'use strict';

    const qs  = (s, c = document) => c.querySelector(s);
    const qsa = (s, c = document) => Array.from(c.querySelectorAll(s));
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* -----------------------------------------------------
       Loader
       ----------------------------------------------------- */
    window.addEventListener('load', () => {
        setTimeout(() => {
            qs('#loader')?.classList.add('done');
            document.body.style.overflow = '';
            // Trigger hero title reveal
            qsa('.hero-title .line').forEach((line, i) => {
                setTimeout(() => line.classList.add('in'), 100 + i * 120);
            });
        }, 900);
    });

    // Lock scroll until loader gone
    document.body.style.overflow = 'hidden';

    /* -----------------------------------------------------
       Year
       ----------------------------------------------------- */
    const yearEl = qs('#year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* -----------------------------------------------------
       Navbar scroll state
       ----------------------------------------------------- */
    const navbar = qs('#navbar');
    const scrollProgress = qs('#scrollProgress');
    let lastY = 0;

    const onScroll = () => {
        const y = window.scrollY;
        navbar.classList.toggle('scrolled', y > 40);

        const h = document.documentElement.scrollHeight - window.innerHeight;
        const pct = h > 0 ? (y / h) * 100 : 0;
        if (scrollProgress) scrollProgress.style.width = pct + '%';

        lastY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* -----------------------------------------------------
       Mobile menu
       ----------------------------------------------------- */
    const navToggle = qs('#navToggle');
    const mobileMenu = qs('#mobileMenu');

    const closeMenu = () => {
        navToggle?.classList.remove('open');
        mobileMenu?.classList.remove('open');
        document.body.style.overflow = '';
    };
    const openMenu = () => {
        navToggle?.classList.add('open');
        mobileMenu?.classList.add('open');
        document.body.style.overflow = 'hidden';
    };

    navToggle?.addEventListener('click', () => {
        mobileMenu.classList.contains('open') ? closeMenu() : openMenu();
    });
    qsa('.mobile-menu a').forEach(a => a.addEventListener('click', closeMenu));

    /* -----------------------------------------------------
       Smooth-scroll anchor offset
       ----------------------------------------------------- */
    qsa('a[href^="#"]').forEach(a => {
        a.addEventListener('click', (e) => {
            const id = a.getAttribute('href');
            if (id.length <= 1) return;
            const target = qs(id);
            if (!target) return;
            e.preventDefault();
            const navH = navbar?.offsetHeight ?? 0;
            const top = target.getBoundingClientRect().top + window.scrollY - navH + 1;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });

    /* -----------------------------------------------------
       Intersection-based reveal
       ----------------------------------------------------- */
    const revealEls = qsa('.reveal, .reveal-stagger, .reveal-up, .reveal-parallax');
    const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('in');
                io.unobserve(e.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });

    revealEls.forEach(el => io.observe(el));

    /* -----------------------------------------------------
       Count-up stats
       ----------------------------------------------------- */
    const counters = qsa('[data-count]');
    const countIO = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (!e.isIntersecting) return;
            const el = e.target;
            const target = parseInt(el.dataset.count, 10);
            const duration = 1400;
            const start = performance.now();
            const tick = (now) => {
                const p = Math.min((now - start) / duration, 1);
                const eased = 1 - Math.pow(1 - p, 3);
                el.textContent = Math.round(target * eased);
                if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
            countIO.unobserve(el);
        });
    }, { threshold: 0.5 });
    counters.forEach(c => countIO.observe(c));

    /* -----------------------------------------------------
       Custom cursor (desktop)
       ----------------------------------------------------- */
    const hasFinePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (hasFinePointer && !prefersReducedMotion) {
        const dot = qs('#cursorDot');
        const ring = qs('#cursorRing');

        let dotX = 0, dotY = 0, ringX = 0, ringY = 0, mouseX = 0, mouseY = 0;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX; mouseY = e.clientY;
            if (!document.body.classList.contains('cursor-ready')) {
                document.body.classList.add('cursor-ready');
            }
        });

        const render = () => {
            dotX += (mouseX - dotX) * 0.5;
            dotY += (mouseY - dotY) * 0.5;
            ringX += (mouseX - ringX) * 0.15;
            ringY += (mouseY - ringY) * 0.15;
            if (dot) dot.style.transform = `translate(${dotX}px, ${dotY}px) translate(-50%, -50%)`;
            if (ring) ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
            requestAnimationFrame(render);
        };
        render();

        qsa('a, button, [data-magnetic], .service-card, .test-card').forEach(el => {
            el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
            el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
        });
    }

    /* -----------------------------------------------------
       Magnetic buttons
       ----------------------------------------------------- */
    if (hasFinePointer && !prefersReducedMotion) {
        qsa('[data-magnetic]').forEach(el => {
            const strength = 18;
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - (rect.left + rect.width / 2);
                const y = e.clientY - (rect.top + rect.height / 2);
                el.style.transform = `translate(${x / rect.width * strength}px, ${y / rect.height * strength}px)`;
            });
            el.addEventListener('mouseleave', () => {
                el.style.transform = '';
            });
        });
    }

    /* -----------------------------------------------------
       Card 3D tilt
       ----------------------------------------------------- */
    if (hasFinePointer && !prefersReducedMotion) {
        qsa('[data-tilt]').forEach(card => {
            const maxTilt = 6;
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;
                card.style.transform = `perspective(900px) rotateX(${-y * maxTilt}deg) rotateY(${x * maxTilt}deg) translateY(-4px)`;
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    /* -----------------------------------------------------
       Contact form (frontend validation + feedback)
       ----------------------------------------------------- */
    const form = qs('#contactForm');
    const feedback = qs('#formFeedback');

    const setError = (field, msg) => {
        field.classList.add('invalid');
        const err = field.querySelector('.form-error');
        if (err) err.textContent = msg;
    };
    const clearError = (field) => {
        field.classList.remove('invalid');
        const err = field.querySelector('.form-error');
        if (err) err.textContent = '';
    };

    form?.addEventListener('submit', (e) => {
        e.preventDefault();
        let ok = true;
        feedback.className = 'form-feedback';
        feedback.textContent = '';

        const data = new FormData(form);
        const name = (data.get('name') || '').toString().trim();
        const email = (data.get('email') || '').toString().trim();
        const message = (data.get('message') || '').toString().trim();
        const consent = form.querySelector('#consent').checked;

        const nameField = form.querySelector('#name').closest('.form-field');
        const emailField = form.querySelector('#email').closest('.form-field');
        const msgField = form.querySelector('#message').closest('.form-field');

        clearError(nameField); clearError(emailField); clearError(msgField);

        if (name.length < 2) { setError(nameField, 'Bitte geben Sie Ihren Namen ein.'); ok = false; }

        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRe.test(email)) { setError(emailField, 'Bitte eine gültige E-Mail angeben.'); ok = false; }

        if (message.length < 5) { setError(msgField, 'Bitte eine kurze Nachricht schreiben.'); ok = false; }

        if (!consent) {
            feedback.classList.add('error');
            feedback.textContent = 'Bitte akzeptieren Sie die Datenschutzhinweise.';
            ok = false;
        }

        if (!ok) return;

        // Simulate submit
        const btn = form.querySelector('button[type="submit"]');
        const originalHTML = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<span>Wird gesendet…</span>';

        setTimeout(() => {
            feedback.classList.add('success');
            feedback.textContent = 'Danke! Ihre Anfrage wurde gesendet. Wir melden uns zeitnah zurück.';
            btn.innerHTML = originalHTML;
            btn.disabled = false;
            form.reset();
        }, 900);
    });

    /* -----------------------------------------------------
       Parallax hero background
       ----------------------------------------------------- */
    if (!prefersReducedMotion) {
        const heroGradient = qs('.hero-gradient');
        window.addEventListener('scroll', () => {
            if (!heroGradient) return;
            const y = window.scrollY;
            if (y < window.innerHeight) {
                heroGradient.style.transform = `translateY(${y * 0.25}px) scale(${1 + y * 0.0002})`;
            }
        }, { passive: true });
    }

    /* -----------------------------------------------------
       Keyboard: close mobile menu on ESC
       ----------------------------------------------------- */
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu?.classList.contains('open')) closeMenu();
    });

})();

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
       Magnetic buttons
       ----------------------------------------------------- */
    const hasFinePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
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

        // Send via Web3Forms
        const btn = form.querySelector('button[type="submit"]');
        const originalHTML = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<span>Wird gesendet…</span>';

        fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: { 'Accept': 'application/json' },
            body: data,
        })
            .then((res) => res.json())
            .then((json) => {
                if (json.success) {
                    form.reset();
                    window.location.href = 'danke.html';
                    return;
                }
                feedback.classList.add('error');
                feedback.textContent = 'Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut oder schreiben Sie an info@kiroshiatsu.de.';
                feedback.scrollIntoView({ behavior: 'smooth', block: 'center' });
            })
            .catch(() => {
                feedback.classList.add('error');
                feedback.textContent = 'Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut oder schreiben Sie an info@kiroshiatsu.de.';
                feedback.scrollIntoView({ behavior: 'smooth', block: 'center' });
            })
            .finally(() => {
                btn.innerHTML = originalHTML;
                btn.disabled = false;
            });
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

    /* -----------------------------------------------------
       Ihre Meinung — review form (star rating + WhatsApp/email send)
       ----------------------------------------------------- */
    const starRating = qs('#starRating');
    const starsInput = qs('#meinungStars');
    const meinungForm = qs('#meinungForm');
    const meinungFeedback = qs('#meinungFeedback');

    if (starRating && starsInput) {
        const stars = qsa('.star', starRating);
        let current = parseInt(starsInput.value, 10) || 5;

        const paint = (val) => {
            stars.forEach(s => {
                const v = parseInt(s.dataset.value, 10);
                s.classList.toggle('active', v <= val);
            });
        };
        paint(current);

        stars.forEach(star => {
            star.addEventListener('click', () => {
                current = parseInt(star.dataset.value, 10);
                starsInput.value = current;
                paint(current);
            });
            star.addEventListener('mouseenter', () => paint(parseInt(star.dataset.value, 10)));
        });
        starRating.addEventListener('mouseleave', () => paint(current));
    }

    if (meinungForm) {
        const PHONE_WA = '4917647115700';
        const EMAIL = 'info@kiroshiatsu.de';

        let sendVia = 'whatsapp';
        qsa('[data-send]', meinungForm).forEach(btn => {
            btn.addEventListener('click', () => { sendVia = btn.dataset.send; });
        });

        meinungForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = qs('#meinungName')?.value.trim() || '';
            const city = qs('#meinungCity')?.value.trim() || '';
            const text = qs('#meinungText')?.value.trim() || '';
            const stars = parseInt(starsInput?.value, 10) || 5;

            if (!name || !text) {
                if (meinungFeedback) {
                    meinungFeedback.textContent = 'Bitte füllen Sie Name und Erfahrung aus.';
                    meinungFeedback.className = 'meinung-feedback error';
                }
                return;
            }

            const starString = '★'.repeat(stars) + '☆'.repeat(5 - stars);
            const locationLine = city ? `Ort: ${city}\n` : '';

            if (sendVia === 'email') {
                const subject = encodeURIComponent(`Meine Meinung zu KiroShiatsu® — ${name}`);
                const body = encodeURIComponent(
                    `Hallo Victor,\n\nhier ist meine Meinung zu meiner Behandlung:\n\n` +
                    `Name: ${name}\n${locationLine}Bewertung: ${starString} (${stars}/5)\n\n` +
                    `Erfahrung:\n${text}\n\nViele Grüße`
                );
                window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
            } else {
                const msg = encodeURIComponent(
                    `Hallo Victor, hier ist meine Meinung zu KiroShiatsu®:\n\n` +
                    `Name: ${name}\n${locationLine}Bewertung: ${starString} (${stars}/5)\n\n` +
                    `Erfahrung:\n${text}`
                );
                window.open(`https://wa.me/${PHONE_WA}?text=${msg}`, '_blank', 'noopener');
            }

            if (meinungFeedback) {
                meinungFeedback.textContent = 'Danke! Ihre Meinung wurde vorbereitet — senden Sie sie einfach ab.';
                meinungFeedback.className = 'meinung-feedback';
            }
        });
    }

    /* -----------------------------------------------------
       Therapy modal — detail view on card click
       ----------------------------------------------------- */
    const therapyModal = qs('#therapyModal');
    const therapyModalBody = qs('#therapyModalBody');

    const openTherapyModal = (card) => {
        if (!therapyModal || !therapyModalBody) return;
        const detail = card.querySelector('.therapy-detail');
        if (!detail) return;

        therapyModalBody.innerHTML = detail.innerHTML;
        therapyModal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');

        const scrollArea = qs('.therapy-modal-scroll');
        if (scrollArea) scrollArea.scrollTop = 0;
    };

    const closeTherapyModal = () => {
        if (!therapyModal) return;
        therapyModal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
        setTimeout(() => {
            if (therapyModalBody) therapyModalBody.innerHTML = '';
        }, 500);
    };

    qsa('.service-card[data-therapy]').forEach(card => {
        card.addEventListener('click', (e) => {
            // Don't trigger if user clicked on a link/button inside
            if (e.target.closest('a, button')) return;
            openTherapyModal(card);
        });
    });

    if (therapyModal) {
        therapyModal.addEventListener('click', (e) => {
            if (e.target.closest('[data-close]')) closeTherapyModal();
        });
    }

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && therapyModal?.getAttribute('aria-hidden') === 'false') {
            closeTherapyModal();
        }
    });

    /* -----------------------------------------------------
       Journey carousel — auto-play + dots
       ----------------------------------------------------- */
    qsa('[data-carousel]').forEach((root, idx) => {
        const imgs = Array.from(root.querySelectorAll('img'));
        const dots = Array.from(root.querySelectorAll('.journey-dot'));
        if (imgs.length < 2) return;

        let current = 0;
        let timer = null;
        const INTERVAL = 4200;

        const go = (next) => {
            if (next === current) return;
            imgs[current]?.classList.remove('active');
            dots[current]?.classList.remove('active');
            current = (next + imgs.length) % imgs.length;
            imgs[current]?.classList.add('active');
            dots[current]?.classList.add('active');
        };

        const play = () => {
            stop();
            timer = setInterval(() => go(current + 1), INTERVAL);
        };
        const stop = () => { if (timer) { clearInterval(timer); timer = null; } };

        dots.forEach((dot, i) => {
            dot.addEventListener('click', () => { go(i); play(); });
        });

        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', play);

        // Stagger start so cards don't pulse in sync
        setTimeout(play, idx * 900);
    });

})();

// Tandai bahwa JavaScript aktif (dipakai CSS untuk animasi scroll reveal).
// Dijalankan paling awal, sebelum halaman tampil, agar tidak ada kedipan konten.
document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    // ==================================
    // GANTI NOMOR WHATSAPP RESTORAN DI SINI
    // Format: kode negara tanpa "+" dan tanpa 0 di depan
    // ==================================
    const whatsappNumber = "628123456789";

    // ==================================
    // PENGATURAN LAINNYA
    // ==================================
    const CONFIG = {
        restaurantName: "Dapur Sekar",
        // Zona waktu restoran, dipakai untuk status "Open Now"
        // (WITA = Asia/Makassar, WIB = Asia/Jakarta, WIT = Asia/Jayapura)
        timeZone: "Asia/Makassar",
        lastBookingBeforeClose: 60, // menit sebelum tutup
        maxDaysAhead: 60            // reservasi maksimal berapa hari ke depan
    };

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Membuat link WhatsApp dengan pesan otomatis
    function waLink(message) {
        return 'https://wa.me/' + whatsappNumber + '?text=' + encodeURIComponent(message);
    }

    // ==========================================
    // WHATSAPP ORDER
    // Semua elemen .js-wa diberi link WhatsApp.
    // data-order   = nama menu (pesan dibuat otomatis)
    // data-message = pesan lengkap
    // ==========================================
    function initWhatsAppLinks() {
        document.querySelectorAll('.js-wa').forEach((link) => {
            const dish = link.dataset.order;
            const message = dish
                ? 'Halo ' + CONFIG.restaurantName + ', saya ingin memesan ' + dish + '.'
                : (link.dataset.message || 'Halo ' + CONFIG.restaurantName + '!');
            link.href = waLink(message);
        });
    }

    // ==========================================
    // FLOATING WHATSAPP
    // Disembunyikan saat berada di hero dan footer
    // agar tidak menutupi tombol lain
    // ==========================================
    function initFloatingWhatsApp() {
        const button = document.getElementById('waFloat');
        const hero = document.getElementById('home');
        const footer = document.querySelector('.footer');
        if (!button || !('IntersectionObserver' in window)) return;

        const state = { hero: true, footer: false };
        const update = () => button.classList.toggle('is-hidden', state.hero || state.footer);

        new IntersectionObserver(([entry]) => { state.hero = entry.isIntersecting; update(); }, { threshold: 0.35 }).observe(hero);
        new IntersectionObserver(([entry]) => { state.footer = entry.isIntersecting; update(); }).observe(footer);
        update();
    }

    // ==========================================
    // HEADER
    // Navbar jadi solid saat halaman di-scroll
    // ==========================================
    function initHeader() {
        const header = document.getElementById('header');
        const menu = document.getElementById('navMenu');
        let ticking = false;

        const update = () => {
            const menuOpen = menu.classList.contains('is-open');
            header.classList.toggle('is-solid', window.scrollY > 40 || menuOpen);
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) { requestAnimationFrame(update); ticking = true; }
        }, { passive: true });

        document.addEventListener('menutoggle', update);
        update();
    }

    // ==========================================
    // MOBILE MENU
    // Membuka dan menutup menu pada mobile
    // ==========================================
    function initMobileMenu() {
        const toggle = document.getElementById('hamburger');
        const menu = document.getElementById('navMenu');

        const setOpen = (open) => {
            menu.classList.toggle('is-open', open);
            toggle.classList.toggle('is-open', open);
            toggle.setAttribute('aria-expanded', String(open));
            toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
            document.dispatchEvent(new Event('menutoggle'));
        };

        toggle.addEventListener('click', () => setOpen(!menu.classList.contains('is-open')));
        menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setOpen(false)));

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && menu.classList.contains('is-open')) { setOpen(false); toggle.focus(); }
        });
        document.addEventListener('click', (e) => {
            if (menu.classList.contains('is-open') && !menu.contains(e.target) && !toggle.contains(e.target)) setOpen(false);
        });
        window.addEventListener('resize', () => { if (window.innerWidth > 1024) setOpen(false); });
    }

    // ==========================================
    // SMOOTH SCROLLING
    // Scroll halus ke section saat link diklik
    // ==========================================
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach((link) => {
            link.addEventListener('click', (e) => {
                const hash = link.getAttribute('href');
                if (hash.length < 2) return;
                const target = document.querySelector(hash);
                if (!target) return;
                e.preventDefault();
                target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
                history.pushState(null, '', hash);
                if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
                target.focus({ preventScroll: true });
            });
        });
    }

    // ==========================================
    // ACTIVE NAV LINK
    // Menandai menu sesuai section yang sedang dilihat
    // ==========================================
    function initActiveLink() {
        const links = document.querySelectorAll('.nav__link');
        if (!('IntersectionObserver' in window)) return;
        const map = { home: 'home', about: 'about', menu: 'menu', 'best-seller': 'menu', gallery: 'gallery', reviews: 'gallery', hours: 'contact', location: 'contact', contact: 'contact' };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const active = map[entry.target.id];
                links.forEach((link) => {
                    const on = link.getAttribute('href') === '#' + active;
                    link.classList.toggle('is-active', on);
                    if (on) link.setAttribute('aria-current', 'true'); else link.removeAttribute('aria-current');
                });
            });
        }, { rootMargin: '-45% 0px -50% 0px' });

        Object.keys(map).forEach((id) => { const el = document.getElementById(id); if (el) observer.observe(el); });
    }

    // ==========================================
    // SCROLL REVEAL
    // Menampilkan elemen .reveal saat masuk layar
    // ==========================================
    function initReveal() {
        const items = document.querySelectorAll('.reveal');
        if (!('IntersectionObserver' in window) || prefersReducedMotion) {
            items.forEach((el) => el.classList.add('is-visible'));
            return;
        }
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) { entry.target.classList.add('is-visible'); obs.unobserve(entry.target); }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        items.forEach((el) => observer.observe(el));
    }

    // ==========================================
    // ABOUT: LEARN MORE
    // Membuka/menutup cerita lengkap restoran
    // ==========================================
    function initStoryToggle() {
        const button = document.getElementById('storyToggle');
        const more = document.getElementById('storyMore');
        if (!button || !more) return;
        const label = button.querySelector('.story-toggle__label');

        button.addEventListener('click', () => {
            const open = more.hidden;
            more.hidden = !open;
            button.setAttribute('aria-expanded', String(open));
            label.textContent = open ? 'Show Less' : 'Learn More';
        });
    }

    // ==========================================
    // MENU CATEGORY FILTER
    // Menampilkan kartu menu sesuai kategori
    // ==========================================
    function initMenuFilter() {
        const buttons = document.querySelectorAll('[data-filter]');
        const cards = document.querySelectorAll('.menu-card');
        const count = document.getElementById('menuCount');

        const applyFilter = (filter, label) => {
            let shown = 0;
            cards.forEach((card) => {
                const match = filter === 'all' || card.dataset.category === filter;
                card.hidden = !match;
                card.classList.remove('is-entering');
                if (match) {
                    shown++;
                    void card.offsetWidth; // restart animasi
                    card.classList.add('is-entering');
                }
            });
            const noun = shown === 1 ? 'dish' : 'dishes';
            count.textContent = filter === 'all'
                ? 'Showing all ' + shown + ' ' + noun
                : 'Showing ' + shown + ' ' + noun + ' in ' + label;
        };

        buttons.forEach((btn) => {
            btn.addEventListener('click', () => {
                buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
                applyFilter(btn.dataset.filter, btn.textContent.trim());
            });
        });
    }

    // ==========================================
    // MODAL HELPER
    // Dipakai oleh lightbox & modal reservasi.
    // Tutup dengan tombol X, klik di luar, atau Escape.
    // ==========================================
    function createModal(modal, options = {}) {
        let lastFocus = null;
        let closeTimer = null;
        const focusableSelector = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

        const onKeydown = (e) => {
            if (e.key === 'Escape') { close(); return; }
            if (options.onKeydown) options.onKeydown(e);
            if (e.key === 'Tab') {
                const items = Array.from(modal.querySelectorAll(focusableSelector)).filter((el) => el.offsetParent !== null);
                if (!items.length) return;
                const first = items[0];
                const last = items[items.length - 1];
                if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
                else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
            }
        };

        function open() {
            clearTimeout(closeTimer);
            lastFocus = document.activeElement;
            modal.hidden = false;
            requestAnimationFrame(() => modal.classList.add('is-open'));
            document.body.classList.add('no-scroll');
            document.addEventListener('keydown', onKeydown);
            const first = modal.querySelector('[data-autofocus]') || modal.querySelector(focusableSelector);
            if (first) first.focus();
        }

        function close() {
            modal.classList.remove('is-open');
            document.body.classList.remove('no-scroll');
            document.removeEventListener('keydown', onKeydown);
            closeTimer = setTimeout(() => { modal.hidden = true; }, prefersReducedMotion ? 0 : 250);
            if (lastFocus) lastFocus.focus();
        }

        modal.addEventListener('click', (e) => {
            // Klik di area gelap (bukan konten) menutup modal
            if (e.target === modal || e.target.closest('[data-close]')) close();
        });

        return { open, close };
    }

    // ==========================================
    // IMAGE LIGHTBOX
    // Membuka foto gallery dalam ukuran besar,
    // dengan tombol sebelumnya/berikutnya
    // ==========================================
    function initLightbox() {
        const lightbox = document.getElementById('lightbox');
        const items = Array.from(document.querySelectorAll('.gallery__item'));
        const img = document.getElementById('lbImg');
        const caption = document.getElementById('lbCaption');
        const counter = document.getElementById('lbCounter');
        let index = 0;

        const show = (i) => {
            index = (i + items.length) % items.length;
            const item = items[index];
            img.src = item.dataset.full;
            img.alt = item.querySelector('img').alt;
            caption.textContent = item.dataset.caption;
            counter.textContent = (index + 1) + ' / ' + items.length;
        };

        const modal = createModal(lightbox, {
            onKeydown: (e) => {
                if (e.key === 'ArrowRight') show(index + 1);
                if (e.key === 'ArrowLeft') show(index - 1);
            }
        });

        items.forEach((item, i) => item.addEventListener('click', () => { show(i); modal.open(); }));
        document.getElementById('lbPrev').addEventListener('click', () => show(index - 1));
        document.getElementById('lbNext').addEventListener('click', () => show(index + 1));
    }

    // ==========================================
    // TESTIMONIAL SLIDER
    // Geser review dengan tombol atau swipe
    // ==========================================
    function initTestimonialSlider() {
        const track = document.getElementById('tTrack');
        const prev = document.getElementById('tPrev');
        const next = document.getElementById('tNext');
        const progress = document.getElementById('tProgress');
        const cards = track.querySelectorAll('.t-card');

        const cardStep = () => {
            const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
            return cards[0].getBoundingClientRect().width + gap;
        };

        const update = () => {
            const maxScroll = track.scrollWidth - track.clientWidth - 2;
            prev.disabled = track.scrollLeft <= 2;
            next.disabled = track.scrollLeft >= maxScroll;
            const first = Math.round(track.scrollLeft / cardStep()) + 1;
            const visible = Math.max(1, Math.round(track.clientWidth / cardStep()));
            const last = Math.min(cards.length, first + visible - 1);
            progress.textContent = first === last
                ? 'Review ' + first + ' of ' + cards.length
                : 'Reviews ' + first + '–' + last + ' of ' + cards.length;
        };

        prev.addEventListener('click', () => track.scrollBy({ left: -cardStep(), behavior: prefersReducedMotion ? 'auto' : 'smooth' }));
        next.addEventListener('click', () => track.scrollBy({ left: cardStep(), behavior: prefersReducedMotion ? 'auto' : 'smooth' }));
        track.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') { e.preventDefault(); next.click(); }
            if (e.key === 'ArrowLeft') { e.preventDefault(); prev.click(); }
        });

        let t;
        track.addEventListener('scroll', () => { clearTimeout(t); t = setTimeout(update, 80); }, { passive: true });
        window.addEventListener('resize', update);
        update();
    }

    // ==========================================
    // OPENING STATUS
    // Menghitung "Open Now" / "Closed" dari tabel jam buka,
    // memakai zona waktu restoran
    // ==========================================
    const toMinutes = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };

    function getSchedule() {
        const schedule = {};
        document.querySelectorAll('#hoursTable tr[data-day]').forEach((row) => {
            schedule[row.dataset.day] = row.dataset.closed === 'true'
                ? null
                : { open: row.dataset.open, close: row.dataset.close, row };
        });
        return schedule;
    }

    function restaurantNow() {
        const parts = new Intl.DateTimeFormat('en-US', {
            timeZone: CONFIG.timeZone, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
        }).formatToParts(new Date());
        const get = (type) => parts.find((p) => p.type === type).value;
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return { day: days.indexOf(get('weekday')), minutes: Number(get('hour')) * 60 + Number(get('minute')) };
    }

    function initOpeningStatus() {
        const schedule = getSchedule();
        const targets = document.querySelectorAll('[data-status]');

        const update = () => {
            const now = restaurantNow();
            const today = schedule[now.day];

            // Tandai hari ini di tabel
            Object.values(schedule).forEach((s) => {
                if (!s) return;
                s.row.classList.remove('is-today');
                const label = s.row.querySelector('.today-label');
                if (label) label.remove();
            });
            if (today) {
                today.row.classList.add('is-today');
                today.row.querySelector('th').insertAdjacentHTML('beforeend', '<span class="today-label">Today</span>');
            }

            let open = false;
            let short = '';
            let full = '';

            if (today && now.minutes >= toMinutes(today.open) && now.minutes < toMinutes(today.close)) {
                open = true;
                short = 'Open now · until ' + today.close;
                full = 'Open Now · closes at ' + today.close;
            } else if (today && now.minutes < toMinutes(today.open)) {
                short = 'Closed · opens today at ' + today.open;
                full = short;
            } else {
                // Cari hari buka berikutnya
                for (let i = 1; i <= 7; i++) {
                    const next = schedule[(now.day + i) % 7];
                    if (next) {
                        const dayName = i === 1 ? 'tomorrow' : next.row.querySelector('th').firstChild.textContent;
                        short = 'Closed · opens ' + dayName + ' at ' + next.open;
                        full = short;
                        break;
                    }
                }
            }

            targets.forEach((el) => {
                el.classList.toggle('is-open', open);
                el.classList.toggle('is-closed', !open);
                el.querySelector('.status-text').textContent = el.dataset.status === 'full' ? full : short;
            });
        };

        update();
        setInterval(update, 60 * 1000);
    }

    // ==========================================
    // RESERVATION FORM VALIDATION
    // Validasi form, lalu tampilkan modal konfirmasi
    // (tidak mengirim data ke server)
    // ==========================================
    function initReservation() {
        const form = document.getElementById('reserveForm');
        const modalEl = document.getElementById('reserveModal');
        const summary = document.getElementById('reserveSummary');
        const waButton = document.getElementById('reserveWa');
        const modal = createModal(modalEl);
        const schedule = getSchedule();

        const fields = {
            name: form.elements.name,
            phone: form.elements.phone,
            date: form.elements.date,
            time: form.elements.time,
            guests: form.elements.guests,
            message: form.elements.message
        };

        // Batas tanggal: hari ini sampai maxDaysAhead
        const pad = (n) => String(n).padStart(2, '0');
        const isoDate = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
        const today = new Date();
        const maxDate = new Date(); maxDate.setDate(today.getDate() + CONFIG.maxDaysAhead);
        fields.date.min = isoDate(today);
        fields.date.max = isoDate(maxDate);

        const setError = (input, message) => {
            const error = document.getElementById(input.id + 'Error');
            error.textContent = message;
            input.setAttribute('aria-invalid', message ? 'true' : 'false');
            return !message;
        };

        const validators = {
            name: (v) => {
                if (!v.trim()) return 'Please enter your name.';
                if (v.trim().length < 2) return 'Name looks too short.';
                return '';
            },
            phone: (v) => {
                const clean = v.replace(/[\s-]/g, '');
                if (!clean) return 'Please enter a phone or WhatsApp number.';
                if (!/^(\+62|62|0)8\d{7,11}$/.test(clean)) return 'Use an Indonesian mobile number, e.g. 0812 3456 7890.';
                return '';
            },
            date: (v) => {
                if (!v) return 'Please choose a date.';
                if (v < fields.date.min) return 'Please choose today or a later date.';
                if (v > fields.date.max) return 'We take bookings up to ' + CONFIG.maxDaysAhead + ' days ahead.';
                const day = new Date(v + 'T00:00:00').getDay();
                if (!schedule[day]) return 'We are closed on that day.';
                return '';
            },
            time: (v) => {
                if (!v) return 'Please choose a time.';
                const dateValue = fields.date.value;
                if (!dateValue) return '';
                const hours = schedule[new Date(dateValue + 'T00:00:00').getDay()];
                if (!hours) return '';
                const t = toMinutes(v);
                const lastSlot = toMinutes(hours.close) - CONFIG.lastBookingBeforeClose;
                if (t < toMinutes(hours.open) || t > lastSlot) {
                    const h = Math.floor(lastSlot / 60), m = lastSlot % 60;
                    return 'On that day we take bookings from ' + hours.open + ' to ' + pad(h) + ':' + pad(m) + '.';
                }
                if (dateValue === isoDate(new Date())) {
                    const now = new Date();
                    if (t <= now.getHours() * 60 + now.getMinutes()) return 'That time has already passed today.';
                }
                return '';
            },
            guests: (v) => (v ? '' : 'Please choose the number of guests.'),
            message: (v) => (v.length > 300 ? 'Please keep the message under 300 characters.' : '')
        };

        const validateField = (key) => setError(fields[key], validators[key](fields[key].value));

        // Validasi ulang saat user memperbaiki isian
        Object.keys(fields).forEach((key) => {
            const input = fields[key];
            const event = input.tagName === 'SELECT' || input.type === 'date' || input.type === 'time' ? 'change' : 'blur';
            input.addEventListener(event, () => {
                validateField(key);
                if (key === 'date' && fields.time.value) validateField('time');
            });
            input.addEventListener('input', () => {
                if (input.getAttribute('aria-invalid') === 'true') validateField(key);
            });
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const results = Object.keys(fields).map(validateField);
            const firstInvalid = form.querySelector('[aria-invalid="true"]');
            if (results.includes(false)) { if (firstInvalid) firstInvalid.focus(); return; }

            const data = {
                name: fields.name.value.trim(),
                phone: fields.phone.value.trim(),
                date: new Date(fields.date.value + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }),
                time: fields.time.value,
                guests: fields.guests.value,
                message: fields.message.value.trim()
            };

            // Ringkasan reservasi di modal
            const rows = [['Name', data.name], ['Date', data.date], ['Time', data.time], ['Guests', data.guests]];
            summary.innerHTML = '';
            rows.forEach(([label, value]) => {
                const row = document.createElement('div');
                const dt = document.createElement('dt'); dt.textContent = label;
                const dd = document.createElement('dd'); dd.textContent = value;
                row.append(dt, dd);
                summary.appendChild(row);
            });

            // Pesan WhatsApp berisi detail reservasi
            const message = [
                'Halo ' + CONFIG.restaurantName + ', saya ingin reservasi meja.',
                'Nama: ' + data.name,
                'No. HP: ' + data.phone,
                'Tanggal: ' + data.date,
                'Jam: ' + data.time,
                'Jumlah tamu: ' + data.guests,
                data.message ? 'Catatan: ' + data.message : ''
            ].filter(Boolean).join('\n');
            waButton.href = waLink(message);

            modal.open();
            form.reset();
            Object.values(fields).forEach((input) => input.removeAttribute('aria-invalid'));
        });
    }

    // ==========================================
    // TAHUN OTOMATIS DI FOOTER
    // ==========================================
    function initYear() {
        const el = document.getElementById('year');
        if (el) el.textContent = new Date().getFullYear();
    }

    // Jalankan semua fitur
    initWhatsAppLinks();
    initFloatingWhatsApp();
    initHeader();
    initMobileMenu();
    initSmoothScroll();
    initActiveLink();
    initReveal();
    initStoryToggle();
    initMenuFilter();
    initLightbox();
    initTestimonialSlider();
    initOpeningStatus();
    initReservation();
    initYear();
});

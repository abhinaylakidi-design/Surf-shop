document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    const root = document.documentElement;

    const themeToggle = document.getElementById("themeToggle");
    const directionToggle = document.getElementById("directionToggle");
    const mobileToggle = document.getElementById("mobileToggle");
    const mainNav = document.getElementById("mainNav");

    const dropdownButton = document.getElementById("homeDropdownButton");
    const dropdown = dropdownButton?.closest(".nav-dropdown");

    // Matches the mobile navigation breakpoint in home.css.
    const desktopMedia = window.matchMedia("(min-width: 1251px)");

    function refreshIcons() {
        window.lucide?.createIcons();
    }

    function readPreference(key, fallback) {
        try {
            return localStorage.getItem(key) || fallback;
        } catch {
            return fallback;
        }
    }

    function savePreference(key, value) {
        try {
            localStorage.setItem(key, value);
        } catch {
            // Controls continue working when storage is unavailable.
        }
    }

    /* THEME */

    function setTheme(theme) {
        const selectedTheme = theme === "dark" ? "dark" : "light";

        root.setAttribute("data-theme", selectedTheme);
        savePreference("wavecraft-theme", selectedTheme);

        if (themeToggle) {
            const isDark = selectedTheme === "dark";
            const label = isDark
                ? "Switch to light mode"
                : "Switch to dark mode";

            themeToggle.innerHTML = isDark
                ? '<i data-lucide="sun" aria-hidden="true"></i>'
                : '<i data-lucide="moon" aria-hidden="true"></i>';

            themeToggle.setAttribute("aria-label", label);
            themeToggle.title = label;
        }

        refreshIcons();
    }

    setTheme(readPreference("wavecraft-theme", "light"));

    themeToggle?.addEventListener("click", () => {
        setTheme(
            root.getAttribute("data-theme") === "dark"
                ? "light"
                : "dark"
        );
    });

    /* TEXT DIRECTION */

    function setDirection(direction) {
        const selectedDirection = direction === "rtl" ? "rtl" : "ltr";

        root.setAttribute("dir", selectedDirection);
        savePreference("wavecraft-direction", selectedDirection);

        if (directionToggle) {
            const isRTL = selectedDirection === "rtl";

            directionToggle.textContent = isRTL ? "LTR" : "RTL";

            const label = isRTL
                ? "Switch to left-to-right"
                : "Switch to right-to-left";

            directionToggle.setAttribute("aria-label", label);
            directionToggle.title = label;
        }
    }

    setDirection(readPreference("wavecraft-direction", "ltr"));

    directionToggle?.addEventListener("click", () => {
        setDirection(root.getAttribute("dir") === "rtl" ? "ltr" : "rtl");
    });

    /* ACTIVE NAVIGATION */

    const currentPage =
        window.location.pathname.split("/").pop()?.toLowerCase() ||
        "home.html";

    document
        .querySelectorAll(".main-nav .nav-link, .dropdown-menu a")
        .forEach((link) => {
            const href = link.getAttribute("href");
            if (!href) return;

            const page = href
                .split("/")
                .pop()
                .split("?")[0]
                .split("#")[0]
                .toLowerCase();

            if (page === currentPage) {
                link.classList.add("active");
                link.setAttribute("aria-current", "page");

                if (link.closest(".dropdown-menu")) {
                    dropdownButton?.classList.add("active");
                }
            }
        });

    /* HOME DROPDOWN */

    function closeDropdown() {
        dropdown?.classList.remove("open");
        dropdownButton?.setAttribute("aria-expanded", "false");
    }

    dropdownButton?.addEventListener("click", () => {
        if (!dropdown) return;

        const isOpen = dropdown.classList.toggle("open");
        dropdownButton.setAttribute("aria-expanded", String(isOpen));
    });

    /* MOBILE NAVIGATION */

    function setMobileMenu(isOpen) {
        if (!mainNav) return;

        mainNav.classList.toggle("open", isOpen);

        if (mobileToggle) {
            mobileToggle.setAttribute("aria-expanded", String(isOpen));

            const label = isOpen ? "Close navigation" : "Open navigation";

            mobileToggle.setAttribute("aria-label", label);
            mobileToggle.title = label;

            mobileToggle.innerHTML = isOpen
                ? '<i data-lucide="x" aria-hidden="true"></i>'
                : '<i data-lucide="menu" aria-hidden="true"></i>';

            refreshIcons();
        }

        if (!isOpen) {
            closeDropdown();
        }
    }

    mobileToggle?.addEventListener("click", () => {
        setMobileMenu(!mainNav?.classList.contains("open"));
    });

    mainNav?.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            setMobileMenu(false);
            closeDropdown();
        });
    });

    document.addEventListener("click", (event) => {
        if (dropdown && !dropdown.contains(event.target)) {
            closeDropdown();
        }

        if (
            !desktopMedia.matches &&
            mainNav?.classList.contains("open") &&
            !mainNav.contains(event.target) &&
            !mobileToggle?.contains(event.target)
        ) {
            setMobileMenu(false);
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") return;

        const menuWasOpen = mainNav?.classList.contains("open");
        const dropdownWasOpen = dropdown?.classList.contains("open");

        closeDropdown();
        setMobileMenu(false);

        if (menuWasOpen) {
            mobileToggle?.focus();
        } else if (dropdownWasOpen) {
            dropdownButton?.focus();
        }
    });

    mainNav?.addEventListener("focusout", (event) => {
        const nextTarget = event.relatedTarget;

        if (
            nextTarget &&
            !mainNav.contains(nextTarget) &&
            nextTarget !== mobileToggle
        ) {
            closeDropdown();

            if (!desktopMedia.matches) {
                setMobileMenu(false);
            }
        }
    });

    desktopMedia.addEventListener("change", () => {
        closeDropdown();
        setMobileMenu(false);
    });

    /* FOOTER YEAR */

    const footerYear = document.getElementById("footerYear");

    if (footerYear) {
        footerYear.textContent = new Date().getFullYear();
    }

    /* IMAGE FALLBACKS */

    document.querySelectorAll("img[data-fallback]").forEach((image) => {
        function useFallback() {
            if (image.dataset.fallbackUsed === "true") return;

            const fallback = image.dataset.fallback;
            if (!fallback) return;

            image.dataset.fallbackUsed = "true";
            image.src = fallback;
        }

        image.addEventListener("error", useFallback);

        if (image.complete && image.naturalWidth === 0) {
            useFallback();
        }
    });

    /* Progressive enhancement: content remains visible if JS is unavailable. */
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const revealTargets = document.querySelectorAll(
        ".section-header, .about-visual, .about-content, .board-row, " +
        ".rental-intro, .rental-panel, .lessons-visual, .lessons-content, " +
        ".surf-style-card, .final-cta-card"
    );
    let revealObserver;
    function configureMotion() {
        revealObserver?.disconnect();
        revealTargets.forEach((element) => element.classList.remove("reveal-in"));
        if (motionPreference.matches || !("IntersectionObserver" in window)) return;
        revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("reveal-in");
                revealObserver.unobserve(entry.target);
            });
        }, { threshold: 0.08 });
        revealTargets.forEach((element) => revealObserver.observe(element));
    }
    configureMotion();
    motionPreference.addEventListener("change", configureMotion);

    refreshIcons();
});
const SHOP_PRODUCTS = [{ "name": "Ocean Runner", "price": 749, "type": "Shortboards", "size": "5′10″", "description": "Sharp turns. Clean lines.", "color": "#ef927c" }, { "name": "Tide Explorer", "price": 849, "type": "Longboards", "size": "9′2″", "description": "Timeless glide and easy flow.", "color": "#d8b77c" }, { "name": "Coastal Cruiser", "price": 629, "type": "Funboards", "size": "7′2″", "description": "A smooth everyday ride.", "color": "#70aaa4" }, { "name": "Reef Drifter", "price": 589, "type": "Fish Boards", "size": "5′6″", "description": "Speed for smaller waves.", "color": "#93a5ca" }, { "name": "First Light", "price": 399, "type": "Soft Tops", "size": "8′0″", "description": "A forgiving first-wave favourite.", "color": "#eacb75" }, { "name": "Wave Seeker", "price": 699, "type": "Hybrids", "size": "6′4″", "description": "One shape. More possibilities.", "color": "#c1a9bd" }, { "name": "Reef Rocket", "price": 779, "type": "Shortboards", "size": "6′0″", "description": "Drive through your next turn.", "color": "#ef927c" }, { "name": "Sunday Glide", "price": 899, "type": "Longboards", "size": "9′6″", "description": "Take the scenic line.", "color": "#d8b77c" }, null, null, null, null, { "name": "All-Day Leash", "price": 32, "type": "Accessories", "description": "Stay connected." }, { "name": "Explorer Board Bag", "price": 89, "type": "Accessories", "description": "Protect your favourite shape." }, { "name": "Flow Fin Set", "price": 65, "type": "Accessories", "description": "Fine-tune your feel." }, { "name": "Grip Traction Pad", "price": 38, "type": "Accessories", "description": "Find your footing." }, { "name": "Session Surf Wax", "price": 8, "type": "Accessories", "description": "A little extra hold." }, { "name": "Coastal Change Poncho", "price": 59, "type": "Accessories", "description": "Comfort after the last wave." }];
document.addEventListener('DOMContentLoaded', () => {
    'use strict';
    const $ = (s) => document.querySelector(s);
    const cards = [...document.querySelectorAll('.product-card')];
    let filter = 'all';
    function updateCatalog() {
        let count = 0;
        cards.forEach(card => { card.hidden = filter !== 'all' && card.dataset.type !== filter; if (!card.hidden) count++; });
        document.querySelectorAll('[data-filter]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === filter)));
        $('#resultCount').textContent = `${count} board${count === 1 ? '' : 's'} to explore`;
        const sort = $('#sortBoards').value;
        [...cards].sort((a, b) => sort === 'low' ? +a.dataset.price - +b.dataset.price : sort === 'high' ? +b.dataset.price - +a.dataset.price : sort === 'name' ? a.dataset.name.localeCompare(b.dataset.name) : cards.indexOf(a) - cards.indexOf(b)).forEach(card => $('#productGrid').append(card));
    }
    document.querySelectorAll('[data-filter], [data-category]').forEach(el => el.addEventListener('click', () => { filter = el.dataset.filter || el.dataset.category; updateCatalog(); }));
    $('#sortBoards').addEventListener('change', updateCatalog);
    let bag = {};
    try { const saved = JSON.parse(localStorage.getItem('wavecraft-shop-bag') || '{}'); if (saved && typeof saved === 'object') Object.entries(saved).forEach(([id, qty]) => { if (SHOP_PRODUCTS[id] && Number.isInteger(qty) && qty > 0 && qty <= 99) bag[id] = qty; }); } catch { }
    const money = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
    function saveBag() { try { localStorage.setItem('wavecraft-shop-bag', JSON.stringify(bag)); } catch { } renderBag(); }
    function renderBag() {
        $('#bagCount').textContent = Object.values(bag).reduce((a, b) => a + b, 0);
        $('#bagTotal').textContent = money(Object.entries(bag).reduce((sum, [id, qty]) => sum + SHOP_PRODUCTS[id].price * qty, 0));
        $('#bagItems').innerHTML = Object.entries(bag).map(([id, qty]) => `<div class="bag-row"><div><strong>${SHOP_PRODUCTS[id].name}</strong><small>${money(SHOP_PRODUCTS[id].price)} each</small></div><div class="bag-quantity"><button data-change="${id}" data-delta="-1" aria-label="Remove one ${SHOP_PRODUCTS[id].name}">−</button><span>${qty}</span><button data-change="${id}" data-delta="1" aria-label="Add one ${SHOP_PRODUCTS[id].name}">+</button></div></div>`).join('') || '<p style="padding-block:24px">Your bag is ready for its first adventure.</p>';
    }
    let toastTimer;
    function add(id) { if (!SHOP_PRODUCTS[id]) return; bag[id] = Math.min(99, (bag[id] || 0) + 1); saveBag(); $('#shopToast').textContent = `${SHOP_PRODUCTS[id].name} added to your bag`; $('#shopToast').classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#shopToast').classList.remove('visible'), 2800); }
    document.addEventListener('click', event => {
        const addButton = event.target.closest('[data-add]'); if (addButton) add(addButton.dataset.add);
        const quantity = event.target.closest('[data-change]'); if (quantity) { const id = quantity.dataset.change; bag[id] = Math.min(99, (bag[id] || 0) + Number(quantity.dataset.delta)); if (bag[id] <= 0) delete bag[id]; saveBag(); }
        const view = event.target.closest('[data-view]'); if (view) { const id = Number(view.dataset.view), p = SHOP_PRODUCTS[id]; $('#productDetail').innerHTML = `<div class="board-art" style="--board-color:${p.color}" aria-hidden="true"><div class="board-shape"><span>W/C</span></div></div><span class="eyebrow">${p.type} · ${p.size}</span><h2>${p.name}</h2><p>${p.description}</p><p>Ask our crew for sizing and availability before ordering.</p><button class="button" data-add="${id}">Add to bag — ${money(p.price)}</button>`; $('#productDialog').showModal(); }
        const close = event.target.closest('[data-close]'); if (close) close.closest('dialog').close();
    });
    $('#openBag').addEventListener('click', () => $('#bagDialog').showModal());
    document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } }));
    document.querySelectorAll('.brand-logo').forEach(img => { const hide = () => { img.style.display = 'none'; }; img.addEventListener('error', hide); if (img.complete && !img.naturalWidth) hide(); });
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    if (!motion.matches && 'IntersectionObserver' in window) { const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('reveal-in'); observer.unobserve(entry.target); } }), { threshold: .08 }); document.querySelectorAll('.reveal').forEach(el => observer.observe(el)); }
    renderBag();
});

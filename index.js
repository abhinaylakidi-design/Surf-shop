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
        "index.html";

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
            !event.composedPath().includes(mobileToggle)
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
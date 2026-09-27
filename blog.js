/* Standalone blog behavior. Header controls are initialized once below. */
document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    const root = document.documentElement;

    const themeToggle = document.getElementById("themeToggle");
    const directionToggle = document.getElementById("directionToggle");
    const mobileToggle = document.getElementById("mobileToggle");
    const mainNav = document.getElementById("mainNav");

    const dropdownButton = document.getElementById("homeDropdownButton");
    const dropdown = dropdownButton?.closest(".nav-dropdown");

    // Matches the mobile navigation breakpoint in blog.css.
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

/* Journal-only enhancements */
document.addEventListener('DOMContentLoaded', () => {
  'use strict';
  const body = document.body;
  if (!body.classList.contains('journal-page')) return;
  const header = document.querySelector('.site-header');
  let headerHeight = header?.getBoundingClientRect().height || 86;
  function sizeHeader() {
    headerHeight = header?.getBoundingClientRect().height || 86;
    body.style.setProperty('--journal-header-height', `${headerHeight}px`);
    document.documentElement.style.scrollPaddingTop = `${headerHeight}px`;
  }
  sizeHeader();
  if ('ResizeObserver' in window && header) new ResizeObserver(sizeHeader).observe(header);
  else window.addEventListener('resize', sizeHeader, { passive: true });
  document.fonts?.ready.then(sizeHeader);

  const blogLink = document.querySelector('.main-nav a[href="blog.html"]');
  if (blogLink) {
    blogLink.classList.add('active');
    blogLink.setAttribute('aria-current', body.dataset.page === 'story' ? 'location' : 'page');
  }

  const search = document.getElementById('journal-search');
  if (search) {
    const cards = [...document.querySelectorAll('#story-grid .journal-card')];
    const filters = [...document.querySelectorAll('[data-filter]')];
    const count = document.getElementById('journal-results');
    const empty = document.querySelector('.journal-empty');
    let category = 'All Stories';
    function filterStories() {
      const query = search.value.trim().toLocaleLowerCase();
      let visible = 0;
      cards.forEach(card => {
        const matches = (category === 'All Stories' || card.dataset.category === category)
          && card.textContent.toLocaleLowerCase().includes(query);
        card.hidden = !matches;
        if (matches) visible++;
      });
      count.textContent = `${visible} ${visible === 1 ? 'story' : 'stories'}${category !== 'All Stories' ? ` in ${category}` : ''}`;
      empty.hidden = visible !== 0;
      filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === category)));
    }
    search.addEventListener('input', filterStories);
    filters.forEach(button => button.addEventListener('click', () => {
      category = button.dataset.filter;
      filterStories();
    }));
    document.getElementById('clear-filters').addEventListener('click', () => {
      category = 'All Stories'; search.value = ''; filterStories(); search.focus();
    });
    document.querySelector('.journal-tools').hidden = false;
    document.querySelector('.journal-result-row').hidden = false;
    filterStories();
  }

  const article = document.querySelector('.journal-article');
  const progress = document.querySelector('.journal-progress');
  if (article && progress) {
    let scheduled = false;
    function updateProgress() {
      const rect = article.getBoundingClientRect();
      const start = window.scrollY + rect.top - headerHeight;
      const end = window.scrollY + rect.bottom - window.innerHeight;
      const range = Math.max(1, end - start);
      progress.value = Math.max(0, Math.min(100, ((window.scrollY - start) / range) * 100));
      scheduled = false;
    }
    function requestProgress() {
      if (!scheduled) { scheduled = true; requestAnimationFrame(updateProgress); }
    }
    progress.hidden = false;
    window.addEventListener('scroll', requestProgress, { passive: true });
    window.addEventListener('resize', requestProgress, { passive: true });
    if ('ResizeObserver' in window) new ResizeObserver(requestProgress).observe(article);
    updateProgress();
  }

  const shareArea = document.querySelector('.journal-share');
  if (shareArea) {
    const url = new URL(location.href); url.hash = '';
    const status = shareArea.querySelector('.journal-share-status');
    const manual = shareArea.querySelector('.journal-manual-copy');
    const field = manual.querySelector('input');
    const copy = shareArea.querySelector('.journal-copy');
    const native = shareArea.querySelector('.journal-native-share');
    const title = document.querySelector('h1').textContent;
    const email = shareArea.querySelector('.journal-email');
    const local = location.protocol === 'file:' || ['localhost','127.0.0.1'].includes(location.hostname);
    const note = local ? ' This is a local preview address; it will be shareable after the site is hosted.' : '';
    field.value = url.href;
    email.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${title}\n${url.href}${note}`)}`;
    function showManual(message) {
      manual.hidden = false; status.textContent = message + note;
      field.focus(); field.select();
    }
    copy.hidden = false;
    copy.addEventListener('click', async () => {
      try {
        if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(url.href);
        manual.hidden = true;
        status.textContent = 'Link copied.' + note;
      } catch {
        showManual('Automatic copying was unavailable. Select and copy the address below.');
      }
    });
    native.hidden = false;
    native.addEventListener('click', async () => {
      if (local) { showManual('This story is running as a local preview. Copy its address below.'); return; }
      if (!navigator.share) { showManual('Sharing is not supported here. Copy the link or use Email story.'); return; }
      try {
        await navigator.share({ title, url: url.href });
        status.textContent = 'Story sent to your sharing app.';
      } catch (error) {
        if (error.name === 'AbortError') status.textContent = 'Sharing canceled.';
        else showManual('The sharing app could not be opened. Copy the link below instead.');
      }
    });
  }
});

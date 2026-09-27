/* Standalone Wave&Craft booking request page. No booking or payment service is connected. */
(() => {
    "use strict";
    // Contact address from home.js. Verify this address before publishing.
    const SHOP_EMAIL = "hello@wavecraft.com";
    // Indicative sizes and rate, not live inventory. Replace with your rental catalog.
    // Home advertises full-day rentals FROM $59. Each started 24h period is
    // estimated at that rate here; the team must quote actual rates and offers.
    const boards = {
        cruiser: { name: "Coastal Cruiser", type: "Everyday Funboard", size: "7′2″", description: "Easy paddling and a smooth ride across changing conditions.", rate: 59, color: "#00A6A6" },
        runner: { name: "Ocean Runner", type: "Performance Shortboard", size: "6′0″", description: "Fast response for confident turns and clean lines.", rate: 59, color: "#FF694A" },
        explorer: { name: "Tide Explorer", type: "Classic Longboard", size: "9′0″", description: "A timeless shape made for glide, balance, and flow.", rate: 59, color: "#ddbb7a" },
        seeker: { name: "Wave Seeker", type: "Versatile Hybrid", size: "6′8″", description: "One adaptable board for the days you want to try it all.", rate: 59, color: "#69ada0" }
    };
    const $ = id => document.getElementById(id);
    const root = document.documentElement;
    const form = $("bookingForm");
    const dateIds = ["pickupDate", "pickupTime", "returnDate", "returnTime"];
    const money = value => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
    const read = (key, fallback) => { try { return localStorage.getItem(key) || fallback; } catch { return fallback; } };
    const save = (key, value) => { try { localStorage.setItem(key, value); } catch { /* Preferences still work for this visit. */ } };
    function setTheme(value) {
        const dark = value === "dark";
        root.dataset.theme = dark ? "dark" : "light";
        $("themeToggle").innerHTML = dark ? "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><circle cx=\"12\" cy=\"12\" r=\"4\"/><path d=\"M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42\"/></svg>" : "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.463.402.807a6.25 6.25 0 0 0 8.268 8.268c.344-.215.829-.004.803.397\"/></svg>";
        $("themeToggle").setAttribute("aria-label", `Switch to ${dark ? "light" : "dark"} mode`);
        $("themeToggle").title = $("themeToggle").getAttribute("aria-label");
        save("wavecraft-theme", root.dataset.theme);
    }
    function setDirection(value) {
        root.dir = value === "rtl" ? "rtl" : "ltr";
        $("directionToggle").textContent = root.dir === "rtl" ? "LTR" : "RTL";
        $("directionToggle").setAttribute("aria-label", `Switch to ${root.dir === "rtl" ? "left-to-right" : "right-to-left"}`);
        $("directionToggle").title = $("directionToggle").getAttribute("aria-label");
        save("wavecraft-direction", root.dir);
    }
    setTheme(read("wavecraft-theme", "light"));
    setDirection(read("wavecraft-direction", "ltr"));
    $("themeToggle").addEventListener("click", () => setTheme(root.dataset.theme === "dark" ? "light" : "dark"));
    $("directionToggle").addEventListener("click", () => setDirection(root.dir === "rtl" ? "ltr" : "rtl"));
    const logo = $("brandLogo");
    logo.addEventListener("error", () => { logo.hidden = true; });
    if (logo.complete && !logo.naturalWidth) logo.hidden = true;

    // Inline SVG board artwork has no network dependency. A custom photo can be
    // assigned below; if it fails, this embedded illustration is the fallback.
    const originalArtwork = $("boardImage").src;
    $("boardImage").addEventListener("error", () => {
        if ($("boardImage").src !== originalArtwork) $("boardImage").src = originalArtwork;
    });
    function updateBoard() {
        const board = boards[$("board").value];
        $("boardDescription").textContent = board.description;
        $("boardRate").textContent = `From ${money(board.rate)} USD / 24 hours · requested size ${board.size}`;
        $("visualType").textContent = board.type.toUpperCase();
        $("visualName").textContent = board.name;
        $("boardImage").src = originalArtwork.replace(/%2300A6A6/ig, encodeURIComponent(board.color));
        $("boardImage").alt = `Surfboard illustration for ${board.name}; actual equipment may vary`;
        $("summaryBoard").textContent = `${board.name} · ${board.type} · ${board.size}`;
        $("summaryRate").textContent = `${money(board.rate)} USD / 24 hours`;
    }
    function localDate(date) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    }
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone || "device local time";
    $("timeZone").textContent = `Dates and times use your device's time zone (${zone}). Mention a different pickup time zone in your notes.`;
    function parseDate(date, time) {
        if (!date || !time) return null;
        const result = new Date(`${date}T${time}`);
        // Reject invalid dates and local clock times skipped by daylight saving.
        if (!Number.isFinite(result.getTime()) || localDate(result) !== date || `${String(result.getHours()).padStart(2, "0")}:${String(result.getMinutes()).padStart(2, "0")}` !== time) return null;
        return result;
    }
    function durationLabel(minutes) {
        const days = Math.floor(minutes / 1440), hours = Math.floor(minutes % 1440 / 60), mins = minutes % 60;
        return [days && `${days} day${days === 1 ? "" : "s"}`, hours && `${hours} hr${hours === 1 ? "" : "s"}`, mins && `${mins} min`].filter(Boolean).join(" ");
    }
    function displayDate(date) { return date ? date.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }) : "Not selected"; }
    function updateDates() {
        const now = new Date();
        $("pickupDate").min = localDate(now);
        $("returnDate").min = $("pickupDate").value || localDate(now);
        dateIds.forEach(id => { $(id).setCustomValidity(""); $(id).removeAttribute("aria-invalid"); });
        const pickup = parseDate($("pickupDate").value, $("pickupTime").value);
        const end = parseDate($("returnDate").value, $("returnTime").value);
        let error = "", errorId = "returnTime";
        if ($("pickupDate").value && $("pickupTime").value && !pickup) { error = "Choose a valid pickup date and time."; errorId = "pickupTime"; }
        else if (pickup && pickup <= now) { error = "Pickup must be in the future."; errorId = "pickupDate"; }
        else if ($("returnDate").value && $("returnTime").value && !end) error = "Choose a valid return date and time.";
        else if (pickup && end && end <= pickup) error = "Return must be later than pickup.";
        if (error) { $(errorId).setCustomValidity(error); $(errorId).setAttribute("aria-invalid", "true"); }
        $("dateError").textContent = error;
        $("summaryPickup").textContent = displayDate(pickup);
        $("summaryReturn").textContent = displayDate(end);
        const valid = pickup && end && !error;
        const minutes = valid ? Math.round((end - pickup) / 60000) : 0;
        const periods = valid ? Math.ceil(minutes / 1440) : 0;
        const total = periods * boards[$("board").value].rate;
        $("duration").textContent = valid ? durationLabel(minutes) : error ? "Check your dates and times" : "Choose your dates and times";
        $("summaryDuration").textContent = valid ? durationLabel(minutes) : "—";
        $("summaryPeriods").textContent = valid ? `${periods} × 24 hours` : "—";
        $("total").textContent = valid ? money(total) : "—";
        return { valid, pickup, end, minutes, periods, total };
    }
    function validateCustomer() {
        $("fullName").setCustomValidity($("fullName").value.trim() ? "" : "Enter your full name.");
        const phone = $("phone").value.trim();
        const digits = phone.replace(/\D/g, "").length;
        $("phone").setCustomValidity(/^[+\d\s().-]+$/.test(phone) && digits >= 7 && digits <= 15 ? "" : "Enter a phone number with 7–15 digits.");
    }
    form.addEventListener("input", event => {
        $("confirmation").hidden = true;
        $("formError").textContent = "";
        if (event.target.id === "board") updateBoard();
        if (event.target.id === "board" || dateIds.includes(event.target.id)) updateDates();
        if (["fullName", "phone"].includes(event.target.id)) validateCustomer();
        event.target.removeAttribute("aria-invalid");
    });
    $("board").addEventListener("change", () => { updateBoard(); updateDates(); });
    form.addEventListener("invalid", event => { event.target.setAttribute("aria-invalid", "true"); }, true);
    form.addEventListener("submit", event => {
        event.preventDefault();
        const rental = updateDates();
        validateCustomer();
        if (!form.reportValidity() || !rental.valid) {
            $("formError").textContent = "Please complete the required fields and correct the highlighted details.";
            return;
        }
        const board = boards[$("board").value];
        const subject = `Board rental request — ${board.name}`;
        const body = ["Hello Wave&Craft,", "", "I'd like to request the following rental:",
            `Board: ${board.name} — ${board.type}, requested size ${board.size}`,
            `Pickup: ${displayDate(rental.pickup)}`, `Return: ${displayDate(rental.end)}`, `Time zone: ${zone}`,
            `Duration: ${durationLabel(rental.minutes)}`, `Starting rate: ${money(board.rate)} USD / 24 hours`,
            `Billable periods: ${rental.periods}`, `Estimated equipment rental: ${money(rental.total)} USD`, "",
            `Name: ${$("fullName").value.trim()}`, `Email: ${$("email").value.trim()}`, `Phone: ${$("phone").value.trim()}`,
            `Notes: ${$("notes").value.trim() || "None"}`, "",
            "Please confirm board and size availability, pickup arrangements, final pricing, taxes, deposits, and applicable offers.",
            "I understand this is a request, not a confirmed booking."
        ].join("\n");
        const href = `mailto:${SHOP_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        $("emailDraft").value = `To: ${SHOP_EMAIL}\nSubject: ${subject}\n\n${body}`;
        $("reopenEmail").href = href;
        $("copyStatus").textContent = "";
        $("confirmation").hidden = false;
        $("confirmation").focus();
        window.location.href = href;
    });
    $("copyDraft").addEventListener("click", async () => {
        try { await navigator.clipboard.writeText($("emailDraft").value); $("copyStatus").textContent = "Draft copied. Paste it into your email and send it to our team."; }
        catch { $("emailDraft").focus(); $("emailDraft").select(); $("copyStatus").textContent = "Select and copy the draft above, then paste it into your email."; }
    });
    updateBoard();
    updateDates();
    $("requestButton").disabled = false;
})();

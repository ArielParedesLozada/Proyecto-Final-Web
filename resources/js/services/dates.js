export function parseYMDToUTCDate(ymd) {
    if (!ymd) return null;
    const [y, m, d] = ymd.split("-").map(Number);
    if (!y || !m || !d) return null;
    return new Date(Date.UTC(y, (m || 1) - 1, d || 1));
}

export function parseYMDToLocalDate(ymd) {
    if (!ymd) return null;
    const [y, m, d] = ymd.split("-").map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
}

export function formatYMDToDisplay(ymd, locale = "es-EC") {
    if (!ymd) return "";
    const dt = parseYMDToUTCDate(ymd);
    if (!dt) return "";
    return new Intl.DateTimeFormat(locale, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: "UTC",
    }).format(dt);
}

export function todayLocalYMD() {
    const t = new Date();
    const y = t.getFullYear();
    const m = String(t.getMonth() + 1).padStart(2, "0");
    const d = String(t.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

export function isTodayOrFuture(ymd) {
    if (!ymd) return false;
    const today = todayLocalYMD();
    return ymd >= today;
}

export function dateToYMD(date) {
    if (!date) return "";
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

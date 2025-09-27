export function parseYMDToLocalDate(ymd) {
    if (!ymd) return null;
    const [y, m, d] = ymd.split("-").map(Number);
    return new Date(y, (m || 1) - 1, d || 1); 
}

export function formatYMDToDisplay(ymd, locale = "es-EC") {
    const date = parseYMDToLocalDate(ymd);
    if (!date) return "";
    return date.toLocaleDateString(locale, { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function todayLocalYMD() {
    const t = new Date();
    const y = t.getFullYear();
    const m = String(t.getMonth() + 1).padStart(2, "0");
    const d = String(t.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

export function isTodayOrFuture(ymd) {
    const d = parseYMDToLocalDate(ymd);
    if (!d) return false;
    const today = new Date();
    const localToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    d.setHours(0, 0, 0, 0);
    return d.getTime() >= localToday.getTime();
}

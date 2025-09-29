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

const MONTHS_ES_SHORT = [
    "ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sept", "oct", "nov", "dic"
];
const MONTHS_ES_LONG = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
];

function splitYMD(ymd) {
    if (!ymd || typeof ymd !== "string") return null;
    const m = ymd.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return null;
    const y = +m[1], mm = +m[2], dd = +m[3];
    if (!y || mm < 1 || mm > 12 || dd < 1 || dd > 31) return null;
    return { y, m: mm, d: dd };
}

export function isoToLocalYMD(iso) {
    if (!iso) return "";
    const dt = new Date(iso);            
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const d = String(dt.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

export function formatYMDToDisplay(ymd, _locale = "es-EC") {
    const p = splitYMD(ymd);
    if (!p) return "";
    const dd = String(p.d).padStart(2, "0");
    const mm = String(p.m).padStart(2, "0");
    return `${dd}/${mm}/${p.y}`;
}

export function formatYMDShort(ymd, _locale = "es-EC") {
    const p = splitYMD(ymd);
    if (!p) return "";
    const mon = MONTHS_ES_SHORT[p.m - 1] || "";
    return `${p.d}-${mon}`;
}

export function formatYMDToShort(ymd, _locale = "es-EC") {
    const p = splitYMD(ymd);
    if (!p) return "";
    const mon = MONTHS_ES_SHORT[p.m - 1] || "";
    return `${p.d} ${mon}`;
}

export function formatISOToDisplayUTC(iso, locale = "es-EC") {
    if (!iso) return "";
    const dt = new Date(iso);
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

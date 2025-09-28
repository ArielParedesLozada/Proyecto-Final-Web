// resources/js/services/dates.js

/**
 * Devuelve un Date en UTC para un Y-M-D "puro", sin que se desplace por la zona horaria.
 * Ej: "2025-10-12" -> Date(2025-10-12T00:00:00Z)
 */
export function parseYMDToUTCDate(ymd) {
    if (!ymd) return null;
    const [y, m, d] = ymd.split("-").map(Number);
    if (!y || !m || !d) return null;
    return new Date(Date.UTC(y, (m || 1) - 1, d || 1));
}

/**
 * ⚠️ Mantengo esta por compatibilidad, pero si la usabas para mostrar,
 * cámbiala por formatYMDToDisplay (que ya controla UTC).
 * Esta versión retorna Date LOCAL (puede causar desfase si luego pasas por UTC).
 */
export function parseYMDToLocalDate(ymd) {
    if (!ymd) return null;
    const [y, m, d] = ymd.split("-").map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
}

/**
 * Formatea un Y-M-D de API a "dd/mm/aaaa" (o el locale que pases),
 * usando siempre UTC para evitar corrimientos de día.
 */
export function formatYMDToDisplay(ymd, locale = "es-EC") {
    if (!ymd) return "";
    const dt = parseYMDToUTCDate(ymd);
    if (!dt) return "";
    // Forzamos timeZone: 'UTC' para que NO aplique la zona local y no se mueva el día
    return new Intl.DateTimeFormat(locale, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: "UTC",
    }).format(dt);
}

/**
 * Y-M-D local de hoy, en zona local, sin horas.
 */
export function todayLocalYMD() {
    const t = new Date();
    const y = t.getFullYear();
    const m = String(t.getMonth() + 1).padStart(2, "0");
    const d = String(t.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

/**
 * ¿ymd es hoy o futuro?
 * Comparación de strings YYYY-MM-DD (segura por orden lexicográfico).
 */
export function isTodayOrFuture(ymd) {
    if (!ymd) return false;
    const today = todayLocalYMD();
    return ymd >= today;
}

/**
 * (Opcional) Normaliza un Date local a Y-M-D sin tz.
 * Útil si alguna vez recibes un Date del datepicker (no es tu caso actual,
 * porque ya trabajas con strings YYYY-MM-DD).
 */
export function dateToYMD(date) {
    if (!date) return "";
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

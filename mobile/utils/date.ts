export function formatDateToYMD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseYMDToDate(dateString: string): Date {
  if (!dateString || !dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    throw new Error('Formato de fecha inválido. Debe ser YYYY-MM-DD');
  }
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function formatDateToDisplay(
  dateInput: string | Date,
  locale: string = 'es-ES',
  options?: Intl.DateTimeFormatOptions
): string {
  if (!dateInput) return 'Sin fecha';

  try {
    let date: Date;

    if (typeof dateInput === 'string' && dateInput.match(/^\d{4}-\d{2}-\d{2}$/)) {
      date = parseYMDToDate(dateInput);
    } else if (typeof dateInput === 'string') {
      date = new Date(dateInput);
    } else {
      date = dateInput;
    }

    const defaultOptions: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      ...options,
    };

    return date.toLocaleDateString(locale, defaultOptions);
  } catch {
    return typeof dateInput === 'string' ? dateInput : 'Fecha inválida';
  }
}

export function getTodayYMD(): string {
  return formatDateToYMD(new Date());
}

export function compareYMDDates(date1: string, date2: string): number {
  const d1 = parseYMDToDate(date1);
  const d2 = parseYMDToDate(date2);
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  return d1.getTime() - d2.getTime();
}

export function isTodayOrFuture(dateString: string): boolean {
  const today = getTodayYMD();
  return compareYMDDates(dateString, today) >= 0;
}

export function formatDateShort(dateInput: string | Date): string {
  return formatDateToDisplay(dateInput, 'es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function calculateDaysDifference(startDate: string, endDate: string): number {
  const start = parseYMDToDate(startDate);
  const end = parseYMDToDate(endDate);
  
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(1, diffDays);
}

export function calculateWeeksDifference(startDate: string, endDate: string): number {
  const days = calculateDaysDifference(startDate, endDate);
  const weeks = days / 7;
  
  return Math.max(1, Math.round(weeks * 100) / 100);
}

export function calculateMonthsDifference(startDate: string, endDate: string): number {
  const days = calculateDaysDifference(startDate, endDate);
  const months = days / 30.44;
  
  return Math.max(1, Math.round(months * 100) / 100);
}

function splitYMD(ymd: string): { y: number; m: number; d: number } | null {
  if (!ymd || typeof ymd !== 'string') return null;
  const m = ymd.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const y = +m[1];
  const mm = +m[2];
  const dd = +m[3];
  if (!y || mm < 1 || mm > 12 || dd < 1 || dd > 31) return null;
  return { y, m: mm, d: dd };
}

const MONTHS_ES_SHORT = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sept', 'oct', 'nov', 'dic'
];

export function formatYMDShort(ymd: string): string {
  const p = splitYMD(ymd);
  if (!p) return '';
  const mon = MONTHS_ES_SHORT[p.m - 1] || '';
  return `${p.d}-${mon}`;
}

export function formatYMDToShort(ymd: string): string {
  const p = splitYMD(ymd);
  if (!p) return '';
  const mon = MONTHS_ES_SHORT[p.m - 1] || '';
  return `${p.d} ${mon} ${p.y}`;
}


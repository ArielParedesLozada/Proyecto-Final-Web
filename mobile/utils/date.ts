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


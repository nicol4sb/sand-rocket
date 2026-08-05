const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function getBrowserLocale(): string {
  if (typeof navigator !== 'undefined' && navigator.language) {
    return navigator.language;
  }
  return 'en-GB';
}

export function parseIsoDateString(iso: string): Date | null {
  const match = ISO_DATE_RE.exec(iso.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

export function formatLocaleDate(
  iso: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const date = parseIsoDateString(iso);
  if (!date) return iso;
  return date.toLocaleDateString(getBrowserLocale(), {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...options
  });
}

export function formatLocaleDateMedium(iso: string): string {
  const date = parseIsoDateString(iso);
  if (!date) return iso;
  return date.toLocaleDateString(getBrowserLocale(), {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

export function formatLocaleDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString(getBrowserLocale(), {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

export function toIsoDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseFlexibleDisplayDate(value: unknown): string | null {
  if (value == null || value === '') return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return toIsoDateString(value);
  }
  const str = String(value).trim();
  if (parseIsoDateString(str)) return str;
  const frMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (frMatch) {
    const [, d, m, y] = frMatch;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  const parsed = Date.parse(str);
  if (!Number.isNaN(parsed)) {
    return toIsoDateString(new Date(parsed));
  }
  return null;
}

export function formatRelativeDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;

  const now = Date.now();
  const diffMs = date.getTime() - now;
  const locale = getBrowserLocale();
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  const diffSec = Math.round(diffMs / 1000);
  if (Math.abs(diffSec) < 60) return rtf.format(diffSec, 'second');

  const diffMin = Math.round(diffSec / 60);
  if (Math.abs(diffMin) < 60) return rtf.format(diffMin, 'minute');

  const diffHr = Math.round(diffMin / 60);
  if (Math.abs(diffHr) < 24) return rtf.format(diffHr, 'hour');

  const diffDay = Math.round(diffHr / 24);
  if (Math.abs(diffDay) < 7) return rtf.format(diffDay, 'day');

  return date.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

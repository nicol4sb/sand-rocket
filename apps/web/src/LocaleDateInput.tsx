import React, { useRef } from 'react';
import { formatLocaleDate, getBrowserLocale } from './localeFormat';

interface LocaleDateInputProps {
  value: string;
  max?: string;
  displayClassName?: string;
  title?: string;
  onChange: (nextIso: string) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

function CalendarIcon() {
  return (
    <svg
      className="locale-date-icon"
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      aria-hidden
    >
      <rect x="1.5" y="2.5" width="11" height="10" rx="1.2" />
      <path d="M1.5 5.5h11M4.5 1.5v2M9.5 1.5v2" />
    </svg>
  );
}

export function LocaleDateInput(props: LocaleDateInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const locale = getBrowserLocale();
  const label = formatLocaleDate(props.value);

  const openPicker = () => {
    const input = inputRef.current;
    if (!input) return;
    input.focus();
    if (typeof input.showPicker === 'function') {
      try {
        input.showPicker();
      } catch {
        // Some browsers block showPicker outside direct user gesture chains.
      }
    }
  };

  return (
    <div className="locale-date-input">
      <button
        type="button"
        className={props.displayClassName ?? 'locale-date-display'}
        onClick={openPicker}
        title={props.title ?? label}
        aria-label={props.title ?? label}
      >
        <span className="locale-date-label">{label}</span>
        <CalendarIcon />
      </button>
      <input
        ref={inputRef}
        type="date"
        lang={locale}
        className="locale-date-native"
        value={props.value}
        max={props.max}
        tabIndex={-1}
        aria-hidden
        onChange={(e) => props.onChange(e.target.value)}
        onBlur={props.onBlur}
        onKeyDown={props.onKeyDown}
      />
    </div>
  );
}

import { createContext, useContext, useMemo, useState } from 'react';

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export function formatMonth(d) {
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}
export function formatDate(d) {
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}
function endOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}
function startOfYear(d) {
  return new Date(d.getFullYear(), 0, 1, 0, 0, 0, 0);
}
function endOfYear(d) {
  return new Date(d.getFullYear(), 11, 31, 23, 59, 59, 999);
}

const FilterContext = createContext(null);

export function FilterProvider({ children }) {
  const [preset, setPreset] = useState('month');
  const [anchor, setAnchor] = useState(() => new Date());
  const [customRange, setCustomRangeState] = useState(() => {
    const now = new Date();
    return { start: startOfMonth(now), end: endOfMonth(now) };
  });

  const range = useMemo(() => {
    if (preset === 'month') {
      return { start: startOfMonth(anchor), end: endOfMonth(anchor) };
    }
    if (preset === 'year') {
      return { start: startOfYear(anchor), end: endOfYear(anchor) };
    }
    return customRange;
  }, [preset, anchor, customRange]);

  const canGoNext = useMemo(() => {
    const now = new Date();
    if (preset === 'month') {
      return (
        anchor.getFullYear() < now.getFullYear() ||
        (anchor.getFullYear() === now.getFullYear() &&
          anchor.getMonth() < now.getMonth())
      );
    }
    if (preset === 'year') {
      return anchor.getFullYear() < now.getFullYear();
    }
    return false;
  }, [preset, anchor]);

  const label = useMemo(() => {
    if (preset === 'month') return formatMonth(anchor);
    if (preset === 'year') return String(anchor.getFullYear());
    return `${formatDate(customRange.start)} – ${formatDate(customRange.end)}`;
  }, [preset, anchor, customRange]);

  const goPrev = () => {
    if (preset === 'month') {
      setAnchor(new Date(anchor.getFullYear(), anchor.getMonth() - 1, 1));
    } else if (preset === 'year') {
      setAnchor(new Date(anchor.getFullYear() - 1, 0, 1));
    }
  };

  const goNext = () => {
    if (!canGoNext) return;
    if (preset === 'month') {
      setAnchor(new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1));
    } else if (preset === 'year') {
      setAnchor(new Date(anchor.getFullYear() + 1, 0, 1));
    }
  };

  const setCustomRange = (start, end) => {
    const s = start <= end ? start : end;
    const e = start <= end ? end : start;
    setCustomRangeState({
      start: new Date(s.getFullYear(), s.getMonth(), s.getDate(), 0, 0, 0, 0),
      end: new Date(e.getFullYear(), e.getMonth(), e.getDate(), 23, 59, 59, 999),
    });
  };

  return (
    <FilterContext.Provider
      value={{
        preset,
        setPreset,
        anchor,
        goPrev,
        goNext,
        canGoNext,
        customRange,
        setCustomRange,
        range,
        label,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilter() {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error('useFilter must be used inside FilterProvider');
  return ctx;
}
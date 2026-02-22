import { useState, useEffect, useRef, useCallback } from 'react';

export function useAutoRefresh(onRefresh: () => void) {
  const [enabled, setEnabled] = useState(false);
  const [interval, setIntervalValue] = useState(30);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    stop();
    timerRef.current = setInterval(onRefresh, interval * 1000);
  }, [interval, onRefresh, stop]);

  useEffect(() => {
    if (enabled) {
      start();
    } else {
      stop();
    }
    return stop;
  }, [enabled, start, stop]);

  return {
    enabled,
    interval,
    setEnabled,
    setInterval: setIntervalValue,
  };
}

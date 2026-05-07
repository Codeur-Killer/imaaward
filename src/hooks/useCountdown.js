import { useState, useEffect } from 'react';

export function useCountdown(initialTargetDate) {
  const getStoredDate = (key, defaultDate) => {
    let stored = localStorage.getItem(key);
    if (!stored) {
      localStorage.setItem(key, defaultDate);
      stored = defaultDate;
    }
    return stored;
  };

  const calculateTimeLeft = () => {
    // Les intervalles de vote (17 Mai 2026 au 23 Mai 2026)
    const startIso = getStoredDate('ima_vote_start_date', '2026-05-17T00:00:00');
    const endIso = getStoredDate('ima_vote_end_date', '2026-05-23T23:59:59');

    const now = new Date();
    const startDate = new Date(startIso);
    const endDate = new Date(endIso);

    let targetDate;
    let phase;

    if (now < startDate) {
      targetDate = startDate;
      phase = 'before_start';
    } else if (now >= startDate && now <= endDate) {
      targetDate = endDate;
      phase = 'active';
    } else {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true, phase: 'expired' };
    }

    const difference = targetDate - now;

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true, phase: 'expired' };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      expired: false,
      phase,
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return timeLeft;
}

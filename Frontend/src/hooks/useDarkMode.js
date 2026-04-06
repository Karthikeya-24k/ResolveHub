import { useEffect, useState } from 'react';

// Apply immediately before React renders to prevent flash
const getInitial = () => {
  const stored = localStorage.getItem('theme');
  if (stored) return stored === 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

if (getInitial()) {
  document.documentElement.classList.add('dark');
}

const useDarkMode = () => {
  const [dark, setDark] = useState(getInitial);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return [dark, () => setDark((v) => !v)];
};

export default useDarkMode;

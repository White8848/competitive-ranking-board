import { useState, useCallback } from 'react';

const STORAGE_KEY = 'featuredTeams';
const DEFAULT_TEAMS = ['星河战魂', '幻影战翼'];

function loadFromStorage(): string[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return DEFAULT_TEAMS;
}

export function useFeaturedTeams() {
  const [featuredTeams, setFeaturedTeams] = useState<string[]>(loadFromStorage);

  const save = useCallback((teams: string[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(teams));
  }, []);

  const addTeam = useCallback(
    (name: string) => {
      setFeaturedTeams((prev) => {
        if (prev.includes(name)) return prev;
        const next = [...prev, name];
        save(next);
        return next;
      });
    },
    [save],
  );

  const removeTeam = useCallback(
    (name: string) => {
      setFeaturedTeams((prev) => {
        const next = prev.filter((t) => t !== name);
        save(next);
        return next;
      });
    },
    [save],
  );

  const toggleTeam = useCallback(
    (name: string) => {
      setFeaturedTeams((prev) => {
        const next = prev.includes(name) ? prev.filter((t) => t !== name) : [...prev, name];
        save(next);
        return next;
      });
    },
    [save],
  );

  return { featuredTeams, addTeam, removeTeam, toggleTeam };
}

export const getSearchHistory = (): string[] => {
  try {
    const history = localStorage.getItem('sonexa_search_history');
    return history ? JSON.parse(history) : [];
  } catch (e) {
    console.error('Failed to read search history', e);
    return [];
  }
};

export const saveSearchQuery = (query: string) => {
  if (!query || !query.trim()) return;
  const trimmed = query.trim();
  try {
    const history = getSearchHistory();
    // Remove query if already exists to move it to the front
    const filtered = history.filter((q) => q.toLowerCase() !== trimmed.toLowerCase());
    const updated = [trimmed, ...filtered].slice(0, 5); // Store last 5 items
    localStorage.setItem('sonexa_search_history', JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save search history', e);
  }
};

export const clearSearchHistory = () => {
  try {
    localStorage.removeItem('sonexa_search_history');
  } catch (e) {
    console.error('Failed to clear search history', e);
  }
};

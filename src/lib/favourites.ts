export function getFavourites(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem('jay-favourites') || '[]');
  } catch {
    return [];
  }
}

export function toggleFavourite(id: string): string[] {
  const favs = getFavourites();
  const updated = favs.includes(id)
    ? favs.filter(f => f !== id)
    : [...favs, id];
  localStorage.setItem('jay-favourites', JSON.stringify(updated));
  return updated;
}

export function isFavourite(id: string): boolean {
  return getFavourites().includes(id);
}

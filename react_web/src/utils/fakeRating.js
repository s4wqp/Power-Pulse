/**
 * Generates a deterministic fake rating (3.5–5.0) from an item's ID or name.
 * The same input always returns the same rating so it stays consistent across renders.
 */
export const fakeRating = (identifier) => {
  if (!identifier) return 4.2;
  const str = String(identifier);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  // Map to range 3.5 – 5.0
  const normalized = (Math.abs(hash) % 150) / 100; // 0.00 – 1.49
  const rating = 3.5 + normalized;
  return Math.min(rating, 5.0);
};

/**
 * Returns the rating to display: uses the real rating if > 0, otherwise a fake one.
 */
export const displayRating = (realRating, identifier) => {
  if (realRating && realRating > 0) return realRating.toFixed(1);
  return fakeRating(identifier).toFixed(1);
};

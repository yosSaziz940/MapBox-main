/**
 * Search History utility for managing user's recent address searches
 * Persists to localStorage for cross-session availability
 */

const STORAGE_KEY = "mapbox-search-history";
const MAX_HISTORY_SIZE = 10;

/**
 * Load search history from localStorage
 * @returns {string[]} Array of recent search addresses (most recent first)
 */
export function loadSearchHistory() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.warn("Failed to load search history:", error);
    return [];
  }
}

/**
 * Save search history to localStorage
 * @param {string[]} history - Array of search addresses
 * @returns {boolean} True if successful, false otherwise
 */
function saveSearchHistory(history) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    return true;
  } catch (error) {
    console.warn("Failed to save search history:", error);
    return false;
  }
}

/**
 * Add a search to history
 * - Moves existing searches to top (no duplicates)
 * - Enforces MAX_HISTORY_SIZE limit
 * @param {string} address - Address to add
 * @returns {string[]} Updated history
 */
export function addToSearchHistory(address) {
  if (!address || typeof address !== "string" || !address.trim()) {
    return loadSearchHistory();
  }

  const normalizedAddress = address.trim();
  let history = loadSearchHistory();

  // Remove if already exists (will re-add at top)
  history = history.filter(
    (item) => item.toLowerCase() !== normalizedAddress.toLowerCase()
  );

  // Add to front
  history.unshift(normalizedAddress);

  // Trim to size
  if (history.length > MAX_HISTORY_SIZE) {
    history = history.slice(0, MAX_HISTORY_SIZE);
  }

  saveSearchHistory(history);
  return history;
}

/**
 * Clear entire search history
 * @returns {boolean} True if successful
 */
export function clearSearchHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.warn("Failed to clear search history:", error);
    return false;
  }
}

/**
 * Remove a specific search from history
 * @param {string} address - Address to remove
 * @returns {string[]} Updated history
 */
export function removeFromSearchHistory(address) {
  if (!address || typeof address !== "string") {
    return loadSearchHistory();
  }

  let history = loadSearchHistory();
  history = history.filter(
    (item) => item.toLowerCase() !== address.toLowerCase()
  );
  saveSearchHistory(history);
  return history;
}

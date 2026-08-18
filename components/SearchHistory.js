"use client";

import React from "react";
import { removeFromSearchHistory } from "../lib/searchHistory";

/**
 * SearchHistory component displays recent searches in a dropdown list
 * Allows users to click to re-search or delete items
 */
export default function SearchHistory({
  history = [],
  onSelectAddress,
  onClearAll,
}) {
  if (!history || history.length === 0) {
    return null;
  }

  return (
    <div className="absolute top-16 left-5 z-10 bg-white rounded shadow-lg border border-gray-200 w-72 max-h-60 overflow-y-auto">
      <div className="sticky top-0 bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">
            Recent Searches
          </h3>
          {history.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-xs text-gray-500 hover:text-red-600 transition-colors"
              aria-label="Clear search history"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <ul className="divide-y divide-gray-100">
        {history.map((address, index) => (
          <li
            key={`${address}-${index}`}
            className="hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between px-4 py-2">
              <button
                onClick={() => onSelectAddress(address)}
                className="flex-1 text-left text-sm text-gray-700 hover:text-blue-600 truncate"
              >
                {address}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFromSearchHistory(address);
                  // Notify parent to refresh
                  window.dispatchEvent(
                    new CustomEvent("search-history-updated")
                  );
                }}
                className="ml-2 p-1 text-gray-400 hover:text-red-600 transition-colors"
                aria-label={`Remove ${address} from history`}
              >
                ✕
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

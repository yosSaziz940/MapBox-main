import {
  loadSearchHistory,
  addToSearchHistory,
  clearSearchHistory,
  removeFromSearchHistory,
} from "../../lib/searchHistory";

describe("lib/searchHistory", () => {
  const STORAGE_KEY = "mapbox-search-history";

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("loadSearchHistory", () => {
    it("should return empty array when no history exists", () => {
      const result = loadSearchHistory();
      expect(result).toEqual([]);
    });

    it("should load and parse history from localStorage", () => {
      const mockHistory = ["NYC", "Boston"];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockHistory));

      const result = loadSearchHistory();

      expect(result).toEqual(mockHistory);
    });

    it("should handle corrupted localStorage gracefully", () => {
      localStorage.setItem(STORAGE_KEY, "invalid json {");

      const result = loadSearchHistory();

      expect(result).toEqual([]);
    });

    it("should warn on corrupted data", () => {
      const warnSpy = jest.spyOn(console, "warn").mockImplementation();
      localStorage.setItem(STORAGE_KEY, "invalid json {");

      loadSearchHistory();

      expect(warnSpy).toHaveBeenCalledWith(
        "Failed to load search history:",
        expect.any(Error)
      );
      warnSpy.mockRestore();
    });
  });

  describe("addToSearchHistory", () => {
    it("should add a new address to history", () => {
      const result = addToSearchHistory("Times Square");

      expect(result).toEqual(["Times Square"]);
      expect(loadSearchHistory()).toEqual(["Times Square"]);
    });

    it("should add new address to front of existing history", () => {
      addToSearchHistory("NYC");
      const result = addToSearchHistory("Boston");

      expect(result).toEqual(["Boston", "NYC"]);
    });

    it("should move duplicate address to front (no duplicates)", () => {
      addToSearchHistory("NYC");
      addToSearchHistory("Boston");
      const result = addToSearchHistory("NYC");

      expect(result).toEqual(["NYC", "Boston"]);
      expect(result.filter((a) => a === "NYC")).toHaveLength(1);
    });

    it("should perform case-insensitive deduplication", () => {
      addToSearchHistory("Times Square");
      const result = addToSearchHistory("times square");

      expect(result).toEqual(["times square"]);
    });

    it("should trim whitespace from addresses", () => {
      const result = addToSearchHistory("  Times Square  ");

      expect(result).toEqual(["Times Square"]);
    });

    it("should enforce MAX_HISTORY_SIZE limit (10)", () => {
      // Add 12 addresses
      for (let i = 1; i <= 12; i++) {
        addToSearchHistory(`Address ${i}`);
      }

      const result = loadSearchHistory();

      expect(result).toHaveLength(10);
      expect(result[0]).toBe("Address 12");
      expect(result[9]).toBe("Address 3");
    });

    it("should reject invalid input (null/undefined)", () => {
      const result1 = addToSearchHistory(null);
      const result2 = addToSearchHistory(undefined);
      const result3 = addToSearchHistory("");
      const result4 = addToSearchHistory("  ");

      expect(result1).toEqual([]);
      expect(result2).toEqual([]);
      expect(result3).toEqual([]);
      expect(result4).toEqual([]);
    });

    it("should reject non-string input", () => {
      const result1 = addToSearchHistory(123);
      const result2 = addToSearchHistory({ address: "test" });
      const result3 = addToSearchHistory(["array"]);

      expect(result1).toEqual([]);
      expect(result2).toEqual([]);
      expect(result3).toEqual([]);
    });

    it("should handle localStorage write failures gracefully", () => {
      const warnSpy = jest.spyOn(console, "warn").mockImplementation();
      const setItemSpy = jest
        .spyOn(Storage.prototype, "setItem")
        .mockImplementation(() => {
          throw new Error("QuotaExceededError");
        });

      addToSearchHistory("Test");

      expect(warnSpy).toHaveBeenCalledWith(
        "Failed to save search history:",
        expect.any(Error)
      );

      warnSpy.mockRestore();
      setItemSpy.mockRestore();
    });
  });

  describe("removeFromSearchHistory", () => {
    it("should remove an address from history", () => {
      addToSearchHistory("NYC");
      addToSearchHistory("Boston");
      addToSearchHistory("Philadelphia");

      const result = removeFromSearchHistory("Boston");

      expect(result).toEqual(["Philadelphia", "NYC"]);
      expect(loadSearchHistory()).toEqual(["Philadelphia", "NYC"]);
    });

    it("should perform case-insensitive removal", () => {
      addToSearchHistory("Times Square");
      const result = removeFromSearchHistory("times square");

      expect(result).toEqual([]);
    });

    it("should handle non-existent address gracefully", () => {
      addToSearchHistory("NYC");
      const result = removeFromSearchHistory("NonExistent");

      expect(result).toEqual(["NYC"]);
    });

    it("should return empty array for empty history", () => {
      const result = removeFromSearchHistory("NYC");
      expect(result).toEqual([]);
    });

    it("should reject invalid input (null/undefined/non-string)", () => {
      addToSearchHistory("NYC");

      const result1 = removeFromSearchHistory(null);
      const result2 = removeFromSearchHistory(undefined);
      const result3 = removeFromSearchHistory(123);

      expect(result1).toEqual(["NYC"]);
      expect(result2).toEqual(["NYC"]);
      expect(result3).toEqual(["NYC"]);
    });
  });

  describe("clearSearchHistory", () => {
    it("should clear all search history", () => {
      addToSearchHistory("NYC");
      addToSearchHistory("Boston");

      const result = clearSearchHistory();

      expect(result).toBe(true);
      expect(loadSearchHistory()).toEqual([]);
    });

    it("should handle clearing empty history", () => {
      const result = clearSearchHistory();

      expect(result).toBe(true);
      expect(loadSearchHistory()).toEqual([]);
    });

    it("should handle localStorage clear failures gracefully", () => {
      const warnSpy = jest.spyOn(console, "warn").mockImplementation();
      const removeItemSpy = jest
        .spyOn(Storage.prototype, "removeItem")
        .mockImplementation(() => {
          throw new Error("StorageError");
        });

      clearSearchHistory();

      expect(warnSpy).toHaveBeenCalledWith(
        "Failed to clear search history:",
        expect.any(Error)
      );

      warnSpy.mockRestore();
      removeItemSpy.mockRestore();
    });
  });

  describe("integration scenarios", () => {
    it("should handle complete workflow", () => {
      // Add multiple searches
      addToSearchHistory("Times Square");
      addToSearchHistory("Central Park");
      addToSearchHistory("Brooklyn Bridge");

      expect(loadSearchHistory()).toHaveLength(3);

      // Remove one
      removeFromSearchHistory("Central Park");
      expect(loadSearchHistory()).toHaveLength(2);

      // Re-add (should move to front)
      addToSearchHistory("Central Park");
      const history = loadSearchHistory();
      expect(history[0]).toBe("Central Park");
      expect(history).toHaveLength(3);

      // Clear all
      clearSearchHistory();
      expect(loadSearchHistory()).toHaveLength(0);
    });

    it("should maintain order across browser session", () => {
      addToSearchHistory("First");
      addToSearchHistory("Second");
      addToSearchHistory("Third");

      // Simulate new "session" by clearing module cache (load from storage)
      const history1 = loadSearchHistory();
      const history2 = loadSearchHistory();

      expect(history1).toEqual(history2);
      expect(history1).toEqual(["Third", "Second", "First"]);
    });

    it("should handle rapid successive additions", () => {
      const addresses = ["A", "B", "C", "D", "E"];
      addresses.forEach((addr) => addToSearchHistory(addr));

      const history = loadSearchHistory();
      expect(history).toEqual(["E", "D", "C", "B", "A"]);
    });
  });
});

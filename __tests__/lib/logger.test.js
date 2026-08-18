import {
  logDebug,
  logInfo,
  logWarn,
  logError,
  createLogger,
} from "../../lib/logger";

describe("lib/logger", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "debug").mockImplementation();
    jest.spyOn(console, "info").mockImplementation();
    jest.spyOn(console, "warn").mockImplementation();
    jest.spyOn(console, "error").mockImplementation();
  });

  afterEach(() => {
    console.debug.mockRestore();
    console.info.mockRestore();
    console.warn.mockRestore();
    console.error.mockRestore();
  });

  describe("logDebug", () => {
    it("should format and log a debug message", () => {
      const result = logDebug("test-module", "test message", { data: "value" });

      expect(result).toEqual({
        timestamp: expect.any(String),
        level: "DEBUG",
        module: "test-module",
        message: "test message",
        context: { data: "value" },
      });
      expect(console.debug).toHaveBeenCalled();
    });

    it("should handle missing context", () => {
      const result = logDebug("test-module", "test message");

      expect(result.context).toEqual({});
      expect(console.debug).toHaveBeenCalled();
    });
  });

  describe("logInfo", () => {
    it("should format and log an info message", () => {
      const result = logInfo("app", "App started", { version: "1.0.0" });

      expect(result).toEqual({
        timestamp: expect.any(String),
        level: "INFO",
        module: "app",
        message: "App started",
        context: { version: "1.0.0" },
      });
      expect(console.info).toHaveBeenCalled();
    });
  });

  describe("logWarn", () => {
    it("should format and log a warning message", () => {
      const result = logWarn("geocode", "Slow response", {
        responseTime: 3000,
      });

      expect(result).toEqual({
        timestamp: expect.any(String),
        level: "WARN",
        module: "geocode",
        message: "Slow response",
        context: { responseTime: 3000 },
      });
      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe("logError", () => {
    it("should format and log an error message", () => {
      const error = new Error("Network failed");
      const result = logError("search", "Search failed", {
        error: error.message,
        code: 500,
      });

      expect(result).toEqual({
        timestamp: expect.any(String),
        level: "ERROR",
        module: "search",
        message: "Search failed",
        context: { error: error.message, code: 500 },
      });
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe("createLogger", () => {
    it("should create a logger instance bound to a module", () => {
      const logger = createLogger("map");

      expect(logger).toHaveProperty("debug");
      expect(logger).toHaveProperty("info");
      expect(logger).toHaveProperty("warn");
      expect(logger).toHaveProperty("error");
    });

    it("should use module name from factory in all log calls", () => {
      const logger = createLogger("search");

      logger.debug("Query received", { query: "NYC" });
      logger.info("Search completed");
      logger.warn("Rate limit approaching");
      logger.error("Invalid token", { code: 401 });

      expect(console.debug).toHaveBeenCalledWith(
        expect.stringContaining("[search]"),
        expect.anything(),
        expect.anything()
      );
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining("[search]"),
        expect.anything(),
        expect.anything()
      );
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining("[search]"),
        expect.anything(),
        expect.anything()
      );
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("[search]"),
        expect.anything(),
        expect.anything()
      );
    });

    it("should return structured log entries", () => {
      const logger = createLogger("build");

      const result = logger.info("Build started");

      expect(result).toEqual({
        timestamp: expect.any(String),
        level: "INFO",
        module: "build",
        message: "Build started",
        context: {},
      });
    });
  });

  describe("timestamp format", () => {
    it("should use ISO timestamp format", () => {
      const result = logInfo("test", "test");

      expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });
});

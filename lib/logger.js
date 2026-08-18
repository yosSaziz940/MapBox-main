/**
 * Structured logger utility for client-side logging
 * Provides consistent formatting and context for debugging
 */

const LogLevel = {
  DEBUG: "DEBUG",
  INFO: "INFO",
  WARN: "WARN",
  ERROR: "ERROR",
};

const LOG_PREFIX = "[MapBox]";

/**
 * Format a log message with level, module, message, and optional context
 * @param {string} level - Log level (DEBUG, INFO, WARN, ERROR)
 * @param {string} module - Module name (e.g., 'geocode', 'map', 'search')
 * @param {string} message - Log message
 * @param {object} context - Optional context object
 * @returns {object} Structured log entry
 */
function formatLog(level, module, message, context = {}) {
  const timestamp = new Date().toISOString();
  return {
    timestamp,
    level,
    module,
    message,
    context,
  };
}

/**
 * Log a message at DEBUG level
 * @param {string} module - Module name
 * @param {string} message - Log message
 * @param {object} context - Optional context
 */
export function logDebug(module, message, context) {
  const log = formatLog(LogLevel.DEBUG, module, message, context);
  console.debug(`${LOG_PREFIX} [${log.module}]`, log.message, log.context);
  return log;
}

/**
 * Log a message at INFO level
 * @param {string} module - Module name
 * @param {string} message - Log message
 * @param {object} context - Optional context
 */
export function logInfo(module, message, context) {
  const log = formatLog(LogLevel.INFO, module, message, context);
  console.info(`${LOG_PREFIX} [${log.module}]`, log.message, log.context);
  return log;
}

/**
 * Log a message at WARN level
 * @param {string} module - Module name
 * @param {string} message - Log message
 * @param {object} context - Optional context
 */
export function logWarn(module, message, context) {
  const log = formatLog(LogLevel.WARN, module, message, context);
  console.warn(`${LOG_PREFIX} [${log.module}]`, log.message, log.context);
  return log;
}

/**
 * Log a message at ERROR level
 * @param {string} module - Module name
 * @param {string} message - Log message
 * @param {object} context - Optional context
 */
export function logError(module, message, context) {
  const log = formatLog(LogLevel.ERROR, module, message, context);
  console.error(`${LOG_PREFIX} [${log.module}]`, log.message, log.context);
  return log;
}

/**
 * Logger factory - creates a logger instance bound to a module name
 * @param {string} moduleName - Name of the module using this logger
 * @returns {object} Logger instance with bound methods
 */
export function createLogger(moduleName) {
  return {
    debug: (message, context) => logDebug(moduleName, message, context),
    info: (message, context) => logInfo(moduleName, message, context),
    warn: (message, context) => logWarn(moduleName, message, context),
    error: (message, context) => logError(moduleName, message, context),
  };
}

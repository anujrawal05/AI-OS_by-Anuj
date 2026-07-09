const levels = {
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  PERF: 'PERF',
  DEBUG: 'DEBUG'
};

function formatMessage(level, message, meta = {}) {
  const timestamp = new Date().toISOString();
  const metaString = Object.keys(meta).length ? ` | Meta: ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level}] ${message}${metaString}`;
}

const logger = {
  info(message, meta) {
    console.log(formatMessage(levels.INFO, message, meta));
  },
  warn(message, meta) {
    console.warn(formatMessage(levels.WARN, message, meta));
  },
  error(message, meta, errorStack) {
    console.error(formatMessage(levels.ERROR, message, meta));
    if (errorStack) {
      console.error(errorStack);
    }
  },
  perf(message, durationMs, meta = {}) {
    console.log(formatMessage(levels.PERF, `${message} - Duration: ${durationMs}ms`, meta));
  },
  debug(message, meta) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(formatMessage(levels.DEBUG, message, meta));
    }
  }
};

module.exports = logger;

/**
 * Request logging middleware
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  const originalSend = res.send;

  // Track response
  res.send = function (data) {
    const duration = Date.now() - startTime;
    const logLevel = res.statusCode >= 400 ? 'WARN' : 'INFO';

    console.log(
      `[${logLevel}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`
    );

    if (res.statusCode >= 500) {
      console.error(`Error response body:`, data);
    }

    return originalSend.call(this, data);
  };

  next();
};

module.exports = requestLogger;

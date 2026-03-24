// Async handler to wrap async route handlers
// In Express 5, async errors are auto-caught, but we still use this
// for consistent try/catch-free controller code
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;

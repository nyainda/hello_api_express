const app = require('./app');
const config = require('./config');

// Middleware to add headers
app.use((req, res, next) => {
  // CORS headers
  res.header('Access-Control-Allow-Origin', '*'); // Be more specific in production
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

  // Security headers
  res.header('X-XSS-Protection', '1; mode=block');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  // Caching headers (adjust as needed)
  res.header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.header('Pragma', 'no-cache');
  res.header('Expires', '0');

  // Handle OPTIONS method
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});

const port = config.PORT || 3000;

if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

module.exports = app;
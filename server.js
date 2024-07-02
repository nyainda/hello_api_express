const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Function to generate a random temperature between -10 and 40
function getRandomTemperature() {
  return Math.floor(Math.random() * 51) - 10;
}

// Array of sample cities
const cities = ['New York', 'London', 'Tokyo', 'Paris', 'Sydney', 'Berlin', 'Moscow', 'Rio de Janeiro', 'Cairo', 'Mumbai'];

// Function to get client IP address
function getClientIp(req) {
  const xForwardedFor = req.headers['x-forwarded-for'];
  if (xForwardedFor) {
    const ipAddresses = xForwardedFor.split(',').map(ip => ip.trim());
    return ipAddresses[0];
  }
  return req.ip;
}

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the Hello API. Use /api/hello?visitor_name=YourName to access the API.');
});

// Hello API route
app.get('/api/hello', (req, res) => {
  const visitorName = req.query.visitor_name || 'Guest'; // Get visitor name from query parameter or default to 'Guest'
  const clientIp = getClientIp(req); // Get the client's IP address
  const city = cities[Math.floor(Math.random() * cities.length)]; // Select a random city
  const temperature = getRandomTemperature(); // Generate a random temperature

  // Respond with the JSON structure
  res.json({
    client_ip: clientIp,
    location: city,
    greeting: `Hello, ${visitorName}! The temperature is ${temperature} degrees Celsius in ${city}`
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

module.exports = app;

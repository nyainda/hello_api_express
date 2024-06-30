const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Function to generate a random temperature between -10 and 40
function getRandomTemperature() {
  return Math.floor(Math.random() * 51) - 10;
}

// Array of sample cities
const cities = ['New York', 'London', 'Tokyo', 'Paris', 'Sydney', 'Berlin', 'Moscow', 'Rio de Janeiro', 'Cairo', 'Mumbai'];

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the Hello API. Use /api/hello?visitor_name=YourName to access the API.');
});

// Hello API route
app.get('/api/hello', (req, res) => {
  const visitorName = req.query.visitor_name || 'Guest';
  const clientIp = req.ip === '::1' || req.ip === '127.0.0.1' ? '127.0.0.1' : req.ip;
  const city = cities[Math.floor(Math.random() * cities.length)];
  const temperature = getRandomTemperature();

  res.json({
    client_ip: clientIp,
    location: city,
    greeting: `Hello, ${visitorName}! The temperature is ${temperature} degrees Celsius in ${city}`
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
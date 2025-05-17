const express = require('express');
const client = require('prom-client');
const Registry = client.Registry;
const register = new Registry();

register.setDefaultLabels({
  app: 'auth-service'
});

client.collectDefaultMetrics({ register });

const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

register.registerMetric(httpRequestCounter);

const app = express();

// Middleware untuk otomatis hitung semua request
// app.use((req, res, next) => {
//   res.on('finish', () => {
//     // Jika req.route tidak ada, fallback ke req.path
//     const route = req.route ? req.route.path : req.path;
//     httpRequestCounter.labels(req.method, route, res.statusCode.toString()).inc();
//   });
//   next();
// });

app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err);
  }
});

app.get('/', (req, res) => {
  httpRequestCounter.labels('GET', '/', '200').inc();
  res.send('Hello World!');
});

const port = 9000;

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});
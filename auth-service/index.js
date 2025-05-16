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

app.get('/', (req, res) => {
  httpRequestCounter.labels('GET', '/', '200').inc();
  res.send('Hello World!');
});

app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err);
  }
});

const port = 9000;

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});
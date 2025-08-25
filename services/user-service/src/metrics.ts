import client from 'prom-client';

// Default metrics
client.collectDefaultMetrics({ prefix: 'user_service_' });

export const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5]
});

export function metricsHandler(req: any, res: any) {
  res.set('Content-Type', client.register.contentType);
  res.end(client.register.metrics());
}

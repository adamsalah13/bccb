# Monitoring and Logging Guide

Comprehensive guide for monitoring, logging, and alerting in the BCCB platform.

## Table of Contents

- [Overview](#overview)
- [Logging](#logging)
- [Monitoring](#monitoring)
- [Alerting](#alerting)
- [Performance Monitoring](#performance-monitoring)
- [Security Monitoring](#security-monitoring)
- [Dashboards](#dashboards)
- [Best Practices](#best-practices)

## Overview

Effective monitoring and logging are essential for maintaining system health, diagnosing issues, and ensuring optimal performance.

### Monitoring Stack

```
┌─────────────────────────────────────┐
│         Application Layer           │
│  (API, Web, AI Service)             │
└────────────┬────────────────────────┘
             │ Metrics & Logs
             ▼
┌─────────────────────────────────────┐
│      Collection Layer               │
│  - Winston (Logs)                   │
│  - Prometheus (Metrics)             │
│  - OpenTelemetry (Traces)           │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│      Storage & Processing           │
│  - Loki (Log aggregation)           │
│  - Prometheus TSDB                  │
│  - Jaeger (Traces)                  │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│      Visualization & Alerting       │
│  - Grafana (Dashboards)             │
│  - AlertManager (Alerts)            │
│  - PagerDuty (Incidents)            │
└─────────────────────────────────────┘
```

## Logging

### Log Levels

| Level | Purpose | Example |
|-------|---------|---------|
| `error` | Errors that need attention | Database connection failed |
| `warn` | Warning conditions | High memory usage |
| `info` | Informational messages | Server started on port 3000 |
| `http` | HTTP request logs | GET /api/credentials 200 |
| `debug` | Debug information | Query params: {status: 'PUBLISHED'} |

### Winston Logger Configuration

**File**: `apps/api/src/utils/logger.ts`

```typescript
import winston from 'winston';

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create logger instance
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: {
    service: 'bccb-api',
    environment: process.env.NODE_ENV,
  },
  transports: [
    // Console output
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    
    // File output - Errors
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // File output - All logs
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
  
  // Handle exceptions and rejections
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/exceptions.log' }),
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: 'logs/rejections.log' }),
  ],
});

// Production: Send logs to external service
if (process.env.NODE_ENV === 'production') {
  // Loki transport
  logger.add(new LokiTransport({
    host: process.env.LOKI_HOST,
    labels: { app: 'bccb-api' },
  }));
  
  // Or Elasticsearch
  logger.add(new winston.transports.Elasticsearch({
    level: 'info',
    clientOpts: {
      node: process.env.ELASTICSEARCH_URL,
    },
  }));
}
```

### Structured Logging

```typescript
// ✓ Good: Structured logging
logger.info('User login successful', {
  userId: user.id,
  email: user.email,
  ip: req.ip,
  userAgent: req.get('user-agent'),
});

logger.error('Database query failed', {
  error: error.message,
  query: 'SELECT * FROM credentials',
  duration: 1500,
  stack: error.stack,
});

// ✗ Bad: Unstructured logging
logger.info('User logged in: ' + user.email);
logger.error('Error: ' + error);
```

### HTTP Request Logging

```typescript
import morgan from 'morgan';

// Custom Morgan format
const morganFormat = ':method :url :status :res[content-length] - :response-time ms';

// Morgan middleware
app.use(morgan(morganFormat, {
  stream: {
    write: (message: string) => logger.http(message.trim()),
  },
}));

// Skip logging health checks
app.use(morgan(morganFormat, {
  skip: (req) => req.url === '/health',
}));
```

### Log Rotation

```typescript
import DailyRotateFile from 'winston-daily-rotate-file';

const transport = new DailyRotateFile({
  filename: 'logs/application-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d', // Keep logs for 14 days
});

logger.add(transport);
```

### Centralized Logging

#### Using Loki

```yaml
# docker-compose.logging.yml
version: '3.8'

services:
  loki:
    image: grafana/loki:latest
    ports:
      - "3100:3100"
    volumes:
      - ./loki-config.yaml:/etc/loki/local-config.yaml
      - loki_data:/loki

  promtail:
    image: grafana/promtail:latest
    volumes:
      - ./promtail-config.yaml:/etc/promtail/config.yml
      - /var/log:/var/log
      - ./logs:/app/logs
    command: -config.file=/etc/promtail/config.yml

volumes:
  loki_data:
```

**Loki Config** (`loki-config.yaml`):

```yaml
auth_enabled: false

server:
  http_listen_port: 3100

ingester:
  lifecycler:
    ring:
      kvstore:
        store: inmemory
      replication_factor: 1
  chunk_idle_period: 5m
  chunk_retain_period: 30s

schema_config:
  configs:
    - from: 2024-01-01
      store: boltdb
      object_store: filesystem
      schema: v11
      index:
        prefix: index_
        period: 168h

storage_config:
  boltdb:
    directory: /loki/index
  filesystem:
    directory: /loki/chunks

limits_config:
  enforce_metric_name: false
  reject_old_samples: true
  reject_old_samples_max_age: 168h
```

## Monitoring

### Prometheus Metrics

**File**: `apps/api/src/utils/metrics.ts`

```typescript
import promClient from 'prom-client';

// Create a Registry
const register = new promClient.Registry();

// Add default metrics
promClient.collectDefaultMetrics({ register });

// Custom metrics
export const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5],
});

export const httpRequestTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

export const activeConnections = new promClient.Gauge({
  name: 'active_connections',
  help: 'Number of active connections',
});

export const databaseQueryDuration = new promClient.Histogram({
  name: 'database_query_duration_seconds',
  help: 'Duration of database queries',
  labelNames: ['operation', 'table'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1],
});

export const aiRequestDuration = new promClient.Histogram({
  name: 'ai_request_duration_seconds',
  help: 'Duration of AI service requests',
  labelNames: ['endpoint', 'status'],
  buckets: [0.5, 1, 2, 5, 10],
});

// Register metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
register.registerMetric(activeConnections);
register.registerMetric(databaseQueryDuration);
register.registerMetric(aiRequestDuration);

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

### Metrics Middleware

```typescript
// Middleware to track HTTP metrics
export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;
    
    httpRequestDuration.observe(
      { method: req.method, route, status_code: res.statusCode },
      duration
    );
    
    httpRequestTotal.inc({
      method: req.method,
      route,
      status_code: res.statusCode,
    });
  });
  
  next();
}

app.use(metricsMiddleware);
```

### Health Checks

```typescript
// Health check endpoint
app.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
    uptime: process.uptime(),
    services: {
      database: 'unknown',
      cache: 'unknown',
      ai_service: 'unknown',
    },
  };

  try {
    // Check database
    await prisma.$queryRaw`SELECT 1`;
    health.services.database = 'healthy';
  } catch (error) {
    health.services.database = 'unhealthy';
    health.status = 'degraded';
  }

  try {
    // Check Redis
    await redis.ping();
    health.services.cache = 'healthy';
  } catch (error) {
    health.services.cache = 'unhealthy';
    health.status = 'degraded';
  }

  try {
    // Check AI service
    const response = await fetch(`${AI_SERVICE_URL}/health`);
    health.services.ai_service = response.ok ? 'healthy' : 'unhealthy';
  } catch (error) {
    health.services.ai_service = 'unhealthy';
    health.status = 'degraded';
  }

  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});
```

### Prometheus Configuration

**File**: `prometheus.yml`

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'bccb-api'
    static_configs:
      - targets: ['api:3000']
    metrics_path: '/metrics'

  - job_name: 'bccb-ai-service'
    static_configs:
      - targets: ['ai-service:8000']
    metrics_path: '/metrics'

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']
```

## Alerting

### AlertManager Configuration

**File**: `alertmanager.yml`

```yaml
global:
  resolve_timeout: 5m

route:
  group_by: ['alertname', 'cluster', 'service']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 12h
  receiver: 'default'
  routes:
    - match:
        severity: critical
      receiver: 'pagerduty'
    - match:
        severity: warning
      receiver: 'slack'

receivers:
  - name: 'default'
    email_configs:
      - to: 'alerts@example.com'
        from: 'alertmanager@example.com'
        smarthost: 'smtp.gmail.com:587'

  - name: 'slack'
    slack_configs:
      - api_url: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK'
        channel: '#alerts'
        title: 'BCCB Alert'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'

  - name: 'pagerduty'
    pagerduty_configs:
      - service_key: 'YOUR_PAGERDUTY_KEY'
```

### Alert Rules

**File**: `alert-rules.yml`

```yaml
groups:
  - name: bccb_alerts
    interval: 30s
    rules:
      # High error rate
      - alert: HighErrorRate
        expr: rate(http_requests_total{status_code=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} per second"

      # Slow response time
      - alert: SlowResponseTime
        expr: histogram_quantile(0.95, http_request_duration_seconds_bucket) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Slow API response time"
          description: "95th percentile response time is {{ $value }}s"

      # High memory usage
      - alert: HighMemoryUsage
        expr: (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes) < 0.1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage"
          description: "Available memory is below 10%"

      # Database connection issues
      - alert: DatabaseConnectionFailed
        expr: up{job="postgres"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Database is down"
          description: "PostgreSQL database is not responding"

      # AI service unavailable
      - alert: AIServiceDown
        expr: up{job="bccb-ai-service"} == 0
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "AI service is down"
          description: "AI service is not responding"

      # High request rate
      - alert: HighRequestRate
        expr: rate(http_requests_total[5m]) > 1000
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High request rate detected"
          description: "Request rate is {{ $value }} per second"
```

## Performance Monitoring

### Application Performance Monitoring (APM)

#### Using New Relic

```typescript
// Initialize New Relic at app startup
import newrelic from 'newrelic';

// Track custom transactions
newrelic.startWebTransaction('credential/create', async () => {
  const credential = await createCredential(data);
  return credential;
});

// Record custom metrics
newrelic.recordMetric('Custom/CredentialCreation', duration);

// Add custom attributes
newrelic.addCustomAttribute('userId', user.id);
newrelic.addCustomAttribute('institutionId', institution.id);
```

#### Using Sentry

```typescript
import * as Sentry from '@sentry/node';

// Initialize Sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

// Error tracking
try {
  await someOperation();
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      operation: 'credential_creation',
    },
    extra: {
      userId: user.id,
      data: data,
    },
  });
  throw error;
}

// Performance monitoring
const transaction = Sentry.startTransaction({
  op: 'api.request',
  name: 'POST /api/credentials',
});

try {
  await createCredential(data);
} finally {
  transaction.finish();
}
```

## Security Monitoring

### Audit Logging

```typescript
// Audit log function
export async function createAuditLog(data: AuditLogData) {
  await prisma.auditLog.create({
    data: {
      entityType: data.entityType,
      entityId: data.entityId,
      action: data.action,
      userId: data.userId,
      changes: data.changes,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      timestamp: new Date(),
    },
  });
}

// Usage
await createAuditLog({
  entityType: 'MicroCredential',
  entityId: credential.id,
  action: 'UPDATE',
  userId: req.user.id,
  changes: {
    before: { status: 'DRAFT' },
    after: { status: 'PUBLISHED' },
  },
  ipAddress: req.ip,
  userAgent: req.get('user-agent'),
});
```

### Failed Login Monitoring

```typescript
const failedLoginAttempts = new promClient.Counter({
  name: 'failed_login_attempts_total',
  help: 'Total number of failed login attempts',
  labelNames: ['email', 'ip'],
});

// Track failed logins
failedLoginAttempts.inc({ email: email, ip: req.ip });

// Alert on suspicious activity
if (await getFailedAttempts(email, '15m') > 5) {
  await sendSecurityAlert({
    type: 'BRUTE_FORCE_ATTEMPT',
    email: email,
    ip: req.ip,
  });
}
```

## Dashboards

### Grafana Dashboards

#### System Overview Dashboard

```json
{
  "dashboard": {
    "title": "BCCB System Overview",
    "panels": [
      {
        "title": "Request Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])"
          }
        ]
      },
      {
        "title": "Response Time (95th percentile)",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, http_request_duration_seconds_bucket)"
          }
        ]
      },
      {
        "title": "Error Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total{status_code=~\"5..\"}[5m])"
          }
        ]
      },
      {
        "title": "Active Connections",
        "targets": [
          {
            "expr": "active_connections"
          }
        ]
      }
    ]
  }
}
```

### Key Metrics to Monitor

#### Application Metrics
- Request rate (requests/sec)
- Response time (p50, p95, p99)
- Error rate (%)
- Active connections

#### System Metrics
- CPU usage (%)
- Memory usage (%)
- Disk I/O
- Network traffic

#### Database Metrics
- Query duration
- Active connections
- Slow queries
- Transaction rate

#### Business Metrics
- User registrations
- Credential creations
- API usage per endpoint
- AI recommendation accuracy

## Best Practices

### 1. Log Sensitive Data Carefully

```typescript
// ✓ Good: Redact sensitive data
logger.info('User login', {
  userId: user.id,
  email: maskEmail(user.email),
  // Don't log: password, tokens, credit cards
});

// ✗ Bad: Logging sensitive data
logger.info('User login', {
  email: user.email,
  password: user.password,  // Never log passwords!
});
```

### 2. Use Structured Logs

```typescript
// ✓ Good: Structured logging
logger.info('Credential created', {
  credentialId: credential.id,
  title: credential.title,
  institutionId: credential.institutionId,
  userId: user.id,
  duration: executionTime,
});

// ✗ Bad: String concatenation
logger.info(`Credential ${credential.id} created by ${user.id}`);
```

### 3. Set Appropriate Log Levels

- Production: `info` or `warn`
- Staging: `debug`
- Development: `debug` or `silly`

### 4. Monitor What Matters

Focus on:
- User-facing metrics (response time, errors)
- Business metrics (conversions, usage)
- Resource utilization (CPU, memory)
- Security events (failed logins, unauthorized access)

### 5. Set Up Alerts Wisely

- Alert on actionable issues only
- Avoid alert fatigue
- Use appropriate severity levels
- Include context in alerts

## Next Steps

- [Deployment Guide](deployment-guide.md) - Deploy to production
- [Docker Setup](docker-setup.md) - Configure containers
- [Troubleshooting](../getting-started/troubleshooting.md) - Debug issues

---

**Remember**: Good monitoring is essential for maintaining a healthy production system!

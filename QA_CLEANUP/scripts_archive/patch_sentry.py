import re
with open('src/main.jsx', 'r') as f:
    content = f.read()

sentry_init = """
if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    tracesSampleRate: 1.0, 
    replaysSessionSampleRate: 0.1, 
    replaysOnErrorSampleRate: 1.0 
  });
}
"""
content = re.sub(r'Sentry\.init\(\{[^}]+\}\);?', sentry_init, content, flags=re.MULTILINE|re.DOTALL)

with open('src/main.jsx', 'w') as f:
    f.write(content)

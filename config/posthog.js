import { PostHog } from 'posthog-node';

const apiKey = process.env.POSTHOG_API_KEY;

export const posthog = apiKey
  ? new PostHog(apiKey, {
      host: process.env.POSTHOG_HOST || 'https://app.posthog.com',
      flushAt: 20,
      flushInterval: 10000,
    })
  : null;

if (!apiKey) {
  console.warn('[PostHog] POSTHOG_API_KEY not set — analytics disabled.');
}

if (posthog) {
  process.on('exit', () => posthog.shutdown());
}

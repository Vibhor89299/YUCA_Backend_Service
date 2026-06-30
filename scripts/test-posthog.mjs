/**
 * PostHog event test script — fires all tracked events with realistic mock data
 * Run: node scripts/test-posthog.mjs
 */
import { PostHog } from 'posthog-node';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Read env manually (avoid importing config/env.js which might error without full setup)
const envPath = resolve(__dirname, '../.env');
const env = Object.fromEntries(
  readFileSync(envPath, 'utf-8')
    .split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => l.split('=').map(s => s.trim()))
);

const API_KEY = env.POSTHOG_API_KEY;
const HOST = env.POSTHOG_HOST || 'https://us.i.posthog.com';

if (!API_KEY) {
  console.error('POSTHOG_API_KEY not found in .env');
  process.exit(1);
}

const client = new PostHog(API_KEY, { host: HOST, flushAt: 1, flushInterval: 0 });

// Mock test data
const TEST_USER = {
  id: 'test-user-script-001',
  email: 'testuser@yucalifestyle.com',
  name: 'Test User',
};

const TEST_PRODUCT = {
  id: 'prod-abc123',
  name: 'Yuca Lifestyle Tote Bag',
  price: 999,
  category: 'accessories',
};

const TEST_ORDER = {
  id: 'order-xyz789',
  total: 1998,
  status: 'paid',
  items: 2,
};

function capture(event, distinctId, props = {}) {
  const label = `[${event}]`.padEnd(35);
  client.capture({ distinctId, event, properties: props });
  console.log(`  ${label} userId=${distinctId}`);
}

async function run() {
  console.log(`\nPostHog Test Script`);
  console.log(`Host  : ${HOST}`);
  console.log(`Key   : ${API_KEY.slice(0, 12)}...`);
  console.log(`User  : ${TEST_USER.id}\n`);
  console.log('Firing events...\n');

  // 1. User registered
  client.identify({
    distinctId: TEST_USER.id,
    properties: { email: TEST_USER.email, name: TEST_USER.name, source: 'test-script' },
  });
  capture('user_registered', TEST_USER.id, { method: 'email' });

  // 2. User logged in
  capture('user_logged_in', TEST_USER.id, { email: TEST_USER.email });

  // 3. Page views
  for (const path of ['/', '/category/accessories', '/cart', '/checkout']) {
    capture('$pageview', TEST_USER.id, {
      $current_url: `http://localhost:5173${path}`,
      $pathname: path,
    });
  }

  // 4. Category viewed
  capture('category_viewed', TEST_USER.id, {
    category: TEST_PRODUCT.category,
  });

  // 5. Product viewed
  capture('product_viewed', TEST_USER.id, {
    product_id: TEST_PRODUCT.id,
    name: TEST_PRODUCT.name,
    price: TEST_PRODUCT.price,
    category: TEST_PRODUCT.category,
  });

  // 6. Cart events
  capture('product_added_to_cart', TEST_USER.id, {
    product_id: TEST_PRODUCT.id,
    name: TEST_PRODUCT.name,
    price: TEST_PRODUCT.price,
    quantity: 1,
  });

  capture('cart_viewed', TEST_USER.id, {
    items: 1,
    total: TEST_PRODUCT.price,
  });

  capture('cart_quantity_updated', TEST_USER.id, {
    product_id: TEST_PRODUCT.id,
    old_quantity: 1,
    new_quantity: 2,
  });

  capture('product_added_to_cart', TEST_USER.id, {
    product_id: TEST_PRODUCT.id,
    name: TEST_PRODUCT.name,
    price: TEST_PRODUCT.price,
    quantity: 2,
  });

  // 7. Checkout flow
  capture('checkout_started', TEST_USER.id, {
    items: 2,
    total: TEST_ORDER.total,
  });

  capture('payment_initiated', TEST_USER.id, {
    order_id: TEST_ORDER.id,
    amount: TEST_ORDER.total,
    currency: 'INR',
  });

  capture('payment_completed', TEST_USER.id, {
    order_id: TEST_ORDER.id,
    amount: TEST_ORDER.total,
    currency: 'INR',
    payment_method: 'razorpay',
  });

  // 8. Backend server events
  capture('order_placed', TEST_USER.id, {
    order_id: TEST_ORDER.id,
    total: TEST_ORDER.total,
    items: TEST_ORDER.items,
    source: 'backend-script',
  });

  capture('payment_verified_server', TEST_USER.id, {
    order_id: TEST_ORDER.id,
    amount: TEST_ORDER.total,
    source: 'backend-script',
  });

  capture('user_registered_server', TEST_USER.id, {
    email: TEST_USER.email,
    source: 'backend-script',
  });

  // 9. Order viewed
  capture('order_viewed', TEST_USER.id, {
    order_id: TEST_ORDER.id,
    total: TEST_ORDER.total,
    status: TEST_ORDER.status,
  });

  // 10. Logout
  capture('user_logged_out', TEST_USER.id, {});

  await client.shutdown();
  console.log('\nAll events flushed to PostHog.');
  console.log(`\nCheck PostHog Live Events:`);
  console.log(`  https://us.i.posthog.com/activity/live\n`);
}

run().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});

# Real-Time Analytics System

## Overview
A complete analytics tracking system that captures real website statistics including visits, active users, orders, and growth metrics.

## Backend Setup

### 1. Install Dependencies
```bash
cd backend
npm install cookie-parser
```

### 2. Database Model
**File:** `models/Analytics.js`

Tracks:
- Total visits (all-time and daily)
- Unique visitors
- Page views
- Active users (last 5 minutes)
- User sessions with metadata

### 3. API Endpoints

#### Public Endpoints:
- **POST `/api/analytics/visit`** - Track page visit
  - Automatically creates/updates session
  - Sets session cookie (30 min expiry)
  - Tracks user agent and IP

- **GET `/api/analytics/stats`** - Get website statistics
  - Returns today's stats
  - All-time totals
  - Total orders
  - Growth rate (vs yesterday)

#### Admin Endpoint:
- **GET `/api/analytics/dashboard`** - Get detailed analytics
  - Requires authentication
  - Historical data (default 30 days)
  - Order statistics

### 4. Response Format

```json
{
  "today": {
    "totalVisits": 145,
    "uniqueVisitors": 89,
    "pageViews": 234,
    "activeUsers": 12
  },
  "allTime": {
    "totalVisits": 5432,
    "uniqueVisitors": 3210,
    "pageViews": 8765
  },
  "orders": {
    "total": 342
  },
  "growth": {
    "rate": 24.5
  }
}
```

## Frontend Integration

### WebsiteStats Component
**File:** `frontend/src/components/stats/WebsiteStats.tsx`

Features:
- Automatically tracks visit on page load
- Fetches real stats from API
- Auto-refreshes every 30 seconds
- Displays 4 key metrics with icons
- Fallback values if API fails
- Luxury-themed design

### Usage
```tsx
import { WebsiteStats } from '@/components/stats/WebsiteStats';

// Add to any page
<WebsiteStats />
```

## How It Works

### Session Tracking
1. User visits website
2. Backend checks for session cookie
3. If no cookie → creates new session (unique visitor)
4. If cookie exists → updates existing session
5. Session expires after 30 minutes of inactivity

### Active Users
- Counts sessions with activity in last 5 minutes
- Updates in real-time
- Automatically removes inactive sessions

### Growth Rate
- Compares today's visits with yesterday
- Formula: `((today - yesterday) / yesterday) * 100`
- Shows percentage increase/decrease

## Privacy & Security

### Data Collected:
- Session ID (anonymous UUID)
- User agent (browser info)
- IP address (for analytics only)
- Timestamps

### Privacy Features:
- No personal information stored
- Session IDs are random UUIDs
- Cookies are HTTP-only
- 30-minute session expiry
- Compliant with privacy standards

## Deployment Notes

### Environment Variables
No additional env variables needed. Uses existing MongoDB connection.

### CORS Configuration
Make sure your backend CORS settings allow cookies:

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

### Frontend Axios Configuration
Ensure axios sends cookies:

```javascript
axiosinstance.defaults.withCredentials = true;
```

## Admin Dashboard (Future Enhancement)

You can create an admin dashboard using the `/api/analytics/dashboard` endpoint:

```javascript
// Example: Get last 30 days of analytics
const response = await axios.get('/api/analytics/dashboard?days=30');

// Returns:
{
  analytics: [
    {
      date: "2025-10-26",
      totalVisits: 145,
      uniqueVisitors: 89,
      activeUsers: 12
    },
    // ... more days
  ],
  orders: {
    total: 342,
    recent: 45
  }
}
```

## Testing

### Test Visit Tracking:
```bash
curl -X POST http://localhost:5001/api/analytics/visit
```

### Test Stats Retrieval:
```bash
curl http://localhost:5001/api/analytics/stats
```

## Monitoring

### Check Today's Stats:
```javascript
// In MongoDB
db.analytics.find().sort({ date: -1 }).limit(1)
```

### View Active Sessions:
```javascript
// In MongoDB
db.analytics.findOne({ date: { $gte: new Date().setHours(0,0,0,0) } })
  .sessions.filter(s => new Date(s.lastActivity) > new Date(Date.now() - 5*60*1000))
```

## Performance

- Indexed queries for fast lookups
- Session cleanup happens automatically
- Minimal database writes (batched per visit)
- Efficient aggregation for all-time stats

## Troubleshooting

### Stats not updating?
1. Check backend is running
2. Verify MongoDB connection
3. Check browser console for errors
4. Ensure cookies are enabled

### Active users always 0?
- Wait 5 minutes after first visit
- Check session timestamps in database
- Verify cookie is being set

### Growth rate showing 0?
- Need at least 2 days of data
- Check if yesterday's analytics exist
- Verify date calculations

## Next Steps

1. **Install cookie-parser**: `npm install cookie-parser`
2. **Restart backend server**
3. **Visit your website** - stats will start tracking automatically
4. **Check stats** - Refresh page to see updated numbers

The system is now live and tracking real visitor data! 🎉

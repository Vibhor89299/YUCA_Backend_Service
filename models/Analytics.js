import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  totalVisits: {
    type: Number,
    default: 0
  },
  uniqueVisitors: {
    type: Number,
    default: 0
  },
  pageViews: {
    type: Number,
    default: 0
  },
  activeUsers: {
    type: Number,
    default: 0
  },
  // Track visitor sessions
  sessions: [{
    sessionId: String,
    startTime: Date,
    lastActivity: Date,
    pageViews: Number,
    userAgent: String,
    ipAddress: String
  }]
}, {
  timestamps: true
});

// Index for efficient queries
analyticsSchema.index({ date: -1 });
analyticsSchema.index({ 'sessions.sessionId': 1 });

// Method to get today's analytics
analyticsSchema.statics.getTodayStats = async function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let analytics = await this.findOne({ 
    date: { $gte: today } 
  });
  
  if (!analytics) {
    analytics = await this.create({ date: today });
  }
  
  return analytics;
};

// Method to increment visits
analyticsSchema.methods.incrementVisit = async function(sessionId, userAgent, ipAddress) {
  this.totalVisits += 1;
  this.pageViews += 1;
  
  // Check if session exists
  const existingSession = this.sessions.find(s => s.sessionId === sessionId);
  
  if (existingSession) {
    existingSession.lastActivity = new Date();
    existingSession.pageViews += 1;
  } else {
    this.uniqueVisitors += 1;
    this.sessions.push({
      sessionId,
      startTime: new Date(),
      lastActivity: new Date(),
      pageViews: 1,
      userAgent,
      ipAddress
    });
  }
  
  // Update active users (sessions active in last 5 minutes)
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  this.activeUsers = this.sessions.filter(s => 
    new Date(s.lastActivity) > fiveMinutesAgo
  ).length;
  
  await this.save();
  return this;
};

const Analytics = mongoose.model('Analytics', analyticsSchema);

export default Analytics;

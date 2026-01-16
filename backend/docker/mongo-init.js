// MongoDB initialization script for Aizesk
// This script runs when the MongoDB container is first created

// Switch to admin database to authenticate
db = db.getSiblingDB("admin");

// Create databases and users for each service
const databases = [
  "aizesk_auth",
  "aizesk_users",
  "aizesk_transactions",
  "aizesk_subscriptions",
  "aizesk_platforms",
  "aizesk_notifications",
  "aizesk_reports",
];

databases.forEach(function (dbName) {
  print("Creating database: " + dbName);
  db = db.getSiblingDB(dbName);

  // Create an initial collection to ensure the database exists
  db.createCollection("_init");

  // Add some indexes for common queries
  if (dbName === "aizesk_auth") {
    db.users.createIndex({ email: 1 }, { unique: true });
    db.tokens.createIndex({ token: 1 });
    db.tokens.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  }

  if (dbName === "aizesk_users") {
    db.user_profiles.createIndex({ userId: 1 }, { unique: true });
    db.business_info.createIndex({ userId: 1 });
  }

  if (dbName === "aizesk_transactions") {
    db.transactions.createIndex({ userId: 1 });
    db.transactions.createIndex({ createdAt: -1 });
    db.transactions.createIndex({ platformId: 1 });
  }

  if (dbName === "aizesk_subscriptions") {
    db.subscriptions.createIndex({ userId: 1 }, { unique: true });
    db.subscription_limits.createIndex({ planType: 1 });
  }

  if (dbName === "aizesk_platforms") {
    db.platform_connections.createIndex({ userId: 1 });
    db.platform_connections.createIndex({ platformType: 1 });
    db.oauth_tokens.createIndex({ userId: 1, platformType: 1 });
  }

  if (dbName === "aizesk_notifications") {
    db.in_app_notifications.createIndex({ userId: 1 });
    db.in_app_notifications.createIndex({ status: 1 });
    db.in_app_notifications.createIndex({ createdAt: -1 });
    db.email_notifications.createIndex({ recipientEmail: 1 });
  }

  if (dbName === "aizesk_reports") {
    db.reports.createIndex({ userId: 1 });
    db.reports.createIndex({ createdAt: -1 });
  }

  print("Database " + dbName + " initialized successfully");
});

print("===========================================");
print("MongoDB initialization completed!");
print("Created " + databases.length + " databases");
print("===========================================");

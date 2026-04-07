const https = require("https");
const http = require("http");

const BACKEND_URL = process.env.RENDER_EXTERNAL_URL || "http://localhost:5000";
const INTERVAL = 10 * 60 * 1000; // Every 10 minutes

console.log("🕐 Keep-alive service started");
console.log(`📍 Pinging: ${BACKEND_URL}`);
console.log(`⏱️  Interval: Every 10 minutes`);

setInterval(() => {
  const protocol = BACKEND_URL.startsWith("https") ? https : http;
  
  protocol.get(BACKEND_URL, (res) => {
    console.log(`✅ [${new Date().toLocaleTimeString()}] Pinged - Status: ${res.statusCode}`);
  }).on("error", (err) => {
    console.error(`❌ [${new Date().toLocaleTimeString()}] Ping failed:`, err.message);
  }).setTimeout(5000);  // 5 second timeout per request
}, INTERVAL);

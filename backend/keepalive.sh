#!/bin/sh
# Simple keep‑alive loop to prevent Render free tier from sleeping
# Sends a lightweight GET request to the health endpoint every 5 minutes
# Runs in background, then starts the main Java application

# Wait for Spring Boot to fully start before the first ping
sleep 60

while true; do
  curl -s http://localhost:${PORT:-10000}/health > /dev/null
  sleep 270   # ping every ~5 minutes total (60s start-up + 270s = 330s worst case, well under 15min)
done &

# Exec the original Java command (preserves PID 1 for proper signal handling)
exec java -XX:InitialRAMPercentage=40.0 -XX:MaxRAMPercentage=75.0 -XX:+ExitOnOutOfMemoryError -Dserver.port=${PORT:-10000} -Djava.security.egd=file:/dev/./urandom -Djava.net.preferIPv4Stack=true -jar app.jar

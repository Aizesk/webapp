#!/bin/bash
# ===========================================
# AIZESK — SonarCloud Analysis Script
# ===========================================
# Runs static analysis on all microservices and the webapp.
#
# Prerequisites:
#   1. Create a free account at https://sonarcloud.io (log in with GitHub).
#   2. Create an Organization (use your GitHub username as the org key).
#   3. Go to My Account → Security → Generate a Token.
#   4. Run this script: ./sonar-analyze.sh <YOUR_TOKEN> <YOUR_ORG_KEY>
#
# Usage:
#   ./sonar-analyze.sh sk_live_abc123 my-org-key
# ===========================================

set -euo pipefail

SONAR_TOKEN="${1:-}"
SONAR_ORG="${2:-}"
SONAR_HOST="https://sonarcloud.io"

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

if [ -z "$SONAR_TOKEN" ] || [ -z "$SONAR_ORG" ]; then
  echo -e "${RED}Usage: ./sonar-analyze.sh <SONAR_TOKEN> <ORG_KEY>${NC}"
  echo ""
  echo "  SONAR_TOKEN  — Token from: https://sonarcloud.io/account/security"
  echo "  ORG_KEY      — Your SonarCloud organization key (usually your GitHub username)"
  echo ""
  echo "Example:"
  echo "  ./sonar-analyze.sh sk_live_abc123 enrique-lovera"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVICES=(
  "auth-service"
  "user-service"
  "subscription-service"
  "transaction-service"
  "notification-service"
  "platform-connection-service"
  "reporting-service"
)

echo ""
echo -e "${BOLD}╔══════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║       AIZESK — SonarCloud Analysis           ║${NC}"
echo -e "${BOLD}╚══════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}ℹ  Organization: ${SONAR_ORG}${NC}"
echo -e "${BLUE}ℹ  Host:         ${SONAR_HOST}${NC}"
echo ""

# ---- Analyze Java microservices ----
for SERVICE in "${SERVICES[@]}"; do
  SERVICE_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)/$SERVICE"

  if [ ! -d "$SERVICE_DIR" ]; then
    echo -e "${RED}⚠ Skipping $SERVICE — directory not found${NC}"
    continue
  fi

  echo -e "${BOLD}── Analyzing: $SERVICE ──${NC}"
  cd "$SERVICE_DIR"

  # Build first to generate .class files for analysis
  mvn clean package -DskipTests -q

  # Run SonarCloud analysis
  mvn sonar:sonar \
    -Dsonar.projectKey="aizesk_${SERVICE}" \
    -Dsonar.organization="$SONAR_ORG" \
    -Dsonar.host.url="$SONAR_HOST" \
    -Dsonar.token="$SONAR_TOKEN" \
    -Dsonar.java.binaries=target/classes \
    -q

  echo -e "${GREEN}✅ $SERVICE — analysis complete${NC}"
  echo ""
done

# ---- Analyze Angular webapp ----
WEBAPP_DIR="$(cd "$SCRIPT_DIR/.." && pwd)/webapp"
if [ -d "$WEBAPP_DIR" ]; then
  echo -e "${BOLD}── Analyzing: webapp (Angular) ──${NC}"
  cd "$WEBAPP_DIR"

  # Install sonar-scanner if not present
  if ! command -v sonar-scanner &>/dev/null; then
    echo "  Installing sonar-scanner via npx..."
  fi

  npx sonar-scanner \
    -Dsonar.projectKey="aizesk_webapp" \
    -Dsonar.organization="$SONAR_ORG" \
    -Dsonar.host.url="$SONAR_HOST" \
    -Dsonar.token="$SONAR_TOKEN" \
    -Dsonar.sources=src \
    -Dsonar.exclusions="**/node_modules/**,**/*.spec.ts,**/dist/**" \
    2>/dev/null

  echo -e "${GREEN}✅ webapp — analysis complete${NC}"
fi

echo ""
echo -e "${BOLD}════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ All analyses complete!${NC}"
echo ""
echo -e "  📊 View your results at:"
echo -e "  ${BOLD}https://sonarcloud.io/organizations/${SONAR_ORG}/projects${NC}"
echo -e "${BOLD}════════════════════════════════════════════════${NC}"
echo ""

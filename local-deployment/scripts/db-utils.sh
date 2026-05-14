#!/bin/bash
# =====================================================
# AIZESK Platform - Database Utilities
# =====================================================
# Utilities for managing the MySQL database.
# To start/stop the database, use: docker-compose up/down
# =====================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
CONTAINER_NAME="aizesk-mysql"
MYSQL_USER="aizesk"
MYSQL_PASSWORD="aizesk-mysql-2024"
MYSQL_DATABASE="aizesk"
MYSQL_ROOT_PASSWORD="root-password-2024"

# Directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DB_DIR="$(dirname "$SCRIPT_DIR")/db"

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}   AIZESK Platform - Database Utilities         ${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Function to check if container is running
container_running() {
    docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"
}

# Main logic
case "${1:-}" in
    "status")
        if container_running; then
            echo -e "${GREEN}✅ MySQL container is running${NC}"
            echo ""
            echo -e "${BLUE}Connection info:${NC}"
            echo "  Host: localhost"
            echo "  Port: 3307"
            echo "  Database: $MYSQL_DATABASE"
            echo "  User: $MYSQL_USER"
            echo "  Password: $MYSQL_PASSWORD"
        else
            echo -e "${RED}❌ MySQL container is not running${NC}"
            echo "  Run: ./start-deployment-docker.sh"
        fi
        ;;
        
    "shell")
        if ! container_running; then
            echo -e "${RED}❌ MySQL container is not running${NC}"
            exit 1
        fi
        echo -e "${BLUE}🔌 Connecting to MySQL...${NC}"
        docker exec -it $CONTAINER_NAME mysql -u $MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE
        ;;
        
    "shell-root")
        if ! container_running; then
            echo -e "${RED}❌ MySQL container is not running${NC}"
            exit 1
        fi
        echo -e "${BLUE}🔌 Connecting to MySQL as root...${NC}"
        docker exec -it $CONTAINER_NAME mysql -u root -p$MYSQL_ROOT_PASSWORD
        ;;
        
    "logs")
        docker logs -f $CONTAINER_NAME
        ;;
        
    "reset")
        echo -e "${RED}⚠️  WARNING: This will DELETE all data!${NC}"
        read -p "Are you sure? (y/N): " confirm
        if [[ "$confirm" =~ ^[Yy]([Ee][Ss])?$ ]]; then
            echo -e "${YELLOW}🗑️  Resetting database...${NC}"
            cd "$(dirname "$SCRIPT_DIR")"
            docker-compose down -v
            docker-compose up -d mysql
            echo -e "${YELLOW}⏳ Waiting for MySQL to be ready...${NC}"
            sleep 10
            echo -e "${GREEN}✅ Database reset complete!${NC}"
        else
            echo -e "${BLUE}Operation cancelled.${NC}"
        fi
        ;;
        
    "seed")
        if ! container_running; then
            echo -e "${RED}❌ MySQL container is not running${NC}"
            exit 1
        fi
        echo -e "${YELLOW}🌱 Running seed data...${NC}"
        docker exec -i $CONTAINER_NAME mysql -u $MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE < "$DB_DIR/02-seed-data.sql"
        echo -e "${GREEN}✅ Seed data inserted!${NC}"
        ;;
        
    "exec")
        if [ -z "${2:-}" ]; then
            echo -e "${RED}Usage: ./db-utils.sh exec <sql-file>${NC}"
            exit 1
        fi
        if ! container_running; then
            echo -e "${RED}❌ MySQL container is not running${NC}"
            exit 1
        fi
        echo -e "${YELLOW}📄 Executing SQL file: $2${NC}"
        docker exec -i $CONTAINER_NAME mysql -u $MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE < "$2"
        echo -e "${GREEN}✅ SQL executed!${NC}"
        ;;
        
    *)
        echo -e "${BLUE}Usage:${NC} ./db-utils.sh <command>"
        echo ""
        echo -e "${BLUE}Commands:${NC}"
        echo "  status      Check container status and connection info"
        echo "  shell       Connect to MySQL as aizesk user"
        echo "  shell-root  Connect to MySQL as root user"
        echo "  logs        View container logs (follow mode)"
        echo "  reset       Delete all data and restart (DESTRUCTIVE!)"
        echo "  seed        Re-run seed data script"
        echo "  exec <file> Execute a SQL file"
        echo ""
        echo -e "${BLUE}Note:${NC} To start/stop use docker-compose:"
        echo "  docker-compose up -d    # Start"
        echo "  docker-compose down     # Stop"
        ;;
esac

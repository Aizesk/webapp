#!/bin/bash
# =====================================================
# AIZESK Platform - Database Initialization Script
# =====================================================

set -e  # Exit on error

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
MYSQL_ROOT_PASSWORD="root"

# Directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DB_DIR="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}   AIZESK Platform - Database Initialization    ${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Function to wait for MySQL to be ready
wait_for_mysql() {
    echo -e "${YELLOW}⏳ Waiting for MySQL to be ready...${NC}"
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker exec $CONTAINER_NAME mysqladmin ping -h localhost -u root -p$MYSQL_ROOT_PASSWORD --silent 2>/dev/null; then
            echo -e "${GREEN}✅ MySQL is ready!${NC}"
            return 0
        fi
        echo -e "   Attempt $attempt/$max_attempts..."
        sleep 2
        ((attempt++))
    done
    
    echo -e "${RED}❌ MySQL failed to start after $max_attempts attempts${NC}"
    return 1
}

# Function to check if container exists
container_exists() {
    docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"
}

# Function to check if container is running
container_running() {
    docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"
}

# Main logic
case "${1:-}" in
    "start")
        echo -e "${YELLOW}🐳 Starting MySQL container...${NC}"
        cd "$DB_DIR"
        docker-compose up -d
        wait_for_mysql
        echo -e "${GREEN}✅ Database started successfully!${NC}"
        ;;
        
    "stop")
        echo -e "${YELLOW}🛑 Stopping MySQL container...${NC}"
        cd "$DB_DIR"
        docker-compose down
        echo -e "${GREEN}✅ Database stopped!${NC}"
        ;;
        
    "reset")
        echo -e "${RED}⚠️  WARNING: This will DELETE all data!${NC}"
        read -p "Are you sure? (y/N): " confirm
        if [[ "$confirm" =~ ^[Yy]([Ee][Ss])?$ ]]; then
            echo -e "${YELLOW}🗑️  Resetting database...${NC}"
            cd "$DB_DIR"
            docker-compose down -v
            docker-compose up -d
            wait_for_mysql
            echo -e "${GREEN}✅ Database reset complete!${NC}"
        else
            echo -e "${BLUE}Operation cancelled.${NC}"
        fi
        ;;
        
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
            echo ""
            echo -e "${BLUE}Connect with:${NC}"
            echo "  docker exec -it $CONTAINER_NAME mysql -u $MYSQL_USER -p'$MYSQL_PASSWORD' $MYSQL_DATABASE"
        elif container_exists; then
            echo -e "${YELLOW}⚠️  MySQL container exists but is not running${NC}"
            echo "  Run: ./init-db.sh start"
        else
            echo -e "${RED}❌ MySQL container does not exist${NC}"
            echo "  Run: ./init-db.sh start"
        fi
        ;;
        
    "logs")
        docker logs -f $CONTAINER_NAME
        ;;
        
    "shell")
        echo -e "${BLUE}🔌 Connecting to MySQL...${NC}"
        docker exec -it $CONTAINER_NAME mysql -u $MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE
        ;;
        
    "shell-root")
        echo -e "${BLUE}🔌 Connecting to MySQL as root...${NC}"
        docker exec -it $CONTAINER_NAME mysql -u root -p$MYSQL_ROOT_PASSWORD
        ;;
        
    "seed")
        echo -e "${YELLOW}🌱 Running seed data...${NC}"
        docker exec -i $CONTAINER_NAME mysql -u $MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE < "$DB_DIR/init/02-seed-data.sql"
        echo -e "${GREEN}✅ Seed data inserted!${NC}"
        ;;
        
    "exec")
        if [ -z "${2:-}" ]; then
            echo -e "${RED}Usage: ./init-db.sh exec <sql-file>${NC}"
            exit 1
        fi
        echo -e "${YELLOW}📄 Executing SQL file: $2${NC}"
        docker exec -i $CONTAINER_NAME mysql -u $MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE < "$2"
        echo -e "${GREEN}✅ SQL executed!${NC}"
        ;;
        
    *)
        echo -e "${BLUE}Usage:${NC} ./init-db.sh <command>"
        echo ""
        echo -e "${BLUE}Commands:${NC}"
        echo "  start       Start the MySQL container"
        echo "  stop        Stop the MySQL container"
        echo "  reset       Delete all data and restart (DESTRUCTIVE!)"
        echo "  status      Check container status and connection info"
        echo "  logs        View container logs (follow mode)"
        echo "  shell       Connect to MySQL as aizesk user"
        echo "  shell-root  Connect to MySQL as root user"
        echo "  seed        Re-run seed data script"
        echo "  exec <file> Execute a SQL file"
        echo ""
        echo -e "${BLUE}Quick start:${NC}"
        echo "  cd database"
        echo "  ./scripts/init-db.sh start"
        ;;
esac

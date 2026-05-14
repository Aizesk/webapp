#!/bin/bash

# ===========================================
# AIZESK - Sync All Repositories
# ===========================================
# This script pulls the latest changes from main and develop
# branches for all microservices.
#
# Usage: ./sync-repos.sh [--main-only] [--develop-only]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Base directory (parent of local-deployment)
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"

# All repositories
REPOS=(
    "auth-service"
    "notification-service"
    "platform-connection-service"
    "reporting-service"
    "subscription-service"
    "transaction-service"
    "user-service"
    "webapp"
)

# Parse arguments
SYNC_MAIN=true
SYNC_DEVELOP=true

if [[ "$1" == "--main-only" ]]; then
    SYNC_DEVELOP=false
elif [[ "$1" == "--develop-only" ]]; then
    SYNC_MAIN=false
fi

echo ""
echo -e "${BLUE}🔄 Aizesk Repository Sync${NC}"
echo "====================================================="
echo -e "Base directory: ${YELLOW}$BASE_DIR${NC}"
echo ""

# Function to sync a branch
sync_branch() {
    local repo=$1
    local branch=$2
    local repo_path="$BASE_DIR/$repo"
    
    if [ ! -d "$repo_path" ]; then
        echo -e "  ${YELLOW}⚠️  Directory not found, skipping${NC}"
        return
    fi
    
    cd "$repo_path"
    
    # Check if branch exists
    if ! git show-ref --verify --quiet "refs/heads/$branch" 2>/dev/null; then
        # Try to fetch and checkout if it exists remotely
        if git ls-remote --heads origin "$branch" | grep -q "$branch"; then
            git fetch origin "$branch" >/dev/null 2>&1
            git checkout -b "$branch" "origin/$branch" >/dev/null 2>&1 || true
        else
            echo -e "  ${YELLOW}⚠️  Branch '$branch' not found${NC}"
            return
        fi
    fi
    
    # Get current branch
    current_branch=$(git branch --show-current)
    
    # Stash any changes if needed
    stash_needed=false
    if ! git diff --quiet 2>/dev/null || ! git diff --cached --quiet 2>/dev/null; then
        stash_needed=true
        git stash push -m "auto-stash before sync" >/dev/null 2>&1
    fi
    
    # Checkout and pull
    git checkout "$branch" >/dev/null 2>&1
    
    if git pull origin "$branch" >/dev/null 2>&1; then
        echo -e "  ${GREEN}✅ $branch${NC} - updated"
    else
        echo -e "  ${RED}❌ $branch${NC} - pull failed"
    fi
    
    # Return to original branch
    if [ "$current_branch" != "$branch" ]; then
        git checkout "$current_branch" >/dev/null 2>&1
    fi
    
    # Restore stash if needed
    if [ "$stash_needed" = true ]; then
        git stash pop >/dev/null 2>&1 || true
    fi
}

# Sync each repository
for repo in "${REPOS[@]}"; do
    echo -e "${BLUE}📦 $repo${NC}"
    
    repo_path="$BASE_DIR/$repo"
    
    if [ ! -d "$repo_path/.git" ]; then
        echo -e "  ${YELLOW}⚠️  Not a git repository, skipping${NC}"
        echo ""
        continue
    fi
    
    if [ "$SYNC_MAIN" = true ]; then
        sync_branch "$repo" "main"
    fi
    
    if [ "$SYNC_DEVELOP" = true ]; then
        sync_branch "$repo" "develop"
    fi
    
    echo ""
done

echo "====================================================="
echo -e "${GREEN}✅ Sync complete!${NC}"
echo ""

#!/bin/bash
# ===========================================
# AIZESK — Deploy Script for AWS Academy Learner Lab
# ===========================================
# Usage:
#   ./deploy.sh setup         Configure AWS credentials from Learner Lab
#   ./deploy.sh infra         Create/update infrastructure (terraform apply)
#   ./deploy.sh db [seed]     Initialize database schema (optionally with seed data)
#   ./deploy.sh backend [svc] Build and deploy one or all backend services
#   ./deploy.sh frontend      Build and deploy Angular frontend
#   ./deploy.sh status        Show deployment status
#   ./deploy.sh destroy       Destroy all infrastructure
#
# Prerequisites:
#   - Terraform >= 1.5     (brew install terraform)
#   - AWS CLI v2           (brew install awscli)
#   - Docker Desktop       (running, for backend builds)
#   - Node.js >= 20        (for frontend build)
#   - Java 21 + Maven      (for backend builds)
#   - MySQL client         (brew install mysql-client — only for 'db' command)
#
# First-time deployment order:
#   1. ./deploy.sh setup
#   2. Edit deployment/terraform/terraform.tfvars
#   3. ./deploy.sh infra
#   4. ./deploy.sh db seed
#   5. ./deploy.sh backend
#   6. ./deploy.sh frontend

set -euo pipefail

# ---- Colors ----
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# ---- Project config ----
PROJECT_NAME="aizesk"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WEBAPP_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
TF_DIR="$SCRIPT_DIR/terraform"
SERVICES_DIR="$(cd "$WEBAPP_DIR/.." && pwd)"
SERVICES=(
  "auth-service"
  "user-service"
  "transaction-service"
  "subscription-service"
  "platform-connection-service"
  "notification-service"
  "reporting-service"
)

# ---- Helper functions ----
log_info()  { echo -e "${BLUE}ℹ  $*${NC}"; }
log_ok()    { echo -e "${GREEN}✅ $*${NC}"; }
log_warn()  { echo -e "${YELLOW}⚠️  $*${NC}"; }
log_error() { echo -e "${RED}❌ $*${NC}"; }
log_step()  { echo -e "\n${BOLD}${CYAN}=== $* ===${NC}"; }

check_command() {
  if ! command -v "$1" &>/dev/null; then
    log_error "$1 is not installed. $2"
    exit 1
  fi
}

tf_output() {
  cd "$TF_DIR"
  terraform output -raw "$1" 2>/dev/null
}

# ============================================================
# COMMAND: setup
# ============================================================
cmd_setup() {
  log_step "AWS Learner Lab Credentials Setup"

  echo ""
  echo "Instructions:"
  echo "  1. Go to AWS Academy → Modules → Learner Lab"
  echo "  2. Click 'Start Lab' and wait for the green circle"
  echo "  3. Click 'AWS Details' → 'Show' next to 'AWS CLI'"
  echo "  4. Copy ALL 3 lines (access key, secret key, session token)"
  echo ""
  echo "Paste your AWS credentials below (then press Enter on an empty line):"
  echo ""

  mkdir -p ~/.aws
  local creds_tmp
  creds_tmp=$(mktemp)

  while IFS= read -r line; do
    [[ -z "$line" ]] && break
    echo "$line" >> "$creds_tmp"
  done

  if grep -q "aws_access_key_id" "$creds_tmp"; then
    cat > ~/.aws/credentials <<EOF
[default]
$(cat "$creds_tmp")
EOF
    rm "$creds_tmp"
    log_ok "AWS credentials saved to ~/.aws/credentials"

    # Verify credentials
    local account_id
    account_id=$(aws sts get-caller-identity --query Account --output text 2>/dev/null || true)

    if [ -n "$account_id" ]; then
      local region
      region=$(aws configure get region 2>/dev/null || echo "us-east-1")
      echo ""
      log_ok "Account ID: $account_id"
      log_ok "Region:     $region"
      echo ""
      log_warn "Save your Account ID — you need it for terraform.tfvars"
      echo "  aws_account_id = \"$account_id\""
    else
      log_error "Credentials don't seem valid. Try again."
      exit 1
    fi
  else
    rm "$creds_tmp"
    log_error "Invalid format. Expected lines with aws_access_key_id=..."
    exit 1
  fi
}

# ============================================================
# COMMAND: infra
# ============================================================
cmd_infra() {
  log_step "Terraform: Create/Update Infrastructure"
  check_command terraform "brew install terraform"

  cd "$TF_DIR"

  if [ ! -f "terraform.tfvars" ]; then
    log_error "terraform.tfvars not found!"
    echo "  cp terraform.tfvars.example terraform.tfvars"
    echo "  Then edit it with your values."
    exit 1
  fi

  terraform init -upgrade

  echo ""
  log_info "Planning changes..."
  terraform plan -out=tfplan

  echo ""
  read -p "Apply this plan? (yes/no): " CONFIRM
  if [ "$CONFIRM" = "yes" ]; then
    terraform apply tfplan
    rm -f tfplan
    echo ""
    log_ok "Infrastructure created/updated!"
    echo ""
    terraform output
  else
    rm -f tfplan
    echo "Cancelled."
  fi
}

# ============================================================
# COMMAND: db
# ============================================================
cmd_db() {
  local seed="${1:-}"
  log_step "Database Initialization"
  check_command mysql "brew install mysql-client"

  cd "$TF_DIR"

  # Get RDS info from Terraform outputs
  local rds_endpoint rds_host
  rds_endpoint=$(tf_output rds_endpoint)
  rds_host=$(echo "$rds_endpoint" | cut -d: -f1)

  # Get credentials from SSM
  local db_user db_pass
  db_user=$(aws ssm get-parameter --name "/$PROJECT_NAME/database/username" --with-decryption --query 'Parameter.Value' --output text)
  db_pass=$(aws ssm get-parameter --name "/$PROJECT_NAME/database/password" --with-decryption --query 'Parameter.Value' --output text)

  # Get user's public IP
  local my_ip
  my_ip="$(curl -s https://checkip.amazonaws.com)/32"

  # Get RDS security group
  local vpc_id rds_sg
  vpc_id=$(tf_output vpc_id)
  rds_sg=$(aws ec2 describe-security-groups \
    --filters "Name=vpc-id,Values=$vpc_id" "Name=tag:Name,Values=*rds*" \
    --query 'SecurityGroups[0].GroupId' --output text)

  log_info "RDS endpoint: $rds_host"
  log_info "Your IP:      $my_ip"
  log_info "RDS SG:       $rds_sg"

  # Add temporary ingress rule
  log_info "Adding temporary access to RDS security group..."
  aws ec2 authorize-security-group-ingress \
    --group-id "$rds_sg" \
    --protocol tcp --port 3306 \
    --cidr "$my_ip" 2>/dev/null || log_warn "Rule may already exist"

  # Cleanup on exit
  cleanup_sg() {
    log_info "Removing temporary RDS access..."
    local rule_id
    rule_id=$(aws ec2 describe-security-group-rules \
      --filters "Name=group-id,Values=$rds_sg" \
      --query "SecurityGroupRules[?CidrIpv4=='$my_ip' && FromPort==\`3306\`].SecurityGroupRuleId" \
      --output text 2>/dev/null || true)
    if [ -n "$rule_id" ] && [ "$rule_id" != "None" ]; then
      aws ec2 revoke-security-group-ingress \
        --group-id "$rds_sg" \
        --security-group-rule-ids "$rule_id" 2>/dev/null || true
    fi
    log_ok "Temporary access removed"
  }
  trap cleanup_sg EXIT

  sleep 3

  # Run schema
  log_info "Applying database schema..."
  mysql -h "$rds_host" -u "$db_user" -p"$db_pass" "$PROJECT_NAME" \
    < "$WEBAPP_DIR/local-deployment/db/01-schema.sql"
  log_ok "Schema applied"

  # Seed data if requested
  if [ "$seed" = "seed" ]; then
    log_info "Loading seed data..."
    mysql -h "$rds_host" -u "$db_user" -p"$db_pass" "$PROJECT_NAME" \
      < "$WEBAPP_DIR/local-deployment/db/02-seed-data.sql"
    log_ok "Seed data loaded"
  fi

  # Show tables
  echo ""
  log_info "Database tables:"
  mysql -h "$rds_host" -u "$db_user" -p"$db_pass" -e "USE $PROJECT_NAME; SHOW TABLES;" 2>/dev/null
}

# ============================================================
# COMMAND: backend
# ============================================================
cmd_backend() {
  local target="${1:-all}"
  log_step "Backend Deployment"
  check_command docker "Install Docker Desktop"
  check_command mvn "brew install maven"

  cd "$TF_DIR"

  local region account_id ecr_registry
  region=$(tf_output aws_region)
  account_id=$(aws sts get-caller-identity --query Account --output text)
  ecr_registry="$account_id.dkr.ecr.$region.amazonaws.com"

  # ECR login
  log_info "Logging into ECR..."
  aws ecr get-login-password --region "$region" \
    | docker login --username AWS --password-stdin "$ecr_registry"

  # Determine which services to deploy
  local deploy_services=()
  if [ "$target" = "all" ]; then
    deploy_services=("${SERVICES[@]}")
  else
    deploy_services=("$target")
  fi

  for service in "${deploy_services[@]}"; do
    log_step "Building & deploying: $service"
    local service_dir="$SERVICES_DIR/$service"

    if [ ! -d "$service_dir" ]; then
      log_error "Directory not found: $service_dir"
      continue
    fi

    cd "$service_dir"

    # Maven build
    log_info "Maven build..."
    mvn clean package -DskipTests -B -q

    # Docker build (force linux/amd64 for Fargate on Apple Silicon)
    local image="$ecr_registry/$PROJECT_NAME/$service"
    log_info "Docker build (linux/amd64)..."
    docker build --platform linux/amd64 -t "$image:latest" .

    # Push to ECR
    log_info "Pushing to ECR..."
    docker push "$image:latest"

    # Update ECS service (force new deployment)
    log_info "Updating ECS service..."
    aws ecs update-service \
      --cluster "$PROJECT_NAME-cluster" \
      --service "$service" \
      --force-new-deployment \
      --region "$region" >/dev/null

    log_ok "$service deployed"
  done

  echo ""
  log_warn "Services are starting... Spring Boot takes ~60-120s"
  echo "  Check status: ./deploy.sh status"
}

# ============================================================
# COMMAND: frontend
# ============================================================
cmd_frontend() {
  log_step "Frontend Deployment"
  check_command node "Install Node.js >= 20"
  check_command npx "Install Node.js >= 20"

  cd "$TF_DIR"

  local alb_dns s3_bucket frontend_url
  alb_dns=$(tf_output alb_dns_name)
  s3_bucket=$(tf_output s3_frontend_bucket)
  frontend_url=$(tf_output frontend_url)

  cd "$WEBAPP_DIR"

  # Generate environment.prod.ts with actual ALB URL
  log_info "Configuring API URL → http://$alb_dns"
  cat > src/environments/environment.prod.ts <<EOF
// Auto-generated by deploy.sh — do not edit manually
const API_BASE = 'http://${alb_dns}';

export const environment = {
  production: true,
  apiUrls: {
    auth: \`\${API_BASE}/api/v1/auth\`,
    users: \`\${API_BASE}/api/v1/users\`,
    transactions: \`\${API_BASE}/api/v1/transactions\`,
    reporting: \`\${API_BASE}/api/v1/reports\`,
    subscriptions: \`\${API_BASE}/api/v1/subscriptions\`,
    platforms: \`\${API_BASE}/api/v1/platforms\`,
    notifications: \`\${API_BASE}/api/v1/notifications\`,
  },
  notificationsWs: \`ws://${alb_dns}/ws/notifications\`,
};
EOF

  # Install dependencies
  log_info "Installing npm dependencies..."
  npm ci

  # Build Angular
  log_info "Building Angular (production)..."
  npx ng build --configuration=production

  # Upload to S3
  local build_dir="dist/frontend/browser"
  if [ ! -d "$build_dir" ]; then
    build_dir="dist/frontend"
  fi

  log_info "Uploading to S3 ($s3_bucket)..."

  # Static assets with long cache
  aws s3 sync "$build_dir" "s3://$s3_bucket" \
    --delete \
    --cache-control "public, max-age=31536000, immutable" \
    --exclude "index.html" \
    --exclude "*.json"

  # index.html: no cache (always fresh)
  aws s3 cp "$build_dir/index.html" "s3://$s3_bucket/index.html" \
    --cache-control "no-cache, no-store, must-revalidate"

  # JSON files (ngsw, manifest): short cache
  find "$build_dir" -name "*.json" -not -name "package.json" | while read -r f; do
    local rel_path="${f#$build_dir/}"
    aws s3 cp "$f" "s3://$s3_bucket/$rel_path" \
      --cache-control "no-cache" 2>/dev/null || true
  done

  echo ""
  log_ok "Frontend deployed!"
  echo -e "   URL: ${BOLD}$frontend_url${NC}"
}

# ============================================================
# COMMAND: status
# ============================================================
cmd_status() {
  log_step "Deployment Status"

  cd "$TF_DIR"

  local region cluster
  region=$(tf_output aws_region 2>/dev/null || echo "us-east-1")
  cluster="$PROJECT_NAME-cluster"

  echo ""
  echo -e "${BOLD}Services:${NC}"
  for service in "${SERVICES[@]}"; do
    local info
    info=$(aws ecs describe-services \
      --cluster "$cluster" \
      --services "$service" \
      --query 'services[0].{desired: desiredCount, running: runningCount, status: status}' \
      --output json \
      --region "$region" 2>/dev/null || echo '{}')

    if echo "$info" | grep -q '"status"'; then
      local running desired status
      running=$(echo "$info" | grep -o '"running": [0-9]*' | grep -o '[0-9]*')
      desired=$(echo "$info" | grep -o '"desired": [0-9]*' | grep -o '[0-9]*')
      status=$(echo "$info" | grep -o '"status": "[^"]*"' | cut -d'"' -f4)

      if [ "$running" = "$desired" ] && [ "$running" != "0" ]; then
        echo -e "  ${GREEN}✅ $service ($running/$desired — $status)${NC}"
      else
        echo -e "  ${YELLOW}⏳ $service ($running/$desired — $status)${NC}"
      fi
    else
      echo -e "  ${RED}❌ $service (not deployed)${NC}"
    fi
  done

  echo ""
  echo -e "${BOLD}URLs:${NC}"
  local frontend_url api_url https_api_url
  frontend_url=$(tf_output frontend_url 2>/dev/null || echo "pending")
  api_url=$(tf_output api_url 2>/dev/null || echo "pending")
  https_api_url=$(tf_output https_api_url 2>/dev/null || echo "pending")
  
  echo "  Frontend:    $frontend_url"
  echo "  ALB (HTTP):  $api_url"
  echo "  Proxy (HTTPS): $https_api_url"
  echo ""
}

# ============================================================
# COMMAND: destroy
# ============================================================
cmd_destroy() {
  log_step "DESTROY ALL INFRASTRUCTURE"
  echo ""
  echo -e "${RED}${BOLD}WARNING: This will permanently delete:${NC}"
  echo "  - All ECS services and tasks"
  echo "  - RDS database (ALL DATA LOST)"
  echo "  - S3 bucket and frontend files"
  echo "  - CloudFront distribution"
  echo "  - ECR repositories and images"
  echo "  - All SSM parameters"
  echo ""
  read -p "Type 'destroy' to confirm: " CONFIRM

  if [ "$CONFIRM" = "destroy" ]; then
    cd "$TF_DIR"
    terraform destroy -auto-approve
    log_ok "All infrastructure destroyed"
  else
    echo "Cancelled."
  fi
}

# ============================================================
# MAIN
# ============================================================
case "${1:-help}" in
  setup)    cmd_setup ;;
  infra)    cmd_infra ;;
  db)       cmd_db "${2:-}" ;;
  backend)  cmd_backend "${2:-all}" ;;
  frontend) cmd_frontend ;;
  status)   cmd_status ;;
  destroy)  cmd_destroy ;;
  help|*)
    echo ""
    echo -e "${BOLD}AIZESK — Deploy Script for AWS Academy Learner Lab${NC}"
    echo ""
    echo "Usage: ./deploy.sh <command> [options]"
    echo ""
    echo "Commands:"
    echo "  setup             Configure AWS Learner Lab credentials"
    echo "  infra             Create/update AWS infrastructure (Terraform)"
    echo "  db [seed]         Initialize database (add 'seed' for test data)"
    echo "  backend [service] Deploy backend services (all or one specific)"
    echo "  frontend          Build and deploy Angular frontend"
    echo "  status            Show deployment status"
    echo "  destroy           Destroy all infrastructure"
    echo ""
    echo -e "${BOLD}First deployment:${NC}"
    echo "  1. ./deploy.sh setup"
    echo "  2. cp deployment/terraform/terraform.tfvars.example deployment/terraform/terraform.tfvars"
    echo "  3. Edit terraform.tfvars with your values"
    echo "  4. ./deploy.sh infra"
    echo "  5. ./deploy.sh db seed"
    echo "  6. ./deploy.sh backend"
    echo "  7. ./deploy.sh frontend"
    echo ""
    echo -e "${BOLD}Session renewal${NC} (Learner Lab credentials expire ~4h):"
    echo "  1. ./deploy.sh setup    (paste new credentials)"
    echo "  2. Continue working — infrastructure persists"
    echo ""
    ;;
esac

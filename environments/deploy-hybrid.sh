#!/bin/bash

# 하이브리드 배포 스크립트
# Usage: ./deploy-hybrid.sh [environment] [action]
# environment: dev, test, prod
# action: sync, up, down, restart, logs, backup, status, deploy

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT=${1:-dev}
ACTION=${2:-status}

# Script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(dev|test|prod)$ ]]; then
    echo -e "${RED}Error: Invalid environment. Use dev, test, or prod${NC}"
    exit 1
fi

# Validate action
if [[ ! "$ACTION" =~ ^(sync|up|down|restart|logs|backup|status|build|init|deploy)$ ]]; then
    echo -e "${RED}Error: Invalid action. Use sync, up, down, restart, logs, backup, status, build, init, or deploy${NC}"
    exit 1
fi

# Directories
SRC_DIR="${PROJECT_ROOT}/src"
DEPLOY_DIR="${PROJECT_ROOT}/deployments/${ENVIRONMENT}"
ENV_DIR="${PROJECT_ROOT}/environments/${ENVIRONMENT}"

# Function to sync code from src to deployments
sync_code() {
    echo -e "${YELLOW}Syncing code from src/ to deployments/${ENVIRONMENT}/...${NC}"
    
    # Create deployment directory if it doesn't exist
    mkdir -p "${DEPLOY_DIR}"
    
    # Sync client code
    if [ -d "${SRC_DIR}/client" ]; then
        echo -e "${BLUE}Syncing client code...${NC}"
        rsync -av --delete \
            --exclude 'node_modules' \
            --exclude 'dist' \
            --exclude '.env*' \
            --exclude '*.log' \
            "${SRC_DIR}/client/" "${DEPLOY_DIR}/client/"
    fi
    
    # Sync server code
    if [ -d "${SRC_DIR}/server" ]; then
        echo -e "${BLUE}Syncing server code...${NC}"
        rsync -av --delete \
            --exclude 'node_modules' \
            --exclude 'dist' \
            --exclude '.env*' \
            --exclude '*.log' \
            --exclude 'uploads' \
            "${SRC_DIR}/server/" "${DEPLOY_DIR}/server/"
    fi
    
    # Copy environment-specific files
    echo -e "${BLUE}Copying environment files...${NC}"
    if [ -f "${ENV_DIR}/.env.server" ]; then
        cp "${ENV_DIR}/.env.server" "${DEPLOY_DIR}/server/.env"
    fi
    if [ -f "${ENV_DIR}/.env.client" ]; then
        cp "${ENV_DIR}/.env.client" "${DEPLOY_DIR}/client/.env"
    fi
    
    # Copy Docker files
    if [ -f "${ENV_DIR}/docker-compose.yml" ]; then
        cp "${ENV_DIR}/docker-compose.yml" "${DEPLOY_DIR}/"
    fi
    
    echo -e "${GREEN}Code sync completed!${NC}"
}

# Function to load environment variables
load_env() {
    if [ -f "${ENV_DIR}/.env.server" ]; then
        export $(cat "${ENV_DIR}/.env.server" | grep -v '^#' | xargs)
    fi
}

# Function to backup database
backup_database() {
    echo -e "${YELLOW}Backing up ${ENVIRONMENT} database...${NC}"
    
    BACKUP_DIR="${ENV_DIR}/backups"
    mkdir -p $BACKUP_DIR
    
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}.sql"
    
    cd $ENV_DIR
    docker-compose exec -T mysql-${ENVIRONMENT} mysqldump -u$DB_USERNAME -p$DB_PASSWORD $DB_DATABASE > $BACKUP_FILE
    
    echo -e "${GREEN}Backup completed: $BACKUP_FILE${NC}"
}

# Function to initialize environment
init_environment() {
    echo -e "${YELLOW}Initializing ${ENVIRONMENT} environment...${NC}"
    
    # Create deployment directory
    mkdir -p "${DEPLOY_DIR}"
    
    # Copy example env files if they don't exist
    if [ ! -f "${ENV_DIR}/.env.server" ]; then
        if [ -f "${ENV_DIR}/.env.server.example" ]; then
            echo -e "${YELLOW}Creating .env.server from example...${NC}"
            cp "${ENV_DIR}/.env.server.example" "${ENV_DIR}/.env.server"
        fi
    fi
    
    if [ ! -f "${ENV_DIR}/.env.client" ]; then
        if [ -f "${ENV_DIR}/.env.client.example" ]; then
            echo -e "${YELLOW}Creating .env.client from example...${NC}"
            cp "${ENV_DIR}/.env.client.example" "${ENV_DIR}/.env.client"
        fi
    fi
    
    echo -e "${GREEN}Environment initialized!${NC}"
    echo -e "${YELLOW}Please edit the .env files in ${ENV_DIR} before running 'sync' and 'up'${NC}"
}

# Function to start services
start_services() {
    echo -e "${YELLOW}Starting ${ENVIRONMENT} environment...${NC}"
    
    if [ ! -d "${DEPLOY_DIR}/client" ] || [ ! -d "${DEPLOY_DIR}/server" ]; then
        echo -e "${RED}Error: Code not synced. Run 'sync' first.${NC}"
        exit 1
    fi
    
    cd $DEPLOY_DIR
    docker-compose up -d
    
    echo -e "${GREEN}Services started!${NC}"
    show_status
}

# Function to stop services
stop_services() {
    echo -e "${YELLOW}Stopping ${ENVIRONMENT} environment...${NC}"
    
    if [ -f "${DEPLOY_DIR}/docker-compose.yml" ]; then
        cd $DEPLOY_DIR
        docker-compose down
    fi
    
    echo -e "${GREEN}Services stopped!${NC}"
}

# Function to restart services
restart_services() {
    echo -e "${YELLOW}Restarting ${ENVIRONMENT} environment...${NC}"
    
    cd $DEPLOY_DIR
    docker-compose restart
    
    echo -e "${GREEN}Services restarted!${NC}"
}

# Function to show logs
show_logs() {
    echo -e "${YELLOW}Showing logs for ${ENVIRONMENT} environment...${NC}"
    
    cd $DEPLOY_DIR
    docker-compose logs -f --tail=100
}

# Function to show status
show_status() {
    echo -e "${YELLOW}Status of ${ENVIRONMENT} environment:${NC}"
    
    if [ -f "${DEPLOY_DIR}/docker-compose.yml" ]; then
        cd $DEPLOY_DIR
        docker-compose ps
    else
        echo -e "${RED}Environment not deployed yet. Run 'sync' and 'up' first.${NC}"
    fi
    
    # Show URLs
    echo -e "\n${BLUE}Access URLs:${NC}"
    case $ENVIRONMENT in
        dev)
            echo -e "Frontend: http://localhost:3000"
            echo -e "Backend API: http://localhost:5001"
            echo -e "Adminer: http://localhost:8080"
            ;;
        test)
            echo -e "Application: http://localhost:8080"
            ;;
        prod)
            echo -e "Application: https://app.your-domain.com"
            ;;
    esac
    
    # Show deployment info
    echo -e "\n${BLUE}Deployment Info:${NC}"
    echo -e "Source: ${SRC_DIR}"
    echo -e "Deployed to: ${DEPLOY_DIR}"
    if [ -d "${DEPLOY_DIR}" ]; then
        echo -e "Last sync: $(stat -f "%Sm" "${DEPLOY_DIR}" 2>/dev/null || stat -c "%y" "${DEPLOY_DIR}" 2>/dev/null || echo "Unknown")"
    fi
}

# Function to build images
build_images() {
    echo -e "${YELLOW}Building images for ${ENVIRONMENT} environment...${NC}"
    
    cd $DEPLOY_DIR
    docker-compose build --no-cache
    
    echo -e "${GREEN}Build completed!${NC}"
}

# Function to deploy (sync + up)
deploy() {
    echo -e "${YELLOW}Deploying ${ENVIRONMENT} environment...${NC}"
    
    # Sync code first
    sync_code
    
    # Then start services
    start_services
}

# Main execution
case $ACTION in
    init)
        init_environment
        ;;
    sync)
        sync_code
        ;;
    up)
        load_env
        if [ "$ENVIRONMENT" == "prod" ]; then
            echo -e "${YELLOW}Production deployment requires confirmation.${NC}"
            read -p "Are you sure you want to start production? (yes/no): " confirm
            if [ "$confirm" != "yes" ]; then
                echo -e "${RED}Deployment cancelled${NC}"
                exit 0
            fi
        fi
        start_services
        ;;
    down)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    logs)
        show_logs
        ;;
    backup)
        load_env
        backup_database
        ;;
    status)
        show_status
        ;;
    build)
        build_images
        ;;
    deploy)
        if [ "$ENVIRONMENT" == "prod" ]; then
            echo -e "${YELLOW}Production deployment requires confirmation.${NC}"
            read -p "Are you sure you want to deploy to production? (yes/no): " confirm
            if [ "$confirm" != "yes" ]; then
                echo -e "${RED}Deployment cancelled${NC}"
                exit 0
            fi
            load_env
            backup_database
        fi
        deploy
        ;;
esac
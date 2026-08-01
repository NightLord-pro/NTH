#!/bin/bash

# =========================================================
# NTH Panel - Advanced Sung Jinwoo / Solo Leveling Edition
# Repository: https://github.com/NightLord-pro/NTH
# =========================================================

set -e

# Colors for Dark Purple / Solo Leveling Theme (ANSI Escapes)
RED='\033[38;5:196m'
MAGENTA='\033[38;5:129m'
PURPLE='\033[38;5:93m'
DARK_PURPLE='\033[38;5:54m'
VIOLET='\033[38;5:135m'
BRIGHT_VIOLET='\033[38;5:171m'
CYAN='\033[38;5:51m'
WHITE='\033[1;37m'
GRAY='\033[38;5:240m'
BOLD='\033[1m'
NC='\033[0m' # No Color

print_banner() {
    clear
    echo -e "${PURPLE}${BOLD}"
    echo "  ========================================================"
    echo "    _   _ _____ _   _ "
    echo "   | \ | |_   _| | | |"
    echo "   |  \| | | | | |_| |"
    echo "   | |\  | | | |  _| |"
    echo "   |_| \_| |_| |_| |_|"
    echo "                      "
    echo -e "${VIOLET}"
    echo "               [ SYSTEM: NTH HOST MONITOR ]               "
    echo "            MONARCH'S DOMAIN PORT: 2424                   "
    echo -e "${PURPLE}  ========================================================"
    echo -e "${NC}"
}

# Solo Leveling Style Loading Animation (Shadow Extraction Effect)
loading_animation() {
    local text="$1"
    echo -n -e "${PURPLE}[ SYSTEM ]${WHITE} $text ${VIOLET}"
    for i in {1..3}; do
        echo -n "."
        sleep 0.3
    done
    echo -e "${NC}"
}

# Advanced Monarch Progress Bar
progress_bar() {
    local duration=$1
    local title=$2
    local steps=20
    local sleep_time=$(awk "BEGIN {print $duration/$steps}")

    echo -e "${PURPLE}┌────────────────────────────────────────────────────────┐${NC}"
    echo -e "${PURPLE}│${WHITE} ${BOLD}$title${NC}"
    echo -e "${PURPLE}├────────────────────────────────────────────────────────┤${NC}"
    echo -n -e "${PURPLE}│${VIOLET} "

    for ((i=0; i<=steps; i++)); do
        local percent=$((i * 100 / steps))
        local filled=$i
        local empty=$((steps - i))
        
        echo -n "["
        for ((j=0; j<filled; j++)); do echo -n "█"; done
        for ((j=0; j<empty; j++)); do echo -n "░"; done
        echo -n "] ${percent}% "
        sleep "$sleep_time"
        
        if [ $i -lt $steps ]; then
            echo -n -e "\r${PURPLE}│${VIOLET} "
        fi
    done
    echo -e " ${PURPLE}│${NC}"
    echo -e "${PURPLE}└────────────────────────────────────────────────────────┘${NC}"
}

log_info() {
    echo -e "${DARK_PURPLE}[ARISE]${WHITE} $1${NC}"
}

log_success() {
    echo -e "${VIOLET}[SHADOW EXTRACTION SUCCESS]${WHITE} $1${NC}"
}

log_warning() {
    echo -e "${MAGENTA}[GATE WARNING]${WHITE} $1${NC}"
}

log_error() {
    echo -e "${RED}[SYSTEM ERROR]${WHITE} $1${NC}"
}

check_root() {
    if [ "$EUID" -ne 0 ]; then
        log_warning "Shadow Monarch privileges not detected. Recommended to run as root."
    fi
}

install_panel() {
    print_banner
    echo -e "${BOLD}${VIOLET}--- [ GATE 1: FULL PANEL DEPLOYMENT ] ---${NC}\n"

    check_root
    loading_animation "Initializing Shadow Dungeon Environment"

    # Auto-repair broken dpkg / apt state if apt exists
    if command -v apt-get &> /dev/null; then
        sudo dpkg --configure -a 2>/dev/null || true
        sudo apt-get install -f -y 2>/dev/null || true
        sudo apt-get update -y || true
        sudo apt-get install -y curl git build-essential ca-certificates tar xz-utils || log_warning "Some system packages failed to install, continuing..."
    elif command -v yum &> /dev/null; then
        sudo yum update -y || true
        sudo yum install -y curl git make gcc-c++ ca-certificates tar xz || log_warning "Some system packages failed to install, continuing..."
    fi

    # Ensure Node.js is installed and version is >= 22 (or >= 20.19)
    NEED_NODE_UPGRADE=0
    if ! command -v node &> /dev/null; then
        NEED_NODE_UPGRADE=1
    else
        NODE_MAJOR=$(node -v | cut -d'.' -f1 | tr -d 'v')
        NODE_MINOR=$(node -v | cut -d'.' -f2)
        if [ "$NODE_MAJOR" -lt 22 ]; then
            if [ "$NODE_MAJOR" -lt 20 ] || [ "$NODE_MINOR" -lt 19 ]; then
                NEED_NODE_UPGRADE=1
            fi
        fi
    fi

    if [ "$NEED_NODE_UPGRADE" -eq 1 ]; then
        log_info "Synchronizing Mana Core (Node.js 22.x)..."
        
        # Try Nodesource first
        if command -v apt-get &> /dev/null; then
            curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - 2>/dev/null || true
            sudo apt-get install -y nodejs 2>/dev/null || true
        fi

        # Check if node upgraded properly
        CURRENT_NODE_MAJOR=0
        if command -v node &> /dev/null; then
            CURRENT_NODE_MAJOR=$(node -v | cut -d'.' -f1 | tr -d 'v')
        fi

        # Fallback to direct Node.js v22 binary installation if apt/nodesource failed
        if [ "$CURRENT_NODE_MAJOR" -lt 22 ]; then
            log_info "Forcing direct Mana core binary integration (v22.13.1)..."
            ARCH=$(uname -m)
            case "$ARCH" in
                x86_64) NODE_ARCH="x64" ;;
                aarch64) NODE_ARCH="arm64" ;;
                armv7l) NODE_ARCH="armv7l" ;;
                *) NODE_ARCH="x64" ;;
            esac
            
            NODE_DIST="node-v22.13.1-linux-${NODE_ARCH}"
            curl -fsSL "https://nodejs.org/dist/v22.13.1/${NODE_DIST}.tar.xz" -o /tmp/node22.tar.xz || true
            if [ -f "/tmp/node22.tar.xz" ]; then
                sudo tar -xJf /tmp/node22.tar.xz -C /usr/local --strip-components=1 2>/dev/null || tar -xJf /tmp/node22.tar.xz -C /usr/local --strip-components=1 2>/dev/null || true
                rm -f /tmp/node22.tar.xz
            fi
        fi
    fi

    if command -v node &> /dev/null; then
        log_success "Mana Core Active: Node.js $(node -v)"
    else
        log_error "Mana core synchronization failed."
    fi
    
    # Install PM2 globally
    if ! command -v pm2 &> /dev/null; then
        log_info "Summoning Process Manager (PM2)..."
        sudo npm install -g pm2 || true
        npm install pm2 -D
    else
        log_success "PM2 Process Manager is already bound."
    fi

    # Docker Setup
    log_info "Opening Dimensional Rift (Docker)..."
    if ! command -v docker &> /dev/null; then
        curl -fsSL https://get.docker.com | sh || true
        if command -v systemctl &> /dev/null; then
            sudo systemctl enable --now docker || true
        fi
    else
        log_success "Dimensional Rift is already open."
    fi

    progress_bar 2 "Extracting NTH Core Modules"

    # Check if we are already in the NTH directory or matching folder names
    if [ -f "package.json" ] && grep -q "react-example" "package.json" 2>/dev/null; then
        log_info "Target acquired in current operational zone..."
        WORK_DIR="."
    elif [ -d "NTH" ]; then
        log_info "Found existing 'NTH' fortress. Entering..."
        WORK_DIR="NTH"
    elif [ -d "Jtg" ]; then
        log_info "Found existing 'Jtg' domain, converting to 'NTH'..."
        mv Jtg NTH
        WORK_DIR="NTH"
    else
        log_info "Cloning repository from GitHub Gates..."
        git clone https://github.com/NightLord-pro/NTH
        WORK_DIR="NTH"
    fi
    
    # Navigate into the directory
    cd "$WORK_DIR" || { log_error "Failed to cross the threshold!"; return; }
    
    # Ensure .env exists with default port 2424
    if [ ! -f ".env" ]; then
        log_info "Forging system configuration (.env)..."
        if [ -f ".env.example" ]; then
            cp .env.example .env
        else
            echo "PORT=2424" > .env
            echo "JWT_SECRET=$(head -c 32 /dev/urandom | base64)" >> .env
        fi
    else
        if grep -q "PORT=" .env; then
            sed -i 's/^PORT=.*/PORT=2424/' .env
        else
            echo "PORT=2424" >> .env
        fi
    fi
    
    # Ensure ecosystem.config.cjs exists for PM2 using port 2424
    if [ ! -f "ecosystem.config.cjs" ]; then
        log_info "Crafting PM2 system matrix..."
cat << 'EOF' > ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: "nth-panel",
      script: "npm",
      args: "start",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: process.env.PORT || 2424
      }
    }
  ]
};
EOF
    fi

    log_info "Absorbing Node dependencies..."
    npm i 
    
    progress_bar 3 "Compiling Monarch Architecture"
    npm run build
    
    log_info "Awakening panel process via PM2..."
    npx pm2 start ecosystem.config.cjs
    npx pm2 save || true
    
    log_success "========================================================"
    log_success " GATE CLEARED: Panel successfully deployed and active!"
    log_success " MONARCH DOMAIN: http://<YOUR-SERVER-IP>:2424"
    log_success "--------------------------------------------------------"
    log_info    " Default user pass are:"
    log_info    " User => admin"
    log_info    " Pass => admin123"
    log_info    " Now you can change your pass in panel"
    log_success "========================================================"
    
    if [ "$WORK_DIR" = "NTH" ]; then
        cd ..
    fi

    # Final Automated Post-Installation Commands
    log_info "Executing final shadow protocol commands..."
    cd NTH
    sudo apt install -y openjdk-21-jre-headless
    pm2 start ecosystem.config.cjs
    log_success "Shadow Army summoned successfully!"
}

update_panel() {
    print_banner
    echo -e "${BOLD}${VIOLET}--- [ GATE 2: UPDATE MONARCH MATRIX ] ---${NC}\n"
    
    if [ -f "package.json" ] && grep -q "react-example" "package.json" 2>/dev/null; then
        WORK_DIR="."
    elif [ -d "NTH" ]; then
        WORK_DIR="NTH"
    else
        log_error "'NTH' fortress not found! Clear Gate 1 first."
        return
    fi
    
    cd "$WORK_DIR" || { log_error "Failed to enter fortress!"; return; }
        
    loading_animation "Synchronizing with GitHub Repository"
    git stash || true
    git pull
    
    log_info "Updating system dependencies..."
    npm i 
    
    progress_bar 2 "Rebuilding System Matrix"
    npm run build 
    
    log_info "Restarting PM2 shadow threads..."
    npx pm2 restart nth-panel || npx pm2 restart all
    
    log_success "Monarch Matrix successfully upgraded and rebooted!"
    
    if [ "$WORK_DIR" = "NTH" ]; then
        cd ..
    fi
}

restart_panel() {
    print_banner
    echo -e "${BOLD}${VIOLET}--- [ GATE 3: REBOOT SHADOW CORE ] ---${NC}\n"
    
    loading_animation "Rebooting Monarch Panel"
    if command -v pm2 &> /dev/null || npx pm2 -v &> /dev/null; then
        npx pm2 restart nth-panel || npx pm2 restart all
        log_success "Shadow Core re-initialized successfully!"
    else
        log_error "PM2 not found. Cannot restart."
    fi
}

# Main menu loop with Solo Leveling Dark Purple Theme
while true; do
    print_banner
    echo -e "  ${PURPLE}${BOLD}[ SELECT A COMMAND ]${NC}"
    echo -e "  --------------------------------------------------------"
    echo -e "    ${VIOLET}1)${NC} ${WHITE}Install Panel ${GRAY}(Auto Setup - Port 2424)${NC}"
    echo -e "    ${VIOLET}2)${NC} ${WHITE}Update Panel${NC}"
    echo -e "    ${VIOLET}3)${NC} ${WHITE}Restart Panel${NC}"
    echo -e "    ${VIOLET}4)${NC} ${WHITE}Exit Gateway${NC}"
    echo -e "  --------------------------------------------------------"
    echo -n -e "  ${PURPLE}>> Choose option (1-4): ${NC}"
    read -r CHOICE

    case "$CHOICE" in
        1)
            install_panel
            echo -e "\n${PURPLE}Press [ENTER] to return to the Monarch's Menu...${NC}"
            read -r
            ;;
        2)
            update_panel
            echo -e "\n${PURPLE}Press [ENTER] to return to the Monarch's Menu...${NC}"
            read -r
            ;;
        3)
            restart_panel
            echo -e "\n${PURPLE}Press [ENTER] to return to the Monarch's Menu...${NC}"
            read -r
            ;;
        4)
            echo -e "\n${MAGENTA}>> [SYSTEM] Closing Gateway... Goodbye, Monarch.${NC}\n"
            exit 0
            ;;
        *)
            log_error "Invalid gate option! Select between 1 and 4."
            sleep 1.5
            ;;
    esac
done

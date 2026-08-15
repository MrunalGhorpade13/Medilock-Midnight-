#!/usr/bin/env bash
# ============================================================
# install-compact-toolchain.sh
# Run inside WSL (Ubuntu) to set up the full Midnight dev environment
# Usage: bash scripts/install-compact-toolchain.sh
# ============================================================

set -e

GREEN="\033[32m"
CYAN="\033[36m"
YELLOW="\033[33m"
RED="\033[31m"
RESET="\033[0m"

echo -e "${CYAN}╔══════════════════════════════════════════════╗${RESET}"
echo -e "${CYAN}║  Medilock — Midnight Toolchain Installer     ║${RESET}"
echo -e "${CYAN}╚══════════════════════════════════════════════╝${RESET}"
echo ""

# ── 1. NVM + Node.js 22 ──────────────────────────────────────
echo -e "${YELLOW}[1/4] Installing NVM and Node.js 22...${RESET}"
if ! command -v nvm &>/dev/null; then
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
fi
nvm install 22
nvm use 22
echo -e "${GREEN}✅ Node.js $(node --version) ready${RESET}"

# ── 2. Docker ────────────────────────────────────────────────
echo -e "${YELLOW}[2/4] Checking Docker...${RESET}"
if ! command -v docker &>/dev/null; then
  sudo apt-get update -qq
  sudo apt-get install -y docker.io
  sudo usermod -aG docker "$USER"
  echo -e "${GREEN}✅ Docker installed${RESET}"
  echo -e "${YELLOW}   NOTE: Log out and back in (or run 'newgrp docker') for group changes${RESET}"
else
  echo -e "${GREEN}✅ Docker already installed: $(docker --version)${RESET}"
fi

# ── 3. Compact CLI ───────────────────────────────────────────
echo -e "${YELLOW}[3/4] Installing Compact CLI...${RESET}"
if ! command -v compact &>/dev/null; then
  curl --proto '=https' --tlsv1.2 -LsSf \
    https://github.com/midnightntwrk/compact/releases/latest/download/compact-installer.sh | sh
  export PATH="$HOME/.compact/bin:$PATH"
  echo 'export PATH="$HOME/.compact/bin:$PATH"' >> ~/.bashrc
else
  echo -e "${GREEN}✅ Compact already installed: $(compact --version)${RESET}"
fi

# ── 4. tsx for deploy script ─────────────────────────────────
echo -e "${YELLOW}[4/4] Installing tsx...${RESET}"
npm install -g tsx 2>/dev/null || true
echo -e "${GREEN}✅ tsx installed${RESET}"

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════╗${RESET}"
echo -e "${GREEN}║  ✅ All tools installed!                     ║${RESET}"
echo -e "${GREEN}╚══════════════════════════════════════════════╝${RESET}"
echo ""
echo -e "Next steps:"
echo -e "  1. ${CYAN}source ~/.bashrc${RESET}   (reload PATH)"
echo -e "  2. ${CYAN}compact --version${RESET}  (verify Compact CLI)"
echo -e "  3. ${CYAN}bash scripts/compile-contract.sh${RESET}"
echo -e "  4. ${CYAN}bash scripts/start-proof-server.sh${RESET} (in a new terminal)"
echo -e "  5. ${CYAN}npx tsx scripts/deploy-contract.ts${RESET}"
echo ""

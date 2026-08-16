#!/usr/bin/env bash
# Start Midnight Proof Server — tries Docker first, falls back to public Preprod proof server

CYAN="\033[36m"
GREEN="\033[32m"
YELLOW="\033[33m"
RED="\033[31m"
RESET="\033[0m"

PUBLIC_PROOF_SERVER="https://proof-server.testnet-02.midnight.network"
LOCAL_PORT=6300

echo -e "${CYAN}╔══════════════════════════════════════════════╗${RESET}"
echo -e "${CYAN}║  MediLock — Midnight Proof Server Launcher   ║${RESET}"
echo -e "${CYAN}╚══════════════════════════════════════════════╝${RESET}"
echo ""

# ── Try Docker first ──────────────────────────────────────────
if docker info &>/dev/null 2>&1; then
  echo -e "${GREEN}✅ Docker is running. Starting local proof server on port ${LOCAL_PORT}...${RESET}"
  docker run --rm -p ${LOCAL_PORT}:6300 midnightnetwork/proof-server -- 'midnight-proof-server --num-workers 4'
else
  echo -e "${YELLOW}⚠️  Docker daemon not available (is Docker Desktop running?).${RESET}"
  echo -e "${YELLOW}   Falling back to Midnight public Preprod proof server.${RESET}"
  echo ""
  echo -e "${CYAN}   Public Proof Server: ${PUBLIC_PROOF_SERVER}${RESET}"
  echo ""

  # Verify the public proof server is reachable
  if curl -sf "${PUBLIC_PROOF_SERVER}/health" &>/dev/null; then
    echo -e "${GREEN}✅ Public proof server is reachable at: ${PUBLIC_PROOF_SERVER}${RESET}"
    echo ""
    echo -e "${YELLOW}👉 Update your environment to use the public proof server:${RESET}"
    echo ""
    echo -e "   export VITE_PROOF_SERVER_URL=${PUBLIC_PROOF_SERVER}"
    echo ""
    echo -e "   Or add this to your .env file:"
    echo -e "   VITE_PROOF_SERVER_URL=${PUBLIC_PROOF_SERVER}"
    echo ""
    echo -e "${GREEN}✅ No Docker needed — public proof server is ready. Run: npm run dev${RESET}"
  else
    echo -e "${RED}❌ Could not reach public proof server at ${PUBLIC_PROOF_SERVER}${RESET}"
    echo -e "${RED}   Check your internet connection or start Docker Desktop.${RESET}"
    exit 1
  fi
fi

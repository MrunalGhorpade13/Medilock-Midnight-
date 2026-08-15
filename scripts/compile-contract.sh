#!/usr/bin/env bash
# Compile Compact Smart Contract on Ubuntu / Linux

echo -e "\033[36mCompiling contract/lockbox.compact...\033[0m"

if command -v compact &> /dev/null; then
    compact compile contract/lockbox.compact
    echo -e "\033[32mCompact compilation complete! Generated artifacts in contract/ directory.\033[0m"
else
    echo -e "\033[31mCompact CLI not found in PATH. Please run ./scripts/install-compact-toolchain.sh first.\033[0m"
fi

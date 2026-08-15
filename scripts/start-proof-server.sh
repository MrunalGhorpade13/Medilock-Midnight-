#!/usr/bin/env bash
# Start Midnight Local Proof Server (Docker on localhost:6300) on Ubuntu

echo -e "\033[36mStarting Midnight Local Proof Server container on port 6300...\033[0m"

docker run -p 6300:6300 midnightnetwork/proof-server -- 'midnight-proof-server --network testnet'

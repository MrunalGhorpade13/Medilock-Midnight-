# Start Midnight Local Proof Server (Docker on localhost:6300)
Write-Host "Starting Midnight Local Proof Server container on port 6300..." -ForegroundColor Cyan

docker run -p 6300:6300 midnightnetwork/proof-server -- `
  'midnight-proof-server --network testnet'

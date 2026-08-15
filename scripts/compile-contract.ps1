# Compile Compact Contract using official compact CLI
Write-Host "Compiling contract/lockbox.compact..." -ForegroundColor Cyan

if (Get-Command "compact" -ErrorAction SilentlyContinue) {
    compact compile contract/lockbox.compact
    Write-Host "Compact compilation complete! Generated artifacts in contract/ directory." -ForegroundColor Green
} else {
    Write-Host "Compact CLI not found in PATH. Please run scripts/install-compact-toolchain.ps1 first." -ForegroundColor Red
}

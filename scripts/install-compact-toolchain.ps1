# Install Compact Compiler Developer Tools (Windows / PowerShell)
# Run in PowerShell as Administrator if needed

Write-Host "Installing Compact Developer Tools..." -ForegroundColor Cyan

$InstallerUrl = "https://github.com/midnightntwrk/compact/releases/latest/download/compact-installer.sh"

if (Get-Command "compact" -ErrorAction SilentlyContinue) {
    Write-Host "Compact CLI is already installed. Running update..." -ForegroundColor Green
    compact update
} else {
    Write-Host "Please install WSL2 or Git Bash on Windows to run the official Compact installer script:" -ForegroundColor Yellow
    Write-Host "curl --proto '=https' --tlsv1.2 -LsSf $InstallerUrl | sh" -ForegroundColor White
}

Write-Host "To verify installation, run: compact --version" -ForegroundColor Cyan

# Scandish Docker Build Script (PowerShell)
# Usage: .\build.ps1 [frontend_target] [backend_target] [--no-cache]

param(
    [string]$FrontendTarget = "development",
    [string]$BackendTarget = "production",
    [switch]$NoCache
)

Write-Host "🐳 Building Scandish Docker containers..." -ForegroundColor Cyan
Write-Host "Frontend target: $FrontendTarget" -ForegroundColor Yellow
Write-Host "Backend target: $BackendTarget" -ForegroundColor Yellow

# Set environment variables for docker-compose
$env:FRONTEND_TARGET = $FrontendTarget
$env:BACKEND_TARGET = $BackendTarget

# Build arguments
$buildArgs = @()
if ($NoCache) {
    $buildArgs += "--no-cache"
    Write-Host "Building without cache..." -ForegroundColor Yellow
}

# Build the containers
Write-Host "📦 Building containers..." -ForegroundColor Green
if ($buildArgs.Count -gt 0) {
    docker-compose build $buildArgs
}
else {
    docker-compose build
}

Write-Host "✅ Build complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Available targets:" -ForegroundColor Cyan
Write-Host "  Frontend: development, production" -ForegroundColor White
Write-Host "  Backend: production, dependencies, dev-dependencies, build" -ForegroundColor White
Write-Host ""
Write-Host "Usage examples:" -ForegroundColor Cyan
Write-Host "  .\build.ps1 development production           # Development frontend, production backend" -ForegroundColor White
Write-Host "  .\build.ps1 production production           # Production for both" -ForegroundColor White
Write-Host "  .\build.ps1 development production -NoCache # Build without cache" -ForegroundColor White
Write-Host ""
Write-Host "To start the services:" -ForegroundColor Cyan
Write-Host "  docker-compose up -d" -ForegroundColor White

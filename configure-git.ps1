# Git Configuration Script
# This script helps you configure Git user settings

Write-Host "Git Configuration Setup" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan
Write-Host ""

# Check if git is available
try {
    $gitVersion = git --version
    Write-Host "Git found: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Git is not found. Adding to PATH..." -ForegroundColor Yellow
    $env:PATH += ";C:\Program Files\Git\bin"
}

Write-Host ""

# Get current config
$currentName = git config --global user.name
$currentEmail = git config --global user.email

if ($currentName) {
    Write-Host "Current Git user name: $currentName" -ForegroundColor Green
} else {
    Write-Host "Git user name is not set" -ForegroundColor Yellow
}

if ($currentEmail) {
    Write-Host "Current Git email: $currentEmail" -ForegroundColor Green
} else {
    Write-Host "Git email is not set" -ForegroundColor Yellow
}

Write-Host ""

if (-not $currentName -or -not $currentEmail) {
    Write-Host "Please configure your Git identity:" -ForegroundColor Cyan
    Write-Host ""
    
    if (-not $currentName) {
        $name = Read-Host "Enter your name (for Git commits)"
        if ($name) {
            git config --global user.name "$name"
            Write-Host "User name set to: $name" -ForegroundColor Green
        }
    }
    
    if (-not $currentEmail) {
        $email = Read-Host "Enter your email (for Git commits)"
        if ($email) {
            git config --global user.email "$email"
            Write-Host "Email set to: $email" -ForegroundColor Green
        }
    }
    
    Write-Host ""
    Write-Host "Configuration complete!" -ForegroundColor Green
} else {
    Write-Host "Git is already configured." -ForegroundColor Green
}

Write-Host ""
Write-Host "To manually configure Git, use:" -ForegroundColor Cyan
Write-Host "  git config --global user.name 'Your Name'" -ForegroundColor Yellow
Write-Host "  git config --global user.email 'your.email@example.com'" -ForegroundColor Yellow


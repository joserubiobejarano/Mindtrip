# Git Setup Script for MindTrip Project
# Run this script after Git is installed

Write-Host "Checking for Git installation..." -ForegroundColor Cyan

# Check if git is available
try {
    $gitVersion = git --version
    Write-Host "Git found: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Git is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Git from: https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host "After installation, restart your terminal and run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host "`nInitializing Git repository..." -ForegroundColor Cyan

# Initialize git if not already initialized
if (Test-Path .git) {
    Write-Host "Git repository already initialized" -ForegroundColor Yellow
} else {
    git init
    Write-Host "Git repository initialized" -ForegroundColor Green
}

Write-Host "`nAdding files to staging area..." -ForegroundColor Cyan
git add .

Write-Host "`nCreating initial commit..." -ForegroundColor Cyan
git commit -m "Initial commit"

Write-Host "`nChecking for remote repository..." -ForegroundColor Cyan
$remote = git remote -v

if ($remote) {
    Write-Host "Remote repository found:" -ForegroundColor Green
    Write-Host $remote
    Write-Host "`nTo push to remote, run:" -ForegroundColor Cyan
    Write-Host "  git branch -M main" -ForegroundColor Yellow
    Write-Host "  git push -u origin main" -ForegroundColor Yellow
} else {
    Write-Host "No remote repository configured" -ForegroundColor Yellow
    Write-Host "`nTo add a remote repository, run:" -ForegroundColor Cyan
    Write-Host "  git remote add origin <YOUR_REPOSITORY_URL>" -ForegroundColor Yellow
    Write-Host "  git branch -M main" -ForegroundColor Yellow
    Write-Host "  git push -u origin main" -ForegroundColor Yellow
    Write-Host "`nTo create a repository on GitHub:" -ForegroundColor Cyan
    Write-Host "  1. Go to https://github.com/new" -ForegroundColor Yellow
    Write-Host "  2. Create a new repository (don't initialize with README)" -ForegroundColor Yellow
    Write-Host "  3. Copy the repository URL and use it in the command above" -ForegroundColor Yellow
}

Write-Host "`nSetup complete!" -ForegroundColor Green


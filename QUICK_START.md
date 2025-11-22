# Quick Git Setup - MindTrip

## ✅ Step 1: Configure Git (REQUIRED)

Before you can commit, you need to set your Git identity. Run these commands:

```powershell
# Add Git to PATH for this session (if not already done)
$env:PATH += ";C:\Program Files\Git\bin"

# Set your name and email (replace with your actual details)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

**OR** run the automated script:
```powershell
.\configure-git.ps1
```

## ✅ Step 2: Create Initial Commit

Once Git is configured, run:

```powershell
git commit -m "Initial commit"
```

## ✅ Step 3: Add Remote Repository

If you have a GitHub/GitLab repository URL:

```powershell
git remote add origin <YOUR_REPOSITORY_URL>
git branch -M main
git push -u origin main
```

If you don't have a repository yet:
1. Go to https://github.com/new
2. Create a new repository (don't initialize with README)
3. Copy the repository URL
4. Use it in the command above

## 🔧 Permanent PATH Fix

To make Git available in all PowerShell sessions, add it to your system PATH:

1. Press `Win + X` and select "System"
2. Click "Advanced system settings"
3. Click "Environment Variables"
4. Under "System variables", find and select "Path", then click "Edit"
5. Click "New" and add: `C:\Program Files\Git\bin`
6. Click OK on all dialogs
7. Restart PowerShell

**OR** run this in PowerShell as Administrator:
```powershell
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\Program Files\Git\bin", "Machine")
```


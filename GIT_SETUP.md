# Git Setup Guide for MindTrip

## Step 1: Install Git (if not already installed)

If Git is not installed on your system, download and install it from:
- **Windows**: https://git-scm.com/download/win
- After installation, restart your terminal/command prompt

## Step 2: Initialize Git Repository

Once Git is installed, run these commands in your project directory:

```bash
# Initialize git repository
git init

# Add all files (except those in .gitignore)
git add .

# Create initial commit
git commit -m "Initial commit"

# Add remote repository (replace with your actual repository URL)
git remote add origin <YOUR_REPOSITORY_URL>

# Push to remote
git branch -M main
git push -u origin main
```

## Step 3: If you need to create a remote repository

### GitHub:
1. Go to https://github.com/new
2. Create a new repository (don't initialize with README)
3. Copy the repository URL
4. Use it in the `git remote add origin` command above

### Other Git Hosting Services:
- GitLab: https://gitlab.com/projects/new
- Bitbucket: https://bitbucket.org/repo/create

## Quick Commands Reference

```bash
# Check git status
git status

# Add files
git add .

# Commit changes
git commit -m "Your commit message"

# Push to remote
git push

# Check remote URL
git remote -v
```


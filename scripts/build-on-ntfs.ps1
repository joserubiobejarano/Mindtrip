# Build Next.js on an NTFS drive to avoid EISDIR (readlink) errors when project is on exFAT.
# Use: npm run build:ntfs
$ErrorActionPreference = "Stop"
$ProjectRoot = (Get-Location).Path
$TempDir = Join-Path $env:TEMP "kruno-build-$(Get-Date -Format 'yyyyMMddHHmmss')"

Write-Host "Project root: $ProjectRoot"
Write-Host "Build temp (NTFS): $TempDir"
Write-Host ""

# Create temp dir
New-Item -ItemType Directory -Path $TempDir -Force | Out-Null

# Copy project excluding node_modules, .next, .git
Write-Host "Copying project..."
$excludeDirs = @("node_modules", ".next", ".git")
$robocopyArgs = @($ProjectRoot, $TempDir, "/E", "/NFL", "/NDL", "/NJH", "/NJS", "/NC", "/NS")
foreach ($d in $excludeDirs) {
  $robocopyArgs += "/XD"
  $robocopyArgs += $d
}
& robocopy @robocopyArgs | Out-Null
if ($LASTEXITCODE -ge 8) { exit $LASTEXITCODE }

# Copy env files
Get-ChildItem -Path $ProjectRoot -Filter ".env*" -File -Force -ErrorAction SilentlyContinue | ForEach-Object {
  Copy-Item $_.FullName -Destination $TempDir -Force
  Write-Host "Copied $($_.Name)"
}

# Install and build on NTFS
Push-Location $TempDir
try {
  Write-Host ""
  Write-Host "Installing dependencies..."
  & npm ci
  if ($LASTEXITCODE -ne 0) { throw "npm ci failed" }
  Write-Host ""
  Write-Host "Building..."
  & npm run build
  if ($LASTEXITCODE -ne 0) { throw "npm run build failed" }
} finally {
  Pop-Location
}

# Copy .next back to project
Write-Host ""
Write-Host "Copying .next to project..."
$nextSrc = Join-Path $TempDir ".next"
$nextDst = Join-Path $ProjectRoot ".next"
if (Test-Path $nextDst) { Remove-Item $nextDst -Recurse -Force }
& robocopy $nextSrc $nextDst /E /IS /IT /NFL /NDL /NJH /NJS | Out-Null
if ($LASTEXITCODE -ge 8) { exit $LASTEXITCODE }

# Cleanup
Remove-Item $TempDir -Recurse -Force -ErrorAction SilentlyContinue
Write-Host ""
Write-Host "Build completed successfully. Output is in $nextDst"

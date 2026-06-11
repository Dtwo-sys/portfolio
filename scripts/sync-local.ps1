<#
  sync-local.ps1 — Calibrated Ideas build helper.

  Google Drive's virtual filesystem cannot reliably host node_modules, so the
  Drive folder stays the canonical SOURCE and all npm / build work happens on a
  local NTFS copy. This script mirrors source files (only) from Drive to the
  local build copy, leaving node_modules and dist in place locally.

  Usage (run from anywhere):
    pwsh ./scripts/sync-local.ps1            # sync source Drive -> local
    pwsh ./scripts/sync-local.ps1 -Back      # copy built dist/ local -> Drive
    pwsh ./scripts/sync-local.ps1 -Install   # sync, then npm install locally
    pwsh ./scripts/sync-local.ps1 -Build     # sync, then npm run build locally
#>

param(
  [switch]$Back,
  [switch]$Install,
  [switch]$Build
)

$ErrorActionPreference = 'Stop'
$Source = 'G:\My Drive\claude_code\calibratedideas'
$Local  = Join-Path $env:LOCALAPPDATA 'ci-build\calibratedideas'

# Robocopy uses exit codes 0-7 for success/info and 8+ for genuine errors.
function Invoke-Robocopy {
  param([string[]]$RoboArgs)
  & robocopy @RoboArgs | Out-Null
  if ($LASTEXITCODE -ge 8) { throw "robocopy failed (code $LASTEXITCODE)" }
  $global:LASTEXITCODE = 0
}

# Artefacts that must NEVER be copied between the two trees.
$Exclude = @('node_modules', 'dist', '.astro', '.git')
$ExcludeDirsFull = @("$Source\imported\current-site\images")

New-Item -ItemType Directory -Force -Path $Local | Out-Null

if ($Back) {
  Write-Host "Copying built dist/ -> Drive ..." -ForegroundColor Cyan
  Invoke-Robocopy @("$Local\dist", "$Source\dist", '/MIR', '/NFL', '/NDL', '/NJH', '/NJS', '/NP')
  Write-Host "Done. dist/ is on Drive, ready to upload to Hostinger." -ForegroundColor Green
  return
}

Write-Host "Syncing source Drive -> local build copy ..." -ForegroundColor Cyan
Write-Host "  from: $Source"
Write-Host "  to:   $Local"
# /MIR mirrors; /XD excludes directories so local node_modules + dist survive.
Invoke-Robocopy (@($Source, $Local, '/MIR', '/XD') + $Exclude + $ExcludeDirsFull + @('/XF', '*.log', '/NFL', '/NDL', '/NJH', '/NJS', '/NP'))
Write-Host "Source synced." -ForegroundColor Green

Push-Location $Local
try {
  if ($Install) {
    Write-Host "Running npm install (local) ..." -ForegroundColor Cyan
    npm install
  }
  if ($Build) {
    # This script is the production (Hostinger) build path: root base, real
    # domain. The GitHub Pages preview is built by CI with its own settings.
    $env:PUBLIC_BASE_PATH = '/'
    $env:PUBLIC_SITE_URL = 'https://calibratedideas.com'
    Write-Host "Running npm run build (local, production base '/') ..." -ForegroundColor Cyan
    npm run build
    Write-Host "Build complete. Run with -Back to copy dist/ to Drive." -ForegroundColor Green
  }
}
finally {
  Pop-Location
}

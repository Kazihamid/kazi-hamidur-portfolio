$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$jsonPath = Join-Path $projectRoot 'src\data\portfolio.json'

if (-not (Test-Path $jsonPath)) {
    Write-Host "portfolio.json was not found at: $jsonPath" -ForegroundColor Red
    Write-Host "Extract this ZIP into the root of your kazi-hamidur-portfolio project, then run this script again." -ForegroundColor Yellow
    exit 1
}

$backupPath = "$jsonPath.bak"
Copy-Item $jsonPath $backupPath -Force
Write-Host "Backup created: $backupPath" -ForegroundColor Cyan

$content = Get-Content $jsonPath -Raw

# Fix a missing comma after endDate when the next JSON property starts immediately after it.
$pattern = '("endDate"\s*:\s*"[^"]*")\s*(\r?\n\s*"tools"\s*:)'
$fixed = [regex]::Replace($content, $pattern, '$1,$2')

if ($fixed -eq $content) {
    Write-Host "No matching missing-comma pattern was found. Validating the existing JSON..." -ForegroundColor Yellow
} else {
    Set-Content -Path $jsonPath -Value $fixed -Encoding utf8
    Write-Host "Applied missing-comma fix to src/data/portfolio.json" -ForegroundColor Green
}

try {
    Get-Content $jsonPath -Raw | ConvertFrom-Json | Out-Null
    Write-Host "SUCCESS: portfolio.json is valid JSON." -ForegroundColor Green
    Write-Host "Next run: npm run build" -ForegroundColor Cyan
} catch {
    Write-Host "JSON validation still failed:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host "Restoring the backup..." -ForegroundColor Yellow
    Copy-Item $backupPath $jsonPath -Force
    Write-Host "Original portfolio.json restored." -ForegroundColor Yellow
    exit 1
}

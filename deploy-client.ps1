Write-Host "Building client..." -ForegroundColor Cyan
Set-Location "$PSScriptRoot\client"
npm run build
if ($LASTEXITCODE -ne 0) { Write-Host "Build failed!" -ForegroundColor Red; exit 1 }

Write-Host "Deploying to Vercel..." -ForegroundColor Cyan
$env:VERCEL_PROJECT_ID = "prj_qIBP0xRcmGpdpnFuzDdELCFjA7cR"
$env:VERCEL_ORG_ID = "team_1KT3ZP3N9LJvFa1pgXPNsoxl"
vercel --prod --yes

Write-Host "Client deployed!" -ForegroundColor Green
Set-Location "$PSScriptRoot"

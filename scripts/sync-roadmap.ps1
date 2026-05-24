<#
.SYNOPSIS
    Build the roadmap SPA (web-veloxis-ai-roadmap) and sync its dist/ output
    into web-veloxisai/roadmap/ so the main site can host it at /roadmap/.

.DESCRIPTION
    Steps:
      1. Resolve the roadmap source folder (../web-veloxis-ai-roadmap by default).
      2. Run `npm run build` inside it (Vite will use base = "/roadmap/").
      3. Wipe the existing roadmap/ folder in the main site.
      4. Copy the freshly built dist/* into roadmap/.
      5. Remove dist/CNAME if present (only the root CNAME of the main site
         should declare the custom domain).

.PARAMETER RoadmapPath
    Path to the roadmap project. Defaults to ../web-veloxis-ai-roadmap.

.PARAMETER SkipBuild
    Skip `npm run build` and just resync whatever is already in dist/.

.EXAMPLE
    PS> .\scripts\sync-roadmap.ps1
    PS> .\scripts\sync-roadmap.ps1 -SkipBuild
    PS> .\scripts\sync-roadmap.ps1 -RoadmapPath "F:\4 Code\web-veloxis-ai-roadmap"
#>

[CmdletBinding()]
param(
    [string] $RoadmapPath,
    [switch] $SkipBuild
)

$ErrorActionPreference = "Stop"

$siteRoot = Split-Path -Parent $PSScriptRoot
if (-not $RoadmapPath) {
    $RoadmapPath = Join-Path (Split-Path -Parent $siteRoot) "web-veloxis-ai-roadmap"
}

$RoadmapPath = (Resolve-Path $RoadmapPath).Path
$distPath    = Join-Path $RoadmapPath "dist"
$targetPath  = Join-Path $siteRoot   "roadmap"

Write-Host "[sync-roadmap] site root  : $siteRoot"
Write-Host "[sync-roadmap] roadmap src: $RoadmapPath"
Write-Host "[sync-roadmap] target dir : $targetPath"

if (-not (Test-Path $RoadmapPath)) {
    throw "Roadmap source folder not found: $RoadmapPath"
}

if (-not $SkipBuild) {
    Write-Host "`n[sync-roadmap] running 'npm run build' in roadmap..." -ForegroundColor Cyan
    Push-Location $RoadmapPath
    try {
        npm run build
        if ($LASTEXITCODE -ne 0) {
            throw "npm run build failed with exit code $LASTEXITCODE"
        }
    }
    finally {
        Pop-Location
    }
} else {
    Write-Host "[sync-roadmap] -SkipBuild specified, reusing existing dist/" -ForegroundColor Yellow
}

if (-not (Test-Path $distPath)) {
    throw "dist folder not found after build: $distPath"
}

Write-Host "`n[sync-roadmap] clearing $targetPath ..." -ForegroundColor Cyan
if (Test-Path $targetPath) {
    Remove-Item -Recurse -Force $targetPath
}
New-Item -ItemType Directory -Path $targetPath | Out-Null

Write-Host "[sync-roadmap] copying dist/* -> roadmap/ ..." -ForegroundColor Cyan
Copy-Item -Path (Join-Path $distPath "*") -Destination $targetPath -Recurse -Force

$nestedCname = Join-Path $targetPath "CNAME"
if (Test-Path $nestedCname) {
    Write-Host "[sync-roadmap] removing nested CNAME (only root CNAME is allowed)" -ForegroundColor Yellow
    Remove-Item $nestedCname -Force
}

Write-Host "`n[sync-roadmap] DONE. Commit & push the main site to publish." -ForegroundColor Green

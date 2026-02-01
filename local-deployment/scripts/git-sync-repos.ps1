# ===========================================
# AIZESK - Sync All Repositories (Windows)
# ===========================================
# This script pulls the latest changes from main and develop
# branches for all microservices.
#
# Usage: 
#   .\sync-repos.ps1
#   .\sync-repos.ps1 -MainOnly
#   .\sync-repos.ps1 -DevelopOnly

param(
    [switch]$MainOnly,
    [switch]$DevelopOnly
)

# Configuration
# Script is in: webapp/local-deployment/scripts/
# Repos are in: TFM/ (3 levels up)
$BaseDir = (Get-Item $PSScriptRoot).Parent.Parent.Parent.FullName

$Repos = @(
    "admin-service",
    "auth-service",
    "notification-service",
    "platform-connection-service",
    "reporting-service",
    "subscription-service",
    "transaction-service",
    "user-service",
    "webapp"
)

# Determine which branches to sync
$SyncMain = -not $DevelopOnly
$SyncDevelop = -not $MainOnly

Write-Host ""
Write-Host "[SYNC] Aizesk Repository Sync" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "Base directory: $BaseDir" -ForegroundColor Yellow
Write-Host ""

function Sync-Branch {
    param(
        [string]$RepoPath,
        [string]$Branch
    )
    
    if (-not (Test-Path $RepoPath)) {
        Write-Host "  [!] Directory not found, skipping" -ForegroundColor Yellow
        return
    }
    
    Push-Location $RepoPath
    
    try {
        # Check if branch exists locally
        $branchExists = git show-ref --verify --quiet "refs/heads/$Branch" 2>$null
        
        if ($LASTEXITCODE -ne 0) {
            # Try to fetch and checkout if it exists remotely
            $remoteExists = git ls-remote --heads origin $Branch 2>$null | Select-String $Branch
            if ($remoteExists) {
                git fetch origin $Branch 2>$null
                git checkout -b $Branch "origin/$Branch" 2>$null
            } else {
                Write-Host "  [!] Branch '$Branch' not found" -ForegroundColor Yellow
                return
            }
        }
        
        # Get current branch
        $currentBranch = git branch --show-current
        
        # Stash any changes if needed
        $stashNeeded = $false
        $status = git status --porcelain
        if ($status) {
            $stashNeeded = $true
            git stash push -m "auto-stash before sync" 2>$null
        }
        
        # Checkout and pull
        git checkout $Branch 2>$null
        $pullResult = git pull origin $Branch 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  [OK] $Branch" -ForegroundColor Green -NoNewline
            Write-Host " - updated"
        } else {
            Write-Host "  [X] $Branch" -ForegroundColor Red -NoNewline
            Write-Host " - pull failed"
        }
        
        # Return to original branch
        if ($currentBranch -ne $Branch) {
            git checkout $currentBranch 2>$null
        }
        
        # Restore stash if needed
        if ($stashNeeded) {
            git stash pop 2>$null
        }
    }
    finally {
        Pop-Location
    }
}

# Sync each repository
foreach ($repo in $Repos) {
    Write-Host "[*] $repo" -ForegroundColor Blue
    
    $repoPath = Join-Path $BaseDir $repo
    
    if (-not (Test-Path (Join-Path $repoPath ".git"))) {
        Write-Host "  [!] Not a git repository, skipping" -ForegroundColor Yellow
        Write-Host ""
        continue
    }
    
    if ($SyncMain) {
        Sync-Branch -RepoPath $repoPath -Branch "main"
    }
    
    if ($SyncDevelop) {
        Sync-Branch -RepoPath $repoPath -Branch "develop"
    }
    
    Write-Host ""
}

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "[OK] Sync complete!" -ForegroundColor Green
Write-Host ""

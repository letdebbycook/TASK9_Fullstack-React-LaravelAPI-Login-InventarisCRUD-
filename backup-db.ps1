# Backup Script for Task 9: Fullstack Inventaris
# Creates database dump and source code backup archive

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = Join-Path $PSScriptRoot "backups"

if (!(Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
}

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  INVENTARISPRO WEBSITE & DATABASE BACKUP TOOL  " -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Timestamp: $timestamp"

# 1. Database Backup via PHP Artisan Tinker / JSON Dump
$dbExportFile = Join-Path $backupDir "inventaris_db_$timestamp.json"
Write-Host "`n[1/2] Mengekspor data database inventaris_api..." -ForegroundColor Yellow

$backendDir = "D:\magang\task\8\inventaris-api"
if (Test-Path $backendDir) {
    try {
        $artisanPath = Join-Path $backendDir "artisan"
        $phpCode = 'echo json_encode(["users" => App\Models\User::all(), "categories" => App\Models\Category::all(), "items" => App\Models\Item::all()], JSON_PRETTY_PRINT);'
        $jsonContent = & php $artisanPath tinker --execute=$phpCode

        if ($jsonContent) {
            $jsonStart = $jsonContent.IndexOf('{')
            if ($jsonStart -ge 0) {
                $jsonOnly = $jsonContent.Substring($jsonStart)
                Set-Content -Path $dbExportFile -Value $jsonOnly -Encoding UTF8
                Write-Host "OK: Database berhasil di-export ke: $dbExportFile" -ForegroundColor Green
            } else {
                Set-Content -Path $dbExportFile -Value $jsonContent -Encoding UTF8
                Write-Host "OK: Raw DB snapshot disimpan ke: $dbExportFile" -ForegroundColor Green
            }
        }
    } catch {
        Write-Host "Error saat mengekspor DB: $_" -ForegroundColor Red
    }
} else {
    Write-Host "Backend directory not found at $backendDir" -ForegroundColor Red
}

# 2. Frontend Codebase Snapshot (Excluding node_modules)
$clientDir = Join-Path $PSScriptRoot "inventaris-client"
$zipFile = Join-Path $backupDir "inventaris_client_src_$timestamp.zip"
Write-Host "`n[2/2] Mengompres kode sumber frontend inventaris-client..." -ForegroundColor Yellow

if (Test-Path $clientDir) {
    $tempBackup = Join-Path $backupDir "temp_src"
    if (Test-Path $tempBackup) { Remove-Item $tempBackup -Recurse -Force }
    New-Item -ItemType Directory -Path $tempBackup | Out-Null

    robocopy $clientDir $tempBackup /XD node_modules dist .git /XF *.log /E /NFL /NDL /NJH /NJS | Out-Null
    Compress-Archive -Path "$tempBackup\*" -DestinationPath $zipFile -Force
    Remove-Item $tempBackup -Recurse -Force

    Write-Host "OK: Arsip kode sumber berhasil disimpan di: $zipFile" -ForegroundColor Green
}

Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "OK: Backup selesai! Berkas tersimpan di: $backupDir" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan

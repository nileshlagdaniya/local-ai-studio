<#
.SYNOPSIS
    Development environment setup for Local AI Studio

.DESCRIPTION
    Installs dependencies, sets up environment files, and prepares the development environment.
#>

param(
    [switch]$SkipNode,
    [switch]$SkipPython,
    [switch]$SkipOllama
)

Write-Host "=== Local AI Studio Development Setup ===" -ForegroundColor Cyan

# Check prerequisites
Write-Host "`nChecking prerequisites..." -ForegroundColor Yellow

$errors = @()

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    $errors += "Node.js not found. Install from https://nodejs.org/"
}

if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    $errors += "pnpm not found. Run: npm install -g pnpm"
}

if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    $errors += "Python not found. Install from https://python.org/"
}

if (-not (Get-Command uv -ErrorAction SilentlyContinue)) {
    $errors += "uv not found. Run: pip install uv"
}

if (-not (Get-Command ollama -ErrorAction SilentlyContinue)) {
    $errors += "Ollama not found. Install from https://ollama.ai/"
}

if ($errors.Count -gt 0) {
    Write-Host "Missing prerequisites:" -ForegroundColor Red
    $errors | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
    exit 1
}

Write-Host "All prerequisites found!" -ForegroundColor Green

# Node.js dependencies
if (-not $SkipNode) {
    Write-Host "`nInstalling Node.js dependencies..." -ForegroundColor Yellow
    pnpm install
    Write-Host "Node.js dependencies installed!" -ForegroundColor Green
}

# Python dependencies
if (-not $SkipPython) {
    Write-Host "`nInstalling Python dependencies..." -ForegroundColor Yellow
    cd apps/api
    uv sync --dev
    cd ../..
    Write-Host "Python dependencies installed!" -ForegroundColor Green
}

# Environment files
Write-Host "`nSetting up environment files..." -ForegroundColor Yellow

if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env" -ErrorAction SilentlyContinue
    Write-Host "Created .env from .env.example" -ForegroundColor Green
} else {
    Write-Host ".env already exists, skipping" -ForegroundColor Yellow
}

if (-not (Test-Path "apps/api/.env")) {
    Copy-Item "apps/api/.env.example" "apps/api/.env" -ErrorAction SilentlyContinue
    Write-Host "Created apps/api/.env from example" -ForegroundColor Green
} else {
    Write-Host "apps/api/.env already exists, skipping" -ForegroundColor Yellow
}

# Data directories
Write-Host "`nCreating data directories..." -ForegroundColor Yellow
$dirs = @("data", "storage", "logs", "backups")
foreach ($dir in $dirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir | Out-Null
        Write-Host "Created $dir/" -ForegroundColor Green
    }
}

# Ollama models
if (-not $SkipOllama) {
    Write-Host "`nChecking Ollama models..." -ForegroundColor Yellow
    $models = @("qwen2.5-coder:3b", "qwen2.5-coder:7b")
    foreach ($model in $models) {
        $result = ollama list | Select-String $model
        if (-not $result) {
            Write-Host "Pulling $model..." -ForegroundColor Yellow
            ollama pull $model
        } else {
            Write-Host "$model already installed" -ForegroundColor Green
        }
    }
}

Write-Host "`n=== Setup Complete! ===" -ForegroundColor Cyan
Write-Host "Run 'pnpm dev:all' to start both frontend and backend" -ForegroundColor Yellow
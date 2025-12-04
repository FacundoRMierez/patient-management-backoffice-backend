# Setup Script for Windows PowerShell
# Run this script after cloning the repository

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Patient Management System - Setup    " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Node.js $nodeVersion installed" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js is not installed. Please install from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check if npm is installed
Write-Host "Checking npm installation..." -ForegroundColor Yellow
$npmVersion = npm --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ npm $npmVersion installed" -ForegroundColor Green
} else {
    Write-Host "❌ npm is not installed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Installing Dependencies               " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Environment Setup                     " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if (Test-Path .env) {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
} else {
    Write-Host "Creating .env file from .env.example..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "✅ .env file created" -ForegroundColor Green
    Write-Host "⚠️  Please update DATABASE_URL in .env if needed" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Database Setup Options                " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Choose your database setup:" -ForegroundColor Yellow
Write-Host "1. Docker (Recommended - Easiest)" -ForegroundColor White
Write-Host "2. Skip (I already have PostgreSQL running)" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1-2)"

if ($choice -eq "1") {
    Write-Host ""
    Write-Host "Checking Docker installation..." -ForegroundColor Yellow
    $dockerVersion = docker --version 2>$null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Docker installed: $dockerVersion" -ForegroundColor Green
        Write-Host ""
        Write-Host "Starting PostgreSQL container..." -ForegroundColor Yellow
        
        # Check if container already exists
        $containerExists = docker ps -a --filter "name=postgres-patient" --format "{{.Names}}" 2>$null
        
        if ($containerExists -eq "postgres-patient") {
            Write-Host "Container 'postgres-patient' already exists. Starting it..." -ForegroundColor Yellow
            docker start postgres-patient
        } else {
            docker run --name postgres-patient -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=patient_management -p 5432:5432 -d postgres:latest
        }
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ PostgreSQL container started" -ForegroundColor Green
            Start-Sleep -Seconds 5  # Wait for PostgreSQL to initialize
        } else {
            Write-Host "❌ Failed to start PostgreSQL container" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "❌ Docker is not installed" -ForegroundColor Red
        Write-Host "Please install Docker Desktop from https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
        exit 1
    }
} elseif ($choice -eq "2") {
    Write-Host "⚠️  Make sure PostgreSQL is running and DATABASE_URL in .env is correct" -ForegroundColor Yellow
} else {
    Write-Host "Invalid choice. Skipping database setup." -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Prisma Setup                          " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "Generating Prisma Client..." -ForegroundColor Yellow
npm run prisma:generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to generate Prisma Client" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Running database migrations..." -ForegroundColor Yellow
Write-Host "⚠️  You will be asked to name your migration. Suggested name: 'initial_setup'" -ForegroundColor Yellow
Write-Host ""

npm run prisma:migrate

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to run migrations" -ForegroundColor Red
    Write-Host "Make sure PostgreSQL is running and DATABASE_URL is correct" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✅ Setup Complete!                    " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Start the development server: npm run dev" -ForegroundColor White
Write-Host "2. Open Prisma Studio: npm run prisma:studio" -ForegroundColor White
Write-Host "3. Read START_HERE.md for more information" -ForegroundColor White
Write-Host ""
Write-Host "API will be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Happy coding! 🚀" -ForegroundColor Green

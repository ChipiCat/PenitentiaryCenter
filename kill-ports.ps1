# Script para matar procesos en puertos 3000 y 4321
Write-Host "=== Limpiando puertos ===" -ForegroundColor Cyan

# Puerto 3000 (Backend)
$port3000 = netstat -ano | findstr ":3000" | findstr "LISTENING"
if ($port3000) {
    $pid = ($port3000 -split '\s+')[-1]
    Write-Host "Matando proceso en puerto 3000 (PID: $pid)..." -ForegroundColor Yellow
    taskkill /PID $pid /F 2>$null
    if ($?) {
        Write-Host "[OK] Puerto 3000 liberado" -ForegroundColor Green
    }
} else {
    Write-Host "[OK] Puerto 3000 ya esta libre" -ForegroundColor Green
}

# Puerto 4321 (Frontend)
$port4321 = netstat -ano | findstr ":4321" | findstr "LISTENING"
if ($port4321) {
    $pid = ($port4321 -split '\s+')[-1]
    Write-Host "Matando proceso en puerto 4321 (PID: $pid)..." -ForegroundColor Yellow
    taskkill /PID $pid /F 2>$null
    if ($?) {
        Write-Host "[OK] Puerto 4321 liberado" -ForegroundColor Green
    }
} else {
    Write-Host "[OK] Puerto 4321 ya esta libre" -ForegroundColor Green
}

Write-Host "=== Limpieza completada ===" -ForegroundColor Cyan

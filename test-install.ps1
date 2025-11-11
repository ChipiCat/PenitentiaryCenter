# Test Instalacion SIGEPEN
Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Test Instalacion SIGEPEN" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

# Desinstalar version anterior
Write-Host ""
Write-Host "1. Desinstalando version anterior..." -ForegroundColor Yellow
if (Test-Path "$env:LOCALAPPDATA\Programs\SIGEPEN\Uninstall SIGEPEN.exe") {
    Start-Process "$env:LOCALAPPDATA\Programs\SIGEPEN\Uninstall SIGEPEN.exe" -ArgumentList "/S" -Wait -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host "OK" -ForegroundColor Green
} else {
    Write-Host "No habia version anterior" -ForegroundColor Gray
}

# Instalar nueva version
Write-Host ""
Write-Host "2. Instalando nueva version..." -ForegroundColor Yellow
Start-Process ".\release\SIGEPEN-3.0.2-x64.exe" -ArgumentList "/S" -Wait
Start-Sleep -Seconds 3
Write-Host "OK" -ForegroundColor Green

# Limpiar logs anteriores
$logPath = "$env:APPDATA\penitentiary-center-root\app.log"
if (Test-Path $logPath) {
    Remove-Item $logPath -Force
}

# Ejecutar
Write-Host ""
Write-Host "3. Ejecutando SIGEPEN..." -ForegroundColor Yellow
$process = Start-Process "$env:LOCALAPPDATA\Programs\SIGEPEN\SIGEPEN.exe" -PassThru

Write-Host "Proceso iniciado (PID: $($process.Id))" -ForegroundColor Green
Write-Host ""
Write-Host "Esperando 20 segundos..." -ForegroundColor Gray
Start-Sleep -Seconds 20

# Verificar proceso
if (Get-Process -Id $process.Id -ErrorAction SilentlyContinue) {
    Write-Host "EXITO: El proceso sigue ejecutandose!" -ForegroundColor Green
} else {
    Write-Host "ERROR: El proceso se cerro" -ForegroundColor Red
}

# Ver logs
Write-Host ""
Write-Host "4. Verificando logs..." -ForegroundColor Yellow

if (Test-Path $logPath) {
    Write-Host "Logs encontrados" -ForegroundColor Green
    Write-Host ""
    Write-Host "====================================" -ForegroundColor Cyan
    Write-Host "ULTIMAS 60 LINEAS DE LOGS:" -ForegroundColor Cyan
    Write-Host "====================================" -ForegroundColor Cyan
    Get-Content $logPath -Tail 60
    Write-Host "====================================" -ForegroundColor Cyan
} else {
    Write-Host "No hay logs" -ForegroundColor Red
}

Write-Host ""
Write-Host "Logs en: $logPath" -ForegroundColor Gray
Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

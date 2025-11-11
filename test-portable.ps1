# Debug Portable SIGEPEN
Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  SIGEPEN - Debugging del Portable" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# Buscar ejecutable
$allExes = Get-ChildItem ".\release\*.exe" -ErrorAction SilentlyContinue
$exe = $null

if ($allExes) {
    foreach ($item in $allExes) {
        if ($item.Name -like "*portable*") {
            $exe = $item
            break
        }
    }
    
    if (-not $exe) {
        $exe = $allExes[0]
    }
}

if (-not $exe) {
    Write-Host "ERROR: No hay archivos .exe en release/" -ForegroundColor Red
    Write-Host "Ejecuta primero: npm run package:win" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Executable: $($exe.Name)" -ForegroundColor Yellow
Write-Host "Tamano: $([math]::Round($exe.Length/1MB, 2)) MB" -ForegroundColor Yellow

# Limpiar logs
$logPath = "$env:APPDATA\SIGEPEN\app.log"
if (Test-Path $logPath) {
    Remove-Item $logPath -Force
    Write-Host "Logs anteriores eliminados" -ForegroundColor Green
}

# Verificar procesos
Write-Host ""
Write-Host "Verificando procesos..." -ForegroundColor Yellow
$procs = Get-Process -ErrorAction SilentlyContinue | Where-Object { $_.ProcessName -like "*SIGEPEN*" }

if ($procs) {
    Write-Host "ADVERTENCIA: Hay procesos SIGEPEN ejecutandose" -ForegroundColor Red
    foreach ($p in $procs) {
        Write-Host "  PID: $($p.Id) - $($p.ProcessName)" -ForegroundColor White
    }
    $resp = Read-Host "Cerrar estos procesos? (S/N)"
    if ($resp -eq "S" -or $resp -eq "s") {
        foreach ($p in $procs) {
            Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue
        }
        Start-Sleep -Seconds 2
    }
}

# Ejecutar
Write-Host ""
Write-Host "Ejecutando aplicacion..." -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Cyan

$process = Start-Process -FilePath $exe.FullName -PassThru

Write-Host ""
Write-Host "Proceso iniciado (PID: $($process.Id))" -ForegroundColor Green
Write-Host "Esperando 15 segundos..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Verificar si sigue vivo
$stillAlive = Get-Process -Id $process.Id -ErrorAction SilentlyContinue

if ($stillAlive) {
    Write-Host "OK: El proceso sigue ejecutandose" -ForegroundColor Green
} else {
    Write-Host "ERROR: El proceso se cerro inesperadamente" -ForegroundColor Red
}

# Ver logs
Write-Host ""
Write-Host "Verificando logs..." -ForegroundColor Yellow

if (Test-Path $logPath) {
    Write-Host "OK: Logs encontrados" -ForegroundColor Green
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host "LOGS:" -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor Cyan
    Get-Content $logPath
    Write-Host "============================================================" -ForegroundColor Cyan
} else {
    Write-Host "ERROR: No se generaron logs" -ForegroundColor Red
    Write-Host "La aplicacion no llego a ejecutar codigo de Electron" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Ubicacion de logs: $logPath" -ForegroundColor Cyan

# Preguntar si cerrar
Write-Host ""
$resp = Read-Host "Cerrar la aplicacion? (S/N)"

if ($resp -eq "S" -or $resp -eq "s") {
    $p = Get-Process -Id $process.Id -ErrorAction SilentlyContinue
    if ($p) {
        Stop-Process -Id $process.Id -Force
        Write-Host "Proceso cerrado" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Debugging completado" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

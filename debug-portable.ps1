# Script de Debugging para Portable SIGEPEN
# Ejecuta el portable y captura todos los errores

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "  SIGEPEN - Debugging del Portable" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# Buscar el executable
$allExes = Get-ChildItem ".\release\*.exe" -ErrorAction SilentlyContinue
$portablePath = $null

if ($allExes) {
    foreach ($exe in $allExes) {
        if ($exe.Name -like "*portable*") {
            $portablePath = $exe
            break
        }
    }
    
    if (-not $portablePath) {
        Write-Host "`n⚠️  No se encontró portable, usando primer .exe disponible" -ForegroundColor Yellow
        $portablePath = $allExes | Select-Object -First 1
    }
} else {
    Write-Host "`n❌ No hay archivos .exe en la carpeta release" -ForegroundColor Red
    Write-Host "   Primero ejecuta: npm run package:win" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n📦 Executable encontrado:" -ForegroundColor Yellow
Write-Host "   Ruta: $($portablePath.FullName)" -ForegroundColor White
Write-Host "   Tamaño: $([math]::Round($portablePath.Length/1MB, 2)) MB" -ForegroundColor White

# Limpiar logs anteriores
$logPath = "$env:APPDATA\SIGEPEN\app.log"
if (Test-Path $logPath) {
    Write-Host "`n🗑️  Limpiando logs anteriores..." -ForegroundColor Yellow
    Remove-Item $logPath -Force
    Write-Host "   ✓ Logs eliminados" -ForegroundColor Green
}

# Verificar procesos existentes
Write-Host "`n🔍 Verificando procesos existentes..." -ForegroundColor Yellow
$existingProcesses = Get-Process -ErrorAction SilentlyContinue | Where-Object { $_.ProcessName -like "*SIGEPEN*" }

if ($existingProcesses) {
    Write-Host "   ⚠️  Procesos SIGEPEN en ejecución:" -ForegroundColor Red
    foreach ($proc in $existingProcesses) {
        Write-Host "      • PID: $($proc.Id) - $($proc.ProcessName)" -ForegroundColor White
    }
    
    $response = Read-Host "`n   ¿Deseas cerrar estos procesos? (S/N)"
    if ($response -eq "S" -or $response -eq "s") {
        foreach ($proc in $existingProcesses) {
            Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
        }
        Write-Host "   ✓ Procesos cerrados" -ForegroundColor Green
        Start-Sleep -Seconds 2
    }
} else {
    Write-Host "   ✓ No hay procesos SIGEPEN ejecutándose" -ForegroundColor Green
}

# Verificar puertos
Write-Host "`n🔍 Verificando puertos..." -ForegroundColor Yellow
$netstatOutput = netstat -ano
$port3000 = $netstatOutput | Select-String ":3000"
$port4321 = $netstatOutput | Select-String ":4321"

if ($port3000 -or $port4321) {
    Write-Host "   ⚠️  Puertos en uso:" -ForegroundColor Red
    if ($port3000) {
        Write-Host "      Puerto 3000 ocupado" -ForegroundColor White
    }
    if ($port4321) {
        Write-Host "      Puerto 4321 ocupado" -ForegroundColor White
    }
} else {
    Write-Host "   ✓ Puertos 3000 y 4321 disponibles" -ForegroundColor Green
}

# Ejecutar el portable
Write-Host "`n🚀 Ejecutando aplicación..." -ForegroundColor Yellow
Write-Host "   (Observa si abre una ventana)" -ForegroundColor Gray
Write-Host "==================================================" -ForegroundColor Cyan

try {
    $process = Start-Process -FilePath $portablePath.FullName -PassThru -WindowStyle Normal
    
    Write-Host "`n✅ Proceso iniciado (PID: $($process.Id))" -ForegroundColor Green
    Write-Host "`n⏳ Esperando 10 segundos para que inicie..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    
    # Verificar si el proceso sigue vivo
    $stillRunning = Get-Process -Id $process.Id -ErrorAction SilentlyContinue
    
    if ($stillRunning) {
        Write-Host "✅ El proceso sigue ejecutándose" -ForegroundColor Green
        Write-Host "`n📋 Información del proceso:" -ForegroundColor Cyan
        Get-Process -Id $process.Id | Select-Object Id, ProcessName, CPU, WorkingSet | Format-Table
    } else {
        Write-Host "❌ El proceso se cerró inesperadamente" -ForegroundColor Red
    }
    
    # Verificar logs
    Write-Host "`n📄 Verificando logs..." -ForegroundColor Yellow
    if (Test-Path $logPath) {
        Write-Host "   ✅ Logs encontrados" -ForegroundColor Green
        Write-Host "`n" + ("="*60) -ForegroundColor Cyan
        Write-Host "LOGS DE LA APLICACIÓN:" -ForegroundColor Cyan
        Write-Host ("="*60) -ForegroundColor Cyan
        Get-Content $logPath
        Write-Host ("="*60) -ForegroundColor Cyan
    } else {
        Write-Host "   ❌ No se generaron logs" -ForegroundColor Red
        Write-Host "   Esto indica que la app no llegó a ejecutar código" -ForegroundColor Yellow
    }
    
    # Preguntar si cerrar
    Write-Host "`n❓ ¿Deseas cerrar la aplicación? (S/N)" -ForegroundColor Cyan
    $response = Read-Host
    
    if ($response -eq "S" -or $response -eq "s") {
        $proc = Get-Process -Id $process.Id -ErrorAction SilentlyContinue
        if ($proc) {
            Stop-Process -Id $process.Id -Force
            Write-Host "✓ Proceso cerrado" -ForegroundColor Green
        }
    } else {
        Write-Host "⚠️  La aplicación sigue ejecutándose (PID: $($process.Id))" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "`n❌ Error al ejecutar:" -ForegroundColor Red
    Write-Host "   $_" -ForegroundColor White
}

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "  Debugging completado" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

Write-Host "`n💡 Ubicación de logs: $logPath" -ForegroundColor Cyan
Write-Host ""


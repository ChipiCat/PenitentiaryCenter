# Test de instalador con fix de cloudinary
Write-Host "`n=== INSTALADOR: TEST CLOUDINARY FIX ===" -ForegroundColor Cyan
Write-Host "Esperando que termine el build..." -ForegroundColor Yellow

# Esperar a que el instalador esté listo
$installerPath = ".\release\SIGEPEN-3.0.2-x64.exe"
$timeout = 300 # 5 minutos
$elapsed = 0

while (-not (Test-Path $installerPath) -and $elapsed -lt $timeout) {
    Start-Sleep -Seconds 5
    $elapsed += 5
    Write-Host "." -NoNewline
}

if (-not (Test-Path $installerPath)) {
    Write-Host "`nERROR: Instalador no se generó en $timeout segundos" -ForegroundColor Red
    exit 1
}

Write-Host "`n✓ Instalador encontrado!" -ForegroundColor Green

# Desinstalar versión anterior si existe
Write-Host "`nDesinstalando versión anterior..." -ForegroundColor Yellow
$uninstaller = "$env:LOCALAPPDATA\Programs\SIGEPEN\Uninstall SIGEPEN.exe"
if (Test-Path $uninstaller) {
    Start-Process $uninstaller -ArgumentList "/S" -Wait
    Start-Sleep -Seconds 3
}

# Instalar nueva versión
Write-Host "Instalando nueva versión (modo silencioso)..." -ForegroundColor Yellow
Start-Process $installerPath -ArgumentList "/S" -Wait
Start-Sleep -Seconds 5

# Verificar instalación
$exePath = "$env:LOCALAPPDATA\Programs\SIGEPEN\SIGEPEN.exe"
if (-not (Test-Path $exePath)) {
    Write-Host "ERROR: Instalación falló" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Instalación completada" -ForegroundColor Green

# Verificar que cloudinary NO esté en node_modules (debe estar bundleado)
$cloudinaryPath = "$env:LOCALAPPDATA\Programs\SIGEPEN\resources\backend\node_modules\cloudinary"
if (Test-Path $cloudinaryPath) {
    Write-Host "⚠ WARNING: cloudinary SIGUE en node_modules (debería estar bundleado)" -ForegroundColor Yellow
} else {
    Write-Host "✓ cloudinary bundleado correctamente (no está en node_modules)" -ForegroundColor Green
}

# Limpiar logs anteriores
$logPath = "$env:APPDATA\SIGEPEN\app.log"
if (Test-Path $logPath) {
    Remove-Item $logPath -Force
}

# Ejecutar aplicación
Write-Host "`nEjecutando SIGEPEN..." -ForegroundColor Cyan
$process = Start-Process $exePath -PassThru

Write-Host "Proceso iniciado (PID: $($process.Id))" -ForegroundColor Gray
Write-Host "Esperando 20 segundos..." -ForegroundColor Gray
Start-Sleep -Seconds 20

# Verificar resultado
if (Get-Process -Id $process.Id -ErrorAction SilentlyContinue) {
    Write-Host "`n✅ ¡ÉXITO! El proceso sigue ejecutándose" -ForegroundColor Green
    
    # Mostrar logs
    if (Test-Path $logPath) {
        Write-Host "`n=== LOGS ===" -ForegroundColor Cyan
        Get-Content $logPath -Tail 30
        Write-Host "============`n" -ForegroundColor Cyan
        
        # Buscar errores específicos
        $logContent = Get-Content $logPath -Raw
        if ($logContent -match "Cannot find module") {
            Write-Host "⚠ Aún hay errores de módulos faltantes" -ForegroundColor Red
        } elseif ($logContent -match "Backend started successfully") {
            Write-Host "✅ Backend inició correctamente!" -ForegroundColor Green
        }
    }
} else {
    Write-Host "`n❌ ERROR: El proceso se cerró" -ForegroundColor Red
    
    if (Test-Path $logPath) {
        Write-Host "`n=== LOGS DE ERROR ===" -ForegroundColor Red
        Get-Content $logPath
        Write-Host "====================`n" -ForegroundColor Red
    } else {
        Write-Host "No se generaron logs" -ForegroundColor Red
    }
}

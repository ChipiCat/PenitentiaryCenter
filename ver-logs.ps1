# Script para ver logs de la aplicación Electron
# Útil para debugging cuando el portable no abre

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "  SIGEPEN - Visor de Logs" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# Ubicación de los logs
$appDataPath = "$env:APPDATA\SIGEPEN"
$logFile = Join-Path $appDataPath "app.log"

Write-Host "`n📁 Ubicación de logs:" -ForegroundColor Yellow
Write-Host "   $logFile" -ForegroundColor White

# Verificar si existe el archivo de logs
if (Test-Path $logFile) {
    Write-Host "`n✅ Archivo de logs encontrado" -ForegroundColor Green
    
    # Mostrar tamaño del archivo
    $fileSize = (Get-Item $logFile).Length
    $fileSizeKB = [math]::Round($fileSize / 1KB, 2)
    Write-Host "   Tamaño: $fileSizeKB KB" -ForegroundColor Gray
    
    # Preguntar qué hacer
    Write-Host "`n¿Qué deseas hacer?" -ForegroundColor Cyan
    Write-Host "  1. Ver últimas 50 líneas" -ForegroundColor White
    Write-Host "  2. Ver últimas 100 líneas" -ForegroundColor White
    Write-Host "  3. Ver todo el archivo" -ForegroundColor White
    Write-Host "  4. Abrir en Notepad" -ForegroundColor White
    Write-Host "  5. Limpiar logs" -ForegroundColor White
    Write-Host "  6. Ver solo errores" -ForegroundColor White
    Write-Host "  7. Copiar ruta al portapapeles" -ForegroundColor White
    Write-Host ""
    
    $opcion = Read-Host "Opción (1-7)"
    
    switch ($opcion) {
        "1" {
            Write-Host "`n📄 Últimas 50 líneas:" -ForegroundColor Yellow
            Write-Host "==================================================" -ForegroundColor Gray
            Get-Content $logFile -Tail 50
        }
        "2" {
            Write-Host "`n📄 Últimas 100 líneas:" -ForegroundColor Yellow
            Write-Host "==================================================" -ForegroundColor Gray
            Get-Content $logFile -Tail 100
        }
        "3" {
            Write-Host "`n📄 Contenido completo:" -ForegroundColor Yellow
            Write-Host "==================================================" -ForegroundColor Gray
            Get-Content $logFile
        }
        "4" {
            Write-Host "`n📝 Abriendo en Notepad..." -ForegroundColor Yellow
            notepad $logFile
        }
        "5" {
            Write-Host "`n🗑️  Limpiando logs..." -ForegroundColor Yellow
            Remove-Item $logFile -Force
            Write-Host "✅ Logs eliminados" -ForegroundColor Green
        }
        "6" {
            Write-Host "`n❌ Solo errores:" -ForegroundColor Red
            Write-Host "==================================================" -ForegroundColor Gray
            Get-Content $logFile | Select-String "ERROR"
        }
        "7" {
            Set-Clipboard -Value $logFile
            Write-Host "`n📋 Ruta copiada al portapapeles" -ForegroundColor Green
            Write-Host "   $logFile" -ForegroundColor White
        }
        default {
            Write-Host "`n❌ Opción inválida" -ForegroundColor Red
        }
    }
    
} else {
    Write-Host "`n❌ No se encontró el archivo de logs" -ForegroundColor Red
    Write-Host "`nPosibles razones:" -ForegroundColor Yellow
    Write-Host "  • La aplicación nunca se ha ejecutado" -ForegroundColor White
    Write-Host "  • Los logs están en otra ubicación" -ForegroundColor White
    
    Write-Host "`n📂 Buscando en otras ubicaciones posibles..." -ForegroundColor Yellow
    
    # Buscar en otras ubicaciones posibles
    $otherLocations = @(
        "$env:LOCALAPPDATA\SIGEPEN\app.log",
        "$env:USERPROFILE\AppData\Roaming\SIGEPEN\app.log",
        "$env:TEMP\SIGEPEN\app.log"
    )
    
    $found = $false
    foreach ($loc in $otherLocations) {
        if (Test-Path $loc) {
            Write-Host "   ✅ Encontrado en: $loc" -ForegroundColor Green
            $found = $true
        }
    }
    
    if (-not $found) {
        Write-Host "`n💡 Ejecuta la aplicación primero para generar logs" -ForegroundColor Cyan
    }
}

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "  Ubicaciones de logs de SIGEPEN:" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Principal: $env:APPDATA\SIGEPEN\app.log" -ForegroundColor White
Write-Host "  Alternativo: $env:LOCALAPPDATA\SIGEPEN\app.log" -ForegroundColor Gray
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Información adicional sobre el portable
Write-Host "💡 Tips para debugging del portable:" -ForegroundColor Cyan
Write-Host "  1. Ejecuta el portable desde PowerShell para ver errores" -ForegroundColor White
Write-Host "  2. Revisa si hay procesos zombie: Get-Process | Where-Object {$_.ProcessName -like '*SIGEPEN*'}" -ForegroundColor White
Write-Host "  3. Verifica puertos ocupados: netstat -ano | findstr '3000\|4321'" -ForegroundColor White
Write-Host ""

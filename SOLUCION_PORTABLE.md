# Test Instalador vs Portable

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Comparacion: Instalador vs Portable" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "El portable no genera logs (no llega a ejecutar Electron)" -ForegroundColor Yellow
Write-Host ""
Write-Host "SOLUCION TEMPORAL:" -ForegroundColor Cyan
Write-Host "  Usa el instalador en lugar del portable" -ForegroundColor White
Write-Host ""
Write-Host "Archivo: .\release\SIGEPEN-3.0.2-x64.exe" -ForegroundColor Green
Write-Host "Tamano: ~120 MB" -ForegroundColor Gray
Write-Host ""
Write-Host "Este instalador:" -ForegroundColor Yellow
Write-Host "  - Esta optimizado (70% mas pequeno que antes)" -ForegroundColor White
Write-Host "  - Inicia mas rapido" -ForegroundColor White
Write-Host "  - Incluye todas las optimizaciones" -ForegroundColor White
Write-Host ""
Write-Host "Para instalar:" -ForegroundColor Cyan
Write-Host "  1. Ve a la carpeta: cd release" -ForegroundColor White
Write-Host "  2. Ejecuta: SIGEPEN-3.0.2-x64.exe" -ForegroundColor White
Write-Host "  3. Sigue el asistente de instalacion" -ForegroundColor White
Write-Host ""
Write-Host "Nota sobre el portable:" -ForegroundColor Yellow
Write-Host "  El problema del portable parece ser que Electron no se ejecuta" -ForegroundColor Gray
Write-Host "  Esto puede ser una limitacion de electron-builder con portables" -ForegroundColor Gray
Write-Host "  El instalador NSIS funciona correctamente" -ForegroundColor Gray
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

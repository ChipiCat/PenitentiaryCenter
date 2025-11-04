"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = require("path");
const puppeteer_1 = __importDefault(require("puppeteer"));
const fs_1 = require("fs");
const os_1 = require("os");
const child_process_1 = require("child_process");
const express_1 = __importDefault(require("express"));
// Para ES modules compatibility
const __dirname = __filename ? (0, path_1.dirname)(__filename) : process.cwd();
// Variables para los procesos
let mainWindow = null;
let backendProcess = null;
let frontendServer = null;
// Configuración
const isDev = process.env.NODE_ENV === 'development';
const BACKEND_PORT = 3000;
const FRONTEND_DEV_PORT = 4321;
// Función para iniciar el backend de NestJS
function startBackendServer() {
    return new Promise((resolve, reject) => {
        const isPackaged = electron_1.app.isPackaged;
        // En desarrollo, usar el código fuente con npm
        if (isDev && !isPackaged) {
            console.log('🚀 Iniciando backend NestJS en modo desarrollo...');
            const backendPath = (0, path_1.join)(__dirname, '..', 'peny-back');
            // Usar npm run start:dev para desarrollo
            backendProcess = (0, child_process_1.spawn)('npm', ['run', 'start:dev'], {
                cwd: backendPath,
                shell: true,
                env: {
                    ...process.env,
                    PORT: BACKEND_PORT.toString(),
                    NODE_ENV: 'development',
                    FRONTEND_URL: `http://localhost:${FRONTEND_DEV_PORT}`
                }
            });
        }
        else {
            // En producción, usar el código compilado
            console.log('🚀 Iniciando backend NestJS en modo producción...');
            const backendDistPath = (0, path_1.join)(process.resourcesPath, 'backend', 'dist', 'main.js');
            backendProcess = (0, child_process_1.spawn)('node', [backendDistPath], {
                shell: true,
                env: {
                    ...process.env,
                    PORT: BACKEND_PORT.toString(),
                    NODE_ENV: 'production',
                    FRONTEND_URL: 'http://localhost:4321'
                }
            });
        }
        if (!backendProcess) {
            reject(new Error('No se pudo iniciar el proceso del backend'));
            return;
        }
        // Capturar logs del backend
        backendProcess.stdout?.on('data', (data) => {
            console.log(`[Backend] ${data.toString()}`);
            // Detectar cuando el servidor esté listo
            if (data.toString().includes('Application is running')) {
                console.log('✅ Backend NestJS iniciado correctamente');
                resolve();
            }
        });
        backendProcess.stderr?.on('data', (data) => {
            console.error(`[Backend Error] ${data.toString()}`);
        });
        backendProcess.on('error', (error) => {
            console.error('❌ Error al iniciar backend:', error);
            reject(error);
        });
        backendProcess.on('exit', (code) => {
            console.log(`⚠️ Backend cerrado con código: ${code}`);
            backendProcess = null;
        });
        // Timeout de 30 segundos para el inicio
        setTimeout(() => {
            if (backendProcess && !backendProcess.killed) {
                console.log('⏱️ Backend iniciado (timeout alcanzado, asumiendo éxito)');
                resolve();
            }
        }, 30000);
    });
}
// Función para detener el backend
function stopBackendServer() {
    if (backendProcess && !backendProcess.killed) {
        console.log('🛑 Deteniendo backend NestJS...');
        backendProcess.kill('SIGTERM');
        // Forzar cierre si no responde en 5 segundos
        setTimeout(() => {
            if (backendProcess && !backendProcess.killed) {
                console.log('⚠️ Forzando cierre del backend...');
                backendProcess.kill('SIGKILL');
            }
        }, 5000);
    }
}
// Función para iniciar servidor de frontend en producción
function startFrontendServer() {
    return new Promise((resolve, reject) => {
        const isPackaged = electron_1.app.isPackaged;
        // En desarrollo, NO iniciar servidor (Vite ya está corriendo externamente)
        if (isDev && !isPackaged) {
            console.log('📱 Modo desarrollo: Esperando Vite en http://localhost:4321');
            resolve();
            return;
        }
        // En producción, iniciar servidor Express para servir el frontend
        console.log('🌐 Iniciando servidor frontend en producción...');
        try {
            const expressApp = (0, express_1.default)();
            const frontendDistPath = (0, path_1.join)(process.resourcesPath, 'app', 'PenyFront', 'dist');
            console.log('📂 Sirviendo frontend desde:', frontendDistPath);
            // Servir archivos estáticos
            expressApp.use(express_1.default.static(frontendDistPath));
            // SPA fallback - redirigir todas las rutas a index.html
            expressApp.get('*', (req, res) => {
                res.sendFile((0, path_1.join)(frontendDistPath, 'index.html'));
            });
            // Iniciar servidor
            frontendServer = expressApp.listen(FRONTEND_DEV_PORT, 'localhost', () => {
                console.log(`✅ Servidor frontend iniciado en http://localhost:${FRONTEND_DEV_PORT}`);
                resolve();
            });
            frontendServer.on('error', (error) => {
                console.error('❌ Error al iniciar servidor frontend:', error);
                reject(error);
            });
        }
        catch (error) {
            console.error('❌ Error creando servidor frontend:', error);
            reject(error);
        }
    });
}
// Función para detener el servidor de frontend
function stopFrontendServer() {
    if (frontendServer) {
        console.log('🛑 Deteniendo servidor frontend...');
        frontendServer.close(() => {
            console.log('✅ Servidor frontend cerrado');
        });
        frontendServer = null;
    }
}
// Función para generar PDF usando Puppeteer
async function generatePDFFromHTML(htmlContent) {
    let browser;
    let tempDir;
    try {
        // Crear directorio temporal
        tempDir = (0, fs_1.mkdtempSync)((0, path_1.join)((0, os_1.tmpdir)(), 'farmacia-pdf-'));
        const tempHtmlPath = (0, path_1.join)(tempDir, 'report.html');
        const tempPdfPath = (0, path_1.join)(tempDir, 'report.pdf');
        // Escribir HTML temporal
        (0, fs_1.writeFileSync)(tempHtmlPath, htmlContent, 'utf8');
        // Lanzar Puppeteer
        browser = await puppeteer_1.default.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        // Cargar el HTML
        await page.goto(`file://${tempHtmlPath}`, {
            waitUntil: 'networkidle0',
            timeout: 10000
        });
        // Generar PDF con configuración exacta
        await page.pdf({
            path: tempPdfPath,
            format: 'Letter',
            margin: {
                top: '0mm',
                right: '10mm',
                bottom: '10mm',
                left: '10mm'
            },
            printBackground: true,
            preferCSSPageSize: true
        });
        // Limpiar HTML temporal
        try {
            (0, fs_1.unlinkSync)(tempHtmlPath);
        }
        catch (e) { }
        return tempPdfPath;
    }
    finally {
        if (browser) {
            await browser.close();
        }
    }
}
function getFrontendUrl() {
    // SIEMPRE usar servidor local en puerto 4321
    // Esto es más confiable que servir archivos estáticos
    return `http://localhost:${FRONTEND_DEV_PORT}`;
}
function createWindow() {
    // Crear la ventana principal
    mainWindow = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: (0, path_1.join)(__dirname, 'preload.js'),
            webSecurity: true,
            backgroundThrottling: false, // Mejora el rendimiento en segundo plano
            devTools: isDev, // Deshabilita DevTools en producción
            spellcheck: false // Desactiva corrector para ahorrar recursos
        },
        show: false,
        titleBarStyle: 'default',
        autoHideMenuBar: true,
        backgroundColor: '#ffffff' // Evita parpadeos al cargar
    });
    // Mostrar ventana cuando esté lista
    mainWindow.once('ready-to-show', () => {
        mainWindow?.show();
        // Abrir DevTools en desarrollo
        if (isDev) {
            mainWindow?.webContents.openDevTools();
        }
    });
    // Limpiar referencia cuando se cierre
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        return {
            action: 'allow',
            overrideBrowserWindowOptions: {
                width: 500,
                height: 400,
                ...(mainWindow ? { parent: mainWindow } : {}),
                modal: false
            }
        };
    });
    // Manejar enlaces externos
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        // Abrir enlaces externos en el navegador por defecto
        if (url.startsWith('http://') || url.startsWith('https://')) {
            electron_1.shell.openExternal(url);
        }
        return { action: 'deny' };
    });
    // Prevenir navegación externa no deseada
    mainWindow.webContents.on('will-navigate', (event, url) => {
        if (!url.startsWith('http://localhost') && !url.startsWith('file://')) {
            event.preventDefault();
        }
    });
    // Cargar la aplicación
    const frontendUrl = getFrontendUrl();
    console.log('🌐 Cargando frontend desde:', frontendUrl);
    mainWindow.loadURL(frontendUrl).catch((error) => {
        console.error('❌ Error al cargar frontend:', error);
    });
    // Log cuando la página termine de cargar
    mainWindow.webContents.on('did-finish-load', () => {
        console.log('✅ Frontend cargado correctamente');
    });
    // Log si hay error al cargar
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        console.error('❌ Error al cargar página:', errorCode, errorDescription);
    });
}
async function initializeApp() {
    try {
        console.log('🚀 Iniciando aplicación...');
        console.log(`   Modo: ${isDev ? 'Desarrollo' : 'Producción'}`);
        console.log(`   Empaquetado: ${electron_1.app.isPackaged ? 'Sí' : 'No'}`);
        // 1. Iniciar servidor frontend (solo en producción)
        console.log('🔧 Iniciando servidor frontend...');
        await startFrontendServer();
        // 2. Iniciar el backend
        console.log('🔧 Iniciando servidor backend...');
        await startBackendServer();
        console.log('✅ Backend iniciado correctamente');
        // 3. Esperar un momento adicional para asegurar que ambos servidores estén listos
        await new Promise(resolve => setTimeout(resolve, 2000));
        if (isDev && !electron_1.app.isPackaged) {
            console.log(`📱 Modo desarrollo:`);
            console.log(`   - Frontend: http://localhost:${FRONTEND_DEV_PORT} (Vite dev server externo)`);
            console.log(`   - Backend: http://localhost:${BACKEND_PORT}`);
            console.log('💡 Asegúrate de ejecutar "npm run dev:front" en otra terminal');
        }
        else {
            console.log('📦 Modo producción:');
            console.log(`   - Frontend: http://localhost:${FRONTEND_DEV_PORT} (Express server interno)`);
            console.log(`   - Backend: http://localhost:${BACKEND_PORT}`);
        }
        // 4. Crear ventana principal
        console.log('🪟 Creando ventana principal...');
        createWindow();
        console.log('✅ Aplicación iniciada correctamente');
    }
    catch (error) {
        console.error('❌ Error al inicializar la aplicación:', error);
        console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace available');
        electron_1.app.quit();
    }
}
// Gestión de memoria y optimización MEJORADA
async function cleanupResourcesSafe() {
    if (!mainWindow)
        return;
    console.log('🧹 Iniciando limpieza suave de recursos...');
    try {
        // Solo limpiar cache si no hay actividad reciente
        const memoryInfo = await process.getProcessMemoryInfo();
        console.log('💾 Memoria actual:', {
            resident: Math.round(memoryInfo.residentSet / 1024 / 1024) + 'MB',
            heap: Math.round(memoryInfo.private / 1024 / 1024) + 'MB'
        });
        // Solo hacer limpieza agresiva si se supera el límite (usando residentSet)
        if (memoryInfo.residentSet > 500 * 1024 * 1024) { // 500MB
            console.log('⚠️ Memoria alta detectada, iniciando limpieza...');
            // Hacer limpieza en chunks pequeños para evitar bloqueos
            setTimeout(() => {
                if (mainWindow) {
                    mainWindow.webContents.session.clearCache();
                }
            }, 100);
            setTimeout(() => {
                if (mainWindow) {
                    mainWindow.webContents.session.clearStorageData({
                        storages: ['shadercache', 'serviceworkers']
                        // 🔥 EXCLUIR cachestorage para no afectar la app
                    });
                }
            }, 200);
            // GC suave después de un delay
            setTimeout(() => {
                if (global.gc) {
                    console.log('🗑️ Ejecutando garbage collection...');
                    global.gc();
                }
            }, 300);
        }
        console.log('✅ Limpieza completada');
    }
    catch (error) {
        console.error('❌ Error en limpieza de recursos:', error);
    }
}
// 🔥 NUEVO: Sistema de monitoreo inteligente de memoria
let cleanupInterval = null;
function startMemoryMonitoring() {
    console.log('🔍 Iniciando monitoreo inteligente de memoria...');
    // Limpiar cada 45 minutos en lugar de 30 (menos agresivo)
    cleanupInterval = setInterval(() => {
        void cleanupResourcesSafe();
    }, 2700000); // 45 minutos
}
function stopMemoryMonitoring() {
    if (cleanupInterval) {
        clearInterval(cleanupInterval);
        cleanupInterval = null;
        console.log('🛑 Monitoreo de memoria detenido');
    }
}
// Limpiar recursos periódicamente (REEMPLAZADO por sistema inteligente)
// setInterval(cleanupResources, 1800000); // ❌ ELIMINADO: Causa trabas
// Optimizaciones de rendimiento
electron_1.app.commandLine.appendSwitch('disable-background-timer-throttling');
electron_1.app.commandLine.appendSwitch('disable-renderer-backgrounding');
electron_1.app.commandLine.appendSwitch('disable-backgrounding-occluded-windows'); // 🔥 CRÍTICO: Evita pausar cuando la ventana está oculta
// 🔥 NUEVAS OPTIMIZACIONES PARA EVITAR TRABAS:
electron_1.app.commandLine.appendSwitch('max-old-space-size', '2048'); // Límite RAM: 2GB
electron_1.app.commandLine.appendSwitch('max-semi-space-size', '128'); // Limite heap joven
electron_1.app.commandLine.appendSwitch('disable-dev-shm-usage'); // Evita problemas de memoria compartida
electron_1.app.commandLine.appendSwitch('disable-software-rasterizer'); // Usa GPU cuando disponible
// Eventos de la aplicación
electron_1.app.whenReady().then(() => {
    initializeApp();
    // Comenzar monitoreo de memoria después de 5 minutos
    setTimeout(() => {
        startMemoryMonitoring();
    }, 300000); // 5 minutos de gracia al inicio
});
electron_1.app.on('window-all-closed', () => {
    console.log('🔄 Cerrando todos los servidores...');
    stopMemoryMonitoring();
    stopFrontendServer(); // Detener servidor frontend
    stopBackendServer(); // Detener el backend
    void cleanupResourcesSafe();
    // En macOS es común mantener la app activa aunque no haya ventanas
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', () => {
    // En macOS, recrear ventana cuando se hace clic en el dock
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
// 🔥 NUEVO: Manejar minimización para evitar trabas
electron_1.app.on('browser-window-blur', () => {
    console.log('👁️ Ventana perdió foco - modo ahorro activado');
});
electron_1.app.on('browser-window-focus', () => {
    console.log('👁️ Ventana recuperó foco - modo normal');
});
// Limpieza al cerrar
electron_1.app.on('before-quit', async () => {
    console.log('🔄 Cerrando aplicación...');
    stopFrontendServer();
    stopBackendServer();
});
// IPC handlers para comunicación con el renderer
electron_1.ipcMain.handle('get-app-version', () => {
    return electron_1.app.getVersion();
});
electron_1.ipcMain.handle('get-app-info', async () => {
    return {
        version: electron_1.app.getVersion(),
        name: electron_1.app.getName(),
        isDev: isDev,
        platform: process.platform
    };
});
// Handler para generar PDF e imprimir
electron_1.ipcMain.handle('generate-and-print-pdf', async (_event, htmlContent) => {
    try {
        console.log('📄 Generando PDF desde HTML...');
        // Generar PDF usando Puppeteer
        const pdfPath = await generatePDFFromHTML(htmlContent);
        console.log('✅ PDF generado:', pdfPath);
        // Abrir el PDF con el visor por defecto para imprimir
        await electron_1.shell.openPath(pdfPath);
        // Limpiar PDF después de 30 segundos (tiempo para que se abra)
        setTimeout(() => {
            try {
                (0, fs_1.unlinkSync)(pdfPath);
                console.log('🗑️ PDF temporal eliminado');
            }
            catch (e) {
                console.warn('⚠️ No se pudo eliminar PDF temporal:', e);
            }
        }, 30000);
        return { success: true };
    }
    catch (error) {
        console.error('❌ Error generando PDF:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido'
        };
    }
});
module.exports = { app: electron_1.app, mainWindow };
//# sourceMappingURL=main.js.map
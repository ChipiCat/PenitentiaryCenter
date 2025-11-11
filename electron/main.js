"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = require("path");
const child_process_1 = require("child_process");
const express_1 = __importDefault(require("express"));
const fs = __importStar(require("fs"));
// Configurar logging a archivo en producción (debe ejecutarse antes de app.whenReady)
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
let logStream = null;
function setupFileLogging() {
    try {
        const userDataPath = electron_1.app.getPath("userData");
        const LOG_FILE = (0, path_1.join)(userDataPath, "app.log");
        // Crear el directorio si no existe
        if (!fs.existsSync(userDataPath)) {
            fs.mkdirSync(userDataPath, { recursive: true });
        }
        logStream = fs.createWriteStream(LOG_FILE, { flags: "a" });
        console.log = (...args) => {
            const message = args.map(arg => typeof arg === "object" ? JSON.stringify(arg) : arg).join(" ");
            const timestamp = new Date().toISOString();
            logStream?.write(`[${timestamp}] ${message}\n`);
            originalConsoleLog.apply(console, args);
        };
        console.error = (...args) => {
            const message = args.map(arg => typeof arg === "object" ? JSON.stringify(arg) : arg).join(" ");
            const timestamp = new Date().toISOString();
            logStream?.write(`[${timestamp}] ERROR: ${message}\n`);
            originalConsoleError.apply(console, args);
        };
        console.log(`[Logging] ✓ Archivo de logs: ${LOG_FILE}`);
    }
    catch (error) {
        originalConsoleError("[Logging] ✗ Error al configurar logging:", error);
    }
}
const CONFIG = {
    ports: { frontend: 4321, backend: 3000 },
    memory: { maxOldSpace: 1024 },
    isDev: process.env.NODE_ENV === "development",
    isPackaged: electron_1.app.isPackaged,
};
let mainWindow = null;
let backendManager = null;
let frontendManager = null;
let isCleaningUp = false;
class BackendManager {
    process = null;
    port;
    isDev;
    constructor(port, isDev) {
        this.port = port;
        this.isDev = isDev;
    }
    async start() {
        return new Promise((resolve, reject) => {
            console.log(`[Backend] Iniciando en puerto ${this.port}...`);
            const backendPath = this.isDev
                ? (0, path_1.join)(__dirname, "..", "peny-back")
                : (0, path_1.join)(process.resourcesPath, "backend");
            console.log(`[Backend] Path del backend: ${backendPath}`);
            console.log(`[Backend] Modo: ${this.isDev ? "Desarrollo" : "Producción"}`);
            // Verificar que el path existe
            if (!fs.existsSync(backendPath)) {
                const error = `[Backend] ERROR: El directorio no existe: ${backendPath}`;
                console.error(error);
                reject(new Error(error));
                return;
            }
            const command = this.isDev ? "npm" : "node";
            const mainJsPath = (0, path_1.join)(backendPath, "dist", "main.js");
            const args = this.isDev
                ? ["run", "start:dev"]
                : [mainJsPath];
            // Verificar que main.js existe en producción
            if (!this.isDev && !fs.existsSync(mainJsPath)) {
                const error = `[Backend] ERROR: No se encontró main.js en: ${mainJsPath}`;
                console.error(error);
                console.error(`[Backend] Contenido de ${backendPath}:`);
                try {
                    const files = fs.readdirSync(backendPath);
                    console.error(`[Backend] Archivos: ${files.join(", ")}`);
                }
                catch (e) {
                    console.error(`[Backend] Error listando archivos: ${e}`);
                }
                reject(new Error(error));
                return;
            }
            console.log(`[Backend] Comando: ${command} ${args.join(" ")}`);
            console.log(`[Backend] CWD: ${backendPath}`);
            this.process = (0, child_process_1.spawn)(command, args, {
                cwd: backendPath,
                shell: true,
                env: {
                    ...process.env,
                    PORT: this.port.toString(),
                    NODE_ENV: this.isDev ? "development" : "production",
                    NODE_PATH: (0, path_1.join)(backendPath, "node_modules"),
                },
            });
            let hasResolved = false;
            this.process.stdout?.on("data", (data) => {
                const output = data.toString();
                console.log(`[Backend] ${output}`);
                if (!hasResolved && (output.includes("Application is running") || output.includes("Nest application successfully started"))) {
                    console.log("[Backend] ✓ Iniciado correctamente");
                    hasResolved = true;
                    resolve();
                }
            });
            this.process.stderr?.on("data", (data) => {
                const errorOutput = data.toString();
                console.error(`[Backend Error] ${errorOutput}`);
                // Si el error contiene "Cannot find module", rechazar inmediatamente
                if (errorOutput.includes("Cannot find module") && !hasResolved) {
                    hasResolved = true;
                    reject(new Error(`Backend error: ${errorOutput}`));
                }
            });
            this.process.on("error", (error) => {
                console.error("[Backend] Error al iniciar proceso:", error.message);
                console.error("[Backend] Stack:", error.stack);
                if (!hasResolved) {
                    hasResolved = true;
                    reject(error);
                }
            });
            this.process.on("exit", (code, signal) => {
                console.log(`[Backend] Proceso terminado con código ${code}, señal: ${signal}`);
                if (code !== 0 && code !== null && !hasResolved) {
                    hasResolved = true;
                    reject(new Error(`Backend exit with code ${code}`));
                }
                this.process = null;
            });
            setTimeout(() => {
                if (this.process && !this.process.killed && !hasResolved) {
                    console.log("[Backend] ⚠ Timeout alcanzado, asumiendo inicio exitoso");
                    hasResolved = true;
                    resolve();
                }
            }, this.isDev ? 30000 : 15000);
        });
    }
    stop() {
        if (!this.process || this.process.killed) {
            console.log("[Backend] No hay proceso para detener");
            return;
        }
        const pid = this.process.pid;
        console.log(`[Backend] Deteniendo proceso (PID: ${pid})...`);
        try {
            if (process.platform === "win32" && pid) {
                // En Windows, usar taskkill para matar el árbol completo de procesos
                const killProcess = (0, child_process_1.spawn)("taskkill", ["/pid", pid.toString(), "/T", "/F"], {
                    shell: true,
                    detached: true,
                    stdio: "ignore"
                });
                killProcess.on("exit", (code) => {
                    if (code === 0) {
                        console.log("[Backend] ✓ Proceso detenido correctamente");
                    }
                    else {
                        console.log(`[Backend] Proceso terminado con código ${code}`);
                    }
                });
                killProcess.unref();
            }
            else {
                // En Unix/Mac
                this.process.kill("SIGTERM");
                console.log("[Backend] ✓ Señal SIGTERM enviada");
            }
            this.process = null;
        }
        catch (error) {
            console.error("[Backend] Error al detener proceso:", error);
            this.process = null;
        }
    }
}
class FrontendManager {
    server = null;
    port;
    isDev;
    constructor(port, isDev) {
        this.port = port;
        this.isDev = isDev;
    }
    async start() {
        if (this.isDev) {
            console.log(`[Frontend] Modo desarrollo: esperando Vite en puerto ${this.port}...`);
            // Esperar a que Vite esté disponible
            return this.waitForServer();
        }
        return new Promise((resolve, reject) => {
            console.log(`[Frontend] Iniciando servidor Express en puerto ${this.port}...`);
            const app = (0, express_1.default)();
            // En producción, los archivos están desempaquetados en app.asar.unpacked
            const distPath = CONFIG.isPackaged
                ? (0, path_1.join)(process.resourcesPath, "app.asar.unpacked", "PenyFront", "dist")
                : (0, path_1.join)(__dirname, "..", "PenyFront", "dist");
            console.log(`[Frontend] Sirviendo desde: ${distPath}`);
            console.log(`[Frontend] __dirname: ${__dirname}`);
            console.log(`[Frontend] process.resourcesPath: ${process.resourcesPath}`);
            // Verificar que el directorio existe
            if (!fs.existsSync(distPath)) {
                console.error(`[Frontend] ✗ El directorio no existe: ${distPath}`);
                console.error(`[Frontend] Intentando ruta alternativa...`);
                // Intentar ruta alternativa
                const altPath = (0, path_1.join)(__dirname, "..", "PenyFront", "dist");
                console.log(`[Frontend] Ruta alternativa: ${altPath}`);
                if (!fs.existsSync(altPath)) {
                    const error = new Error(`No se encontró el directorio del frontend en ninguna ubicación`);
                    reject(error);
                    return;
                }
                console.log(`[Frontend] ✓ Usando ruta alternativa`);
                app.use(express_1.default.static(altPath));
                app.get("*", (_, res) => {
                    res.sendFile((0, path_1.join)(altPath, "index.html"));
                });
            }
            else {
                console.log(`[Frontend] ✓ Directorio encontrado`);
                app.use(express_1.default.static(distPath));
                app.get("*", (_, res) => {
                    res.sendFile((0, path_1.join)(distPath, "index.html"));
                });
            }
            this.server = app.listen(this.port, "localhost", () => {
                console.log(`[Frontend]  Servidor iniciado en http://localhost:${this.port}`);
                resolve();
            });
            this.server.on("error", (error) => {
                console.error("[Frontend] Error al iniciar servidor:", error.message);
                reject(error);
            });
        });
    }
    async waitForServer() {
        const maxAttempts = 60; // 60 segundos máximo
        const delayMs = 1000; // 1 segundo entre intentos
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                const response = await fetch(`http://localhost:${this.port}`);
                if (response.ok || response.status === 200) {
                    console.log(`[Frontend] ✓ Vite está listo en puerto ${this.port}`);
                    return;
                }
            }
            catch (error) {
                // Servidor no está listo todavía
                if (attempt % 5 === 0) {
                    console.log(`[Frontend] Esperando Vite... (intento ${attempt}/${maxAttempts})`);
                }
            }
            await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
        throw new Error(`[Frontend] Timeout: Vite no está disponible en puerto ${this.port} después de ${maxAttempts} segundos`);
    }
    stop() {
        if (!this.server) {
            console.log("[Frontend] No hay servidor para detener");
            return;
        }
        console.log("[Frontend] Deteniendo servidor Express...");
        try {
            this.server.close((err) => {
                if (err) {
                    console.error("[Frontend] Error al cerrar servidor:", err);
                }
                else {
                    console.log("[Frontend] ✓ Servidor detenido correctamente");
                }
            });
            // Forzar cierre de todas las conexiones
            this.server.closeAllConnections?.();
            this.server = null;
        }
        catch (error) {
            console.error("[Frontend] Error al detener servidor:", error);
            this.server = null;
        }
    }
}
function createMainWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 1024,
        minHeight: 768,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: (0, path_1.join)(__dirname, "preload.js"),
            webSecurity: true,
        },
        show: false,
        backgroundColor: "#ffffff",
        autoHideMenuBar: true,
    });
    mainWindow.once("ready-to-show", () => {
        mainWindow?.show();
        if (CONFIG.isDev) {
            mainWindow?.webContents.openDevTools();
        }
    });
    mainWindow.on("closed", () => {
        console.log("[Window] Ventana cerrada");
        mainWindow = null;
    });
    const url = `http://localhost:${CONFIG.ports.frontend}`;
    console.log(`[Window] Cargando aplicación desde: ${url}`);
    mainWindow.loadURL(url).catch((error) => {
        console.error("[Window] Error al cargar URL:", error);
    });
    mainWindow.webContents.on("did-fail-load", (_, errorCode, errorDescription) => {
        console.error(`[Window] Error al cargar: [${errorCode}] ${errorDescription}`);
    });
    mainWindow.webContents.on("did-finish-load", () => {
        console.log("[Window]  Aplicación cargada correctamente");
    });
}
async function initializeApp() {
    console.log("=".repeat(50));
    console.log("Iniciando PenitentiaryCenter");
    console.log(`Modo: ${CONFIG.isDev ? "Desarrollo" : "Producción"}`);
    console.log(`Empaquetado: ${CONFIG.isPackaged ? "Sí" : "No"}`);
    console.log(`__dirname: ${__dirname}`);
    console.log(`process.resourcesPath: ${process.resourcesPath}`);
    console.log("=".repeat(50));
    const backend = new BackendManager(CONFIG.ports.backend, CONFIG.isDev);
    const frontend = new FrontendManager(CONFIG.ports.frontend, CONFIG.isDev);
    try {
        console.log("[App] Paso 1: Iniciando backend...");
        await backend.start();
        backendManager = backend;
        console.log("[App] ✓ Backend iniciado");
        console.log("[App] Paso 2: Iniciando frontend...");
        await frontend.start();
        frontendManager = frontend;
        console.log("[App] ✓ Frontend iniciado");
        console.log("[App] Paso 3: Esperando 2 segundos...");
        await new Promise((resolve) => setTimeout(resolve, 2000));
        console.log("[App] Paso 4: Creando ventana principal...");
        createMainWindow();
        console.log("[App] ✓ Ventana creada");
        console.log("=".repeat(50));
        console.log(" Aplicación iniciada correctamente");
        console.log(`  Frontend: http://localhost:${CONFIG.ports.frontend}`);
        console.log(`  Backend:  http://localhost:${CONFIG.ports.backend}`);
        console.log("=".repeat(50));
    }
    catch (error) {
        console.error("[App] ✗ Error al inicializar:", error);
        console.error("[App] Stack trace:", error instanceof Error ? error.stack : "N/A");
        cleanup();
        electron_1.app.quit();
    }
}
function cleanup() {
    if (isCleaningUp) {
        console.log("[App] Limpieza ya en progreso, saltando...");
        return;
    }
    isCleaningUp = true;
    console.log("[App] Limpiando recursos...");
    if (backendManager) {
        console.log("[App] Deteniendo backend...");
        backendManager.stop();
        backendManager = null;
    }
    if (frontendManager) {
        console.log("[App] Deteniendo frontend...");
        frontendManager.stop();
        frontendManager = null;
    }
    console.log("[App] ✓ Limpieza completada");
}
electron_1.app.commandLine.appendSwitch("js-flags", `--max-old-space-size=${CONFIG.memory.maxOldSpace}`);
electron_1.app.commandLine.appendSwitch("disable-background-timer-throttling");
electron_1.app.commandLine.appendSwitch("disable-renderer-backgrounding");
// Inicializar logging INMEDIATAMENTE (antes de app.whenReady)
if (electron_1.app.isPackaged) {
    setupFileLogging();
}
electron_1.app.whenReady().then(() => {
    if (!electron_1.app.isPackaged) {
        setupFileLogging(); // También en desarrollo para debug
    }
    initializeApp();
});
electron_1.app.on("window-all-closed", () => {
    console.log("[App] Todas las ventanas cerradas");
    cleanup();
    // Dar tiempo para que los procesos se cierren antes de quit
    setTimeout(() => {
        if (process.platform !== "darwin") {
            console.log("[App] Saliendo de la aplicación...");
            electron_1.app.quit();
        }
    }, 1500);
});
electron_1.app.on("activate", () => {
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
    }
});
electron_1.app.on("before-quit", () => {
    cleanup();
});
electron_1.ipcMain.handle("get-app-info", () => ({
    version: electron_1.app.getVersion(),
    name: electron_1.app.getName(),
    isDev: CONFIG.isDev,
    platform: process.platform,
}));

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = require("path");
const child_process_1 = require("child_process");
const express_1 = __importDefault(require("express"));
const CONFIG = {
    ports: { frontend: 4321, backend: 3000 },
    memory: { maxOldSpace: 1024 },
    isDev: process.env.NODE_ENV === "development",
    isPackaged: electron_1.app.isPackaged,
};
let mainWindow = null;
let backendProcess = null;
let frontendServer = null;
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
            const command = this.isDev ? "npm" : "node";
            const args = this.isDev
                ? ["run", "start:dev"]
                : [(0, path_1.join)(backendPath, "dist", "main.js")];
            this.process = (0, child_process_1.spawn)(command, args, {
                cwd: backendPath,
                shell: true,
                env: {
                    ...process.env,
                    PORT: this.port.toString(),
                    NODE_ENV: this.isDev ? "development" : "production",
                },
            });
            this.process.stdout?.on("data", (data) => {
                const output = data.toString();
                console.log(`[Backend] ${output}`);
                if (output.includes("Application is running")) {
                    console.log("[Backend]  Iniciado correctamente");
                    resolve();
                }
            });
            this.process.stderr?.on("data", (data) => {
                console.error(`[Backend Error] ${data.toString()}`);
            });
            this.process.on("error", (error) => {
                console.error("[Backend] Error al iniciar:", error.message);
                reject(error);
            });
            this.process.on("exit", (code) => {
                console.log(`[Backend] Proceso terminado con código ${code}`);
                this.process = null;
            });
            setTimeout(() => {
                if (this.process && !this.process.killed) {
                    console.log("[Backend]  Timeout alcanzado, asumiendo inicio exitoso");
                    resolve();
                }
            }, 30000);
        });
    }
    stop() {
        if (!this.process || this.process.killed)
            return;
        console.log("[Backend] Deteniendo...");
        this.process.kill("SIGTERM");
        setTimeout(() => {
            if (this.process && !this.process.killed) {
                console.log("[Backend] Forzando cierre...");
                this.process.kill("SIGKILL");
            }
        }, 5000);
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
            const distPath = (0, path_1.join)(process.resourcesPath, "app", "PenyFront", "dist");
            console.log(`[Frontend] Sirviendo desde: ${distPath}`);
            app.use(express_1.default.static(distPath));
            app.get("*", (_, res) => {
                res.sendFile((0, path_1.join)(distPath, "index.html"));
            });
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
        if (!this.server)
            return;
        console.log("[Frontend] Deteniendo servidor...");
        this.server.close(() => {
            console.log("[Frontend]  Servidor detenido");
        });
        this.server = null;
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
    console.log("=".repeat(50));
    const backend = new BackendManager(CONFIG.ports.backend, CONFIG.isDev);
    const frontend = new FrontendManager(CONFIG.ports.frontend, CONFIG.isDev);
    try {
        await backend.start();
        backendProcess = backend;
        await frontend.start();
        frontendServer = frontend;
        await new Promise((resolve) => setTimeout(resolve, 2000));
        console.log("[App] Creando ventana principal...");
        createMainWindow();
        console.log("=".repeat(50));
        console.log(" Aplicación iniciada correctamente");
        console.log(`  Frontend: http://localhost:${CONFIG.ports.frontend}`);
        console.log(`  Backend:  http://localhost:${CONFIG.ports.backend}`);
        console.log("=".repeat(50));
    }
    catch (error) {
        console.error("[App] Error al inicializar:", error);
        electron_1.app.quit();
    }
}
function cleanup() {
    console.log("[App] Limpiando recursos...");
    if (backendProcess && typeof backendProcess.stop === "function") {
        backendProcess.stop();
    }
    if (frontendServer && typeof frontendServer.stop === "function") {
        frontendServer.stop();
    }
}
electron_1.app.commandLine.appendSwitch("js-flags", `--max-old-space-size=${CONFIG.memory.maxOldSpace}`);
electron_1.app.commandLine.appendSwitch("disable-background-timer-throttling");
electron_1.app.commandLine.appendSwitch("disable-renderer-backgrounding");
electron_1.app.whenReady().then(initializeApp);
electron_1.app.on("window-all-closed", () => {
    cleanup();
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
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

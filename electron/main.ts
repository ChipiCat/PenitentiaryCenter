import { app, BrowserWindow, ipcMain } from "electron";
import { join } from "path";
import { spawn, ChildProcess } from "child_process";
import express, { Express } from "express";
import { Server } from "http";
import * as fs from "fs";

// Configurar logging a archivo en producción (debe ejecutarse antes de app.whenReady)
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
let logStream: fs.WriteStream | null = null;

function setupFileLogging(): void {
  try {
    const userDataPath = app.getPath("userData");
    const LOG_FILE = join(userDataPath, "app.log");
    
    // Crear el directorio si no existe
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true });
    }
    
    logStream = fs.createWriteStream(LOG_FILE, { flags: "a" });
    
    console.log = (...args: any[]) => {
      const message = args.map(arg => typeof arg === "object" ? JSON.stringify(arg) : arg).join(" ");
      const timestamp = new Date().toISOString();
      logStream?.write(`[${timestamp}] ${message}\n`);
      originalConsoleLog.apply(console, args);
    };
    
    console.error = (...args: any[]) => {
      const message = args.map(arg => typeof arg === "object" ? JSON.stringify(arg) : arg).join(" ");
      const timestamp = new Date().toISOString();
      logStream?.write(`[${timestamp}] ERROR: ${message}\n`);
      originalConsoleError.apply(console, args);
    };
    
    console.log(`[Logging] ✓ Archivo de logs: ${LOG_FILE}`);
  } catch (error) {
    originalConsoleError("[Logging] ✗ Error al configurar logging:", error);
  }
}

const CONFIG = {
  ports: { frontend: 4321, backend: 3000 },
  memory: { maxOldSpace: 1024 },
  isDev: process.env.NODE_ENV === "development",
  isPackaged: app.isPackaged,
} as const;

let mainWindow: BrowserWindow | null = null;
let backendManager: BackendManager | null = null;
let frontendManager: FrontendManager | null = null;
let isCleaningUp = false;

class BackendManager {
  private process: ChildProcess | null = null;
  private readonly port: number;
  private readonly isDev: boolean;

  constructor(port: number, isDev: boolean) {
    this.port = port;
    this.isDev = isDev;
  }

  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log(`[Backend] Iniciando en puerto ${this.port}...`);
      
      const backendPath = this.isDev
        ? join(__dirname, "..", "peny-back")
        : join(process.resourcesPath, "backend");
      
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
      const mainJsPath = join(backendPath, "dist", "main.js");
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
        } catch (e) {
          console.error(`[Backend] Error listando archivos: ${e}`);
        }
        reject(new Error(error));
        return;
      }
      
      console.log(`[Backend] Comando: ${command} ${args.join(" ")}`);
      console.log(`[Backend] CWD: ${backendPath}`);
      
      this.process = spawn(command, args, {
        cwd: backendPath,
        shell: true,
        env: {
          ...process.env,
          PORT: this.port.toString(),
          NODE_ENV: this.isDev ? "development" : "production",
          NODE_PATH: join(backendPath, "node_modules"),
        },
      });
      
      let hasResolved = false;
      
      this.process.stdout?.on("data", (data: Buffer) => {
        const output = data.toString();
        console.log(`[Backend] ${output}`);
        if (!hasResolved && (output.includes("Application is running") || output.includes("Nest application successfully started"))) {
          console.log("[Backend] ✓ Iniciado correctamente");
          hasResolved = true;
          resolve();
        }
      });
      
      this.process.stderr?.on("data", (data: Buffer) => {
        const errorOutput = data.toString();
        console.error(`[Backend Error] ${errorOutput}`);
        // Si el error contiene "Cannot find module", rechazar inmediatamente
        if (errorOutput.includes("Cannot find module") && !hasResolved) {
          hasResolved = true;
          reject(new Error(`Backend error: ${errorOutput}`));
        }
      });
      
      this.process.on("error", (error: Error) => {
        console.error("[Backend] Error al iniciar proceso:", error.message);
        console.error("[Backend] Stack:", error.stack);
        if (!hasResolved) {
          hasResolved = true;
          reject(error);
        }
      });
      
      this.process.on("exit", (code: number | null, signal: string | null) => {
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

  stop(): void {
    if (!this.process || this.process.killed) {
      console.log("[Backend] No hay proceso para detener");
      return;
    }
    
    const pid = this.process.pid;
    console.log(`[Backend] Deteniendo proceso (PID: ${pid})...`);
    
    try {
      if (process.platform === "win32" && pid) {
        // En Windows, usar taskkill para matar el árbol completo de procesos
        const killProcess = spawn("taskkill", ["/pid", pid.toString(), "/T", "/F"], {
          shell: true,
          detached: true,
          stdio: "ignore"
        });
        
        killProcess.on("exit", (code) => {
          if (code === 0) {
            console.log("[Backend] ✓ Proceso detenido correctamente");
          } else {
            console.log(`[Backend] Proceso terminado con código ${code}`);
          }
        });
        
        killProcess.unref();
      } else {
        // En Unix/Mac
        this.process.kill("SIGTERM");
        console.log("[Backend] ✓ Señal SIGTERM enviada");
      }
      
      this.process = null;
      
    } catch (error) {
      console.error("[Backend] Error al detener proceso:", error);
      this.process = null;
    }
  }
}

class FrontendManager {
  private server: Server | null = null;
  private readonly port: number;
  private readonly isDev: boolean;

  constructor(port: number, isDev: boolean) {
    this.port = port;
    this.isDev = isDev;
  }

  async start(): Promise<void> {
    if (this.isDev) {
      console.log(`[Frontend] Modo desarrollo: esperando Vite en puerto ${this.port}...`);
      // Esperar a que Vite esté disponible
      return this.waitForServer();
    }

    return new Promise((resolve, reject) => {
      console.log(`[Frontend] Iniciando servidor Express en puerto ${this.port}...`);
      const app: Express = express();
      
      // En producción, los archivos están desempaquetados en app.asar.unpacked
      const distPath = CONFIG.isPackaged
        ? join(process.resourcesPath, "app.asar.unpacked", "PenyFront", "dist")
        : join(__dirname, "..", "PenyFront", "dist");
      
      console.log(`[Frontend] Sirviendo desde: ${distPath}`);
      console.log(`[Frontend] __dirname: ${__dirname}`);
      console.log(`[Frontend] process.resourcesPath: ${process.resourcesPath}`);
      
      // Verificar que el directorio existe
      if (!fs.existsSync(distPath)) {
        console.error(`[Frontend] ✗ El directorio no existe: ${distPath}`);
        console.error(`[Frontend] Intentando ruta alternativa...`);
        
        // Intentar ruta alternativa
        const altPath = join(__dirname, "..", "PenyFront", "dist");
        console.log(`[Frontend] Ruta alternativa: ${altPath}`);
        
        if (!fs.existsSync(altPath)) {
          const error = new Error(`No se encontró el directorio del frontend en ninguna ubicación`);
          reject(error);
          return;
        }
        
        console.log(`[Frontend] ✓ Usando ruta alternativa`);
        app.use(express.static(altPath));
        app.get("*", (_, res) => {
          res.sendFile(join(altPath, "index.html"));
        });
      } else {
        console.log(`[Frontend] ✓ Directorio encontrado`);
        app.use(express.static(distPath));
        app.get("*", (_, res) => {
          res.sendFile(join(distPath, "index.html"));
        });
      }
      
      this.server = app.listen(this.port, "localhost", () => {
        console.log(`[Frontend]  Servidor iniciado en http://localhost:${this.port}`);
        resolve();
      });
      
      this.server.on("error", (error: Error) => {
        console.error("[Frontend] Error al iniciar servidor:", error.message);
        reject(error);
      });
    });
  }

  private async waitForServer(): Promise<void> {
    const maxAttempts = 60; // 60 segundos máximo
    const delayMs = 1000; // 1 segundo entre intentos

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await fetch(`http://localhost:${this.port}`);
        if (response.ok || response.status === 200) {
          console.log(`[Frontend] ✓ Vite está listo en puerto ${this.port}`);
          return;
        }
      } catch (error) {
        // Servidor no está listo todavía
        if (attempt % 5 === 0) {
          console.log(`[Frontend] Esperando Vite... (intento ${attempt}/${maxAttempts})`);
        }
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    throw new Error(`[Frontend] Timeout: Vite no está disponible en puerto ${this.port} después de ${maxAttempts} segundos`);
  }

  stop(): void {
    if (!this.server) {
      console.log("[Frontend] No hay servidor para detener");
      return;
    }
    
    console.log("[Frontend] Deteniendo servidor Express...");
    
    try {
      this.server.close((err) => {
        if (err) {
          console.error("[Frontend] Error al cerrar servidor:", err);
        } else {
          console.log("[Frontend] ✓ Servidor detenido correctamente");
        }
      });
      
      // Forzar cierre de todas las conexiones
      this.server.closeAllConnections?.();
      
      this.server = null;
    } catch (error) {
      console.error("[Frontend] Error al detener servidor:", error);
      this.server = null;
    }
  }
}

function createMainWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, "preload.js"),
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

async function initializeApp(): Promise<void> {
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
  } catch (error) {
    console.error("[App] ✗ Error al inicializar:", error);
    console.error("[App] Stack trace:", error instanceof Error ? error.stack : "N/A");
    cleanup();
    app.quit();
  }
}

function cleanup(): void {
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

app.commandLine.appendSwitch("js-flags", `--max-old-space-size=${CONFIG.memory.maxOldSpace}`);
app.commandLine.appendSwitch("disable-background-timer-throttling");
app.commandLine.appendSwitch("disable-renderer-backgrounding");

// Inicializar logging INMEDIATAMENTE (antes de app.whenReady)
if (app.isPackaged) {
  setupFileLogging();
}

app.whenReady().then(() => {
  if (!app.isPackaged) {
    setupFileLogging(); // También en desarrollo para debug
  }
  initializeApp();
});

app.on("window-all-closed", () => {
  console.log("[App] Todas las ventanas cerradas");
  cleanup();
  
  // Dar tiempo para que los procesos se cierren antes de quit
  setTimeout(() => {
    if (process.platform !== "darwin") {
      console.log("[App] Saliendo de la aplicación...");
      app.quit();
    }
  }, 1500);
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

app.on("before-quit", () => {
  cleanup();
});

ipcMain.handle("get-app-info", () => ({
  version: app.getVersion(),
  name: app.getName(),
  isDev: CONFIG.isDev,
  platform: process.platform,
}));

import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  getAppInfo: () => ipcRenderer.invoke("get-app-info"),
});

declare global {
  interface Window {
    electronAPI: {
      getAppInfo: () => Promise<{
        version: string;
        name: string;
        isDev: boolean;
        platform: string;
      }>;
    };
  }
}

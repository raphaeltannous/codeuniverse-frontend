import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => ipcRenderer.invoke('app-version'),
  quitApp: () => ipcRenderer.send('app-quit'),
  onAppUpdate: (callback: (event: any, ...args: any[]) => void) =>
    ipcRenderer.on('app-update', callback),
})

declare global {
  interface Window {
    electronAPI: {
      getAppVersion: () => Promise<{ version: string }>
      quitApp: () => void
      onAppUpdate: (callback: (event: any, ...args: any[]) => void) => void
    }
  }
}

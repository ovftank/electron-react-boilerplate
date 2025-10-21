import { contextBridge, ipcRenderer } from 'electron';
import type { IpcRendererInterface, ElectronAPI, ProgressData, IpcRendererEvent } from './electron';

const ipcRendererInterface: IpcRendererInterface = {
    invoke: (channel: string, ...args: unknown[]) => ipcRenderer.invoke(channel, ...args),
    send: (channel: string, ...args: unknown[]) => ipcRenderer.send(channel, ...args),
    on: (channel: string, listener: (event: IpcRendererEvent, ...args: unknown[]) => void) => {
        ipcRenderer.on(channel, (event: IpcRendererEvent, ...args: unknown[]) => {
            listener(event, ...args);
        });
    },
    off: (channel: string, listener: (event: IpcRendererEvent, ...args: unknown[]) => void) => {
        ipcRenderer.off(channel, (event: IpcRendererEvent, ...args: unknown[]) => {
            listener(event, ...args);
        });
    }
};

const electronAPI: ElectronAPI = {
    ipcRenderer: ipcRendererInterface,
    registerVLCM: (usernamePrefix: string, numThreads: number = 1, accountLimit: number = 10) => ipcRenderer.invoke('vlcm:register', usernamePrefix, numThreads, accountLimit),
    onVLCMProgress: (callback: (data: ProgressData) => void) => {
        ipcRenderer.on('vlcm:progress', (_: IpcRendererEvent, data: ProgressData) => callback(data));
        return () => {
            ipcRenderer.removeAllListeners('vlcm:progress');
        };
    },
    saveAccounts: (accounts: Array<{ username: string; password: string }>) => ipcRenderer.invoke('file:saveAccounts', accounts),
    showMessageBox: (options: { type?: 'none' | 'info' | 'error' | 'question' | 'warning'; title?: string; message: string; buttons?: string[] }) => ipcRenderer.invoke('dialog:showMessageBox', options)
};

contextBridge.exposeInMainWorld('electron', electronAPI);

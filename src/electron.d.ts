/// <reference types="vite/client" />

export interface IpcRendererInterface {
    invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
    send: (channel: string, ...args: unknown[]) => void;
    on: (channel: string, listener: (event: IpcRendererEvent, ...args: unknown[]) => void) => void;
    off: (channel: string, listener: (event: IpcRendererEvent, ...args: unknown[]) => void) => void;
}

export interface IpcRendererEvent {
    sender: unknown;
}

export interface ProgressData {
    threadId: string;
    message: string;
    username?: string;
    password?: string;
}

export interface ElectronAPI {
    ipcRenderer: IpcRendererInterface;
    registerVLCM: (usernamePrefix: string, numThreads?: number, accountLimit?: number) => Promise<Array<{ username: string; password: string } | null>>;
    onVLCMProgress: (callback: (data: ProgressData) => void) => () => void;
    saveAccounts: (accounts: Array<{ username: string; password: string }>) => Promise<{ success: boolean; filePath?: string; error?: string }>;
    showMessageBox: (options: { type?: 'none' | 'info' | 'error' | 'question' | 'warning'; title?: string; message: string; buttons?: string[] }) => Promise<{ response: number }>;
}

declare global {
    interface Window {
        electron: ElectronAPI;
    }
}

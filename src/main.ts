import VLCMThread from '@/module/vlcm-thread';
import { app, BrowserWindow, dialog, ipcMain, Menu } from 'electron';
import started from 'electron-squirrel-startup';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const getScreenResolution = () => {
    try {
        const output = execSync('wmic path Win32_VideoController get CurrentHorizontalResolution,CurrentVerticalResolution', {
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'ignore']
        });

        const lines = output.trim().split('\n');
        if (lines.length >= 2) {
            const values = lines[1].trim().split(/\s+/);
            if (values.length >= 2) {
                return {
                    width: Number.parseInt(values[0], 10) || 1920,
                    height: Number.parseInt(values[1], 10) || 1080
                };
            }
        }
    } catch {
        //
    }
    return { width: 1920, height: 1080 };
};

const { width: screenWidth, height: screenHeight } = getScreenResolution();

let skipUsernames: string[] = [];
let usernameIndices: { [prefix: string]: { phase: number; index1: number; index2: number } } = {};
if (started) {
    app.quit();
}

app.setAppUserModelId('com.ovfteam.z-register');

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

let mainWindow: BrowserWindow | null = null;

const calculateGridLayout = (numWindows: number) => {
    const cols = Math.ceil(Math.sqrt(numWindows));
    const rows = Math.ceil(numWindows / cols);

    const windowWidth = Math.floor(screenWidth / cols);
    const windowHeight = Math.floor(screenHeight / rows);

    return { cols, rows, windowWidth, windowHeight };
};

const getWindowPosition = (index: number, cols: number, windowWidth: number, windowHeight: number) => {
    const row = Math.floor(index / cols);
    const col = index % cols;

    return {
        x: col * windowWidth,
        y: row * windowHeight
    };
};

const createWindow = (options?: { x?: number; y?: number; width?: number; height?: number }) => {
    const window = new BrowserWindow({
        x: options?.x ?? undefined,
        y: options?.y ?? undefined,
        width: options?.width ?? 1024,
        height: options?.height ?? 728,
        frame: false,
        hasShadow: false,
        transparent: true,
        icon: path.join(process.cwd(), 'src/assets/images/favicon.ico'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true,
            webSecurity: false,
            autoplayPolicy: 'no-user-gesture-required',
            spellcheck: false
        }
    });

    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
        window.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    } else {
        window.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
    }
    return window;
};

app.on('ready', () => {
    mainWindow = createWindow();

    Menu.setApplicationMenu(null);

    ipcMain.handle('window:minimize', () => {
        if (mainWindow) {
            mainWindow.minimize();
        }
    });

    ipcMain.handle('window:close', () => {
        if (mainWindow) {
            mainWindow.close();
        }
    });

    ipcMain.handle('vlcm:register', async (event, usernamePrefix: string, numThreads: number = 1, accountLimit: number = 10, proxies: string[] = []) => {
        try {
            const { cols, windowWidth, windowHeight } = calculateGridLayout(numThreads);
            const allResults: Array<{ username: string; password: string } | null> = [];
            let successCount = 0;
            let proxyIndex = 0;

            while (successCount < accountLimit) {
                const threads: Promise<{ username: string; password: string } | null>[] = [];
                const remainingSlots = accountLimit - successCount;
                const currentBatchSize = Math.min(numThreads, remainingSlots);

                for (let i = 0; i < currentBatchSize; i++) {
                    const position = getWindowPosition(i, cols, windowWidth, windowHeight);
                    let proxyUrl: string | undefined = undefined;
                    if (proxies.length > 0) {
                        proxyUrl = proxies[proxyIndex % proxies.length];
                        proxyIndex++;
                    }

                    const threadPromise = (async () => {
                        const onUsernameGenerated = (username: string) => {
                            skipUsernames.push(username);
                        };

                        const onIndexUpdated = (phase: number, index1: number, index2: number) => {
                            usernameIndices[usernamePrefix] = { phase, index1, index2 };
                        };

                        const vlcmThread = new VLCMThread(
                            skipUsernames,
                            onUsernameGenerated,
                            usernameIndices[usernamePrefix],
                            onIndexUpdated,
                            {
                                x: position.x,
                                y: position.y,
                                width: windowWidth,
                                height: windowHeight
                            },
                            proxyUrl
                        );
                        await vlcmThread.init();

                        vlcmThread.on('progress', (data) => {
                            mainWindow?.webContents.send('vlcm:progress', data);
                        });

                        const result = await vlcmThread.registerVLCM(usernamePrefix);
                        if (result) {
                            skipUsernames.push(result.username);
                        }
                        return result;
                    })();

                    threads.push(threadPromise);
                }

                const batchResults = await Promise.all(threads);
                allResults.push(...batchResults);

                for (const result of batchResults) {
                    if (result) {
                        successCount++;
                    }
                }

                if (successCount >= accountLimit) {
                    break;
                }
            }

            return allResults;
        } catch {
            //
        }
    });

    ipcMain.handle('file:saveAccounts', async (event, accounts: Array<{ username: string; password: string }>) => {
        try {
            if (!mainWindow) {
                return { success: false, error: 'Main window not available' };
            }

            const result = await dialog.showSaveDialog(mainWindow, {
                title: 'Xuất danh sách tài khoản',
                defaultPath: 'accounts.txt',
                filters: [
                    { name: 'Text Files', extensions: ['txt'] },
                    { name: 'All Files', extensions: ['*'] }
                ]
            });

            if (!result.canceled && result.filePath) {
                const content = accounts
                    .filter((acc) => acc.username && acc.password)
                    .map((acc) => `${acc.username}|${acc.password}`)
                    .join('\n');

                fs.writeFileSync(result.filePath, content, 'utf-8');
                return { success: true, filePath: result.filePath };
            }

            return { success: false };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    });

    ipcMain.handle('dialog:showMessageBox', async (event, options: { type?: 'none' | 'info' | 'error' | 'question' | 'warning'; title?: string; message: string; buttons?: string[] }) => {
        try {
            if (!mainWindow) {
                return { response: 0 };
            }

            const result = await dialog.showMessageBox(mainWindow, {
                type: options.type || 'info',
                title: options.title || 'Thông báo',
                message: options.message,
                buttons: options.buttons || ['OK']
            });
            return result;
        } catch {
            return { response: 0 };
        }
    });
});

app.on('window-all-closed', () => {
    app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

import ZingCaptchaSolver from '@/module/zing-captcha-solver.js';
import { app } from 'electron';
import { EventEmitter } from 'node:events';
import path from 'node:path';
import type { GhostBrowser, GhostPage } from 'puppeteer-ghost';
import puppeteer from 'puppeteer-ghost';

interface GridLayout {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface ProxyConfig {
    server: string;
    username?: string;
    password?: string;
}

class VLCMThread extends EventEmitter {
    private page: GhostPage | null = null;
    private browser: GhostBrowser | null = null;
    private readonly captchaSolver = new ZingCaptchaSolver();
    private readonly threadId: string;
    private readonly skipUsernames: string[];
    private readonly onUsernameGenerated: (username: string) => void;
    private phase: number;
    private index1: number;
    private index2: number;
    private readonly onIndexUpdated: (phase: number, index1: number, index2: number) => void;
    private readonly gridLayout: GridLayout;
    private readonly proxyConfig?: ProxyConfig;

    constructor(skipUsernames: string[] = [], onUsernameGenerated: (username: string) => void = () => {}, initialIndex?: { phase: number; index1: number; index2: number }, onIndexUpdated: (phase: number, index1: number, index2: number) => void = () => {}, gridLayout?: GridLayout, proxyUrl?: string) {
        super();
        this.threadId = crypto.randomUUID();
        this.skipUsernames = skipUsernames;
        this.onUsernameGenerated = onUsernameGenerated;
        this.phase = initialIndex?.phase ?? 1;
        this.index1 = initialIndex?.index1 ?? 0;
        this.index2 = initialIndex?.index2 ?? 0;
        this.onIndexUpdated = onIndexUpdated;
        this.gridLayout = gridLayout ?? { x: 0, y: 0, width: 1024, height: 728 };

        if (proxyUrl) {
            this.proxyConfig = this.parseProxyUrl(proxyUrl);
        }
    }

    private readonly parseProxyUrl = (proxyUrl: string): ProxyConfig | undefined => {
        try {
            const parts = proxyUrl.split(':');
            if (parts.length === 2) {
                return {
                    server: `http://${parts[0]}:${parts[1]}`
                };
            }
            if (parts.length === 4) {
                return {
                    server: `http://${parts[0]}:${parts[1]}`,
                    username: parts[2],
                    password: parts[3]
                };
            }
            return undefined;
        } catch {
            return undefined;
        }
    };

    getThreadId(): string {
        return this.threadId;
    }
    init = async () => {
        if (this.browser) {
            return;
        }
        try {
            this.emit('progress', { threadId: this.threadId, message: 'mở trình duyệt...' });
            const extensionPath = app.isPackaged ? path.join(process.resourcesPath, 'rektCaptcha') : path.join(process.cwd(), 'rektCaptcha');

            const launchOptions: {
                pipe: boolean;
                enableExtensions: string[];
                args: string[];
                proxy?: ProxyConfig;
            } = {
                pipe: true,
                enableExtensions: [extensionPath],
                args: [`--window-position=${this.gridLayout.x},${this.gridLayout.y}`, `--window-size=${this.gridLayout.width},${this.gridLayout.height}`]
            };

            if (this.proxyConfig) {
                launchOptions.proxy = this.proxyConfig;
                this.emit('progress', { threadId: this.threadId, message: `dùng proxy: ${this.proxyConfig.server}` });
            }

            this.browser = await puppeteer.launch(launchOptions);
            this.page = await this.browser.newPage();
            await this.page.setViewport({
                width: this.gridLayout.width,
                height: this.gridLayout.height
            });
        } catch {
            this.emit('progress', { threadId: this.threadId, message: 'mở fail' });
        }
    };
    private readonly genRandomPassword = () => {
        const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 24; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    };

    private readonly generateUsername = async (usernamePrefix: string): Promise<string> => {
        const letters = 'abcdefghijklmnopqrstuvwxyz';
        const digits = '0123456789';
        let username = usernamePrefix;
        let isUsernameAvailable = false;

        while (!isUsernameAvailable && username.length < 24) {
            if (this.skipUsernames.includes(username)) {
                this.emit('progress', { threadId: this.threadId, message: 'bỏ qua username', username });
                if (this.phase === 1) {
                    if (this.index1 < letters.length) {
                        username = usernamePrefix + letters[this.index1];
                        this.index1++;
                    } else {
                        this.phase = 2;
                        this.index1 = 0;
                        this.index2 = 0;
                    }
                } else if (this.phase === 2) {
                    if (this.index1 < letters.length) {
                        username = usernamePrefix + letters[this.index1] + digits[this.index2];
                        this.index2++;
                        if (this.index2 >= digits.length) {
                            this.index2 = 0;
                            this.index1++;
                        }
                    } else {
                        this.phase = 3;
                        this.index1 = 0;
                        this.index2 = 0;
                    }
                } else if (this.phase === 3) {
                    if (this.index1 < letters.length) {
                        username = usernamePrefix + 'z' + letters[this.index1] + letters[this.index2];
                        this.index2++;
                        if (this.index2 >= letters.length) {
                            this.index2 = 0;
                            this.index1++;
                        }
                    } else {
                        break;
                    }
                }
                this.onIndexUpdated(this.phase, this.index1, this.index2);
                continue;
            }

            await this.page?.$eval('#reg_account', (el) => ((el as HTMLInputElement).value = ''));
            await this.page?.keyboard.type(username);

            const response = await this.page?.waitForResponse((res) => res.url().startsWith('https://id.zing.vn/v2/uname-suggestion') && res.url().includes(`username=${username}`));

            if (response) {
                const responseText = await response.text();
                const startIndex = responseText.indexOf('(');
                const endIndex = responseText.lastIndexOf(')');
                if (startIndex !== -1 && endIndex !== -1) {
                    const jsonString = responseText.substring(startIndex + 1, endIndex);
                    const data = JSON.parse(jsonString);
                    if (data.err === '1') {
                        isUsernameAvailable = true;
                        this.onUsernameGenerated(username);
                    } else {
                        if (this.phase === 1) {
                            if (this.index1 < letters.length) {
                                username = usernamePrefix + letters[this.index1];
                                this.index1++;
                            } else {
                                this.phase = 2;
                                this.index1 = 0;
                                this.index2 = 0;
                            }
                        }

                        if (this.phase === 2 && !isUsernameAvailable) {
                            if (this.index1 < letters.length) {
                                username = usernamePrefix + letters[this.index1] + digits[this.index2];
                                this.index2++;
                                if (this.index2 >= digits.length) {
                                    this.index2 = 0;
                                    this.index1++;
                                }
                            } else {
                                this.phase = 3;
                                this.index1 = 0;
                                this.index2 = 0;
                            }
                        }

                        if (this.phase === 3 && !isUsernameAvailable) {
                            if (this.index1 < letters.length) {
                                username = usernamePrefix + 'z' + letters[this.index1] + letters[this.index2];
                                this.index2++;
                                if (this.index2 >= letters.length) {
                                    this.index2 = 0;
                                    this.index1++;
                                }
                            } else {
                                break;
                            }
                        }
                    }
                    this.onIndexUpdated(this.phase, this.index1, this.index2);
                    this.emit('progress', { threadId: this.threadId, message: 'tạo username', username });
                }
            }
        }

        return username;
    };
    registerVLCM = async (usernamePrefix: string) => {
        this.emit('progress', { threadId: this.threadId, message: 'vào web' });
        await this.page?.goto('https://vlcm.zing.vn');

        this.emit('progress', { threadId: this.threadId, message: 'bypass tracking' });
        await this.page?.waitForSelector('#zme-registerwg');
        await this.page?.click('#zme-registerwg', {
            paddingPercentage: 100
        });
        const password = this.genRandomPassword();
        await this.page?.waitForSelector('#reg_account');
        await this.page?.addStyleTag({
            content: `#suggestBox{display:none!important}`
        });
        await this.page?.click('.Close');
        await this.page?.click('#zme-registerwg', {
            paddingPercentage: 100
        });
        await this.page?.waitForSelector('#reg_account');

        await this.page?.click('#reg_account');

        const username = await this.generateUsername(usernamePrefix);

        await this.page?.click('#reg_pwd');
        await this.page?.keyboard.type(password);

        await this.page?.click('#reg_cpwd');
        await this.page?.keyboard.type(password);

        this.emit('progress', {
            threadId: this.threadId,
            message: 'đang nhập pass',
            username,
            password
        });

        this.emit('progress', { threadId: this.threadId, message: 'giải captcha', username, password });
        const captchaImg = await this.page?.$('#captcha');
        if (captchaImg) {
            const srcProperty = await captchaImg.getProperty('src');
            const captchaSrc = await srcProperty.jsonValue();

            const result = await this.captchaSolver.solve(captchaSrc as string);
            this.emit('progress', { threadId: this.threadId, message: `captcha: ${result}`, username, password });
            await this.page?.click('#veryfied_code');
            await this.page?.keyboard.type(result);
        }

        await this.page?.click('#reg_account');
        this.emit('progress', { threadId: this.threadId, message: 'bypass 360game', username, password });
        await this.page?.click('#btn-register');

        await this.page?.waitForRequest((request) => request.url().startsWith('http://360game.vn/auth/login-redirect'));
        await this.page?.goto('https://id.zing.vn/');

        try {
            await this.page?.waitForFunction('window.location.href.startsWith("https://id.zing.vn/v2/inforequire?")', { timeout: 5000 });
            await this.browser?.close();
            this.emit('progress', { threadId: this.threadId, message: 'done', username, password });
            return {
                username,
                password
            };
        } catch {
            this.emit('progress', { threadId: this.threadId, message: 'fail', username, password });
            return null;
        }
    };
}
export default VLCMThread;

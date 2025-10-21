import { create } from 'zustand';
import type { Account } from '@/types/account';

export interface RegistrationProgress {
    threadId: string;
    message: string;
    username?: string;
    password?: string;
    status: 'pending' | 'processing' | 'success' | 'failed';
}

interface AppState {
    usernamePrefix: string;
    numThreads: number;
    accountLimit: number;
    isLoading: boolean;
    setUsernamePrefix: (prefix: string) => void;
    setNumThreads: (threads: number) => void;
    setAccountLimit: (limit: number) => void;
    setIsLoading: (loading: boolean) => void;

    registrationProgress: RegistrationProgress[];
    updateRegistrationProgress: (progress: RegistrationProgress) => void;
    clearRegistrationProgress: () => void;

    host: string;
    portStart: number;
    portEnd: number;
    proxyUser: string;
    proxyPass: string;
    setHost: (host: string) => void;
    setPortStart: (start: number) => void;
    setPortEnd: (end: number) => void;
    setProxyUser: (user: string) => void;
    setProxyPass: (pass: string) => void;

    accounts: Account[];
    currentAccountId: string | null;
    updateOrAddAccount: (account: Account) => void;
    deleteAccount: (id: string) => void;
    setCurrentAccountId: (id: string | null) => void;

    proxies: string[];
    setProxies: (proxies: string[]) => void;
}

export const useAppStore = create<AppState>((set) => ({
    usernamePrefix: '',
    numThreads: 1,
    accountLimit: 10,
    isLoading: false,
    setUsernamePrefix: (prefix) => set({ usernamePrefix: prefix }),
    setNumThreads: (threads) => set({ numThreads: threads }),
    setAccountLimit: (limit) => set({ accountLimit: limit }),
    setIsLoading: (loading) => set({ isLoading: loading }),

    registrationProgress: [],
    updateRegistrationProgress: (progress) =>
        set((state) => {
            const idx = state.registrationProgress.findIndex((p) => p.threadId === progress.threadId);
            if (idx >= 0) {
                const updated = [...state.registrationProgress];
                updated[idx] = progress;
                return { registrationProgress: updated };
            }
            return { registrationProgress: [...state.registrationProgress, progress] };
        }),
    clearRegistrationProgress: () => set({ registrationProgress: [] }),

    host: '',
    portStart: 0,
    portEnd: 0,
    proxyUser: '',
    proxyPass: '',
    setHost: (host) => set({ host }),
    setPortStart: (start) => set({ portStart: start }),
    setPortEnd: (end) => set({ portEnd: end }),
    setProxyUser: (user) => set({ proxyUser: user }),
    setProxyPass: (pass) => set({ proxyPass: pass }),

    accounts: [],
    currentAccountId: null,
    updateOrAddAccount: (newAccount) =>
        set((state) => {
            const idx = state.accounts.findIndex((a) => a.id === newAccount.id);
            if (idx >= 0) {
                const updated = [...state.accounts];
                updated[idx] = newAccount;
                return { accounts: updated };
            }
            return { accounts: [...state.accounts, newAccount] };
        }),
    deleteAccount: (id) => set((state) => ({ accounts: state.accounts.filter((acc) => acc.id !== id) })),
    setCurrentAccountId: (id) => set({ currentAccountId: id }),

    proxies: [],
    setProxies: (proxies) => set({ proxies })
}));

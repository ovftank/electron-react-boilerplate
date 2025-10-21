import type { FC } from 'react';
import { useEffect } from 'react';
import AccountTable from '@/components/account-table';
import { useAppStore } from '@/store';
import type { ProgressData } from '@/electron';

const Index: FC = () => {
    const { updateOrAddAccount } = useAppStore();

    useEffect(() => {
        const handleProgress = (data: ProgressData) => {
            if (!data.threadId) {
                return;
            }
            const newAccount = {
                id: data.threadId,
                username: data.username || '',
                password: data.password || '',
                message: data.message
            };

            updateOrAddAccount(newAccount);
        };

        const unsubscribe = window.electron?.onVLCMProgress?.(handleProgress);
        return () => {
            unsubscribe?.();
        };
    }, [updateOrAddAccount]);

    return (
        <div className='flex h-full flex-col gap-6'>
            <AccountTable />
        </div>
    );
};

export default Index;

import type { FC } from 'react';
import { memo } from 'react';
import { useAppStore } from '@/store';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { Account } from '@/types/account';

interface AccountRowProps {
    account: Account;
    index: number;
}

const AccountRow: FC<AccountRowProps> = memo(({ account, index }) => {
    const { deleteAccount } = useAppStore();
    return (
        <>
            <div className='border-b border-emerald-100 px-4 py-3 text-sm font-medium text-gray-600'>{index + 1}</div>
            <div className='flex items-center border-b border-emerald-100 px-4 py-3'>
                <div className='flex items-center gap-2'>
                    <code className='cursor-text rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700 select-all'>{account.username}</code>
                </div>
            </div>
            <div className='flex items-center border-b border-emerald-100 px-4 py-3'>
                <div className='flex items-center gap-2'>
                    <code className='cursor-text rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700 select-all'>{account.password}</code>
                </div>
            </div>
            <div className='flex items-center border-b border-emerald-100 px-4 py-3'>
                <span className='text-xs'>{account.message || 'Chờ xử lý'}</span>
            </div>
            <div className='border-b border-emerald-100 px-4 py-3 text-center'>
                <button onClick={() => deleteAccount(account.id)}>
                    <FontAwesomeIcon icon={faTrash} className='h-3.5 w-3.5' />
                </button>
            </div>
        </>
    );
});

AccountRow.displayName = 'AccountRow';

export default AccountRow;

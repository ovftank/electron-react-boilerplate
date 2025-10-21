import { useAppStore } from '@/store';
import { faPlay, faSpinner, faUser, faGears, faHashtag } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { FC } from 'react';

const RegisterForm: FC = () => {
    const { usernamePrefix, numThreads, accountLimit, isLoading, setUsernamePrefix, setNumThreads, setAccountLimit, setIsLoading } = useAppStore();

    const handleRegister = async () => {
        try {
            setIsLoading(true);
            await window.electron.registerVLCM(usernamePrefix, numThreads, accountLimit);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='flex flex-1 gap-2'>
            <div className='relative flex-1'>
                <FontAwesomeIcon icon={faUser} className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-emerald-500' />
                <input type='text' autoFocus value={usernamePrefix} onChange={(e) => setUsernamePrefix(e.target.value)} placeholder='Điền prefix (vd: conmeo)' className='w-full rounded-lg border border-emerald-200 bg-white py-2.5 pr-3 pl-10 text-sm placeholder-gray-400 transition-all focus:border-emerald-500 disabled:bg-gray-100' disabled={isLoading} />
            </div>
            <div className='relative w-24'>
                <FontAwesomeIcon icon={faGears} className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-emerald-500' />
                <input type='number' min='1' max='100' value={numThreads} onChange={(e) => setNumThreads(Math.max(1, Number.parseInt(e.target.value) || 1))} placeholder='Threads' className='w-full rounded-lg border border-emerald-200 bg-white py-2.5 pr-3 pl-10 text-sm placeholder-gray-400 transition-all focus:border-emerald-500 disabled:bg-gray-100' disabled={isLoading} />
            </div>
            <div className='relative w-24'>
                <FontAwesomeIcon icon={faHashtag} className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-emerald-500' />
                <input type='number' min='1' max='1000' value={accountLimit} onChange={(e) => setAccountLimit(Math.max(1, Number.parseInt(e.target.value) || 1))} placeholder='Limit' className='w-full rounded-lg border border-emerald-200 bg-white py-2.5 pr-3 pl-10 text-sm placeholder-gray-400 transition-all focus:border-emerald-500 disabled:bg-gray-100' disabled={isLoading} />
            </div>
            <button onClick={handleRegister} disabled={isLoading}>
                <FontAwesomeIcon icon={isLoading ? faSpinner : faPlay} className={isLoading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
                Run
            </button>
        </div>
    );
};

export default RegisterForm;

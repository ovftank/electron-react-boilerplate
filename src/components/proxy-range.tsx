import { useAppStore } from '@/store';
import { faServer, faUser, faLock, faGaugeHigh, faRotate } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { FC } from 'react';

const ProxyRange: FC = () => {
    const { host, portStart, portEnd, proxyUser, proxyPass, setHost, setPortStart, setPortEnd, setProxyUser, setProxyPass, setProxies } = useAppStore();

    const handlePortChange = (value: string, setter: (val: number) => void): void => {
        if (value === '') {
            setter(0);
            return;
        }
        const num = Number.parseInt(value, 10);
        if (!Number.isNaN(num) && num >= 0 && num <= 100000) {
            setter(num);
        }
    };

    const handleGenProxies = (): void => {
        if (!host || portStart === 0 || portEnd === 0 || portStart > portEnd) return;

        const proxyList: string[] = [];
        for (let port = portStart; port <= portEnd; port += 1) {
            proxyList.push(`${host}:${port}:${proxyUser}:${proxyPass}`);
        }
        setProxies(proxyList);
    };

    return (
        <div className='flex flex-1 gap-2'>
            <div className='relative flex-2'>
                <FontAwesomeIcon icon={faServer} className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-emerald-500' />
                <input autoFocus type='text' value={host} onChange={(e) => setHost(e.target.value)} placeholder='Host' className='w-full rounded-lg border border-emerald-200 bg-white py-2.5 pr-3 pl-10 text-sm placeholder-gray-400 transition-all focus:border-emerald-500' />
            </div>
            <div className='relative flex-1'>
                <FontAwesomeIcon icon={faUser} className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-emerald-500' />
                <input type='text' value={proxyUser} onChange={(e) => setProxyUser(e.target.value)} placeholder='User' className='w-full rounded-lg border border-emerald-200 bg-white py-2.5 pr-3 pl-10 text-sm placeholder-gray-400 transition-all focus:border-emerald-500' />
            </div>
            <div className='relative flex-1'>
                <FontAwesomeIcon icon={faLock} className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-emerald-500' />
                <input type='text' value={proxyPass} onChange={(e) => setProxyPass(e.target.value)} placeholder='Pass' className='w-full rounded-lg border border-emerald-200 bg-white py-2.5 pr-3 pl-10 text-sm placeholder-gray-400 transition-all focus:border-emerald-500' />
            </div>
            <div className='relative flex-1'>
                <FontAwesomeIcon icon={faGaugeHigh} className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-emerald-500' />
                <input type='number' min='0' max='100000' value={portStart} onChange={(e) => handlePortChange(e.target.value, setPortStart)} placeholder='Port start' className='w-full rounded-lg border border-emerald-200 bg-white py-2.5 pr-3 pl-10 text-sm placeholder-gray-400 transition-all focus:border-emerald-500' />
            </div>
            <div className='relative flex-1'>
                <FontAwesomeIcon icon={faGaugeHigh} className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-emerald-500' />
                <input type='number' min='0' max='100000' value={portEnd} onChange={(e) => handlePortChange(e.target.value, setPortEnd)} placeholder='Port end' className='w-full rounded-lg border border-emerald-200 bg-white py-2.5 pr-3 pl-10 text-sm placeholder-gray-400 transition-all focus:border-emerald-500' />
            </div>

            <button onClick={handleGenProxies}>
                <FontAwesomeIcon icon={faRotate} className='h-4 w-4' />
                Gen
            </button>
        </div>
    );
};

export default ProxyRange;

import Favicon from '@/assets/images/favicon.ico';
import { PATHS } from '@/router/path';
import { faMinus, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { FC } from 'react';
import { useLocation } from 'react-router';

const Header: FC = () => {
    const location = useLocation();
    const isProxyPage = location.pathname === PATHS.PROXY_LIST;
    const title = isProxyPage ? 'Z-PROXY' : 'Z-REGISTER';

    const handleMinimize = async () => {
        await window.electron.ipcRenderer.invoke('window:minimize');
    };

    const handleClose = async () => {
        await window.electron.ipcRenderer.invoke('window:close');
    };

    return (
        <header className='draggable flex h-14 w-full items-center justify-between border-b border-gray-200 bg-white px-4 py-3'>
            <div className='flex items-center justify-center gap-2'>
                <img src={Favicon} alt='' className='h-6 w-6' />
                <p className='text-sm font-semibold'>{title}</p>
            </div>
            <div className='no-draggable flex gap-1.5'>
                <button onClick={handleMinimize} className='bg-emerald-50 text-emerald-600 hover:bg-emerald-100' title='Minimize'>
                    <FontAwesomeIcon icon={faMinus} />
                </button>
                <button onClick={handleClose} title='Close'>
                    <FontAwesomeIcon icon={faXmark} />
                </button>
            </div>
        </header>
    );
};

export default Header;

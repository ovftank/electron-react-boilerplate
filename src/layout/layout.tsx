import faviconUrl from '@/assets/images/favicon.ico';
import Header from '@/components/header';
import ProxyRange from '@/components/proxy-range';
import RegisterForm from '@/components/register-config';
import { PATHS } from '@/router/path';
import { faArrowLeft, faNetworkWired } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { FC, PropsWithChildren } from 'react';
import { useLocation, useNavigate } from 'react-router';

interface LayoutProps extends PropsWithChildren {}

const Layout: FC<LayoutProps> = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const isProxyPage = location.pathname === PATHS.PROXY_LIST;
    const navLink = isProxyPage ? PATHS.INDEX : PATHS.PROXY_LIST;
    const navLabel = isProxyPage ? 'Back' : 'Proxy';
    const navIcon = isProxyPage ? faArrowLeft : faNetworkWired;

    return (
        <div className='flex h-screen max-h-screen w-full flex-col gap-3 border border-gray-200 bg-white'>
            <link rel='icon' href={faviconUrl} />
            <Header />
            <div className='flex w-full gap-2 px-4'>
                {isProxyPage ? <ProxyRange /> : <RegisterForm />}
                <button
                    onClick={() => {
                        navigate(navLink);
                    }}
                >
                    <FontAwesomeIcon icon={navIcon} />
                    {navLabel}
                </button>
            </div>
            <div className='flex flex-1'>
                <main className='w-full overflow-auto bg-white px-4 pb-3'>{children}</main>
            </div>
        </div>
    );
};

export default Layout;

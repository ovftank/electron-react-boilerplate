import Layout from '@/layout/layout';
import Index from '@/pages/index';
import ProxyList from '@/pages/proxy-list';
import { PATHS } from '@/router/path';
import type { FC } from 'react';
import { Route, Routes } from 'react-router';

const App: FC = () => {
    return (
        <Layout>
            <Routes>
                <Route path={PATHS.INDEX} element={<Index />} />
                <Route path={PATHS.PROXY_LIST} element={<ProxyList />} />
            </Routes>
        </Layout>
    );
};

export default App;

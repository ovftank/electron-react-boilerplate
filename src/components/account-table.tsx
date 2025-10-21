import type { FC } from 'react';
import { useRef, useState, useLayoutEffect } from 'react';
import AccountRow from '@/components/account-row';
import { useAppStore } from '@/store';
import { faUser, faLock, faCircleInfo, faGear, faFileExport } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Frog1Image from '@/assets/images/frog-1.png';

const AccountTable: FC = () => {
    const { accounts } = useAppStore();
    const containerRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const bodyRef = useRef<HTMLDivElement>(null);
    const [bodyHeight, setBodyHeight] = useState<number>(0);
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        if (isExporting) return;

        setIsExporting(true);
        try {
            const accountsToExport = accounts.filter((acc) => acc.username && acc.password).map((acc) => ({ username: acc.username, password: acc.password }));

            if (accountsToExport.length === 0) {
                await window.electron?.showMessageBox({
                    type: 'warning',
                    title: 'Cảnh báo',
                    message: 'Không có tài khoản nào để xuất!'
                });
                return;
            }

            const result = await window.electron?.saveAccounts(accountsToExport);
            if (result?.success) {
                await window.electron?.showMessageBox({
                    type: 'info',
                    title: 'Thành công',
                    message: `Đã xuất ${accountsToExport.length} tài khoản thành công!`
                });
            } else if (result?.error) {
                await window.electron?.showMessageBox({
                    type: 'error',
                    title: 'Lỗi',
                    message: `Lỗi khi xuất file: ${result.error}`
                });
            }
        } catch {
            await window.electron?.showMessageBox({
                type: 'error',
                title: 'Lỗi',
                message: 'Có lỗi xảy ra khi xuất file!'
            });
        } finally {
            setIsExporting(false);
        }
    };

    useLayoutEffect(() => {
        const measureHeight = () => {
            if (containerRef.current && headerRef.current && bodyRef.current) {
                const containerHeight = containerRef.current.clientHeight;
                const headerHeight = headerRef.current.offsetHeight;
                const availableHeight = containerHeight - headerHeight;
                setBodyHeight(Math.max(availableHeight, 0));
            }
        };

        measureHeight();

        const resizeObserver = new ResizeObserver(() => {
            measureHeight();
        });

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => {
            resizeObserver.disconnect();
        };
    }, [accounts]);

    if (accounts.length === 0) {
        return (
            <div ref={containerRef} className='flex flex-1 items-center justify-center rounded-lg border border-emerald-200 bg-linear-to-br from-white to-emerald-50 shadow-sm'>
                <div className='flex flex-col items-center gap-4'>
                    <img src={Frog1Image} alt='empty' className='h-32 w-32' />
                    <p className='text-xl font-semibold text-emerald-500'>Ếch đang đợi bạn nhấn RUN</p>
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className='flex flex-1 flex-col overflow-hidden rounded-lg border border-emerald-200 bg-white shadow-sm'>
            <div className='flex items-center justify-between border-b border-emerald-200 bg-linear-to-r from-emerald-50 to-emerald-100 px-4 py-2'>
                <h3 className='text-sm font-semibold text-emerald-900'>Danh sách tài khoản ({accounts.length})</h3>
                <button onClick={handleExport} disabled={isExporting || accounts.length === 0} className='flex items-center gap-2 rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50'>
                    <FontAwesomeIcon icon={faFileExport} className='h-3.5 w-3.5' />
                    {isExporting ? 'Đang xuất...' : 'Xuất file'}
                </button>
            </div>

            <div ref={headerRef} className='grid grid-cols-[3rem_15rem_15rem_1fr_0.2fr] gap-0 border-b border-emerald-200 bg-linear-to-r from-emerald-50 to-emerald-100'>
                <div className='px-4 py-3 text-left text-sm font-semibold text-emerald-900'>#</div>
                <div className='px-4 py-3 text-left text-sm font-semibold text-emerald-900'>
                    <div className='flex items-center gap-2'>
                        <FontAwesomeIcon icon={faUser} className='h-4 w-4 text-emerald-500' />
                        User
                    </div>
                </div>
                <div className='px-4 py-3 text-left text-sm font-semibold text-emerald-900'>
                    <div className='flex items-center gap-2'>
                        <FontAwesomeIcon icon={faLock} className='h-4 w-4 text-emerald-500' />
                        Pass
                    </div>
                </div>
                <div className='px-4 py-3 text-left text-sm font-semibold text-emerald-900'>
                    <div className='flex items-center gap-2'>
                        <FontAwesomeIcon icon={faCircleInfo} className='h-4 w-4 text-emerald-500' />
                        Trạng thái
                    </div>
                </div>
                <div className='px-4 py-3 text-center text-sm font-semibold text-emerald-900'>
                    <FontAwesomeIcon icon={faGear} className='h-4 w-4 text-emerald-500' />
                </div>
            </div>

            <div ref={bodyRef} className='overflow-x-hidden overflow-y-auto' style={{ height: `${bodyHeight}px` }}>
                <div className='grid grid-cols-[3rem_15rem_15rem_1fr_0.2fr] gap-0'>
                    {accounts.map((account, index) => (
                        <AccountRow key={account.id} account={account} index={index} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AccountTable;

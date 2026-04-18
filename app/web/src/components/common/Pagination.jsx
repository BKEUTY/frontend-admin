import React from 'react';
import { useLanguage } from '@/store/LanguageContext';
import './Pagination.css';

const Pagination = ({ page = 1, totalPages = 0, totalItems = 0, pageSize = 10, onPageChange }) => {
    const { t } = useLanguage();

    if (totalPages <= 1 && totalItems === 0) return null;

    const startItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
    const endItem = Math.min(page * pageSize, totalItems);

    const getPageItems = () => {
        const items = [];
        const delta = 2;

        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) items.push(i);
            return items;
        }

        items.push(1);

        if (page > delta + 2) {
            items.push('...');
        }

        const start = Math.max(2, page - delta);
        const end = Math.min(totalPages - 1, page + delta);

        for (let i = start; i <= end; i++) {
            items.push(i);
        }

        if (page < totalPages - delta - 1) {
            items.push('...');
        }

        items.push(totalPages);

        return items;
    };

    const pages = getPageItems();

    return (
        <div className="pagination-container">
            <div className="pagination-info">
                {t('pagination_showing')} <strong>{startItem}</strong> - <strong>{endItem}</strong> {t('pagination_of')} <strong>{totalItems}</strong> {t('pagination_results')}
            </div>

            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        className="page-btn nav-btn"
                        disabled={page === 1}
                        onClick={() => onPageChange(Math.max(1, page - 1))}
                    >
                        ❮
                    </button>

                    {pages.map((p, idx) => (
                        p === '...' ? (
                            <span key={`ellipsis-${idx}`} className="pagination-ellipsis">...</span>
                        ) : (
                            <button
                                key={p}
                                className={`page-btn ${page === p ? 'active' : ''}`}
                                onClick={() => onPageChange(p)}
                            >
                                {p}
                            </button>
                        )
                    ))}

                    <button
                        className="page-btn nav-btn"
                        disabled={page >= totalPages}
                        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                    >
                        ❯
                    </button>
                </div>
            )}
        </div>
    );
};

export default Pagination;

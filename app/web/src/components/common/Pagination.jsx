import React from 'react';
import { useLanguage } from '@/store/LanguageContext';
import './Pagination.css';

const Pagination = ({ page = 1, totalPages = 0, totalItems = 0, pageSize = 10, onPageChange }) => {
    const { t } = useLanguage();

    if (totalPages <= 1 && totalItems === 0) return null;

    const startItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
    const endItem = Math.min(page * pageSize, totalItems);

    return (
        <div className="pagination-container">
            <div className="pagination-info">
                {t('pagination_showing')} <strong>{startItem}</strong> - <strong>{endItem}</strong> {t('pagination_of')} <strong>{totalItems}</strong> {t('pagination_results')}
            </div>

            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        className="page-btn"
                        disabled={page === 1}
                        onClick={() => onPageChange(Math.max(1, page - 1))}
                    >
                        ❮
                    </button>

                    {[...Array(totalPages)].map((_, idx) => (
                        <button
                            key={idx}
                            className={`page-btn ${page === idx + 1 ? 'active' : ''}`}
                            onClick={() => onPageChange(idx + 1)}
                        >
                            {idx + 1}
                        </button>
                    ))}

                    <button
                        className="page-btn"
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

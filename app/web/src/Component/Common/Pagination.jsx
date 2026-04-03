import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import './Pagination.css';

const Pagination = ({ page = 0, totalPages = 0, totalItems = 0, pageSize = 10, onPageChange }) => {
    const { t } = useLanguage();

    if (totalPages <= 1 && totalItems === 0) return null;

    const startItem = totalItems === 0 ? 0 : page * pageSize + 1;
    const endItem = Math.min((page + 1) * pageSize, totalItems);

    return (
        <div className="pagination-container">
            <div className="pagination-info">
                {t('pagination_showing')} <strong>{startItem}</strong> - <strong>{endItem}</strong> {t('pagination_of')} <strong>{totalItems}</strong> {t('pagination_results')}
            </div>

            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        className="page-btn"
                        disabled={page === 0}
                        onClick={() => onPageChange(Math.max(0, page - 1))}
                    >
                        ❮
                    </button>

                    {[...Array(totalPages)].map((_, idx) => (
                        <button
                            key={idx}
                            className={`page-btn ${page === idx ? 'active' : ''}`}
                            onClick={() => onPageChange(idx)}
                        >
                            {idx + 1}
                        </button>
                    ))}

                    <button
                        className="page-btn"
                        disabled={page >= totalPages - 1}
                        onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
                    >
                        ❯
                    </button>
                </div>
            )}
        </div>
    );
};

export default Pagination;

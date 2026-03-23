import { useState, useCallback } from 'react';

const usePagination = (initialPage = 1, initialSize = 10) => {
    const [pagination, setPagination] = useState({
        current: initialPage,
        pageSize: initialSize,
        total: 0
    });

    const setTotal = useCallback((total) => {
        setPagination(prev => ({ ...prev, total }));
    }, []);

    const setCurrent = useCallback((current, pageSize) => {
        setPagination(prev => ({ ...prev, current, pageSize: pageSize || prev.pageSize }));
    }, []);

    return {
        pagination,
        setTotal,
        setCurrent,
        setPagination
    };
};

export default usePagination;

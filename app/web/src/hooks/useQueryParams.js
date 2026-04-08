import { useSearchParams } from 'react-router-dom';
import queryString from 'query-string';
import { useCallback, useMemo } from 'react';

export const useQueryParams = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const query = useMemo(() => {
        return queryString.parse(searchParams.toString(), {
            arrayFormat: 'comma',
            parseNumbers: true,
            parseBooleans: true,
        });
    }, [searchParams]);

    const setQuery = useCallback((newParams, options = { replace: true, scroll: false }) => {
        const nextQuery = { ...query, ...newParams };

        Object.keys(nextQuery).forEach(key => {
            const value = nextQuery[key];
            if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
                delete nextQuery[key];
            }
        });

        const newSearchString = queryString.stringify(nextQuery, {
            arrayFormat: 'comma',
            skipEmptyString: true,
            skipNull: true,
        });

        setSearchParams(newSearchString, {
            replace: options.replace,
            preventScrollReset: !options.scroll,
        });
    }, [query, setSearchParams]);

    return [query, setQuery];
};

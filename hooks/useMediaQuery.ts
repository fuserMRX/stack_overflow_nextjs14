'use client';

import { useState, useEffect } from 'react';

function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState<boolean>(false);

    useEffect(() => {
        const mediaQueryList = window.matchMedia(query);
        setMatches(mediaQueryList.matches);

        const listener = (event: MediaQueryListEvent) => {
            setMatches(event.matches);
        };

        mediaQueryList.addEventListener('change', listener);

        return () => {
            mediaQueryList.removeEventListener('change', listener);
        };
    }, [query]);

    return matches;
}

export default useMediaQuery;

export const useIsDesktop = (): boolean => {
    return useMediaQuery('(min-width: 1024px)');
};

export const useIsMobile = (): boolean => {
    return useMediaQuery('(max-width: 640px)');
};
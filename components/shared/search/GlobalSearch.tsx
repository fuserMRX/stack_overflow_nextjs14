'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { Input } from '@/components/ui/input';
import { formUrlQuery, removeKeysFromQuery } from '@/lib/utils';
import GlobalResult from '@/components/shared/search/GlobalResult';

const GlobalSearch = () => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const searchContainerRef = useRef(null);
    const listenerAdded = useRef(false); // Ref to track listener

    const query = searchParams.get('q') || '';
    const globalQuery = searchParams.get('global') || '';

    const [search, setSearch] = useState(globalQuery || '');
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleOutsideClick = (e: any) => {
            if (
                searchContainerRef.current &&
                // @ts-ignore
                !searchContainerRef.current.contains(e.target)
            ) {
                setIsOpen(false);
                setSearch('');
            }
        };

        setIsOpen(false); // Close the dropdown on route change

        // Only add the listener if it hasn't been added already
        if (!listenerAdded.current) {
            document.addEventListener('click', handleOutsideClick);
            listenerAdded.current = true; // Mark listener as added
        }

        return () => {
            document.removeEventListener('click', handleOutsideClick);
            listenerAdded.current = false; // Reset listener tracking on cleanup
        };
    }, [pathname]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (search) {
                const newUrl = formUrlQuery({
                    params: searchParams.toString(),
                    key: 'global',
                    value: search,
                });

                router.push(newUrl, { scroll: false });
            } else {
                // Dont'd do local and global search at the same time
                // It means that local will stay active even after reloading the page
                // but global will be cleared if we clear the search input
                if (query) {
                    const newUrl = removeKeysFromQuery({
                        params: searchParams.toString(),
                        keysToRemove: ['global', 'type'],
                    });

                    router.push(newUrl, { scroll: false });
                }
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [search, searchParams, router, pathname, query]);

    return (
        <div className='relative w-full max-w-[600px] max-lg:hidden'
        ref={searchContainerRef}>
            <div
                className='background-light800_darkgradient relative flex min-h-[56px]
            grow items-center gap-1 rounded-xl px-4'
            >
                <Image
                    src='/assets/icons/search.svg'
                    width={24}
                    height={24}
                    alt='search'
                    className='cursor-pointer'
                />
                <Input
                    type='text'
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);

                        if (e.target.value) {
                            setIsOpen(true);
                        }

                        if (isOpen && e.target.value === '') {
                            setIsOpen(false);
                        }
                    }}
                    placeholder='Search globally'
                    className={`paragraph-regular no-focus
                    ${search ? '' : 'placeholder'} background-light800_darkgradient
                    text-dark400_light700 border-none shadow-none outline-none`}
                />
            </div>
            {isOpen && <GlobalResult />}
        </div>
    );
};

export default GlobalSearch;

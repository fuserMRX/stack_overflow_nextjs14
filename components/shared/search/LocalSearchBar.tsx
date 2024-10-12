'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { Input } from '@/components/ui/input';
import { formUrlQuery, removeKeysFromQuery } from '@/lib/utils';

interface CustomInputProps {
    route: string;
    iconPosition: string;
    imgSrc: string;
    placeholder: string;
    otherClasses?: string;
}

const LocalSearchBar = ({
    route,
    iconPosition,
    imgSrc,
    placeholder,
    otherClasses,
}: CustomInputProps) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const query = searchParams.get('q') || '';

    const [search, setSearch] = useState(query || '');

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (search) {
                const newUrl = formUrlQuery({
                    params: searchParams.toString(),
                    key: 'q',
                    value: search,
                });

                console.log('newUrl', newUrl);

                router.push(newUrl, { scroll: false });
            } else {
                if (pathname === route) {
                    const newUrl = removeKeysFromQuery({
                        params: searchParams.toString(),
                        keysToRemove: ['q'],
                    });

                    router.push(newUrl, { scroll: false });
                }
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [search, searchParams, router, pathname, route]);

    return (
        <div
            className={`background-light800_darkgradient flex min-h-[56px]
            grow items-center gap-4 rounded-[10px] px-4 ${otherClasses}`}
        >
            {iconPosition === 'left' && (
                <Image
                    src={imgSrc}
                    width={24}
                    height={24}
                    alt='search icon'
                    className='cursor-pointer'
                />
            )}

            <Input
                type='text'
                value={search}
                placeholder={placeholder}
                onChange={(e) => setSearch(e.target.value)}
                className='paragraph-regular no-focus placeholder 
                    background-light800_darkgradient border-none
                    shadow-none outline-none'
            />

            {iconPosition === 'right' && (
                <Image
                    src={imgSrc}
                    width={24}
                    height={24}
                    alt='search icon'
                    className='cursor-pointer'
                />
            )}
        </div>
    );
};

export default LocalSearchBar;

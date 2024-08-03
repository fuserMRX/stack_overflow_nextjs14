'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeProvider';
import Image from 'next/image';
import { themes } from '@/constants';

import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarTrigger,
} from '@/components/ui/menubar';

const Theme = () => {
    const { theme, toggleTheme } = useTheme();
    const activeTheme = themes.find(
        (item) => item.value === localStorage.getItem('theme')
    );

    return (
        <Menubar className='relative border-none bg-transparent shadow-none'>
            <MenubarMenu>
                <MenubarTrigger
                    className='focus:bg-light-900 data-[state=open]:bg-light-900
                 dark:focus:bg-dark-200 dark:data-[state=open]:bg-dark-200'
                >
                    {activeTheme ? (
                        <Image
                            key={activeTheme?.value}
                            className='active-theme'
                            src={activeTheme?.icon}
                            width={20}
                            height={20}
                            alt={activeTheme?.label}
                        />
                    ) : (
                        <Image
                            className='active-theme'
                            src='/assets/icons/computer.svg'
                            width={20}
                            height={20}
                            alt='System Theme'
                        />
                    )}
                </MenubarTrigger>
                <MenubarContent
                    className='absolute -right-12 mt-3 min-w-[120px]
                rounded border py-2 dark:border-dark-400 dark:bg-dark-300'
                >
                    {themes.map((item) => (
                        <MenubarItem
                            key={item.value}
                            onClick={() => toggleTheme(item.value)}
                            className='flex items-center gap-4 
                            px-2.5 py-2 dark:focus:bg-dark-400'
                        >
                            <Image
                                src={item.icon}
                                width={16}
                                height={16}
                                alt={item.value}
                                className={`${theme === item.value && 'active-theme'}`}
                            />
                            <p
                                className={`body-semibold text-light-500 
                                ${theme === item.value ? 'text-primary-500' : 'text-dark100_light900'}`}
                            >
                                {item.label}
                            </p>
                        </MenubarItem>
                    ))}
                </MenubarContent>
            </MenubarMenu>
        </Menubar>
    );
};

export default Theme;

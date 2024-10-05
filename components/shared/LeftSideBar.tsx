'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth, SignedOut } from '@clerk/nextjs';

import { sidebarLinks } from '@/constants';
import { Button } from '@/components/ui/button';

const LeftSideBar = () => {
    // usePathname causes page to re-render several times sometimes (Profiler shows context change)
    const pathname = usePathname();
    const { userId } = useAuth();

    return (
        <section
            className='background-light900_dark200 light-border
        custom-scrollbar sticky left-0 top-0 flex h-screen flex-col
        justify-between overflow-y-auto border-r p-6 pt-36 shadow-light-300
        dark:shadow-none max-sm:hidden lg:w-[266px]'
        >
            <div className='flex flex-1 flex-col gap-6'>
                {sidebarLinks.map((link) => {
                    if (link.route === '/profile' && userId) {
                        link.route = `${link.route}/${userId}`;
                    }

                    const isActive = (pathname === link.route);

                    return (
                        <Link
                            key={link.route}
                            href={link.route}
                            className={`flex items-center justify-start gap-4 bg-transparent p-4
                            ${
                                isActive
                                    ? 'primary-gradient rounded-lg text-light-900'
                                    : 'text-dark300_light900'
                            }`}
                        >
                            <Image
                                src={link.imgURL}
                                alt={link.label}
                                width={20}
                                height={20}
                                className={`${isActive ? '' : 'invert-colors'}`}
                            />
                            <p
                                className={`${isActive ? 'base-bold' : 'base-medium'} max-lg:hidden`}
                            >
                                {link.label}
                            </p>
                        </Link>
                    );
                })}
            </div>
            <SignedOut>
                <div className='flex flex-col gap-3'>
                    <Link href='/sign-in'>
                        <Button
                            className='small-medium btn-secondary
                                    min-h-[41px] w-full rounded-lg px-4 py-3 shadow-none'
                        >
                            <Image
                                src='/assets/icons/account.svg'
                                alt='LogIn'
                                width={20}
                                height={20}
                                className='invert-colors lg:hidden'
                            />
                            <span className='primary-text-gradient max-lg:hidden'>
                                Log in
                            </span>
                        </Button>
                    </Link>

                    <Link href='/sign-up'>
                        <Button
                            className='small-medium light-border-2 btn-tertiary
                                    text-dark400_light900 min-h-[41px] w-full rounded-lg px-4
                                    py-3 shadow-none'
                        >
                            <Image
                                src='/assets/icons/sign-up.svg'
                                alt='Sign up'
                                width={20}
                                height={20}
                                className='invert-colors lg:hidden'
                            />
                            <span className='max-lg:hidden'>Sign up</span>
                        </Button>
                    </Link>
                </div>
            </SignedOut>
        </section>
    );
};

export default LeftSideBar;

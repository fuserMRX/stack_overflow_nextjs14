import React from 'react';
import Link from 'next/link';

import LocalSearchBar from '@/components/shared/search/LocalSearchBar';
import Filter from '@/components/shared/Filter';
import { UserFilters } from '@/constants/filters';
import { getAllUsers } from '@/lib/actions/user.action';
import UserCard from '@/components/cards/UserCard';
import { SearchParamsProps } from '@/types';
import Pagination from '@/components/shared/Pagination';

const Community = async ({ searchParams }: SearchParamsProps) => {
    const result = await getAllUsers({
        searchQuery: searchParams.q,
        filter: searchParams.filter,
        page: searchParams.page ? +searchParams.page : 1,
    });

    return (
        <>
            <h1 className='h1-bold text-dark100_light900'>All Users</h1>
            <div
                className='mt-11 flex justify-between gap-5
            max-sm:flex-col sm:items-center'
            >
                <LocalSearchBar
                    route='/community'
                    iconPosition='left'
                    imgSrc='/assets/icons/search.svg'
                    placeholder='Search for community members'
                    otherClasses='flex-1'
                />
                <Filter
                    filters={UserFilters}
                    otherClasses='min-h-[56px] sm:min-w-[170px]'
                    placeholder='Select a filter'
                />
            </div>
            <section className='mt-12 flex flex-wrap gap-4'>
                {result.users.length ? (
                    result.users.map((user) => (
                        <UserCard key={user._id} user={user} />
                    ))
                ) : (
                    <div
                        className='paragraph-regular text-dark200_light800
                    mx-auto max-w-4xl text-center'
                    >
                        <p>No users found</p>
                        <Link
                            href='/sign-up'
                            className='font-bold text-blue-500'
                        >
                            Join to the community
                        </Link>
                    </div>
                )}
            </section>

            <div className='mt-10'>
                <Pagination
                    pageNumber={searchParams?.page ? +searchParams.page : 1}
                    isNext={result.isNext}
                />
            </div>
        </>
    );
};

export default Community;

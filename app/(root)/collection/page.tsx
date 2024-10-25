import React from 'react';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

import LocalSearchBar from '@/components/shared/search/LocalSearchBar';
import Filter from '@/components/shared/Filter';
import { QuestionFilters } from '@/constants/filters';
import NoResult from '@/components/shared/NoResult';
import QuestionCard from '@/components/cards/QuestionCard';
import { getSavedQuestions } from '@/lib/actions/user.action';
import { SearchParamsProps } from '@/types';
import Pagination from '@/components/shared/Pagination';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Collection | Dev Solutions',
};

const Collection = async ({ searchParams }: SearchParamsProps) => {
    const { userId: clerkId } = auth();

    if (!clerkId) {
        redirect('/sign-in');
    }

    const { questions, isNext } = await getSavedQuestions({
        clerkId,
        searchQuery: searchParams.q,
        filter: searchParams.filter,
        page: searchParams.page ? +searchParams.page : 1,
    });

    return (
        <>
            <h1 className='h1-bold text-dark100_light900'>Saved Questions</h1>
            <div
                className='mt-11 flex justify-between gap-5
            max-sm:flex-col sm:items-center'
            >
                <LocalSearchBar
                    route='/collection'
                    iconPosition='left'
                    imgSrc='/assets/icons/search.svg'
                    placeholder='Search for saved questions'
                    otherClasses='flex-1'
                />
                <Filter
                    filters={QuestionFilters}
                    otherClasses='min-h-[56px] sm:min-w-[170px]'
                    placeholder='Select a filter'
                />
            </div>

            <div className='mt-10 flex w-full flex-col gap-6'>
                {questions?.length ? (
                    questions.map((question: any) =>
                    <QuestionCard
                        key={question._id}
                        _id={question._id}
                        title={question.title}
                        tags={question.tags}
                        author={question.author}
                        upvotes={question.upvotes}
                        views={question.views}
                        answers={question.answers}
                        createdAt={question.createdAt}
                    />)
                ) : (
                    <NoResult
                        title='There is no saved questions to show'
                        description='Be first to break the silence!'
                        link='/ask-question'
                        linkTitle='Ask a Question'
                    />
                )}
            </div>

            <div className='mt-10'>
                <Pagination
                    pageNumber={searchParams?.page ? +searchParams.page : 1}
                    isNext={isNext}
                />
            </div>
        </>
    );
};

export default Collection;

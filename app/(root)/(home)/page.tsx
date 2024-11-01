import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';

import { Button } from '@/components/ui/button';
import LocalSearchBar from '@/components/shared/search/LocalSearchBar';
import Filter from '@/components/shared/Filter';
import { HomePageFilters } from '@/constants/filters';
import HomeFilters from '@/components/home/HomeFilters';
import NoResult from '@/components/shared/NoResult';
import QuestionCard from '@/components/cards/QuestionCard';
import { getQuestions, getRecommendedQuestions } from '@/lib/actions/question.action';
import { SearchParamsProps } from '@/types';
import Pagination from '@/components/shared/Pagination';

export const metadata: Metadata = {
    title: 'Home | Dev Solutions',
};

const Home = async ({ searchParams }: SearchParamsProps) => {
    let result;

    const { userId } = auth();


    if(searchParams?.filter === 'recommended') {
        if (userId) {
            result = await getRecommendedQuestions({
                userId,
                searchQuery: searchParams.q,
                page: searchParams.page ? +searchParams.page : 1,
            });
        } else {
            result = {
                questions: [],
                isNext: false,
            };
        }
    } else {
        result = await getQuestions({
            searchQuery: searchParams.q,
            filter: searchParams.filter,
            page: searchParams.page ? +searchParams.page : 1,
        });
    }
    
    return (
        <>
            <div
                className='flex w-full flex-col-reverse justify-between
        gap-4 sm:flex-row sm:items-center'
            >
                <h1 className='h1-bold text-dark100_light900'>All Questions</h1>
                <Link
                    href='/ask-question'
                    className='flex justify-end max-sm:w-full'
                >
                    <Button
                        className='primary-gradient min-h-[46px]
                px-4 py-3 !text-light-900'
                    >
                        Ask A Quesiton
                    </Button>
                </Link>
            </div>
            <div
                className='mt-11 flex justify-between gap-5
            max-sm:flex-col sm:items-center'
            >
                <LocalSearchBar
                    route='/'
                    iconPosition='left'
                    imgSrc='/assets/icons/search.svg'
                    placeholder='Search for questions'
                    otherClasses='flex-1'
                />
                <Filter
                    filters={HomePageFilters}
                    otherClasses='min-h-[56px] sm:min-w-[170px]'
                    containerClasses='hidden max-md:flex'
                    placeholder='Select a filter'
                />
            </div>
            <HomeFilters />

            <div className='mt-10 flex w-full flex-col gap-6'>
                {result.questions?.length ? (
                    result.questions.map((question) => (
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
                        />
                    ))
                ) : (
                    <NoResult
                        title='There is no questions to show'
                        description='Be first to break the silence!'
                        link='/ask-question'
                        linkTitle='Ask a Question'
                    />
                )}
            </div>

            <div className='mt-10'>
                <Pagination
                    pageNumber={searchParams?.page ? +searchParams.page : 1}
                    isNext={result.isNext}
                />
            </div>
        </>
    );
};

export default Home;
